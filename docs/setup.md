# Setup Guide — Anantam Career Academy AI Lead Automation
**Beginner-friendly · Exact menu names · No coding knowledge needed**

---

## Before You Start

You need three things ready before step 1:

| What | Where to get it |
|---|---|
| A Google account (Gmail) | Already have one — the same account will own the form, sheet, and script |
| A Gemini API key | Go to [aistudio.google.com](https://aistudio.google.com) → click **Get API key** → **Create API key** → copy it |
| The `Code.gs` file contents | Open `src/Code.gs` in this project and keep it in a text editor tab |

---

## Part 1 — Create the Google Form

**1.** Open [forms.google.com](https://forms.google.com) in your browser.

**2.** Click the large **+** button (Blank form).

**3.** Click **Untitled form** at the top and type:
```
Anantam Career Academy — Enquiry Form
```

**4.** The first question is already there. Click **Untitled Question**, type `Name`, and leave the type as **Short answer**.

**5.** Click **Add question** (the **+** circle in the floating right toolbar) and repeat for each field below — in this exact order:

| # | Label to type | Question type to select |
|---|---|---|
| 1 | `Name` | Short answer |
| 2 | `Email` | Short answer |
| 3 | `Phone` | Short answer |
| 4 | `Interest` | Short answer (or Dropdown if you want a fixed list) |
| 5 | `Message` | Paragraph |

> [!IMPORTANT]
> The question labels must be **exactly** `Name`, `Email`, `Phone`, `Interest`, `Message` — same capitalisation, no extra spaces. The script reads them by name.

**6.** (Optional but recommended) Click the **gear icon ⚙** at the top right → tick **Collect email addresses** → click **Save**. This validates email format before submission.

**7.** Click the **eye icon 👁** (Preview) to confirm all five questions appear. Close the preview tab.

---

## Part 2 — Link the Form to a Google Sheet

**8.** In the Form editor, click the **Responses** tab (next to Questions, at the top).

**9.** Click the **green Sheets icon** (Link to Sheets) on the right side.

**10.** A dialog appears. Select **Create a new spreadsheet**, name it:
```
Anantam Leads
```
Then click **Create**.

**11.** The Sheet opens automatically in a new tab. You will see Google has already created a row of headers matching your form fields, plus a **Timestamp** column in column A:

```
A: Timestamp  B: Name  C: Email  D: Phone  E: Interest  F: Message
```

Keep this tab open — you'll come back to it in the next part.

---

## Part 3 — Add the Five Write-Back Header Columns

The script writes AI results and communication links into columns G through K. You need to add headers there manually so the sheet is readable.

**12.** In the **Anantam Leads** sheet, click cell **G1** and type:
```
AI Response
```

**13.** Click cell **H1** and type:
```
Status
```

**14.** Click cell **I1** and type:
```
Sent At
```

**15.** Click cell **J1** and type:
```
Lead Score
```

**16.** Click cell **K1** and type:
```
WhatsApp Link
```

**17.** Click the **Save** icon or press **Ctrl + S**. Your header row now looks like:

```
A            B     C      D      E         F        G            H       I        J           K
Timestamp  Name  Email  Phone  Interest  Message  AI Response  Status  Sent At  Lead Score  WhatsApp Link
```

---

## Part 4 — Paste the Script into Apps Script

**17.** In the **Anantam Leads** sheet, click the menu **Extensions** → **Apps Script**.

A new tab opens — this is the Apps Script editor.

**18.** In the editor, you will see a file called **Code.gs** in the left panel with some default placeholder code inside.

**19.** Click inside the editor area, press **Ctrl + A** (select all), then press **Delete** to clear the default code.

**20.** Open `src/Code.gs` from this project, select all the text, copy it, and paste it into the Apps Script editor.

**21.** Click the **floppy disk icon 💾** (Save project) in the toolbar, or press **Ctrl + S**.

You should see the file name **Code.gs** in the left panel with no asterisk (the asterisk means unsaved).

---

## Part 5 — Add the Gemini API Key as a Script Property

> [!CAUTION]
> Never paste your API key directly into the code. Script Properties store it securely on Google's servers, invisible to anyone who views the script file.

**22.** In the Apps Script editor, click the **gear icon ⚙ Project Settings** in the left sidebar (second icon from the bottom).

**23.** Scroll down to the **Script Properties** section. Click **Add script property**.

**24.** Fill in the two fields:
- **Property** field: type exactly `GEMINI_KEY`
- **Value** field: paste your Gemini API key

**25.** Click **Save script properties**.

**26.** Click the **← back arrow** or the **editor icon `< >`** in the left sidebar to return to the code editor.

---

## Part 6 — Create the On-Form-Submit Trigger

**27.** In the Apps Script editor, click the **clock icon ⏰ Triggers** in the left sidebar (fourth icon).

**28.** Click the blue **+ Add Trigger** button in the bottom-right corner.

**29.** A dialog appears. Set each dropdown exactly as shown:

| Dropdown | Select |
|---|---|
| **Choose which function to run** | `onFormSubmit` |
| **Choose which deployment should run** | `Head` |
| **Select event source** | `From spreadsheet` |
| **Select event type** | `On form submit` |

**30.** Click **Save**.

**31.** Google will ask you to choose a Google account — select the same account you used to create the form and sheet.

**32.** A permissions screen appears listing what the script needs. Click **Advanced** (small grey text at the bottom), then **Go to Anantam Leads (unsafe)** — this label appears because the script isn't published to the Marketplace; it is safe.

**33.** Review the permissions list and click **Allow**:

| Permission | Why it's needed |
|---|---|
| Send email on your behalf | `MailApp.sendEmail()` sends the outreach email |
| View and manage spreadsheets | Reading form data and writing back AI results |
| Connect to an external service | `UrlFetchApp` calls the Gemini API |

**34.** You are returned to the Triggers page. You should see one trigger listed:
```
onFormSubmit  |  From spreadsheet  |  On form submit  |  Head
```

---

## Part 7 — Test It End to End

**35.** Go back to the **Google Form** tab and click the **eye icon 👁** (Preview form).

**36.** Fill in all five fields with realistic test data:
```
Name    : Priya Sharma
Email   : your-own-email@gmail.com    ← use a real inbox you can check
Phone   : 9876543210
Interest: Full Stack Web Development
Message : I'm a CS student looking for placement support.
```

**37.** Click **Submit**.

**38.** Check the **Anantam Leads** sheet — a new row should appear within 10–20 seconds with values in columns G (AI Response), H (Status), I (Sent At), and J (Lead Score).

**39.** Check your inbox for the outreach email.

---

## Troubleshooting — 5 Common Errors

---

### ❌ Error 1 — Permissions dialog never appeared / trigger has no permissions

**Symptom:** The trigger was saved but emails are not sent. In the Triggers panel, the trigger row shows a warning icon.

**Cause:** You saved the trigger without completing the Google permissions authorisation flow.

**Fix:**
1. In Apps Script → **Triggers** (clock icon)
2. Click the **three-dot menu ⋮** on the trigger row → **Edit trigger**
3. Click **Save** again — the permissions dialog will re-appear
4. Complete the sign-in and **Allow** steps (Part 6, steps 31–33)

---

### ❌ Error 2 — Trigger not firing (form submits but nothing happens in the sheet)

**Symptom:** A new row appears in the sheet when the form is submitted, but columns G–J stay blank.

**Cause (most likely):** The trigger is attached to the **wrong spreadsheet**, or the trigger was deleted.

**Fix:**
1. Apps Script → **Triggers** (clock icon) — check that a trigger for `onFormSubmit` exists and shows **From spreadsheet** / **On form submit**
2. If it's missing, go back to **Part 6** and re-create it
3. If the trigger exists, click the **three-dot menu ⋮** → **View executions** to see the error log

---

### ❌ Error 3 — Gemini API quota exceeded

**Symptom:** Emails arrive but Status column shows `Fallback used`. Execution logs say `Gemini HTTP 429`.

**Cause:** The free-tier Gemini API has rate limits (requests per minute and per day).

**Fix:**
- Wait a few minutes and re-submit the form — quota resets
- For higher volume, upgrade to a paid Gemini API plan at [aistudio.google.com](https://aistudio.google.com)
- The fallback email still delivers a professional message to the lead — no enquiry is lost

---

### ❌ Error 4 — Bad or missing API key (Status = "Fallback used", log says "GEMINI_KEY not set")

**Symptom:** Fallback email sent every time. Execution logs say `GEMINI_KEY not set in Script Properties` or `Gemini HTTP 400 / 401`.

**Cause:** The property name is wrong, the key was not saved, or the key has been revoked.

**Fix:**
1. Apps Script → **⚙ Project Settings** → **Script Properties**
2. Confirm the property name is exactly `GEMINI_KEY` (no spaces, correct capitalisation)
3. Confirm the value matches the key shown in [aistudio.google.com](https://aistudio.google.com) → **Get API key**
4. If the key was deleted or revoked there, generate a new one and update the property

---

### ❌ Error 5 — Column mismatch (AI results appear in the wrong columns)

**Symptom:** The sheet columns shift — for example, Lead Score ends up in column K instead of J, or AI Response overwrites the Message column.

**Cause:** The form has an extra field (or a differently ordered field), or the header row was inserted as an extra row, adding an offset.

**Fix — check the actual column layout:**
1. In the **Anantam Leads** sheet, confirm row 1 reads exactly:
   ```
   A: Timestamp  B: Name  C: Email  D: Phone  E: Interest  F: Message
   G: AI Response  H: Status  I: Sent At  J: Lead Score
   ```
2. If the form has extra questions not in the script, the write-back columns (G–J) shift right. Update the constants in `Code.gs`:
   ```js
   var COL_AI_RESPONSE = 7;  // change to match the actual column number
   var COL_STATUS      = 8;
   var COL_SENT_AT     = 9;
   var COL_LEAD_SCORE  = 10;
   ```
3. Count from A=1. The write-back column number = (number of form fields) + 2 (Timestamp + 1).

---

*Last updated: Yuga PMC Round 1 · Anantam Career Academy AI Lead Automation*
