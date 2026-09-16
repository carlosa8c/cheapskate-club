import {notFound,redirect} from "next/navigation";
import {buildId} from "@/lib/build-input";
import {builds} from "@/lib/builds";
import {supabase,authConfigured} from "@/lib/supabase";
import {BuildForm} from "../../build-form";
export default async function EditBuild({params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!buildId(id))notFound();if(!authConfigured())redirect('/join');const client=await supabase(),{data:{user}}=await client.auth.getUser();if(!user)redirect('/join');
 const {data}=await client.from('club_builds').select('id').eq('id',id).eq('author_id',user.id).maybeSingle();if(!data)notFound();const {items}=await builds({id});if(!items[0])notFound();return <section className="prose"><h1>A little polish.</h1><BuildForm build={items[0]}/></section>;
}
