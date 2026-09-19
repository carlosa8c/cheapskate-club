import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.text();
    const res = await fetch("https://cheapskate-club.vercel.app/api/installation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "cheapoS/0.1.0"
      },
      body
    });
    const data = await res.text();
    return new Response(data, {
      status: res.status,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || "Internal error" }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};
