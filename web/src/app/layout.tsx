import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
export const metadata: Metadata = { title: "The Cheapskate Club · cheapoS", description: "Build more. Spend less. A community for resourceful AI builders." };
export default function Layout({children}: {children: React.ReactNode}) {
 return <html lang="en"><body><a className="skip" href="#main">Skip to content</a><header><Link className="brand" href="/">cheapo<span>S</span><small>THE CHEAPSKATE CLUB</small></Link><nav aria-label="Main navigation"><Link href="/">Leaderboard</Link><Link href="/community">Community</Link><Link className="button" href="/join">Join / My club ↗</Link></nav></header><main id="main">{children}</main><footer><strong>Be cheap. Don’t be a cheat.</strong><span>A companion to cheapoS. Built for the fun of building.</span><Link href="/about">How it works</Link></footer></body></html>;
}
