# cheapoS stats: launch now, preserve the useful history

Private product roadmap · 2026-09-18 · Design only; no collection or sharing changes implemented.

Keep this document in the private cheapoS-leaderboard repository. Public cheapoS
implementation tasks may describe collection contracts without copying the
private premium strategy.

Source review: cheapoS `e06af4b` and cheapoS-leaderboard `79981c0`, especially
`cloudflare/` and the `web/` ingestion/SQL code that supplies its data. This is a
repository review, not a verification of a deployed database or service. The
site is still being designed; demo values are expected during that work.

## Product direction

**The leaderboard celebrates free compute. The useful product explains what
that compute accomplished, what it cost, and how much help it needed.**

Launch a small, fun public product soon. Preserve the basic facts needed for
future analysis while work happens, then build sophisticated reports when there
is demand. Do not hold launch for billing, a universal efficiency score, a new
benchmark platform, or a perfect anti-cheat system.

The main product measure should be **authorized jobs reaching a reviewable result
without operator rescue**. Human approval and merging are separate milestones.
An unattended agent that finishes while its owner sleeps should count as ready;
the hours before the owner clicks Merge are not agent execution time.

Tokens are a usage measure, not a productivity measure. A 234-turn repair loop
should increase usage and recovery overhead, not win an efficiency award.
Free usage does not establish how many paid tokens a different agent would have
used to finish the same job.

## 1. What to launch

### A compact public profile and share card

Use the existing visual direction and X-linked Club identity. The first useful
profile needs these facts, with consistent periods and source coverage:

| Visible fact | Meaning |
| --- | --- |
| Public-free tokens | Reported input + output on explicitly eligible public-free routes |
| Included access / local / paid | Separate companion totals; subscriptions and local hardware are not literally free |
| Paid model usage | Reported variable cost, or a clearly labeled estimate when only rates are known |
| Work ready for review | Distinct coding jobs satisfying their current checks and independent review |
| Accepted work | Distinct reviewed jobs accepted and committed/merged; read-only answers have their own category |
| Completed without rescue | Ready jobs with complete intervention records and no unplanned operator rescue |
| Activity | Daily reported tokens and completed jobs, plus first recorded date |
| Freshness | Last successful sync and whether the selected history is complete |

Show a few large numbers and put accounting detail in a drawer. Do not put
reservation arithmetic across every card. Public token scores use reported
consumption only; uncertain reservations remain a local accounting detail and
never become leaderboard points. A small coverage indicator can explain missing
reports without overwhelming the headline.

Example share-card template, with real values substituted only when available:

> **Small bills. Finished builds.**
>
> {public-free tokens} public-free tokens · {accepted jobs} accepted jobs
>
> {variable model cost} · {ready without rescue}/{eligible ready jobs} without rescue
>
> Last 30 days · app-reported · {last sync}

For a launch before outcome instrumentation is ready, ship the token profile and
omit those outcome fields. Do not turn missing evidence into zero jobs, 100%
autonomy, or a borrowed demo total. Add outcome cards as real records accumulate.

### The fun layer

- Keep **Top Cheapo** as the lifetime usage crown, with a monthly view so newcomers
  can participate. Use clear category filters.
- If retaining the existing `zero_cost` board, label it **No additional model
  charge** and expose its public-free, included, and local composition. Do not
  call that entire total public-free usage. Exclude unknown classifications.
- Add badges such as **First Build**, **First Million**, and **Hands-Off Builder**.
  Milestones should have visible definitions, not imply code quality certification.
- Keep a builds showcase with voluntarily published links/screenshots. Existing
  `club_builds` records provide a starting point. Publishing a build and publishing
  private usage are separate choices.
- Do not award prizes for retries, failed edits, raw action count, or fastest token
  burn. A usage crown is entertainment; completion evidence provides context.

The launch message can respond to interest in expensive agent usage without
claiming a measured saving against Astra, Codex, or any other product. We do not
collect their usage or have comparable outcome measurements.

## 2. What the repositories already support

Paths below are relative to the named repository. Findings concern the reviewed
source, including gaps between client, backend, and presentation.

