# cheapoS leaderboard — choose your cheap

Two interactive design directions for an opt-in community leaderboard, linked to an X / Twitter identity. The playful title for the leader: **Top Cheapo**.

**These are design prototypes.** Every person and usage figure is fictional. X connection is simulated. There is no backend, telemetry, real authentication, upload, or posting. The only saved browser data is an on/off demo-membership preference shared by the two designs.

## Open the designs

No install, build, API key, or dependency download required:

```sh
cd ~/Desktop/cheapoS-leaderboard
python3 -m http.server 5188 --bind 127.0.0.1
```

Open http://127.0.0.1:5188 for the design chooser.

- **The Cheapskate Club** — `club.html`. Warm ivory, forest ink, terracotta, an illustrated trophy, and editorial typography. The friendlier, more distinctive brand direction. **Recommended starting point.**
- **Token Arcade** — `arcade.html`. Midnight, lavender, lime, a stepped champion podium, and a game-inspired scoreboard. A more competitive, developer-community direction.

Both designs support:

- All-time / September sample rankings, correctly re-sorted by the selected period.
- Separate free API and local-model token boards.
- Participant search, empty results, and profile cards.
- Demo X connection → public-data preview → unchecked opt-in consent → entry on the board.
- Membership controls, opt-out, and removal of the demo entry.
- A copy-only demo brag. Nothing is posted to X.
- Responsive layouts, native keyboard-accessible dialogs, visible focus states, and reduced-motion support.

The featured champion/podium always represents **all-time free API usage**, while the table can be filtered. “This month” deliberately uses a fixed September 2026 fixture rather than pretending this static sample has a live feed.

## Product handoff

See [DESIGN.md](DESIGN.md) for concept rationale, suggested language, CheapOS onboarding, data boundaries, ranking rules, and a staged implementation plan. See [VALIDATION.md](VALIDATION.md) for checks performed and prototype limitations.

The relay mark comes from the existing cheapoS brand. Typography uses local system fonts; there are no external font or image calls. Layout appearance can vary slightly across operating systems.
