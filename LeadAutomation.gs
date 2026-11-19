// =============================================================================
// Anantam Career Academy — AI Lead Automation
// Google Apps Script  |  Gemini-powered outreach emails + Sheet logging
// =============================================================================

// ---------------------------------------------------------------------------
// COLUMN INDICES (1-based) for the logging sheet
// Change these if your sheet has a different layout.
// ---------------------------------------------------------------------------
var COL_TIMESTAMP   = 1;
var COL_NAME        = 2;
var COL_EMAIL       = 3;
var COL_PHONE       = 4;
var COL_INTEREST    = 5;
var COL_MESSAGE     = 6;
var COL_AI_RESPONSE = 7;
var COL_STATUS      = 8;
var COL_SENT_AT     = 9;

// Gemini model endpoint — swap to "gemini-1.5-pro" for higher quality if needed
var GEMINI_MODEL    = "gemini-1.5-flash";
var GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/"
                      + GEMINI_MODEL + ":generateContent";

// Sender identity shown in every email
var ACADEMY_NAME    = "Anantam Career Academy";
var SENDER_SIGN_OFF = "Warm regards,\nAnantam Career Academy Team\n📞 For queries, reply to this email.";

// =============================================================================
// 1. ENTRY POINT — fired by the Google Form submit trigger
// =============================================================================
function onFormSubmit(e) {
  try {
    // e.namedValues maps each question label → array of answer strings
    var responses = e.namedValues;

    // Pull the five fields from the form (trim whitespace defensively)
    var name     = (responses["Name"]     || [""])[0].trim();
    var email    = (responses["Email"]    || [""])[0].trim();
    var phone    = (responses["Phone"]    || [""])[0].trim();
    var interest = (responses["Interest"] || [""])[0].trim();
    var message  = (responses["Message"]  || [""])[0].trim();

    // Timestamp of the actual form submission
    var submittedAt = new Date();

    Logger.log("New lead received — Name: %s | Email: %s | Interest: %s",
               name, email, interest);

    // Guard: if email is missing we cannot do anything useful
    if (!email) {
      Logger.log("ERROR: No email address in submission. Aborting.");
      return;
    }

    // -----------------------------------------------------------------------
    // Try the AI path first
    // -----------------------------------------------------------------------
    var aiResponse = null;
    var subject    = "";
    var body       = "";
    var status     = "";

    try {
      aiResponse = callGeminiAPI(name, interest, message);

      if (aiResponse) {
        // Convention: the prompt asks Gemini to put the subject on line 1,
        // then a blank line, then the body.
        var lines = aiResponse.split("\n");

        // Extract subject — first non-empty line
        subject = "";
        var bodyStartIndex = 0;
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (line.length > 0) {
            // Strip a leading "Subject:" label if Gemini included one
            subject = line.replace(/^subject\s*:\s*/i, "");
            bodyStartIndex = i + 1;
            break;
          }
        }

        // Everything after the subject line becomes the body
        body   = lines.slice(bodyStartIndex).join("\n").trim();
        status = "Sent-AI";
      } else {
        throw new Error("Gemini returned an empty response.");
      }

    } catch (aiErr) {
      // AI failed — fall back gracefully, do NOT abort the whole flow
      Logger.log("AI call failed (%s). Using fallback template.", aiErr.message);
      var fallback = getFallbackEmail(name, interest);
      subject      = fallback.subject;
      body         = fallback.body;
      aiResponse   = "FALLBACK — AI error: " + aiErr.message;
      status       = "Sent-Fallback";
    }

    // -----------------------------------------------------------------------
    // Send the email
    // -----------------------------------------------------------------------
    sendLeadEmail(email, subject, body);

    var sentAt = new Date();
    Logger.log("Email sent to %s with status: %s", email, status);

    // -----------------------------------------------------------------------
    // Log the row to the spreadsheet
    // -----------------------------------------------------------------------
    logToSheet(submittedAt, name, email, phone, interest, message,
               aiResponse, status, sentAt);

  } catch (fatalErr) {
    // Last-resort catch — log and attempt a fallback email if we have an address
    Logger.log("FATAL ERROR in onFormSubmit: %s", fatalErr.message);

    try {
      var emergencyEmail = (e.namedValues["Email"] || [""])[0].trim();
      var emergencyName  = (e.namedValues["Name"]  || ["Valued Learner"])[0].trim();
      if (emergencyEmail) {
        var fb = getFallbackEmail(emergencyName, "your chosen course");
        sendLeadEmail(emergencyEmail, fb.subject, fb.body);
        Logger.log("Emergency fallback email sent to %s", emergencyEmail);
      }
    } catch (fbErr) {
      Logger.log("Emergency fallback also failed: %s", fbErr.message);
    }
  }
}

