import test from 'node:test';
import assert from 'node:assert/strict';
import { providerProfile, ensureProfile } from '../src/lib/automatic-profile.ts';
const user={id:'12345678-1234-1234-1234-123456789abc',user_metadata:{user_name:'My-Handle',full_name:'My Name'}};
function client(reads, inserts=[]) {
 const written=[];
 return {
  written,
  from() {
   return {
    select() { return { eq() { return { async maybeSingle() { return reads.shift(); } }; } }; },
    insert(row) {
     written.push(row);
     return { select() { return { async single() { return inserts.shift(); } }; } };
    },
   };
  },
 };
}
test('uses provider name and normalizes handle without opting into sharing',()=>{
 assert.deepEqual(providerProfile(user),{handle:'my_handle',display_name:'My Name',sharing_enabled:false});
 assert.equal(providerProfile({...user,user_metadata:{preferred_username:'x_user',name:'X User'}}).handle,'x_user');
});
test('missing or malformed metadata never derives public name from email',()=>{
 const result=providerProfile({...user,user_metadata:{email:'private@example.com',name:42}});
 assert.equal(result.display_name,'Club member');assert.match(result.handle,/^member_/);
});
test('existing profile and consent remain unchanged',async()=>{
 const saved={data:{handle:'edited',sharing_enabled:true},error:null};const c=client([saved]);
 assert.equal(await ensureProfile(c,user),saved);assert.equal(c.written.length,0);
});
test('collision retries with suffix and keeps sharing off',async()=>{
 const saved={data:{handle:'created'},error:null}; const c=client([{data:null,error:null},{data:null,error:null}],[{data:null,error:{code:'23505'}},saved]);
 assert.equal(await ensureProfile(c,user),saved);assert.equal(c.written.length,2);assert.notEqual(c.written[0].handle,c.written[1].handle);assert.equal(c.written[1].sharing_enabled,false);
});
test('concurrent profile creation returns winner instead of overwriting',async()=>{
 const saved={data:{handle:'winner'},error:null};const c=client([{data:null,error:null},saved],[{error:{code:'23505'}}]);
 assert.equal(await ensureProfile(c,user),saved);assert.equal(c.written.length,1);
});
test('read failure does not attempt insert',async()=>{
 const failure={data:null,error:{message:'offline'}};const c=client([failure]);assert.equal(await ensureProfile(c,user),failure);assert.equal(c.written.length,0);
});
