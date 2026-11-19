// =============================================================================
// Mailer.gs — Gmail email dispatch
// Flow step: "GmailApp → sendEmail"
//
// Exports: sendLeadEmail(toEmail, subject, body)
//   Single responsibility: send one email, guard against blank subject.
// =============================================================================

/**
 * Sends a plain-text email to the lead via GmailApp.
 * Applies a safe default subject if the caller passes an empty string.
 *
 * @param {string} toEmail - Recipient email address
 * @param {string} subject - Email subject (may be AI-generated or fallback)
 * @param {string} body    - Plain-text email body
 */
function sendLeadEmail(toEmail, subject, body) {
  // Safety net: ensure subject is never blank regardless of AI output
  if (!subject || subject.trim() === "") {
    subject = "Your Journey with " + ACADEMY_NAME + " Starts Here 🚀";
  }

  GmailApp.sendEmail(toEmail, subject, body);
}
