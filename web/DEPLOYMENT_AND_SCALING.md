# Deployment & Scaling Guide: The $0 Cloudflare Architecture

This guide outlines how to host and scale **cheapoS.lol** for **$0/month** on Cloudflare Pages and Supabase Free Tier, plus our contingency plan if the site goes viral or lands major traction.

---

## 1. Why Cloudflare Pages Over Vercel?

| Feature | Vercel (Hobby) | Cloudflare Pages (Free) |
| :--- | :--- | :--- |
| **Commercial Use Policy** | ⚠️ Strictly Non-Commercial | ✅ **100% Commercial-Friendly** |
| **Bandwidth Limits** | 100 GB / month | ✅ **Unlimited Free Bandwidth** |
| **Edge Network** | Global CDN | ✅ 300+ Edge Data Centers |
| **Monthly Cost** | $0 until flagged ($20/mo Pro) | ✅ **$0.00 / month forever** |
| **Custom Domain** | Supported | Supported (`cheapos.lol`) |

---

## 2. Step-by-Step Deployment on Cloudflare Pages

### Step 1: Connect Git Repository
1. Log in to your free [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Go to **Workers & Pages** ➔ **Create application** ➔ **Pages** ➔ **Connect to Git**.
3. Select the repository: `carlosa8c/cheapskate-club`.

### Step 2: Build Settings
* **Framework Preset:** `Next.js`
* **Root directory:** `web`
* **Build command:** `npx @cloudflare/next-on-pages` (or standard `npm run build`)
* **Output directory:** `.vercel/output/static` (or `.next`)
* **Node.js Version:** Set environment variable `NODE_VERSION = 20`

### Step 3: Environment Variables
Add the following in the Cloudflare Pages settings:
* `SUPABASE_URL`: Your project URL (`https://xyz.supabase.co`)
* `SUPABASE_PUBLISHABLE_KEY`: Your Supabase anon key
* `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (encrypted / server-only)
* `SITE_URL`: `https://cheapos.lol`

### Step 4: Link Domain (`cheapos.lol`)
1. In Cloudflare Pages, navigate to **Custom Domains**.
2. Enter `cheapos.lol` and `www.cheapos.lol`.
3. Cloudflare will automatically provision SSL certificates and edge DNS records.

---

## 3. The "Hacker News Spike" Contingency Plan (What if We Go Viral?)

If the site hits the front page of Hacker News, Reddit, or viral AI Twitter, traffic could spike to 50,000–250,000 visitors in hours. Here is how we ensure the site never crashes or incurs surprise bills:

### A. Cloudflare Edge Caching (Zero-Load on DB)
Public endpoints (`/`, `/leaderboard`, `/engine`, `/api/scoreboard.svg`) use HTTP caching headers:
```http
Cache-Control: public, s-maxage=60, stale-while-revalidate=300
```
* **Result:** Even with 10,000 simultaneous visitors per second, Cloudflare serves 99.8% of requests from edge memory worldwide.
* **Database impact:** Supabase only receives **1 query per minute** to refresh the cache.

### B. Supabase Connection Pooling (Supavisor)
* In `SUPABASE_URL`, use Supabase's built-in **Transaction Connection Pooler** (port 6543) instead of direct PostgreSQL (port 5432).
* This prevents Postgres from exceeding connection limits even under heavy concurrent load.

### C. Rate-Limiting Ingestion APIs
* The `/api/installation` and signed telemetry endpoints have strict schema validation and body-size limits (< 4KB). Malformed payloads or spam requests are rejected at the edge before touching the database.

---

## 4. The Revenue Reinvestment Ladder (Upgrading as We Make Money)

We only spend cash when the site is already generating revenue:

| Revenue Milestone | Upgrades Funded by Sponsorships | New Cost | Net Profit |
| :--- | :--- | :--- | :--- |
| **$0 / month** *(Launch)* | • Cloudflare Pages Free<br>• Supabase Free Tier<br>• `cheapos.lol` ($1.80/yr) | **$0.15 / mo** | $0 |
| **$350 / month** *(1 Sponsor)* | • Upgrade Supabase to **Pro ($25/mo)** for point-in-time recovery, automated backups, and 8GB RAM.<br>• Keep Cloudflare Pages Free ($0). | **$25.00 / mo** | **+$325 / mo** (93% margin) |
| **$750 / month** *(2 Sponsors)* | • Acquire `cheapos.ai` ($70/yr) if desired.<br>• Add Cloudflare Workers Paid ($5/mo) for 10M requests. | **$35.00 / mo** | **+$715 / mo** (95% margin) |
| **$1,500+ / month** | • Scale database compute and reserve funds for community grants and hackathons. | **$60.00 / mo** | **+$1,440 / mo** |
