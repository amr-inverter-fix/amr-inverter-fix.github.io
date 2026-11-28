# Changelog

Newest first. A line is added only for a real change that was tested. Older session notes: INVERTER_FIX_CHANGELOG.md.

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
