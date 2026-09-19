"use client";

import { useState } from "react";
import type { ModelPairStat, ProviderHealthStat, SelfHealingIndex } from "../lib/model-helpers";

export interface SponsorVaultPreviewProps {
  modelPairs: ModelPairStat[];
  providerReliability: ProviderHealthStat[];
  selfHealingIndex: SelfHealingIndex;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

export default function SponsorVaultPreview({
  modelPairs,
  providerReliability,
  selfHealingIndex,
}: SponsorVaultPreviewProps) {
  const [activeTab, setActiveTab] = useState<"pairs" | "providers" | "healing">("pairs");

  return (
    <div className="vault-preview-container">
      <div className="vault-preview-header">
        <div className="vault-badge-row">
          <span className="vault-badge">SPONSOR &amp; PARTNER INTELLIGENCE</span>
          <span className="vault-live-indicator">● LIVE SWARM TELEMETRY</span>
        </div>
        <h3>The Swarm Intelligence Vault</h3>
        <p className="vault-subtitle">
          Empirical, multi-agent execution telemetry: benchmark model-pair synergies, track free-tier provider throttles, and measure autonomous self-healing recovery costs.
        </p>

        <div className="vault-tabs" role="tablist" aria-label="Intelligence Vault Tabs">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "pairs"}
            className={`vault-tab-btn ${activeTab === "pairs" ? "active" : ""}`}
            onClick={() => setActiveTab("pairs")}
          >
            🤝 Model-Pair Synergy ({modelPairs.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "providers"}
            className={`vault-tab-btn ${activeTab === "providers" ? "active" : ""}`}
            onClick={() => setActiveTab("providers")}
          >
            ⚡ Provider Reliability &amp; Latency
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "healing"}
            className={`vault-tab-btn ${activeTab === "healing" ? "active" : ""}`}
            onClick={() => setActiveTab("healing")}
          >
            🩹 Self-Healing Overhead ({selfHealingIndex.repairOverheadPct}%)
          </button>
        </div>
      </div>

      <div className="vault-content">
        {/* Tab 1: Model-Pair Synergy Matrix */}
        {activeTab === "pairs" && (
          <div className="vault-panel">
            <div className="vault-panel-intro">
              <p>
                <strong>Worker + Reviewer Pair Leaderboard:</strong> Evaluates which model combinations yield the highest first-pass approval and lowest token overhead when paired in an independent review loop.
              </p>
            </div>
            <div className="vault-table-wrapper">
              <table className="vault-table">
                <thead>
                  <tr>
                    <th>Worker Model</th>
                    <th>Senior Reviewer</th>
                    <th>Total Jobs</th>
                    <th>Approval Rate</th>
                    <th>Avg Tokens / Task</th>
                    <th>Verification Gate</th>
                  </tr>
                </thead>
                <tbody>
                  {modelPairs.map((pair) => (
                    <tr key={pair.pairId}>
                      <td>
                        <div className="model-cell">
                          <span className="model-role-tag worker-tag">Worker</span>
                          <code>{pair.workerModel}</code>
                        </div>
                      </td>
                      <td>
                        <div className="model-cell">
                          <span className="model-role-tag reviewer-tag">Reviewer</span>
                          <code>{pair.reviewerModel}</code>
                        </div>
                      </td>
                      <td className="num-cell">{pair.totalJobs} jobs</td>
                      <td>
                        <div className="rate-cell">
                          <span className="rate-value">{pair.completionRate.toFixed(0)}%</span>
                          <div className="rate-bar" style={{ width: `${Math.min(pair.completionRate, 100)}%` }} />
                        </div>
                      </td>
                      <td className="num-cell tabular-nums">
                        {formatTokens(pair.avgTokensPerJob || Math.round(pair.totalTokens / pair.totalJobs))}
                      </td>
                      <td>
                        {pair.isIndependent ? (
                          <span className="gate-tag gate-independent" title="Independent cross-vendor review enforced">
                            🛡️ Independent
                          </span>
                        ) : (
                          <span className="gate-tag gate-homogenous" title="Same-model verification">
                            ⚠️ Intra-model
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Provider Reliability Heatmap */}
        {activeTab === "providers" && (
          <div className="vault-panel">
            <div className="vault-panel-intro">
              <p>
                <strong>Inference Provider Reliability:</strong> Real-world request performance, latency, and HTTP 429 rate-limit throttle frequencies observed during autonomous agent tool loops.
              </p>
            </div>
            <div className="provider-grid">
              {providerReliability.map((prov) => (
                <div key={prov.provider} className="provider-health-card">
                  <div className="provider-card-header">
                    <h4>{prov.provider}</h4>
                    <span className={`status-badge status-${prov.status.toLowerCase()}`}>
                      {prov.status}
                    </span>
                  </div>
                  <div className="provider-metrics">
                    <div>
                      <span className="metric-label">Success Rate</span>
                      <span className="metric-val">{prov.successRate.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="metric-label">Avg Latency</span>
                      <span className="metric-val">{prov.avgLatencyMs}ms</span>
                    </div>
                    <div>
                      <span className="metric-label">429 Rate Limit Mix</span>
                      <span className="metric-val throttle-val">{prov.rateLimitPct.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="metric-label">Audited Calls</span>
                      <span className="metric-val">{prov.totalRequests.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="latency-bar-container">
                    <div className="latency-bar-track">
                      <div
                        className="latency-bar-fill"
                        style={{
                          width: `${Math.min((prov.avgLatencyMs / 1000) * 100, 100)}%`,
                          background: prov.badgeColor,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Self-Healing Overhead Index */}
        {activeTab === "healing" && (
          <div className="vault-panel">
            <div className="vault-panel-intro">
              <p>
                <strong>Autonomous Self-Healing Efficiency:</strong> Quantifies the token investment required for the agent to inspect compiler failures, fix test defects, and satisfy reviewer disputes without human intervention.
              </p>
            </div>
            <div className="healing-index-card">
              <div className="healing-split-bar">
                <div
                  className="healing-segment work-segment"
                  style={{ width: `${100 - selfHealingIndex.repairOverheadPct}%` }}
                  title={`Initial Code Generation: ${formatTokens(selfHealingIndex.initialWorkTokens)} tokens (${(100 - selfHealingIndex.repairOverheadPct).toFixed(1)}%)`}
                >
                  <span>Initial Work ({ (100 - selfHealingIndex.repairOverheadPct).toFixed(1) }%)</span>
                </div>
                <div
                  className="healing-segment recovery-segment"
                  style={{ width: `${selfHealingIndex.repairOverheadPct}%` }}
                  title={`Self-Healing Recovery: ${formatTokens(selfHealingIndex.recoveryTokens)} tokens (${selfHealingIndex.repairOverheadPct.toFixed(1)}%)`}
                >
                  <span>Self-Healing Repair ({ selfHealingIndex.repairOverheadPct }%)</span>
                </div>
              </div>

              <div className="healing-stats-grid">
                <div className="healing-stat-box">
                  <span className="stat-desc">Initial Code Generation</span>
                  <span className="stat-number">{formatTokens(selfHealingIndex.initialWorkTokens)}</span>
                  <span className="stat-sub">Tokens dispatched to implement initial specifications</span>
                </div>
                <div className="healing-stat-box">
                  <span className="stat-desc">Self-Correction &amp; Repair</span>
                  <span className="stat-number">{formatTokens(selfHealingIndex.recoveryTokens)}</span>
                  <span className="stat-sub">Tokens spent in test-failure repair loops</span>
                </div>
                <div className="healing-stat-box highlight-box">
                  <span className="stat-desc">Repair Overhead Ratio</span>
                  <span className="stat-number">{selfHealingIndex.repairOverheadPct}%</span>
                  <span className="stat-sub">Overhead to achieve 100% test pass autonomously</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sponsor CTA Callout */}
      <div className="vault-footer-cta">
        <div className="cta-copy">
          <strong>Need deeper diagnostic intelligence or raw telemetry exports?</strong>
          <span>Support cheapoS on GitHub Sponsors or Polar to unlock full swarm data feeds and sponsor placement.</span>
        </div>
        <div className="cta-actions">
          <a
            href="https://github.com/sponsors/cheapoS"
            target="_blank"
            rel="noopener noreferrer"
            className="vault-action-btn primary"
          >
            Sponsor on GitHub ↗
          </a>
          <a
            href="/sponsors"
            className="vault-action-btn secondary"
          >
            Explore Sponsorship Tiers →
          </a>
        </div>
      </div>

      
    </div>
  );
}
