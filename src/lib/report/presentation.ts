import type { DnsResult, HeaderResult, PortResult } from "@/types/report";

export type ReportTone = "secure" | "warn" | "critical" | "neutral";

export type DnsDisplayRow = {
  type: string;
  value: string;
  label?: string;
  tone?: ReportTone;
};

const RISKY_PORTS = new Set([21, 3306, 5432, 6379]);

export function isRiskyPort(port: number) {
  return RISKY_PORTS.has(port);
}

export function getPortStatusLabel(port: PortResult) {
  if (port.status === "open") {
    return isRiskyPort(port.port) ? "Exposed" : "Open";
  }

  if (port.status === "closed") {
    return "Closed";
  }

  if (port.status === "timeout") {
    return "Filtered / no response";
  }

  return "Probe error";
}

export function getPortStatusTone(port: PortResult): ReportTone {
  if (port.status === "open") {
    return isRiskyPort(port.port) ? "critical" : "secure";
  }

  if (port.status === "error") {
    return "warn";
  }

  return "neutral";
}

export function getPortDetail(port: PortResult) {
  if (!port.detail || port.detail === port.status || port.detail === "timeout") {
    return undefined;
  }

  return port.detail;
}

export function formatPortSummary(port: PortResult) {
  const detail = getPortDetail(port);
  return detail ? `${getPortStatusLabel(port)} - ${detail}` : getPortStatusLabel(port);
}

export function selectDisplayHeader(headers: HeaderResult[]) {
  return headers.find((header) => !header.error && header.status !== undefined) ?? headers[0];
}

export function isNoDnsRecordError(error: string | undefined) {
  return error?.includes("ENODATA") ?? false;
}

function getDnsStatus(error: string | undefined) {
  if (isNoDnsRecordError(error)) {
    return {
      label: "No record found",
      tone: "neutral" as const,
      value: "This hostname does not publish this DNS record type."
    };
  }

  if (error) {
    return {
      label: "Lookup unavailable",
      tone: "warn" as const,
      value: error
    };
  }

  return {
    label: "No record found",
    tone: "neutral" as const,
    value: "This hostname does not publish this DNS record type."
  };
}

export function getDnsRows(dns: DnsResult): DnsDisplayRow[] {
  const records = dns.records ?? {};
  const errors = dns.errors ?? {};
  const keys = Array.from(new Set([...Object.keys(records), ...Object.keys(errors)]));

  return keys.map((type) => {
    const values = records[type] ?? [];

    if (values.length > 0) {
      return { type, value: values.join(" | ") };
    }

    const status = getDnsStatus(errors[type]);
    return { type, ...status };
  });
}
