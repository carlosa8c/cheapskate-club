import "server-only";
export type Entry = {handle: string; display_name: string; tokens: number};
export type Board = {state: "ready" | "setup" | "unavailable"; entries: Entry[]};
export async function leaderboard(category: string, period: string): Promise<Board> {
 const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_PUBLISHABLE_KEY;
 if (!url || !key) return {state:"setup",entries:[]};
 try {
  const response=await fetch(`${url.replace(/\/$/,"")}/rest/v1/rpc/club_leaderboard`, {
   method:"POST", headers:{apikey:key,"Content-Type":"application/json"},
   body:JSON.stringify({category_filter:category,period_filter:period}),
   cache:"no-store", signal:AbortSignal.timeout(4000)
  });
  if (!response.ok) throw new Error("Unavailable");
  const data:unknown=await response.json();
  if (!Array.isArray(data) || data.some(row=>typeof row.handle!=="string" || typeof row.display_name!=="string" || !Number.isSafeInteger(Number(row.tokens)) || Number(row.tokens)<0)) throw new Error("Invalid leaderboard");
  return {state:"ready",entries:data.map(row=>({handle:row.handle,display_name:row.display_name,tokens:Number(row.tokens)}))};
 } catch {return {state:"unavailable",entries:[]};}
}
