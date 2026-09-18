import { CURRENT_SPOTLIGHT } from "../lib/sponsor-data";

export default function SponsorHero() {
  const s = CURRENT_SPOTLIGHT;
  const isAvailable = s.status === "available";

  return (
    <section className="sponsor-spotlight" aria-labelledby="spotlight-title">
      <div className="spotlight-inner">
        <div className="spotlight-header">
          <div className="spotlight-badges">
            <span className={`spotlight-badge ${isAvailable ? "badge-open" : "badge-active"}`}>
              {isAvailable ? "✳ SPOTLIGHT SLOT OPEN" : "★ FEATURED FRUGAL ENGINE"}
            </span>
            <span className="spotlight-context">Autonomous Agent Benchmark Partner</span>
          </div>
          <a href="/sponsors" className="spotlight-learn-link">
            Sponsor prospectus ↗
          </a>
        </div>

        <div className="spotlight-content">
          <div className="spotlight-main">
            <h2 id="spotlight-title">
              {isAvailable ? (
                <>
                  Put your engine here.<br />
                  <em>Prove it on real agent tasks.</em>
                </>
              ) : (
                <>
                  {s.modelName}<br />
                  <em>by {s.provider}</em>
                </>
              )}
            </h2>
            <p className="spotlight-tagline">{s.tagline}</p>
            <p className="spotlight-desc">{s.description}</p>

            <div className="spotlight-actions">
              <a href={s.actionUrl} className="button primary spotlight-btn">
                {s.actionLabel}
              </a>
              <a href="/engine" className="button secondary">
                View telemetry & models →
              </a>
            </div>
          </div>

          <div className="spotlight-telemetry-panel">
            <div className="panel-title">
              <span className="sparkle">⚡</span> Why benchmark here
            </div>
            <div className="panel-metrics">
              <div className="panel-metric">
                <span className="metric-label">Community compute</span>
                <strong className="metric-value">40M+ Tokens</strong>
                <span className="metric-note">Real autonomous tasks</span>
              </div>
              <div className="panel-metric">
                <span className="metric-label">Target audience</span>
                <strong className="metric-value">Agent Builders</strong>
                <span className="metric-note">With active API keys</span>
              </div>
              <div className="panel-metric">
                <span className="metric-label">Proof mechanism</span>
                <strong className="metric-value">Cryptographic</strong>
                <span className="metric-note">Merkle task receipts</span>
              </div>
            </div>
            <div className="panel-footer">
              <div className="anti-cheat-pill" title="No prized games or paid rankings">
                🛡️ Zero Prized Games · Rankings Unbuyable
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
