# The proudly economical internet

## The idea

Turn a private cheapoS achievement into an optional public flex: **“I built things using this many free-model tokens.”** Participation uses an X identity; the identity stays recognizable while the numbers grow. The highest-ranked participant is **Top Cheapo**.

The emotional proposition is resourcefulness and belonging. This is not a contest to waste inference, a code-quality ranking, or proof of a hypothetical invoice avoided. “Free tokens” describes how usage was funded. It does not mean fewer tokens were consumed.

## Direction 01 — The Cheapskate Club

**Voice:** a slightly smug, good-natured members’ club that proudly cannot justify a membership fee.

**Headline:** “Less bill. More brag.”

**Composition:** spacious editorial introduction paired with a trophy-shaped champion card; a restrained community total strip; a readable leaderboard with a join card beside it. Warm paper, forest ink, terracotta, pale green. A serif headline gives it personality without changing the existing relay mark.

**Why this is my recommendation:** it gives cheapoS a memorable public face and keeps the data easy to scan. The joke is in the copy and presentation; the core participation flow remains ordinary and clear.

**Language:**

- Join the club
- Claim your cheapo status
- Welcome to the cheap seats
- Freshly Minted Cheapo
- Certified Penny Pincher
- Budget Royalty
- Local Legend (separate local board)
- Free to join. Obviously.

## Direction 02 — Token Arcade

**Voice:** a late-night developer arcade, where building economically is the high score.

**Headline:** “High scores. Low bills.”

**Composition:** a wide typographic opening, an elevated three-player podium, a community scoreboard, and a compact ranking table. Midnight background, lavender champion, lime calls to action, monospaced numerical details. The local brand’s relay silhouette remains recognizable.

**Why choose it:** stronger competition and screenshot appeal for a technical community. It can expand into monthly seasons without changing the all-time tally. Keep visual movement subtle and tied to real updates; no fake real-time counters.

**Language:**

- Insert zero coins
- Enter the leaderboard
- Player slot available
- Build something. Keep the change.
- Got game? Get on the board.

Do not launch both as unrelated products. Pick a primary direction; optionally retain the second as a future theme once the product works.

## Participation should take one clear pass

### Entry from cheapoS

Add a small **Community leaderboard** link inside lifetime Usage, plus an optional unobtrusive invitation after a completed task. Never block onboarding or work behind participation.

1. Show the actual eligible lifetime and monthly totals locally. Explain which categories qualify.
2. **Connect X** opens the leaderboard service’s sign-in page in the browser.
3. Back in cheapoS, preview the public name, handle, avatar, and exact aggregates to be shared. Distinguish historical lifetime import from future sharing.
4. Require an affirmative, initially unchecked **Share my usage publicly** choice. A connected identity alone is not consent.
5. Confirm participation and show the person’s own rank. Upload only the authorized aggregates, with a visible last-successful-sync time and a concise error if syncing fails.
6. Provide **Stop sharing** and **Remove public profile** in the same settings location. Leave private local usage history intact. A failed removal request must remain visibly pending and retryable, never falsely claim deletion.

An invitation on the public website can start sign-in, but a real submission must be paired with the user’s cheapoS installation. Do not imply website sign-in has magically read local usage.

### Identity and authentication

Use the service’s immutable internal user ID linked to X’s stable user ID. Handles and display names can change and must not be primary keys. Do not merge accounts based on matching handles.

