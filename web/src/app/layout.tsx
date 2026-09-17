import type { Metadata } from "next";
import Link from "next/link";
import {currentMember} from "@/lib/current-member";
import Image from "next/image";
import {ThemeToggle} from "./theme-toggle";
import "./globals.css";

export const metadata: Metadata = {
 title: "The Cheapskate Club · cheapoS",
 description: "Build more. Spend less. A community for resourceful AI builders.",
};

export default async function Layout({children}: {children: React.ReactNode}) {
 const member=await currentMember();
 return (
  <html lang="en" suppressHydrationWarning>
   <head>
    <script
     dangerouslySetInnerHTML={{
      __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.setAttribute('data-theme','dark');}else{document.documentElement.setAttribute('data-theme','light');}}catch(e){}})();`
     }}
    />
   </head>
   <body data-design="club">
    <a className="skip" href="#main">Skip to content</a>
    <header className="site-header">
     <Link className="brand" href="/"><Image src="/brand-icon.svg" width="38" height="38" alt=""/>cheapoS <span>THE CHEAPSKATE CLUB</span></Link>
     <nav aria-label="Main navigation">
      <Link href="/">Home</Link>
      <Link href="/leaderboard">Leaderboard</Link>
      <Link href="/engine">Engine</Link>
      <Link href="/community">Community</Link>
      <Link href="/about">How it works</Link>
      <ThemeToggle />
      <Link className="button primary" href={member?"/account":"/join"}>{member?"Your membership ↗":"Join the club ↗"}</Link>
     </nav>
    </header>
    <main className="page" id="main">{children}</main>
    <footer className="site-footer">
     <Link className="brand" href="/"><Image src="/brand-icon.svg" width="25" height="25" alt=""/>cheapoS</Link>
     <span>Make expensive compute the exception.</span>
     <Link className="text-button" href="/account">Your data, your call</Link>
    </footer>
   </body>
  </html>
 );
}
