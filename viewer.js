(function () {
  const pdfPattern = /\.pdf(?:[?#].*)?$/i;
  const imagePattern = /\.(png|jpe?g|webp|gif)(?:[?#].*)?$/i;

  function isProtectedAssetLink(anchor) {
    if (!anchor || !anchor.href) {
      return false;
    }

    try {
      const url = new URL(anchor.href, window.location.origin);
      return url.origin === window.location.origin && (pdfPattern.test(url.pathname) || imagePattern.test(url.pathname));
    } catch (error) {
      return false;
    }
  }

  function buildViewer() {
    const modal = document.createElement("div");
    modal.className = "viewer-modal";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = [
      '<div class="viewer-modal__dialog" role="dialog" aria-modal="true" aria-label="Protected viewer">',
      '  <div class="viewer-modal__header">',
      '    <div class="viewer-modal__meta">',
      '      <div class="viewer-modal__eyebrow"><i class="ri-shield-keyhole-line"></i><span>Viewer</span></div>',
      '      <div class="viewer-modal__title"></div>',
      "    </div>",
      '    <button class="viewer-modal__close" type="button" aria-label="Close viewer"><i class="ri-close-line"></i></button>',
      "  </div>",
      '  <div class="viewer-modal__content"></div>',
      "</div>"
    ].join("");

    document.body.appendChild(modal);
    return modal;
  }

  function filenameFromUrl(url) {
    try {
      const parsed = new URL(url, window.location.origin);
      const parts = parsed.pathname.split("/");
      return decodeURIComponent(parts[parts.length - 1]) || "Preview";
    } catch (error) {
      return "Preview";
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const modal = buildViewer();
    const title = modal.querySelector(".viewer-modal__title");
    const content = modal.querySelector(".viewer-modal__content");
    const closeButton = modal.querySelector(".viewer-modal__close");
    let lastActiveElement = null;
    let modalOpen = false;

    function closeViewer() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("viewer-lock-scroll");
      content.innerHTML = "";
      modalOpen = false;

      if (lastActiveElement && typeof lastActiveElement.focus === "function") {
        lastActiveElement.focus();
      }
    }

    function openPdf(url, label) {
      title.textContent = label;
      content.innerHTML = '<iframe class="viewer-modal__frame" referrerpolicy="no-referrer" src="' + url + '#toolbar=0&navpanes=0&scrollbar=0&view=FitH"></iframe>';
    }

    function openImage(url, label, alt) {
      title.textContent = label;
      content.innerHTML = [
        '<div class="viewer-modal__image-wrap">',
        '  <img class="viewer-modal__image protected-media" src="' + url + '" alt="' + (alt || label) + '" draggable="false" />',
        "</div>"
      ].join("");
    }

    function openViewer(kind, url, label, alt) {
      lastActiveElement = document.activeElement;
      if (kind === "pdf") {
        openPdf(url, label);
      } else {
        openImage(url, label, alt);
      }

      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("viewer-lock-scroll");
      modalOpen = true;
      closeButton.focus();
    }

    document.querySelectorAll("a").forEach(function (anchor) {
      if (!isProtectedAssetLink(anchor)) {
        return;
      }

      anchor.classList.add("protected-media");
      const kind = pdfPattern.test(new URL(anchor.href, window.location.origin).pathname) ? "pdf" : "image";
      anchor.addEventListener("click", function (event) {
        event.preventDefault();
        const label = anchor.dataset.viewerTitle || anchor.textContent.trim() || filenameFromUrl(anchor.href);
        openViewer(kind, anchor.href, label, anchor.getAttribute("aria-label") || label);
      });
    });

    document.addEventListener("contextmenu", function (event) {
      event.preventDefault();
    });

    document.addEventListener("dragstart", function (event) {
      if (event.target.closest(".protected-media")) {
        event.preventDefault();
      }
    });

    document.addEventListener("keydown", function (event) {
      const modifier = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (modalOpen && (event.key === "Escape" || key === "esc")) {
        event.preventDefault();
        closeViewer();
        return;
      }

      if (modalOpen && modifier && (key === "s" || key === "p")) {
        event.preventDefault();
      }
    });

    closeButton.addEventListener("click", closeViewer);

    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeViewer();
      }
    });
  });
})();