// =============================================================================
// 2. GEMINI API CALL
//    Returns the raw text response from Gemini, or throws on failure.
// =============================================================================
function callGeminiAPI(name, interest, userMessage) {
  // Retrieve the API key stored securely in Script Properties
  var apiKey = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not set in Script Properties.");
  }

  // Build the prompt — Gemini is instructed to output subject then body
  var prompt = [
    "You are a warm, professional admissions counsellor at Anantam Career Academy,",
    "a premier coaching institute offering these courses:",
    "  • DSA Bootcamp",
    "  • Full Stack Web Development",
    "  • Data Science Pro",
    "  • CAT/MBA Prep",
    "  • UPSC Foundation",
    "",
    "A prospective learner just filled out our interest form. Write a personalised,",
    "encouraging outreach email to them. Follow these rules strictly:",
    "  1. The VERY FIRST line must be the email subject (no 'Subject:' prefix).",
    "  2. Leave one blank line after the subject, then write the email body.",
    "  3. Address them by their first name in the greeting.",
    "  4. Reference their chosen interest (" + interest + ") and weave in their",
    "     message if it adds context.",
    "  5. Mention 1-2 concrete benefits of the relevant course.",
    "  6. End with a warm call-to-action to book a free counselling call.",
    "  7. Sign off as 'Anantam Career Academy Team'.",
    "  8. Keep the email under 250 words. No HTML — plain text only.",
    "",
    "Learner details:",
    "  Name    : " + name,
    "  Interest: " + interest,
    "  Message : " + (userMessage || "(no additional message provided)"),
  ].join("\n");

  // Construct the JSON payload Gemini expects
  var payload = JSON.stringify({
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.75,       // balanced creativity vs coherence
      maxOutputTokens: 512
    }
  });

  // Make the HTTP POST request
  var response = UrlFetchApp.fetch(GEMINI_ENDPOINT + "?key=" + apiKey, {
    method      : "post",
    contentType : "application/json",
    payload     : payload,
    muteHttpExceptions: true   // so we can inspect non-200 ourselves
  });

  var statusCode = response.getResponseCode();
  if (statusCode !== 200) {
    throw new Error("Gemini HTTP " + statusCode + ": " + response.getContentText());
  }

  // Navigate the response JSON to the generated text
  var json = JSON.parse(response.getContentText());
  var text = json.candidates &&
             json.candidates[0] &&
             json.candidates[0].content &&
             json.candidates[0].content.parts &&
             json.candidates[0].content.parts[0] &&
             json.candidates[0].content.parts[0].text;

  if (!text) {
    throw new Error("Gemini response JSON had no text candidate.");
  }

  return text.trim();
}

// =============================================================================
// 3. SEND EMAIL via Gmail
// =============================================================================
function sendLeadEmail(toEmail, subject, body) {
  // Safety net: ensure subject is never blank
  if (!subject || subject.trim() === "") {
    subject = "Your Journey with " + ACADEMY_NAME + " Starts Here 🚀";
  }

  GmailApp.sendEmail(toEmail, subject, body);
}

