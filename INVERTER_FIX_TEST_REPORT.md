# Inverter Fix - Test Report (real-photo OCR/AI reading test)

Date: 2026-11-28. Tester: the development agent (single operator, no independent review).
Pipeline tested: the published site (https://amr-inverter-fix.github.io/), image -> shrink -> Cloudflare Worker -> Gemini (gemini-3.5-flash-lite) -> result card. Browser: cloud Chrome (desktop), NOT a phone.
Images: 18 real photos supplied by Amr (not stored in any repo). Ground truth = the tester's own reading of each photo. Amr's images are private test material.

## What was NOT tested
- No real inverter, no real mobile phone (Redmi 13C or other), no real camera capture, no low-light or bad-angle capture beyond what these 18 photos contain.
- No independent reviewer. Ground truth for 3 photos (8, 12, 13) is ambiguous even to a human reader.
- Only 7 brand/panel types appear in the sample (Deye hybrid LCD, GoodWe monitor screenshot, GoodWe-style red unit, Axpert/Voltronic 7-segment panels, a blue S11/A26 LCD, an OLED). Most brands in the 43-brand database were not tested at all.
- CER was not computed on full text. The AI is asked for code and message only, so only code-level accuracy is reported.

## Results (final pipeline, after the fixes listed below)
Images with a clearly visible fault/error (11): 1 Deye W04, 2 Deye W03, 3 GoodWe error-log table (VAC FAILURE E23), 4 "Vac Failure", 5 Deye alarm list (F13, F56), 7 Axpert-style 19, 9 Axpert-style 19, 11 Axpert-style 22, 14 Axpert-style 02, 16 Axpert-style 08, 18 OLED "PV Isolation Low".
- Exact correct code/message: 9 of 11 (1, 2, 4, 5, 7, 11, 14, 16, 18). Image 2 message had a one-letter slip ("wrng"), code W03 correct. Image 5 returned F13 only; the second code F56 was not returned (partial).
- Safe misses (app said "not clear / no code", no wrong code): 2 of 11 (3 the table, 9 the small number with glare).
- Wrong code returned: 0 of 11.

Images with no fault code shown or ambiguous (6, 8, 10, 12, 13, 15) plus one non-inverter image (17): 7.
- Returned no code: 7 of 7. False positives after the fix: 0 of 7.

Summary: code accuracy 9/11 = 82% (small sample, wide uncertainty); wrong-code rate 0/18; read-failure rate on fault images 2/11 = 18%; false-positive rate on no-fault/non-inverter images 0/7 (1/7 before the prompt fix).

## Before / after
- Before (first run): image 10 returned "02" as a fault code although the panel shows no fault (false positive). Images 11 and 14-style small numbers came back "not clear". Several images were blocked by the Worker's 30/day limit and are counted "not measured", not "failed".
- Fixes: Worker prompt now says that on multi-field 7-segment panels only a number next to a lit warning triangle or lit FAULT indicator is a fault code; app retries once with a grayscale/contrast-boosted 1600px image when the first read is "not clear".
- After: image 10 returns no code (FP fixed), 11 now reads 22, 14 reads 02, 16 reads 08. Not overfitted: the prompt rules describe the panel type generally, no image-specific text.

## Known problems found
1. Database collision: Axpert-style panels show codes like 19/22/02/08; the card says "exists in database (GoodWe)" for some of them. The match is by code number only; the panel brand/model is not verified. A diagnosis from that card must be treated as NEEDS_VERIFICATION.
2. W04/W03 (Deye) are not in the database as such; the app now says so and warns that similar numbers in other brands are not a diagnosis.
3. Image 9 (code 19 with glare) and 3 (GoodWe table) still fail to read.
4. Multi-code screens (image 5) return only the first code.
5. Rate limit: Worker allows 150 AI reads/day per IP during testing (temporary, was 30).
