# Daily development log

One entry per cycle: analysis, plan, what was done, tests, review. Honest numbers only.

## 2026-11-28 (Release 1.1, build r21)
- Analysis: owner reported no reaction on the Capture tab, then a frozen page, a broken card on a 360px phone, a poor PDF report and a print dialog printing the whole page.
- Done: see CHANGELOG.md.
- Tests: 23 run, 22 passed, 1 failed and fixed. Details in TEST_REPORT.md.
- Self review: accuracy of reading is unchanged from the 18-photo regression (9 of 18 read automatically, 0 wrong codes). The speed of the first read is about 3 s on desktop. Stability improved (the frozen-page cause is only suspected, not reproduced). Database coverage unchanged. Privacy: no photo is stored in the repo; the captured image stays in browser memory.
- Honest gaps: no real-phone test; print dialog behavior on the owner's phone unverified; AI read daily limit hit during testing.

- Process (19:07): owner approved the dev-branch workflow. Branches `dev` and `stable-r20` created, publish and merge rules in HANDOFF.md.
