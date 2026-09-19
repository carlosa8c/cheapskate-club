import test from 'node:test';
import assert from 'node:assert/strict';
import {memberData} from '../src/lib/member.ts';
import {profileInput} from '../src/lib/profile-input.ts';
const sample={handle:'builder',display_name:'Builder',tokens:30,categories:{local:10,included:20},share_models:false,models:[{name:'gemma',tokens:10}]};
test('model details stay hidden without opt-in and appear when enabled',()=>{
 assert.deepEqual(memberData(sample).models,[]);
 assert.deepEqual(memberData({...sample,share_models:true}).models,sample.models);
 const f=new FormData();f.set('handle','builder');f.set('display_name','Builder');
 assert.equal(profileInput(f).share_models,false);
 f.set('share_models','on');assert.equal(profileInput(f).share_models,true);
});
test('invalid totals cannot become a member score',()=>{
 for(const bad of [null,{}, {...sample,tokens:-1},{...sample,tokens:'30'},{...sample,categories:{local:Infinity}},{...sample,models:[{name:'bad',tokens:-1}]}]) assert.equal(memberData(bad),null);
});
test('roles are validated and preserved',()=>{
 const withRoles={...sample,roles:[{name:'worker',tokens:20},{name:'reviewer',tokens:10}]};
 assert.deepEqual(memberData(withRoles).roles,withRoles.roles);
 assert.deepEqual(memberData(sample).roles,[]);
 for(const bad of [{...sample,roles:'not-array'},{...sample,roles:[{name:123,tokens:10}]},{...sample,roles:[{name:'worker',tokens:-1}]}]) assert.equal(memberData(bad),null);
});
import {estimateModelSavings} from '../src/lib/model-helpers.ts';
test('estimated savings use refined tiers for small and large models',()=>{
  // Small cheap models (e.g. Llama 3.1 8B) use the mini rate.
  assert.equal(estimateModelSavings('llama-3.1-8b',1_000_000),0.30);
  assert.equal(estimateModelSavings('gpt-4o-mini',2_000_000),0.60);
  // Mid-size models (e.g. 27B, flash) use the mid rate.
  assert.equal(estimateModelSavings('qwen3-27b',1_000_000),1.00);
  assert.equal(estimateModelSavings('gemini-flash',1_000_000),1.00);
  // Large models (e.g. Llama 3.3 70B, 120b, pro) use the high rate.
  assert.equal(estimateModelSavings('llama-3.3-70b',1_000_000),5.00);
  assert.equal(estimateModelSavings('mistral-large-120b',100_000),0.50);
  assert.equal(estimateModelSavings('gemini-1.5-pro',1_000_000),5.00);
  // Unknown models fall back to the default rate.
  assert.equal(estimateModelSavings('mystery-model',1_000_000),3.00);
  assert.equal(estimateModelSavings('llama-3.1-8b',0),0);
});