| Source | Available today | Gap relevant to this plan |
| --- | --- | --- |
| cheapoS: `cheapos/metrics.py` | Request role, purpose, response outcome, tokens/cost provenance, task timing, action totals, local export | Some recovery/intervention counts depend on event titles; bounded history means historical totals can be partial |
| cheapoS: `cheapos/engine.py`, request instrumentation | Request/retry identity, dispatch, model identity, context size, selected budgets, request timing and structured failures | Much of this does not survive into lifetime analytics; first-output latency and durable lifecycle attribution need explicit contracts |
| cheapoS: `cheapos/lifetime_usage.py` | Persistent usage through task deletion, day/category/role/model totals, reservations, lifetime completion flags | Drops purpose, errors, request duration and job lifecycle timestamps; current completion flags are per task, not every distinct job in a long chat |
| cheapoS: `cheapos/club.py` | Optional sharing, optional model names, signed batched sync, stable usage IDs, outbox and correction fingerprints | Uploads token counts/day/category/role/model, not request timing, cost, purpose or job-level outcomes |
| leaderboard: `web/src/lib/installation-protocol.ts` and `web/src/app/api/installation/route.ts` | Ed25519 verification of exact payload bytes; owner-bound installation protocol | v1 expects day-level usage events; it has no typed job/recovery analytics contract |
| leaderboard: `web/supabase/migrations/202609150006_roles.sql` | Usage upserts, roles, opt-in model aggregates, profile RPC | Does not persist or return the client's `work_outcomes` object; profile aggregates omit paid and unknown categories |
| leaderboard: `cloudflare/src/lib/engine-stats.ts`, `pages/api/stats.ts` | Public community/profile rendering via Supabase RPC | Community totals use a leaderboard limited to 100 members; detailed aggregation fetches only the top 20 profiles |
| leaderboard: `cloudflare/src/lib/member.ts`, `components/member-stats.tsx`, `components/share-actions.tsx`, `pages/api/scoreboard.ts` | Prototype outcome cards and share assets | Demo completions/rates remain in fallback paths or static markup; the SVG community card mixes overall totals with the champion's category mix |
| leaderboard: `cloudflare/src/lib/model-helpers.ts` | Display model labels and comparison estimates | Provider grouping mixes model maker, serving provider and local execution; dollar estimates use guessed rates by name |
| leaderboard: `web/supabase/migrations/202609150005_community.sql` | Voluntary build submissions and cheers | A public build is not yet linked to a versioned job completion receipt |

### Specific prelaunch correctness work

1. **Separate demo mode from real mode.** Real-mode empty, unavailable, private,
   incomplete and zero are distinct states. Keep demo fixtures for design, but
   never fall back to them after a failed real fetch. Apply this to images and
   share cards as well as profile pages.
2. **Aggregate the whole eligible community.** Add a dedicated aggregate RPC or
   daily aggregate table. Top-100 standings and top-20 model samples are useful
   views, not community denominators. Report the opt-in/known-model sample size.
3. **Make completion sync independent.** `club.py` attaches `work_outcomes` only
   when new usage events exist, and the checked-in SQL ignores that object. A
   merge after the last inference request needs its own durable job update and
   acknowledgement, even when zero additional tokens were consumed.
4. **Use evidence for access categories.** `lifetime_usage.clean()` creates a
   conservative `club_category`, but the exporter calls `resolve_category(row)`
   instead. That resolver can infer public-free from an `openrouter/` prefix and
   local from a coordinator role/model prefix. Carry explicit request-time access
   evidence through export; unknown stays unknown. A positive reported charge
   overrides a free classification. Preserve historical provenance when repairing
   records rather than silently asserting previously unknown access.
5. **Remove unsupported savings claims from real mode.** The local summary has a
   fixed $3/million multiplier; Cloudflare uses name-based rates and another fixed
   multiplier. These are scenario placeholders, not measured money saved. Also
   reconcile the lifetime documentation, which currently says no multiplier exists.
6. **Choose one connection/API owner.** Cloudflare renders the site, while the
   checked-in pairing/installation endpoint and migrations live under `web/`.
   The cheapoS default Club URL still points to the older Vercel host. Confirm the
   intended launch origin and endpoint routing together; a frontend-only deploy
   is not evidence that pairing/sync moved with it. No deployment was inspected here.
7. **Use the implemented protocol as the baseline.** Older protocol documents
   describe HMAC/Merkle/RFC 8785 flows; the inspected implementation uses Ed25519
   over exact bytes at `/api/installation`. Replace conflicting documentation when
   extending the protocol. Signed records prove key possession and transport
   integrity, not that a modified local app actually ran the claimed inference.

## 3. Metric dictionary

Stages: **Launch** = small free public product; **Capture** = preserve now and
initially use locally/private; **Later** = compute when sufficient evidence exists.
“Capture” does not authorize upload. Public models, project details, costs and
private analytics require the consent scopes described below.

