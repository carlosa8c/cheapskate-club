import { Avatar } from "./club-art";
import type { Entry } from "../lib/leaderboard";
import { getCheapoTitle } from "../lib/cheapo-titles";

export interface PodiumProps {
  entries: Entry[];
  period?: "all" | "month";
}

function formatTokens(tokens: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(tokens);
}

export default function Podium({ entries }: PodiumProps) {
  const p1 = entries[0];
  const p2 = entries[1];
  const p3 = entries[2];

  const t1 = getCheapoTitle(1);
  const t2 = getCheapoTitle(2);
  const t3 = getCheapoTitle(3);

  return (
    <section className="racing-podium-section" aria-label="Top 3 Racing Podium">
      <div className="podium-section-header">
        <div className="podium-eyebrow">
          <span className="racing-flag" aria-hidden="true">🏁</span>
          POLE POSITION &amp; PODIUM
        </div>
        <h2 className="podium-title">Top 3 Cheapos</h2>
      </div>

      <div className="racing-podium">
        {/* P2: Second Place (Silver) */}
        <div className="podium-card podium-p2">
          <div className="podium-badge badge-p2">
            <span className="medal-icon">🥈</span> P2 · RUNNER UP
          </div>
          {p2 ? (
            <a className="podium-link" href={`/@${p2.handle}`}>
              <div className="podium-avatar-wrap">
                <Avatar name={p2.display_name || "Cheapo"} />
                <span className="podium-rank-tag tag-p2">2</span>
              </div>
              <div className="podium-info">
                <strong className="podium-name">{p2.display_name}</strong>
                <span className="podium-handle">@{p2.handle}</span>
                {t2 && (
                  <span className="podium-honorific-badge badge-rank-2">
                    {t2.icon} {t2.title}
                  </span>
                )}
              </div>
              <div className="podium-score-wrap">
                <span className="podium-score-val">{formatTokens(p2.tokens)}</span>
                <span className="podium-score-lbl">verified tokens</span>
              </div>
              <span className="podium-view-btn">View profile ↗</span>
            </a>
          ) : (
            <a className="podium-empty" href="/join">
              <div className="podium-avatar-wrap empty-avatar">
                <span className="empty-plus">🥈</span>
                <span className="podium-rank-tag tag-p2">2</span>
              </div>
              <div className="podium-info">
                <strong className="podium-name">Silver Step Open</strong>
                <span className="podium-handle">No runner-up yet</span>
                {t2 && (
                  <span className="podium-honorific-badge badge-rank-2">
                    {t2.icon} {t2.title}
                  </span>
                )}
              </div>
              <p className="podium-empty-note">
                Connect your installation and claim the #2 spot.
              </p>
              <span className="podium-claim-btn">Claim P2 ↗</span>
            </a>
          )}
          <div className="podium-pedestal pedestal-p2">
            <span className="pedestal-number">2ND</span>
          </div>
        </div>

        {/* P1: First Place (Gold / Mint Champion) */}
        <div className="podium-card podium-p1">
          <div className="podium-badge badge-p1">
            <span className="medal-icon">🥇</span> P1 · POLE POSITION
          </div>
          {p1 ? (
            <a className="podium-link" href={`/@${p1.handle}`}>
              <div className="podium-avatar-wrap champion-avatar-wrap">
                <span className="avatar-crown" aria-hidden="true">👑</span>
                <Avatar name={p1.display_name || "Champion"} />
                <span className="podium-rank-tag tag-p1">1</span>
              </div>
              <div className="podium-info">
                <strong className="podium-name">{p1.display_name}</strong>
                <span className="podium-handle">@{p1.handle}</span>
                {t1 && (
                  <span className="podium-honorific-badge badge-rank-1">
                    {t1.icon} {t1.title}
                  </span>
                )}
              </div>
              <div className="podium-score-wrap">
                <span className="podium-score-val champion-score-val">
                  {formatTokens(p1.tokens)}
                </span>
                <span className="podium-score-lbl">
                  {p1.tokens.toLocaleString("en-US")} total tokens
                </span>
              </div>
              <span className="podium-status-pill">Top Mileage ✓</span>
              <span className="podium-view-btn">View profile ↗</span>
            </a>
          ) : (
            <a className="podium-empty" href="/join">
              <div className="podium-avatar-wrap empty-avatar">
                <span className="empty-plus">👑</span>
                <span className="podium-rank-tag tag-p1">1</span>
              </div>
              <div className="podium-info">
                <strong className="podium-name">Crown Waiting</strong>
                <span className="podium-handle">Take pole position</span>
                {t1 && (
                  <span className="podium-honorific-badge badge-rank-1">
                    {t1.icon} {t1.title}
                  </span>
                )}
              </div>
              <span className="podium-claim-btn">Take 1st Place ↗</span>
            </a>
          )}
          <div className="podium-pedestal pedestal-p1">
            <span className="pedestal-number">1ST · CHAMPION</span>
          </div>
        </div>

        {/* P3: Third Place (Bronze) */}
        <div className="podium-card podium-p3">
          <div className="podium-badge badge-p3">
            <span className="medal-icon">🥉</span> P3 · PODIUM FINISHER
          </div>
          {p3 ? (
            <a className="podium-link" href={`/@${p3.handle}`}>
              <div className="podium-avatar-wrap">
                <Avatar name={p3.display_name || "Cheapo"} />
                <span className="podium-rank-tag tag-p3">3</span>
              </div>
              <div className="podium-info">
                <strong className="podium-name">{p3.display_name}</strong>
                <span className="podium-handle">@{p3.handle}</span>
                {t3 && (
                  <span className="podium-honorific-badge badge-rank-3">
                    {t3.icon} {t3.title}
                  </span>
                )}
              </div>
              <div className="podium-score-wrap">
                <span className="podium-score-val">{formatTokens(p3.tokens)}</span>
                <span className="podium-score-lbl">verified tokens</span>
              </div>
              <span className="podium-view-btn">View profile ↗</span>
            </a>
          ) : (
            <a className="podium-empty" href="/join">
              <div className="podium-avatar-wrap empty-avatar">
                <span className="empty-plus">🥉</span>
                <span className="podium-rank-tag tag-p3">3</span>
              </div>
              <div className="podium-info">
                <strong className="podium-name">Bronze Step Open</strong>
                <span className="podium-handle">No 3rd place yet</span>
                {t3 && (
                  <span className="podium-honorific-badge badge-rank-3">
                    {t3.icon} {t3.title}
                  </span>
                )}
              </div>
              <p className="podium-empty-note">
                Any verified free compute steps onto the podium.
              </p>
              <span className="podium-claim-btn">Claim P3 ↗</span>
            </a>
          )}
          <div className="podium-pedestal pedestal-p3">
            <span className="pedestal-number">3RD</span>
          </div>
        </div>
      </div>
    </section>
  );
}
