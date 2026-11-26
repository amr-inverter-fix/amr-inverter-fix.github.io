# Inverter Fix: development progress

Last updated: 2026-11-26 (Cairo). Live: https://amr-inverter-fix.github.io/ . Static site (GitHub Pages), no backend, free hosting only.

Status labels: COMPLETE AND TESTED / IMPLEMENTED NOT FULLY TESTED / PARTIAL / BLOCKED BY EXTERNAL DEPENDENCY / NOT IMPLEMENTED.

## Data
- 1507 fault entries, 39 brand/series cards. Each card lists the manual name and link. Entries come only from official manufacturer manual text; codes and steps are never invented.
- Per-brand source status is shown on every result card. Huawei, SolaX and SOFAR currently link to third-party hosted copies (official version NOT yet verified). Deye, Steca and Growatt (TL/MTL) hosts are unclear and under review. Source URL check on 2026-11-26: Sol-Ark legacy 12K link returned 404 to curl; Enphase, SolarEdge and Schneider returned 403 to curl (bot blocking, not verified in a browser).
- Not in the data: per-fault manual page numbers and per-fault verification dates. The report says "page not recorded".

## Features
| Feature | Status | Notes |
|---|---|---|
| Code / text search, brand + model keyword matching, did-you-mean | COMPLETE AND TESTED | 61 of 62 offline cases pass; the failing one is an old Studer case |
| OCR from camera/upload with manual correction, file type and 15 MB validation | IMPLEMENTED NOT FULLY TESTED | validation tested with fake files; OCR accuracy not benchmarked on real inverter photos |
| Fault cards with severity (app estimate, not manufacturer) and safety wording | COMPLETE AND TESTED | |
| PDF report (print to PDF), card image export | IMPLEMENTED NOT FULLY TESTED | content built and print call verified; paper layout and phone print/share not checked |
| Dashboard with real DB stats | COMPLETE AND TESTED | |
| Local search analytics | IMPLEMENTED NOT FULLY TESTED | device-only log (500 entries), clearable; no server analytics |
| Arabic / English toggle with RTL | PARTIAL | static UI strings only; fault text stays in the manual's English |
| Offline / PWA, cache status badge | IMPLEMENTED NOT FULLY TESTED | cache count verified in browser; airplane-mode run on a phone not done |
| AI assistant (third-party Puter service, user confirms first) | PARTIAL | not grounded by retrieval over manuals |
| Backend API (Node/TypeScript), PostgreSQL, vector search over manuals, AI provider key, user accounts, admin panel, server analytics | BLOCKED BY EXTERNAL DEPENDENCY | needs hosting, a database and an AI key; none is free-and-account-free. Not built, not faked |
| Live inverter monitoring (Modbus) | NOT IMPLEMENTED | needs hardware and a gateway |

## Not tested
No test on a real phone, no real inverter, no accessibility audit, no formal security audit (code read-through for XSS only; user text is escaped before display).

## Database quality audit (2026-11-27)
Machine-readable: db_quality_report.json. 1507 records: 53 VERIFIED AGAINST OFFICIAL MANUAL (4 cards, extracted from the official-domain PDF, not independently re-reviewed), 138 THIRD-PARTY COPY - OFFICIAL VERSION UNCONFIRMED, 12 DUPLICATE-CONFLICT (10 Axpert Fault/Warning numbers that share a code, 2 SolarEdge 2xE entries needing a manual check), 1304 SOURCE NEEDS VERIFICATION. Source classes: 29 official domain, 3 official domain but 403 to automated check, 3 third-party, 3 unverified host, 1 broken (Sol-Ark, 404). Nothing was deleted or edited. Page numbers and document versions are not recorded yet.

## Tests
Offline regression: 62/62. The one earlier failure was a badly written negative test (it expected a SolaX result for an unknown vendor and could never pass); it is now an explicit "must not return SolaX" check, not a data fix. The matching engine itself was not changed.
