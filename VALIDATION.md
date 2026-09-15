# Prototype validation — September 15, 2026

## Checks performed

Validated through the Codex in-app browser against the local static server, using real button/input interactions. No model requests or external accounts were involved.

- Design chooser and both full designs render; inspected desktop screenshots.
- The all-time free API board starts with Penny Lane, 128.4M tokens.
- Selecting the month changes the order: Cache Me Outside leads at 21.6M; shares are calculated against that month's sample total.
- Selecting local tokens produces a different board: Frugal Fran leads the monthly local table at 12.4M.
- Searching an absent participant shows the empty state; Clear search restores all eight rows.
- Join opens the explanation and clearly simulated X-connection step.
- Consent preview starts unchecked, with submission disabled. Checking consent enables it.
- Submitting the demo opt-in adds one participant, increasing the community from eight to nine; the visible total becomes 553.6M free API tokens.
- Navigating to the other design preserves the demo membership locally. The guest ranks sixth on the all-time free API board at 41.6M.
- Opt-out removes the guest entry and restores the original eight rows. The closing state is opted out.
- Participant profiles open with the correct totals and rank; Escape closes the native dialog.
- Narrow viewport checks for both designs and the chooser: the browser reported a 469px client width, with scroll width also 469px (no horizontal page overflow). Inspected the arcade's compact layout and checked the club's consent dialog remains within the viewport. The temporary viewport override was reset afterward.
- Browser log inspection found no warnings or errors during the checked interactions.
- JavaScript syntax check passed (`node --check app.js`). Local HTML asset references resolve. Nine fictional handles have unique values and valid X-style length/characters.

No permanent automated test suite or heavy regression fixture was introduced. The syntax/asset checks are sub-second local checks; browser checks were manual development verification rather than scheduled tests.

## Scope and limits

This validates the static prototype, not real X OAuth, accounting integrity, network sync, account deletion, moderation, multiple installations, or backend access controls. Those are explicitly described as follow-up implementation work in DESIGN.md.

Clipboard sharing is copy-only; no real X post or sign-in was tested. Responsive CSS covers smaller screens, but this is not a comprehensive cross-device or screen-reader certification.

The source CheapOS application and its configuration were not changed by this design task.
