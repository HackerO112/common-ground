# Production readiness assessment

Status: **release blocked — critical security and privacy work required**.

## Verified from the current default branch
- React/TanStack frontend plus a standalone Express/SQLite backend and Cloudflare configuration.
- The backend uses a hardcoded fallback JWT secret, reflects arbitrary CORS origins with credentials, serves uploaded files publicly, and accepts uploads without a file-type allowlist.
- The app handles medicine schedules, dose logs, appointments, blood requests, donor information, phone numbers, and location data.
- The backend has a package lock; no test suite or security policy was found.

## Critical release blockers
1. Remove the fallback JWT secret; fail startup when a strong secret is absent in production. Rotate any secret that may have been used.
2. Replace permissive credentialed CORS with an explicit environment allowlist.
3. Audit every route for object-level authorization. Reservation release/collection, community issue moderation, upvotes, and public/private data boundaries need tests.
4. Restrict uploads by MIME and file signature, store outside the public web root, generate opaque names, and authorize access.
5. Add request validation, authentication rate limits, security headers, safe error responses, and request-size limits.
6. Protect sensitive health/contact/location data with minimization, explicit consent, retention/deletion controls, and a privacy review.
7. Add migration, backup/restore, concurrency, integration, and browser tests. Do not use demo credentials in a public deployment.

## Release gate
Do not deploy with real user data until independent security review and authorization tests pass. This report is based on source inspection and does not claim a penetration test.
