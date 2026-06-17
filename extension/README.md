# Security Scanner Companion Extension

This Manifest V3 extension reads the current tab hostname and sends it to the local Security Scanner backend at `http://localhost:3000`.

The extension does not scan locally. It relies on the authenticated backend so target validation, rate limiting, scan history, and report ownership stay centralized.

## Local Loading

1. Run the web app at `http://localhost:3000`.
2. Sign in to the dashboard with Google.
3. Open Chrome extensions.
4. Enable Developer mode.
5. Choose "Load unpacked".
6. Select this `extension` folder.
7. Open a public website tab and use the extension popup to scan the hostname.

## Notes

- Browser pages such as `chrome://extensions` are not scanned.
- Private, local, reserved, and malformed targets are still blocked by the backend.
- If the popup says the backend is unavailable, start the web app and try again.
