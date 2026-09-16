import "server-only";
import {authConfigured,supabase} from "./supabase";
export type Build={id:string;title:string;description:string;screenshot_url:string;project_url:string;discussion_url:string;created_at:string;handle:string;display_name:string;profile_public:boolean;show_usage:boolean;cheers:number};
export async function builds(options:{id?:string;handle?:string;page?:number}={}){
 if(!authConfigured())return {items:[] as Build[],unavailable:true};
 const client=await supabase();
 const {data,error}=await client.rpc('club_build_feed',{build_filter:options.id||null,author_handle:options.handle||null,page_number:options.page||0});
 return {items:(data||[]) as Build[],unavailable:!!error};
}
