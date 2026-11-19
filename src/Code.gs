// =============================================================================
// Code.gs — Unified Lead Processing Engine (Form + Web App API)
// Anantam Career Academy · Dual Intake, AI Scoring, Dynamic Sheets & Protection
// =============================================================================

var GEMINI_MODEL = "gemini-2.0-flash";
var GEMINI_URL   = "https://generativelanguage.googleapis.com/v1beta/models/"
                   + GEMINI_MODEL + ":generateContent";

// ── 1. CORE PIPELINE: processLead(lead, source) ──────────────────────────────
function processLead(lead, source) {
  source = source || "Unknown";
  var channel = lead.channel || "Email";

  // Abuse protection: length checks
  if (lead.message && lead.message.length > 1000) {
    return { ok: false, error: "Message exceeds maximum length of 1,000 characters." };
  }

  // Abuse protection: email validation for Email channel
  var email = (lead.email || "").trim();
  if (channel === "Email") {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return { ok: false, error: "A valid email address is required for Email channel." };
    }
  }

  // Abuse protection: duplicate check (same email + message within 5 minutes)
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  if (isDuplicateSubmission(sheet, email, lead.message, 5)) {
    return { ok: false, error: "Duplicate submission detected. Please wait 5 minutes." };
  }

  var name = (lead.name || "").trim();
  var interest = (lead.interest || "").trim();
  var phone = (lead.phone || "").trim();
  var message = (lead.message || "").trim();

  var aiReply = "";
  var leadScore = "Unknown";
  var status = "";
  var sentAt = "";

  // Generate AI reply & score, with graceful fallback
  try {
    var prompt = buildPrompt(name, interest, message);
    var raw = callGemini(prompt);
    var parsed = parseGeminiResponse(raw);
    aiReply = parsed.emailBody;
    leadScore = parsed.leadScore;
    status = "Sent-AI";
  } catch (err) {
    Logger.log("AI failed (%s) — using fallback.", err.message);
    var fb = fallbackEmail(name, interest);
    aiReply = fb.body;
    status = "Fallback used";
    leadScore = "Unknown";
  }

  // Send email if channel is Email
  if (channel === "Email" && email) {
    try {
      var subject = "Your " + (interest || "Course") + " Journey — Anantam Career Academy";
      MailApp.sendEmail(email, subject, aiReply);
      sentAt = new Date().toISOString();
    } catch (mailErr) {
      Logger.log("MailApp error: %s", mailErr.message);
      status = "Mail Error";
    }
  }

  var waLink = generateWhatsAppLink(phone, name, interest);

  // Write or append to sheet (dynamically creating missing headers)
  var row = lead.targetRow || (sheet.getLastRow() + 1);
  var rowData = {
    "Time": new Date(),
    "Name": name,
    "Email": email,
    "Phone": phone,
    "Interest": interest,
    "Message": message,
    "Channel": channel,
    "Lead Score": leadScore,
    "AI Response": aiReply,
    "Status": status,
    "Sent At": sentAt,
    "Source": source,
    "WhatsApp Link": waLink
  };

  writeToSheetDynamic(sheet, row, rowData);

  return {
    ok: true,
    row: row,
    score: leadScore,
    reply: aiReply,
    status: status
  };
}

// ── 2. FORM INTAKE: onFormSubmit(e) ──────────────────────────────────────────
function onFormSubmit(e) {
  try {
    var nv = e.namedValues || {};
    var lead = {
      name:      (nv["Name"]     || [""])[0],
      email:     (nv["Email"]    || [""])[0],
      phone:     (nv["Phone"]    || [""])[0],
      interest:  (nv["Interest"] || [""])[0],
      message:   (nv["Message"]  || [""])[0],
      channel:   "Email",
      targetRow: e.range ? e.range.getRow() : null
    };
    return processLead(lead, "Form");
  } catch (err) {
    Logger.log("Error in onFormSubmit: %s", err.message);
    return { ok: false, error: err.message };
  }
}

// ── 3. WEB INTAKE: doPost(e) ─────────────────────────────────────────────────
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Wait up to 30 seconds for concurrent write safety
    if (!lock.tryLock(30000)) {
      return jsonResponse({ ok: false, error: "Server busy, could not obtain lock." }, 429);
    }

    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: "Empty request body." }, 400);
    }

    var lead;
    try {
      lead = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse({ ok: false, error: "Malformed JSON payload." }, 400);
    }

    // Verify token against Script Properties
    var expectedToken = PropertiesService.getScriptProperties().getProperty("WEB_TOKEN");
    if (!expectedToken || !lead.token || lead.token !== expectedToken) {
      return jsonResponse({ ok: false, error: "Unauthorized: Missing or invalid token." }, 401);
    }

    // Run core pipeline
    var result = processLead(lead, "Website");
    return jsonResponse(result, result.ok ? 200 : 400);

  } catch (err) {
    Logger.log("doPost error: %s", err.message);
    return jsonResponse({ ok: false, error: err.message }, 500);
  } finally {
    lock.releaseLock();
  }
}

