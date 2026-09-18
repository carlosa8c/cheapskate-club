import "server-only";
import { cache } from "react";
import { authConfigured, supabase } from "./supabase";

export interface CurrentMember {
  name: string;
  display_name: string;
  handle: string;
  sharing_enabled: boolean;
  profileUrl: string;
}

// React cache deduplicates layout/page reads within this request, not across users.
export const currentMember = cache(async (): Promise<CurrentMember | null> => {
  if (!authConfigured()) return null;
  const client = await supabase();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return null;
  const { data: profile } = await client
    .from("club_profiles")
    .select("handle,display_name,sharing_enabled")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  const handle = profile.handle || "";
  return {
    name: profile.display_name || "Fellow cheapo",
    display_name: profile.display_name || "Fellow cheapo",
    handle,
    sharing_enabled: Boolean(profile.sharing_enabled),
    profileUrl: handle ? `/@${handle}` : "/account",
  };
});
