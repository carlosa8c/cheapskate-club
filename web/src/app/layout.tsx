import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
export const metadata: Metadata = { title: "The Cheapskate Club · cheapoS", description: "Build more. Spend less. A community for resourceful AI builders." };
export default function Layout({children}: {children: React.ReactNode}) {
 return <html lang="en"><body data-design="club"><a className="skip" href="#main">Skip to content</a><header className="site-header"><Link className="brand" href="/"><Image src="/brand-icon.svg" width="38" height="38" alt=""/>cheapoS <span>THE CHEAPSKATE CLUB</span></Link><nav aria-label="Main navigation"><Link href="/">Leaderboard</Link><Link href="/community">Community</Link><Link href="/about">How it works</Link><Link className="button primary" href="/join">Your club ↗</Link></nav></header><main className="page" id="main">{children}</main><footer className="site-footer"><Link className="brand" href="/"><Image src="/brand-icon.svg" width="25" height="25" alt=""/>cheapoS</Link><span>Make expensive compute the exception.</span><Link className="text-button" href="/account">Your data, your call</Link></footer></body></html>;
}
