import Link from "next/link";
import {notFound} from "next/navigation";
import {authConfigured,supabase} from "@/lib/supabase";
import {memberData} from "@/lib/member";
import {MemberStats} from "@/app/member-stats";
export const dynamic="force-dynamic";
export default async function MemberPage({params}:{params:Promise<{handle:string}>}) {
 const raw=(await params).handle;
 let handle:string;
 try {handle=decodeURIComponent(raw);} catch {notFound();}
 if(!/^@[a-zA-Z0-9_]{3,30}$/.test(handle)) notFound();
 if(!authConfigured()) return <section className="prose"><h1>The club is getting ready.</h1><Link href="/">Back to the club</Link></section>;
 const client=await supabase();
 const {data,error}=await client.rpc("club_member_profile",{member_handle:handle.slice(1).toLowerCase()});
 if(error) return <section className="prose"><h1>A little breather.</h1><p>This member’s stats couldn’t load. Try again shortly.</p><Link href="/">Back to the club</Link></section>;
 const member=memberData(data);
 if(!member) notFound();
 return <section className="member-page"><Link href="/">← The leaderboard</Link><div className="member-heading"><div className="member-monogram" aria-hidden="true">{member.display_name.slice(0,1).toUpperCase()}</div><div><p className="eyebrow">MEET A FELLOW CHEAPSKATE</p><h1>{member.display_name}</h1><p>@{member.handle}</p></div></div><MemberStats member={member}/><div className="invite"><div><h2>Good company. Better ideas.</h2><p>There’s always room for another builder.</p></div><Link className="button" href="/community">Around the club →</Link></div></section>;
}
