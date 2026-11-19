// =============================================================================
// Anantam Career Academy — Lead Portal Controller (Vanilla JS)
// Zero external libraries · Mock Mode & Real API · Dark Mode · Accessible
// =============================================================================

// ── In-Memory State & Default Mock Configuration ──────────────────────────────
const State = {
  theme: localStorage.getItem("aca_theme") || "light",
  activeTab: "captureTab",
  leads: [],
  filteredLeads: [],
  selectedLead: null,
  isMock: true
};

// Realistic mock leads database matching test_leads.md
const MOCK_LEADS_STORE = [
  {
    "Time": new Date(Date.now() - 3600000 * 2).toISOString(),
    "Name": "Priya Sharma",
    "Email": "priya.sharma@example.com",
    "Phone": "9876543210",
    "Interest": "Full Stack Web Development",
    "Message": "Final-year CS student aiming for a product company. How does placement assistance work?",
    "Channel": "Email",
    "Lead Score": "Hot",
    "Status": "Sent-AI",
    "Source": "Website",
    "AI Response": "Hi Priya,\n\nThank you for reaching out to Anantam Career Academy!\n\nTransitioning from academic CS to shipping production web applications is an exciting step. In our Full Stack Web Development program, we focus on hands-on project architecture, code reviews, and comprehensive interview preparation.\n\nCould we schedule a quick 15-minute discovery call this week to map out your timeline?\n\nWarm regards,\nAnantam Career Academy Team"
  },
  {
    "Time": new Date(Date.now() - 3600000 * 5).toISOString(),
    "Name": "Rahul Verma",
    "Email": "rahul.v@example.com",
    "Phone": "9988776655",
    "Interest": "CAT/MBA Prep",
    "Message": "Wasted money on 2 institutes. Need actual results and rigorous mock analysis.",
    "Channel": "Email",
    "Lead Score": "Hot",
    "Status": "Sent-AI",
    "Source": "Form",
    "AI Response": "Hi Rahul,\n\nI appreciate your candor. You deserve transparent guidance and proven outcomes, not empty promises.\n\nOur CAT/MBA Prep curriculum prioritizes concept mastery, in-depth mock analytics, and mentor accountability to build real exam confidence.\n\nWould you be open to a 15-minute call this week to review your study plan?\n\nWarm regards,\nAnantam Career Academy Team"
  },
  {
    "Time": new Date(Date.now() - 3600000 * 12).toISOString(),
    "Name": "Arjun Mehta",
    "Email": "arjun.m@example.com",
    "Phone": "9123456789",
    "Interest": "DSA Bootcamp",
    "Message": "interested",
    "Channel": "WhatsApp",
    "Lead Score": "Warm",
    "Status": "Sent-AI",
    "Source": "Website",
    "AI Response": "Hi Arjun,\n\nThank you for exploring our DSA Bootcamp at Anantam Career Academy!\n\nWhether you are aiming for tech product interviews or strengthening problem-solving intuition, our structured curriculum covers patterns and algorithmic thinking step by step.\n\nCould we set up a quick 15-minute call this week to discuss where you'd like to begin?\n\nWarm regards,\nAnantam Career Academy Team"
  },
  {
    "Time": new Date(Date.now() - 3600000 * 24).toISOString(),
    "Name": "Sneha Kapoor",
    "Email": "sneha.k@example.com",
    "Phone": "8877665544",
    "Interest": "Data Science Pro",
    "Message": "Need urgent job switch to data science. What is the batch timing?",
    "Channel": "WhatsApp",
    "Lead Score": "Hot",
    "Status": "Sent-AI",
    "Source": "Website",
    "AI Response": "Hi Sneha,\n\nThank you for inquiring about our Data Science Pro program!\n\nTransitioning into data requires practical portfolio projects and clear career navigation. We offer flexible weekend and evening cohorts designed specifically for working switchers.\n\nCould we schedule a 15-minute call this week to review the batch schedule?\n\nWarm regards,\nAnantam Career Academy Team"
  },
  {
    "Time": new Date(Date.now() - 3600000 * 36).toISOString(),
    "Name": "Kavya Nair",
    "Email": "kavya.nair@example.com",
    "Phone": "",
    "Interest": "UPSC Foundation",
    "Message": "Cleared Prelims once. Need structured GS mentorship for 2026 attempt.",
    "Channel": "Email",
    "Lead Score": "Warm",
    "Status": "Sent-AI",
    "Source": "Form",
    "AI Response": "Hi Kavya,\n\nCongratulations on clearing Prelims previously — that demonstrates strong foundational dedication.\n\nOur UPSC Foundation program emphasizes answer-writing precision, high-yield current affairs synthesis, and mentor guidance for the 2026 cycle.\n\nWould you be open to a 15-minute consultation this week to review your optional and GS strategy?\n\nWarm regards,\nAnantam Career Academy Team"
  }
];

