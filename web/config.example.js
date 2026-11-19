// =============================================================================
// Anantam Career Academy — Web Portal Configuration Example
// Copy this file to "config.js" in the same directory and fill in your values.
// =============================================================================

window.CONFIG = {
  // Your Google Apps Script Web App Deployment URL:
  // e.g. "https://script.google.com/macros/s/AKfycbx.../exec"
  WEB_APP_URL: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec",

  // Must match the "WEB_TOKEN" script property set in Google Apps Script
  WEB_TOKEN: "anantam_web_secure_token_2026",

  // Set MOCK to true to test the UI locally without calling Google Apps Script.
  // Set to false when ready to connect to your live Apps Script backend.
  MOCK: true
};