// =============================================================================
// 4. LOG TO SHEET
//    Appends one row to the last (or only) sheet in the active spreadsheet.
// =============================================================================
function logToSheet(submittedAt, name, email, phone, interest,
                    message, aiResponse, status, sentAt) {
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();

    // Build the row aligned to the column constants defined at the top
    var row = [];
    row[COL_TIMESTAMP   - 1] = submittedAt;
    row[COL_NAME        - 1] = name;
    row[COL_EMAIL       - 1] = email;
    row[COL_PHONE       - 1] = phone;
    row[COL_INTEREST    - 1] = interest;
    row[COL_MESSAGE     - 1] = message;
    row[COL_AI_RESPONSE - 1] = aiResponse;
    row[COL_STATUS      - 1] = status;
    row[COL_SENT_AT     - 1] = sentAt;

    sheet.appendRow(row);
    Logger.log("Row logged to sheet for %s", email);

  } catch (sheetErr) {
    // Sheet logging failure must never kill the email flow — just log it
    Logger.log("WARNING: Could not log to sheet — %s", sheetErr.message);
  }
}

// =============================================================================
// 5. FALLBACK EMAIL TEMPLATE
//    Returns { subject, body } using only name and interest.
//    Written to still feel warm and personal without AI.
// =============================================================================
function getFallbackEmail(name, interest) {
  // Use first name only for the greeting
  var firstName = name ? name.split(" ")[0] : "there";

  var subject = "Welcome to " + ACADEMY_NAME + "! Let's Build Your Future 🌟";

  var body = [
    "Hi " + firstName + ",",
    "",
    "Thank you so much for reaching out to us at " + ACADEMY_NAME + "! 🎉",
    "",
    "We noticed your interest in " + (interest || "one of our programmes") + ", and we're",
    "absolutely thrilled to have you explore this path with us.",
    "",
    "At Anantam Career Academy, we believe every learner has the potential to",
    "achieve extraordinary things — and our expert mentors are here to guide you",
    "every step of the way.",
    "",
    "Here's what makes us different:",
    "  ✅ Industry-experienced mentors with real-world project exposure",
    "  ✅ Live sessions + recordings so you never miss a class",
    "  ✅ Placement support & resume building",
    "  ✅ A vibrant community of 10,000+ learners",
    "",
    "📅 We'd love to offer you a FREE 30-minute counselling call to understand",
    "your goals and map out the best learning path for you.",
    "",
    "Simply reply to this email or call us — we'll set it up at a time that",
    "works for you.",
    "",
    "We can't wait to be part of your success story, " + firstName + "! 💪",
    "",
    SENDER_SIGN_OFF
  ].join("\n");

  return { subject: subject, body: body };
}

// =============================================================================
// 6. TEST FUNCTION — run this manually from the Apps Script editor
//    to verify the whole pipeline without submitting a real form.
// =============================================================================
function testSubmission() {
  Logger.log("=== Running testSubmission() ===");

  // Simulate the event object Google Forms would send
  var fakeEvent = {
    namedValues: {
      "Name"     : ["Priya Sharma"],
      "Email"    : ["priya.sharma.test@example.com"],   // <-- change to a real inbox to see the email
      "Phone"    : ["9876543210"],
      "Interest" : ["Full Stack Web Development"],
      "Message"  : ["I am a final-year CS student and want to get into a product company. How does your course help with placements?"]
    }
  };

  onFormSubmit(fakeEvent);
  Logger.log("=== testSubmission() complete — check Logs and Sheet ===");
}

// =============================================================================
// 7. SETUP TRIGGER — run once to register the form-submit trigger
//    Open: Extensions > Apps Script > Run > setupTrigger
// =============================================================================
function setupTrigger() {
  // Remove any existing onFormSubmit triggers to avoid duplicate emails
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === "onFormSubmit") {
      ScriptApp.deleteTrigger(trigger);
      Logger.log("Deleted existing onFormSubmit trigger.");
    }
  });

  // Create a new form-submit trigger bound to the spreadsheet's linked form
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.newTrigger("onFormSubmit")
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();

  Logger.log("SUCCESS: onFormSubmit trigger created for spreadsheet: %s", ss.getName());
}