### Usage and money

| Metric | Definition / required evidence | Stage |
| --- | --- | --- |
| Reported tokens | Sum reconciled reported input + output; separately retain each component | Launch |
| Access mix | Tokens/requests across public-free, included, local, paid and unknown, frozen from dispatch evidence | Launch |
| Public-free remote share | Public-free / (public-free + paid remote tokens); show denominator and excluded included/local/unknown | Launch |
| No-additional-charge share | (Public-free + included + local) / all classified tokens; separate from public-free share | Launch |
| Paid input/output tokens | Reported usage on paid-classified requests; not comparable one-for-one across models/tokenizers | Launch |
| Variable model cost | Provider-reported charges and configured estimates separately, with known-cost coverage; retain sub-cent precision | Launch |
| Daily/weekly/monthly/lifetime usage | Same eligibility and timezone rules across views; first recorded date and missing-history state | Launch |
| Role usage | Planner, worker, reviewer, coordinator and unknown; token, request and cost totals | Launch |
| Model and route usage | Requested route vs served model, identity provenance, provider vs model maker; consent required for public names | Capture |
| Work vs overhead | Request purpose: work/planning/review/recovery/probe/greeting; a retry keeps its original purpose plus retry relationship | Capture |
| Cache/reasoning usage | Provider-reported subsets and coverage; never add subsets to input + output again | Capture |
| Uncertain accounting | Unreconciled request count, reserved estimate, age and eventual resolution; private drilldown, no ranking credit | Capture |
| Cost per finished job | Conditional successful-job cost and whole-cohort spend / completed jobs, shown separately with unresolved cohort members | Capture |
| Fully loaded personal cost | Optional user-entered subscription/hardware/electricity allocations; assumptions visible, private, never inferred from tokens | Later |
| Comparable-baseline savings | Baseline cost minus cheapoS cost for the same accepted outcome and comparable test conditions | Later |

### Useful work and operator effort

| Metric | Definition / required evidence | Stage |
| --- | --- | --- |
| Authorized jobs started | Stable job IDs after work authorization; separate planning attempts/drafts and read-only jobs | Capture |
| Ready for review | Current candidate passes required checks and independent review; durable receipt and timestamp | Launch when captured |
| Accepted coding jobs | Human acceptance plus commit/merge receipt for that candidate; one job, not every item commit | Launch when captured |
| Read-only answers accepted | Explicit acceptance if available; otherwise delivered answers, never silently treated as accepted coding work | Capture |
| Lifecycle distribution | Working, waiting for route, waiting for user, ready, accepted, cancelled, abandoned, terminal failure; current state and history | Capture |
| Without-rescue completions | Eligible ready jobs with zero unplanned operator interventions and complete observation; scheduled approval/merge is allowed | Launch when captured |
| Rescue burden | Count and type per job: manual retry, model override, corrective instruction, external repair, credential fix; unknown actor remains unknown | Capture |
| Human acceptance | Accepted / explicitly decided review-ready jobs in the same cohort; also show pending and requested-changes counts | Capture |
| Completion yield | Ready / authorized jobs in a start-date cohort, as of a timestamp; show still-open/cancelled/failed jobs rather than hiding them | Capture |
| Time to ready / accepted | Separate authorization-to-ready and ready-to-human-acceptance clocks; date of creation is not necessarily work start | Capture |
| Active time / wait time | Non-overlapping execution, provider pacing/cooldown, local checks, user wait and stopped intervals | Capture |
| Active days and streaks | Days with real task work, using a stated timezone; probes or sync polling do not keep a streak alive | Later |
| Public builds | Voluntarily published artifacts, optionally linked to accepted jobs; one build may require many jobs | Launch optional |

### Quality, recovery and efficiency

