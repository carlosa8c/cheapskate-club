"use client";

import { useState, useMemo } from "react";
import type { ModelStat } from "@/lib/model-helpers";

export interface ModelExplorerProps {
  models: ModelStat[];
}

function formatTokens(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

export default function ModelExplorer({ models }: ModelExplorerProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const providers = useMemo(() => {
    const list = Array.from(new Set(models.map((m) => m.provider)));
    return ["all", ...list];
  }, [models]);

  const filteredModels = useMemo(() => {
    return models.filter((m) => {
      const matchProvider =
        selectedProvider === "all" || m.provider === selectedProvider;
      const matchSearch =
        !searchQuery ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.cleanName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchProvider && matchSearch;
    });
  }, [models, selectedProvider, searchQuery]);

  const maxTokens = models[0]?.tokens || 1;

  return (
    <div className="model-explorer">
      {/* Controls: Filter Pills & Search */}
      <div className="model-explorer-toolbar">
        <div className="provider-filters" role="tablist" aria-label="Filter models by provider">
          {providers.map((p) => {
            const count =
              p === "all" ? models.length : models.filter((m) => m.provider === p).length;
            const label = p === "all" ? "All Providers" : p;
            return (
              <button
                key={p}
                role="tab"
                aria-selected={selectedProvider === p}
                className={`provider-filter-btn ${selectedProvider === p ? "active" : ""}`}
                onClick={() => setSelectedProvider(p)}
              >
                {label} <span className="provider-filter-count">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="model-search-box">
          <input
            type="search"
            placeholder="Search model names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="model-search-input"
            aria-label="Search models"
          />
        </div>
      </div>

      {/* Model List Table */}
      <div className="model-table-wrap">
        <table className="model-table">
          <thead>
            <tr>
              <th style={{ width: "48px" }}>#</th>
              <th>Model Name</th>
              <th>Provider</th>
              <th>Compute Share</th>
              <th style={{ textAlign: "right" }}>Total Tokens</th>
              <th style={{ textAlign: "right" }}>Bills Eliminated</th>
            </tr>
          </thead>
          <tbody>
            {filteredModels.map((m, idx) => {
              const relativeBarWidth = Math.max(2, (m.tokens / maxTokens) * 100);
              return (
                <tr key={m.name}>
                  <td className="rank-cell-num">{idx + 1}</td>
                  <td>
                    <div className="model-cell-name">
                      <strong>{m.cleanName}</strong>
                      {m.cleanName !== m.name && (
                        <small className="model-raw-tag">{m.name}</small>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className="provider-pill"
                      style={{
                        borderColor: m.providerBadgeColor,
                        color: m.providerBadgeColor,
                      }}
                    >
                      {m.provider}
                    </span>
                  </td>
                  <td>
                    <div className="model-bar-cell">
                      <div className="model-progress-bg">
                        <div
                          className="model-progress-fill"
                          style={{
                            width: `${relativeBarWidth}%`,
                            backgroundColor: m.providerBadgeColor,
                          }}
                        />
                      </div>
                      <span className="model-pct-num">{m.pct}%</span>
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }} className="mono-tokens">
                    <strong>{formatTokens(m.tokens)}</strong>
                  </td>
                  <td style={{ textAlign: "right" }} className="mono-savings">
                    ~${m.estimatedSavings.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredModels.length === 0 && (
          <div className="empty-models-notice">
            <p>No models matched your filter. Try clearing the search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
