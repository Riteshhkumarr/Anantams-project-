# Sample Test Leads — Anantam Career Academy AI Lead Automation
**Form Scenarios & Website API Edge Cases · Expected Behaviour & Sheet Verification**

---

> [!NOTE]
> - **Form Leads (1–6):** Submit via the Google Form.
> - **Website Leads (W1–W7):** Submit via the `/web` portal (or send a POST request with `Content-Type: text/plain;charset=utf-8` to your Web App `/exec` URL).

---

# SECTION 1: Google Form Scenarios

## Lead 1 — Standard enquiry, full details
* **Name:** Priya Sharma | **Email:** `priya@example.com` | **Phone:** `9876543210` | **Interest:** Full Stack Web Development
* **Message:** I am a final-year CS student and want to get into a product company. I have done some HTML and CSS but never built a full project. How does your course help with placements?
* **Expected Behaviour:** Rich context, career goals clear $\rightarrow$ **Lead Score: Hot**. Email mentions project transition and interview prep.
* **Sheet Row:** `Channel: Form`, `Source: Google Form`, `Status: Sent-AI`, `Lead Score: Hot`.

## Lead 2 — Very short message
* **Name:** Arjun Mehta | **Email:** `arjun@example.com` | **Phone:** `9123456789` | **Interest:** DSA Bootcamp
* **Message:** interested
* **Expected Behaviour:** Minimal context $\rightarrow$ **Lead Score: Warm**. Clean email about DSA, no awkward echoes.
* **Sheet Row:** `Channel: Form`, `Source: Google Form`, `Status: Sent-AI`, `Lead Score: Warm`.

## Lead 3 — Angry / frustrated message
* **Name:** Rahul Verma | **Email:** `rahul@example.com` | **Phone:** `9988776655` | **Interest:** CAT/MBA Prep
* **Message:** I have wasted money on 3 coaching institutes already. Everyone promises the world and delivers nothing. Why should I trust you? I need actual results, not promises.
* **Expected Behaviour:** High intent, pain points expressed $\rightarrow$ **Lead Score: Hot**. Calm, empathetic, non-defensive tone.
* **Sheet Row:** `Channel: Form`, `Source: Google Form`, `Status: Sent-AI`, `Lead Score: Hot`.

## Lead 4 — Hinglish message
* **Name:** Sneha Kapoor | **Email:** `sneha@example.com` | **Phone:** `8877665544` | **Interest:** Data Science Pro
* **Message:** Bhai mujhe data science seekhni hai, kya course theek hai? Fees kitni hai aur placement milegi kya? Abhi job nahi hai toh jaldi chahiye.
* **Expected Behaviour:** Urgency recognized $\rightarrow$ **Lead Score: Hot**. Response is in fluent professional English without echoing slang.
* **Sheet Row:** `Channel: Form`, `Source: Google Form`, `Status: Sent-AI`, `Lead Score: Hot`.

## Lead 5 — Missing phone number
* **Name:** Kavya Nair | **Email:** `kavya@example.com` | **Phone:** *(blank)* | **Interest:** UPSC Foundation
* **Message:** I am preparing for UPSC 2026 and looking for a structured study plan with mentorship. I have already cleared Prelims once.
* **Expected Behaviour:** High commitment $\rightarrow$ **Lead Score: Hot**. Script does not crash; Phone column left empty.
* **Sheet Row:** `Channel: Form`, `Source: Google Form`, `Phone: ""`, `Status: Sent-AI`, `Lead Score: Hot`.

## Lead 6 — Very long message
* **Name:** Vikram Iyer | **Email:** `vikram@example.com` | **Phone:** `7766554433` | **Interest:** Full Stack Web Development
* **Message:** *(200-word detailed transition story)*
* **Expected Behaviour:** **Lead Score: Hot**. Response summarizes and remains strictly under 120 words.
* **Sheet Row:** `Channel: Form`, `Source: Google Form`, `Status: Sent-AI`, `Lead Score: Hot`.

---

# SECTION 2: Website API Edge Cases (`/web` & `doPost`)

## Lead W1 — Wrong or Missing Token
* **Payload:**
  ```json
  {
    "token": "INCORRECT_SECRET_123",
    "name": "Dev Test",
    "email": "dev@example.com",
    "interest": "DSA Bootcamp",
    "channel": "Email"
  }
  ```
* **Expected HTTP / UI Response:**
  - Status: `401 Unauthorized`
  - Body: `{"ok": false, "error": "Unauthorized: Missing or invalid token."}`
  - UI displays an error alert: *"Submission rejected: Unauthorized: Missing or invalid token."*
* **Sheet Output:** **Nothing is appended.** Zero unauthorized rows written to the Sheet.

---

## Lead W2 — Missing or Malformed Email on the Email Channel
* **Payload:**
  ```json
  {
    "token": "anantam_web_secure_token_2026",
    "name": "No Email User",
    "email": "invalid-email-format",
    "interest": "Full Stack Web Development",
    "channel": "Email",
    "source": "Website"
  }
  ```
