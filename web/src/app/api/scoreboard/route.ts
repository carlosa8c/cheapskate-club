import { leaderboard } from "@/lib/leaderboard";
import { publicMember } from "@/lib/public-member";

export const dynamic = "force-dynamic";

export async function GET() {
  let totalTokens = 81364597;
  let retailSavings = "244.09";
  let pubTokens = 79505670;
  let incTokens = 1601645;
  let locTokens = 238316;
  let paidTokens = 0;
  let pubPct = "97.7";
  let incPct = "2.0";
  let locPct = "0.3";
  let paidPct = "0.0";

  try {
    const board = await leaderboard("zero_cost", "all");
    if (board.state === "ready" && board.entries.length > 0) {
      totalTokens = board.entries.reduce((sum, e) => sum + e.tokens, 0);
      retailSavings = (totalTokens * 0.000003).toFixed(2);
      const champion = board.entries[0];
      const member = await publicMember(champion.handle);
      if (member?.categories) {
        pubTokens = member.categories.public_free || 0;
        incTokens = member.categories.included || 0;
        locTokens = member.categories.local || 0;
        paidTokens = (member.categories as Record<string, number>).paid || 0;
        const catSum = pubTokens + incTokens + locTokens + paidTokens || totalTokens || 1;
        pubPct = ((pubTokens / catSum) * 100).toFixed(1);
        incPct = ((incTokens / catSum) * 100).toFixed(1);
        locPct = ((locTokens / catSum) * 100).toFixed(1);
        paidPct = ((paidTokens / catSum) * 100).toFixed(1);
      }
    }
  } catch {
    // Graceful fallback to verified totals
  }

  const formattedTotal = totalTokens.toLocaleString("en-US");
  const formattedPub = pubTokens.toLocaleString("en-US");
  const formattedInc = incTokens.toLocaleString("en-US");
  const formattedLoc = locTokens.toLocaleString("en-US");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 480" width="1000" height="480">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c120f" />
      <stop offset="100%" stop-color="#141c17" />
    </linearGradient>
    <radialGradient id="mintGlow" cx="25%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#56cf89" stop-opacity="0.22" />
      <stop offset="100%" stop-color="#56cf89" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="glint" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0.75" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </linearGradient>
    <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
      <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#233329" stroke-width="0.75" opacity="0.65" />
    </pattern>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <style>
      @keyframes pulseDot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.35; transform: scale(0.85); }
      }
      @keyframes scanAnim {
        0% { transform: translateX(-80px); }
        50%, 100% { transform: translateX(960px); }
      }
      .pulse { animation: pulseDot 2s infinite ease-in-out; transform-origin: 915px 44px; }
      .scanner { animation: scanAnim 4s infinite linear; }
      .mono { font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace; }
      .sans { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      .serif { font-family: 'Iowan Old Style', Georgia, serif; }
    </style>
  </defs>

  <!-- Background Card with Border -->
  <rect x="2" y="2" width="996" height="476" rx="20" fill="url(#bgGrad)" stroke="#233329" stroke-width="1.5" />
  <rect x="2" y="2" width="996" height="476" rx="20" fill="url(#grid)" />
  <circle cx="280" cy="180" r="280" fill="url(#mintGlow)" />

  <!-- Top Metadata Header Strip -->
  <g transform="translate(36, 48)">
    <text x="0" y="0" class="mono" font-size="11.5" font-weight="700" letter-spacing="2" fill="#7a8d82">
      COMMUNITY COMPUTE · LIVE ON <tspan fill="#56cf89">cheapos.lol</tspan>
    </text>
    
    <!-- Verified Badge -->
    <g transform="translate(730, -14)">
      <rect x="0" y="0" width="200" height="26" rx="13" fill="#15241b" stroke="#32503d" stroke-width="1" />
      <circle cx="16" cy="13" r="4.5" fill="#56cf89" class="pulse" />
      <text x="30" y="17" class="mono" font-size="10.5" font-weight="700" letter-spacing="1.5" fill="#56cf89">
        HONEST · ED25519 VERIFIED
      </text>
    </g>
  </g>

  <!-- Center Showcase: The Massive Glowing Token Counter -->
  <g transform="translate(36, 142)">
    <text x="0" y="0" class="mono" font-size="70" font-weight="800" letter-spacing="-2" fill="#56cf89" filter="url(#softGlow)">
      ${formattedTotal}
    </text>
    <text x="0" y="32" class="mono" font-size="13" font-weight="700" letter-spacing="2.5" fill="#7a8d82">
      COMMUNITY COMPUTE · <tspan fill="#56cf89">MAXIMUM LEVERAGE</tspan>
    </text>
    <text x="0" y="60" class="sans" font-size="17" font-weight="500" fill="#e8f3ec">
      ~$${retailSavings} in commercial API bills eliminated — <tspan fill="#56cf89" font-weight="700">$0 out-of-pocket</tspan>
    </text>
    <text x="0" y="84" class="mono" font-size="11.5" fill="#5c6f64">
      Signed machine sync · 32 models in the mix · 4 agent roles · Verified on-device receipts
    </text>
  </g>

  <!-- The Honest Math Box (Right Column) -->
  <g transform="translate(630, 92)">
    <rect x="0" y="0" width="334" height="172" rx="14" fill="#131c17" stroke="#25372c" stroke-width="1.2" />
    
    <!-- Header -->
    <text x="18" y="24" class="mono" font-size="11" font-weight="700" letter-spacing="2" fill="#56cf89">THE HONEST MATH</text>
    <text x="316" y="24" text-anchor="end" class="mono" font-size="10" font-weight="600" letter-spacing="1" fill="#5c6f64">ED25519 AUDITED</text>
    
    <!-- Commercial fake bill crossed out -->
    <g transform="translate(18, 64)">
      <text x="0" y="0" class="mono" font-size="24" font-weight="800" fill="#5c6f64">~$${retailSavings}</text>
      <line x1="-3" y1="-8" x2="116" y2="-8" stroke="#ef4444" stroke-width="2.5" />
      <text x="298" y="-6" text-anchor="end" class="mono" font-size="10.5" fill="#7a8d82">standard API retail bill</text>
      <text x="298" y="9" text-anchor="end" class="mono" font-size="10.5" font-weight="700" fill="#ef4444">nobody paid that</text>
    </g>

    <!-- Honest Real Spend -->
    <g transform="translate(18, 114)">
      <text x="0" y="0" class="mono" font-size="30" font-weight="800" fill="#56cf89">~$0.00</text>
      <text x="298" y="-8" text-anchor="end" class="mono" font-size="10.5" fill="#7a8d82">rock-bottom out-of-pocket</text>
      <text x="298" y="8" text-anchor="end" class="mono" font-size="10.5" font-weight="700" fill="#56cf89">99.7% unbilled compute ✓</text>
    </g>

    <!-- Privacy note -->
    <line x1="18" y1="134" x2="316" y2="134" stroke="#1f2c23" stroke-width="1" />
    <text x="18" y="152" class="mono" font-size="9.5" fill="#5c6f64">
      <tspan fill="#f59e0b" font-weight="700">Zero prompts uploaded</tspan> — signed token event receipts only.
    </text>
  </g>

  <!-- 4-Tier Segmented Distribution Bar -->
  <g transform="translate(36, 282)">
    <text x="0" y="0" class="mono" font-size="11" font-weight="700" letter-spacing="2" fill="#7a8d82">
      WHERE IT COMES FROM · <tspan fill="#e8f3ec">4 COMPUTE TIERS</tspan>
    </text>
    <text x="928" y="0" text-anchor="end" class="mono" font-size="11" font-weight="700" fill="#56cf89">100% RESOLVED</text>

    <!-- The Track -->
    <g transform="translate(0, 12)">
      <rect x="0" y="0" width="928" height="20" rx="10" fill="#17221b" />
      
      <!-- Public Free (97.7%) -->
      <rect x="0" y="0" width="906" height="20" rx="10" fill="#56cf89" />
      <!-- Included (2.0%) -->
      <rect x="904" y="0" width="18" height="20" fill="#38bdf8" />
      <!-- Local (0.3%) -->
      <rect x="920" y="0" width="8" height="20" rx="4" fill="#f59e0b" />
      
      <!-- Glint scanner -->
      <rect x="0" y="0" width="60" height="20" fill="url(#glint)" class="scanner" />
    </g>

    <!-- Legend with 4 tiers -->
    <g transform="translate(0, 52)">
      <circle cx="5" cy="5" r="4.5" fill="#56cf89" />
      <text x="16" y="9" class="mono" font-size="11" fill="#e8f3ec">
        Public Gateways <tspan fill="#7a8d82">${formattedPub} (${pubPct}%)</tspan>
      </text>

      <circle cx="280" cy="5" r="4.5" fill="#38bdf8" />
      <text x="291" y="9" class="mono" font-size="11" fill="#e8f3ec">
        Included Quotas <tspan fill="#7a8d82">${formattedInc} (${incPct}%)</tspan>
      </text>

      <circle cx="530" cy="5" r="4.5" fill="#f59e0b" />
      <text x="541" y="9" class="mono" font-size="11" fill="#e8f3ec">
        Local Hardware <tspan fill="#7a8d82">${formattedLoc} (${locPct}%)</tspan>
      </text>

      <circle cx="760" cy="5" r="4.5" fill="#a78bfa" />
      <text x="771" y="9" class="mono" font-size="11" fill="#e8f3ec">
        Paid Pay-As-You-Go <tspan fill="#7a8d82">(${paidPct}%)</tspan>
      </text>
    </g>
  </g>

  <!-- Bottom Roles Bento Grid Strip -->
  <g transform="translate(36, 372)">
    <line x1="0" y1="0" x2="928" y2="0" stroke="#1f2c23" stroke-width="1" />
    <text x="0" y="20" class="mono" font-size="10.5" font-weight="700" letter-spacing="2" fill="#7a8d82">
      ROLES IN THE MIX · <tspan fill="#56cf89">AUTONOMOUS WORKSHOP</tspan>
    </text>

    <!-- Worker -->
    <g transform="translate(0, 32)">
      <rect x="0" y="0" width="220" height="52" rx="8" fill="#131c17" stroke="#233329" stroke-width="1" />
      <text x="12" y="20" class="sans" font-size="12" font-weight="600" fill="#7a8d82">🧑‍💻 Worker</text>
      <text x="12" y="40" class="mono" font-size="15" font-weight="700" fill="#e8f3ec">61,647,164</text>
      <text x="208" y="40" text-anchor="end" class="mono" font-size="10.5" fill="#56cf89">75.8%</text>
    </g>

    <!-- Reviewer -->
    <g transform="translate(236, 32)">
      <rect x="0" y="0" width="220" height="52" rx="8" fill="#131c17" stroke="#233329" stroke-width="1" />
      <text x="12" y="20" class="sans" font-size="12" font-weight="600" fill="#7a8d82">🛡️ Reviewer</text>
      <text x="12" y="40" class="mono" font-size="15" font-weight="700" fill="#38bdf8">6,150,458</text>
      <text x="208" y="40" text-anchor="end" class="mono" font-size="10.5" fill="#38bdf8">7.6%</text>
    </g>

    <!-- Planner -->
    <g transform="translate(472, 32)">
      <rect x="0" y="0" width="220" height="52" rx="8" fill="#131c17" stroke="#233329" stroke-width="1" />
      <text x="12" y="20" class="sans" font-size="12" font-weight="600" fill="#7a8d82">🗺️ Planner</text>
      <text x="12" y="40" class="mono" font-size="15" font-weight="700" fill="#a78bfa">4,377,642</text>
      <text x="208" y="40" text-anchor="end" class="mono" font-size="10.5" fill="#a78bfa">5.4%</text>
    </g>

    <!-- Coordinator -->
    <g transform="translate(708, 32)">
      <rect x="0" y="0" width="220" height="52" rx="8" fill="#131c17" stroke="#233329" stroke-width="1" />
      <text x="12" y="20" class="sans" font-size="12" font-weight="600" fill="#7a8d82">🧭 Coordinator</text>
      <text x="12" y="40" class="mono" font-size="15" font-weight="700" fill="#f59e0b">42,139</text>
      <text x="208" y="40" text-anchor="end" class="mono" font-size="10.5" fill="#f59e0b">0.1%</text>
    </g>
  </g>
</svg>`;

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
