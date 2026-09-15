import { redirect } from "next/navigation";
import { authConfigured, supabase } from "@/lib/supabase";
import { signIn } from "@/app/account/actions";
import { SubmitButton } from "@/app/submit-button";
export const dynamic = "force-dynamic";
const messages: Record<string, string> = {
  setup: "Sign-in is being configured. Please check back shortly.",
  unavailable: "We couldn’t start sign-in. Please try again shortly.",
  expired: "Please sign in again to continue.",
  callback: "Sign-in wasn’t completed. Try again in this browser, starting with the button below.",
};
export default async function Join({ searchParams }: { searchParams: Promise<{status?: string}> }) {
  const configured = authConfigured() && Boolean(process.env.SITE_URL);
  if (configured) {
    const client = await supabase();
    const { data: { user } } = await client.auth.getUser();
    if (user) redirect("/account");
  }
  const { status } = await searchParams;
  return <section className="prose"><p className="eyebrow">YOUR WORK. YOUR CHOICE.</p>
    <h1>Find your<br/><em>fellow cheapos.</em></h1>
    <p className="lede">Join with X or GitHub. We’ll use your profile name to get you started—you can change it anytime.</p>
    {status && messages[status] && <p className="notice" role="status">{messages[status]}</p>}
    {configured ? <div className="signin-options"><form action={signIn}><input type="hidden" name="provider" value="x"/><SubmitButton pendingText="Opening X…">Continue with X →</SubmitButton></form><form action={signIn}><input type="hidden" name="provider" value="github"/><SubmitButton pendingText="Opening GitHub…">Continue with GitHub</SubmitButton></form></div> : <p className="notice">Sign-in is being configured. The leaderboard is still open to browse.</p>}
    <p>Signing in creates a Club account. It does not connect your repositories or upload anything from cheapoS. Leaderboard sharing stays off until you choose it.</p>
    <h2>Bring your work, keep your privacy.</h2><p>Your email stays private. You choose the name other members see. Connect cheapoS from its Usage & savings panel when you’re ready.</p>
  </section>;
}
