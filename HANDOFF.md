# Handoff for the daily development agent (updated 2026-11-28, Release 1.0, build r20)

Live site: https://amr-inverter-fix.github.io/ . Repo: amr-inverter-fix/amr-inverter-fix.github.io . Dashboard: /dev.html . Worker (image reading): https://inverter-vision.amr-abdelhamid-engineer.workers.dev (owner's Cloudflare account; the key lives only in the Worker settings and the vault, never print it).

## Mission (owner's standing spec, 2026-11-28 18:58 message)
Run a real daily development cycle: Analyze, Plan, Develop, Test, Fix, Validate, Release, Document. Not random edits. Work independently on safe engineering tasks. No fake tests, no fake releases, no empty commits. If a day has nothing worth releasing, do analysis, tests and maintenance and write a report saying so. Do not change things just to keep a schedule.

### Daily cycle
1. Analyze: read the code and the last release, check errors, load speed, mobile and desktop UX, database accuracy, previous test results.
2. Plan: pick 3 to 5 prioritized improvements, with files affected and success criteria. No cosmetic-only changes.
3. Develop in small steps. Areas: AI diagnosis engine (reading, confidence, no diagnosis on weak evidence), database (official sources only, source and page, no duplicates, brand/model/series link), diagnostic intelligence (probable vs confirmed cause, qualified technician warnings, no dangerous voltage instructions), user experience (Arabic/English, upload, history, mobile, offline messages), performance and reliability (service worker, caching, retry, fallback, no data loss).
4. Test after every change: syntax check, static check, functional, regression (18-photo set, ask the parent agent to resend the photos), API connectivity, image reading, database validation (node db_check.js), mobile layout, offline/caching when relevant, security/privacy. Add test cases for every new function. Record counts: run, passed, failed, percent, bugs found, fixes. Never claim a test that was not run. Never mix automated tests with real-device tests.
5. Release only if there are real, documented, tested changes: Release 1.N (N up by one), date, summary, added features, fixed bugs, test results, unresolved issues, database changes, next-day plan. Update DAILY_DEVELOPMENT_LOG.md, RELEASE_NOTES.md, TEST_REPORT.md, ROADMAP.md, CHANGELOG.md and dev-data.json (real numbers only).
6. Self review at the end: reading accuracy, diagnosis quality, database coverage, speed, stability, UI, security/privacy, test quality. Compare with the previous release. Say honestly if there was no real improvement.

### Constraints (must keep)
- Never delete the database or user data. Never invent codes, fixes, sources or test results. AI reads text only; diagnosis comes only from the evidence base. Unknown code: "not found" plus manual entry. Uncertain reading: "not sure" plus manual confirmation.
- No new API keys, no changes to secret settings, no paid costs or subscriptions, no new accounts without the owner's OK. Do not reduce security or privacy.
- Do not send user images to outside services without clear consent. Do not keep the owner's photos in any repo.
- Do not publish big untested changes. Ask the owner before any big or irreversible change.
- No visible mention of external AI providers anywhere in the site or the docs. Do not claim anything the app does not do.
- Worker daily AI-read limit is 150 per IP, temporary at the owner's request (original 30). Restore to 30 only when told, and report it. Do not change the Worker limits or model otherwise.
- Reports to the owner: short, Arabic, real numbers, tested vs not tested, real phone / real inverter never claimed.

## Where things stand
- Release 1.0, build 2026-11-28-r20 (service worker inv-v79). 23 checks run, 22 passed, 1 failed and fixed (TEST_REPORT.md).
- Database: 1782 records, 43 brands, 237 without a code, 6 duplicate groups (run node db_check.js). It must never drop below 1782 records.
- Reading: 18-photo regression 9 auto-correct, 0 wrong codes (INVERTER_FIX_TEST_REPORT.md).
- Capture tab: open camera or choose image, reading starts automatically, result and brand chooser inside the tab. Report (button, print, browser print) is one professional A4 text report.
- Not verified: owner's real phone for print and capture.

## Priorities
See ROADMAP.md. Next: verification statuses (Phase 3), database gaps from official manuals only, real-phone feedback from the owner, then Phases 4 to 7 of his upgrade directive and the final 12-point report.

## How the pieces are published
No dev branch yet: the site is served from main, so every publish is live. Rollback = re-publish the previous files (backups of each step are kept by the working agent) or revert the commit in the GitHub UI. Planned: a dev branch and pull-request review, which needs the owner's OK because it changes how publishing works.
Method: cloud browser (config-h, saving cookies), github.com upload page, set files via DataTransfer script, fill "Commit summary", Commit changes, wait about 55 s, verify with fetch(..., {cache:'no-store'}), then test the published site. Worker: Cloudflare dashboard edit-code page, paste code, Deploy. Bump the service worker version and the build marker on every release.