| Metric | Definition / required evidence | Stage |
| --- | --- | --- |
| Check results | Passed/failed/error/cancelled runs, reused evidence and not-run; command profile and candidate identity | Capture |
| Review results | Approve, substantive request-changes, invalid response, unavailable or incomplete; candidate-specific evidence | Capture |
| First-pass review approval | Approved at first completed valid review / eligible reviewed candidates; diagnostic, not a quality score | Capture |
| Revision rounds | Check/review feedback → candidate change → re-verification/review episodes; distinguish formatting repairs | Capture |
| Post-acceptance rework | Reopened/reverted work or user-linked follow-up defect fixes; cannot automatically classify every follow-up as a defect | Later |
| Actions / turns | Dispatched model requests + executed tool calls exactly once, with existing per-role breakdown; checks/checkpoints not counted twice | Capture |
| Tool validity | Invalid JSON, schema rejection, bad path, syntax rollback, failed execution; unique attempt IDs and structured codes | Capture |
| Recovery outcomes | Episode start, strategy changes, next meaningful progress, resolved blocker and eventual ready outcome | Capture |
| Recovery overhead | Requests/tokens/cost/time attributed to recovery episodes; includes all attempts, not just the successful model | Capture |
| Repeated failed actions | Deterministically repeated rejection/failure signatures; local fingerprints, aggregate counts on wire | Capture |
| Context growth | Prompt tokens/bytes by turn, peak context, compaction/filtering, output truncation and repeated evidence counts | Capture |
| Failed-attempt overhead | Reported resources spent on failed requests/rejected edits; do not label all review/recovery resources wasted | Capture |
| Model-pair efficiency | Completion yield, rescue burden, rework, tokens/cost and active duration for comparable worker/reviewer cohorts | Later |
| Harness improvement | Version/config cohort comparisons and controlled fixtures; distinguish version correlation from causal improvement | Later |

### Provider and model behavior

| Metric | Definition / required evidence | Stage |
| --- | --- | --- |
| Request success | Usable response / dispatched requests; HTTP 200, valid tool arguments, and successful task outcome are separate layers | Capture |
| Failure mix | Rate limit, quota, authentication, timeout, empty response, transport, invalid tool response, output cap, context limit, cancellation | Capture |
| Request latency | Queue/pacing, gateway round trip, first visible output and total completion, with timing coverage | Capture |
| Cooldown handling | Reported wait, observed wait, requested scope, route selected next, cross-provider vs same-provider handoff | Capture |
| Handoff effectiveness | Eligible alternative available, time to next usable response, preserved progress, eventual blocker resolution | Capture |
| Availability experienced | Observed success and waits for users who attempted requests; not a provider-wide uptime SLA | Later |
| Budget/cap effects | User-configured limits vs discovered model/provider capabilities vs unknown; stop/truncation source and selected output budget | Capture |
| Reviewer capability | Valid decisions, actionable findings, rework and supported independence evidence; model parameter count alone is not a quality measure | Later |

### Club health and economics

These are service-owner analytics, distinct from what users publicly share.

| Metric | Definition / required evidence | Stage |
| --- | --- | --- |
| Pairing funnel | Connect intent → X authorization → pairing → consent → first successful sync; coarse first-party events, no secret query strings | Launch |
| Activation | First real eligible usage and first ready/accepted job after consent; account creation alone is not activation | Capture |
| Retention | Consented active members returning in defined weekly/monthly cohorts; retain denominator and unknown/offline state | Later |
| Sync health | Last accepted event, lag, pending age/count, failed batches, exact retries, conflicts and correction volume | Launch |
| Data coverage | Members/jobs/requests with required fields; classification, cost, served identity, timestamps and intervention coverage | Launch |
| Sharing and referrals | Explicit card creation/copy/share-link clicks and aggregate referral conversions; do not claim a copy was posted to X | Capture |
| Builds participation | Published builds, unique authors, cheers and attributable signup conversion | Later |
| Hosting unit cost | Ingested events, stored bytes, aggregate reads/cache hits, bandwidth, service bill / active member | Capture |
| Premium economics | Trial/paid conversion, recurring revenue, churn, refunds, payment fees, support and hosting cost per subscriber | Later |

## 4. Definitions that prevent misleading reports

### One job is not one chat, item, request, or branch commit

An unattended approved plan is one job with child items. An interactive chat can
contain multiple user-requested jobs. Create a job ID when a new objective is
authorized; retries, provider changes, recovery and Resume retain it. A genuinely
new request gets a new ID. Keep a scope revision inside the job for approved
changes; don't inflate completions by assigning each repair a new job.

Track plan attempts separately, including planning abandonment. Otherwise a
beautiful completion rate can exclude everybody who never got past planning.
Keep project ID private/opaque and optional; never derive a public project name
from a filesystem path. Build publication is an explicit user action.

### Rescue and acceptance need honest denominators

Count a rescue when an unplanned operator action enables stuck work to proceed.
Routine initial approval, a scheduled test permission, intentional pause/resume,
final approval and merge are not inherently rescues. Record the actor and reason,
including unknown; do not guess them solely from a Resume click.

An external agent approving a plan is automation, not a human rescue. An external
agent editing broken files is assistance. cheapoS cannot always observe that;
provide optional assistance declarations and display **no recorded rescue** when
the evidence cannot support the stronger claim. Never equate absent records to
proved autonomy.

