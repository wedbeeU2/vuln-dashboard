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

## Features

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

### Prerequisites

- Node.js 20 or newer. Node 22 is recommended.
- npm.
- PostgreSQL running locally or through Docker.
- A Google OAuth web client.

### 1. Install dependencies

Clone the repository, switch to the project directory, and install packages:

```bash
npm install
```

### 2. Create environment files

Copy the example env file for the Next.js dev server:

```bash
cp .env.example .env.local
```

The Prisma CLI reads `.env` by default, while Next.js loads `.env.local`. For the least surprising local setup, keep both files uncommitted:

```bash
cp .env.example .env
```

Fill in both files with local values:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vuln_dashboard"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-random-secret"
GOOGLE_CLIENT_ID="replace-with-google-client-id"
GOOGLE_CLIENT_SECRET="replace-with-google-client-secret"
SCAN_DNS_SERVERS="1.1.1.1,8.8.8.8"
```

Generate a random `NEXTAUTH_SECRET` with:

```bash
openssl rand -base64 32
```

On Windows PowerShell, this Node.js one-liner works too:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Configure Google OAuth

Create an OAuth 2.0 Client ID in Google Cloud Console:

- Application type: **Web application**
- Authorized JavaScript origin: `http://localhost:3000`
- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

Put the generated client ID and client secret into `.env.local` and `.env`.

### 4. Start PostgreSQL

Any local PostgreSQL instance works as long as `DATABASE_URL` points at it.

Docker example:

```bash
docker run --name vuln-dashboard-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=vuln_dashboard \
  -p 5432:5432 \
  -d postgres:17
```

If you already have Postgres installed locally, create the database manually:

```bash
createdb vuln_dashboard
```

### 5. Apply database migrations

```bash
npm run prisma:migrate
npm run prisma:generate
```

### 6. Run the app

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Sign in with Google before scanning. User accounts, OAuth sessions, scan history, and report ownership are stored in Postgres.

## Demo Workflow

Use this flow to verify the project locally or record a showcase video:

1. Start Postgres and the Next.js dev server.
2. Open `http://localhost:3000`.
3. Sign in with Google.
4. Run a scan for `scanme.nmap.org`.
5. Open the completed report.
6. Review open ports, TLS status, HTTP security headers, DNS records, recommendations, and raw technical details.
7. Export the report to PDF.
8. Open History, search for `scanme`, and verify the saved scan appears.
9. Load the Chrome extension locally and run a scan from a public website tab.

`scanme.nmap.org` is intended for light scan testing. Keep usage limited and do not use this tool against assets you do not own or have permission to assess.

## Chrome Extension

The companion extension lives in `extension/`. It reads the current website tab hostname and sends it to the same authenticated backend scanner API used by the web dashboard. The current extension build is local-first and points at `http://localhost:3000`.

Local loading:

1. Run the web app at `http://localhost:3000`.
2. Sign in to the dashboard.
3. Open Chrome extensions and enable Developer mode.
4. Choose "Load unpacked".
5. Select the `extension` folder.
6. Open a public website tab and run the popup scan.

Browser pages, extension pages, and empty tabs are not scanned. Backend validation still blocks private, local, reserved, and malformed targets.

## Troubleshooting

### Google redirects back with `error=Callback`

Check that Postgres is running and reachable through `DATABASE_URL`. NextAuth uses the database adapter, so OAuth cannot complete unless users, accounts, and sessions can be persisted.

### Google shows `redirect_uri_mismatch`

Add this exact redirect URI to the Google OAuth web client:

```text
http://localhost:3000/api/auth/callback/google
```

Also confirm:

```bash
NEXTAUTH_URL="http://localhost:3000"
```

### Prisma cannot find environment variables

Next.js loads `.env.local`; Prisma CLI commands load `.env` by default. Keep an ignored `.env` file for local Prisma commands or export `DATABASE_URL` in the shell before running migrations.

### Prisma cannot connect to `localhost:5432`

Start Postgres, verify the database exists, and confirm the connection string:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vuln_dashboard"
```

### DNS records show unavailable locally

Some local environments point Node's DNS resolver at `127.0.0.1`, which may refuse record-specific lookups. Keep this fallback resolver setting in your env:

```bash
SCAN_DNS_SERVERS="1.1.1.1,8.8.8.8"
```

### Chrome extension says backend unavailable

Make sure the dashboard is running at `http://localhost:3000` and that you are signed in to the web app in the same Chrome profile.

## Verification

Useful commands:

```bash
npm run lint
npm test
npm run build
```

The production build requires valid local OAuth environment variables because missing Google OAuth config intentionally fails loudly.
