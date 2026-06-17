# Security Scanner Companion Extension

This Manifest V3 extension reads the current tab hostname and sends it to the local Security Scanner backend at `http://localhost:3000`.

The extension does not scan locally. It relies on the authenticated backend so target validation, rate limiting, scan history, and report ownership stay centralized.

The current extension build is local-first. It has host permissions for:

- `http://localhost:3000/*`
- `http://127.0.0.1:3000/*`

## Local Loading

1. Run the web app at `http://localhost:3000`.
2. Sign in to the dashboard with Google.
3. Open Chrome extensions.
4. Enable Developer mode.
5. Choose "Load unpacked".
6. Select this `extension` folder.
7. Open a public website tab and use the extension popup to scan the hostname.

## Local Demo Flow

1. Open a public website tab.
2. Open the Security Scanner extension popup.
3. Confirm the popup shows the current tab hostname.
4. Click "Scan current domain".
5. Open the saved report in the dashboard.

## Notes

- Browser pages such as `chrome://extensions` are not scanned.
- Private, local, reserved, and malformed targets are still blocked by the backend.
- If the popup says the backend is unavailable, start the web app and try again.
- Production extension distribution will need the API base URL and `host_permissions` updated for the deployed dashboard domain.
