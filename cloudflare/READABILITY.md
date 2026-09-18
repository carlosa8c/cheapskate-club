# Card and data readability

This is the required presentation standard for the production Cloudflare site.
Keep the club's serif editorial headings, warm light theme, forest dark theme,
and distinct podium/sponsor treatments while using the same readable text system.

## Shared styles

- Use `src/styles/readability-tokens.css` for text sizes and paired text/surface colors.
- Use `--text-body` (16px) for descriptions, `--text-label` (15px) for labels,
  `--text-meta` (14px) for supporting metadata, and `--text-metric` (24px) or larger
  for primary metrics. Never shrink text to make a card fit, including at mobile widths.
- Use the site's sans-serif for labels, prose and metric values. Use tabular numerals
  for comparable numbers. Reserve monospace for code, commands and technical identifiers.
- Write descriptive labels in sentence case. Keep all-caps branding brief; do not use
  letter-spaced, all-caps text for descriptions or dense data labels.
- Foreground and background must be designed together in both themes. Small text must
  have at least 4.5:1 contrast on its actual surface, including hover/selected states.
  Use `--text-primary`, `--text-secondary`, and the `--status-*` tokens; `--accent`
  is a decorative fill, not a readable text color. Do not mute text with opacity.
- Preserve category colors where they convey meaning, paired with visible labels.
  Keep exact values available when a headline uses an abbreviated count.
- Separate final verification from checks attempted during execution. Presentation
  changes must not change telemetry, inferred results, pricing assumptions or proof claims.

## Layout

- Use 20–24px card padding on desktop and at least 16px on small screens, with 16–24px
  between groups. Keep labels adjacent to their values and make primary values prominent.
- Let cards grow with content. Wrap labels, model identifiers and badges; reduce the
  column count before reducing type. Avoid fixed card heights and clipping text.
- Keep the podium's hierarchy and the sponsor sections' editorial typography. Shared
  readability does not require every card to have the same layout.
- At 320px, cards must fit without horizontal overflow. Dense comparison tables may
  scroll inside a labeled wrapper; the whole page must not scroll horizontally.
- Preserve native focus indicators and visible labels for actions. Respect reduced motion.

## Required validation

`npm run check:readability` runs automatically before `npm run build`, including the
Cloudflare build. It rejects literal text sizes below 14px, fixed component text colors,
and shared color pairs below 4.5:1 in either theme. It uses Node only, with no browser,
network, added dependencies, or timer waits.

This source check is a guardrail, not a complete accessibility audit. It cannot prove
computed sizes, arbitrary CSS inheritance, transparency/gradient contrast, focus behavior,
or absence of clipping. For changes to card UI, inspect affected pages in light and dark
mode at desktop, tablet, and 390px/320px widths. Include long content and empty states;
check hover/focus states and existing filters/search. Use `npm run build` and inspect the
built app when development-only tooling errors prevent a reliable preview.

Add new shared palette tokens in the token stylesheet and extend the contrast checks.
Do not bypass the build guardrail or add blanket exceptions to make a check pass.
