# Deploying the Website Portal (`/web`) & Web App Backend
**Anantam Career Academy · Complete Step-by-Step Deployment Guide**

This guide walks you through connecting the front-end web portal (`/web`) to your live Google Apps Script backend and publishing the site to the internet.

---

## Part 1: Add Script Properties in Google Apps Script

Your backend needs two credentials to operate securely: the Gemini AI key and a shared website token.

1. Open your linked Google Sheet $\rightarrow$ click top menu: **Extensions $\rightarrow$ Apps Script**.
2. In the left sidebar of the Apps Script editor, click the **Project Settings** icon (the gear ⚙ icon near the bottom).
3. Scroll down to the **Script Properties** section and click **Add script property**.
4. Add the first property:
   - **Property:** `GEMINI_KEY`
   - **Value:** Paste your Google AI Studio API key (starts with `AQ...` or `AIza...`).
5. Click **Add script property** again to add the second property:
   - **Property:** `WEB_TOKEN`
   - **Value:** Type a custom secret passphrase (e.g. `anantam_web_secure_token_2026`).
6. Click **Save script properties**.

> [!IMPORTANT]
> The property names must match exactly: `GEMINI_KEY` and `WEB_TOKEN` (case-sensitive, no spaces).

---

## Part 2: Deploy as a Google Apps Script Web App

1. Look at the top right of the Apps Script editor and click the blue **Deploy** button.
2. From the dropdown menu, select **New deployment**.
3. In the modal that appears, look for **Select type** on the left. Click the **gear icon ⚙** next to "Select type" and choose **Web app**.
4. Configure the settings **exactly** as follows:
   - **Description:** `Anantam Web Portal Backend v1`
   - **Execute as:** `Me (your-email@gmail.com)` *(Crucial: This lets the script use your permissions to send emails and write to the sheet).*
   - **Who has access:** `Anyone` *(Crucial: This allows prospects on the website to submit leads without needing a Google sign-in).*
5. Click the blue **Deploy** button.
6. If prompted with **"Authorization required"**:
   - Click **Authorize access**.
   - Select your Google Account.
   - If you see *"Google hasn't verified this app"*, click **Advanced** (bottom left), then click **Go to Untitled project (unsafe)**.
   - Review permissions (Gmail, Spreadsheets, External URL) and click **Allow**.
7. Once deployed, Google will show you the **Web app URL**.
   - It will look like: `https://script.google.com/macros/s/AKfycbx.../exec`
   - Click **Copy** next to the Web app URL and save it in a notepad.

> [!CAUTION]
> Make sure the copied URL ends with `/exec` (NOT `/dev`). The `/dev` URL is only for testing within your own signed-in account and will fail for outside users.

---

## Part 3: Redeploying Code Changes Without Breaking Your URL

Whenever you edit `Code.gs` in the future, you must update the deployment so Google serves the latest version.

### ⚠️ Common Mistake: Creating "New deployment" Every Time
If you click **Deploy $\rightarrow$ New deployment** every time you change your code, Google generates a **brand-new URL**. You would have to update `config.js` and re-upload your website every single time!

### ✅ The Correct Way (Keeps Your URL Constant):
1. In Apps Script, click the blue **Deploy** button $\rightarrow$ select **Manage deployments**.
2. In the left panel, select your active deployment (e.g. *Web app*).
3. In the top right of the modal, click the **pencil icon ✏️ (Edit)**.
4. Under **Version**, click the dropdown and choose **New version**.
5. *(Optional)* Add a brief description (e.g. *"Updated email prompt"*).
6. Click **Deploy**.
7. Click **Done**.

Your live Web App is now running your newest code, and the Web App URL remains **100% identical**!

---

## Part 4: Connect the Local Website (`config.js`)

Now connect your website to your newly deployed backend:

