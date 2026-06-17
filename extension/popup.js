import { DEFAULT_API_BASE, getInspectableTarget, scanCurrentTarget } from "./popup-core.js";

const targetElement = document.getElementById("target");
const statusElement = document.getElementById("status");
const scanButton = document.getElementById("scan");
const resultElement = document.getElementById("result");
const dashboardLink = document.getElementById("dashboard");

let currentTarget = "";

function setStatus(message) {
  statusElement.textContent = message;
}

function setResult(message, tone = "warning") {
  resultElement.hidden = false;
  resultElement.className = `result ${tone}`;
  resultElement.textContent = message;
}

function clearResult() {
  resultElement.hidden = true;
  resultElement.className = "result";
  resultElement.textContent = "";
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function initializePopup() {
  dashboardLink.href = DEFAULT_API_BASE;

  try {
    const tab = await getActiveTab();
    const target = getInspectableTarget(tab);

    if (!target.ok) {
      currentTarget = "";
      targetElement.textContent = "Unavailable";
      scanButton.disabled = true;
      setStatus(target.message);
      setResult("Browser pages, extension pages, and empty tabs cannot be scanned.", "warning");
      return;
    }

    currentTarget = target.target;
    targetElement.textContent = currentTarget;
    scanButton.disabled = false;
    setStatus("Ready to scan with the authenticated dashboard backend.");
  } catch {
    currentTarget = "";
    targetElement.textContent = "Unavailable";
    scanButton.disabled = true;
    setStatus("Unable to read the active tab.");
    setResult("Reload the popup on a website tab and try again.", "error");
  }
}

scanButton.addEventListener("click", async () => {
  if (!currentTarget) {
    return;
  }

  scanButton.disabled = true;
  clearResult();
  setStatus(`Scanning ${currentTarget}...`);

  try {
    const result = await scanCurrentTarget({
      apiBase: DEFAULT_API_BASE,
      target: currentTarget
    });

    dashboardLink.href = result.reportUrl;

    if (!result.ok) {
      setStatus("Scan did not complete.");
      setResult(result.message, result.message.toLowerCase().includes("sign in") ? "warning" : "error");
      return;
    }

    setStatus("Scan complete.");
    setResult("Report saved to your dashboard history.", "success");
    dashboardLink.textContent = "Open full report";
  } catch {
    setStatus("Backend unavailable.");
    setResult("Start the dashboard backend, then try again.", "error");
    dashboardLink.href = DEFAULT_API_BASE;
  } finally {
    scanButton.disabled = false;
  }
});

initializePopup();
