# Setup Guide — Anantam Career Academy AI Lead Automation
**Step-by-step deployment from zero to live trigger**

---

## Prerequisites

| Item | Requirement |
|---|---|
| Google Account | The account that will own the trigger and send emails |
| Gemini API Key | Obtain free from [aistudio.google.com](https://aistudio.google.com) → Get API key |
| Google Workspace / Gmail | Standard Gmail account is sufficient |

---

## Step 1 — Create the Google Form

1. Go to [forms.google.com](https://forms.google.com) → **Blank form**
2. Add **five questions** in this exact order:

| Question Label | Type |
|---|---|
| `Name` | Short answer |
| `Email` | Short answer |
| `Phone` | Short answer |
| `Interest` | Dropdown or Multiple choice — list the five courses |
| `Message` | Paragraph |

> [!IMPORTANT]
> The question labels must match exactly: `Name`, `Email`, `Phone`, `Interest`, `Message`.
> The script reads them via `e.namedValues["Label"]` — a mismatch means blank fields.

---

## Step 2 — Link a Google Sheet

1. In the Form editor → **Responses** tab → click the **Google Sheets icon** (Link to Sheets)
2. Choose **Create a new spreadsheet** → name it (e.g. `Anantam Leads`)
3. The Sheet now auto-receives form responses in columns A–E

---

## Step 3 — Open the Script Editor

1. In the linked Google Sheet → **Extensions → Apps Script**
2. The editor opens with a default `Code.gs` file

---

## Step 4 — Add the Source Files

> [!TIP]
> You can paste all logic into a single `Code.gs` using the monolithic `LeadAutomation.gs` from the project root, **or** create separate files for each module (recommended for maintainability).

**Option A — Single file (quickest)**
- Delete the default `Code.gs` contents
- Paste the entire contents of `LeadAutomation.gs` from the project root
- Save (Ctrl+S)

**Option B — Modular `/src` files**
- Rename the default file to `Config.gs` → paste `src/Config.gs`
- Click **+** (New File) for each additional file: `GeminiClient.gs`, `FallbackTemplate.gs`, `Mailer.gs`, `SheetLogger.gs`, `Code.gs`
- Paste the matching content from `/src/` into each file
- Save all

---

## Step 5 — Set the Gemini API Key

1. In the Apps Script editor → **Project Settings** (⚙ gear icon, left sidebar)
2. Scroll to **Script Properties** → **Add script property**
3. Property name: `GEMINI_API_KEY`  
   Value: paste your Gemini API key
4. Click **Save script properties**

> [!CAUTION]
> Never paste the API key directly into any `.gs` file. If the script is shared or exported, the key would be exposed.

---

## Step 6 — Run `setupTrigger()`

1. In the editor, select function **`setupTrigger`** from the function dropdown
2. Click **Run** ▶
3. When prompted, click **Review permissions** → **Allow**

**Permissions the script requests:**

| Permission | Why |
|---|---|
| Gmail — Send email on your behalf | `GmailApp.sendEmail()` |
| Google Sheets — View and manage spreadsheets | `SpreadsheetApp.getActiveSpreadsheet()` |
| External requests (UrlFetchApp) | Calling the Gemini API endpoint |

---

## Step 7 — Verify the Trigger

1. Left sidebar → **Triggers** (clock icon)
2. You should see: `onFormSubmit` | `From spreadsheet` | `On form submit`
3. If missing, re-run `setupTrigger()`

---

## Step 8 — Test End-to-End

**Option A — `testSubmission()` (no real form needed)**
1. Select function `testSubmission` in the dropdown → Run ▶
2. Change the `Email` value inside the function to your own inbox first
3. Check **Execution log** (View → Logs) for success messages
4. Check your inbox for the email
5. Check the Sheet for a new row in columns A–I

**Option B — Live form submission**
1. Open the Google Form preview link
2. Fill in all five fields → Submit
3. Verify email arrives and Sheet logs the row

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| No email received | Trigger not installed | Re-run `setupTrigger()` |
| Fallback email instead of AI | `GEMINI_API_KEY` wrong or missing | Check Script Properties |
| Sheet row missing | Active sheet is wrong sheet | Ensure the linked responses sheet is the active tab |
| `Exception: Address unavailable` | Email field blank or malformed | Check form field label spelling |
| Execution timeout | Very long Gemini response | Switch to `gemini-1.5-flash` in `Config.gs` (default) |
