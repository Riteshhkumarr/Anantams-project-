// =============================================================================
// SheetLogger.gs — Google Sheet audit log
// Flow step: "Sheet Log Row → Timestamp · Status · AI_Response · Sent_At"
//
// Column layout (defined in Config.gs):
//   A: Timestamp  B: Name  C: Email  D: Phone  E: Interest
//   F: Message    G: AI_Response  H: Status  I: Sent_At
//
// Exports: logToSheet(submittedAt, name, email, phone, interest,
//                     message, aiResponse, status, sentAt)
// =============================================================================

/**
 * Appends a single audit row to the active sheet.
 * Wrapped in its own try/catch — a sheet error must NEVER abort the email flow.
 *
 * @param {Date}   submittedAt - Timestamp of the original form submission
 * @param {string} name        - Lead's full name
 * @param {string} email       - Lead's email address
 * @param {string} phone       - Lead's phone number
 * @param {string} interest    - Course of interest
 * @param {string} message     - Lead's own message / query
 * @param {string} aiResponse  - Full Gemini text, or "FALLBACK — AI error: …"
 * @param {string} status      - "Sent-AI" | "Sent-Fallback"
 * @param {Date}   sentAt      - Timestamp when GmailApp.sendEmail() was called
 */
function logToSheet(submittedAt, name, email, phone, interest,
                    message, aiResponse, status, sentAt) {
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();

    // Build the row aligned to COL_* constants from Config.gs
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
    // Log but do not re-throw — email delivery takes priority over logging
    Logger.log("WARNING: Could not log to sheet — %s", sheetErr.message);
  }
}
