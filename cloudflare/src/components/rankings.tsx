"use client";

import { useState } from "react";
import type { Board } from "../lib/leaderboard";
import type { ModelPairStat } from "../lib/model-helpers";
import { Avatar } from "./club-art";
import { getCheapoTitle } from "../lib/cheapo-titles";

function formatTokens(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

export default function Rankings({
  board,
  period,
  modelPairs = [],
  initialTab = "builders",
}: {
  board: Board;
  period: string;
  modelPairs?: ModelPairStat[];
  initialTab?: "builders" | "pairs";
}) {
  const [activeTab, setActiveTab] = useState<"builders" | "pairs">(initialTab);
  const [query, setQuery] = useState("");

  const builderRows = board.entries
    .map((person, index) => ({ ...person, rank: index + 1 }))
    .filter((p) =>
      (p.display_name + " " + p.handle).toLowerCase().includes(query.trim().toLowerCase())
    );

  const pairRows = modelPairs
    .map((pair, index) => ({ ...pair, rank: index + 1 }))
    .filter((p) =>
      (p.workerModel + " " + p.reviewerModel).toLowerCase().includes(query.trim().toLowerCase())
    );

  return (
    <section className="leaderboard-section" id="leaderboard" aria-labelledby="board-title">
      <div className="board-heading">
        <div>
          <div className="eyebrow">
            {activeTab === "builders" ? "GOOD COMPANY. GREAT ECONOMY." : "AUTONOMOUS SWARM SYNERGY"}
          </div>
          <h2 id="board-title">
            {activeTab === "builders" ? "Proudly cheap." : "Model-Pair Standings."}
          </h2>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          {/* Main Category Switcher: Builders vs Model Pairs */}
          <div className="segmented" role="tablist" aria-label="Leaderboard category">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "builders"}
              aria-pressed={activeTab === "builders"}
              onClick={() => {
                setActiveTab("builders");
                setQuery("");
              }}
            >
              🧑‍💻 Builders ({board.entries.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "pairs"}
              aria-pressed={activeTab === "pairs"}
              onClick={() => {
                setActiveTab("pairs");
                setQuery("");
              }}
            >
              🤝 Swarm Pairs ({modelPairs.length})
            </button>
          </div>

          {/* Time period switcher (active on Builders tab) */}
          {activeTab === "builders" && (
            <div className="segmented" aria-label="Leaderboard time period">
              <a href="/leaderboard" aria-current={period === "all" ? "page" : undefined}>
                All time
              </a>
              <a
                href="/leaderboard?period=month"
                aria-current={period === "month" ? "page" : undefined}
              >
                This month
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="board-toolbar">
        <span className="score-label">
          {activeTab === "builders"
            ? "Every cheap token counts"
            : "Worker + Reviewer first-pass efficiency"}
        </span>
        <label className="search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder={
              activeTab === "builders"
                ? "Find a fellow cheapo..."
                : "Filter worker or reviewer model..."
            }
            aria-label={activeTab === "builders" ? "Search participants" : "Search model pairs"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      {activeTab === "builders" ? (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th className="rank-cell" scope="col">Rank</th>
                <th scope="col">Fellow cheapo</th>
                <th className="total-cell" scope="col">Community tokens</th>
              </tr>
            </thead>
            <tbody>
              {builderRows.map((p) => {
                const titleInfo = getCheapoTitle(p.rank);
                return (
                  <tr key={p.handle}>
                    <td className="rank-cell">
                      <span
                        className={`rank-number ${
                          p.rank <= 3 ? "rank-top rank-" + p.rank : ""
                        }`}
                      >
                        {String(p.rank).padStart(2, "0")}
                      </span>
                    </td>
                    <td>
                      <a className="person-button" href={`/@${p.handle}`}>
                        <Avatar name={p.display_name} />
                        <span className="person-text-col">
                          <span className="person-name-row">
                            <strong>{p.display_name}</strong>
                            {titleInfo && (
                              <span className={`cheapo-title-pill pill-rank-${p.rank}`}>
                                <span className="title-icon">{titleInfo.icon}</span>{" "}
                                {titleInfo.title}
                              </span>
                            )}
                          </span>
                          <small>@{p.handle}</small>
                        </span>
                      </a>
                    </td>
                    <td className="total-cell">
                      <strong>{p.tokens.toLocaleString("en-US")}</strong>
                      {p.rank === 1 && <span className="leader-tag">TOP CHEAPO</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!builderRows.length && (
            <div className="empty-state" role="status">
              <span aria-hidden="true">{query ? "⌕" : "✳"}</span>
              <h3>
                {query
                  ? "No cheapos found."
                  : board.state === "ready"
                  ? "Your name could be first."
                  : "The scoreboard is taking a breather."}
              </h3>
              <p>
                {query
                  ? "Try another name or handle."
                  : board.state === "ready"
                  ? "Connect cheapoS and bring your first tokens to the club."
                  : "Try again in a moment."}
              </p>
              {query && (
                <button className="text-button" onClick={() => setQuery("")}>
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="table-scroll">
          <table className="vault-table">
            <thead>
              <tr>
                <th className="rank-cell" scope="col">Rank</th>
                <th scope="col">Worker Model</th>
                <th scope="col">Senior Reviewer</th>
                <th className="num-cell" scope="col">Total Jobs</th>
                <th scope="col">Approval Rate</th>
                <th className="num-cell" scope="col">Avg Tokens / Task</th>
                <th scope="col">Verification Gate</th>
              </tr>
            </thead>
            <tbody>
              {pairRows.map((pair) => (
                <tr key={pair.pairId}>
                  <td className="rank-cell">
                    <span
                      className={`rank-number ${
                        pair.rank <= 3 ? "rank-top rank-" + pair.rank : ""
                      }`}
                    >
                      {String(pair.rank).padStart(2, "0")}
                    </span>
                  </td>
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
                      <div
                        className="rate-bar"
                        style={{ width: `${Math.min(pair.completionRate, 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="num-cell tabular-nums">
                    {formatTokens(pair.avgTokensPerJob || Math.round(pair.totalTokens / pair.totalJobs))}
                  </td>
                  <td>
                    {pair.isIndependent ? (
                      <span
                        className="gate-tag gate-independent"
                        title="Independent cross-vendor review enforced"
                      >
                        🛡️ Independent
                      </span>
                    ) : (
                      <span
                        className="gate-tag gate-homogenous"
                        title="Same-model verification"
                      >
                        ⚠️ Intra-model
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!pairRows.length && (
            <div className="empty-state" role="status">
              <span aria-hidden="true">{query ? "⌕" : "✳"}</span>
              <h3>No model pairs found matching your query.</h3>
              <p>Try searching for another worker model or provider name.</p>
              {query && (
                <button className="text-button" onClick={() => setQuery("")}>
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="table-bottom" aria-live="polite">
        <span>
          {activeTab === "builders"
            ? `${builderRows.length} of ${board.entries.length} on the board`
            : `${pairRows.length} of ${modelPairs.length} swarm pairings on the board`}
        </span>
        <span>
          {activeTab === "builders"
            ? period === "month"
              ? "This month · UTC"
              : "Since joining"
            : "Verified independent runs"}{" "}
          <span className="small-dot" />
        </span>
      </div>
      <p className="board-footnote">
        {activeTab === "builders"
          ? "Free remote + included access + local models + pay-as-you-go. One friendly scoreboard."
          : "Evaluates multi-agent worker and reviewer completion yields, token economy, and cross-vendor verification gates."}
      </p>
    </section>
  );
}
