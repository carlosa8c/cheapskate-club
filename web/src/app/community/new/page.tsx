import {redirect} from "next/navigation";
import {currentMember} from "@/lib/current-member";
import {BuildForm} from "../build-form";
export const dynamic='force-dynamic';
export default async function NewBuild(){if(!await currentMember())redirect('/join');return <section className="prose"><p className="eyebrow">SHOW & TELL</p><h1>Made something?<br/><em>Show it off.</em></h1><p>Big brain, small bill. Every experiment belongs here.</p><BuildForm/></section>}
