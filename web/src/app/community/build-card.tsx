/* eslint-disable @next/next/no-img-element -- User-hosted screenshots load directly without a server image proxy. */
import Link from "next/link";
import type {Build} from "@/lib/builds";
export function BuildCard({build}:{build:Build}){return <article className="build-card">
 <Link href={`/community/${build.id}`} className="build-cover" aria-label={`View ${build.title}`}>{build.screenshot_url?<img src={build.screenshot_url} alt={`Screenshot of ${build.title}`} loading="lazy" referrerPolicy="no-referrer"/>:<span aria-hidden="true">✳</span>}</Link>
 <div className="build-card-body"><p className="eyebrow">BUILT WITH A LITTLE INGENUITY</p><h2><Link href={`/community/${build.id}`}>{build.title}</Link></h2><p className="build-excerpt">{build.description}</p><div className="build-byline"><span>@{build.handle}</span><span>✦ {build.cheers} cheers</span></div></div></article>}
