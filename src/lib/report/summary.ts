import type { SecurityReport } from "@/types/report";

const RISKY_PORT_RECOMMENDATIONS = new Map<number, string>([
  [21, "Review exposed FTP access and prefer secure transfer methods."],
  [3306, "Review exposed MySQL access and restrict it to trusted networks."],
  [5432, "Review exposed PostgreSQL access and restrict it to trusted networks."],
  [6379, "Review exposed Redis access and restrict it to trusted networks."]
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
      riskScore += 35;
      recommendations.add(riskyRecommendation);
    } else {
      riskScore += 8;
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

  const missingHeaders = report.headers.flatMap((header) => header.missing.map(normalizeHeaderName));

  riskScore += Math.min(missingHeaders.length * 5, 30);

  if (missingHeaders.includes("content-security-policy")) {
    recommendations.add(CSP_RECOMMENDATION);
  }

  if (missingHeaders.includes("strict-transport-security")) {
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
