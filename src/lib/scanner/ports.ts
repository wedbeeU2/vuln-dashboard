import net from "node:net";

import type { PortResult, PortStatus } from "@/types/report";
import { resolvePublicHost, type ResolvedPublicAddress } from "@/lib/scanner/resolve-public-host";

export type CommonPort = {
  port: number;
  service: string;
};

export const COMMON_PORTS: CommonPort[] = [
  { port: 21, service: "FTP" },
  { port: 22, service: "SSH" },
  { port: 25, service: "SMTP" },
  { port: 53, service: "DNS" },
  { port: 80, service: "HTTP" },
  { port: 110, service: "POP3" },
  { port: 143, service: "IMAP" },
  { port: 443, service: "HTTPS" },
  { port: 465, service: "SMTPS" },
  { port: 587, service: "SMTP submission" },
  { port: 993, service: "IMAPS" },
  { port: 995, service: "POP3S" },
  { port: 3306, service: "MySQL" },
  { port: 5432, service: "PostgreSQL" },
  { port: 6379, service: "Redis" },
  { port: 8080, service: "HTTP alternate" },
  { port: 8443, service: "HTTPS alternate" }
];

const DEFAULT_TIMEOUT_MS = 3000;
const DISALLOWED_PORT_DETAIL = "Port is not in the approved common-port list";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown scanner error";
}

function approvedPort(port: number) {
  return COMMON_PORTS.some((item) => item.port === port);
}

function statusForError(error: NodeJS.ErrnoException): PortStatus {
  if (error.message === "timeout") {
    return "timeout";
  }

  if (error.code === "ECONNREFUSED") {
    return "closed";
  }

  return "error";
}

function connectToAddress(address: ResolvedPublicAddress, port: number, timeoutMs: number) {
  return new Promise<void>((resolve, reject) => {
    const socket = net.createConnection({ host: address.address, port, family: address.family });

    const close = () => {
      socket.removeAllListeners();
      socket.destroy();
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => {
      close();
      resolve();
    });
    socket.once("timeout", () => {
      close();
      reject(new Error("timeout"));
    });
    socket.once("error", (error) => {
      close();
      reject(error);
    });
  });
}

async function checkPortAgainstAddresses(
  addresses: ResolvedPublicAddress[],
  port: number,
  service: string,
  timeoutMs: number
): Promise<PortResult> {
  let lastStatus: PortStatus = "error";
  let lastDetail = "No resolved addresses were available";

  for (const address of addresses) {
    try {
      await connectToAddress(address, port, timeoutMs);
      return { port, service, status: "open", detail: `Connected to ${address.address}` };
    } catch (error) {
      const status = statusForError(error as NodeJS.ErrnoException);
      lastStatus = status;
      lastDetail = errorMessage(error);

      if (status !== "closed" && status !== "timeout") {
        break;
      }
    }
  }

  return { port, service, status: lastStatus, detail: lastDetail };
}

export async function checkPort(
  host: string,
  port: number,
  service = "unknown",
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<PortResult> {
  if (!approvedPort(port)) {
    return { port, service, status: "error", detail: DISALLOWED_PORT_DETAIL };
  }

  try {
    const resolved = await resolvePublicHost(host);
    return checkPortAgainstAddresses(resolved.addresses, port, service, timeoutMs);
  } catch (error) {
    return { port, service, status: "error", detail: errorMessage(error) };
  }
}

export async function scanCommonPorts(host: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<PortResult[]> {
  let addresses: ResolvedPublicAddress[];

  try {
    addresses = (await resolvePublicHost(host)).addresses;
  } catch (error) {
    const detail = errorMessage(error);
    return COMMON_PORTS.map(({ port, service }) => ({ port, service, status: "error", detail }));
  }

  return Promise.all(
    COMMON_PORTS.map(({ port, service }) => checkPortAgainstAddresses(addresses, port, service, timeoutMs))
  );
}
