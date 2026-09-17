import {getCheapoTitle} from "@/lib/cheapo-titles";
import {leaderboard} from "@/lib/leaderboard";
import {builds} from "@/lib/builds";
import {BuildCard} from "@/app/community/build-card";
import Link from "next/link";
import type {Metadata} from "next";
import {publicMember,clubOrigin} from "@/lib/public-member";
import {ShareActions} from "@/app/share-actions";
import {notFound} from "next/navigation";
import {authConfigured,supabase} from "@/lib/supabase";
import {memberData} from "@/lib/member";
import {MemberStats} from "@/app/member-stats";
export const dynamic="force-dynamic";
export async function generateMetadata({params}:{params:Promise<{handle:string}>}):Promise<Metadata>{
 let handle:string;try{handle=decodeURIComponent((await params).handle).replace(/^@/,'').toLowerCase();}catch{return {};}
 const member=await publicMember(handle).catch(()=>null);
 if(!member)return {title:'Member profile · The Cheapskate Club',robots:{index:false,follow:false}};
 const url=`${clubOrigin()}/@${handle}`,image=`${clubOrigin()}/api/cards/${handle}`;
 const title=`${member.display_name} · The Cheapskate Club`,description=`${member.tokens.toLocaleString('en-US')} tokens & counting. Less bill. More brag.`;
 return {title,description,openGraph:{title,description,url,type:'profile',images:[{url:image,width:1200,height:630,alt:`${member.display_name}’s cheapo card`}]},twitter:{card:'summary_large_image',title,description,images:[image]}};
}
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
 const [projects, board] = await Promise.all([
   builds({handle:member.handle}),
   leaderboard("zero_cost", "all").catch(() => null)
 ]);
 const rankIndex = board ? board.entries.findIndex(e => e.handle.toLowerCase() === member.handle.toLowerCase()) : -1;
 const titleInfo = rankIndex >= 0 ? getCheapoTitle(rankIndex + 1) : null;
 const shareable=await publicMember(member.handle).catch(()=>null);
 return <section className="member-page"><Link href="/">← The leaderboard</Link><div className="member-heading"><div className="member-monogram" aria-hidden="true">{member.display_name.slice(0,1).toUpperCase()}</div><div><p className="eyebrow">MEET A FELLOW CHEAPSKATE</p><h1>{member.display_name}</h1><p>@{member.handle}</p>{titleInfo && (
      <span className={`cheapo-title-pill pill-rank-${rankIndex + 1}`} style={{ marginTop: 6, display: 'inline-flex' }}>
        <span className="title-icon">{titleInfo.icon}</span> {titleInfo.title}
      </span>
    )}</div></div><MemberStats member={member}/>{shareable&&<ShareActions handle={member.handle} url={`${clubOrigin()}/@${member.handle}`}/>}{projects.items.length>0&&<section><h2 className="build-section-title">From their workbench</h2><div className="build-grid">{projects.items.map(build=><BuildCard key={build.id} build={build}/>)}</div></section>}<div className="invite"><div><h2>Good company. Better ideas.</h2><p>There’s always room for another builder.</p></div><Link className="button" href="/community">Around the club →</Link></div></section>;
}
