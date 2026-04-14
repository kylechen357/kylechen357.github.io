(function () {
  const loginCard = document.getElementById("loginCard");
  const dashboard = document.getElementById("dashboard");
  const loginForm = document.getElementById("loginForm");
  const loginMessage = document.getElementById("loginMessage");
  const logoutButton = document.getElementById("logoutButton");
  const syncButton = document.getElementById("syncButton");
  const publicationForm = document.getElementById("publicationForm");
  const formTitle = document.getElementById("formTitle");
  const formMessage = document.getElementById("formMessage");
  const publicationList = document.getElementById("publicationList");
  const publicationCount = document.getElementById("publicationCount");
  const listTitle = document.getElementById("listTitle");
  const newButton = document.getElementById("newButton");
  const usernameField = document.getElementById("adminUsername");
  const passwordField = document.getElementById("adminPassword");
  const adminTypeChips = document.querySelectorAll("[data-admin-type]");
  const conferenceOnlyFields = document.getElementById("conferenceOnlyFields");
  const journalStatusFieldset = document.getElementById("journalStatusFieldset");
  const conferenceStatusFieldset = document.getElementById("conferenceStatusFieldset");

  const fieldId = document.getElementById("publicationId");
  const fieldTitle = document.getElementById("publicationTitle");
  const fieldType = document.getElementById("publicationType");
  const fieldAuthors = document.getElementById("publicationAuthors");
  const fieldVenue = document.getElementById("publicationVenue");
  const fieldLocation = document.getElementById("publicationLocation");
  const fieldOrder = document.getElementById("publicationOrder");
  const fieldLinkUrl = document.getElementById("publicationLinkUrl");
  const fieldLinkLabel = document.getElementById("publicationLinkLabel");
  const fieldLinkIcon = document.getElementById("publicationLinkIcon");

  const storageKey = "publicationAdminSession";
  const config = window.GOOGLE_SCRIPT_CONFIG || {};
  const statusOptionsByType = {
    journal: ["in-progress", "accepted", "published", "preprint"],
    conference: ["in-progress", "accepted", "published"]
  };
  let publications = [];
  let activeType = "journal";

  function setMessage(element, message, isError) {
    element.textContent = message || "";
    element.classList.toggle("is-error", Boolean(isError));
  }

  function isConfigured() {
    return typeof window.isGoogleScriptConfigured === "function" && window.isGoogleScriptConfigured();
  }

  function jsonpRequest(params) {
    return new Promise((resolve, reject) => {
      if (!isConfigured()) {
        reject(new Error("Google Apps Script is not configured yet."));
        return;
      }

      const callbackName = "__gasCallback_" + Math.random().toString(36).slice(2);
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
        reject(new Error("Unable to reach Google Apps Script."));
      };

      script.src = url.toString();
      document.body.appendChild(script);
    });
  }

  function getSessionToken() {
    return sessionStorage.getItem(storageKey) || "";
  }

  function setSessionToken(token) {
    sessionStorage.setItem(storageKey, token);
  }

  function clearSessionToken() {
    sessionStorage.removeItem(storageKey);
  }

  function getSelectedStatuses() {
    return Array.from(document.querySelectorAll('input[name="status"]:checked'))
      .map((checkbox) => checkbox.value)
      .filter((status) => (statusOptionsByType[activeType] || []).includes(status));
  }

  function setActiveType(type) {
    activeType = type === "conference" ? "conference" : "journal";
    fieldType.value = activeType;
    adminTypeChips.forEach((chip) => {
      chip.classList.toggle("is-active", chip.dataset.adminType === activeType);
    });
    conferenceOnlyFields.classList.toggle("is-hidden", activeType !== "conference");
    journalStatusFieldset.classList.toggle("is-hidden", activeType !== "journal");
    conferenceStatusFieldset.classList.toggle("is-hidden", activeType !== "conference");
    formTitle.textContent = activeType === "journal" ? "Add Journal Publication" : "Add Conference Publication";
    listTitle.textContent = activeType === "journal" ? "Current Journal Publications" : "Current Conference Publications";
    renderList();
  }

  function fillForm(publication) {
    setActiveType(publication?.type || "journal");
    fieldId.value = publication?.id || "";
    fieldTitle.value = publication?.title || "";
    fieldType.value = publication?.type || "journal";
    fieldAuthors.value = publication?.authors || "";
    fieldVenue.value = publication?.venue || "";
    fieldLocation.value = publication?.location || "";
    fieldOrder.value = publication?.sort_order ?? 0;
    fieldLinkUrl.value = publication?.link_url || "";
    fieldLinkLabel.value = publication?.link_label || "";
    fieldLinkIcon.value = publication?.link_icon || "link";

    document.querySelectorAll('input[name="status"]').forEach((checkbox) => {
      checkbox.checked = publication ? (publication.statuses || []).includes(checkbox.value) : false;
    });

    formTitle.textContent = publication
      ? (activeType === "journal" ? "Edit Journal Publication" : "Edit Conference Publication")
      : (activeType === "journal" ? "Add Journal Publication" : "Add Conference Publication");
  }

  function resetForm() {
    publicationForm.reset();
    fieldId.value = "";
    fieldOrder.value = 0;
    fieldLinkIcon.value = "link";
    setActiveType(activeType);
    setMessage(formMessage, "");
  }

  function renderList() {
    const filteredPublications = publications.filter((publication) => publication.type === activeType);
    publicationCount.textContent = `${filteredPublications.length} item${filteredPublications.length === 1 ? "" : "s"}`;
    if (!filteredPublications.length) {
      publicationList.innerHTML = '<p class="admin-message">No publications yet.</p>';
      return;
    }

    publicationList.innerHTML = filteredPublications.map((publication) => `
      <article class="admin-item">
        <div class="admin-item__title">${publication.title}</div>
        <div class="admin-item__meta">
          <span class="admin-pill">${publication.type}</span>
          <span class="admin-pill">order ${publication.sort_order}</span>
        </div>
        <p>${publication.venue || ""}${publication.location ? ` · ${publication.location}` : ""}</p>
        <div class="admin-item__tags">
          ${(publication.statuses || []).map((status) => `<span class="admin-pill">${status}</span>`).join("")}
        </div>
        <div class="admin-item__actions">
          <button class="btn" type="button" data-action="edit" data-id="${publication.id}">Edit</button>
          <button class="btn" type="button" data-action="delete" data-id="${publication.id}">Delete</button>
        </div>
      </article>
    `).join("");
  }

  async function loadPublications() {
    const payload = await jsonpRequest({ action: "list" });
    publications = payload.publications || [];
    renderList();
  }

  function updateShell(authenticated) {
    loginCard.classList.toggle("is-hidden", authenticated);
    dashboard.classList.toggle("is-hidden", !authenticated);
  }

  async function boot() {
    if (!isConfigured()) {
      setMessage(loginMessage, "Set your Apps Script web app URL in google-apps-script-config.js first.", true);
      return;
    }

    try {
      await loadPublications();
      const sessionToken = getSessionToken();
      if (sessionToken) {
        updateShell(true);
      }
    } catch (error) {
      setMessage(loginMessage, error.message, true);
    }
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = usernameField.value.trim();
    const password = passwordField.value;
    if (!username || !password) {
      setMessage(loginMessage, "Enter your username and password.", true);
      return;
    }

    setMessage(loginMessage, "Signing in...");
    try {
      const payload = await jsonpRequest({ action: "login", username, password });
      setSessionToken(payload.sessionToken || "");
      usernameField.value = "";
      passwordField.value = "";
      setMessage(loginMessage, "");
      updateShell(true);
    } catch (error) {
      setMessage(loginMessage, error.message, true);
    }
  });

  logoutButton.addEventListener("click", () => {
    clearSessionToken();
    resetForm();
    updateShell(false);
  });

  newButton.addEventListener("click", resetForm);
  adminTypeChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      setActiveType(chip.dataset.adminType || "journal");
      resetForm();
    });
  });

  publicationForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const sessionToken = getSessionToken();
    if (!sessionToken) {
      setMessage(formMessage, "Please sign in first.", true);
      return;
    }

    const allowedStatuses = statusOptionsByType[activeType] || [];
    const publication = {
      id: fieldId.value.trim(),
      title: fieldTitle.value.trim(),
      type: activeType,
      authors: fieldAuthors.value.trim(),
      venue: fieldVenue.value.trim(),
      location: activeType === "conference" ? fieldLocation.value.trim() : "",
      sort_order: Number(fieldOrder.value || 0),
      statuses: getSelectedStatuses().filter((status) => allowedStatuses.includes(status)),
      link_url: fieldLinkUrl.value.trim(),
      link_label: fieldLinkLabel.value.trim(),
      link_icon: fieldLinkIcon.value
    };

    setMessage(formMessage, "Saving...");
    try {
      await jsonpRequest({ action: "upsert", sessionToken, publication });
      await loadPublications();
      resetForm();
      setMessage(formMessage, "Saved.");
    } catch (error) {
      setMessage(formMessage, error.message, true);
    }
  });

  publicationList.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }

    const publication = publications.find((item) => item.id === button.dataset.id);
    if (!publication) {
      return;
    }

    if (button.dataset.action === "edit") {
      fillForm(publication);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (button.dataset.action === "delete") {
      const sessionToken = getSessionToken();
      if (!sessionToken) {
        setMessage(formMessage, "Please sign in first.", true);
        return;
      }

      const confirmed = window.confirm(`Delete "${publication.title}"?`);
      if (!confirmed) {
        return;
      }

      try {
        await jsonpRequest({ action: "delete", sessionToken, id: publication.id });
        await loadPublications();
        if (fieldId.value === publication.id) {
          resetForm();
        }
      } catch (error) {
        setMessage(formMessage, error.message, true);
      }
    }
  });

  syncButton.addEventListener("click", async () => {
    const sessionToken = getSessionToken();
    if (!sessionToken) {
      setMessage(formMessage, "Please sign in first.", true);
      return;
    }

    setMessage(formMessage, "Syncing local sample data...");
    try {
      const response = await fetch("/data/publications.json", { cache: "no-store" });
      const payload = await response.json();
      await jsonpRequest({ action: "replaceAll", sessionToken, publications: payload.publications || [] });
      await loadPublications();
      setMessage(formMessage, "Local sample synced to Google Sheets.");
    } catch (error) {
      setMessage(formMessage, error.message, true);
    }
  });

  boot();
  setActiveType("journal");
})();
