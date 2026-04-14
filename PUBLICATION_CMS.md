# Publication CMS

This repo includes a small Python backend so the publications section can be edited from a browser instead of changing `research/index.html` by hand.

## Run locally

```powershell
python server.py
```

Open:

- Site: `http://127.0.0.1:8000/`
- Admin: `http://127.0.0.1:8000/admin/`

## First-time setup

On first run, the server creates `cms-config.json`.

1. Open `cms-config.json`
2. Change `admin_password`
3. Restart `python server.py`

## Files

- Backend: `server.py`
- Admin UI: `admin/index.html`
- Publication data: `data/publications.json`
- Frontend renderer: `research/publications.js`

## Important note

This backend does not run on GitHub Pages. For live editing in production, run `server.py` on your own server or computer and access the site through that Python server.
