# The Cheapskate Club · Cloudflare Edition

Cloudflare-native deployment of [The Cheapskate Club](https://cheapos.lol) (`cheapos.lol`), the official community leaderboard and compute observatory for [cheapoS](https://github.com/cheapos/CheapoS).

## Architecture & Frugal Philosophy

- **Framework**: [Astro](https://astro.build) with `@astrojs/react` and `@astrojs/cloudflare`
- **Deployment Target**: Cloudflare Workers / Pages
- **Styling**: 100% aesthetic parity with the original club editorial design system (`club.css`), typography tokens, light/dark themes, and bespoke SVGs
- **Backend Integration**: Supabase REST RPC endpoints queried with edge-native `fetch`, eliminating heavy client bundles and Node dependencies
- **Cost**: $0.00 / month infrastructure on Cloudflare Free Tier (zero surprise bills) + $1.80 / year domain (`cheapos.lol`)

## Cloudflare Dashboard Deployment Settings

When connecting the GitHub repository to Cloudflare:

| Setting | Value |
| :--- | :--- |
| **Root directory** | `cloudflare` |
| **Framework preset** | `Astro` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Node.js version** | `22.12.0` (or `>=20`) |

### Environment Variables

Configure these in the Cloudflare project settings (Settings → Variables and Secrets):

| Variable | Description | Example |
| :--- | :--- | :--- |
| `SUPABASE_URL` | Supabase project API URL | `https://xxxx.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase public anon key | `eyJhbGci...` |
| `SITE_URL` | Production website origin | `https://cheapos.lol` |

## Local Development & Testing

```bash
# Install dependencies
npm install

# Build for Cloudflare
npm run build

# Preview with Wrangler in official Cloudflare Worker runtime
npx wrangler dev --config dist/server/wrangler.json --port 8787
```

## Available Routes

- `/` — Homepage featuring Top Cheapo champion card, interactive Scoreboard Billboard, Sponsor Spotlight, and navigation gateways
- `/leaderboard` — Standings table, podium honors, time period filters (All-Time / This Month), search, and title pills
- `/engine` — Community Compute Observatory with global KPI strip, 4-tier compute breakdown, autonomous workshop role distribution, and Model Explorer
- `/sponsors` — B2B Infrastructure & Tool Sponsorship prospectus with live telemetry, anti-cheat pledge, sponsorship tiers, and Frugal Stack directory
- `/about` — The Cheapskate Club manifesto, anti-cheat policy, and domain backstory
- `/[handle]` — Member profile cards with verified compute breakdown, crowns, and shareable Club Pass
- `/api/scoreboard` — Public JSON API for live standings
- `/api/stats` — Real-time community compute telemetry feed
- `/api/profile/:handle` — Public profile resolver
