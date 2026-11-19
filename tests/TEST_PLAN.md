# Test Plan: AI Lead Automation — Anantam Career Academy
**Version:** 1.0  
**Date:** 2026-11-19  
**System:** Google Form → Google Sheet → Apps Script → Gemini AI → Gmail  
**Author:** Test Planner (Automated)

---

## 1. Scope & Objectives

### In Scope
- `onFormSubmit(e)` trigger execution on new Google Form submissions
- Gemini API call (`callGeminiAPI`) — success and failure paths
- Personalised email generation and delivery via `GmailApp.sendEmail`
- Fallback email delivery when AI fails (missing API key or API error)
- Google Sheet logging (`logToSheet`) — all nine columns
- Manual test harness (`testSubmission()` function)
- `setupTrigger()` helper function

### Out of Scope
- Google Form UI design / visual styling
- Gemini model accuracy / quality of AI-generated prose
- Gmail deliverability / spam filtering (third-party concern)
- Multi-user concurrency / concurrent submissions > 1 per second

### Objectives
1. Verify the **happy path**: a valid form submission produces an AI-personalised email and a correctly populated Sheet row.
2. Verify **graceful degradation**: missing API key and API errors both trigger the fallback email, never a crash.
3. Verify **input resilience**: edge-case inputs (empty fields, special characters, very long messages) do not break execution.
4. Verify **sheet integrity**: every execution appends exactly one log row with accurate column values.
5. Verify **trigger wiring**: the trigger is registered and fires reliably on form submit.

---

## 2. Test Environment Setup

> [!IMPORTANT]
> Complete every step below before executing any test case. Skipping setup steps will cause misleading failures.

### 2.1 Google Apps Script Project
| Step | Action |
|------|--------|
| 1 | Open the Google Sheet linked to the Google Form. |
| 2 | Go to **Extensions → Apps Script**. |
| 3 | Paste / deploy the production script (`Code.gs`). |
| 4 | Save the project (`Ctrl+S`). |

### 2.2 API Key — Script Properties
| Step | Action |
|------|--------|
| 1 | In Apps Script, click **Project Settings** (gear icon) → **Script Properties**. |
| 2 | Add property: **Key** = `GEMINI_API_KEY`, **Value** = your valid Gemini API key. |
| 3 | For negative tests (TC-02), you will *temporarily remove or corrupt* this value. |

### 2.3 Gmail Authorization
| Step | Action |
|------|--------|
| 1 | Run any function (e.g., `testSubmission`) once manually. |
| 2 | Complete the OAuth consent flow — grant **Send email on your behalf** and **Spreadsheet access** permissions. |
| 3 | Confirm no "Authorization required" dialog appears on subsequent runs. |

### 2.4 Google Sheet Columns
Ensure the linked Sheet's **first row** (Row 1) contains these exact headers in order:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Timestamp | Name | Email | Phone | Interest | Message | AI_Response | Status | Sent_At |

> [!NOTE]
> The script uses hardcoded column indices. If headers are shifted, logging will be misaligned. Add a header row manually if one does not exist.

### 2.5 Trigger Registration
| Step | Action |
|------|--------|
| 1 | In Apps Script editor, run `setupTrigger()` **once**. |
| 2 | Go to **Triggers** (clock icon) and confirm an `onFormSubmit` trigger pointing to `onFormSubmit` function exists. |
| 3 | For TC-07 (trigger not set up), delete this trigger temporarily. |

### 2.6 Test Email Recipient
Use a Gmail address **you own and can inspect** as the target email in `testSubmission()`. Do not use a real lead's email during testing.

---

## 3. Test Cases