1. Open your project folder on your computer: `d:\PPS Anantams project\web\`.
2. Duplicate or copy `config.example.js` and rename the copy to:
   ```
   config.js
   ```
3. Open `config.js` in your code editor and update the fields:
   ```javascript
   window.CONFIG = {
     // Paste your copied Web app URL ending in /exec:
     WEB_APP_URL: "https://script.google.com/macros/s/AKfycbx.../exec",

     // Must match the exact value of WEB_TOKEN from Script Properties:
     WEB_TOKEN: "anantam_web_secure_token_2026",

     // Change MOCK to false to connect to the live Google Apps Script backend:
     MOCK: false
   };
   ```
4. Save the file.

---

## Part 5: Test Locally

1. Open PowerShell or Terminal in your project directory and run:
   ```bash
   python -m http.server 8000 --directory "d:\PPS Anantams project\web"
   ```
2. Open **`http://localhost:8000`** in your browser.
3. Check the badge in the top right:
   - If configured correctly, it should now display a green badge: **Live Web App Mode**.
4. Go to the **Capture Lead** tab, fill out a real test inquiry with your own email, and submit.
5. Verify:
   - The AI generates the reply and displays it on screen with the score badge.
   - An email arrives in your inbox.
   - A new row is appended to your Google Sheet with `Source: Website` and `Channel: Email` (or `WhatsApp`).
   - The **Leads Sheet** tab fetches and displays the new lead.

---

## Part 6: Publishing `/web` to the Internet

Because `/web` consists of vanilla HTML, CSS, and JS (no build tools or Node.js server needed), you can host it for free on GitHub Pages or Netlify.

### Option A: Publish via Netlify Drop (Fastest — 30 Seconds)
1. Go to **[app.netlify.com/drop](https://app.netlify.com/drop)** (no account required for instant preview, or sign up for free).
2. Drag and drop your entire `d:\PPS Anantams project\web` folder onto the browser window.
3. Netlify will deploy it instantly and give you a live production URL (e.g. `https://anantam-academy.netlify.app`).
4. Test the live link from your phone or another computer!

### Option B: Publish via GitHub Pages
1. Create a repository on GitHub (e.g. `anantam-lead-portal`).
2. Push your project files to GitHub.
3. In your GitHub repository $\rightarrow$ click **Settings** tab.
4. In the left sidebar, click **Pages**.
5. Under **Build and deployment $\rightarrow$ Branch**:
   - Select your branch (e.g. `main`).
   - Select folder: `/web` (or root if you moved the web files to root).
   - Click **Save**.
6. In a few moments, GitHub will give you a public URL (e.g. `https://yourusername.github.io/anantam-lead-portal/`).

---

## 🔒 Security Notes (Why This Architecture is Secure)

### 1. Why `WEB_TOKEN` is Public in the Front End
* In a client-side static web application (HTML/JS), any value included in JavaScript files (`config.js`) is visible in the browser's Developer Tools (`F12`).
* Therefore, `WEB_TOKEN` is designed as a **scoped, throwaway rate-limiting passphrase**:
  - It only grants permission to submit a lead to the Google Sheet or read the leads list.
  - It has **no administrative privileges** and cannot modify your Google account, delete rows, or view other spreadsheets.
  - Never reuse a master password, email password, or database credential for `WEB_TOKEN`.
  - If spam occurs, simply change `WEB_TOKEN` in Script Properties and update `config.js` in 10 seconds.

### 2. Why the Gemini API Key NEVER Goes in `/web`
* If you placed your Gemini API key inside `app.js` or `config.js`, anyone visiting your website could view page source, extract your key, and exhaust your paid AI quota or run unauthorized queries under your billing account.
* In our architecture, the browser **only communicates with Google Apps Script**. The Google Apps Script server then calls the Gemini API behind the scenes using `PropertiesService.getScriptProperties().getProperty("GEMINI_KEY")`.
* **Result:** The front-end user never sees, touches, or has access to your Gemini API key. Zero credentials are exposed!
