# cheapoS integration work

Companion specification: IMPLEMENTATION_DESIGN.md. These are implementation
requirements, not a claim that the existing Club client already satisfies them.

## Existing starting points

Review cheapos/club.py, cheapos/lifetime_usage.py, the Club server routes,
dist/lifetime_usage.js and the existing OS credential-store adapter. The current
client uses HMAC/Merkle-style reporting. Migrate it deliberately alongside the
new service contract; do not silently relabel its old receipts as verified.

## Required work

1. **Installation identity.** Generate a per-installation Ed25519 key pair;
   retain the private key in OS credential storage. Persist only public identity,
   cursor and key-epoch metadata in normal profile files. If secure storage is
   unavailable or locked, explain the sync state and leave agent work usable.
2. **Browser pairing.** Implement short-lived public-key-bound pairing sessions,
   local challenge and possession proof. No persistent secret in a browser URL,
   copied command, diagnostic log or club_profile.json. Require explicit account
   authorization for pairing, re-pairing and key replacement.
3. **Consent preview.** Pairing, public usage sharing and community posting are
   separate choices. Display exact fields/categories and historical-import labels
   before opting in. Show installation identity, last successful sync, pending
   events and disconnect controls.
4. **Ledger boundary.** Create signed events from settled request accounting,
   rather than trusting an editable summary file. Keep an explicit post-join
   boundary; old totals remain optional self-reported imports. Verify classification
   uses actual access/accounting evidence, not just a provider-name prefix.
5. **Durable outbox.** Persist stable event IDs, sequence, previous-event hash,
   canonical payload and signature before sending. Retry identical bytes after
   offline periods or lost acknowledgments. Advance the cursor only on a matching
   service acknowledgment. Do not sign arbitrary edited totals on reconnect.
6. **Accounting corrections.** Represent late usage reconciliation explicitly;
   exclude uncertain estimates from competition. Prevent reservation/settlement
   double counting. Define profile-copy, reset and key-loss behavior with the
   service so historical usage cannot reappear as new work.
7. **Background sync.** Batch asynchronously with bounded backoff, cancellation
   and clear connection state. Server unavailability must never block chat,
   worker/reviewer selection, local usage tracking, task completion or app startup.
8. **Community entry.** Add Community / Open my profile. Offer a manually previewed
   Share result flow for a summary and optional public repository link. Never
   upload a conversation, source tree or run logs automatically. Recipes should
   open as inspectable drafts, not execute on import.
9. **Revocation and migration.** Disconnect stops uploads and revokes the paired
   installation. Remove obsolete local HMAC credentials on explicit migration;
   retain local usage. Surface server revocation/key mismatch as a Club-only
   action, not an agent-task blocker. Define public deletion with the service.

## Focused acceptance checks

Use synthetic accounting and a local fake service; no live model calls needed.
- A local edited cumulative total is never used as the server's source of scores.
- A modified signed payload fails verification; a fabricated payload signed by
  a deliberately modified client is acknowledged as outside this trust guarantee.
- Lost acknowledgment plus retry does not count twice, including simultaneous retries.
- Out-of-order/conflicting batches preserve the accepted server history.
- Key rotation, cloned profiles and imports do not reset or duplicate history.
- Offline delivery and late settlement keep correct category and period totals.
- No upload occurs before explicit sharing consent or after revocation.
- A Club outage does not interfere with an ordinary cheapoS task.
- Browser flow covers pairing, sharing preview, revoke and profile removal.

Measure new test runtime before expanding integration coverage. Keep unit tests
small; run browser acceptance for the changed flow rather than a full agent suite.

## Done when

Two opted-in installations can independently sync, retry and disconnect; website
scores match accepted synthetic events exactly; the user can inspect and revoke
sharing; and the app remains fully usable while the community service is down.