For a selected start-date cohort, show:

```
completion_yield = jobs_ever_ready / authorized_jobs_started
without_rescue_share = ready_jobs_without_rescue / ready_jobs_with_complete_intervention_history
human_acceptance = accepted_jobs / jobs_with_an_explicit_accept_or_request_changes_decision
```

The UI must name the cohort, numerator, denominator, observation end, and pending
count. Decision rate and eventual acceptance are distinct: a job may receive a
valid request for changes and later be accepted. Version the metric definition
and specify first-decision vs latest-decision for any acceptance chart. Show
monthly ready/accepted **flows** separately from start-cohort yield.

For reviewer independence use the controller's candidate-specific review receipt
and identity evidence, not “the latest worker name differs from the latest
reviewer name.” A valid rejection is useful quality control, not a failed model
call. Do not incentivize swapping reviewers until one approves.

### Money and efficiency

Missing billed cost is unknown, not $0. Show a known reported sum with coverage,
and a separately labeled configured estimate where appropriate. Included-access
fees and hardware costs sit outside variable request billing unless the owner
explicitly allocates them. Keep decimal amounts/currency; round only for display.

For cost per completion, offer both successful-job cost and **all spend in the
same started-job cohort / accepted jobs**. Include failed, abandoned and open jobs
in cohort spend, identify incomplete cost coverage, and report null when the
denominator is zero. A successful-only mean hides the cost of unsuccessful work.

A future price calculator can show an **illustrative API equivalent** using
versioned input/output/cache rates and a user-selected comparator. That is not
actual savings. A credible savings claim needs repeated comparable tasks with
equivalent acceptance criteria, baseline settings, versions, costs and outcomes.
Record both arms' own tokens: different tokenizers and workflows invalidate a
simple “these free tokens are the paid tokens we saved” conversion.

Natural project histories support observational model-pair comparisons, not
universal rankings. Preserve handoff history and task type; do not credit only
the last worker/reviewer with all successful work. Display sample size, spread
(median/p90 where supported), failures and uncertainty. No “best pair” badge from
a handful of easy jobs. Existing `cheapos/benchmark.py` uses scripted providers;
it validates controller behavior, not real model quality. Real comparative runs
remain explicitly authorized compute, never background telemetry work.

## 5. Minimum data foundation to start preserving

Extend the existing local accounting rather than adding a second source of truth.
Metrics consume the authoritative reservation/reconciliation ledger. Record at
stable lifecycle boundaries, before bounded task history is pruned. Collection
must not make model requests, delay tools, or stop an otherwise authorized task.

Use versioned **upsertable summaries**, plus compact lifecycle/recovery receipts.
Do not upload every UI poll, SSE chunk, source read or token delta. One logical
request has a stable ID and may receive later usage/cost corrections. Retries
are separate attempts linked to that request's logical operation.

### Common envelope

```
schema_version, metric_definition_version, record_type
installation_id, record_id, revision, operation = upsert | delete
job_id?, occurred_at, recorded_at
app_version, build_revision, coverage, synthetic
```

The receiver supplies `received_at`. Use UTC timestamps for lifecycle ordering;
use monotonic measured durations for elapsed work. Do not calculate network
latency from two machines' clocks. Public views normally expose day buckets,
not exact private activity times. Versions and configuration cohorts are needed
to tell whether new harness patches actually helped.

### Request summary: preserve on dispatch and reconcile on completion

- Stable request ID, job/item/review episode IDs, logical operation ID, attempt
  index and `retry_of`; dispatched status and purpose.
- Role, requested route, serving provider, requested model, served model, identity
  source/known status; gateway type/version separately from provider/model maker.
  No connection URL, account name, credential ID or private endpoint label.
- Access class, evidence source and evidence version at dispatch; actual positive
  charge correction. Unknown pricing and unknown identity stay explicit.
- Input/output tokens, cached/reasoning subsets, reported variable cost/currency,
  configured cost estimate/rate snapshot, reconciliation/provenance. Keep private
  reservation estimates separate from real usage and public scores.
- Terminal response status, allowlisted error class, tool-argument validity,
  finish reason, truncation/cancellation source.
- Start/finish timestamps; pacing/queue, gateway request and first-output
  durations where measured. Hidden gateway attempts remain unknown.
- Context tokens/bytes, selected output budget, effective model limits and their
  source, compaction/filter counts. Export structural quantities, not content or
  hashes of prompts/source code.

