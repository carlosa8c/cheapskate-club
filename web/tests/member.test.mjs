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
