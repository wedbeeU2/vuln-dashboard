import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { HeaderResult, PortResult, SecurityReport } from "@/types/report";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    color: "#172033",
    fontFamily: "Helvetica",
    lineHeight: 1.45
  },
  eyebrow: {
    fontSize: 9,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 8
  },
  summary: {
    fontSize: 11,
    color: "#334155",
    marginBottom: 18
  },
  metaGrid: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    marginBottom: 18
  },
  metric: {
    flexGrow: 1,
    border: "1 solid #dbe3ef",
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#f8fafc"
  },
  metricLabel: {
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 4
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 700
  },
  section: {
    marginTop: 14,
    paddingTop: 12,
    borderTop: "1 solid #dbe3ef"
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 8
  },
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 4,
    borderBottom: "1 solid #eef2f7"
  },
  label: {
    color: "#475569",
    width: "34%"
  },
  value: {
    color: "#172033",
    width: "66%"
  },
  mono: {
    fontFamily: "Courier",
    fontSize: 9
  },
  badgeGood: {
    color: "#047857"
  },
  badgeWarn: {
    color: "#b45309"
  },
  badgeBad: {
    color: "#b91c1c"
  },
  listItem: {
    marginBottom: 5
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    color: "#94a3b8",
    fontSize: 8
  }
});

export function ReportPdf({ report }: { report: SecurityReport }) {
  const openPorts = report.ports.filter((port) => port.status === "open");
  const firstHeader = report.headers[0];

  return (
    <Document title={`Security report - ${report.normalizedTarget}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Security Scanner Dashboard</Text>
        <Text style={styles.title}>{report.normalizedTarget}</Text>
        <Text style={styles.summary}>{report.summary}</Text>

        <View style={styles.metaGrid}>
          <Metric label="Risk score" value={`${report.riskScore}/100`} />
          <Metric label="Open ports" value={`${openPorts.length}/${report.ports.length}`} />
          <Metric
            label="TLS"
            value={report.tls.error ? "Unavailable" : report.tls.valid ? "Valid" : "Invalid"}
          />
        </View>

        <Section title="Scan Overview">
          <DataRow label="Target" value={report.target} />
          <DataRow label="Normalized target" value={report.normalizedTarget} />
          <DataRow label="Scanned at" value={report.scannedAt} />
        </Section>

        <Section title="Open Ports">
          {report.ports.length === 0 ? (
            <Text>No common ports were checked.</Text>
          ) : (
            report.ports.map((port) => <PortRow key={port.port} port={port} />)
          )}
        </Section>

        <Section title="TLS Certificate">
          {report.tls.error ? (
            <DataRow label="Status" value={report.tls.error} />
          ) : (
            <>
              <DataRow label="Valid" value={report.tls.valid ? "Yes" : "No"} />
              <DataRow label="Issuer" value={report.tls.issuer ?? "Unavailable"} />
              <DataRow label="Subject" value={report.tls.subject ?? "Unavailable"} />
              <DataRow label="Valid until" value={report.tls.validTo ?? "Unavailable"} />
              <DataRow label="Protocol" value={report.tls.protocol ?? "Unavailable"} />
              <DataRow label="Cipher" value={report.tls.cipher ?? "Unavailable"} />
            </>
          )}
        </Section>

        <Section title="HTTP Security Headers">
          {!firstHeader ? (
            <Text>No HTTP header probe result was returned.</Text>
          ) : (
            <HeaderBlock header={firstHeader} />
          )}
        </Section>

        <Section title="DNS Records">
          {Object.entries(report.dns.records).map(([type, values]) => (
            <DataRow key={type} label={type} value={values.join(", ") || "Unavailable"} />
          ))}
          {Object.entries(report.dns.errors).map(([type, error]) => (
            <DataRow key={type} label={`${type} lookup`} value={error} />
          ))}
        </Section>

        <Section title="Recommendations">
          {report.recommendations.length === 0 ? (
            <Text>No urgent recommendations.</Text>
          ) : (
            report.recommendations.map((recommendation) => (
              <Text key={recommendation} style={styles.listItem}>
                - {recommendation}
              </Text>
            ))
          )}
        </Section>

        <Text style={styles.footer}>Generated by Security Scanner Dashboard. Scan only assets you own or have permission to assess.</Text>
      </Page>
    </Document>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function Section({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function DataRow({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, styles.mono]}>{String(value)}</Text>
    </View>
  );
}

function PortRow({ port }: { port: PortResult }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>
        {port.port} / {port.service}
      </Text>
      <Text style={[styles.value, port.status === "open" ? styles.badgeWarn : styles.badgeGood]}>
        {port.status}
        {port.detail ? ` - ${port.detail}` : ""}
      </Text>
    </View>
  );
}

function HeaderBlock({ header }: { header: HeaderResult }) {
  if (header.error) {
    return <DataRow label="Status" value={header.error} />;
  }

  return (
    <>
      <DataRow label="URL" value={header.url} />
      {Object.entries(header.present).map(([name, value]) => (
        <DataRow key={name} label={name} value={`Present: ${value}`} />
      ))}
      {header.missing.map((name) => (
        <DataRow key={name} label={name} value="Missing" />
      ))}
      {header.warnings.map((warning) => (
        <Text key={warning} style={[styles.listItem, styles.badgeBad]}>
          - {warning}
        </Text>
      ))}
    </>
  );
}
