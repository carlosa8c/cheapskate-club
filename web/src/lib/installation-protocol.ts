import { createPublicKey, verify, createHash } from "node:crypto";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export function verifiedMessage(body: {payload?: unknown; signature?: unknown; public_key?: unknown}) {
 if (typeof body.payload!=="string" || body.payload.length>50000 || typeof body.signature!=="string" || !/^[0-9a-f]{128}$/.test(body.signature) || typeof body.public_key!=="string" || !/^[0-9a-f]{64}$/.test(body.public_key)) throw Error("Invalid signed request");
 const key=createPublicKey({key:Buffer.from("302a300506032b6570032100"+body.public_key,"hex"),format:"der",type:"spki"});
 if(!verify(null,Buffer.from("cheapskate-club-v1\n"+body.payload),key,Buffer.from(body.signature,"hex"))) throw Error("Invalid signature");
 const m=JSON.parse(body.payload);
 if(!m || m.version!==1 || !uuid.test(m.installation_id) || !uuid.test(m.pairing_id) || !["pair","status","disconnect","consent","sync"].includes(m.action)) throw Error("Invalid message");
 if(["sync","consent"].includes(m.action)) {
  if(!Number.isSafeInteger(m.sequence)||m.sequence<1||m.sequence>1000000000 || typeof m.previous_hash!=="string" || !/^(|[0-9a-f]{64})$/.test(m.previous_hash)) throw Error("Invalid cursor");
 }
 if(m.action==="consent" && typeof m.enabled!=="boolean") throw Error("Invalid consent");
 if(m.action==="sync") {
  if(!Array.isArray(m.events)||m.events.length<1||m.events.length>100) throw Error("Invalid events");
  const seen=new Set();
  m.events.forEach((e: Record<string, unknown>,index: number)=>{
   if(!e || typeof e.event_id!=="string" || !uuid.test(e.event_id) || seen.has(e.event_id) || e.slot!==index || !["public_free","local","included","paid","unknown"].includes(String(e.category)) || typeof e.accounting_at!=="string" || !/^\d{4}-\d{2}-\d{2}T00:00:00Z$/.test(e.accounting_at) || !Number.isFinite(Date.parse(e.accounting_at)) || Date.parse(e.accounting_at)>Date.now()) throw Error("Invalid event");
   for(const field of ["input_tokens","output_tokens"]) if(!Number.isSafeInteger(e[field]) || Number(e[field])<0 || Number(e[field])>1000000000) throw Error("Invalid token count");
   seen.add(e.event_id);
  });
 }
 return {message:m,key:body.public_key,hash:createHash("sha256").update(body.payload).digest("hex")};
}