// ── Application Initialization ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  detectConfig();
  initTabs();
  initFormCapture();
  initLeadsSheet();
  initModal();
  loadLeads();
});

// ── Theme Management ─────────────────────────────────────────────────────────
function initTheme() {
  document.documentElement.setAttribute("data-theme", State.theme);
  updateThemeIcon();
  document.getElementById("themeToggle").addEventListener("click", () => {
    State.theme = State.theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", State.theme);
    localStorage.setItem("aca_theme", State.theme);
    updateThemeIcon();
  });
}

function updateThemeIcon() {
  const icon = document.querySelector(".theme-icon");
  if (icon) icon.textContent = State.theme === "dark" ? "☀️" : "🌙";
}

// ── Config & Environment Detection ───────────────────────────────────────────
function detectConfig() {
  const badge = document.getElementById("envIndicator");
  const cfg = window.CONFIG;

  if (cfg && cfg.MOCK === false && cfg.WEB_APP_URL && !cfg.WEB_APP_URL.includes("YOUR_DEPLOYMENT_ID")) {
    State.isMock = false;
    badge.textContent = "Live Web App Mode";
    badge.className = "env-badge live";
  } else {
    State.isMock = true;
    badge.textContent = "Mock Mode Active";
    badge.className = "env-badge mock";
  }
}

// ── Navigation Tabs ──────────────────────────────────────────────────────────
function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.tab;
      switchTab(targetId);
    });
  });
}

function switchTab(tabId) {
  State.activeTab = tabId;
  document.querySelectorAll(".tab-btn").forEach(b => {
    const isTarget = b.dataset.tab === tabId;
    b.classList.toggle("active", isTarget);
    b.setAttribute("aria-selected", isTarget ? "true" : "false");
  });

  document.querySelectorAll(".tab-panel").forEach(p => {
    p.classList.toggle("active", p.id === tabId);
  });

  if (tabId === "sheetTab") renderLeadsTable();
  if (tabId === "dashTab") renderDashboard();
}

// ── Tab 1: Lead Capture & Response ───────────────────────────────────────────
function initFormCapture() {
  const form = document.getElementById("leadCaptureForm");
  const msgInput = document.getElementById("leadMessage");
  const charCount = document.getElementById("charCount");
  const submitBtn = document.getElementById("submitLeadBtn");
  const alertBox = document.getElementById("captureAlert");

  msgInput.addEventListener("input", () => {
    charCount.textContent = msgInput.value.length;
    if (msgInput.value.length > 1000) {
      charCount.style.color = "#dc2626";
    } else {
      charCount.style.color = "inherit";
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert();

    const name = document.getElementById("leadName").value.trim();
    const email = document.getElementById("leadEmail").value.trim();
    const phone = document.getElementById("leadPhone").value.trim();
    const interest = document.getElementById("leadInterest").value;
    const message = msgInput.value.trim();
    const channel = form.querySelector('input[name="channel"]:checked').value;

    // Client-side validations
    if (!name) return showAlert("Please enter the lead's full name.", "error");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return showAlert("Please provide a valid email address.", "error");
    }
    if (!interest) return showAlert("Please select a course of interest.", "error");
    if (message.length > 1000) return showAlert("Message exceeds 1,000 characters.", "error");

    // UI Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = "<span>⏳ Contacting Gemini & Processing...</span>";

    const payload = {
      token: (window.CONFIG && window.CONFIG.WEB_TOKEN) || "anantam_web_secure_token_2026",
      name,
      email,
      phone,
      interest,
      message,
      channel,
      source: "Website"
    };

    try {
      let result;
      if (State.isMock) {
        result = await mockSubmitLead(payload);
      } else {
        result = await liveSubmitLead(payload);
      }

      if (result.ok) {
        displayAIOutput({
          name,
          email,
          phone,
          interest,
          score: result.score || "Hot",
          reply: result.reply,
          status: result.status || "Sent-AI"
        });
        showAlert("Lead successfully processed and recorded!", "success");
        form.reset();
        charCount.textContent = "0";
      } else {
        showAlert("Submission rejected: " + (result.error || "Unknown error"), "error");
      }
    } catch (err) {
      handleRequestError(err);
    } finally {
      // Guarantee button is never left disabled
      submitBtn.disabled = false;
      submitBtn.innerHTML = "<span>Generate AI Response & Submit</span>";
    }
  });

  // Action Buttons
  document.getElementById("btnOpenMail").addEventListener("click", () => {
    if (!State.selectedLead) return;
    const subject = encodeURIComponent("Your " + State.selectedLead.interest + " Journey — Anantam Career Academy");
    const body = encodeURIComponent(document.getElementById("editableReply").value);
    window.open(`mailto:${State.selectedLead.email}?subject=${subject}&body=${body}`, "_blank");
  });

  document.getElementById("btnOpenWa").addEventListener("click", () => {
    if (!State.selectedLead) return;
    const phone = normalisePhone(State.selectedLead.phone);
    if (!phone) {
      showToast("No valid phone number available for WhatsApp.");
      return;
    }
    const text = encodeURIComponent(document.getElementById("editableReply").value);
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  });

  document.getElementById("btnCopyReply").addEventListener("click", () => {
    const text = document.getElementById("editableReply").value;
    navigator.clipboard.writeText(text).then(() => {
      showToast("Response text copied to clipboard!");
    });
  });
}

