# 🎬 AI Lead Automation — 3-Minute Video Demo Script
**Project:** Unified Multi-Channel AI Lead Automation  
**Presenter:** Developer | Yuga PMC Round 1 Evaluation  
**Total Target Duration:** ~3 Minutes (180 Seconds)  
**Security Note:** Keep all API keys and tokens completely hidden during recording.

---

## ⏱️ PART 1: The Core Google Form Flow (0:00 – 1:00)
*Target: ~60 Seconds · This is the core required flow.*

[ON SCREEN: Browser displaying the published Google Form: **"Anantam Career Academy — Enquiry Form"**.]

[NARRATOR:]
> "Hello! Coaching institutes lose up to 50% of their inquiries simply because manual follow-ups take hours. Today, I'm presenting our zero-server AI Lead Automation system that responds to leads within seconds of submission.
>
> Let's simulate a live student inquiry coming in right now."

[ON SCREEN: Live typing into the Google Form:]
- **Name:** `Priya Sharma`
- **Email:** `[your-real-test-email@gmail.com]` *(keep actual typing visible, no credentials shown)*
- **Phone:** `9876543210`
- **Interest:** `Full Stack Web Development`
- **Message:** `"I am a final-year CS student wanting placement assistance in product companies."`
[Click **Submit**.]

[NARRATOR:]
> "The moment Priya clicks Submit, Google Apps Script captures the form event, calls Gemini 2.0 Flash to evaluate her intent, and generates a personalized email. Let's see what Priya receives."

[ON SCREEN: Switch immediately to Gmail Inbox. A new email appears and is opened.]

[NARRATOR:]
> "Here it is in under 10 seconds. The email addresses Priya by name, specifically mentions her placement goals and background in CS, stays strictly under 120 words, and drives toward a 15-minute discovery call this week."

[ON SCREEN: Switch to Google Sheet (`Anantam Leads`). Highlight the new row.]

[NARRATOR:]
> "And back in our Google Sheet, the entire transaction is logged automatically: her details, the AI response, the status 'Sent-AI', her Lead Score classified as 'Hot', and a pre-filled WhatsApp link."

---

## ⏱️ PART 2: The Website Intake Flow (1:00 – 2:00)
*Target: ~60 Seconds · Demonstrating multi-channel landing page integration.*

[ON SCREEN: Switch browser to the Anantam Career Academy Web Portal (`http://localhost:8000` or deployed web URL). Show the clean landing page.]

[NARRATOR:]
> "In Phase 2, we expanded the system so website leads land in the exact same sheet without external servers or separate pipelines.
>
> Let's submit an inquiry from this prospective student on the website portal."

[ON SCREEN: Fill in the **Capture Lead** form on the web portal:]
- **Name:** `Rahul Verma`
- **Email:** `rahul.verma@example.com`
- **Phone:** `9988776655`
- **Interest:** `CAT/MBA Prep`
- **Message:** `"I need rigorous mock analytics and structured mentor feedback for CAT 2026."`
- **Channel Toggle:** `Email`
[Click **Generate AI Response & Submit**.]

[NARRATOR:]
> "The web app securely POSTs JSON to our Apps Script backend using a scoped verification token. The Gemini key never touches the browser."

[ON SCREEN: The response preview card animates on the right side of the screen.]

[NARRATOR:]
> "Instantly, our admissions team sees the intent score—'Hot 🔥'—and an editable draft of the generated reply. We have one-click shortcuts to open it in their email client, launch a normalized WhatsApp chat, or copy the text."

[ON SCREEN: Switch back to the Google Sheet. Highlight the newly appended row.]

[NARRATOR:]
> "In the exact same Google Sheet, we see Rahul's row logged seamlessly—this time with Source marked as 'Website'. Both channels are unified."

---

## ⏱️ PART 3: Real-Time Dashboard & 30-Day Plan (2:00 – 2:50)
*Target: ~50 Seconds · Analytics & Strategic Vision.*

[ON SCREEN: Switch to the **Dashboard** tab on the web portal. Show the KPI summary cards and the pure CSS bar charts updating in real time.]

[NARRATOR:]
> "Our admissions dashboard gives leadership instant visibility. Here we see real-time breakdowns of Hot, Warm, and Cold leads, course demand distribution, and channel acquisition without any heavy third-party BI tools."

[ON SCREEN: Switch to the **Leads Sheet** tab. Show the search bar filtering leads instantly, and click one row to open the response modal.]

[NARRATOR:]
> "Every lead is searchable, filterable, and accessible in one place.
>
> Looking ahead to our 30-day rollout plan: we will integrate WhatsApp Business Cloud API for automated conversational follow-ups, connect CRM webhooks, and implement 48-hour automated re-engagement triggers for unresponsive leads."

---

## ⏱️ OUTRO: Closing & Value (2:50 – 3:00)
*Target: ~10 Seconds.*

[ON SCREEN: Final slide / summary view showing the Anantam Career Academy portal and the Google Sheet side-by-side.]

[NARRATOR:]
> "From fragmented inboxes to instant, intelligent, multi-channel lead engagement—built entirely on Google's scalable cloud infrastructure. Thank you!"

[Fade to Black.]

---

*Total Script Word Count: ~480 words | Speaking Pace: ~160 words/min | Total Runtime: Exactly 3:00*
