import type { SecurityReport } from "@/types/report";

const STANDARD_WEB_PORTS = new Set([80, 443, 8080, 8443]);
const GENERIC_OPEN_SERVICE_SCORE = 8;
const MAX_HEADER_RISK_SCORE = 25;

const RISKY_PORT_RECOMMENDATIONS = new Map<number, string>([
  [21, "Review exposed FTP access and prefer secure transfer methods."],
  [3306, "Review exposed MySQL access and restrict it to trusted networks."],
  [5432, "Review exposed PostgreSQL access and restrict it to trusted networks."],
  [6379, "Review exposed Redis access and restrict it to trusted networks."]
]);

const RISKY_PORT_SCORES = new Map<number, number>([
  [21, 25],
  [3306, 35],
  [5432, 35],
  [6379, 35]
]);

const HEADER_RISK_SCORES = new Map<string, number>([
  ["content-security-policy", 8],
  ["strict-transport-security", 8],
  ["x-content-type-options", 4],
  ["x-frame-options", 3],
  ["referrer-policy", 2],
  ["permissions-policy", 1]
]);

const TLS_RENEWAL_RECOMMENDATION = "Renew or replace the TLS certificate.";
const CSP_RECOMMENDATION = "Add a Content-Security-Policy header to reduce script injection risk.";
const HSTS_RECOMMENDATION = "Add Strict-Transport-Security so browsers require HTTPS.";

function normalizeHeaderName(header: string) {
  return header.toLowerCase();
}

function summaryForRiskScore(riskScore: number) {
  if (riskScore >= 60) {
    return "High attention recommended. Several exposed services or configuration gaps were found.";
  }

  if (riskScore >= 25) {
    return "Review recommended. Some security improvements were identified.";
  }

  return "No urgent issues found in the v1 checks.";
}

export function summarizeReport(report: SecurityReport): SecurityReport {
  let riskScore = 0;
  const recommendations = new Set(report.recommendations);

  for (const port of report.ports) {
    if (port.status !== "open") {
      continue;
    }

    const riskyRecommendation = RISKY_PORT_RECOMMENDATIONS.get(port.port);

    if (riskyRecommendation) {
      riskScore += RISKY_PORT_SCORES.get(port.port) ?? 35;
      recommendations.add(riskyRecommendation);
    } else if (!STANDARD_WEB_PORTS.has(port.port)) {
      riskScore += GENERIC_OPEN_SERVICE_SCORE;
    } else {
      riskScore += 0;
    }
  }

  const isExpired =
    report.tls.daysUntilExpiration !== undefined && report.tls.daysUntilExpiration < 0;
  const expiresSoon =
    report.tls.daysUntilExpiration !== undefined && report.tls.daysUntilExpiration < 30;

  if (report.tls.checked && (!report.tls.valid || isExpired)) {
    riskScore += 30;
    recommendations.add(TLS_RENEWAL_RECOMMENDATION);
  } else if (report.tls.checked && expiresSoon) {
    riskScore += 15;
    recommendations.add(TLS_RENEWAL_RECOMMENDATION);
  }

  const missingHeaders = new Set(
    report.headers
    .filter((header) => !header.error && header.status !== undefined)
      .flatMap((header) => header.missing.map(normalizeHeaderName))
  );

  const headerRiskScore = Array.from(missingHeaders).reduce(
    (score, header) => score + (HEADER_RISK_SCORES.get(header) ?? 1),
    0
  );

  riskScore += Math.min(headerRiskScore, MAX_HEADER_RISK_SCORE);

  if (missingHeaders.has("content-security-policy")) {
    recommendations.add(CSP_RECOMMENDATION);
  }

  if (missingHeaders.has("strict-transport-security")) {
    recommendations.add(HSTS_RECOMMENDATION);
  }

  const boundedRiskScore = Math.min(riskScore, 100);

  return {
    ...report,
    riskScore: boundedRiskScore,
    summary: summaryForRiskScore(boundedRiskScore),
    recommendations: Array.from(recommendations)
  };
}
