/* eslint-disable @next/next/no-img-element -- External screenshots load directly; no image proxy fetch or optimization charges. */
import Link from "next/link";
import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {builds} from "@/lib/builds";
import {buildId} from "@/lib/build-input";
import {supabase} from "@/lib/supabase";
import {clubOrigin} from "@/lib/public-member";
import {cheer,deleteBuild} from "../actions";
import {SubmitButton} from "@/app/submit-button";
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
 const {id}=await params;if(!buildId(id))return {};const {items}=await builds({id});const build=items[0];if(!build)return {};
 const title=`${build.title} · The Cheapskate Club`,description=build.description.slice(0,180),url=`${clubOrigin()}/community/${id}`;
 return {title,description,openGraph:{title,description,url,images:build.screenshot_url?[build.screenshot_url]:[]},twitter:{card:build.screenshot_url?'summary_large_image':'summary',title,description,images:build.screenshot_url?[build.screenshot_url]:[]}};
}
export default async function BuildPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{status?:string}>}){
 const {id}=await params;if(!buildId(id))notFound();const feed=await builds({id});if(feed.unavailable)return <section className="prose"><h1>A little breather.</h1><p>This build could not load. Please try again shortly.</p></section>;const build=feed.items[0];if(!build)notFound();
 const client=await supabase(),{data:{user}}=await client.auth.getUser();
 const {data:own}=user?await client.from('club_builds').select('id').eq('id',id).eq('author_id',user.id).maybeSingle():{data:null};
 const {data:cheered}=user?await client.from('club_cheers').select('build_id').eq('build_id',id).maybeSingle():{data:null};
 const url=`${clubOrigin()}/community/${id}`,status=(await searchParams).status;
 return <section className="build-detail"><Link href="/community">← Around the workbench</Link><p className="eyebrow">A FELLOW CHEAPSKATE MADE THIS</p><h1>{build.title}</h1><p>By {build.profile_public?<Link href={`/@${build.handle}`}>{build.display_name} · @{build.handle}</Link>:<span>{build.display_name} · @{build.handle}</span>}</p>
 {build.screenshot_url&&<img className="build-screenshot" src={build.screenshot_url} alt={`Screenshot of ${build.title}`} referrerPolicy="no-referrer"/>}<p className="build-description">{build.description}</p>
 {status&&<p role="alert" className="notice">That change could not be saved. Please try again.</p>}
 <div className="share-buttons">{user?<form action={cheer}><input type="hidden" name="id" value={id}/><input type="hidden" name="remove" value={cheered?'yes':'no'}/><SubmitButton pendingText="Saving…">{cheered?'✦ Cheered':'✧ Give a cheer'} · {build.cheers}</SubmitButton></form>:<Link className="button" href="/join">Join to cheer · {build.cheers}</Link>}
 {build.project_url&&<a className="button" href={build.project_url} target="_blank" rel="noopener noreferrer ugc">Explore the project ↗</a>}
 {build.discussion_url&&<a className="button" href={build.discussion_url} target="_blank" rel="noopener noreferrer ugc">Discuss on X ↗</a>}
 <a className="button" target="_blank" rel="noopener noreferrer" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${build.title} — found at The Cheapskate Club`)}&url=${encodeURIComponent(url)}`}>Share on X ↗</a></div>
 {build.show_usage&&<aside className="build-usage"><h2>The builder’s Club card</h2><p>Lifetime community tokens across their projects.</p><Link href={`/@${build.handle}`}><img src={`/api/cards/${build.handle}?download=1`} alt={`${build.display_name}’s lifetime usage card`} loading="lazy"/></Link></aside>}
 {own&&<details className="profile-settings"><summary>Manage your build</summary><p><Link href={`/community/${id}/edit`}>Edit build →</Link></p><form action={deleteBuild}><input type="hidden" name="id" value={id}/><p>Deleting removes this build and its cheers from the Club.</p><SubmitButton pendingText="Removing…">Delete this build</SubmitButton></form></details>}</section>;
}
