import Link from "next/link";
import { getEngineStats } from "@/lib/engine-stats";
import { currentMember } from "@/lib/current-member";
import ModelExplorer from "./model-explorer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "The Engine Room · Compute Observatory · cheapoS",
  description:
    "Community index of zero-cost AI intelligence: global free model power rankings and autonomous agent role breakdown.",
};

function formatTokens(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

export default async function EnginePage() {
  const [stats, member] = await Promise.all([getEngineStats(), currentMember()]);

  const catTotal =
    stats.categories.public_free +
      stats.categories.included +
      stats.categories.local || stats.totalTokens || 1;

  const pubPct = ((stats.categories.public_free / catTotal) * 100).toFixed(1);
  const incPct = ((stats.categories.included / catTotal) * 100).toFixed(1);
  const locPct = ((stats.categories.local / catTotal) * 100).toFixed(1);

  return (
    <div className="engine-page">
      {/* Hero Header */}
      <section className="intro engine-intro">
        <div className="eyebrow">
          <span className="little-spark" aria-hidden="true">⚙️</span>
          THE ENGINE ROOM · CLUB COMPUTE OBSERVATORY
        </div>
        <h1>
          What Gets Built When<br />
          <em>Compute Costs $0.00.</em>
        </h1>
        <p className="lede">
          The community index of zero-dollar intelligence. Aggregated telemetry across
          active installations, {stats.uniqueModelCount} benchmarked models, and 4
          autonomous cognitive agent roles.
        </p>
      </section>

      {/* Global Telemetry KPI Strip */}
      <section className="engine-kpis" aria-label="Global compute telemetry">
        <div className="engine-kpi-card">
          <span className="kpi-label">TOTAL ZERO-COST TOKENS</span>
          <strong className="kpi-val kpi-mint">
            {stats.totalTokens.toLocaleString("en-US")}
          </strong>
          <span className="kpi-sub">100% verified on-device receipts</span>
        </div>

        <div className="engine-kpi-card">
          <span className="kpi-label">MODELS BENCHMARKED</span>
          <strong className="kpi-val">{stats.uniqueModelCount}</strong>
          <span className="kpi-sub">across 4 major free gateways</span>
        </div>

        <div className="engine-kpi-card">
          <span className="kpi-label">AUTONOMOUS PERSONAS</span>
          <strong className="kpi-val" style={{ color: "#38bdf8" }}>
            {stats.roles.length}
          </strong>
          <span className="kpi-sub">Worker, Reviewer, Planner, Coordinator</span>
        </div>

        <div className="engine-kpi-card">
          <span className="kpi-label">COMMERCIAL BILLS AVOIDED</span>
          <strong className="kpi-val" style={{ color: "#a78bfa" }}>
            ~${stats.estimatedCommercialRetailTotal.toFixed(2)}
          </strong>
          <span className="kpi-sub">$0.00 actual out-of-pocket spend</span>
        </div>
      </section>

      {/* Section 1: The Autonomous Workshop Ratios (Roles in the mix) */}
      <section className="engine-section" aria-labelledby="roles-heading">
        <div className="engine-section-header">
          <div className="engine-eyebrow">
            <span className="little-spark" aria-hidden="true">🧠</span>
            COGNITIVE DIVISION OF LABOR
          </div>
          <h2 id="roles-heading">Autonomous Workshop Roles</h2>
          <p className="engine-section-desc">
            How autonomous cheapoS agent swarms divide their cognitive workloads when
            executing software tasks.
          </p>
        </div>

        <div className="engine-roles-grid">
          {stats.roles.map((r) => (
            <div className="engine-role-card" key={r.name}>
              <div className="role-top-row">
                <span className="role-icon-badge">{r.icon}</span>
                <span className="role-pct-badge" style={{ color: r.color }}>
                  {r.pct}% share
                </span>
              </div>
              <h3 className="role-title">{r.displayName}</h3>
              <p className="role-desc">{r.description}</p>
              <div className="role-footer-stat">
                <span className="role-tokens-num">{formatTokens(r.tokens)}</span>
                <span className="role-tokens-lbl">
                  {r.tokens.toLocaleString("en-US")} tokens
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Cognitive Ratio Callout Box */}
        <div className="ratio-callout-box">
          <div className="ratio-callout-icon" aria-hidden="true">💡</div>
          <div>
            <strong>Cognitive Ratio Benchmark:</strong> For every 10 tokens a Worker generates
            executing code, Reviewers audit ~{stats.cognitiveRatio.reviewerToWorkerRatio} tokens,
            and Planners structure ~0.7 tokens. Autonomous quality assurance accounts for ~
            {stats.roles.find((r) => r.name === "reviewer")?.pct || "8"}% of overall compute.
          </div>
        </div>
      </section>

      {/* Section 2: The Free Model Power Rankings */}
      <section className="engine-section" aria-labelledby="models-heading">
        <div className="engine-section-header">
          <div className="engine-eyebrow">
            <span className="little-spark" aria-hidden="true">📊</span>
            THE FREE TIER 500
          </div>
          <h2 id="models-heading">Free Model Power Rankings</h2>
          <p className="engine-section-desc">
            Which free frontier models do software builders actually choose when compute is
            free? Live telemetry aggregated across installations.
          </p>
        </div>

        <ModelExplorer models={stats.models} />
      </section>

      {/* Section 3: Zero-Dollar Infrastructure Matrix */}
      <section className="engine-section" aria-labelledby="infra-heading">
        <div className="engine-section-header">
          <div className="engine-eyebrow">
            <span className="little-spark" aria-hidden="true">🌐</span>
            INFRASTRUCTURE PROVENANCE
          </div>
          <h2 id="infra-heading">Where the Zero-Cost Compute Originates</h2>
        </div>

        <div className="infra-grid">
          <div className="infra-card">
            <div className="infra-top">
              <span className="infra-dot dot-public-free" aria-hidden="true"></span>
              <span className="infra-pct">{pubPct}%</span>
            </div>
            <h3>Public Free Gateways</h3>
            <p>
              Free developer endpoints from Google AI Studio, Groq Cloud, OpenRouter
              free tiers, and Cohere.
            </p>
            <strong className="infra-tokens">
              {stats.categories.public_free.toLocaleString("en-US")} tokens
            </strong>
          </div>

          <div className="infra-card">
            <div className="infra-top">
              <span className="infra-dot dot-included" aria-hidden="true"></span>
              <span className="infra-pct">{incPct}%</span>
            </div>
            <h3>Included Account Quotas</h3>
            <p>
              Pre-bundled allowances from existing developer environments and free-tier
              subscriptions.
            </p>
            <strong className="infra-tokens">
              {stats.categories.included.toLocaleString("en-US")} tokens
            </strong>
          </div>

          <div className="infra-card">
            <div className="infra-top">
              <span className="infra-dot dot-local" aria-hidden="true"></span>
              <span className="infra-pct">{locPct}%</span>
            </div>
            <h3>Local Hardware</h3>
            <p>
              On-device inference powered by Apple Silicon unified memory (MLX), local
              Ollama instances, and CPU fallback.
            </p>
            <strong className="infra-tokens">
              {stats.categories.local.toLocaleString("en-US")} tokens
            </strong>
          </div>
        </div>
      </section>

      {/* Bottom Banner */}
      <section className="bottom-banner">
        <span className="banner-star" aria-hidden="true">✳</span>
        <div>
          <h2>Want your compute on the observatory?</h2>
          <p>Download cheapoS, start building for $0, and sync with the club.</p>
        </div>
        <Link className="button" href={member ? "/account" : "/join"}>
          {member ? "Your installation settings ↗" : "Join the club ↗"}
        </Link>
      </section>
    </div>
  );
}
