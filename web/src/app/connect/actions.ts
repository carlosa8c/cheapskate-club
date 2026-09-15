"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
export async function rememberPairing(form:FormData) {
 const id=String(form.get("id")||""); if(!/^[0-9a-f-]{36}$/.test(id)) redirect("/connect");
 (await cookies()).set("club_pairing",id,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",maxAge:600,path:"/"});
 redirect("/join");
}
export async function approve(form:FormData) {
 const id=String(form.get("id")||""); if(!/^[0-9a-f-]{36}$/.test(id)) redirect("/connect");
 const client=await supabase();const {error}=await client.rpc("club_approve_pairing",{pair:id});
 (await cookies()).delete("club_pairing");
 redirect(`/connect?id=${id}&status=${error?"failed":"approved"}`);
}
