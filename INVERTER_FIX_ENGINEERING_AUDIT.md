# Inverter Fix - Engineering Audit (Phase 1)

Date: 2026-11-28. Scope: repo amr-inverter-fix/amr-inverter-fix.github.io (the live site). Status: Phase 1 only. Nothing below was tested on a real inverter.

## 0. Repository check
The directive names `amr-inverter-fix/hybrid-energy-ai`. That repo is a different project (wind-solar hybrid simulator, graduation project). The Inverter Fix site is served from `amr-inverter-fix/amr-inverter-fix.github.io`. All work here is in the second repo. Decision needed from Amr: confirm this is intended.

## 1. Code structure
- `index.html` (88 lines), `app.js` (674), `style.css` (304), `sw.js` (6), `worker/worker.js` (222, Cloudflare Worker source, deployed separately), `data.js` to `data4.js` (database), `steps-ar.js` (Arabic step translations), `tesseract.min.js` + `worker.min.js` (OCR), `manifest.webmanifest`.
- Offline: service worker is network-first with cache fallback (13 files cached, version `inv-v63`).
- AI paths now: vision read and chat/explain both go to the Cloudflare Worker (`/read`, `/chat`) which calls Gemini with a secret key. Model in use: `gemini-3.5-flash-lite` (3.8-flash returned 503 overload during testing; 2.5-flash returns 404 for new users).
- Dead code still in `app.js`: Puter loader and sign-in card (`loadPuter`, `puterText`, `aivSignCard`, `AIV_MODELS`). Not reachable from the UI. To remove in Phase 2.

## 2. Database audit (computed from data.js..data4.js)
- Records: 1782. Brands: 43. All records have `b, c, n, k, s`; `a` present on 1034.
- Records with no code: 237 (name-only entries). No record has an unknown brand key.
- Duplicate brand+code groups: 6. All 6 have different names (axpert 01, 02, 03, 04, 07 are a "fault" and a "warning" with the same number; solaredge 2xE has two texts). These are real code collisions inside one brand, not deletions. They stay, flagged.
- No record has a model/compatibility field. Source info is per brand (`src`: name, doc, url), not per record. Page numbers exist only in `db_quality_report.json` for records it covers.
- `db_quality_report.json` covers 1684 records, the app has 1782. The 98 SRNE and Megarevo records (v56) are not in the report yet.
- Existing status counts in the report: VERIFIED AGAINST OFFICIAL MANUAL 230, TEXT FOUND IN OFFICIAL-DOMAIN DOCUMENT (AUTOMATIC CHECK) 587, SOURCE NEEDS VERIFICATION 717, THIRD-PARTY COPY 138, DUPLICATE-CONFLICT 12.
- Proposed mapping to the requested statuses (no promotions): VERIFIED AGAINST OFFICIAL MANUAL -> VERIFIED_OFFICIAL_MANUAL only after a sample re-check; AUTOMATIC CHECK -> OFFICIAL_SOURCE_MATCHED (text match is not proof of the repair steps); SOURCE NEEDS VERIFICATION -> NEEDS_VERIFICATION; THIRD-PARTY -> THIRD_PARTY_SOURCE; DUPLICATE-CONFLICT -> CONFLICTED_RECORD; the 98 new records -> NEEDS_VERIFICATION until covered.

## 3. Findings and risks
1. No per-record model compatibility, so Stage 5 of the engine (model validation) has nothing to validate against yet.
2. Report and database are out of sync (98 records).
3. Puter dead code remains.
4. Tests so far are the developer's own (retrieval_metrics.json says so). No real-photo OCR accuracy exists. Real images are needed from Amr; none were available.
5. Privacy: the UI says images go to Gemini through a relay. It does not yet say that Google may use free-tier inputs to improve products, nor ask for explicit consent per session in both languages.

## 4. Next phases
Phase 2 (AI + OCR), Phase 3 (engine + source status), Phase 4 (local AI architecture only, not tested on Amr's machine), Phase 5 (PDF report + knowledge base), Phase 6 (security, performance, mobile), Phase 7 (regression + deployment).
