import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifiedMessage} from '../src/lib/installation-protocol.ts';
const vector=JSON.parse(readFileSync(new URL('./fixtures/python-signature.json',import.meta.url)));
test('accepts Python Ed25519 protocol fixture',()=>{assert.equal(verifiedMessage(vector).message.action,'pair');});
test('rejects payload tampering and wrong signature',()=>{
 assert.throws(()=>verifiedMessage({...vector,payload:vector.payload.replace('pair','sync')}));
 assert.throws(()=>verifiedMessage({...vector,signature:'00'.repeat(64)}));
});
test('rejects oversized and malformed envelopes',()=>{
 assert.throws(()=>verifiedMessage({...vector,payload:'x'.repeat(50001)}));
 assert.throws(()=>verifiedMessage({...vector,public_key:'bad'}));
});

test('optional model metadata is signed and validated',async()=>{
 const {generateKeyPairSync,sign}=await import('node:crypto');
 const {privateKey,publicKey}=generateKeyPairSync('ed25519');
 const envelope=message=>{const payload=JSON.stringify(message);return {payload,signature:sign(null,Buffer.from('cheapskate-club-v1\n'+payload),privateKey).toString('hex'),public_key:publicKey.export({format:'der',type:'spki'}).subarray(-32).toString('hex')};};
 const message={...JSON.parse(vector.payload),action:'sync',sequence:1,previous_hash:'',events:[{event_id:'44444444-4444-4444-4444-444444444444',slot:0,category:'included',input_tokens:1,output_tokens:2,accounting_at:'2026-01-01T00:00:00Z',model_name:'gemma4:31b'}]};
 assert.equal(verifiedMessage(envelope(message)).message.events[0].model_name,'gemma4:31b');
 message.events[0].model_name='bad\nmodel';assert.throws(()=>verifiedMessage(envelope(message)));
 delete message.events[0].model_name;assert.equal(verifiedMessage(envelope(message)).message.events.length,1);
 assert.throws(()=>verifiedMessage(envelope({...message,action:'consent',enabled:true,share_models:'yes'})));
});

test('role metadata is validated and accepted',async()=>{
 const {generateKeyPairSync,sign}=await import('node:crypto');
 const {privateKey,publicKey}=generateKeyPairSync('ed25519');
 const envelope=message=>{const payload=JSON.stringify(message);return {payload,signature:sign(null,Buffer.from('cheapskate-club-v1\n'+payload),privateKey).toString('hex'),public_key:publicKey.export({format:'der',type:'spki'}).subarray(-32).toString('hex')};};
 const message={...JSON.parse(vector.payload),action:'sync',sequence:1,previous_hash:'',events:[{event_id:'55555555-5555-5555-5555-555555555555',slot:0,category:'included',input_tokens:1,output_tokens:2,accounting_at:'2026-01-01T00:00:00Z',role:'worker'}]};
 assert.equal(verifiedMessage(envelope(message)).message.events[0].role,'worker');
 message.events[0].role='invalid_role';assert.throws(()=>verifiedMessage(envelope(message)));
});
