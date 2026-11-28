# Inverter Fix: development progress

Last updated: 2026-11-28 15:40 (Cairo). Live: https://amr-inverter-fix.github.io/ . Static site (GitHub Pages), no backend, free hosting only.

Status labels: COMPLETE AND TESTED / IMPLEMENTED NOT FULLY TESTED / PARTIAL / BLOCKED BY EXTERNAL DEPENDENCY / NOT IMPLEMENTED.

## Data
- 1782 fault entries, 43 brand/series cards. Two new cards added 2026-11-28, both read from the manufacturer's own PDF: SRNE HESP 16-20 kW three-phase hybrid (57 codes, section 7.1 Fault Codes and 7.2 Troubleshooting) and Megarevo R12-R16KLNA-P6 hybrid (41 codes, section 11 Fault diagnosis and solutions). Source URLs are on the company domains (srnesolar.com, megarevo.com).
- SRNE codes 37 and 38 were left out: in the manual's PDF the fault-name and description columns are misaligned for those two rows, so the name cannot be paired with its meaning with confidence.
- Entries come only from official manufacturer manual text; codes and steps are never invented. Where the manual gives no remedy for a code, the card says so and points to the manufacturer's service instead of inventing a step.
- Before 2026-11-28: 1684 fault entries, 41 brand/series cards (new official cards then: SolaX X3-PRO G2, SOFAR HYD 3-6K-EP). manufacturer_registry.json lists the document, URL and source class for each card. Each card lists the manual name and link. Entries come only from official manufacturer manual text; codes and steps are never invented.
- Per-brand source status is shown on every result card. Huawei, SolaX and SOFAR currently link to third-party hosted copies (official version NOT yet verified). Deye, Steca and Growatt (TL/MTL) hosts are unclear and under review. Source URL check on 2026-11-26: Sol-Ark legacy 12K link returned 404 to curl; Enphase, SolarEdge and Schneider returned 403 to curl (bot blocking, not verified in a browser).
- Not in the data: per-fault manual page numbers and per-fault verification dates. The report says "page not recorded".

## UI (v57, 2026-11-28)
- Fault card rebuilt for small screens: compact header (brand badge, code, name, severity as a pill instead of a full-width banner), steps as one tight numbered list instead of separate boxes, two primary actions (WhatsApp, card link) with the rest behind a "..." menu, and the source/manual link collapsed under the source heading. Card height on a 390 px wide viewport drops by roughly a third.
- Arabic renderings of recurring manual steps: 85 exact phrases plus 6 sentence patterns in steps-ar.js. Coverage measured over the whole database: 1403 of 4448 steps (31.5%) show an Arabic line; 141 cards are fully Arabic and 600 partly. Every translated step keeps the manual's English text underneath, and the card says the Arabic is our translation. Steps with no translation are shown in English exactly as before - nothing is machine-composed.
- Match reason tags are Arabic now ("code 39" shows as "الكود 39").
- Not tested on a real phone; checked at a 390x844 mobile viewport in a desktop Chrome.

