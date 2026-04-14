window.GOOGLE_SCRIPT_CONFIG = {
  webAppUrl: "https://script.google.com/macros/s/AKfycbypa3gMumxGhYjBqoGnR-SvYvbG9mXYE8JoZ2Q_yDMx_BJbAlBUW9nheVAAMo2jin6w/exec"
};

window.isGoogleScriptConfigured = function isGoogleScriptConfigured() {
  const config = window.GOOGLE_SCRIPT_CONFIG || {};
  return Boolean(config.webAppUrl && !config.webAppUrl.includes("YOUR_DEPLOYMENT_ID"));
};
