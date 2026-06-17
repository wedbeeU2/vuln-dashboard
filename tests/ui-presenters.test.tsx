import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "@/components/app/status-badge";
import { RiskMeter } from "@/components/security/risk-meter";
import {
  filterScans,
  formatScanDate,
  getRiskTone,
  getStatusMeta,
  normalizeScanStatus
} from "@/lib/ui/scan-presenters";

describe("scan UI presenters", () => {
  it("normalizes known and unknown scan statuses", () => {
    expect(normalizeScanStatus("completed")).toBe("completed");
    expect(normalizeScanStatus("RUNNING")).toBe("running");
    expect(normalizeScanStatus("failed")).toBe("failed");
    expect(normalizeScanStatus("anything-else")).toBe("queued");
  });

  it("maps status values to non-color-only labels and icons", () => {
    expect(getStatusMeta("completed")).toMatchObject({ label: "Completed", icon: "check" });
    expect(getStatusMeta("failed")).toMatchObject({ label: "Failed", icon: "x" });
    expect(getStatusMeta("queued")).toMatchObject({ label: "Queued", icon: "clock" });
  });

  it("maps risk scores to secure, warn, and critical tones", () => {
    expect(getRiskTone(0)).toBe("secure");
    expect(getRiskTone(24)).toBe("secure");
    expect(getRiskTone(25)).toBe("warn");
    expect(getRiskTone(59)).toBe("warn");
    expect(getRiskTone(60)).toBe("critical");
    expect(getRiskTone(101)).toBe("critical");
  });

  it("filters scans by status and case-insensitive target search", () => {
    const scans = [
      { id: "1", normalizedTarget: "example.com", target: "example.com", status: "completed" },
      { id: "2", normalizedTarget: "api.example.com", target: "api.example.com", status: "failed" },
      { id: "3", normalizedTarget: "openai.com", target: "openai.com", status: "running" }
    ];

    expect(filterScans(scans, { q: "EXAMPLE", status: "all" }).map((scan) => scan.id)).toEqual(["1", "2"]);
    expect(filterScans(scans, { q: "", status: "failed" }).map((scan) => scan.id)).toEqual(["2"]);
    expect(filterScans(scans, { q: "missing", status: "all" })).toEqual([]);
  });

  it("formats scan dates without throwing on missing values", () => {
    expect(formatScanDate(new Date("2026-06-16T12:00:00.000Z"))).toContain("2026");
    expect(formatScanDate(null)).toBe("Not completed");
  });
});

describe("security UI primitives", () => {
  it("renders status badge text with an accessible label", () => {
    const html = renderToStaticMarkup(<StatusBadge status="completed" />);

    expect(html).toContain("Completed");
    expect(html).toContain("aria-label=\"Status: Completed\"");
  });

  it("clamps and labels risk meter values", () => {
    const html = renderToStaticMarkup(<RiskMeter score={120} />);

    expect(html).toContain("100");
    expect(html).toContain("High attention");
    expect(html).toContain("aria-label=\"Risk score 100 of 100");
  });
});
