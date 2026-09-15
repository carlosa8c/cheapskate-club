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
