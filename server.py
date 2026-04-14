from __future__ import annotations

import json
import os
import secrets
import sys
from http import cookies
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / "data" / "publications.json"
CONFIG_PATH = ROOT / "cms-config.json"
SESSIONS: set[str] = set()


def ensure_config() -> dict:
    default_config = {"admin_password": "change-me-now", "port": 8000}
    if not CONFIG_PATH.exists():
        CONFIG_PATH.write_text(json.dumps(default_config, indent=2), encoding="utf-8")
        return default_config
    with CONFIG_PATH.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def load_publications() -> list[dict]:
    with DATA_PATH.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)
    publications = payload.get("publications", [])
    return sorted(publications, key=lambda item: (int(item.get("sort_order", 0)), item.get("title", "").lower()))


def save_publications(publications: list[dict]) -> None:
    payload = {
        "publications": sorted(publications, key=lambda item: (int(item.get("sort_order", 0)), item.get("title", "").lower()))
    }
    DATA_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def slugify(value: str) -> str:
    result = []
    for char in value.lower():
        if char.isalnum():
            result.append(char)
        elif result and result[-1] != "-":
            result.append("-")
    return "".join(result).strip("-") or secrets.token_hex(4)


class CMSHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, format: str, *args) -> None:
        sys.stdout.write("%s - - [%s] %s\n" % (self.address_string(), self.log_date_time_string(), format % args))

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/publications":
            self.send_json({"publications": load_publications()})
            return
        if parsed.path == "/api/session":
            self.send_json({"authenticated": self.is_authenticated()})
            return
        return super().do_GET()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/login":
            self.handle_login()
            return
        if parsed.path == "/api/logout":
            self.handle_logout()
            return
        if parsed.path == "/api/publications":
            if not self.require_auth():
                return
            payload = self.read_json_body()
            if payload is None:
                return
            publication = self.normalize_publication(payload)
            if publication is None:
                return
            publications = load_publications()
            existing_ids = {item["id"] for item in publications}
            publication_id = publication["id"] or slugify(publication["title"])
            while publication_id in existing_ids:
                publication_id = f"{publication_id}-{secrets.token_hex(2)}"
            publication["id"] = publication_id
            publications.append(publication)
            save_publications(publications)
            self.send_json({"publication": publication}, status=201)
            return
        self.send_error(404, "Not found")

    def do_PUT(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/publications/"):
            if not self.require_auth():
                return
            payload = self.read_json_body()
            if payload is None:
                return
            publication = self.normalize_publication(payload)
            if publication is None:
                return
            publication_id = parsed.path.rsplit("/", 1)[-1]
            publications = load_publications()
            for index, item in enumerate(publications):
                if item["id"] == publication_id:
                    publication["id"] = publication_id
                    publications[index] = publication
                    save_publications(publications)
                    self.send_json({"publication": publication})
                    return
            self.send_json({"error": "Publication not found"}, status=404)
            return
        self.send_error(404, "Not found")

    def do_DELETE(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/publications/"):
            if not self.require_auth():
                return
            publication_id = parsed.path.rsplit("/", 1)[-1]
            publications = load_publications()
            filtered = [item for item in publications if item["id"] != publication_id]
            if len(filtered) == len(publications):
                self.send_json({"error": "Publication not found"}, status=404)
                return
            save_publications(filtered)
            self.send_json({"deleted": publication_id})
            return
        self.send_error(404, "Not found")

    def read_json_body(self) -> dict | None:
        content_length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(content_length) if content_length else b"{}"
        try:
            return json.loads(raw.decode("utf-8") or "{}")
        except json.JSONDecodeError:
            self.send_json({"error": "Invalid JSON body"}, status=400)
            return None

    def normalize_publication(self, payload: dict) -> dict | None:
        statuses = [status for status in payload.get("statuses", []) if status in {"in-progress", "accepted", "published", "preprint"}]
        publication = {
            "id": str(payload.get("id", "")).strip(),
            "sort_order": int(payload.get("sort_order", 0)),
            "type": str(payload.get("type", "journal")).strip() or "journal",
            "title": str(payload.get("title", "")).strip(),
            "authors": str(payload.get("authors", "")).strip(),
            "venue": str(payload.get("venue", "")).strip(),
            "location": str(payload.get("location", "")).strip(),
            "statuses": statuses,
            "link_url": str(payload.get("link_url", "")).strip(),
            "link_label": str(payload.get("link_label", "")).strip(),
            "link_icon": str(payload.get("link_icon", "link")).strip() or "link"
        }
        if not publication["title"]:
            self.send_json({"error": "Title is required"}, status=400)
            return None
        if publication["type"] not in {"journal", "conference"}:
            self.send_json({"error": "Type must be journal or conference"}, status=400)
            return None
        if not publication["statuses"]:
            self.send_json({"error": "Select at least one status"}, status=400)
            return None
        return publication

    def get_session_token(self) -> str | None:
        raw_cookie = self.headers.get("Cookie")
        if not raw_cookie:
            return None
        jar = cookies.SimpleCookie()
        jar.load(raw_cookie)
        session = jar.get("cms_session")
        return session.value if session else None

    def is_authenticated(self) -> bool:
        token = self.get_session_token()
        return bool(token and token in SESSIONS)

    def require_auth(self) -> bool:
        if self.is_authenticated():
            return True
        self.send_json({"error": "Authentication required"}, status=401)
        return False

    def handle_login(self) -> None:
        payload = self.read_json_body()
        if payload is None:
            return
        password = str(payload.get("password", ""))
        expected = str(CONFIG["admin_password"])
        if not secrets.compare_digest(password, expected):
            self.send_json({"error": "Invalid password"}, status=401)
            return

        token = secrets.token_urlsafe(24)
        SESSIONS.add(token)

        cookie = cookies.SimpleCookie()
        cookie["cms_session"] = token
        cookie["cms_session"]["path"] = "/"
        cookie["cms_session"]["httponly"] = True
        cookie["cms_session"]["samesite"] = "Lax"

        self.send_response(200)
        for morsel in cookie.values():
            self.send_header("Set-Cookie", morsel.OutputString())
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps({"authenticated": True}).encode("utf-8"))

    def handle_logout(self) -> None:
        token = self.get_session_token()
        if token:
            SESSIONS.discard(token)

        cookie = cookies.SimpleCookie()
        cookie["cms_session"] = ""
        cookie["cms_session"]["path"] = "/"
        cookie["cms_session"]["max-age"] = 0

        self.send_response(200)
        for morsel in cookie.values():
            self.send_header("Set-Cookie", morsel.OutputString())
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps({"authenticated": False}).encode("utf-8"))

    def send_json(self, payload: dict, status: int = 200) -> None:
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps(payload, ensure_ascii=False).encode("utf-8"))


CONFIG = ensure_config()


def main() -> None:
    port = int(os.environ.get("PORT", CONFIG.get("port", 8000)))
    server = ThreadingHTTPServer(("0.0.0.0", port), CMSHandler)
    print(f"CMS running on http://127.0.0.1:{port}")
    print("Open /admin/ to manage publications.")
    print("Change cms-config.json before exposing this publicly.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
