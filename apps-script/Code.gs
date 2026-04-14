const HEADERS = [
  "id",
  "sort_order",
  "type",
  "title",
  "authors",
  "venue",
  "location",
  "statuses",
  "link_url",
  "link_label",
  "link_icon"
];

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const action = params.action || "list";
  const callback = params.callback || "";

  try {
    let payload;

    if (action === "list") {
      payload = { ok: true, publications: listPublications_() };
    } else if (action === "login") {
      payload = { ok: true, sessionToken: login_(params.username || "", params.password || "") };
    } else if (action === "upsert") {
      authorizeSession_(params.sessionToken);
      const publication = JSON.parse(params.publication || "{}");
      payload = { ok: true, publication: upsertPublication_(publication) };
    } else if (action === "delete") {
      authorizeSession_(params.sessionToken);
      payload = { ok: true, deleted: deletePublication_(params.id || "") };
    } else if (action === "replaceAll") {
      authorizeSession_(params.sessionToken);
      const publications = JSON.parse(params.publications || "[]");
      payload = { ok: true, count: replaceAllPublications_(publications) };
    } else {
      payload = { ok: false, error: "Unknown action" };
    }

    return respond_(payload, callback);
  } catch (error) {
    return respond_({ ok: false, error: String(error && error.message ? error.message : error) }, callback);
  }
}

function respond_(payload, callback) {
  const text = callback
    ? `${callback}(${JSON.stringify(payload)})`
    : JSON.stringify(payload);

  return ContentService
    .createTextOutput(text)
    .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

function login_(username, password) {
  const properties = PropertiesService.getScriptProperties();
  const expectedUsername = properties.getProperty("ADMIN_USERNAME");
  const expectedPassword = properties.getProperty("ADMIN_PASSWORD");

  if (!expectedUsername || !expectedPassword) {
    throw new Error("ADMIN_USERNAME or ADMIN_PASSWORD is not configured");
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    throw new Error("Invalid username or password");
  }

  const sessionToken = Utilities.getUuid() + Utilities.getUuid();
  CacheService.getScriptCache().put("session_" + sessionToken, "1", 21600);
  return sessionToken;
}

function authorizeSession_(sessionToken) {
  if (!sessionToken) {
    throw new Error("Missing session");
  }

  const cached = CacheService.getScriptCache().get("session_" + sessionToken);
  if (!cached) {
    throw new Error("Session expired or invalid");
  }
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = PropertiesService.getScriptProperties().getProperty("SHEET_NAME") || "publications";
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  ensureHeaders_(sheet);
  return sheet;
}

function ensureHeaders_(sheet) {
  const range = sheet.getRange(1, 1, 1, HEADERS.length);
  const existing = range.getValues()[0];
  const matches = HEADERS.every(function(header, index) {
    return existing[index] === header;
  });
  if (!matches) {
    range.setValues([HEADERS]);
  }
}

function listPublications_() {
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }

  const rows = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  return rows
    .filter(function(row) {
      return row[0];
    })
    .map(function(row) {
      return {
        id: String(row[0] || ""),
        sort_order: Number(row[1] || 0),
        type: String(row[2] || "journal"),
        title: String(row[3] || ""),
        authors: String(row[4] || ""),
        venue: String(row[5] || ""),
        location: String(row[6] || ""),
        statuses: String(row[7] || "").split(",").map(function(item) { return item.trim(); }).filter(Boolean),
        link_url: String(row[8] || ""),
        link_label: String(row[9] || ""),
        link_icon: String(row[10] || "link")
      };
    })
    .sort(function(a, b) {
      return Number(a.sort_order || 0) - Number(b.sort_order || 0);
    });
}

function upsertPublication_(publication) {
  if (!publication.title) {
    throw new Error("Title is required");
  }

  const normalized = normalizePublication_(publication);
  const sheet = getSheet_();
  const publications = listPublications_();
  const rowIndex = publications.findIndex(function(item) {
    return item.id === normalized.id;
  });

  if (rowIndex >= 0) {
    sheet.getRange(rowIndex + 2, 1, 1, HEADERS.length).setValues([publicationToRow_(normalized)]);
  } else {
    sheet.appendRow(publicationToRow_(normalized));
  }

  return normalized;
}

function deletePublication_(id) {
  if (!id) {
    throw new Error("Missing publication id");
  }

  const sheet = getSheet_();
  const publications = listPublications_();
  const rowIndex = publications.findIndex(function(item) {
    return item.id === id;
  });

  if (rowIndex < 0) {
    throw new Error("Publication not found");
  }

  sheet.deleteRow(rowIndex + 2);
  return id;
}

function replaceAllPublications_(publications) {
  const sheet = getSheet_();
  const normalized = publications.map(normalizePublication_).sort(function(a, b) {
    return Number(a.sort_order || 0) - Number(b.sort_order || 0);
  });

  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).clearContent();
  }

  if (normalized.length) {
    sheet.getRange(2, 1, normalized.length, HEADERS.length).setValues(normalized.map(publicationToRow_));
  }

  return normalized.length;
}

function normalizePublication_(publication) {
  const statuses = Array.isArray(publication.statuses) ? publication.statuses : [];
  return {
    id: String(publication.id || slugify_(publication.title || "")),
    sort_order: Number(publication.sort_order || 0),
    type: String(publication.type || "journal"),
    title: String(publication.title || ""),
    authors: String(publication.authors || ""),
    venue: String(publication.venue || ""),
    location: String(publication.location || ""),
    statuses: statuses.filter(Boolean),
    link_url: String(publication.link_url || ""),
    link_label: String(publication.link_label || ""),
    link_icon: String(publication.link_icon || "link")
  };
}

function publicationToRow_(publication) {
  return [
    publication.id,
    publication.sort_order,
    publication.type,
    publication.title,
    publication.authors,
    publication.venue,
    publication.location,
    publication.statuses.join(","),
    publication.link_url,
    publication.link_label,
    publication.link_icon
  ];
}

function slugify_(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || Utilities.getUuid().slice(0, 8);
}
