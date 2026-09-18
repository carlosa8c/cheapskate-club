import SponsorHero from "./sponsor-hero";
import Link from "next/link";
import { currentMember } from "@/lib/current-member";
import { leaderboard } from "@/lib/leaderboard";
import { publicMember } from "@/lib/public-member";
import { Avatar, Trophy } from "./club-art";
import ScoreboardBillboard from "./scoreboard-billboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [all, member] = await Promise.all([
    leaderboard("zero_cost", "all"),
    currentMember(),
  ]);

  const champion = all.entries[0];
  const total = all.entries.reduce((n, p) => n + p.tokens, 0);
  const championMember = champion
    ? await publicMember(champion.handle).catch(() => null)
    : null;

  return (
    <>
      <section className="hero club-hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="little-spark" aria-hidden="true">✳</span>
            FOR THE PROUDLY ECONOMICAL
          </div>
          <h1>
            Less bill.<br />
            <em>More brag.</em>
          </h1>
          <p>
            You bring the ideas. cheapoS stretches every token.<br />
            We bring a wildly unnecessary leaderboard.
          </p>
          <div className="hero-actions">
            <Link className="button primary" href={member ? member.profileUrl : "/join"}>
              {member ? "Your profile" : "Claim your cheapo status"}{" "}
              <span aria-hidden="true">↗</span>
            </Link>
            <Link className="button" href="/leaderboard">
              View Leaderboard <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <Link
          className="champion-card"
          href={champion ? `/@${champion.handle}` : member ? "/account" : "/join"}
        >
          <span className="eyebrow">ALL-TIME COMMUNITY CHAMPION</span>
          <h2>Top Cheapo</h2>
          <div className="trophy-stage">
            <span className="orbit orbit-one" aria-hidden="true">✦</span>
            <Trophy />
            <span className="orbit orbit-two" aria-hidden="true">✧</span>
            <span className="trophy-caption">
              BIG BRAIN<br />SMALL BILL
            </span>
          </div>
          <div className="champion-person">
            <Avatar name={champion?.display_name || "You"} />
            <div>
              <strong>
                {champion?.display_name ||
                  (all.state === "ready" ? "Your name here" : "Crown on standby")}
              </strong>
              <span>
                {champion
                  ? "@" + champion.handle
                  : all.state === "ready"
                  ? "The first spot is waiting."
                  : "Checking the scoreboard."}
              </span>
              {champion && (
                <span className="cheapo-title-pill pill-rank-1" style={{ marginTop: 4, display: "inline-flex" }}>
                  👑 Supreme Frugal Overlord
                </span>
              )}
            </div>
            <span className="champion-link" aria-hidden="true">↗</span>
          </div>
          <div className="champion-score">
            <strong>
              {champion
                ? new Intl.NumberFormat("en-US", {
                    notation: "compact",
                    maximumFractionDigits: 2,
                  }).format(champion.tokens)
                : "—"}
            </strong>
            <span>
              community tokens<br />and counting
            </span>
          </div>
        </Link>
      </section>

      {/* The OmniRoute-Style Big Centerpiece Scoreboard */}
      <ScoreboardBillboard
        totalTokens={total}
        entryCount={all.entries.length}
        championMember={championMember}
      />

      {/* Featured Frugal Engine / Sponsor Spotlight */}
      <SponsorHero />

      {/* Gateway Teasers: Dedicated Leaderboard & Community Pages */}
      <section className="home-gateways" aria-label="Explore the Club">
        <Link className="home-gateway-card" href="/leaderboard">
          <div>
            <div className="gateway-eyebrow">
              <span className="gateway-icon" aria-hidden="true">🏆</span>
              STANDINGS · TOP 100
            </div>
            <h2>The Leaderboard</h2>
            <p>
              See who&apos;s extracting maximum compute with minimum bill. Filter by
              month or all-time, inspect model distributions, and claim your place on the board.
            </p>
          </div>
          <div className="gateway-footer">
            <span className="gateway-pill">
              {all.entries.length} proud cheapo{all.entries.length === 1 ? "" : "s"} on the board
            </span>
            <span className="gateway-arrow" aria-hidden="true">Explore leaderboard ↗</span>
          </div>
        </Link>

        <Link className="home-gateway-card" href="/community">
          <div>
            <div className="gateway-eyebrow">
              <span className="gateway-icon" aria-hidden="true">🛠️</span>
              COMMUNITY WORKBENCH
            </div>
            <h2>What Cheapos Are Building</h2>
            <p>
              Explore real projects built with community compute — autonomous agents, CLI utilities,
              games, and research bots. Discover builds, leave cheers, or share yours.
            </p>
          </div>
          <div className="gateway-footer">
            <span className="gateway-pill">Verified build receipts</span>
            <span className="gateway-arrow" aria-hidden="true">Around the workbench ↗</span>
          </div>
        </Link>
      </section>

      <section className="bottom-banner">
        <span className="banner-star" aria-hidden="true">✳</span>
        <div>
          <h2>Being cheap looks good on you.</h2>
          <p>Your next side project might just earn you a spot on the board.</p>
        </div>
        <Link className="button" href={member ? "/community" : "/join"}>
          {member ? "Around the club ↗" : "Count me in ↗"}
        </Link>
      </section>
    </>
  );
}
