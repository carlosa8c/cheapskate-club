import { NextResponse } from "next/server";
import { leaderboard } from "@/lib/leaderboard";
import { publicMember } from "@/lib/public-member";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const board = await leaderboard("zero_cost", "all");
    const totalTokens = board.entries.reduce((sum, e) => sum + e.tokens, 0);
    const entryCount = board.entries.length;
    const champion = board.entries[0] || null;
    let championMember = null;
    if (champion) {
      championMember = await publicMember(champion.handle).catch(() => null);
    }

    return NextResponse.json(
      {
        totalTokens,
        entryCount,
        champion,
        championMember,
        timestamp: Date.now(),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Unavailable", message: String(err) },
      { status: 500 }
    );
  }
}
