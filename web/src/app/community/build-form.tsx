"use client";
import {useActionState,useState} from "react";
import {saveBuild} from "./actions";
import {SubmitButton} from "../submit-button";
import type {Build} from "@/lib/builds";
export function BuildForm({build}:{build?:Build}){
 const [state,action]=useActionState(saveBuild,{error:''});
 const [draft,setDraft]=useState({title:build?.title||'',description:build?.description||'',screenshot_url:build?.screenshot_url||'',project_url:build?.project_url||'',discussion_url:build?.discussion_url||''});
 const [showUsage,setShowUsage]=useState(build?.show_usage||false);
 const field=(key:keyof typeof draft)=>({value:draft[key],onChange:(event:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>setDraft(previous=>({...previous,[key]:event.target.value}))});
 return <form action={action} className="profile-form build-form">
 {build&&<input type="hidden" name="id" value={build.id}/>}
 <label htmlFor="title">What did you build?</label><input id="title" name="title" required minLength={3} maxLength={100} {...field("title")} placeholder="A tiny tool with a big purpose"/>
 <label htmlFor="description">Tell us about it</label><textarea id="description" name="description" required minLength={10} maxLength={3000} rows={7} {...field("description")} placeholder="What it does, how cheapoS helped, and what you learned."/>
 <label htmlFor="screenshot_url">Screenshot URL · optional</label><input id="screenshot_url" name="screenshot_url" type="url" placeholder="https://…" {...field("screenshot_url")}/><small>Use a public image link. Image uploads are not available yet.</small>
 <label htmlFor="project_url">GitHub or live demo · optional</label><input id="project_url" name="project_url" type="url" placeholder="https://…" {...field("project_url")}/>
 <label htmlFor="discussion_url">Your X post · optional</label><input id="discussion_url" name="discussion_url" type="url" placeholder="https://x.com/you/status/…" {...field("discussion_url")}/>
 <label className="checkbox-label"><input type="checkbox" name="show_usage" checked={showUsage} onChange={event=>setShowUsage(event.target.checked)}/>Include my public Club usage card</label><small>Your lifetime Club totals, not measurements for this project. Only appears while your profile is public.</small>
 <small>Publishing shares this build, your Club name, and handle publicly. Your usage sharing settings stay yours to choose.</small>
 {state.error&&<p role="alert" className="notice">{state.error}</p>}
 <SubmitButton pendingText="Publishing…">{build?'Save changes':'Publish build ↗'}</SubmitButton></form>;
}
