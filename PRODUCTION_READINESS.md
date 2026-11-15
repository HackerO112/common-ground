# Production readiness assessment

Status: **release blocked — critical security and privacy work required**.

## Verified from the current default branch
- React/TanStack frontend plus a standalone Express/SQLite backend and Cloudflare configuration.
- The backend uses a hardcoded fallback JWT secret, reflects arbitrary CORS origins with credentials, serves uploaded files publicly, and accepts uploads without a file-type allowlist.
- The app handles medicine schedules, dose logs, appointments, blood requests, donor information, phone numbers, and location data.
- The backend has a package lock; no test suite or security policy was found.

## Critical release blockers
1. Configure a unique JWT_SECRET of at least 32 characters; the API now fails closed when it is absent. Rotate any secret that may have been used previously.
2. Configure CORS_ORIGINS with exact deployed frontend origins; the API no longer reflects arbitrary origins.
3. Complete route-by-route object-level authorization review. Issue status changes are now restricted to the reporter; add tests for every resource ownership boundary.
4. Uploads are limited to JPEG/PNG/WebP MIME types and 5 MB; file signatures are now checked before a URL is returned. Files are still served from a public uploads path. Decide which images are intentionally public, add access controls for private material, and consider storage outside the web root.
5. Add authentication rate limits, comprehensive request validation, database transactions for state changes, and structured monitoring. Error responses no longer expose raw exception messages.
6. Protect sensitive health/contact/location data with minimization, explicit consent, retention/deletion controls, and a privacy review.
7. Add migration, backup/restore, concurrency, integration, and browser tests. Do not use demo credentials in a public deployment.

## Release gate
Do not deploy with real user data until independent security review and authorization tests pass. This report is based on source inspection and does not claim a penetration test.
