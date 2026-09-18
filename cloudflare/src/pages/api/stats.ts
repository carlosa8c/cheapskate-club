import { leaderboard } from "../../lib/leaderboard";
import { publicMember } from "../../lib/public-member";

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

    const payload = {
      totalTokens,
      entryCount,
      champion,
      championMember,
      timestamp: Date.now(),
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Unavailable", message: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
