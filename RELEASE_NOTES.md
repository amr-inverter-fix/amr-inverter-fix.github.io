# Release notes

## Release 1.2 - 2026-11-28 (build 2026-11-28-r22)
1. New: Deye US/AM2 series (SUN-8/10/12/15K-SG01HP3-US-AM2), 28 codes F01 to F64 from the official manual (2025-08-15), Chart 7-1. Source: https://www.deyeinverter.com/deyeinverter/2025/08/15/sun-8-15k-sg01hp3-us-am2_20250815.pdf . Added as a separate series; existing Deye records are not changed.
2. Changed: db_check separates Fault/Warning pairs (Axpert 01,02,03,04,07) from real duplicates. Now 1 real duplicate group (SolarEdge 2xE, two different texts, not merged) and 5 pairs.
3. Finding: the 237 records without a code are faults named but not numbered in the manuals (FoxESS, Delta, Solax G2, EPEVER UP and others). Not a defect.
4. Finding: Deye W-codes are not in the 5 official Deye manuals checked (SG04LP3-EU 2024, SG04LP3-AU 2022, SG05LP1-AU 2025, SG01LP1-AU 2025, SG01HP3-US-AM2 2025). Nothing added. Third-party lists were not used.
5. Tests: 7 checks, 7 passed. Not tested: real phone, real inverter, the full 18-photo regression (no Worker change).
6. Database: 1810 records, 44 brands.

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
- stable-r22: to be created after Release 1.2 is verified live.
- stable-r21: Release 1.1, build r21.
- stable-r20: Release 1.0, build 2026-11-28-r20 (rollback point).