| TC ID | Test Case | Preconditions | Steps | Expected Result | Pass/Fail |
|-------|-----------|---------------|-------|-----------------|-----------|
| **TC-01** | **Happy Path — AI-generated email** | API key valid; trigger active; Gmail authorised; Sheet has header row | 1. Run `testSubmission()` in Apps Script editor.<br>2. Check target Gmail inbox.<br>3. Check Sheet for new row. | Email received with AI-personalised subject & body referencing the test name and interest. Sheet row appended with `Status = "Sent-AI"` and non-empty `AI_Response`. | ☐ |
| **TC-02** | **Fallback — API key missing** | API key property **deleted** from Script Properties; all other setup complete | 1. Remove `GEMINI_API_KEY` from Script Properties.<br>2. Run `testSubmission()`.<br>3. Check Gmail inbox.<br>4. Check Sheet row. | Fallback email received (warm plain-text, references Name and Interest). Sheet `Status = "Sent-Fallback"`. No unhandled exception in Execution Log. | ☐ |
| **TC-03** | **Fallback — Gemini API returns error** | API key set to an **invalid/expired** value; all other setup complete | 1. Set `GEMINI_API_KEY` to `"INVALID_KEY_12345"`.<br>2. Run `testSubmission()`.<br>3. Check Gmail inbox.<br>4. Check Sheet row.<br>5. Check Execution Log for `Logger.log` error entry. | Fallback email delivered. `Status = "Sent-Fallback"`. Error logged via `Logger.log`. No crash / unhandled exception. | ☐ |
| **TC-04** | **Empty required field — Email blank** | Valid setup; API key present | 1. Edit `testSubmission()` temporarily: set email to `""`.<br>2. Run the function.<br>3. Observe Execution Log and Sheet. | Script catches error (GmailApp will throw on empty recipient). `Status = "Error"` logged in Sheet (or execution log captures error). No email sent. | ☐ |
| **TC-05** | **Special characters in Name** | Valid setup; API key present | 1. Edit `testSubmission()`: set name to `"Rāhul Ó'Brïen <script>alert(1)</script>"`.<br>2. Run function.<br>3. Inspect email body and Sheet row. | Email delivered successfully. Name rendered as literal string — no HTML injection, no script execution. Sheet column B contains the raw string. | ☐ |
| **TC-06** | **Very long Message field** | Valid setup; API key present | 1. Edit `testSubmission()`: set message to a 5 000-character string (repeat a sentence).<br>2. Run function.<br>3. Check email and Sheet. | Email sent (AI or fallback). Sheet `Message` column holds full text (or truncated if script caps it). No timeout or memory error within Apps Script 6-minute limit. | ☐ |
| **TC-07** | **Trigger not configured — no auto-fire on submit** | `setupTrigger()` **never run** (or trigger manually deleted) | 1. Delete any existing `onFormSubmit` triggers.<br>2. Submit a real Google Form entry.<br>3. Wait 2 minutes.<br>4. Check Gmail and Sheet. | No email sent; no new Sheet row. This confirms the trigger is required. (Optionally: run `setupTrigger()` and resubmit to verify it then works.) | ☐ |
| **TC-08** | **Sheet logging verification — all columns populated** | TC-01 has passed | 1. Run `testSubmission()` with known data.<br>2. Open Sheet, inspect the last appended row. | All 9 columns populated: Timestamp (ISO/locale date), Name, Email, Phone, Interest, Message, AI_Response (non-empty), Status (`"Sent-AI"`), Sent_At (timestamp). No column is blank or misaligned. | ☐ |
| **TC-09** | **Fallback email content quality** | API key invalid (simulate TC-03 conditions) | 1. Run with invalid API key.<br>2. Read fallback email body. | Email body references the lead's **Name** and **Interest** (not generic placeholders like `{name}`). Subject line is meaningful (not empty). Signature includes "Anantam Career Academy". | ☐ |
| **TC-10** | **Duplicate/rapid submissions** | Valid setup; API key present | 1. Run `testSubmission()` three times in rapid succession (< 10 s apart). | Three separate rows appended to Sheet; three emails sent. No row overwritten. Script handles each independently. | ☐ |

---

## 4. Edge Cases & Boundary Conditions

### 4.1 Input Boundaries

| Field | Boundary | Expected Behaviour |
|-------|----------|--------------------|
| **Name** | Empty string `""` | Script should not crash; fallback or error status logged |
| **Name** | Unicode / emoji `"李伟 🚀"` | Handled as UTF-8; email and sheet display correctly |
| **Email** | Malformed `"not-an-email"` | `GmailApp.sendEmail` throws; caught by try/catch; `Status = "Error"` |
| **Phone** | Non-numeric `"+91-98765 ABCD"` | Treated as string; logged as-is; no validation assumed |
| **Interest** | Value not in known course list | AI prompt still executes; response may be generic |
| **Message** | 0 characters (empty) | AI prompt still sent; Sheet `Message` column is blank |
| **Message** | > 10 000 characters | Gemini API may truncate or refuse; fallback triggered; logged |

### 4.2 API & Network Boundaries

| Scenario | Expected Behaviour |
|----------|--------------------|
| Gemini API quota exhausted (429) | Non-200 response detected; fallback email sent; error logged |
| Gemini API timeout (> 30 s) | `UrlFetchApp` throws `Exception`; caught; fallback sent |
| Gemini API returns empty `candidates` array | Script detects missing text; fallback triggered |
| No internet (Apps Script sandbox offline) | `UrlFetchApp` throws; fallback sent; error logged |

