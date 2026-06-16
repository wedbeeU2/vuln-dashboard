export type PortStatus = "open" | "closed" | "timeout" | "error";

export type PortResult = {
  port: number;
  service: string;
  status: PortStatus;
  detail?: string;
};

export type TlsResult = {
  checked: boolean;
  valid: boolean;
  subject?: string;
  issuer?: string;
  validFrom?: string;
  validTo?: string;
  daysUntilExpiration?: number;
  protocol?: string;
  cipher?: string;
  error?: string;
};

export type HeaderResult = {
  url: string;
  status?: number;
  present: Record<string, string>;
  missing: string[];
  warnings: string[];
  error?: string;
};

export type DnsResult = {
  records: Record<string, string[]>;
  errors: Record<string, string>;
};

export type SecurityReport = {
  target: string;
  normalizedTarget: string;
  scannedAt: string;
  riskScore: number;
  summary: string;
  ports: PortResult[];
  tls: TlsResult;
  headers: HeaderResult[];
  dns: DnsResult;
  recommendations: string[];
};