X supports OAuth 2.0 Authorization Code Flow with PKCE; configure a registered callback, CSRF `state`, a PKCE challenge, and minimal identity scopes. Confirm the current endpoint/scope requirements for `/2/users/me` during implementation. Keep any confidential client secret on the service, never in desktop JS. Do not request posting/DM permissions. See the [official X OAuth documentation](https://docs.x.com/fundamentals/authentication/oauth-2-0/authorization-code).

After sign-in, issue a service-specific revocable upload credential for the paired installation. Store it using cheapoS’s OS credential storage. Avoid retaining an X access token solely to accept future usage uploads. OAuth/API plan access, availability, and pricing need validation before production; X identity does not imply a free unlimited API.

## What the operator sees

The public board needs only rank, identity, eligible token total, and period. A profile can expose the free/local breakdown and last reported time. Product stats should be legible and should not compete with a mass of transport or model-selection details.

The current prototype’s hero/podium is an all-time free API hall of fame. Table filters independently switch period and category. The live product should label that fixed champion scope explicitly.

An individual’s public receipt might say:

> 41.6M free API tokens reported through cheapoS. Big token energy. Small bill behavior.

Offer “Copy brag” first. A later share-to-X intent should be a user-initiated action with a reviewable message, never an automatic post after opt-in or a rank change.

## Honest ranking rules

| Category | Where it belongs |
| --- | --- |
| Public-free API usage with known classification and returned token usage | Main free API leaderboard |
| Local model usage | Separate local leaderboard; hardware and electricity still cost money |
| Subscription/account-included usage | Separate labeled category in a later version; not public-free |
| Paid usage | Private paid/free comparison or a separately consented public category; excluded from the free crown |
| Estimated token totals, unknown price/billing status, unreturned usage | Disclose privately as unresolved; excluded until classified |

Use input plus output tokens from actual usage records. Reasoning and cached-token subfields are often subsets, so do not add them again blindly. Normalize by provider schema. If a nominally free route reports a charge, retain the observed charge and exclude that request from the public-free tally until reconciled. A task’s spending cap is not evidence that the completed request was free.

Avoid double counting planner/reviewer retries, coordinator calls, parent runs, child tasks, or edits to historical aggregates. Count each actual accounted request once; count tokens from failed attempts only when usage is actually known. Never fabricate totals from the number of requests.

Rank by eligible tokens descending. For a first version, ties receive the same rank; stable identity order controls display only. The prototype has distinct fixture totals and uses sequential sample ranks. Define rank-change and season rules before introducing movement arrows; the demo’s “This month” column is monthly usage, not an invented rank delta.

Lifetime means eligible history the user explicitly approved for publication, plus subsequent uploads. Monthly rankings require timestamped historical request/day records. If those records are unavailable, show “since enrollment” rather than distribute an old lifetime total across guessed months. Use UTC buckets and display the period boundary.

## Privacy and data integrity

Public fields: identity, token aggregates by approved category/period, rank, optional earned usage titles, last report time. Keep source prompts, code, project names and paths, chat text, API keys, request bodies, and detailed technical logs out of the upload schema.

Minimal server records:

- Account: internal ID, X user ID, mutable display profile, opt-in version/time, deletion state.
- Installation: random ID, account binding, revocable hashed upload credential, counter epoch.
- Usage receipt: installation ID + immutable event/receipt ID, coarse UTC bucket, normalized input/output tokens, funding category, schema version. Avoid model identity collection unless needed and explicitly disclosed.
- Aggregates: derived, rebuildable per-account/per-day totals and lifetime totals.

Choose either an idempotent receipt feed or versioned per-installation/day aggregates. Never sum repeated lifetime snapshots. Support reinstall/reset epochs and multiple installations without recounting migrated history. Acknowledged cursors and idempotency keys make retry safe. Removing a chat locally should not subtract already-consumed usage; removing a public profile should remove its published aggregates.

Client-only reporting is not tamper-proof. Label the board **self-reported**. X sign-in associates an identity; it does not prove usage. Reject invalid values, rate-limit uploads, quarantine implausible jumps, and define moderation. Stronger verification could be a later separate evidence tier. Do not award a “verified usage” badge just for X login.

Keep the contest about useful building: include a visible “Don’t burn tokens for a badge” note. Consider optional completed-task highlights later, with separate consent. Avoid compute-burning streaks or prizes that incentivize farming.

## Build order after a design is selected

1. **Freeze the metric and consent contract.** Map cheapoS’s existing lifetime usage records to the categories above. Cover zero, unknown, charged-free routes, retries, subset token fields, and deletion behavior with small deterministic cases.
2. **Build service sign-in and installation pairing.** Real X callback, account session, pairing nonce, revocable upload credential, explicit consent version. No uploads before consent. Define identity unlink/account removal behavior.
3. **Implement aggregate sync.** Batch after settled accounting, with bounded backoff, idempotency, schema validation, account ownership, reset handling, and clear local sync state. No chat/provider API keys go to the service.
4. **Ship one public board.** Start with all-time public-free usage, searchable identities, self-profile, exact counting explanation, and removal. Add a monthly view only when the underlying timestamp data supports it.
5. **Dogfood privately.** Test two opt-in installations, a retry, restart, disconnect, reconnection, duplicate upload, and removal. Use synthetic records; no paid inference is needed to test a leaderboard.
6. **Share a small alpha.** Publish the chosen design with honest sample-free data, a privacy notice, a retention/deletion policy, moderation, and production auth validation. Add copyable stats cards after the basic loop is reliable.

Testing should stay proportionate: pure aggregation/consent cases and a small service fixture first. No new full multi-item agent workflow or intentional long wait is justified for this feature. Disclose and agree any heavier test before introducing it.
