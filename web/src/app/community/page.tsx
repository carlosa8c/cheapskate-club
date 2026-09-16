import Link from "next/link";
import {builds} from "@/lib/builds";
import {currentMember} from "@/lib/current-member";
import {BuildCard} from "./build-card";
export const dynamic='force-dynamic';
export default async function Community({searchParams}:{searchParams:Promise<{page?:string}>}){
 const query=await searchParams;const page=Math.min(10000,Math.max(0,Number.parseInt(query.page||'0',10)||0));
 const [feed,member]=await Promise.all([builds({page}),currentMember()]);
 return <><section className="intro community-intro"><p className="eyebrow">SMALL BUDGETS. BIG IDEAS.</p><h1>Look what<br/><em>we made.</em></h1><p className="lede">Weekend experiments, useful little tools, and wonderfully unnecessary inventions. Built by fellow cheapskates.</p><Link className="button" href={member?'/community/new':'/join'}>{member?'Share a build ↗':'Join & share a build ↗'}</Link></section>
 <div className="board-heading"><h2>Around the workbench</h2><span className="eyebrow">LATEST BUILDS</span></div>
 {feed.unavailable?<p className="notice" role="status">The workbench is getting ready. Please check back shortly.</p>:feed.items.length?<div className="build-grid">{feed.items.map(build=><BuildCard key={build.id} build={build}/>)}</div>:<div className="empty-state"><span aria-hidden="true">✳</span><h3>{page?'You’ve reached the end.':'Every club starts with a first build.'}</h3><p>It doesn’t have to change the world. Show us what you made.</p></div>}
 <nav className="build-pagination" aria-label="Build pages">{page>0&&<Link href={`/community?page=${page-1}`}>← Newer builds</Link>}{feed.items.length===12&&<Link href={`/community?page=${page+1}`}>Older builds →</Link>}</nav></>;
}
