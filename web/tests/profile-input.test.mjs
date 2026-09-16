import test from "node:test";
import assert from "node:assert/strict";
import { profileInput } from "../src/lib/profile-input.ts";
function form(values) { const f = new FormData(); for (const [k,v] of Object.entries(values)) f.set(k,v); return f; }
test("normalizes handle and defaults sharing to private", () => {
 assert.deepEqual(profileInput(form({handle:"  Builder_1 ",display_name:" Builder "})), {handle:"builder_1",display_name:"Builder",sharing_enabled:false,share_models:false});
});
test("rejects missing and invalid profile fields", () => {
 for (const values of [{}, {handle:"ab",display_name:"Name"}, {handle:"bad-name",display_name:"Name"}, {handle:"valid",display_name:" "}, {handle:"valid",display_name:"x".repeat(81)}]) assert.equal(profileInput(form(values)), null);
});
test("sharing requires explicit checkbox value", () => {
 for (const value of ["false","true",""]) assert.equal(profileInput(form({handle:"valid",display_name:"Name",sharing_enabled:value})).sharing_enabled,false);
 assert.equal(profileInput(form({handle:"valid",display_name:"Name",sharing_enabled:"on"})).sharing_enabled,true);
});
