# Release notes

## Release 1.1 - 2026-11-28 (build 2026-11-28-r21)
1. New: anonymous usage counter on dev.html: distinct devices, sessions (opens), diagnoses, photo reads, last 14 days. Random device ID only, counts only, no IP, no personal data, no visible change in the app.
2. Storage: free Cloudflare KV namespace "inverter-stats" bound to the existing Worker as STATS. No new account, no key, no cost. Worker /ping (POST) and /stats (GET) added; photo reads are counted by the Worker on a successful /read.
3. Limits: KV updates are not atomic, so a rare count can be lost. KV free tier is about 1000 writes per day. A device ID resets if the user clears browser data, so "devices" is approximate. /stats aggregate counts are publicly readable.
4. Tests: see TEST_REPORT.md. Not tested: real phone, real inverter.

## Release 1.0 - 2026-11-28 (build 2026-11-28-r20)
First numbered release. Versioning rule: Release 1.N, N goes up only when a day has real, tested changes. The build marker (date-rNN) is shown at the bottom of the site. Days without real changes get a maintenance entry in DAILY_DEVELOPMENT_LOG.md and no new release number.

1. New: camera and gallery reading inside the Capture tab; AI suggests the inverter brand as a button the user must press.
2. New: professional text report (PDF through the browser print), including the captured image and caption.
3. Fixed: results hidden on the Capture tab; layout overflow at 360px; page not scrolling (r16); blank report; print paths that printed the whole page.
4. Tests: 23 checks run, 22 passed, 1 failed (the layout bug, fixed and re-tested). See TEST_REPORT.md. Not tested: real phone, real inverter, browser print dialog on the owner's phone.
5. Database: unchanged, 1782 records, 43 brands, 237 records without a code, 6 duplicate brand+code groups.
6. Unresolved: Deye W-codes missing from the database; verification statuses not started; fault 39 on Axpert unknown.
7. Next: see ROADMAP.md.

## Stable branches
- stable-r21: to be created after Release 1.1 is verified live.
- stable-r20: Release 1.0, build 2026-11-28-r20 (rollback point).