* **Expected HTTP / UI Response:**
  - Status: `400 Bad Request`
  - Body: `{"ok": false, "error": "A valid email address is required for Email channel."}`
  - UI displays error: *"Please provide a valid email address."*
* **Sheet Output:** **Nothing is appended.** Protects your sheet from invalid contact data.

---

## Lead W3 — Over-Long Message (> 1,000 Characters)
* **Payload:**
  ```json
  {
    "token": "anantam_web_secure_token_2026",
    "name": "Spam Lead",
    "email": "spammer@example.com",
    "interest": "Data Science Pro",
    "message": "Lorem ipsum dolor sit amet... [1,050 characters repeating]",
    "channel": "Email",
    "source": "Website"
  }
  ```
* **Expected HTTP / UI Response:**
  - Status: `400 Bad Request`
  - Body: `{"ok": false, "error": "Message exceeds maximum length of 1,000 characters."}`
  - UI character counter shows red `1050/1000` and displays rejection alert.
* **Sheet Output:** **Nothing is appended.** Abuse protection prevents token quota exhaustion.

---

## Lead W4 — Duplicate Submission Within 5 Minutes
* **Scenario:** User double-clicks or submits the same enquiry twice in under 5 minutes:
  - **Submission 1 (12:00 PM):** `name: "Aman", email: "aman@example.com", message: "Placement batch details please"` $\rightarrow$ Succeeds (`ok: true`).
  - **Submission 2 (12:02 PM):** Same payload submitted again.
* **Expected HTTP / UI Response on Submission 2:**
  - Status: `400 Bad Request`
  - Body: `{"ok": false, "error": "Duplicate submission detected. Please wait 5 minutes."}`
  - UI displays error message without double-emailing the lead.
* **Sheet Output:** **Only 1 row exists.** The duplicate entry is suppressed.

---

## Lead W5 — AI Failure / Bad GEMINI_KEY (Fallback Verification)
* **Scenario:** In Apps Script Script Properties, `GEMINI_KEY` is temporarily changed to `INVALID_KEY`.
* **Payload:**
  ```json
  {
    "token": "anantam_web_secure_token_2026",
    "name": "Pooja Reddy",
    "email": "pooja@example.com",
    "phone": "9811223344",
    "interest": "CAT/MBA Prep",
    "message": "Need morning batch timing for CAT 2026.",
    "channel": "Email",
    "source": "Website"
  }
  ```
* **Expected HTTP / UI Response:**
  - Status: `200 OK`
  - Body:
    ```json
    {
      "ok": true,
      "score": "Unknown",
      "status": "Fallback used",
      "reply": "Hi Pooja,\n\nThank you for your interest in CAT/MBA Prep at Anantam Career Academy!..."
    }
    ```
  - Email sent to lead contains the pre-crafted fallback email template.
* **Sheet Output:**
  - `Source:` `Website`
  - `Status:` `Fallback used`
  - `Lead Score:` `Unknown`
  - `AI Response:` Fallback text body

---

## Lead W6 — Hinglish Message via Website
* **Payload:**
  ```json
  {
    "token": "anantam_web_secure_token_2026",
    "name": "Manish Gupta",
    "email": "manish@example.com",
    "phone": "9871112233",
    "interest": "Full Stack Web Development",
    "message": "Sir mera non-coding background hai, kya main web development seekh sakta hu? Placement support milega na?",
    "channel": "Email",
    "source": "Website"
  }
  ```
* **Expected HTTP / UI Response:**
  - Status: `200 OK`
  - Body: `{"ok": true, "score": "Hot", "status": "Sent-AI"}`
  - Generated email directly addresses the non-coding background with encouragement and outlines placement preparation in fluent professional English.
* **Sheet Output:**
  - `Source:` `Website`
  - `Lead Score:` `Hot`
  - `Status:` `Sent-AI`
  - `WhatsApp Link:` `https://wa.me/919871112233?text=...`

---

## Lead W7 — WhatsApp-Only Lead (No Email Provided)
* **Payload:**
  ```json
  {
    "token": "anantam_web_secure_token_2026",
    "name": "Rohan Das",
    "email": "",
    "phone": "9822334455",
    "interest": "DSA Bootcamp",
    "message": "Need weekend schedule on WhatsApp please.",
    "channel": "WhatsApp",
    "source": "Website"
  }
  ```
* **Expected HTTP / UI Response:**
  - Status: `200 OK` (passes validation because `channel === "WhatsApp"`)
  - Body: `{"ok": true, "score": "Hot", "status": "Sent-AI"}`
  - `MailApp.sendEmail` is **skipped** (no email to send).
  - Web UI generates a one-click WhatsApp button pointing to `https://wa.me/919822334455?text=...`.
* **Sheet Output:**
  - `Email:` `""`
  - `Channel:` `WhatsApp`
  - `Source:` `Website`
  - `Status:` `Sent-AI`
  - `WhatsApp Link:` Clickable link populated in Sheet.
