import { scanDns } from "@/lib/scanner/dns";
import { scanHeaders } from "@/lib/scanner/headers";
import { scanCommonPorts } from "@/lib/scanner/ports";
import { normalizeTarget } from "@/lib/scanner/target";
import { scanTls } from "@/lib/scanner/tls";
import { summarizeReport } from "@/lib/report/summary";
import type { SecurityReport } from "@/types/report";

export async function runSecurityScan(input: string): Promise<SecurityReport> {
  const target = normalizeTarget(input);
  const [dns, tls, headers, ports] = await Promise.all([
    scanDns(target.host),
    scanTls(target.host),
    scanHeaders(target.host),
    scanCommonPorts(target.host)
  ]);

  return summarizeReport({
    target: input,
    normalizedTarget: target.host,
    scannedAt: new Date().toISOString(),
    riskScore: 0,
    summary: "",
    ports,
    tls,
    headers,
    dns,
    recommendations: []
  });
}
