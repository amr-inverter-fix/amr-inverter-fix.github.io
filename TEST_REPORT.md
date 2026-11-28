# Test Report (running log, real counts)

Release 1.0 (build 2026-11-28-r20), date 2026-11-28. Tester: the development agent (single operator, no independent review).

**Totals for this session: 23 checks run, 22 passed, 1 failed (96% passed).** The one failure is the 360px layout check that exposed the mobile overflow bug, fixed in r15 and re-tested.
The 18-photo regression counts as one suite check; its detail is in INVERTER_FIX_TEST_REPORT.md (9 of 18 photos read automatically and correctly, 0 wrong codes).

## NOT tested (do not read this report as proof of these)
- Owner's real phone, real camera capture, real touch input, 4G, slow-CPU phones, HEIC, other browsers.
- Any real inverter.
- Browser print dialog on the owner's phone (the print event was simulated by script).
- Most of the 43 brands in the database (no photos of them).
- Real AI reading for the r19 report test (the daily limit was used up; that test used a mocked reply for the read step only).

## Checks
| Build | Check | Kind | Result |
|---|---|---|---|
| r7 | 12.4MB 4000x5333 image read through the Worker | automated, desktop Chrome, published site | pass |
| r8-11 | camera-tab flow: read, brand chosen, diagnosis inside the camera tab | automated | pass |
| r12 | result element visible on the camera tab (root-cause check) | automated | pass |
| r14 | 18-photo regression (suite): 0 wrong codes, 9 read automatically, 2 via chooser, 6 no automatic code | automated, owner photos not stored | pass |
| r14 | device suggestion button (Deye) shows and diagnosis says no match for a code not in the DB | automated | pass |
| r15 | 360px layout BEFORE fix: button row overflowed | iframe 360px emulation | fail |
| r15 | 360px layout AFTER fix: scrollWidth = clientWidth, 0 overflowing elements | iframe 360px emulation | pass |
| r16 | clean load: DCL 194ms, 0 long tasks, 0 JS errors, 61 fps, scroll ok, 5 tabs switch | automated, desktop Chrome | pass |
| r17 | capture path via file input: card appears, code 52 | automated | pass |
| r17 | capture path via camera input: card appears, code 52 | automated | pass |
| r17 | removed buttons hidden, remaining buttons visible | automated | pass |
| r18 | PDF generated from the published code, text selectable, A4, 2 pages | automated, Chrome print-to-PDF | pass |
| r19 | report contains the compressed captured image and caption (worker reply mocked, daily AI limit reached) | automated, mocked read | pass |
| r19 | manual search report has no image | automated | pass |
| r20 | print path A: report button on a card | automated | pass |
| r20 | print path B: print button in the menu | automated | pass |
| r20 | print path C: browser print in Browse tab (empty notice page) | automated, event simulated | pass |
| r20 | print path D: browser print in Favorites (2 faults) | automated, event simulated | pass |
| r20 | print path E: browser print on 5 search results | automated, event simulated | pass |
| r20 | print path F: browser print on Home without results | automated, event simulated | pass |
| r20 | database validation: db_check.js | automated | pass |
| r20 | syntax check app.js sw.js data*.js steps-ar.js | automated (node --check) | pass |
| r20 | JSON validity (4 json files) | automated | pass |

## Bugs found and fixed this session
hidden result element on the camera tab; prompt regression reading the wrong number; misleading "not clear" message; tab switch scope bug; non-wrapping button row on small screens; blank PDF (missing display rule); page not scrolling after r15 (suspected cause: overflow rule on html/body, removed in r16, not reproduced before the fix).

## Open
Real-phone verification of the print dialog and paper size; Deye W-codes missing from the database; 237 records without a code and 6 duplicate brand+code groups (see audit); verification statuses (Phase 3) not started.
