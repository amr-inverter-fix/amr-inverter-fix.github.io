# Release notes

## Release 1.0 - 2026-11-28 (build 2026-11-28-r20)
First numbered release. Versioning rule: Release 1.N, N goes up only when a day has real, tested changes. The build marker (date-rNN) is shown at the bottom of the site. Days without real changes get a maintenance entry in DAILY_DEVELOPMENT_LOG.md and no new release number.

1. New: camera and gallery reading inside the Capture tab; AI suggests the inverter brand as a button the user must press.
2. New: professional text report (PDF through the browser print), including the captured image and caption.
3. Fixed: results hidden on the Capture tab; layout overflow at 360px; page not scrolling (r16); blank report; print paths that printed the whole page.
4. Tests: 23 checks run, 22 passed, 1 failed (the layout bug, fixed and re-tested). See TEST_REPORT.md. Not tested: real phone, real inverter, browser print dialog on the owner's phone.
5. Database: unchanged, 1782 records, 43 brands, 237 records without a code, 6 duplicate brand+code groups.
6. Unresolved: Deye W-codes missing from the database; verification statuses not started; fault 39 on Axpert unknown.
7. Next: see ROADMAP.md.
