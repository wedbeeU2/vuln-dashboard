export type ScanStatus = "completed" | "running" | "failed" | "queued";
export type StatusFilter = "all" | ScanStatus;
export type Tone = "secure" | "warn" | "critical" | "info" | "neutral";

export type ScanLike = {
  id: string;
  target: string;
  normalizedTarget: string;
  status: string;
};

export function normalizeScanStatus(status: string | null | undefined): ScanStatus {
  const normalized = status?.toLowerCase();

  if (normalized === "completed" || normalized === "running" || normalized === "failed") {
    return normalized;
  }

  return "queued";
}

export function getStatusMeta(status: string | null | undefined): {
  status: ScanStatus;
  label: string;
  tone: Tone;
  icon: "check" | "loader" | "x" | "clock";
} {
  const normalized = normalizeScanStatus(status);

  const map = {
    completed: { label: "Completed", tone: "secure", icon: "check" },
    running: { label: "Running", tone: "info", icon: "loader" },
    failed: { label: "Failed", tone: "critical", icon: "x" },
    queued: { label: "Queued", tone: "neutral", icon: "clock" }
  } as const;

  return { status: normalized, ...map[normalized] };
}

export function getRiskTone(score: number | null | undefined): Tone {
  const safeScore = Math.max(0, Math.min(score ?? 0, 100));

  if (safeScore >= 60) {
    return "critical";
  }

  if (safeScore >= 25) {
    return "warn";
  }

  return "secure";
}

export function getRiskLabel(score: number | null | undefined) {
  const tone = getRiskTone(score);

  if (tone === "critical") {
    return "High attention";
  }

  if (tone === "warn") {
    return "Review";
  }

  return "Low";
}

export function clampRiskScore(score: number | null | undefined) {
  return Math.max(0, Math.min(score ?? 0, 100));
}

export function displayTarget(scan: Pick<ScanLike, "target" | "normalizedTarget">) {
  return scan.normalizedTarget || scan.target || "Unknown target";
}

export function filterScans<T extends ScanLike>(
  scans: T[],
  filters: { q?: string | null; status?: StatusFilter | string | null }
) {
  const q = filters.q?.trim().toLowerCase() ?? "";
  const status = filters.status === "all" || !filters.status ? "all" : normalizeScanStatus(filters.status);

  return scans.filter((scan) => {
    const target = displayTarget(scan).toLowerCase();
    const matchesQuery = !q || target.includes(q);
    const matchesStatus = status === "all" || normalizeScanStatus(scan.status) === status;

    return matchesQuery && matchesStatus;
  });
}

export function countStatuses(scans: ScanLike[]): Record<StatusFilter, number> {
  return scans.reduce<Record<StatusFilter, number>>(
    (counts, scan) => {
      counts.all += 1;
      counts[normalizeScanStatus(scan.status)] += 1;
      return counts;
    },
    { all: 0, completed: 0, running: 0, failed: 0, queued: 0 }
  );
}

export function formatScanDate(date: Date | string | null | undefined) {
  if (!date) {
    return "Not completed";
  }

  const parsed = typeof date === "string" ? new Date(date) : date;

  if (Number.isNaN(parsed.getTime())) {
    return "Not completed";
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(parsed);
}
