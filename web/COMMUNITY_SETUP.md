# Community workbench

Apply `supabase/migrations/202609150005_community.sql` once in the same Supabase project, after migrations 001–004. This adds builds, cheers, ownership policies, and a public feed RPC. No new environment variables or storage bucket are required. Until applied, the feed displays a setup message and publishing cannot save.

Members publish, edit and delete their own builds. Anonymous readers can view builds; signed-in users can add or remove one cheer per build. Attribution is explicitly public when publishing, even if leaderboard sharing is off. No private profile fields or cheer identities are exposed through the feed. Public profiles show the latest 12 builds.

Screenshots use public HTTPS image links (no uploads yet). Project links open GitHub or a demo; optional X-post links provide discussion. Share on X opens a prefilled composer and does not publish automatically. Individual pages include social metadata. An optional usage card shows the author's *lifetime* public Club totals, never a claim about that project's cost; hiding the author's public profile also hides the embedded card.

## Focused checks

- `npm run lint` and `npm run build`.
- Node 22.18+ or 24+: `node scripts/check-community-input.mjs` (under 0.1s in the development run).
- `node scripts/check-community-db.mjs` with PGlite available, or set `PGLITE_MODULE` to its installed module entry. Uses an ephemeral in-memory database, never the hosted project. Tested runtime: 0.6s. Covers anonymous writes, foreign-owner edits/deletes, unique cheers, attribution privacy, optional usage consent, and cascade cleanup. It is an optional focused check, not part of normal build.

## Try it

1. Sign in, open Community, and choose Share a build.
2. Publish a title and description; optionally add screenshot/project/X links and your public usage card.
3. Open the detail page, give a cheer, and click again to remove it.
4. Edit your build under Manage your build. Invalid links should show an error and preserve the draft.
5. Open an incognito window: build is public, editing is absent, cheering requires sign-in.
6. Check your public profile for From their workbench. Switch off public usage sharing to confirm the usage card disappears.

Comments, uploads, project-specific receipts, and moderation tooling remain future work. No sample posts are seeded into the live database.
