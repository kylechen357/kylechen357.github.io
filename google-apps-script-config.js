window.GOOGLE_SCRIPT_CONFIG = {
  webAppUrl: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
};

window.isGoogleScriptConfigured = function isGoogleScriptConfigured() {
  const config = window.GOOGLE_SCRIPT_CONFIG || {};
  return Boolean(config.webAppUrl && !config.webAppUrl.includes("YOUR_DEPLOYMENT_ID"));
};
