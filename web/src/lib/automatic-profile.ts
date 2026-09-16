import type { SupabaseClient, User } from "@supabase/supabase-js";

function firstText(values: unknown[]): string {
  return values.find((value): value is string => typeof value === "string" && Boolean(value.trim()))?.trim() ?? "";
}

export function providerProfile(user: Pick<User, "id" | "user_metadata">) {
  const metadata = user.user_metadata ?? {};
  // These are profile suggestions only, never authorization or verified handles.
  const username = firstText([metadata.user_name, metadata.preferred_username, metadata.username]);
  const normalized = username.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 30);
  const fallback = `member_${user.id.replace(/-/g, "").slice(0, 12)}`;
  return {
    handle: normalized.length >= 3 ? normalized : fallback,
    display_name: [...(firstText([metadata.full_name, metadata.name, username]) || "Club member")].slice(0, 80).join(""),
    sharing_enabled: false,
  };
}

// Insert only: later sign-ins must never overwrite edits or sharing preferences.
export async function ensureProfile(client: SupabaseClient, user: User) {
  const read = () => client.from("club_profiles").select("handle,display_name,sharing_enabled,share_models").eq("id", user.id).maybeSingle();
  const existing = await read();
  if (existing.error || existing.data) return existing;
  const defaults = providerProfile(user);
  for (let attempt = 0; attempt < 4; attempt++) {
    const suffix = `_${user.id.replace(/-/g, "").slice(0, 10)}${attempt > 1 ? `_${attempt}` : ""}`;
    const handle = attempt === 0 ? defaults.handle : defaults.handle.slice(0, 30 - suffix.length) + suffix;
    const created = await client.from("club_profiles").insert({ id: user.id, ...defaults, handle }).select("handle,display_name,sharing_enabled,share_models").single();
    if (!created.error || created.error.code !== "23505") return created;
    // Another callback may have created our own profile while we were inserting.
    const concurrent = await read();
    if (concurrent.error || concurrent.data) return concurrent;
  }
  return { data: null, error: { message: "Could not allocate a Club handle." } };
}
