import type { Metadata } from "next";
import Link from "next/link";
import { SPONSOR_TIERS, FRUGAL_TOOLS } from "@/lib/sponsor-data";

export const metadata: Metadata = {
  title: "Sponsor the Club · The Cheapskate Club",
  description:
    "Partner with the Cheapskate Club. Reach autonomous AI builders obsessively optimizing cost per completed task.",
};

export default function SponsorsPage() {
  return (
    <div className="sponsors-page">
      {/* Hero Section */}
      <section className="intro sponsors-intro">
        <div className="eyebrow">
          <span className="little-spark" aria-hidden="true">✳</span>
          B2B INFRASTRUCTURE & TOOL SPONSORSHIPS
        </div>
        <h1>
          Where builders obsess over<br />
          <em>cost per completed task.</em>
        </h1>
        <p className="lede">
          cheapoS builders don’t read synthetic benchmarks. They run autonomous multi-agent
          coding swarms with API keys in hand, obsessively hunting for the highest intelligence
          at the lowest cost.
        </p>
        <div className="hero-actions" style={{ marginTop: 24 }}>
          <a
            className="button primary"
            href="mailto:carlos@tumblr.com?subject=Cheapskate%20Club%20Sponsorship%20Inquiry"
          >
            Inquire about sponsorship ✉️
          </a>
          <Link className="button" href="/engine">
            View live compute telemetry →
          </Link>
        </div>
      </section>

      {/* Telemetry Strip */}
      <section className="sponsors-stats-strip" aria-label="Audience telemetry">
        <div className="sponsor-stat">
          <span className="stat-num">40M+</span>
          <span className="stat-label">Verified Tokens Benchmarked</span>
        </div>
        <div className="sponsor-stat">
          <span className="stat-num">&lt; $0.01</span>
          <span className="stat-label">Average Task Cost Target</span>
        </div>
        <div className="sponsor-stat">
          <span className="stat-num">1-Click</span>
          <span className="stat-label">Local cheapoS CLI Config</span>
        </div>
        <div className="sponsor-stat">
          <span className="stat-num">100%</span>
          <span className="stat-label">Cryptographic Receipt Proofs</span>
        </div>
      </section>

      {/* The Anti-Cheat Axiom (Trust Callout) */}
      <section className="anti-cheat-section" aria-labelledby="anti-cheat-title">
        <div className="anti-cheat-box">
          <div className="anti-cheat-header">
            <span className="shield-icon" aria-hidden="true">🛡️</span>
            <div>
              <div className="eyebrow-small">OUR PLATFORM ETHICS</div>
              <h2 id="anti-cheat-title">The Anti-Cheat Axiom: Zero Prized Games</h2>
            </div>
          </div>
          <div className="anti-cheat-body">
            <p>
              <strong>Nothing motivates people to cheat more than money.</strong> The minute a
              platform offers cash prizes, bounties, or paid rank manipulation, adversarial gaming
              explodes: sybil accounts, forged receipts, mock token counters, and synthetic spam.
            </p>
            <p>
              To preserve the Cheapskate Club as the most trustworthy, credible benchmark in AI:
            </p>
            <ul className="anti-cheat-rules">
              <li>
                <strong>Rankings are 100% unbuyable:</strong> No amount of sponsorship money can buy
                a leaderboard spot or alter community attestation scores.
              </li>
              <li>
                <strong>No cash prize pools:</strong> Members compete for pure developer status,
                peer recognition, and unforgeable bragging rights.
              </li>
              <li>
                <strong>Sponsorship value is authentic:</strong> Providers sponsor the club to
                demonstrate legitimate price-performance, distribute developer trial credits, and
                earn verified task receipts from real builders.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Tier Packages */}
      <section className="sponsors-tiers-section" aria-labelledby="packages-title">
        <div className="section-header">
          <div className="eyebrow">
            <span className="little-spark" aria-hidden="true">💎</span>
            SPONSORSHIP PACKAGES
          </div>
          <h2 id="packages-title">Simple, transparent partnership tiers.</h2>
          <p>
            Zero enterprise sales friction. Book a monthly package and place your technology
            directly into the hands of autonomous agent builders.
          </p>
        </div>

        <div className="tiers-grid">
          {SPONSOR_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`tier-card ${tier.popular ? "tier-popular" : ""}`}
            >
              {tier.popular && (
                <div className="tier-badge-ribbon">⭐ MOST POPULAR</div>
              )}
              <div className="tier-eyebrow">{tier.eyebrow}</div>
              <h3 className="tier-name">{tier.name}</h3>
              <div className="tier-price-row">
                <span className="tier-price">{tier.price}</span>
                <span className="tier-period">/ {tier.period}</span>
              </div>
              <p className="tier-desc">{tier.description}</p>
              <hr className="tier-divider" />
              <div className="tier-deliverables-title">WHAT&apos;S INCLUDED:</div>
              <ul className="tier-deliverables">
                {tier.deliverables.map((item, idx) => (
                  <li key={idx}>
                    <span className="check" aria-hidden="true">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="tier-cta-wrap">
                <a
                  href={tier.ctaHref}
                  className={`button ${tier.popular ? "primary" : "secondary"} tier-btn`}
                >
                  {tier.ctaText} ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The Frugal Stack Directory Preview */}
      <section className="frugal-stack-section" aria-labelledby="tools-title">
        <div className="section-header">
          <div className="eyebrow">
            <span className="little-spark" aria-hidden="true">🛠️</span>
            THE FRUGAL STACK DIRECTORY
          </div>
          <h2 id="tools-title">Curated infrastructure for high-efficiency builders.</h2>
          <p>
            These are the budget-conscious APIs, hosting platforms, and databases that make
            low-cost agent workflows possible.
          </p>
        </div>

        <div className="frugal-tools-grid">
          {FRUGAL_TOOLS.map((tool) => (
            <div key={tool.name} className="frugal-tool-card">
              <div className="tool-top">
                <span className="tool-category-badge">{tool.category}</span>
                {tool.badge && (
                  <span className="tool-highlight-badge">{tool.badge}</span>
                )}
              </div>
              <h3 className="tool-name">{tool.name}</h3>
              <p className="tool-desc">{tool.description}</p>
              <div className="tool-pricing-box">
                <span className="pricing-icon">🏷️</span>
                <span>{tool.pricingHighlight}</span>
              </div>
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-link tool-link"
              >
                Visit provider ↗
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Booking / Contact CTA Box */}
      <section className="sponsors-cta-box">
        <span className="banner-star" aria-hidden="true">✳</span>
        <div>
          <h2>Ready to power the next million cheapoS tasks?</h2>
          <p>
            Tell us about your model or tool. We’ll get your config recipe and trial credits
            live on the club within 24 hours.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a
            className="button primary"
            href="mailto:carlos@tumblr.com?subject=Cheapskate%20Club%20Sponsorship%20Inquiry"
          >
            Email Carlos ✉️
          </a>
          <a
            className="button secondary"
            href="https://x.com/carlosa8c"
            target="_blank"
            rel="noopener noreferrer"
          >
            DM on X (@carlosa8c) ↗
          </a>
        </div>
      </section>
    </div>
  );
}
