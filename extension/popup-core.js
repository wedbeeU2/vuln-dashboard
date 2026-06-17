export const DEFAULT_API_BASE = "http://localhost:3000";

export function getInspectableTarget(tab) {
  if (!tab?.url) {
    return {
      ok: false,
      message: "Open a public website tab before scanning."
    };
  }

  let url;
  try {
    url = new URL(tab.url);
  } catch {
    return {
      ok: false,
      message: "Open a public website tab before scanning."
    };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return {
      ok: false,
      message: "Open a public website tab before scanning."
    };
  }

  return {
    ok: true,
    target: url.hostname.toLowerCase()
  };
}

export function dashboardUrl(apiBase, scanId) {
  return `${apiBase.replace(/\/+$/, "")}/scans/${encodeURIComponent(scanId)}`;
}

export async function scanCurrentTarget({ apiBase = DEFAULT_API_BASE, fetchImpl = fetch, target }) {
  const base = apiBase.replace(/\/+$/, "");
  const response = await fetchImpl(`${base}/api/extension/scan`, {
    body: JSON.stringify({ target }),
    credentials: "include",
    headers: { "content-type": "application/json" },
    method: "POST"
  });
  const payload = await response.json().catch(() => ({}));

  if (response.status === 401) {
    return {
      ok: false,
      message: "Sign in to the dashboard, then try again from this popup.",
      reportUrl: base
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      message: typeof payload.error === "string" ? payload.error : "Scan failed.",
      reportUrl: base
    };
  }

  if (!payload.scan?.id) {
    return {
      ok: false,
      message: "The scan finished without a report link.",
      reportUrl: base
    };
  }

  return {
    ok: true,
    reportUrl: dashboardUrl(base, payload.scan.id),
    scanId: payload.scan.id
  };
}
