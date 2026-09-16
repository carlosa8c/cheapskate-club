import "server-only";
import {cache} from "react";
import {authConfigured,supabase} from "./supabase";

// React cache deduplicates layout/page reads within this request, not across users.
export const currentMember=cache(async()=>{
 if(!authConfigured()) return null;
 const client=await supabase();
 const {data:{user}}=await client.auth.getUser();
 if(!user) return null;
 const {data:profile}=await client.from('club_profiles').select('handle,display_name,sharing_enabled').eq('id',user.id).maybeSingle();
 return {name:profile?.display_name||'Fellow cheapo',profileUrl:profile?.sharing_enabled?`/@${profile.handle}`:'/account'};
});
