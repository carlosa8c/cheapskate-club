import Link from "next/link";
import { currentMember } from "@/lib/current-member";
import { leaderboard } from "@/lib/leaderboard";
import Rankings from "../rankings";
import Podium from "./podium";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Leaderboard · The Cheapskate Club",
  description: "Official all-time and monthly zero-cost AI token rankings for cheapoS builders.",
};

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const period = query.period === "month" ? "month" : "all";
  const [all, monthly, member] = await Promise.all([
    leaderboard("zero_cost", "all"),
    period === "month" ? leaderboard("zero_cost", "month") : Promise.resolve(null),
    currentMember(),
  ]);
  const board = monthly || all;

  return (
    <>
      <section className="intro leaderboard-intro">
        <div className="eyebrow">
          <span className="little-spark" aria-hidden="true">✳</span>
          OFFICIAL STANDINGS · ZERO-COST COMPUTE
        </div>
        <h1>
          The cheapoS<br />
          <em>Honor Roll.</em>
        </h1>
        <p className="lede">
          Compete for zero-cost glory. Verified machine sync, signed token events,
          and absolutely $0 out-of-pocket spend.
        </p>
      </section>

      {/* Top 3 Racing Podium Cards */}
      <Podium entries={board.entries} period={period} />

      <div className="board-layout">
        <Rankings key={period} board={board} period={period} />
        <aside>
          <section className="join-card">
            {member ? (
              <>
                <div className="eyebrow">MEMBERSHIP: EXTREMELY CHEAP</div>
                <div className="join-art" aria-hidden="true">✓</div>
                <h2>Welcome to the<br />cheap seats.</h2>
                <p>
                  {member.name}, you’re in. Your profile, connected installations,
                  and sharing settings are all in one place.
                </p>
                <Link className="button" href="/account">Your membership ↗</Link>
                <span className="join-fine">Good to have you here.</span>
              </>
            ) : (
              <>
                <div className="eyebrow">YOUR NAME COULD BE HERE</div>
                <div className="join-art" aria-hidden="true">✳</div>
                <h2>A little flex.<br />For a little bill.</h2>
                <p>Connect with X or GitHub and bring your cheapoS numbers to the club.</p>
                <Link className="button" href="/join">Join the club ↗</Link>
                <span className="join-fine">Opt in once. Leave whenever.</span>
              </>
            )}
          </section>

          <section className="small-note">
            <span aria-hidden="true">↳</span>
            <div>
              <h3>Good company. Good ideas.</h3>
              <p>Big side projects. Tiny bills. See what the club is about.</p>
              <Link className="inline-link" href="/community">Around the club ↗</Link>
            </div>
          </section>
        </aside>
      </div>

      <section className="bottom-banner">
        <span className="banner-star" aria-hidden="true">✳</span>
        <div>
          <h2>Think your tokens belong up here?</h2>
          <p>Sync your local cheapoS installation with the club in one click.</p>
        </div>
        <Link className="button" href={member ? "/account" : "/join"}>
          {member ? "Installation settings ↗" : "Claim your spot ↗"}
        </Link>
      </section>
    </>
  );
}
