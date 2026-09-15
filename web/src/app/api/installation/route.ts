import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { verifiedMessage } from "@/lib/installation-protocol";
export async function POST(request: Request) {
 if(!process.env.SUPABASE_SERVICE_ROLE_KEY) return Response.json({error:"Club connections are not configured yet."},{status:503});
 let verified;
 try { const text=await request.text(); if(text.length>60000) throw Error(); verified=verifiedMessage(JSON.parse(text)); }
 catch { return Response.json({error:"Invalid signed installation request."},{status:400}); }
 const client=createClient(process.env.SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await client.rpc("club_installation_request",{message:verified.message,key_hex:verified.key,digest:verified.hash,sender:createHash("sha256").update(process.env.SUPABASE_SERVICE_ROLE_KEY+":"+(request.headers.get("x-forwarded-for")?.split(",")[0]||"unknown")).digest("hex")});
 if(error) {
  const codes:Record<string,string>={"Pairing expired":"pairing_expired","Pairing revoked":"revoked","Pairing inactive":"revoked","Sharing is paused":"paused","Already connected; disconnect first":"already_connected","Installation key mismatch":"key_mismatch","Too many pairing attempts; try later":"rate_limit"};
  return Response.json({code:codes[error.message]||"conflict",error:"Club request could not be accepted."},{status:409});
 }
 return Response.json(data,{headers:{"Cache-Control":"no-store"}});
}