function displayAIOutput(lead) {
  State.selectedLead = lead;
  document.getElementById("previewEmptyState").style.display = "none";
  document.getElementById("previewContent").style.display = "block";

  const scoreBadge = document.getElementById("scoreBadge");
  scoreBadge.textContent = lead.score + (lead.score === "Hot" ? " 🔥" : lead.score === "Warm" ? " ⚡" : " ❄️");
  scoreBadge.className = "score-badge " + lead.score;

  const statusPill = document.getElementById("responseStatus");
  statusPill.textContent = lead.status;
  statusPill.className = "status-pill " + (lead.status.toLowerCase().includes("fallback") ? "fallback" : "sent-ai");

  document.getElementById("targetContact").textContent = lead.email;
  document.getElementById("editableReply").value = lead.reply;
}

function showAlert(msg, type) {
  const box = document.getElementById("captureAlert");
  box.textContent = msg;
  box.className = "alert-box " + type;
  box.style.display = "block";
}

function hideAlert() {
  document.getElementById("captureAlert").style.display = "none";
}

// ── Tab 2: Leads Sheet & Filtering ───────────────────────────────────────────
function initLeadsSheet() {
  document.getElementById("leadSearchInput").addEventListener("input", applyFilters);
  document.getElementById("scoreFilter").addEventListener("change", applyFilters);
  document.getElementById("sourceFilter").addEventListener("change", applyFilters);
  document.getElementById("btnRefreshLeads").addEventListener("click", () => {
    loadLeads(true);
  });
}

