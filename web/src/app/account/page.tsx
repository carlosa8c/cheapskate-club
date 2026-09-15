import Link from "next/link";
import { ensureProfile } from "@/lib/automatic-profile";
import { redirect } from "next/navigation";
import { authConfigured, supabase } from "@/lib/supabase";
import { saveProfile, signOut } from "./actions";
import { SubmitButton } from "@/app/submit-button";
export const dynamic = "force-dynamic";
const messages: Record<string, string> = {
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
  const { status } = await searchParams;
  return <section className="prose"><p className="eyebrow">YOUR CORNER OF THE CLUB</p><h1>You’re in.<br/><em>Welcome to the club.</em></h1>
    {profile && <><p className="lede">{profile.display_name} · @{profile.handle}</p><p>Your profile is ready. You can change your name and sharing preferences whenever you like.</p><Link className="button" href="/">Explore the leaderboard →</Link></>}
    {status && messages[status] && <p className="notice" role="status">{messages[status]}</p>}
    {error ? <p role="alert" className="notice">We couldn’t load your profile. Please reload in a moment. Your saved settings haven’t changed.</p> :
    <details className="profile-settings"><summary>Edit profile &amp; sharing</summary><form action={saveProfile} className="profile-form">
      <label htmlFor="handle">Club handle</label><input id="handle" name="handle" required minLength={3} maxLength={30} pattern="[A-Za-z0-9_]{3,30}" autoCapitalize="none" defaultValue={profile?.handle ?? ""} aria-describedby="handle-help"/>
      <small id="handle-help">3–30 letters, numbers or underscores. Handles are saved in lowercase.</small>
      <label htmlFor="display-name">Display name</label><input id="display-name" name="display_name" required maxLength={80} autoComplete="nickname" defaultValue={profile?.display_name ?? ""}/>
      <label className="checkbox-label"><input type="checkbox" name="sharing_enabled" defaultChecked={profile?.sharing_enabled ?? false}/> Show my name and accepted usage on the leaderboard</label>
      <p>Optional. Turning this off removes you from rankings. No prompts, code, email, or provider credentials are shared. Pairing and sync are not available yet.</p>
      <SubmitButton>Save profile</SubmitButton>
    </form></details>}
    <h2>Connect cheapoS</h2><p>Installation pairing is coming next. You won’t need to give the Club your model-provider keys.</p>
    <form action={signOut}><SubmitButton pendingText="Signing out…">Sign out</SubmitButton></form>
  </section>;
}
