import Link from "next/link";
import {currentMember} from "@/lib/current-member";
import {leaderboard} from "@/lib/leaderboard";
import {publicMember} from "@/lib/public-member";
import {Avatar,Trophy} from "./club-art";
import Rankings from "./rankings";
import ScoreboardBillboard from "./scoreboard-billboard";

export const dynamic="force-dynamic";

export default async function Home({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const query=await searchParams,period=query.period==='month'?'month':'all';
 const [all,monthly,member]=await Promise.all([
  leaderboard('zero_cost','all'),
  period==='month'?leaderboard('zero_cost','month'):Promise.resolve(null),
  currentMember()
 ]);
 const board=monthly||all,champion=all.entries[0],total=all.entries.reduce((n,p)=>n+p.tokens,0);
 const championMember=champion ? await publicMember(champion.handle).catch(() => null) : null;

 return (
  <>
   <section className="hero club-hero">
    <div className="hero-copy">
     <div className="eyebrow"><span className="little-spark" aria-hidden="true">✳</span>FOR THE PROUDLY ECONOMICAL</div>
     <h1>Less bill.<br/><em>More brag.</em></h1>
     <p>You bring the ideas. cheapoS brings the tokens.<br/>We bring a wildly unnecessary leaderboard.</p>
     <div className="hero-actions">
      <Link className="button primary" href={member?member.profileUrl:"/join"}>{member?"Your profile":"Claim your cheapo status"} <span aria-hidden="true">↗</span></Link>
      <span className="micro-note">{member?<>Officially a cheapo.<br/>Welcome back.</>:<>Free to join.<br/>Obviously.</>}</span>
     </div>
    </div>

    <Link className="champion-card" href={champion?`/@${champion.handle}`:member?'/account':'/join'}>
     <span className="eyebrow">ALL-TIME ZERO-COST CHAMPION</span>
     <h2>Top Cheapo</h2>
     <div className="trophy-stage">
      <span className="orbit orbit-one" aria-hidden="true">✦</span>
      <Trophy/>
      <span className="orbit orbit-two" aria-hidden="true">✧</span>
      <span className="trophy-caption">BIG BRAIN<br/>SMALL BILL</span>
     </div>
     <div className="champion-person">
      <Avatar name={champion?.display_name||'You'}/>
      <div>
       <strong>{champion?.display_name||(all.state==='ready'?'Your name here':'Crown on standby')}</strong>
       <span>{champion?'@'+champion.handle:all.state==='ready'?'The first spot is waiting.':'Checking the scoreboard.'}</span>
      </div>
      <span className="champion-link" aria-hidden="true">↗</span>
     </div>
     <div className="champion-score">
      <strong>{champion?new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:2}).format(champion.tokens):'—'}</strong>
      <span>zero-cost tokens<br/>and counting</span>
     </div>
    </Link>
   </section>

   {/* The OmniRoute-Style Big Centerpiece Scoreboard */}
   <ScoreboardBillboard
    totalTokens={total}
    entryCount={all.entries.length}
    championMember={championMember}
   />

   <div className="board-layout">
    <Rankings key={period} board={board} period={period}/>
    <aside>
     <section className="join-card">
      {member?(
       <>
        <div className="eyebrow">MEMBERSHIP: EXTREMELY CHEAP</div>
        <div className="join-art" aria-hidden="true">✓</div>
        <h2>Welcome to the<br/>cheap seats.</h2>
        <p>{member.name}, you’re in. Your profile, connected installations, and sharing settings are all in one place.</p>
        <Link className="button" href="/account">Your membership ↗</Link>
        <span className="join-fine">Good to have you here.</span>
       </>
      ):(
       <>
        <div className="eyebrow">YOUR NAME COULD BE HERE</div>
        <div className="join-art" aria-hidden="true">✳</div>
        <h2>A little flex.<br/>For a little bill.</h2>
        <p>Connect with X or GitHub and bring your cheapoS numbers to the club.</p>
        <Link className="button" href="/join">Join the club ↗</Link>
        <span className="join-fine">Opt in once. Leave whenever.</span>
       </>
      )}
     </section>
     <section className="small-note">
      <span aria-hidden="true">↳</span>
      <div>
       <h3>Good company. Good ideas.</h3>
       <p>Big side projects. Tiny bills. See what the club is about.</p>
       <Link className="inline-link" href="/community">Around the club ↗</Link>
      </div>
     </section>
    </aside>
   </div>

   <section className="bottom-banner">
    <span className="banner-star" aria-hidden="true">✳</span>
    <div>
     <h2>Being cheap looks good on you.</h2>
     <p>Your next side project might just earn you a spot on the board.</p>
    </div>
    <Link className="button" href={member?"/community":"/join"}>
     {member?"Around the club ↗":"Count me in ↗"}
    </Link>
   </section>
  </>
 );
}
