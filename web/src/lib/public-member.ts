import 'server-only';
import {cache} from 'react';
import {memberData} from './member';
export const publicMember=cache(async(handle:string)=>{
 if(!/^[a-z0-9_]{3,30}$/.test(handle)) return null;
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return null;
 const response=await fetch(`${url.replace(/\/$/,'')}/rest/v1/rpc/club_member_profile`,{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({member_handle:handle}),cache:'no-store',signal:AbortSignal.timeout(4000)});
 if(!response.ok)throw Error('Profile unavailable');
 return memberData(await response.json());
});
export function clubOrigin(){return (process.env.SITE_URL||'https://cheapskate-club.vercel.app').replace(/\/$/,'');}
