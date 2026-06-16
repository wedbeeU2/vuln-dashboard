# Security Scanner Dashboard

Security Scanner Dashboard is a full-stack security reporting app for public domains and IP addresses. The goal is to let authenticated users run real checks, review scan history, and export professional reports while keeping responsible-use controls built into the product.

The implementation currently includes the Next.js scaffold, Prisma data model, and Google OAuth foundation. Scanner execution, report rendering, PDF export, and the Chrome extension are planned next.

## Current Status

Completed:

- Next.js, TypeScript, Tailwind CSS, Vitest, and ESLint scaffold.
- Prisma schema for users, sessions, OAuth accounts, and scans.
- Google OAuth wiring with explicit environment validation.

Next planned work:

- Public target validation and private-network blocking.
- DNS, TLS, HTTP security header, and common-port scanner modules.
- Authenticated scan API routes.
- Dashboard, report view, scan history, and PDF export.
- Chrome Extension Manifest V3 companion popup.

## Planned Features

- Google OAuth user accounts.
- Real scans for public domains and public IP addresses.
- Common-port TCP checks.
- SSL/TLS certificate status.
- HTTP security header analysis.
- DNS record lookup.
- Per-user scan history.
- Structured security report pages.
- Export-to-PDF reports.
- Chrome extension that scans the current tab hostname through the backend.

## Tech Stack

- **Next.js + TypeScript** for the web app, API routes, and server-side rendering.
- **PostgreSQL + Prisma** for relational data modeling and persistence.
- **Auth.js / NextAuth** with Google OAuth for user accounts.
- **Node.js scanner modules** for DNS, TLS, HTTP header, and TCP port checks.
- **Tailwind CSS** for a clean security-operations dashboard UI.
- **Vitest** for unit tests around validation and report logic.
- **Chrome Extension Manifest V3** for the browser companion.
- **PDF rendering** planned with a server-side React PDF workflow.

## Architecture

The app uses one backend scanner engine with two clients:

- The **web app** is the main dashboard for scanning, reviewing reports, browsing history, and exporting PDFs.
- The **Chrome extension** is a lightweight companion that sends the current tab hostname to the backend.
- The **backend API** owns authentication, target validation, rate limiting, scanning, persistence, and report access.
- The **database** stores users, OAuth sessions, scan records, status, report JSON, and ownership boundaries.

Keeping scanning centralized on the backend prevents duplicated logic and lets the app enforce safety controls consistently.

## Responsible-Use Controls

This is dual-use security tooling, so guardrails are part of the core design:

- Sign-in required before scanning.
- Public targets only.
- Private, local, loopback, reserved, and internal ranges blocked.
- Common-port list only for v1.
- Short network timeouts.
- Per-user rate limiting.
- Scan history scoped to the authenticated owner.
- Responsible-use messaging in the UI and documentation.

## Local Setup

Install dependencies:

```bash
npm install
```

Create local environment variables:

```bash
cp .env.example .env.local
```

Fill in:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vuln_dashboard"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-random-secret"
GOOGLE_CLIENT_ID="replace-with-google-client-id"
GOOGLE_CLIENT_SECRET="replace-with-google-client-secret"
```

Generate Prisma Client:

```bash
npm run prisma:generate
```

Run the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Verification

Useful commands:

```bash
npm run lint
npm test
npm run build
```

The production build requires valid local OAuth environment variables because missing Google OAuth config intentionally fails loudly.