async function loadLeads(showFeedback = false) {
  const statusEl = document.getElementById("tableStatus");
  statusEl.textContent = "Fetching leads from backend...";

  try {
    if (State.isMock) {
      await new Promise(r => setTimeout(r, 400));
      State.leads = [...MOCK_LEADS_STORE];
    } else {
      const cfg = window.CONFIG;
      const url = `${cfg.WEB_APP_URL}?token=${encodeURIComponent(cfg.WEB_TOKEN)}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const resp = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!resp.ok) throw new Error(`HTTP ${resp.status}: Could not fetch leads`);
      const data = await resp.json();
      if (!data.ok) throw new Error(data.error || "Failed to load leads");
      State.leads = data.leads || [];
    }

    applyFilters();
    renderDashboard();
    if (showFeedback) showToast("Leads refreshed successfully!");
  } catch (err) {
    statusEl.textContent = "Failed to load leads: " + err.message;
    showToast("Error loading leads: " + err.message);
  }
}

function applyFilters() {
  const query = document.getElementById("leadSearchInput").value.toLowerCase().trim();
  const scoreFilter = document.getElementById("scoreFilter").value;
  const sourceFilter = document.getElementById("sourceFilter").value;

  State.filteredLeads = State.leads.filter(lead => {
    const name = String(lead.Name || "").toLowerCase();
    const email = String(lead.Email || "").toLowerCase();
    const interest = String(lead.Interest || "").toLowerCase();
    const msg = String(lead.Message || "").toLowerCase();
    const score = String(lead["Lead Score"] || "");
    const src = String(lead.Source || "");

    const matchesQuery = !query || name.includes(query) || email.includes(query) || interest.includes(query) || msg.includes(query);
    const matchesScore = scoreFilter === "ALL" || score === scoreFilter;
    const matchesSource = sourceFilter === "ALL" || src.toLowerCase().includes(sourceFilter.toLowerCase());

    return matchesQuery && matchesScore && matchesSource;
  });

  renderLeadsTable();
}

function renderLeadsTable() {
  const tbody = document.getElementById("leadsTableBody");
  const statusEl = document.getElementById("tableStatus");
  tbody.innerHTML = "";

  if (State.filteredLeads.length === 0) {
    statusEl.textContent = "No matching leads found.";
    return;
  }

  statusEl.textContent = `Showing ${State.filteredLeads.length} of ${State.leads.length} leads.`;

  State.filteredLeads.forEach(lead => {
    const tr = document.createElement("tr");
    const score = lead["Lead Score"] || "Unknown";
    const status = lead.Status || "Sent";
    const dateStr = formatDate(lead.Time || lead.Timestamp);

    tr.innerHTML = `
      <td>${dateStr}</td>
      <td><strong>${escapeHtml(lead.Name || "Anonymous")}</strong></td>
      <td>${escapeHtml(lead.Email || "")}<br><small style="color:var(--text-muted)">${escapeHtml(lead.Phone || "-")}</small></td>
      <td>${escapeHtml(lead.Interest || "General")}</td>
      <td><span class="status-pill">${escapeHtml(lead.Source || "Form")}</span></td>
      <td><span class="score-badge ${score}">${score}</span></td>
      <td><span class="status-pill ${status.toLowerCase().includes("fallback") ? "fallback" : "sent-ai"}">${status}</span></td>
      <td><button class="btn btn-secondary btn-icon" style="padding:0.3rem 0.6rem;font-size:0.8rem;">Open</button></td>
    `;

    tr.addEventListener("click", () => openDetailModal(lead));
    tbody.appendChild(tr);
  });
}

// ── Tab 3: Dashboard Analytics (Pure CSS Bars) ────────────────────────────────
function renderDashboard() {
  const total = State.leads.length;
  let hot = 0, warm = 0, cold = 0;
  const interestCounts = {};
  const sourceCounts = {};

  State.leads.forEach(l => {
    const score = l["Lead Score"] || "Unknown";
    if (score === "Hot") hot++;
    else if (score === "Warm") warm++;
    else if (score === "Cold") cold++;

    const interest = l.Interest || "Other";
    interestCounts[interest] = (interestCounts[interest] || 0) + 1;

    const src = l.Source || "Google Form";
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });

  document.getElementById("kpiTotal").textContent = total;
  document.getElementById("kpiHot").textContent = hot;
  document.getElementById("kpiWarm").textContent = warm;
  document.getElementById("kpiCold").textContent = cold;

  renderBarChart("chartInterest", interestCounts, total);
  renderBarChart("chartSource", sourceCounts, total);
}

function renderBarChart(containerId, countMap, total) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (total === 0) {
    container.innerHTML = `<div style="color:var(--text-muted);font-size:0.85rem;">No data available yet.</div>`;
    return;
  }

  const sortedKeys = Object.keys(countMap).sort((a, b) => countMap[b] - countMap[a]);

  sortedKeys.forEach(label => {
    const count = countMap[label];
    const pct = Math.round((count / total) * 100);

    const row = document.createElement("div");
    row.className = "chart-bar-row";
    row.innerHTML = `
      <div class="chart-bar-header">
        <span>${escapeHtml(label)}</span>
        <span>${count} (${pct}%)</span>
      </div>
      <div class="chart-bar-track">
        <div class="chart-bar-fill" style="width: ${pct}%;"></div>
      </div>
    `;
    container.appendChild(row);
  });
}

// ── Modal Handling ───────────────────────────────────────────────────────────
function initModal() {
  const modal = document.getElementById("detailModal");
  const closeBtn = document.getElementById("modalCloseBtn");

  closeBtn.addEventListener("click", () => modal.style.display = "none");
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  document.getElementById("modalOpenEmail").addEventListener("click", () => {
    if (!State.activeModalLead) return;
    const l = State.activeModalLead;
    const subject = encodeURIComponent("Your " + l.Interest + " Journey — Anantam Career Academy");
    const body = encodeURIComponent(document.getElementById("mResponseText").value);
    window.open(`mailto:${l.Email}?subject=${subject}&body=${body}`, "_blank");
  });

  document.getElementById("modalOpenWa").addEventListener("click", () => {
    if (!State.activeModalLead) return;
    const l = State.activeModalLead;
    const phone = normalisePhone(l.Phone);
    if (!phone) return showToast("No valid phone number for WhatsApp.");
    const body = encodeURIComponent(document.getElementById("mResponseText").value);
    window.open(`https://wa.me/${phone}?text=${body}`, "_blank");
  });

  document.getElementById("modalCopy").addEventListener("click", () => {
    const text = document.getElementById("mResponseText").value;
    navigator.clipboard.writeText(text).then(() => showToast("Copied to clipboard!"));
  });
}

