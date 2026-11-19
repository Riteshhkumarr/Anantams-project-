// =============================================================================
// Config.gs — Shared constants for Anantam Career Academy Lead Automation
// Single source of truth; imported into every other .gs file automatically
// because all files share one global scope in Apps Script.
// =============================================================================

// Academy identity
var ACADEMY_NAME    = "Anantam Career Academy";
var SENDER_SIGN_OFF = "Warm regards,\nAnantam Career Academy Team\n📞 For queries, reply to this email.";

// Gemini model — swap to "gemini-1.5-pro" for higher quality if needed
var GEMINI_MODEL    = "gemini-1.5-flash";
var GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/"
                      + GEMINI_MODEL + ":generateContent";

// Sheet column indices (1-based). Update here if the sheet layout changes.
var COL_TIMESTAMP   = 1;  // A
var COL_NAME        = 2;  // B
var COL_EMAIL       = 3;  // C
var COL_PHONE       = 4;  // D
var COL_INTEREST    = 5;  // E
var COL_MESSAGE     = 6;  // F
var COL_AI_RESPONSE = 7;  // G
var COL_STATUS      = 8;  // H
var COL_SENT_AT     = 9;  // I

// Courses the academy offers — referenced in the Gemini prompt
var COURSES = [
  "DSA Bootcamp",
  "Full Stack Web Development",
  "Data Science Pro",
  "CAT/MBA Prep",
  "UPSC Foundation"
];