// ── 4. READ API: doGet(e) ────────────────────────────────────────────────────
function doGet(e) {
  try {
    var token = e && e.parameter ? e.parameter.token : null;
    var expectedToken = PropertiesService.getScriptProperties().getProperty("WEB_TOKEN");

    if (!expectedToken || !token || token !== expectedToken) {
      return jsonResponse({ ok: false, error: "Unauthorized." }, 401);
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();

    if (lastRow < 2 || lastCol < 1) {
      return jsonResponse({ ok: true, count: 0, leads: [] }, 200);
    }

    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    
    // Determine the range for the latest up to 100 leads
    var fetchRowCount = Math.min(100, lastRow - 1);
    var startRow = lastRow - fetchRowCount + 1;
    var data = sheet.getRange(startRow, 1, fetchRowCount, lastCol).getValues();

    var leads = [];
    for (var r = data.length - 1; r >= 0; r--) { // newest first
      var item = {};
      for (var c = 0; c < headers.length; c++) {
        var key = String(headers[c]).trim();
        if (key && key.toLowerCase() !== "token") {
          item[key] = data[r][c];
        }
      }
      leads.push(item);
    }

    return jsonResponse({ ok: true, count: leads.length, leads: leads }, 200);

  } catch (err) {
    Logger.log("doGet error: %s", err.message);
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

// ── 5. ABUSE & DUPLICATE PROTECTION HELPER ───────────────────────────────────
function isDuplicateSubmission(sheet, email, message, withinMinutes) {
  if (!email && !message) return false;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  var lastCol = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var emailCol = -1, msgCol = -1, timeCol = -1;

  for (var c = 0; c < headers.length; c++) {
    var h = String(headers[c]).trim().toLowerCase();
    if (h === "email") emailCol = c;
    if (h === "message") msgCol = c;
    if (h === "time" || h === "timestamp") timeCol = c;
  }

  if (emailCol === -1) return false;

  // Check the last 20 rows for quick duplicate comparison
  var checkCount = Math.min(20, lastRow - 1);
  var startRow = lastRow - checkCount + 1;
  var rows = sheet.getRange(startRow, 1, checkCount, lastCol).getValues();
  var cutoff = new Date(Date.now() - withinMinutes * 60 * 1000);

  for (var i = rows.length - 1; i >= 0; i--) {
    var rEmail = String(rows[i][emailCol] || "").trim().toLowerCase();
    var rMsg = msgCol !== -1 ? String(rows[i][msgCol] || "").trim() : "";
    var rTime = timeCol !== -1 ? new Date(rows[i][timeCol]) : null;

    if (rEmail === email.toLowerCase() && rMsg === (message || "").trim()) {
      if (!rTime || isNaN(rTime.getTime()) || rTime >= cutoff) {
        return true;
      }
    }
  }
  return false;
}

// ── 6. DYNAMIC SHEET ENGINE (Creates Missing Headers) ─────────────────────────
function writeToSheetDynamic(sheet, targetRow, dataObj) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headerValues = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var headerMap = {};

  for (var i = 0; i < headerValues.length; i++) {
    var title = String(headerValues[i]).trim();
    if (title) headerMap[title.toLowerCase()] = i + 1;
  }

  // Check if any keys in dataObj are missing from sheet headers; create if missing
  var nextCol = lastCol + 1;
  for (var key in dataObj) {
    if (!dataObj.hasOwnProperty(key)) continue;
    var kLower = key.toLowerCase();
    if (!headerMap[kLower]) {
      // If column 1 is empty in brand new sheet
      if (lastCol === 1 && String(headerValues[0]).trim() === "") {
        sheet.getRange(1, 1).setValue(key);
        headerMap[kLower] = 1;
      } else {
        sheet.getRange(1, nextCol).setValue(key);
        headerMap[kLower] = nextCol;
        nextCol++;
      }
    }
  }

  // Populate row values according to mapped columns
  for (var prop in dataObj) {
    if (!dataObj.hasOwnProperty(prop)) continue;
    var colIndex = headerMap[prop.toLowerCase()];
    if (colIndex) {
      sheet.getRange(targetRow, colIndex).setValue(dataObj[prop]);
    }
  }
}

// ── 7. GEMINI AI CALL & PARSER ───────────────────────────────────────────────
function callGemini(prompt) {
  var apiKey = PropertiesService.getScriptProperties().getProperty("GEMINI_KEY");
  if (!apiKey) throw new Error("GEMINI_KEY not set in Script Properties.");

  var payload = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 512,
      responseMimeType: "application/json"
    }
  });

  var resp = UrlFetchApp.fetch(GEMINI_URL + "?key=" + apiKey, {
    method: "post",
    contentType: "application/json",
    payload: payload,
    muteHttpExceptions: true
  });

  if (resp.getResponseCode() !== 200) {
    throw new Error("Gemini HTTP " + resp.getResponseCode() + ": " + resp.getContentText());
  }

  var json = JSON.parse(resp.getContentText());
  var text = json.candidates &&
             json.candidates[0] &&
             json.candidates[0].content &&
             json.candidates[0].content.parts &&
             json.candidates[0].content.parts[0] &&
             json.candidates[0].content.parts[0].text;

  if (!text) throw new Error("Empty candidate received from Gemini.");
  return text.trim();
}

