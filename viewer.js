(function () {
  const pdfPattern = /\.pdf(?:[?#].*)?$/i;
  const imagePattern = /\.(png|jpe?g|webp|gif)(?:[?#].*)?$/i;
  const pdfJsUrl = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js";
  const pdfJsWorkerUrl = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
  let pdfJsLoadingPromise = null;

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

  function loadPdfJs() {
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = pdfJsWorkerUrl;
      return Promise.resolve(window.pdfjsLib);
    }

    if (!pdfJsLoadingPromise) {
      pdfJsLoadingPromise = new Promise(function (resolve, reject) {
        const script = document.createElement("script");
        script.src = pdfJsUrl;
        script.async = true;
        script.onload = function () {
          if (!window.pdfjsLib) {
            reject(new Error("PDF viewer failed to load."));
            return;
          }

          window.pdfjsLib.GlobalWorkerOptions.workerSrc = pdfJsWorkerUrl;
          resolve(window.pdfjsLib);
        };
        script.onerror = function () {
          reject(new Error("PDF viewer failed to load."));
        };
        document.head.appendChild(script);
      });
    }

    return pdfJsLoadingPromise;
  }

  document.addEventListener("DOMContentLoaded", function () {
    const modal = buildViewer();
    const title = modal.querySelector(".viewer-modal__title");
    const content = modal.querySelector(".viewer-modal__content");
    const closeButton = modal.querySelector(".viewer-modal__close");
    let lastActiveElement = null;
    let modalOpen = false;
    let viewerRequestId = 0;

    function closeViewer() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("viewer-lock-scroll");
      content.innerHTML = "";
      modalOpen = false;
      viewerRequestId += 1;

      if (lastActiveElement && typeof lastActiveElement.focus === "function") {
        lastActiveElement.focus();
      }
    }

    function openPdf(url, label) {
      const requestId = ++viewerRequestId;
      title.textContent = label;
      content.innerHTML = [
        '<div class="viewer-modal__pdf">',
        '  <div class="viewer-modal__loading">Loading PDF...</div>',
        "</div>"
      ].join("");

      const pdfHost = content.querySelector(".viewer-modal__pdf");

      loadPdfJs()
        .then(function (pdfjsLib) {
          return pdfjsLib.getDocument(url).promise;
        })
        .then(function (pdf) {
          if (requestId !== viewerRequestId || !modalOpen) {
            return;
          }

          pdfHost.innerHTML = "";
          const maxWidth = Math.max(260, Math.min(pdfHost.clientWidth - 24, 980));

          let renderChain = Promise.resolve();
          for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
            const pageWrap = document.createElement("div");
            const canvas = document.createElement("canvas");

            pageWrap.className = "viewer-modal__pdf-page";
            pageWrap.appendChild(canvas);
            pdfHost.appendChild(pageWrap);

            renderChain = renderChain.then(function () {
              return pdf.getPage(pageNumber).then(function (page) {
                if (requestId !== viewerRequestId || !modalOpen) {
                  return;
                }

                const baseViewport = page.getViewport({ scale: 1 });
                const scale = maxWidth / baseViewport.width;
                const viewport = page.getViewport({ scale: scale });
                const context = canvas.getContext("2d");
                const deviceScale = window.devicePixelRatio || 1;

                canvas.width = Math.floor(viewport.width * deviceScale);
                canvas.height = Math.floor(viewport.height * deviceScale);
                canvas.style.width = Math.floor(viewport.width) + "px";
                canvas.style.height = Math.floor(viewport.height) + "px";
                context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);

                return page.render({
                  canvasContext: context,
                  viewport: viewport
                }).promise;
              });
            });
          }

          return renderChain;
        })
        .catch(function () {
          if (requestId !== viewerRequestId || !modalOpen) {
            return;
          }

          content.innerHTML = '<iframe class="viewer-modal__frame" referrerpolicy="no-referrer" src="' + url + '#toolbar=0&navpanes=0&scrollbar=1&view=FitH"></iframe>';
        });
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
