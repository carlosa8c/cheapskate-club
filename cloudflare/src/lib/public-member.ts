import { memberData } from "./member";

export async function publicMember(handle: string) {
  if (!/^[a-z0-9_]{3,30}$/.test(handle)) return null;
  const url = import.meta.env.SUPABASE_URL || (typeof process !== "undefined" && process.env?.SUPABASE_URL);
  const key = import.meta.env.SUPABASE_PUBLISHABLE_KEY || (typeof process !== "undefined" && process.env?.SUPABASE_PUBLISHABLE_KEY);
  if (!url || !key) return null;

  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/rpc/club_member_profile`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ member_handle: handle }),
    signal: AbortSignal.timeout(4000),
  });

  if (!response.ok) throw new Error("Profile unavailable");
  return memberData(await response.json());
}

export function clubOrigin() {
  const siteUrl = import.meta.env.SITE_URL || (typeof process !== "undefined" && process.env?.SITE_URL);
  return (siteUrl || "https://cheapos.lol").replace(/\/$/, "");
}