function parseGeminiResponse(raw) {
  var cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/g, "").trim();
  var data = JSON.parse(cleaned);

  var emailBody = (typeof data.email === "string") ? data.email.trim() : "";
  var leadScore = (typeof data.lead_score === "string") ? data.lead_score.trim() : "Unknown";

  if (["Hot", "Warm", "Cold"].indexOf(leadScore) === -1) leadScore = "Unknown";
  if (!emailBody) throw new Error("Missing 'email' field in Gemini output.");

  return { emailBody: emailBody, leadScore: leadScore };
}

function buildPrompt(name, interest, message) {
  return [
    "You are an encouraging admissions counsellor at Anantam Career Academy.",
    "Return ONLY valid JSON with two keys: \"email\" and \"lead_score\".",
    "",
    "Rules for \"email\":",
    "- Under 120 words. No placeholders, no HTML.",
    "- Greeting: first name only.",
    "- Empathetic, conversational, clean English.",
    "- Highlight guidance, structure, and placement preparation.",
    "- NEVER invent fees, discounts, guarantees, or dates.",
    "- End with one next step: scheduling a 15-minute call this week.",
    "- Sign-off: 'Warm regards,\\nAnantam Career Academy Team'.",
    "",
    "Rules for \"lead_score\":",
    "- \"Hot\": clear goal, career urgency, strong intent.",
    "- \"Warm\": exploring or asking clarification.",
    "- \"Cold\": vague or one-word inquiry.",
    "",
    "Lead details:",
    "  Name: " + name,
    "  Interest: " + interest,
    "  Message: " + (message || "(none provided)")
  ].join("\n");
}

function fallbackEmail(name, interest) {
  var firstName = name ? name.split(" ")[0] : "there";
  return {
    subject: "Welcome to Anantam Career Academy — Let's Talk " + (interest || "Your Goals"),
    body: [
      "Hi " + firstName + ",",
      "",
      "Thank you for your interest in " + (interest || "our programmes") + " at Anantam Career Academy!",
      "",
      "We'd love to learn more about your goals and show you how our course can help you get there.",
      "Could we schedule a quick 15-minute call this week?",
      "",
      "Reply directly to this email and we will coordinate a time that suits you.",
      "",
      "Warm regards,",
      "Anantam Career Academy Team"
    ].join("\n")
  };
}

// ── 8. WHATSAPP & RESPONSE HELPERS ───────────────────────────────────────────
function generateWhatsAppLink(phone, name, interest) {
  if (!phone || typeof phone !== "string") return "";
  var digits = phone.replace(/\D/g, "");
  var normalised = "";

  if (digits.length === 10) normalised = "91" + digits;
  else if (digits.length === 11 && digits.indexOf("0") === 0) normalised = "91" + digits.substring(1);
  else if (digits.length === 12 && digits.indexOf("91") === 0) normalised = digits;
  else return "";

  var firstName = name ? name.split(" ")[0].trim() : "there";
  var courseName = interest ? interest.trim() : "your chosen course";
  var msg = "Hi " + firstName + ", thank you for your interest in " + courseName + 
            " at Anantam Career Academy! Would you like to schedule a quick 15-min call this week?";

  return "https://wa.me/" + normalised + "?text=" + encodeURIComponent(msg);
}

function jsonResponse(data, statusCode) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
