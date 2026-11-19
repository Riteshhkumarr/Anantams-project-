// =============================================================================
// GeminiClient.gs — Gemini API integration
// Flow step: "Gemini API available? → generates personalised email"
//
// Exports: callGeminiAPI(name, interest, userMessage)
//   Returns: raw text string from Gemini (subject on line 1, body below)
//   Throws:  Error on HTTP failure, missing API key, or empty response
// =============================================================================

/**
 * Calls the Gemini API to generate a personalised outreach email.
 *
 * @param {string} name        - Lead's full name (from form)
 * @param {string} interest    - Course the lead is interested in
 * @param {string} userMessage - The lead's own message / query
 * @returns {string} Raw Gemini text: subject on line 1, blank line, then body
 */
function callGeminiAPI(name, interest, userMessage) {
  // Retrieve the API key stored securely in Script Properties — never hard-coded
  var apiKey = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not set in Script Properties.");
  }

  // Build the prompt — instructs Gemini on format and content rules
  var prompt = [
    "You are a warm, professional admissions counsellor at " + ACADEMY_NAME + ",",
    "a premier coaching institute offering these courses:",
    COURSES.map(function(c) { return "  • " + c; }).join("\n"),
    "",
    "A prospective learner just filled out our interest form. Write a personalised,",
    "encouraging outreach email to them. Follow these rules strictly:",
    "  1. The VERY FIRST line must be the email subject (no 'Subject:' prefix).",
    "  2. Leave one blank line after the subject, then write the email body.",
    "  3. Address them by their first name in the greeting.",
    "  4. Reference their chosen interest (" + interest + ") and weave in their",
    "     message if it adds context.",
    "  5. Mention 1–2 concrete benefits of the relevant course.",
    "  6. End with a warm call-to-action to book a free counselling call.",
    "  7. Sign off as 'Anantam Career Academy Team'.",
    "  8. Keep the email under 250 words. No HTML — plain text only.",
    "",
    "Learner details:",
    "  Name    : " + name,
    "  Interest: " + interest,
    "  Message : " + (userMessage || "(no additional message provided)"),
  ].join("\n");

  // Construct the JSON payload Gemini's generateContent endpoint expects
  var payload = JSON.stringify({
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.75,      // balanced creativity vs coherence
      maxOutputTokens: 512
    }
  });

  // POST to Gemini — muteHttpExceptions lets us inspect non-200 responses ourselves
  var response = UrlFetchApp.fetch(GEMINI_ENDPOINT + "?key=" + apiKey, {
    method           : "post",
    contentType      : "application/json",
    payload          : payload,
    muteHttpExceptions: true
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