### Job summary and lifecycle: independent of usage sync

- Opaque job ID, optional private project ID, creation/authorization/scope
  revision, Interactive/Unattended, coding/read-only, optional user task-type tag.
- Authorized policy snapshot by safe enums/numeric values: free-only/paid allowed,
  automatic/fixed role selection, coordinator enabled, measurement/uncapped/bounded,
  user limits and command-permission mode. No command arguments or environment.
- Start, stage transitions, wait reason, first/current ready timestamp, acceptance,
  merge/commit completion, cancellation/reopening and structured terminal reason.
- Candidate revision and receipts for required check coverage, independent review,
  final acceptance; verification invalidation after edits must update readiness.
- Durable counters for actions, invalid arguments, rejected edits, checks/reuse,
  review outcomes, recovery episodes, handoffs and operator interventions.
- Measured active/wait durations, coverage start and missing-history indicators.
  Sum non-overlapping stage intervals for wall time; cumulative parallel request
  durations can legitimately exceed it and must be labeled differently.
- Actor provenance for approval, guidance, retries and external assistance;
  optional user declarations for activity the app cannot observe.

### Recovery/check/review summary: enough to explain the outcome

- Episode ID, parent job/candidate, stage, structured trigger, strategy attempted,
  from/to route IDs when shared, start/end, resolution and operator involvement.
- Check outcome/profile ID and candidate version; reused vs newly run; no command,
  stdout, source path, traceback or error text in cloud analytics.
- Review outcome, requirement/finding counts, validity, independence evidence,
  candidate version and unresolved finding count. Do not upload finding text.
- Counts/durations/resources attributable to the episode, and whether progress or
  readiness followed. A new HTTP 200 alone is not a successful recovery.

### Daily aggregates and event integrity

Materialize member/category/role day totals and all-community totals from eligible
records. Keep private per-job and consented model/provider breakdowns separate
from anonymous public reads. Store counts, sums, coverage denominators and
mergeable distributions when needed; never average daily averages or percentiles
to invent a monthly percentile.

Use unique `(installation_id, record_type, record_id)` plus increasing revision.
An exact retry is idempotent; an older revision cannot overwrite a correction.
Update aggregate contribution as **new minus old** in the same transaction.
Corrections can legitimately reduce totals. Validate nonnegative bounded numbers
and enums, owner binding, consent, timestamp policy and replay protection.
Do not make a monotonic token total an anti-cheat invariant.

Keep durable job/request identity across app restarts and backup restoration.
Forked installations must not replay the same imported ledger as fresh work;
explicit imports/migrations retain provenance and original record identities or
remain excluded from competitive scores until deduplicated. A reset starts a
new measurement period rather than fabricating historical continuity.

Plan protocol v2 alongside v1 with explicit capability negotiation. Preserve the
existing exact-byte signing, cursor and outbox guarantees. Unknown/new fields
must not look successfully stored when the receiver drops them. Acknowledgements
identify accepted schema and record revisions. Completion-only batches must be
valid. Extend the SQL and protocol validators together, not only the UI types.

Older records keep their actual coverage. Do not manufacture historic rescue
counts, per-job timestamps or daily completions from today's lifetime totals.
Keep historical totals separately labeled where attribution is unavailable.

## 6. Consent, trust, retention and service cost

### Four independent controls

| Control | Default proposal | Scope |
| --- | --- | --- |
| Local usage history | Existing local accounting retained | Owner inspection/export; explain retention and deletion |
| Join public Club | Off until explicit opt-in in cheapoS | X-linked public profile and selected token/outcome summary |
| Share models/providers publicly | Off | Named breakdowns and contribution to community model analysis |
| Private hosted analytics | Off, separate consent | Optional job/project history, timestamps, costs and diagnostics available only to owner |

Add outcome and cost categories to the sharing preview before first upload; old
token-only consent must not silently authorize project-level history. Users can
preview data, pause sharing, export, disconnect and delete hosted data. Decide
historical backfill explicitly: current sync starts after consent. “All time”
means since recorded/sharing coverage began, not automatically the user's entire
life with AI. Paid subscription is not consent to extra collection.

Use an immutable account ID to associate installations; X handles can change.
Keep login/profile information separate from analytics identifiers. Pseudonymous
job IDs are still linkable data. Do not collect prompts, code, filenames, repository
URLs, task titles, tool arguments/results, secrets, raw error strings, IP-based
developer profiles, or browser fingerprints for these metrics. Short-lived
operational abuse logs, if needed, get a separate stated policy.

