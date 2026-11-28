# Changelog

Newest first. A line is added only for a real change that was tested. Older session notes: INVERTER_FIX_CHANGELOG.md.

## Release 1.2 (2026-11-28, build r22)
- r22: new brand series "Deye US/AM2 (SG01HP3-US-AM2)": 28 fault codes (F01 to F64) from the official Deye manual, Chart 7-1 (new data5.js). Existing Deye records unchanged: codes differ between Deye series (for example F55). db_check now separates Fault/Warning pairs from real duplicates (6 groups became 1 real group plus 5 pairs). dev.html explains the 237 records without code (named faults, no number in the manual). Deye W-codes: not found in any of 5 official Deye manuals checked, nothing added.

## Release 1.1 (2026-11-28, build r21)
- r21: anonymous usage counter. The app sends a random device ID (made in the browser, stored in localStorage) once per session ("open") and once per diagnosis ("diag"). The Worker keeps counts only (devices, sessions, diagnoses, photo reads, last 14 days) in a free Cloudflare KV store. No IP, name, email or image is stored. Shown live on dev.html. No visible change in the app.

## Release 1.0 (2026-11-28, build r20)
- r7: removed the on-device OCR library; every picked or captured image goes straight to the AI read. Diagnostics line under the image (steps, status, ms), global error capture, 30 s fetch timeout, 25 MB file limit.
- r8-r12: result and brand chooser now show inside the Capture tab (the result element was hidden on that tab, the root cause of "no response"). Server connection test added (hidden again in r17).
- r13-r14: all visible mention of external AI services removed; device brand suggestion from the image (a button, never auto-selected).
- r15: mobile layout fix at 360px (button row wraps, long text wraps); on-demand approximate Arabic translation of steps.
- r16: removed an html/body overflow rule that was the suspected cause of the page not scrolling.
- r17: Capture tab keeps two buttons: open camera, choose image. Removed: system-camera button, manual AI button, connection test button. Reading starts automatically.
- r18-r20: professional text report (cover, reference number, summary, steps with approximate Arabic, safety, source, footer, page numbers, A4). Captured image and caption included when the diagnosis came from an image. Report button, print button and browser print all produce the same report.
- Added db_check.js (database validation), dev.html + dev-data.json (development dashboard), TEST_REPORT.md, RELEASE_NOTES.md, DAILY_DEVELOPMENT_LOG.md, ROADMAP.md.
- No database record was deleted. 1782 records, 43 brands (unchanged).
