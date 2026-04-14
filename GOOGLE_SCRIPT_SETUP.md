# Google Apps Script Setup

This version works with GitHub Pages and does not require a Python backend.

## Architecture

- GitHub Pages hosts the website
- Google Apps Script Web App provides the publication API
- Google Sheets stores the publication rows
- The admin page writes to Google Apps Script with an admin token

## Setup

1. Create a new Google Sheet.
2. Create a new Apps Script project attached to that sheet.
3. Copy [apps-script/Code.gs](/d:/Users/kylec/Desktop/kylechen357.github.io/apps-script/Code.gs) into the Apps Script editor.
4. In Apps Script, set Script Properties:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `SHEET_NAME`
5. Deploy the Apps Script project as a Web App:
   - Execute as: `Me`
   - Who has access: `Anyone`
6. Copy the deployed Web App URL.
7. Open [google-apps-script-config.js](/d:/Users/kylec/Desktop/kylechen357.github.io/google-apps-script-config.js) and replace `YOUR_DEPLOYMENT_ID`.
8. Open `/admin/` on your GitHub Pages site.
9. Sign in on `/admin/` with the username and password you set in Apps Script.

## Sheet columns

The script auto-creates headers if they are missing:

- `id`
- `sort_order`
- `type`
- `title`
- `authors`
- `venue`
- `location`
- `statuses`
- `link_url`
- `link_label`
- `link_icon`

## Notes

- Public reads are open so the research page can load publications.
- Writes require a valid login session.
- The username/password are checked by Apps Script and the page stores only a short-lived session token in browser session storage.
