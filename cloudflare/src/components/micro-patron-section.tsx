"use client";

import { MICRO_PATRON_TIERS } from "../lib/sponsor-data";
import "../styles/micro-patron.css";

export default function MicroPatronSection() {
  return (
    <section className="micro-patron-section" aria-labelledby="patron-title">
      <div className="micro-patron-header">
        <div className="eyebrow">
          <span className="little-spark" aria-hidden="true">🪙</span>
          PILLAR 3: COMMUNITY MICRO-PATRONAGE
        </div>
        <h2 id="patron-title" className="micro-patron-title">
          The Penny-Pincher Tiers
        </h2>
        <p className="micro-patron-subtitle">
          Coffee is too expensive. Buy us a single penny of compute instead. Back the open-source cheapoS engine with developer-native micro-sponsorships.
        </p>
      </div>

      <div className="micro-patron-grid">
        {MICRO_PATRON_TIERS.map((tier) => (
          <article key={tier.id} className="micro-patron-card">
            <div>
              <div className="micro-patron-card-header">
                <span className="micro-patron-badge">{tier.badge}</span>
                <h3 className="micro-patron-tier-name">{tier.name}</h3>
                <div className="micro-patron-price">{tier.price}</div>
                <div className="micro-patron-tagline">“{tier.tagline}”</div>
              </div>

              <ul className="micro-patron-perks">
                {tier.perks.map((perk, i) => (
                  <li key={i} className="micro-patron-perk-item">
                    <span>✓</span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <a
              href={tier.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="micro-patron-cta-btn"
            >
              Back this tier on GitHub Sponsors ↗
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
