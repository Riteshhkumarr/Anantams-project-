# Test Cases — Quick Reference
**Anantam Career Academy AI Lead Automation**

> Full context, preconditions, and known-limitations section are in [TEST_PLAN.md](./TEST_PLAN.md).

| ID | Test Case | Key Input Condition | Expected Outcome | Status Path |
|---|---|---|---|---|
| TC-01 | Happy path — AI email | Valid API key, all fields filled | Email sent, status = `Sent-AI`, Sheet row logged | `callGeminiAPI` → `sendLeadEmail` → `logToSheet` |
| TC-02 | Missing API key | `GEMINI_API_KEY` property absent | Fallback email sent, status = `Sent-Fallback` | Error caught → `getFallbackEmail` → `sendLeadEmail` |
| TC-03 | Invalid / expired API key | Key set but wrong value | Gemini returns HTTP 400/401 → fallback | Same as TC-02 |
| TC-04 | No email field | Form submitted without Email | Script aborts early, nothing sent, nothing logged | Early guard in `onFormSubmit` |
| TC-05 | Special chars in name | Name = `Rëéta O'Brien` | Email greeting uses correct first name, no crash | `getFallbackEmail` / `callGeminiAPI` both use name.split(" ")[0] |
| TC-06 | Very long message (5000 chars) | Message field at max length | No timeout; Gemini call succeeds or falls back gracefully | Dependent on Apps Script 6-min limit |
| TC-07 | Trigger not installed | `setupTrigger()` never run | Form submission does NOT trigger script | Manual check: Triggers panel in Apps Script editor |
| TC-08 | Sheet column verification | After TC-01 run | Row appears in columns A–I with correct values | Inspect Sheet post-run |
| TC-09 | Fallback content quality | TC-02 / TC-03 outcome | Fallback email body mentions lead's name and interest | Read received email |
| TC-10 | Duplicate submission | Same email submits form twice | Two separate emails sent (no dedup — known limitation) | Two `Sent-AI` rows in Sheet |
