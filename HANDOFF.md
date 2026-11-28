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
- Release 1.3, build 2026-11-28-r23 (service worker inv-v82; verif.js holds the per-record verification state, regenerate it from the audit data when records change or after a fresh check; hash key = djb2 of brand|code|name; data files data.js..data5.js, data5 = Deye US/AM2). The checks workflow lists data files by name and does not include data5.js (db_check.js does load it; add it to the workflow when workflow edits are possible). Usage counter: anonymous random device ID, counts only, no IP or personal data, stored in KV namespace inverter-stats (binding STATS on the Worker); read at Worker /stats, shown on dev.html. Worker code is worker_v8.js in the repo root (no secrets); rollback is the previous Worker version in the Cloudflare dashboard Deployments tab. 23 checks run, 22 passed, 1 failed and fixed (TEST_REPORT.md).
- Database: 1782 records, 43 brands, 237 without a code, 6 duplicate groups (run node db_check.js). It must never drop below 1782 records.
- GitHub Actions `checks` (.github/workflows/check.yml) exists and passed on its first run.
- Reading: 18-photo regression 9 auto-correct, 0 wrong codes (INVERTER_FIX_TEST_REPORT.md).
- Capture tab: open camera or choose image, reading starts automatically, result and brand chooser inside the tab. Report (button, print, browser print) is one professional A4 text report.
- Not verified: owner's real phone for print and capture.

## Priorities
See ROADMAP.md. Next: verification statuses (Phase 3), database gaps from official manuals only, real-phone feedback from the owner, then Phases 4 to 7 of his upgrade directive and the final 12-point report.

## Release workflow (approved by the owner 2026-11-28 19:07): dev branch, then merge to main after tests
The live site is served from `main` only. Nothing reaches the live site except by a tested merge.
1. Work on branch `dev` (the upload page for it: https://github.com/amr-inverter-fix/amr-inverter-fix.github.io/upload/dev). Small commits.
2. On every push GitHub Actions runs `checks` (syntax check of all JS, `node db_check.js`; also daily 05:17 UTC). It must be green on the `dev` commit before merging. Read the result at /actions.
3. Functional tests before merging, run locally on the dev files (headless Chrome on the files, print-to-PDF, layout at 360px, regression logic). The Worker only answers the live site origin, so real AI reading tests run on the live site right after the merge, and a failure there means rollback.
4. Merge: open https://github.com/amr-inverter-fix/amr-inverter-fix.github.io/compare/main...dev, create a pull request (title = release and build), write the test numbers in the description, merge it. Never merge a red `checks` run or a change with a known critical bug.
5. After the merge (wait about 55 s for Pages): verify with fetch(..., {cache:'no-store'}) that app.js, sw.js and style.css match, check the build marker, run the live checks (clean load, tabs, print paths, one real AI read if the daily limit allows). Bump the service worker version and the build marker on every release.
6. Update DAILY_DEVELOPMENT_LOG.md, RELEASE_NOTES.md, TEST_REPORT.md, CHANGELOG.md, ROADMAP.md and dev-data.json on `dev` before the merge, with real numbers.

### Rollback
- Branch `stable-r20` is the frozen copy of the Release 1.0 / r20 state. After each good release, create a new `stable-<build>` branch from main (Branches page, New branch) and note it in RELEASE_NOTES.md.
- To roll back: open the merged pull request and press Revert (creates a revert pull request), merge it, then verify the live site. If that is not possible, upload the files of the last stable branch to main through the upload page, bump the service worker version so phones reload.
- Never force-push or delete `main`.

### Other publishing notes
Cloud browser (config-h, saving cookies), upload page of the branch, set files via DataTransfer script, fill "Commit summary", Commit changes. Worker: Cloudflare dashboard edit-code page, paste code, Deploy (Worker changes are live at once; keep the previous Worker file for rollback).