Signed app reports, provider-reported usage forwarded by the app, and independent
provider-attested evidence are different trust levels. Existing signing protects
integrity/replay, not truth against an owner modifying their open-source client.
Do not call this zero-knowledge verification or certify production-quality code.
Use **X-linked**, **signed installation report**, and **reviewed in cheapoS** labels
that describe exactly what is known.

Use duplicate detection and plausibility anomalies to flag questionable public
scores for review. Never stop the owner's local agent because leaderboard
telemetry is missing or suspicious. Public leaderboards can omit pending scores
with an explanation and an appeal/correction path. Anti-cheat should be
proportionate to a friendly community, not require uploading source code.

### Retention and a cheap service

For the beta, retain compact local summaries and private records within a visible
storage policy. Start hosted collection with only consented public usage/job
summary records needed by the launch. Keep per-request diagnostic fields local
until private-hosted consent and retention are implemented. Do not promise to
reconstruct deleted detailed history later when a user upgrades.

Before adding private hosted detail, publish a retention setting and measured
storage budget. Keep lifetime/day aggregates independent of short-lived details;
preserve deduplication/correction tombstones or a documented correction horizon
when compacting records. Member deletion must remove their records and aggregate
contributions, including cached profiles/cards. Explain backups' deletion lag.

Use the current Supabase-backed architecture initially; no database migration is
needed just to design analytics. Introduce aggregate reads instead of N+1 profile
requests and cache public totals with a visible `data_as_of`. The current billboard
polls `/api/stats` every ten seconds while that API disables caching. Make refresh
serve a shared aggregate snapshot rather than recomputing the community for every
viewer. Exact refresh/retention values should come from observed usage/cost.

Measure local ingestion overhead and journal growth too. The current lifetime
JSON ledger copies/replaces growing state; extend incrementally and benchmark
before deciding whether a SQLite journal/materialized summary is warranted.
Sync runs asynchronously with bounded batches and backoff. An unavailable stats
service cannot become a cheapoS execution blocker.

## 7. Free and possible premium

Keep basic facts and control free. Charge, if demand supports it, for convenient
hosted analysis across substantial history and multiple sources.

| Free launch / continuing free core | Possible inexpensive premium later |
| --- | --- |
| Local usage/accounting, diagnostics and local export | Private hosted cross-installation/project analytics |
| Public Club, rank, categories, basic history and share cards | Custom date ranges, saved cohort comparisons and deeper drilldowns |
| Honest cost/coverage explanations | Model-pair reports by task type, app version and policy |
| Ready/accepted jobs and basic rescue count | Recovery bottleneck analysis and before/after release reports |
| Models/roles overview when shared | Provider reliability history, personalized eligible-route recommendations |
| User-owned data and deletion | Scheduled private reports, anomaly alerts and team rollups |
| Core autonomous recovery and independent review | Reproducible comparison reports using user-authorized benchmark results |

Recommendations must be observational unless controlled evidence exists. A paid
plan never authorizes paid inference, broadens a model pool, hides basic failures,
changes ranking eligibility, or buys a higher trust badge. No automatic external
posting; a generated share card still needs the user's action.

Do not choose subscription pricing from token volume alone. Measure active-user
hosting/storage, payment and support costs, then test willingness to pay for the
specific reports. A low annual option may be easier to sustain than many tiny
monthly transactions, but this is a product hypothesis, not a pricing commitment.

## 8. Implementation sequence and acceptance

These are proposed bounded work packages, not claims that the features exist.
The earliest token-only launch needs S1 plus an end-to-end check of the existing
opt-in connection and sync. S2/S3 add trustworthy outcome cards next; their absence
should hide those cards, not delay a useful token leaderboard. The rest can follow
as real usage accumulates. Packages 2/4 preserve fields early without requiring
every future chart or hosted upload path to ship first.

