# Security Scanner Dashboard

Security Scanner Dashboard is a full-stack security reporting app for public domains and IP addresses. Authenticated users can run real checks, review scan history, open structured reports, and export PDF summaries while responsible-use controls stay built into the product.

## Current Status

Completed:

- Next.js, TypeScript, Tailwind CSS, Vitest, and ESLint scaffold.
- Prisma schema for users, sessions, OAuth accounts, and scans.
- Google OAuth wiring with explicit environment validation.
- Public target validation and private-network blocking.
- DNS, TLS, HTTP security header, and common-port scanner modules.
- Authenticated scan API routes with owner-scoped history and reports.
- Dashboard, report view, scan history, and PDF export.
- Chrome Extension Manifest V3 companion popup.

Next planned work:

- Deployment hardening and production operations polish.

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
- **React PDF** for server-side report export.

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
# Optional resolver override for DNS record lookups:
SCAN_DNS_SERVERS="1.1.1.1,8.8.8.8"
```

Create the database, apply migrations, and generate Prisma Client. The Prisma CLI reads `.env` by default, so either export `DATABASE_URL` in your shell or also keep an uncommitted `.env` file for CLI commands.

```bash
npm run prisma:migrate
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

## Chrome Extension

The companion extension lives in `extension/`. It reads the current website tab hostname and sends it to the same authenticated backend scanner API used by the web dashboard.

Local loading:

1. Run the web app at `http://localhost:3000`.
2. Sign in to the dashboard.
3. Open Chrome extensions and enable Developer mode.
4. Choose "Load unpacked".
5. Select the `extension` folder.
6. Open a public website tab and run the popup scan.

Browser pages, extension pages, and empty tabs are not scanned. Backend validation still blocks private, local, reserved, and malformed targets.

## Verification

Useful commands:

```bash
npm run lint
npm test
npm run build
```

The production build requires valid local OAuth environment variables because missing Google OAuth config intentionally fails loudly.
