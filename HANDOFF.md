# Handoff notes (2026-11-28) for the next daily improvement agent

Live site: https://amr-inverter-fix.github.io/ . Repo: amr-inverter-fix/amr-inverter-fix.github.io . Worker: https://inverter-vision.amr-abdelhamid-engineer.workers.dev (Cloudflare account of the owner, Worker name inverter-vision, model the AI vision model, secret GEMINI_KEY set, never print it).

## Rules from the owner
- Never invent codes or fixes. AI reads text only; diagnosis comes from the evidence base. Unknown code: "not found" plus manual entry.
- Honest reports with numbers: what changed, what was tested, what was NOT tested (real inverter, real phone).
- Do not store the owner's test photos in any repo.
- No money, new accounts or keys. Do not change the Worker limit or model without the owner's OK.
- Worker daily AI-read limit is 150/day per IP, raised temporarily at the owner's request (original 30). Restore to 30 when the owner says testing is over.

## Where things stand
- DB: 1782 records, 43 brands. 237 records have no code, 6 duplicate brand+code groups. See INVERTER_FIX_ENGINEERING_AUDIT.md.
- AI reading: Worker /read (multi-code, 7-segment rule, no-fault note), /chat. App: consent dialog removed (non-blocking privacy line), AI button always visible, one contrast retry, code match labeled NEEDS_VERIFICATION when by number only.
- Test result summary: INVERTER_FIX_TEST_REPORT.md.

## Priorities
1. Phase 3: verification statuses (VERIFIED_OFFICIAL_MANUAL, OFFICIAL_SOURCE_MATCHED, THIRD_PARTY_SOURCE, NEEDS_VERIFICATION, CONFLICTED_RECORD, UNSUPPORTED) per the mapping in the audit file. Brand/model must be part of the match.
2. Image 13 type: owner's Axpert shows 39 under FAULT with the indicator off. Find the official manual meaning of the fault display before encoding anything.
3. Crop to display before sending, glare handling, GoodWe-style tables.
4. Re-run all 18 reference photos (files are on the owner's side, ask the parent agent to resend; none are in the repo) and record before/after numbers.
5. Phase 4-7 of the owner's directive (local AI architecture, PDF report, security/performance/mobile, regression), final 12-point report.

## Publishing method
Cloud browser (config-h, saving cookies) -> github.com upload page -> set files via DataTransfer script -> fill "Commit summary" -> Commit changes -> wait ~55 s -> verify with fetch(..., {cache:'no-store'}). Worker: Cloudflare dashboard edit-code page, paste code into the editor frame, Deploy.
