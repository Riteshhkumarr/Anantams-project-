// =============================================================================
// FallbackTemplate.gs — Warm plain-text fallback email
// Flow step: "No / Error → Fallback Template Email"
//
// Called when callGeminiAPI() throws for any reason (bad key, network error,
// quota exceeded, empty response). Guarantees no enquiry goes unanswered.
//
// Exports: getFallbackEmail(name, interest)
//   Returns: { subject: string, body: string }
// =============================================================================

/**
 * Returns a personalised-feeling fallback email without touching the AI.
 *
 * @param {string} name     - Lead's full name
 * @param {string} interest - Course the lead expressed interest in
 * @returns {{ subject: string, body: string }}
 */
function getFallbackEmail(name, interest) {
  // Use first name only for a natural-sounding greeting
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
    "At " + ACADEMY_NAME + ", we believe every learner has the potential to",
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
