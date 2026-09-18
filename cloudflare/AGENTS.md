## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Required UI readability standard

Follow [READABILITY.md](READABILITY.md) for every card, dashboard, data table, badge,
and supporting label. Reuse the typography and light/dark color pairs in
`src/styles/readability-tokens.css`; do not introduce undersized text or fixed
component text colors. Preserve readable text at mobile widths and in hover/focus states.

Run `npm run check:readability` and `npm run build` for UI changes. The build runs the
readability guardrail automatically. Also inspect affected pages in both themes at
desktop, tablet, and 390px/320px widths; the static check does not replace visual QA.
