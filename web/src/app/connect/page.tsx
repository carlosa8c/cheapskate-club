import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { authConfigured,supabase } from "@/lib/supabase";
import { ensureProfile } from "@/lib/automatic-profile";
import { SubmitButton } from "@/app/submit-button";
import { approve, rememberPairing } from "./actions";
export const dynamic="force-dynamic";
export default async function Connect({searchParams}:{searchParams:Promise<{id?:string;status?:string}>}) {
 const params=await searchParams;
 const id=params.id||(await cookies()).get("club_pairing")?.value;
 if(!id || !/^[0-9a-f-]{36}$/.test(id)) return <section className="prose"><h1>Connect cheapoS</h1><p>Start from Usage &amp; savings in cheapoS to connect this installation.</p></section>;
 if(!authConfigured()) redirect("/join");
 const client=await supabase(); const {data:{user}}=await client.auth.getUser();
 if(!user) return <section className="prose"><h1>Connect cheapoS</h1><p>Sign in to choose the Club account for this installation.</p><form action={rememberPairing}><input type="hidden" name="id" value={id}/><SubmitButton>Sign in to continue</SubmitButton></form></section>;
 const {data:profile}=await ensureProfile(client,user);
 if(!profile) return <section><p>Your profile could not be loaded. Reload to try again.</p></section>;
 return <section className="prose"><p className="eyebrow">ONE INSTALLATION. ONE ACCOUNT.</p><h1>Connect to<br/><em>@{profile.handle}</em></h1>
 {params.status==="approved" ? <p role="status">Approved. Return to cheapoS and click Check connection, then review what you want to share.</p> : <><p>This installation will send future opted-in usage to this account only. Connecting does not enable sharing. To switch accounts later, disconnect in cheapoS first. Existing usage stays with its original account.</p><p>Only approve if you just started this connection in your own cheapoS app.</p>{params.status==="failed" && <p role="alert">Pairing expired or the installation is already connected. Start a fresh connection from cheapoS.</p>}<form action={approve}><input type="hidden" name="id" value={id}/><SubmitButton>Connect to @{profile.handle}</SubmitButton></form><p>Wrong account? <Link href="/account">Open My Club to sign out</Link>, then return to this connection link.</p></>}
 </section>;
}