function openDetailModal(lead) {
  State.activeModalLead = lead;
  document.getElementById("modalLeadTitle").textContent = lead.Name || "Lead Details";
  document.getElementById("mEmail").textContent = lead.Email || "-";
  document.getElementById("mPhone").textContent = lead.Phone || "-";
  document.getElementById("mInterest").textContent = lead.Interest || "-";
  document.getElementById("mScore").textContent = lead["Lead Score"] || "Unknown";
  document.getElementById("mSource").textContent = lead.Source || "-";
  document.getElementById("mStatus").textContent = lead.Status || "-";
  document.getElementById("mInquiry").textContent = lead.Message || "(No message provided)";
  document.getElementById("mResponseText").value = lead["AI Response"] || "";

  document.getElementById("detailModal").style.display = "flex";
}

// ── Networking & Mock Processing ─────────────────────────────────────────────
async function mockSubmitLead(lead) {
  // Simulate 900ms server network latency
  await new Promise(r => setTimeout(r, 900));

  const firstName = lead.name.split(" ")[0];
  const isHighIntent = (lead.message && (lead.message.includes("placement") || lead.message.includes("urgent") || lead.message.includes("job")));
  const score = isHighIntent ? "Hot" : "Warm";

  const aiReply = `Hi ${firstName},\n\nThank you for reaching out to Anantam Career Academy!\n\nWe would be thrilled to support your journey in ${lead.interest}. Our hands-on curriculum, dedicated mentorship, and placement preparation are built to help learners excel in real-world environments.\n\nCould we schedule a quick 15-minute call this week to go over your goals?\n\nWarm regards,\nAnantam Career Academy Team`;

  const newEntry = {
    "Time": new Date().toISOString(),
    "Name": lead.name,
    "Email": lead.email,
    "Phone": lead.phone,
    "Interest": lead.interest,
    "Message": lead.message,
    "Channel": lead.channel,
    "Lead Score": score,
    "Status": "Sent-AI",
    "Source": "Website",
    "AI Response": aiReply
  };

  MOCK_LEADS_STORE.unshift(newEntry);
  State.leads = [...MOCK_LEADS_STORE];
  applyFilters();
  renderDashboard();

  return { ok: true, score, reply: aiReply, status: "Sent-AI" };
}

async function liveSubmitLead(lead) {
  const cfg = window.CONFIG;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

  const response = await fetch(cfg.WEB_APP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8" // text/plain prevents CORS preflight in Google Apps Script
    },
    body: JSON.stringify(lead),
    signal: controller.signal
  });
  clearTimeout(timeoutId);

  if (!response.ok) {
    if (response.status === 401) throw new Error("Unauthorized: Invalid WEB_TOKEN specified.");
    if (response.status === 429) throw new Error("Server is currently busy. Please retry.");
    throw new Error(`HTTP ${response.status} from Google Apps Script endpoint.`);
  }

  const result = await response.json();
  if (result.ok) {
    // Refresh leads table in background
    setTimeout(() => loadLeads(), 1000);
  }
  return result;
}

function handleRequestError(err) {
  let msg = err.message || "An unexpected error occurred.";
  if (err.name === "AbortError") {
    msg = "Request timed out after 20 seconds. Please check your network connection.";
  } else if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
    msg = "Network connection failure. Verify that your Google Apps Script Web App URL is accessible and deployed to 'Anyone'.";
  }
  showAlert(msg, "error");
}

// ── Utility Helpers ──────────────────────────────────────────────────────────
function normalisePhone(phone) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return "91" + digits;
  if (digits.length === 11 && digits.startsWith("0")) return "91" + digits.substring(1);
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

function formatDate(isoStr) {
  if (!isoStr) return "-";
  try {
    const d = new Date(isoStr);
    return isNaN(d.getTime()) ? isoStr : d.toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return isoStr;
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}

function showToast(msg) {
  const toast = document.getElementById("toastNotification");
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3500);
}
