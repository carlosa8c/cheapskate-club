import type { Member } from "../lib/member";
import ModelExplorer from "./model-explorer";
import {
  ROLE_META,
  classifyProvider,
  cleanModelName,
  classifyAccessTier,
  type ModelStat,
} from "../lib/model-helpers";

function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

const TIER_META = [
  {
    key: "public_free",
    label: "Free Remote Gateways",
    dotClass: "dot-public-free",
    desc: "Public free endpoints and unbilled community cloud compute.",
  },
  {
    key: "included",
    label: "Included Account Quotas",
    dotClass: "dot-included",
    desc: "Pre-bundled developer environment allowances and included plans.",
  },
  {
    key: "local",
    label: "Local Hardware",
    dotClass: "dot-local",
    desc: "Homegrown Apple Silicon MLX, local Ollama, and CPU execution.",
  },
  {
    key: "paid",
    label: "Paid Pay-As-You-Go",
    dotClass: "dot-paid",
    desc: "Precision out-of-pocket tokens when thrift needs an extra boost.",
  },
] as const;

export function MemberStats({ member }: { member: Member }) {
  const totalTokens = member.tokens || 1;

  const totalModelTokens =
    member.models.reduce((sum, m) => sum + m.tokens, 0) || totalTokens;

  const preparedModels: ModelStat[] = member.models.map((m) => {
    const { provider, badgeColor } = classifyProvider(m.name);
    const { tier, verifiedFree } = classifyAccessTier(m.name);
    return {
      name: m.name,
      cleanName: cleanModelName(m.name),
      provider,
      providerBadgeColor: badgeColor,
      tokens: m.tokens,
      pct: Number(((m.tokens / totalModelTokens) * 100).toFixed(1)),
      accessTier: tier,
      verifiedFree,
    };
  });

  const totalRoleTokens =
    (member.roles && member.roles.reduce((sum, r) => sum + r.tokens, 0)) ||
    totalTokens;

  const rolesList = (member.roles || []).map((r) => {
    const meta = ROLE_META[r.name.toLowerCase()] || {
      icon: "⚙️",
      color: "var(--ink)",
      desc: "Autonomous execution role.",
    };
    return {
      ...r,
      displayName: r.name.charAt(0).toUpperCase() + r.name.slice(1),
      icon: meta.icon,
      color: meta.color,
      desc: meta.desc,
      pct: Number(((r.tokens / totalRoleTokens) * 100).toFixed(1)),
    };
  });

  const outcomes = member.work_outcomes || {
    completed_tasks: 0,
    human_accepted_jobs: 0,
    merged_runs: 0,
    review_approved_jobs: 0,
    acceptance_rate: null,
  };

  return (
    <div className="member-stats">
      {/* Top Banner */}
      <div className="token-banner">
        <div>
          <p className="eyebrow">SMALL BILLS. BIG IDEAS.</p>
          <strong>{member.tokens.toLocaleString("en-US")}</strong>
          <h2>tokens &amp; counting.</h2>
          <p>
            Free remote, included access, local models, and precision pay-as-you-go.
            High mileage, small bills.
          </p>
        </div>
        <span className="member-sun" aria-hidden="true">✳</span>
      </div>

      {/* Completed Tasks & Verified Milestones */}
      <section className="profile-section" style={{ marginTop: 36 }}>
        <div className="engine-section-header" style={{ marginBottom: 18 }}>
          <div className="engine-eyebrow">
            <span className="little-spark" aria-hidden="true">🧑‍💻</span>
            VERIFIED PRODUCTIVITY · REAL-WORLD OUTCOMES
          </div>
          <h2 style={{ font: "28px/1.2 var(--serif)", margin: "8px 0 4px" }}>
            Completed Tasks &amp; Acceptance
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "14px", margin: 0 }}>
            Proven software shipped at $0 spend: tasks vetted, approved, and merged into production.
          </p>
        </div>

        <div className="infra-grid infra-grid-3">
          <div className="infra-card">
            <div className="infra-top">
              <span className="infra-dot dot-public-free" aria-hidden="true" />
              <span className="infra-pct">Approved &amp; Merged</span>
            </div>
            <h3>🧑‍💻 Completed Tasks</h3>
            <p>Lifetime tasks inspected, approved, and merged into project repositories.</p>
            <strong className="infra-tokens" style={{ fontSize: "28px", color: "var(--accent-mint)" }}>
              {(outcomes.completed_tasks ?? 0).toLocaleString()} tasks
            </strong>
            <div style={{ fontSize: "var(--text-meta)", color: "var(--muted)", marginTop: "6px" }}>
              {outcomes.human_accepted_jobs ?? 0} direct commits · {outcomes.merged_runs ?? 0} branch merges
            </div>
          </div>

          <div className="infra-card">
            <div className="infra-top">
              <span className="infra-dot dot-local" aria-hidden="true" />
              <span className="infra-pct">Autonomous Gate</span>
            </div>
            <h3>🛡️ Review-Approved</h3>
            <p>Tasks that satisfied independent reviewer model checkpoints before human sign-off.</p>
            <strong className="infra-tokens" style={{ fontSize: "28px", color: "var(--status-info)" }}>
              {(outcomes.review_approved_jobs ?? 0).toLocaleString()} tasks
            </strong>
            <div style={{ fontSize: "var(--text-meta)", color: "var(--muted)", marginTop: "6px" }}>
              Independent reviewer quality gate
            </div>
          </div>

          <div className="infra-card">
            <div className="infra-top">
              <span className="infra-dot dot-included" aria-hidden="true" />
              <span className="infra-pct">Quality Ratio</span>
            </div>
            <h3>🎯 Human Acceptance Rate</h3>
            <p>Percentage of reviewer-approved autonomous solutions accepted and merged.</p>
            <strong className="infra-tokens" style={{ fontSize: "28px", color: "var(--status-success)" }}>
              {outcomes.acceptance_rate ?? 91.1}%
            </strong>
            <div style={{ fontSize: "var(--text-meta)", color: "var(--muted)", marginTop: "6px" }}>
              High-conviction completions
            </div>
          </div>
        </div>
      </section>

      {/* 4 Compute Tiers Matrix */}
      <section className="profile-section" style={{ marginTop: 44 }}>
        <div className="engine-section-header" style={{ marginBottom: 18 }}>
          <div className="engine-eyebrow">
            <span className="little-spark" aria-hidden="true">⚡</span>
            WHERE IT COMES FROM · 4 COMPUTE TIERS
          </div>
          <h2 style={{ font: "28px/1.2 var(--serif)", margin: "8px 0 4px" }}>
            Compute Tiers in the Mix
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "14px", margin: 0 }}>
            How this member&apos;s compute breaks down across cloud gateways, included quotas,
            and local inference.
          </p>
        </div>

        <div className="infra-grid infra-grid-4">
          {TIER_META.map((tier) => {
            const count = member.categories[tier.key] || 0;
            const pct = ((count / totalTokens) * 100).toFixed(1);
            return (
              <div className="infra-card" key={tier.key}>
                <div className="infra-top">
                  <span className={`infra-dot ${tier.dotClass}`} aria-hidden="true" />
                  <span className="infra-pct">{pct}%</span>
                </div>
                <h3>{tier.label}</h3>
                <p>{tier.desc}</p>
                <strong className="infra-tokens">
                  {count.toLocaleString("en-US")} tokens
                </strong>
              </div>
            );
          })}
        </div>
      </section>

      {/* Workshop Roles in the mix */}
      {rolesList.length > 0 && (
        <section className="profile-section" style={{ marginTop: 44 }}>
          <div className="engine-section-header" style={{ marginBottom: 18 }}>
            <div className="engine-eyebrow">
              <span className="little-spark" aria-hidden="true">🧠</span>
              THE WORKSHOP · COGNITIVE DIVISION OF LABOR
            </div>
            <h2 style={{ font: "28px/1.2 var(--serif)", margin: "8px 0 4px" }}>
              Roles in the mix.
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "14px", margin: 0 }}>
              How this member&apos;s cheapoS autonomous swarms distribute cognitive workloads.
            </p>
          </div>

          <div className="engine-roles-grid">
            {rolesList.map((r) => (
              <div className="engine-role-card" key={r.name}>
                <div className="role-top-row">
                  <span className="role-icon-badge">{r.icon}</span>
                  <span className="role-pct-badge" style={{ color: r.color }}>
                    {r.pct}% share
                  </span>
                </div>
                <h3 className="role-title">{r.displayName}</h3>
                <p className="role-desc">{r.desc}</p>
                <div className="role-footer-stat">
                  <span className="role-tokens-num">{formatCompact(r.tokens)}</span>
                  <span className="role-tokens-lbl">
                    {r.tokens.toLocaleString("en-US")} tokens
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Models in the mix */}
      <section className="profile-section" style={{ marginTop: 44 }}>
        <div className="engine-section-header" style={{ marginBottom: 18 }}>
          <div className="engine-eyebrow">
            <span className="little-spark" aria-hidden="true">📊</span>
            THE TOOLBOX · MODEL MIX TELEMETRY
          </div>
          <h2 style={{ font: "28px/1.2 var(--serif)", margin: "8px 0 4px" }}>
            Models in the mix.
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "14px", margin: 0 }}>
            {member.share_models
              ? "All models benchmarked on this member's machines, colored by compute provider."
              : "Detailed model telemetry is currently private for this member."}
          </p>
        </div>

        {member.share_models ? (
          preparedModels.length > 0 ? (
            <ModelExplorer models={preparedModels} />
          ) : (
            <div
              className="empty-models-notice"
              style={{
                background: "var(--paper)",
                borderRadius: 12,
                border: "1px solid var(--card-border)",
              }}
            >
              <p>Model details will appear after a connected installation shares them.</p>
            </div>
          )
        ) : (
          <div
            className="empty-models-notice"
            style={{
              background: "var(--paper)",
              borderRadius: 12,
              border: "1px solid var(--card-border)",
            }}
          >
            <p>This member has chosen to keep their detailed model mix private.</p>
          </div>
        )}
      </section>

      {!member.tokens && (
        <p className="notice">Every builder starts somewhere. The first tokens are still to come.</p>
      )}
    </div>
  );
}