| Package | Repository / deliverable | Done when |
| --- | --- | --- |
| S1 — Real-data launch mode | Leaderboard Cloudflare + backend aggregates; consistent public-free/included/local terminology; demo isolation; remove unsupported savings and phantom outcome defaults | Empty/private/error states never show fictional achievements; more than 100 members and partial model consent produce correct scoped totals; share assets agree with pages |
| S2 — Durable local facts | cheapoS metrics/lifetime; stable job IDs, dated readiness/acceptance, explicit classifications, request purpose/timing/status retention, intervention coverage | Restart, deletion, recovery and another objective in the same chat do not lose or double-count jobs; missing history remains unknown; no synchronous cloud dependency |
| S3 — Outcome sync and simple Club cards | Both repos; versioned job upserts, independent completion sync, consent preview, profile/aggregate RPC, correct launch origin/route contract | One reviewed/merged fixture syncs once after the final token request; unavailable backend retries safely; visible counters match authoritative records; old clients still work |
| S4 — Private diagnostic history | cheapoS first; request/recovery/check/review fields, configuration cohorts and bounded local storage; hosted consent added separately | A deterministic failed-edit → repair → reviewed-result case yields one job, linked attempts and an accurate intervention/resource record |
| S5 — Hosted analytics beta | Backend owner-only records, RLS, daily aggregates/distributions, private dashboard and export | Free/paid views agree on underlying totals; consent revocation/deletion and corrections update derived views; no private rows leak through public RPCs |
| S6 — Optional premium experiment | Reports, comparisons, service-cost measurement, entitlements/billing only after demand | People return for a specific useful report; observed revenue can cover observed costs; free diagnostics/data ownership remain intact |

### Small deterministic validation cases

Use synthetic records and pure aggregation/protocol fixtures; no live inference,
new long agent workflows, or deliberate real-time waits are required.

- Reservation → reported usage → corrected charge: one request, no double count,
  correct category and exactly one aggregate correction.
- Paid OpenRouter model, local coordinator, remote coordinator, unknown access,
  missing served identity and charged-free route: classify from evidence, not name.
- Initial approval and final merge versus a manual rescue: correct autonomy count;
  unknown external assistance never becomes proved zero assistance.
- Two authorized jobs in one chat and multiple items in one job: correct distinct
  job counts, timestamps and candidate-specific independent review.
- Merge with no new inference: completion update still reaches the server.
- Retries, out-of-order revisions, restart, duplicate batch and ledger restore:
  one contribution per logical record; malformed new schema is rejected visibly.
- Community >100 members, detail sharing off, champion unlike the community,
  no data and offline: correct denominators and no demo substitution.
- Missing cost, cost below one cent, unknown history and an open start cohort:
  no fabricated $0, 100% success, or inflated savings.
- Public-only consent, private analytics consent, revocation/deletion: public
  endpoints expose only permitted aggregates and remove stale contributions.

Disclose/measure any implementation test that grows beyond these small fixtures,
following the repository test-cost policy. This design adds no runtime tests.

## Recommended next move

Start with S1 and validate the existing connection/sync end to end. Launch with
truthful token categories, a fun rank and a useful share card. Build the essential
S2/S3 receipt path alongside that launch, and add real completion counts as those
receipts flow. Preserve deeper local evidence now. Let the first users' questions
determine which hosted premium report deserves to be built.

Related implementation in this private repository:
[Cloudflare site](../cloudflare/README.md),
[installation protocol](../web/src/lib/installation-protocol.ts),
[usage/profile SQL](../web/supabase/migrations/202609150006_roles.sql),
[engine statistics](../cloudflare/src/lib/engine-stats.ts), and
[integration design](../CHEAPOS_INTEGRATION.md).

Referenced cheapoS source at the reviewed revision:
[request/task metrics](https://github.com/carlosa8c/cheapoS/blob/e06af4b51b320125b2fc205e6da2d481a45f4ceb/cheapos/metrics.py),
[lifetime ledger](https://github.com/carlosa8c/cheapoS/blob/e06af4b51b320125b2fc205e6da2d481a45f4ceb/cheapos/lifetime_usage.py),
[Club exporter](https://github.com/carlosa8c/cheapoS/blob/e06af4b51b320125b2fc205e6da2d481a45f4ceb/cheapos/club.py),
[task metrics contract](https://github.com/carlosa8c/cheapoS/blob/e06af4b51b320125b2fc205e6da2d481a45f4ceb/docs/development/task-metrics.md),
[lifetime usage contract](https://github.com/carlosa8c/cheapoS/blob/e06af4b51b320125b2fc205e6da2d481a45f4ceb/docs/development/lifetime-usage.md),
[Club connection contract](https://github.com/carlosa8c/cheapoS/blob/e06af4b51b320125b2fc205e6da2d481a45f4ceb/docs/club/connection.md), and
[autonomous completion](https://github.com/carlosa8c/cheapoS/blob/e06af4b51b320125b2fc205e6da2d481a45f4ceb/AUTONOMOUS_WORKFLOW.md).
The discrepancies described in section 2 take precedence over historical
implementation claims in those documents until they are reconciled.
