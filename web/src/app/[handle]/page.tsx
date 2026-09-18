import { getCheapoTitle } from "@/lib/cheapo-titles";
import { leaderboard } from "@/lib/leaderboard";
import { builds } from "@/lib/builds";
import { BuildCard } from "@/app/community/build-card";
import Link from "next/link";
import type { Metadata } from "next";
import { publicMember, clubOrigin } from "@/lib/public-member";
import { ShareActions } from "@/app/share-actions";
import { notFound } from "next/navigation";
import { authConfigured, supabase } from "@/lib/supabase";
import { memberData } from "@/lib/member";
import { MemberStats } from "@/app/member-stats";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  let handle: string;
  try {
    handle = decodeURIComponent((await params).handle)
      .replace(/^@/, "")
      .toLowerCase();
  } catch {
    return {};
  }
  const member = await publicMember(handle).catch(() => null);
  if (!member)
    return {
      title: "Member profile · The Cheapskate Club",
      robots: { index: false, follow: false },
    };
  const url = `${clubOrigin()}/@${handle}`,
    image = `${clubOrigin()}/api/cards/${handle}`;
  const title = `${member.display_name} · The Cheapskate Club`,
    description = `${member.tokens.toLocaleString("en-US")} tokens & counting. Less bill. More brag.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "profile",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${member.display_name}’s cheapo card`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function MemberPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const raw = (await params).handle;
  let handle: string;
  try {
    handle = decodeURIComponent(raw);
  } catch {
    notFound();
  }
  if (!/^@[a-zA-Z0-9_]{3,30}$/.test(handle)) notFound();
  if (!authConfigured())
    return (
      <section className="prose">
        <h1>The club is getting ready.</h1>
        <Link href="/">Back to the club</Link>
      </section>
    );

  const client = await supabase();
  const { data, error } = await client.rpc("club_member_profile", {
    member_handle: handle.slice(1).toLowerCase(),
  });
  if (error)
    return (
      <section className="prose">
        <h1>A little breather.</h1>
        <p>This member’s stats couldn’t load. Try again shortly.</p>
        <Link href="/">Back to the club</Link>
      </section>
    );

  const member = memberData(data);
  if (!member) notFound();

  const [projects, board] = await Promise.all([
    builds({ handle: member.handle }),
    leaderboard("zero_cost", "all").catch(() => null),
  ]);

  const rankIndex = board
    ? board.entries.findIndex(
        (e) => e.handle.toLowerCase() === member.handle.toLowerCase()
      )
    : -1;
  const titleInfo = rankIndex >= 0 ? getCheapoTitle(rankIndex + 1) : null;
  const shareable = await publicMember(member.handle).catch(() => null);

  const rankHeadline =
    rankIndex === 0
      ? "REIGNING SUPREME CHEAPO · POLE POSITION"
      : rankIndex === 1
      ? "OFFICIAL STANDINGS · RUNNER UP (P2)"
      : rankIndex === 2
      ? "OFFICIAL STANDINGS · PODIUM FINISHER (P3)"
      : rankIndex >= 0
      ? `OFFICIAL STANDINGS · RANK #${rankIndex + 1} ALL-TIME`
      : "FELLOW CHEAPSKATE · BUILDER PROFILE";

  return (
    <section className="member-page">
      <div className="profile-top-nav">
        <Link href="/leaderboard" className="inline-link">
          ← The leaderboard
        </Link>
        <a href="#club-card" className="top-jump-card-link">
          🪪 Your verified Club Card ↓
        </a>
      </div>

      {/* Upgraded Member Hero Header */}
      <div className="member-heading-card">
        <div className="member-monogram-wrap">
          {rankIndex === 0 && (
            <span className="profile-crown" aria-hidden="true">
              👑
            </span>
          )}
          <div
            className={`member-monogram ${
              rankIndex === 0 ? "monogram-champion" : ""
            }`}
            aria-hidden="true"
          >
            {member.display_name.slice(0, 1).toUpperCase()}
          </div>
        </div>

        <div className="member-info-col">
          <div className="member-meta-eyebrow">
            <span className="little-spark" aria-hidden="true">
              ✳
            </span>
            {rankHeadline}
          </div>

          <h1 className="member-title-name">{member.display_name}</h1>

          <div className="member-sub-row">
            <span className="member-handle-tag">@{member.handle}</span>
            {titleInfo && (
              <span className={`cheapo-title-pill pill-rank-${rankIndex + 1}`}>
                <span className="title-icon">{titleInfo.icon}</span>{" "}
                {titleInfo.title}
              </span>
            )}
            {rankIndex >= 0 && (
              <span className="member-rank-pill">
                Rank #{rankIndex + 1} on the Board
              </span>
            )}
            <a href="#club-card" className="jump-card-pill" title="Jump to your verified Club Card">
              🪪 Club Card ↓
            </a>
          </div>
        </div>
      </div>

      {/* Unified Stats: Banner + 4-Tier Compute Matrix + Roles Grid + Model Explorer */}
      <MemberStats member={member} />

      {/* Graphical Membership Pass / Card Showcase */}
      {shareable && (
        <ShareActions
          handle={member.handle}
          url={`${clubOrigin()}/@${member.handle}`}
        />
      )}

      {/* Workbench Builds */}
      {projects.items.length > 0 && (
        <section style={{ marginTop: 44 }}>
          <div className="engine-section-header" style={{ marginBottom: 18 }}>
            <div className="engine-eyebrow">
              <span className="little-spark" aria-hidden="true">
                🛠️
              </span>
              FROM THEIR WORKBENCH
            </div>
            <h2 style={{ font: "28px/1.2 var(--serif)", margin: "8px 0 4px" }}>
              Builds by {member.display_name}
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "14px", margin: 0 }}>
              Real projects shipped with community compute by this cheapo builder.
            </p>
          </div>
          <div className="build-grid">
            {projects.items.map((build) => (
              <BuildCard key={build.id} build={build} />
            ))}
          </div>
        </section>
      )}

      <div className="invite">
        <div>
          <h2>Good company. Better ideas.</h2>
          <p>There’s always room for another builder in the club.</p>
        </div>
        <Link className="button" href="/community">
          Around the club →
        </Link>
      </div>
    </section>
  );
}
