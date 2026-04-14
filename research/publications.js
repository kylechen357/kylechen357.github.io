(function () {
  const statusLabels = {
    en: {
      "in-progress": "In Progress",
      accepted: "Accepted",
      published: "Published",
      preprint: "Pre-print",
      journal: "Journal",
      conference: "Conference"
    },
    zh: {
      "in-progress": "進行中",
      accepted: "已接受",
      published: "已發表",
      preprint: "預印本",
      journal: "期刊",
      conference: "研討會"
    },
    ko: {
      "in-progress": "진행 중",
      accepted: "게재 승인",
      published: "출판됨",
      preprint: "프리프린트",
      journal: "저널",
      conference: "학회"
    },
    th: {
      "in-progress": "กำลังดำเนินการ",
      accepted: "ตอบรับแล้ว",
      published: "ตีพิมพ์แล้ว",
      preprint: "พรีปรินต์",
      journal: "วารสาร",
      conference: "ประชุมวิชาการ"
    }
  };

  const statusClassNames = {
    "in-progress": "publication-tag--progress",
    accepted: "publication-tag--accepted",
    published: "publication-tag--published",
    preprint: "publication-tag--preprint"
  };

  const linkIcons = {
    arxiv: "ai ai-arxiv",
    ieee: "ai ai-ieee",
    link: "ri-links-line"
  };

  const countOrder = ["in-progress", "accepted", "published", "preprint"];
  const app = document.getElementById("publicationsApp");
  const filterChips = document.querySelectorAll(".publication-filter .project-filter__chip");
  const emptyState = document.querySelector(".publication-filter-empty");
  const config = window.GOOGLE_SCRIPT_CONFIG || {};

  if (!app) {
    return;
  }

  function getLanguageMap() {
    const lang = (document.documentElement.getAttribute("lang") || "en").toLowerCase();
    return statusLabels[lang] || statusLabels[lang.split("-")[0]] || statusLabels.en;
  }

  function buildStatusCounts(publications) {
    const counts = new Map();
    countOrder.forEach((status) => counts.set(status, 0));
    publications.forEach((publication) => {
      (publication.statuses || []).forEach((status) => {
        counts.set(status, (counts.get(status) || 0) + 1);
      });
    });
    return counts;
  }

  function renderStatusCounts(publications) {
    const labels = getLanguageMap();
    const counts = buildStatusCounts(publications);
    const visibleStatuses = countOrder.filter((status) => counts.get(status) > 0);

    if (!visibleStatuses.length) {
      return "";
    }

    return `
      <div class="publication-status">
        <div class="publication-status__grid">
          ${visibleStatuses.map((status) => `
            <div class="publication-status__item">
              <span class="publication-status__label">${labels[status]}</span>
              <span class="publication-status__value">${counts.get(status)}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderLink(publication) {
    if (!publication.link_url) {
      return "";
    }

    const iconClass = linkIcons[publication.link_icon] || linkIcons.link;
    return `
      <a href="${publication.link_url}" target="_blank" rel="noreferrer" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; background: rgba(126, 240, 193, 0.15); border: 1px solid var(--accent); color: var(--text); text-decoration: none; border-radius: 20px; font-size: 13px; font-weight: 500; white-space: nowrap; flex-shrink: 0; transition: all 0.3s ease;">
        <span style="display: flex; align-items: center; justify-content: center;">
          <i class="${iconClass}" style="font-size: 16px;"></i>
        </span>
        <span>${publication.link_label || "Link"}</span>
      </a>
    `;
  }

  function renderItem(publication, isLast) {
    const labels = getLanguageMap();
    const statuses = (publication.statuses || []).map((status) => `
      <span class="publication-tag ${statusClassNames[status] || ""}">${labels[status] || status}</span>
    `).join("");

    const layoutStyle = publication.link_url
      ? "display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;"
      : "";

    return `
      <li class="publication-item" data-pub-type="${publication.type}" data-pub-status="${(publication.statuses || []).join(" ")}" style="margin-bottom: ${isLast ? "0" : "20px"}; padding: 12px; background: rgba(126, 240, 193, 0.05); border-left: 3px solid var(--accent); border-radius: 4px;">
        <div style="${layoutStyle}">
          <div style="flex: 1;">
            <p style="margin: 0; font-size: 14px;"><strong>${publication.title}</strong></p>
            ${publication.authors ? `<p style="margin: 6px 0 0 0; font-size: 13px; color: var(--muted);">${publication.authors}</p>` : ""}
            ${publication.venue ? `<p style="margin: 4px 0 0 0; font-size: 13px;"><em>${publication.venue}</em></p>` : ""}
            ${publication.location ? `<p style="margin: 4px 0 0 0; font-size: 13px;">${publication.location}</p>` : ""}
            ${statuses ? `<div class="publication-tags">${statuses}</div>` : ""}
          </div>
          ${renderLink(publication)}
        </div>
      </li>
    `;
  }

  function renderSection(type, publications) {
    const labels = getLanguageMap();
    return `
      <div class="publication-section" data-pub-section="${type}">
        <h3 style="font-size: 16px; margin-bottom: 12px; ${type === "conference" ? "margin-top: 28px;" : ""}">${labels[type]}</h3>
        ${renderStatusCounts(publications)}
        <ul style="margin-left: 0; list-style: none; padding: 0;" data-i18n-skip>
          ${publications.map((publication, index) => renderItem(publication, index === publications.length - 1)).join("")}
        </ul>
      </div>
    `;
  }

  function applyFilter(filter) {
    const sections = app.querySelectorAll(".publication-section");
    let visibleCount = 0;

    sections.forEach((section) => {
      const shouldShow = section.dataset.pubSection === filter;
      section.classList.toggle("is-hidden", !shouldShow);
      if (shouldShow) {
        visibleCount += section.querySelectorAll(".publication-item").length;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-hidden", visibleCount !== 0);
    }
  }

  function bindFilters() {
    filterChips.forEach((chip) => {
      chip.addEventListener("click", function () {
        const filter = this.dataset.pubFilter || "journal";
        filterChips.forEach((item) => item.classList.remove("is-active"));
        this.classList.add("is-active");
        applyFilter(filter);
      });
    });
  }

  function jsonpRequest(params) {
    return new Promise((resolve, reject) => {
      if (!window.isGoogleScriptConfigured || !window.isGoogleScriptConfigured()) {
        reject(new Error("Google Apps Script is not configured"));
        return;
      }

      const callbackName = "__publicationCallback_" + Math.random().toString(36).slice(2);
      const script = document.createElement("script");
      const url = new URL(config.webAppUrl);
      Object.entries({ ...params, callback: callbackName }).forEach(([key, value]) => {
        url.searchParams.set(key, typeof value === "string" ? value : JSON.stringify(value));
      });

      window[callbackName] = (payload) => {
        cleanup();
        if (!payload || payload.ok === false) {
          reject(new Error((payload && payload.error) || "Google Apps Script request failed"));
          return;
        }
        resolve(payload);
      };

      function cleanup() {
        delete window[callbackName];
        script.remove();
      }

      script.onerror = () => {
        cleanup();
        reject(new Error("Unable to reach Google Apps Script"));
      };

      script.src = url.toString();
      document.body.appendChild(script);
    });
  }

  async function loadPublications() {
    let payload = null;

    if (window.isGoogleScriptConfigured && window.isGoogleScriptConfigured()) {
      try {
        payload = await jsonpRequest({ action: "list" });
      } catch (error) {
        payload = null;
      }
    }

    if (!payload) {
      const response = await fetch("/data/publications.json", { cache: "no-store" });
      payload = await response.json();
    }

    const publications = (payload && payload.publications) || [];
    const journals = publications.filter((item) => item.type === "journal");
    const conferences = publications.filter((item) => item.type === "conference");

    app.innerHTML = [
      renderSection("journal", journals),
      renderSection("conference", conferences)
    ].join("");

    bindFilters();

    const initialChip = document.querySelector(".publication-filter .project-filter__chip.is-active");
    applyFilter((initialChip && initialChip.dataset.pubFilter) || "journal");
  }

  document.addEventListener("DOMContentLoaded", loadPublications);
})();
