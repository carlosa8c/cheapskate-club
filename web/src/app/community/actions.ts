"use server";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {authConfigured,supabase} from "@/lib/supabase";
import {buildInput,buildId} from "@/lib/build-input";
async function memberClient(){
 if(!authConfigured())redirect('/join');
 const client=await supabase();const {data:{user}}=await client.auth.getUser();
 if(!user)redirect('/join');
 return {client,user};
}
export async function saveBuild(_state:{error:string},form:FormData):Promise<{error:string}>{
 const {client,user}=await memberClient();const input=buildInput(form),id=form.get('id');
 if(!input)return {error:'Add a title (3–100 characters), a description (10–3,000), and valid HTTPS links. The discussion link must be an X post.'};
 if(id&&!buildId(id))return {error:'This build could not be found.'};
 const query=id?client.from('club_builds').update(input).eq('id',id).eq('author_id',user.id):client.from('club_builds').insert(input);
 const {data,error}=await query.select('id').single();
 if(error||!data)return {error:'Your build could not be saved. Your draft is still here; try again shortly.'};
 revalidatePath('/community','layout');redirect(`/community/${data.id}`);
}
export async function cheer(form:FormData){
 const {client}=await memberClient();const id=form.get('id');if(!buildId(id))redirect('/community');
 const result=form.get('remove')==='yes'?await client.from('club_cheers').delete().eq('build_id',id):await client.from('club_cheers').insert({build_id:id});
 if(result.error&&result.error.code!=='23505')redirect(`/community/${id}?status=cheer-error`);
 revalidatePath('/community','layout');
}
export async function deleteBuild(form:FormData){
 const {client,user}=await memberClient();const id=form.get('id');if(!buildId(id))redirect('/community');
 const {data,error}=await client.from('club_builds').delete().eq('id',id).eq('author_id',user.id).select('id');
 if(error||!data?.length)redirect(`/community/${id}?status=delete-error`);
 revalidatePath('/community','layout');redirect('/community');
}
