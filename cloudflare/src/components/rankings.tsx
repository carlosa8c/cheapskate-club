"use client";

import { useState } from "react";
import type { Board } from "../lib/leaderboard";
import { Avatar } from "./club-art";
import { getCheapoTitle } from "../lib/cheapo-titles";

export default function Rankings({
  board,
  period,
}: {
  board: Board;
  period: string;
}) {
  const [query, setQuery] = useState("");
  const rows = board.entries
    .map((person, index) => ({ ...person, rank: index + 1 }))
    .filter((p) =>
      (p.display_name + " " + p.handle).toLowerCase().includes(query.trim().toLowerCase())
    );

  return (
    <section className="leaderboard-section" id="leaderboard" aria-labelledby="board-title">
      <div className="board-heading">
        <div>
          <div className="eyebrow">GOOD COMPANY. GREAT ECONOMY.</div>
          <h2 id="board-title">Proudly cheap.</h2>
        </div>
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
      </div>

      <div className="board-toolbar">
        <span className="score-label">Every cheap token counts</span>
        <label className="search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Find a fellow cheapo..."
            aria-label="Search participants"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

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
            {rows.map((p) => {
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

        {!rows.length && (
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

      <div className="table-bottom" aria-live="polite">
        <span>
          {rows.length} of {board.entries.length} on the board
        </span>
        <span>
          {period === "month" ? "This month · UTC" : "Since joining"}{" "}
          <span className="small-dot" />
        </span>
      </div>
      <p className="board-footnote">
        Free remote + included access + local models + pay-as-you-go. One friendly scoreboard.
      </p>
    </section>
  );
}