### 4.3 Sheet Boundaries

| Scenario | Expected Behaviour |
|----------|--------------------|
| Sheet is empty (no header row) | Row appended at row 1; headers absent — human must verify columns |
| Sheet is protected / read-only | `appendRow` throws; execution log captures error; email may still be sent |
| Sheet has extra columns inserted | Column indices shift — **logging will be wrong**; script must be updated |

### 4.4 Trigger Boundaries

| Scenario | Expected Behaviour |
|----------|--------------------|
| Multiple triggers registered (duplicates from running `setupTrigger()` twice) | Each submission fires the handler multiple times → duplicate emails and rows. Run `setupTrigger()` only once; delete extras manually. |
| Apps Script 6-minute execution limit hit | Script terminated mid-run; email may or may not send; row may be incomplete |

---

## 5. How to Run `testSubmission()` Manually

> [!TIP]
> Use this workflow for every test cycle to avoid submitting real form entries or waiting for form events.

### Step-by-Step

1. **Open Apps Script editor**  
   In your Google Sheet → **Extensions → Apps Script**.

2. **Select the function**  
   In the toolbar dropdown (next to the ▶ Run button), select **`testSubmission`**.

3. **Authorise (first run only)**  
   Click ▶ **Run**. If a permissions dialog appears, click **Review Permissions → Allow**.

4. **Modify test data (optional)**  
   Before running, edit the fake event object inside `testSubmission()`:
   ```javascript
   var fakeEvent = {
     values: [
       new Date(),              // Timestamp (auto, leave as-is)
       "Your Test Name",        // Name  ← change here
       "youremail@gmail.com",   // Email ← use your own
       "9876543210",            // Phone
       "DSA Bootcamp",          // Interest
       "I want to crack FAANG." // Message
     ]
   };
   ```

5. **Run and observe**  
   Click ▶ **Run**. The function calls `onFormSubmit(fakeEvent)` directly.

6. **Check the Execution Log**  
   Click **Execution Log** (bottom panel) to see `Logger.log` output — API responses, errors, and status messages.

7. **Verify outputs**  
   - **Gmail inbox**: check for the email at the address in `fakeEvent.values[2]`.  
   - **Google Sheet**: scroll to the last row and verify all 9 columns.

8. **Reset between tests**  
   Delete the test row from the Sheet and the test email from Gmail before each new test run to keep results clean.

---

## 6. Known Limitations

> [!WARNING]
> The following limitations are inherent to the platform or current implementation. Plan workarounds before go-live.

| # | Limitation | Impact | Suggested Mitigation |
|---|------------|--------|----------------------|
| 1 | **Apps Script 6-minute execution limit** | Long AI responses or slow Gemini API calls may timeout, leaving incomplete log rows or unsent emails. | Monitor Execution Log; consider splitting logging and emailing if timeouts occur. |
| 2 | **No input validation on form fields** | Malformed emails, empty names, or garbage phone numbers are passed directly to the AI and GmailApp. | Add validation at the top of `onFormSubmit` before calling `callGeminiAPI`. |
| 3 | **API key stored in Script Properties (project-scoped)** | Anyone with editor access to the Apps Script project can read the key. | Restrict script access to owner only; rotate the key periodically. |
| 4 | **GmailApp daily quota (100 emails/day for free accounts)** | High form submission volume will exhaust Gmail quota; subsequent emails silently fail. | Monitor quota in Google Workspace dashboard; upgrade to Workspace if volume exceeds limit. |
| 5 | **Gemini API cost / rate limits** | Each submission makes one API call; burst traffic may hit rate limits (429). | Add exponential backoff retry logic inside `callGeminiAPI`. |
| 6 | **Single Sheet tab assumption** | `SpreadsheetApp.getActiveSheet()` logs to whichever tab is "active" at trigger time, which may not be the intended log tab. | Use `getSheetByName("Logs")` with an explicit sheet name instead. |
| 7 | **No duplicate-submission detection** | Resubmitting the same form or running `testSubmission()` repeatedly creates duplicate rows and sends duplicate emails. | Add deduplication by email+timestamp check before logging. |
| 8 | **Plain-text email only** | `GmailApp.sendEmail` with a plain body sends no HTML formatting. | Use the `htmlBody` option for richer branded emails. |
| 9 | **Trigger must be manually set up** | `setupTrigger()` must be run once per deployment; it is not automatic. | Document this in the deployment checklist; include it in onboarding notes. |
| 10 | **No test isolation** | `testSubmission()` writes to the live production Sheet and sends real emails to the test address. | Create a separate test Sheet and test Gmail alias for QA runs. |
