# Production site workflow

The deployed site lives in `cloudflare/`. Read `cloudflare/AGENTS.md` before changing it.
The root HTML/CSS prototypes and `web/` implementation are separate projects.

All production card/data UI must follow `cloudflare/READABILITY.md` and the shared
readability tokens. Keep readable typography and contrast in both themes, including
mobile layouts. Run the required readability check and build before publishing.

Commit validated changes before handing back the project. Stage only files changed for
the current task, and preserve unrelated edits and untracked files. Follow the operator's
publishing authorization; the production branch is connected to Cloudflare Pages.
