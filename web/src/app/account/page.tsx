import Link from "next/link";
import {MemberStats} from "@/app/member-stats";
import {memberData} from "@/lib/member";
import { ensureProfile } from "@/lib/automatic-profile";
import { redirect } from "next/navigation";
import { authConfigured, supabase } from "@/lib/supabase";
import { saveProfile, signOut, disconnectInstallation } from "./actions";
import { SubmitButton } from "@/app/submit-button";
export const dynamic = "force-dynamic";
const messages: Record<string, string> = {
  disconnected: "Installation disconnected. Previously submitted usage stays with this account.",
  "disconnect-error": "Disconnection failed. Please try again.",
  saved: "Your profile is saved.",
  taken: "That handle is already taken. Choose another one.",
  invalid: "Use 3–30 letters, numbers or underscores for your handle, and a display name of 1–80 characters.",
  "save-error": "Your profile couldn’t be saved. Please try again shortly.",
  "signout-error": "Sign-out didn’t complete. Please try again.",
};
export default async function Account({ searchParams }: { searchParams: Promise<{status?: string}> }) {
  if (!authConfigured()) redirect("/join");
  const client = await supabase();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect("/join");
  const { data: profile, error } = await ensureProfile(client, user);
  const { data: installations, error: installationError } = await client.from("club_installations").select("id,sharing_enabled").eq("owner_id",user.id);
  const {data: stats} = profile ? await client.rpc("club_member_profile",{member_handle:profile.handle}) : {data:null};
  const member=memberData(stats);
  const { status } = await searchParams;
  return <section className="prose account-page"><p className="eyebrow">YOUR CORNER OF THE CLUB</p><h1>You’re in.<br/><em>Welcome to the club.</em></h1>
    {profile && <><p className="lede">{profile.display_name} · @{profile.handle}</p><p>Your profile is ready. You can change your name and sharing preferences whenever you like.</p><Link className="button" href="/leaderboard">Explore the leaderboard →</Link></>}
    {member ? <><MemberStats member={member}/>{profile?.sharing_enabled && <p><Link href={`/@${profile.handle}`}>View your public profile ↗</Link></p>}</> : <p>Your Club stats are not available yet. Try again shortly.</p>}
    {status && messages[status] && <p className="notice" role="status">{messages[status]}</p>}
    {error ? <p role="alert" className="notice">We couldn’t load your profile. Please reload in a moment. Your saved settings haven’t changed.</p> :
    <details className="profile-settings"><summary>Edit profile &amp; sharing</summary><form action={saveProfile} className="profile-form">
      <label htmlFor="handle">Club handle</label><input id="handle" name="handle" required minLength={3} maxLength={30} pattern="[A-Za-z0-9_]{3,30}" autoCapitalize="none" defaultValue={profile?.handle ?? ""} aria-describedby="handle-help"/>
      <small id="handle-help">3–30 letters, numbers or underscores. Handles are saved in lowercase.</small>
      <label htmlFor="display-name">Display name</label><input id="display-name" name="display_name" required maxLength={80} autoComplete="nickname" defaultValue={profile?.display_name ?? ""}/>
      <label className="checkbox-label"><input type="checkbox" name="sharing_enabled" defaultChecked={profile?.sharing_enabled ?? false}/> Show my profile and usage on the leaderboard</label>
      <p>Optional. Turning this off removes you from rankings. No prompts, code, email, or provider credentials are shared. Connect an installation below to share future usage.</p>
      <label className="checkbox-label"><input type="checkbox" name="share_models" defaultChecked={profile?.share_models ?? false}/> Show model breakdowns on my public profile</label><small>To send model names, also enable model sharing in cheapoS → Usage &amp; savings.</small>
      <SubmitButton>Save profile</SubmitButton>
    </form></details>}
    <h2>Your installations</h2><p>In cheapoS, open Usage &amp; savings → Connect to Club. Each installation connects to one account at a time.</p>{installationError ? <p>Connections are not available yet. Please try again after setup.</p> : installations?.length ? <ul>{installations.map(installation=><li key={installation.id}><code>{installation.id}</code> · {installation.sharing_enabled?"Sharing enabled":"Sharing paused"}<form action={disconnectInstallation}><input type="hidden" name="installation_id" value={installation.id}/><SubmitButton>Disconnect installation</SubmitButton></form></li>)}</ul> : <p>No installations connected yet.</p>}
    <form action={signOut}><SubmitButton pendingText="Signing out…">Sign out</SubmitButton></form>
  </section>;
}
