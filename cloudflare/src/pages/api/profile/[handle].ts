import { publicMember } from "../../../lib/public-member";

export async function GET({ params }: { params: { handle: string } }) {
  const rawHandle = params.handle || "";
  const handle = rawHandle.replace(/^@/, "").toLowerCase();
  const headers = {
    "Cache-Control": "no-store, no-cache, must-revalidate",
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const member = await publicMember(handle);
    if (!member) {
      return new Response(JSON.stringify({ error: "Public profile not found" }), {
        status: 404,
        headers,
      });
    }
    return new Response(JSON.stringify(member), { status: 200, headers });
  } catch {
    return new Response(
      JSON.stringify({ error: "Profile unavailable. Please try again later." }),
      { status: 503, headers }
    );
  }
}