## Features
| Feature | Status | Notes |
|---|---|---|
| Code / text search, brand + model keyword matching, did-you-mean | COMPLETE AND TESTED | 73 of 73 offline cases pass (developer-written). retrieval_metrics.json: P@1 0.96, Hit@3 1.0 on those; synthetic code lookup Hit@3 1.0. Not independently reviewed |
| OCR from camera/upload, file type and 15 MB validation, editable text with O/0 I/1 S/5 B/8 Z/2 warning, diagnosis only after the user confirms | IMPLEMENTED NOT FULLY TESTED | validation tested with fake files; the confirm step is live but not tried on a real photo; OCR accuracy not benchmarked on real inverter photos |
| Fault cards with severity (app estimate, not manufacturer) and safety wording | COMPLETE AND TESTED | |
| PDF report (print to PDF), card image export | IMPLEMENTED NOT FULLY TESTED | content built and print call verified; paper layout and phone print/share not checked |
| Arabic symptom search (main search box and browse filter) | IMPLEMENTED, TESTED IN A NODE HARNESS | typing "تسرب أرضي", "جهد الشبكة عالي", "الإنفرتر سخن", "حمل زائد", "حرارة عالية", "مشكلة في البطارية" now returns matching cards from several brands. Arabic-Indic digits (٠٣) are converted to 0-9. Tested against the loaded database, not on a phone |
| Arabic symptom chips on the home search card | IMPLEMENTED NOT FULLY TESTED | six chips fill the search box and run the diagnosis; verified in the browser, not on a phone |
| Brand share link (#b=<brand>) | IMPLEMENTED NOT FULLY TESTED | the browse tab has a "لينك كل أعطال الشركة" button that copies a link opening the browse tab filtered to that brand |
| Dashboard with real DB stats | COMPLETE AND TESTED | |
| Local search analytics | IMPLEMENTED NOT FULLY TESTED | device-only log (500 entries), clearable; no server analytics |
| Arabic / English toggle with RTL | PARTIAL | static UI strings only; fault text stays in the manual's English |
| Offline / PWA, cache status badge | IMPLEMENTED NOT FULLY TESTED | cache count verified in browser; airplane-mode run on a phone not done |
| AI assistant (third-party Puter service, user confirms first) | PARTIAL | not grounded by retrieval over manuals |
| Staging API (Cloudflare Pages Function, same engine, no AI, no DB, not used by the site) | IMPLEMENTED NOT FULLY TESTED | curl tests pass; database inside is the current 1684-fault copy (redeployed) |
| Backend API (Node/TypeScript), PostgreSQL, vector search over manuals, AI provider key, user accounts, admin panel, server analytics | BLOCKED BY EXTERNAL DEPENDENCY | needs hosting, a database and an AI key; none is free-and-account-free. Not built, not faked |
| Live inverter monitoring (Modbus) | NOT IMPLEMENTED | needs hardware and a gateway |

## Not tested
No test on a real phone, no real inverter, no accessibility audit, no formal security audit. Client-side review done: user text and OCR text are escaped (single quotes too), AI answers are inserted as plain text, a restrictive Content-Security-Policy (no plugins, base and form locked) is set. No server is in use, so CORS and server limits are untested.

## Database quality audit (2026-11-27)
Machine-readable: db_quality_report.json. 1684 records: 230 VERIFIED AGAINST OFFICIAL MANUAL (read from the official PDF by the developer, no independent second review), 587 TEXT FOUND IN OFFICIAL-DOMAIN DOCUMENT (AUTOMATIC CHECK: code and title words found on the same PDF page; weaker than a human read; page = PDF page index), 138 THIRD-PARTY COPY - OFFICIAL VERSION UNCONFIRMED, 12 DUPLICATE-CONFLICT (10 Axpert Fault/Warning numbers that share a code, 2 SolarEdge 2xE entries needing a manual check), 717 SOURCE NEEDS VERIFICATION. Nothing was deleted or edited. Scanned or HTML-only sources were not checked automatically. Printed page numbers and document versions are not recorded.

## Tests

2026-11-28: node harness loading all four data files and app.js with a stub DOM: 1782 faults, 43 brands load with no error; code lookup for the new cards (SRNE 03, SRNE 21, Megarevo 11, Arabic-Indic ٠٣) returns the right card; six Arabic symptom queries each return cards from more than one brand; English queries and existing codes still resolve.
Offline regression: 73/73. The one earlier failure was a badly written negative test (it expected a SolaX result for an unknown vendor and could never pass); it is now an explicit "must not return SolaX" check, not a data fix. The matching engine itself was not changed.

## UI pass v57 (2026-11-28)
Fault cards rewritten: compact header, severity pill, numbered `.steps` list with an Arabic line (`.sar`) above the manual's English line (`.sen`), safety note, two primary actions plus a "more" menu, and a collapsed source block. Arabic step translations live in `steps-ar.js` (`window.STEPAR`, 85 exact phrases, plus `STEPAR_RULES`, 6 regex rules) and are labelled as our translation with the English original kept underneath. Coverage measured with a normalised lookup: 1403/4448 steps (31.5%), 141 cards fully Arabic, 600 partly. The shipped `stepAr()` uses an exact string match, so real coverage may be slightly lower than the measured number. `sw.js` bumped to v57.

## AI vision reading v59-v62 (2026-11-28)
Camera/upload screen gains "اقراها بالذكاء الاصطناعي (أدق)". It downscales the photo to <=1280 px JPEG and sends it to the AI vision service through Puter (an external AI vision model, falling back to an external AI vision model; both names taken from `puter.ai.listModels()`). The model is asked for JSON only: readable, code, message, confidence, with an explicit "never guess or complete a code" rule. Only that text reaches `diagnose()`, and only after the user reviews or edits it and presses confirm. The review card shows the confidence, the model used, and whether the code exists in the evidence base (with the nearest code when it does not). Failure paths, all Arabic: not signed in -> Puter sign-in card; 30 s timeout -> stopped message; all models unavailable -> message; unreadable photo -> message. `diagnose()` no longer falls back to word-similarity guessing when the text contains a code-like token, so an unknown code now shows "مفيش تطابق في القاعدة" instead of a near-match card.

Tested in the browser on 2026-11-28 (desktop 1280x720 and 390x844 emulation, not a real phone): four synthetic images - sharp LCD read exactly ("Fault 039 / PV ISO LOW / Check PV wiring"), unknown code E-999 produced the explicit not-found screen, a text-free image produced the no-text message, a blurred image still read both lines; confirming the 039 text produced a real card from the database. NOT verified: a successful the AI vision service read, because Puter requires a signed-in Puter account (the call hangs without one, verified with a 25 s probe including `testMode`), and the account is the user's.
