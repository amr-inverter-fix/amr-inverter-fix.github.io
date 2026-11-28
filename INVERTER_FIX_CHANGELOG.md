# Inverter Fix - Changelog (2026-11-28 session)

- AI reading now goes through the Cloudflare Worker (Gemini); Puter code removed.
- Privacy: blocking consent dialog removed at the owner's request; replaced with a small non-blocking line under the image button and the chat box (Arabic/English): the image/question is sent to Google Gemini, do not send sensitive data.
- AI button is always visible (it was hidden until an image was chosen). Pressing it without an image opens the camera and reads automatically.
- AI reading: one automatic retry with a contrast-enhanced image when the first read is "not clear".
- Result card: near codes from other brands are labeled as not a diagnosis.
- Worker prompt: 7-segment rule (only a number next to a lit FAULT/triangle is a code); no-fault panels return no code.
- Worker: daily AI-read limit raised from 30 to 150 per IP for testing only. To be restored to 30.
- INVERTER_FIX_ENGINEERING_AUDIT.md added (Phase 1). This report and changelog added.
- Not changed: fault database (1782 records, 43 brands), no record deleted.
