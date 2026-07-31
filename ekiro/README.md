# EKIRO — The Digital Intelligence Infrastructure of Ekiti State

Not a jobs platform or a government portal. EKIRO connects every citizen,
business, institution, community, government agency, and diaspora member of
Ekiti State into one intelligent ecosystem — identity, income, skills,
learning, price transparency, and government data all feeding the same
foundation. The goal isn't digitisation; it's continuous state development
powered by data and citizen participation.

## Stack
Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS · Lucide icons

## Repository layout

This is a monorepo with two independently deployable parts, now wired
together:

- **`/` (this folder)** — the Next.js frontend, deployable to Vercel. Every
  context in `context/` calls the real backend API via `lib/apiClient.ts`
  instead of holding state in memory. `DialectContext` (language toggle) and
  `LocationContext` (GPS simulation) are the only two intentionally left as
  pure client state — neither needs persistence.
- **`/backend`** — a real Express + MongoDB API, deployable to Railway. See
  `backend/README.md` for local setup, MongoDB Atlas setup, and Railway
  deployment steps.

**Before you push to GitHub or set up Atlas**, read the "Testing this locally
first" section near the end of this file — there's a specific order to start
things in, and a checklist of what to click through to confirm the wiring
actually works end to end.

There's no login/auth system yet: a citizen's identity is tracked by saving
the backend's Mongo `_id` for their Ekiti ID in `localStorage`
(`lib/apiClient.ts`'s `getSavedIdentityId`/`saveIdentityId`). That's enough
for one browser session to act as one citizen, which matches how the app has
worked throughout this build — it is not a substitute for real authentication
in a multi-user production deployment.

## This repo, in two halves

- **This folder** — the Next.js frontend. Every context (`context/*.tsx`)
  currently holds its state in memory via React `useState`, which resets on
  reload. That's why it's a great demo and not yet a real product.
- **`backend/`** — a real Express + MongoDB API covering Ekiti ID, Wallet,
  Jobs Marketplace, and Teaching Hub, deployable to Railway with a MongoDB
  Atlas database. See `backend/README.md` for setup, deployment, and the
  documented pattern for extending it to the remaining engines. The frontend
  doesn't call this backend yet — that wiring (per context, starting with
  Identity and Wallet) is the next phase, also documented there.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Route map

- `/` — master landing gateway
- `/ekiti-id` — Ekiti Digital Identity registration, LGA verification, and issued ID card (start here — every other route assumes this exists)
- `/dashboard` — unified view of identity, wallet, jobs, and Teaching Hub progress in one screen
- `/reputation` — Civic Reputation tier ladder, badges, and score history
- `/ekiti-ai` — Ekiti AI: a rule-based Q&A scaffold over live session data, structured for a real model to be dropped in later
- `/ekiti-ai` — Ekiti AI: ask questions about IGR, infrastructure, talent, jobs, and diaspora funding (rule-based scaffold, see below)
- `/opportunities` — Opportunity Engine: jobs, apprenticeships, scholarships, grants, and civic tasks matched to your skills, civic score, and verification status
- `/talent` — Talent Engine: a public directory of artisans, farmers, musicians, athletes, coders, and students, self-listed or nominated by schools/communities
- `/innovation` — Innovation Engine: government-posted real problems, community-submitted solutions, and reputation-gated judging
- `/diaspora` — Diaspora Engine: fund a specific project, mentor a Talent Directory profile, or invest in a business — reserved for verified diaspora indigenes
- `/voice-hub` — audio-first Ekiti Yoruba voice portal (citizens)
- `/market` — farm-to-market produce exchange (citizens)
- `/jobs` — jobs marketplace: browse/book skilled workers, list your own skill, manage bookings (recurring income, gated behind a verified Ekiti ID)
- `/teaching-hub` — apprenticeship pipeline: find a Master, train, graduate to your own listing (gated behind a verified Ekiti ID)
- `/price-check` — check a subsidized batch's official price, report overcharging, or buy fixed-price goods from the State Store
- `/radar` — 10-metre geofenced task radar (taskers)
- `/wallet` — payouts and civic score (taskers)
- `/igr-analytics` — Living State Dashboard (government) — IGR, infrastructure, talent, jobs, learning, diaspora funding, and innovation all rolled into one live view

## Teaching Hub — the apprenticeship pipeline

`context/TeachingHubContext.tsx` models a digitized version of Nigeria's
traditional "learn under oga/madam" trade apprenticeship:

- A worker on `/jobs` who reaches `MASTER_ELIGIBLE_JOBS_THRESHOLD` (20 completed
  jobs) can open apprentice slots and become a **Master** — this is the vetting
  gate that keeps the workforce trustworthy instead of random people joining
  with no track record.
- Anyone — literate or not, any age — can apply to train under a nearby Master
  in any category, no prior experience required.
- While training, supervised jobs are split `APPRENTICE_SPLIT` (60%) to the
  apprentice and `MASTER_SPLIT` (40%) to the Master, via
  `settleApprenticeshipJob` in `WalletContext`. The apprentice earns while
  learning instead of waiting unpaid; the Master is compensated for
  supervision and reputation risk without charging any upfront training fee.
- After `GRADUATION_JOBS_THRESHOLD` (5) completed supervised jobs, the
  apprentice automatically graduates: `runSupervisedJob` calls
  `registerAsWorker` from `JobsContext` to create their own independent
  worker profile, which then earns 100% per job like any other listed worker
  (see the listing-fee model below).

This is the mechanism meant to keep refilling the talent pool: graduates can
themselves become Masters once they hit the completed-jobs threshold,
compounding into "generational talent" over time without needing a training
budget from government — Masters are paid from the jobs their apprentices do,
not from a subsidy.

## Two different payout models, on purpose

`context/WalletContext.tsx` deliberately keeps two separate economic models:

- `settleTaskPayout` — **80% State Treasury / 20% tasker**. Used for civic
  verification work on `/radar` (tax mapping, infrastructure checks) — this is
  government-funded work, so the treasury takes the majority share and the IGR
  gain is the point.
- `settleJobPayout` — **worker keeps 100%** of every booking on `/jobs`. Instead
  of a per-job commission (which tempts workers and customers to just deal
  directly outside the app once they've met), EKIRO charges a flat
  `MONTHLY_LISTING_FEE_NAIRA` (₦500/month, see `payListingFee`) to stay listed
  and bookable. There's no percentage to dodge by going off-platform — the
  value of staying is the visible trust score, job history, and booking
  protection that only exist if the job happened on the app.

Keeping these separate means the state can honestly say civic verification work
funds the treasury while the jobs marketplace is where citizens build real,
recurring income with take-home pay that doesn't shrink per job.

## Ekiti ID — identity layer, split into two paths on purpose

`context/IdentityContext.tsx` models the full lifecycle: `unregistered → draft →
pending → verified`, but registration now branches into two separate
verification paths chosen up front:

- **Resident Access** (`verificationPath: "resident"`) — anyone who currently
  lives or works in Ekiti, regardless of origin, proves it with a utility
  bill, employer letter, landlord confirmation, or LG resident attestation.
  This is deliberately low-friction and origin-blind: it's what unlocks Jobs
  Marketplace, Teaching Hub, Voice Hub, Market, and Tasker Radar. Economic
  participation should never depend on ancestry, or the platform stops being
  the magnet for outside talent it's meant to be.
- **Indigene Verification** (`verificationPath: "indigene"`) — the original
  LGA-of-origin + proof-of-origin-document flow. Grants everything Resident
  Access does, plus `isIndigeneVerified: true`, which should gate anything
  legitimately heritage-based later: diaspora investment programs, Tech League
  scholarship slots reserved for Ekiti-origin students, land/ancestral
  programs. Nothing income-generating should ever require this flag.

`useIdentity().isVerified` is `true` for either path — that's the flag every
other route should check before allowing participation (`/jobs` and
`/teaching-hub` already do this via `components/identity/IdentityGate.tsx` —
apply the same pattern to `/radar` and `/market` before shipping).
`useIdentity().isIndigeneVerified` is only `true` for the indigene path and
should be reserved for the specific heritage-based features described above.

ID numbers reflect which path was used: `EKT-{LGA}-{YEAR}-{SEQUENCE}` for
indigenes (e.g. `EKT-ADO-2026-04821`), `EKT-RES-{YEAR}-{SEQUENCE}` for
residents. Replace `approveVerification` with a real LGA/residency-office
review queue for production, and wire `linkNin` to an actual NIMC API.

## Notes on simulated systems

- **Geofencing**: `context/LocationContext.tsx` simulates GPS position and a 10-metre
  zone lock (30-minute expiry). Wire `simulateMovement` to the browser Geolocation API
  for production use.
- **Voice capture**: `components/voice/VoicePortal.tsx` uses the Web Speech API
  (`SpeechRecognition`) where available, with a graceful fallback that still records
  duration and lets the citizen confirm/submit without a transcript.
- **Split settlement**: `context/WalletContext.tsx` applies an 80/20
  treasury/tasker split on every verified task payout — replace `settleTaskPayout`
  with a call to your payments/treasury API.
- **Images**: the hero and market sections use the two real Ekiti State photography
  URLs provided in the brief, wired through `next/image` with `remotePatterns`
  configured in `next.config.js`. Swap in your own CDN-hosted assets for production
  to avoid depending on third-party hotlinking.


## Price Transparency & State Store — closing the middleman loophole

`context/PriceTransparencyContext.tsx` addresses the classic problem of
subsidized goods (fertilizer, seedlings) being hoarded by distribution agents
and resold elsewhere at a markup:

- Every subsidized batch gets a `batchCode` with a stamped `officialPriceNaira`
  and an `assignedLocation` — anyone can look it up on `/price-check` before
  buying.
- If someone's charged more than the stamped price, `reportOvercharge` logs it
  against that exact batch code — no anonymous complaints, the report points
  directly at which batch and which agent it traces back to.
- `diversionFlags` aggregates repeated reports per batch, so a pattern of
  overcharging surfaces automatically without needing an inspector to catch
  anyone in the act. This feeds directly into the `/igr-analytics` government
  dashboard as a live monitoring section.
- The **State Store** (`storeItems` / `placeStateStoreOrder`) lets government
  sell the same goods directly at the fixed price, fulfilled through the same
  rider network as the Jobs Marketplace — a safety valve that only becomes the
  better option when private or agent-run channels try to gouge, not a
  replacement for normal market competition.

This is intentionally citizen-enforced rather than inspector-enforced: honest
buyers reporting bad prices *is* the enforcement mechanism, and it costs the
state nothing beyond hosting the data.

## Opportunity Engine — matching, not just listing

`context/OpportunityEngineContext.tsx` flips the model from citizens browsing
for work to opportunities being ranked against each citizen:

- Citizens pick interest tags (or the engine infers skills from any worker
  profile they've listed on Jobs Marketplace).
- Every `Opportunity` — job, apprenticeship, civic task, scholarship, grant, or
  volunteer role — is tagged with required skills, a minimum civic score, and
  whether it requires Indigene Verification.
- The `matches` scoring function (in the same file) is **deliberately simple
  and rule-based** — skill overlap, civic score threshold, indigene
  eligibility, deadline urgency — not a live ML/LLM model. It's built so a real
  ranking model can replace just the scoring function without touching the UI
  or data shape. Each match also carries human-readable `reasons`, which the
  UI surfaces as chips so recommendations are never a black box.
- `expressInterest` records lightweight interest — production would route this
  into a real application/booking flow depending on the opportunity's `kind`.

## Talent Engine — recognizing more than "workers"

`context/TalentEngineContext.tsx` is a public talent registry separate from
the Jobs Marketplace's worker profiles — it recognizes people for who they
are, not just what they can be booked for:

- Anyone can self-list across ten open categories (Artisan, Farmer, Musician,
  Athlete, Coder, Teacher, Creative, Entrepreneur, Inventor, Academic
  Excellence).
- Schools and community organizations can **nominate** someone else, which
  attaches an "Endorsed" badge and the nominator's name — a school-nominated
  student carries more visible trust than a self-listing, without gatekeeping
  who's allowed to appear at all.
- Diaspora members (or anyone) can `expressMentorshipInterest` on a profile —
  the lightweight hook the future Diaspora Engine should build on for actual
  mentorship/investment matching.
- `categoryBreakdown` and `lgaBreakdown` aggregate the registry by category and
  LGA and are surfaced directly in the Talent Directory UI, labeled as visible
  to the State Command Deck — this is the "government gains visibility into
  future human capital" requirement from the EKIRO brief. Wiring this into the
  actual `/igr-analytics` page (the way Price Transparency's diversion flags
  already are) is the natural next step.

## Diaspora Engine — the first real use of `isIndigeneVerified`

`context/DiasporaEngineContext.tsx` is deliberately gated more strictly than
every other engine: `components/diaspora/DiasporaEngine.tsx` requires **both**
`useIdentity().isIndigeneVerified` **and** `profile.residency === "diaspora"`
— not just `isVerified`. This is the first feature in the app that actually
enforces the Resident Access vs. Indigene Verification split from the
`IdentityContext` — everything income-generating stayed open to any verified
resident, but this heritage-based program is reserved for verified diaspora
indigenes, exactly as planned when that split was designed.

Three ways to contribute, all transparent rather than donation-shaped:

- **Fund a Project** — pick from seeded fundable items (infrastructure repair,
  school adoption, healthcare supplies, equipment, SME investment) with a
  visible raised/target progress bar.
- **Mentor a Talent** — pulls directly from `TalentEngineContext`'s registry,
  the same seam `expressMentorshipInterest` in the Talent Engine was built to
  hand off to.
- **My Contributions** — every contribution generates an `impactNote` (a
  templated status update per contribution type) and a running total, so
  nothing disappears into an opaque donation pool. Production would replace
  the templated notes with real status updates from whoever executes the
  work.

## Civic Reputation — a score that unlocks things, not just displays them

`context/ReputationContext.tsx` expands the existing `civicScore` (still owned
by `WalletContext`) into five named tiers — Newcomer, Trusted Citizen,
Verified Professional, Civic Leader, State Honoree — each carrying a real
perk, not just a label:

- **Verified Professional (600+) has a real, wired unlock**: in
  `components/teaching/TeachingHub.tsx`, reaching this tier qualifies you to
  become a Teaching Hub Master on *any* of your worker profiles, even without
  the usual 20-completed-jobs requirement. `TeachingHubContext.becomeMaster`
  accepts a `qualifiesByReputation` flag so the reputation path is enforced in
  the context, not just decorative in the UI.
- `REPUTATION_TIERS` and `getTierForScore`/`getNextTier` are exported as pure
  data/functions (not just via the `useReputation` hook) specifically so other
  contexts and components can reference tier thresholds without needing
  `ReputationProvider` in their ancestry — this is what avoids a circular
  dependency between Reputation (which reads Teaching Hub's `masters` for
  badges) and Teaching Hub (which checks a reputation threshold for
  eligibility).
- **Badges are derived from real state**, not invented: Income Earner checks
  actual completed bookings, Mentor checks whether any of your own worker
  profiles appear in Teaching Hub's `masters` list, Recognized Talent checks
  `TalentEngineContext` for a self-authored profile, Diaspora Supporter checks
  `DiasporaEngineContext` contributions. If you haven't done the thing, the
  badge shows locked — nothing here is decorative.
- `/dashboard` now shows the tier name next to the raw score, linking through
  to the full `/reputation` page for the tier ladder and badge detail.

## Innovation Engine — the second real use of a Reputation tier

`context/InnovationEngineContext.tsx` closes the loop the Civic Reputation
tier ladder opened: State Honoree's perk description literally says "eligible
for future Innovation Engine judging panels," and this is that panel.

- Institutions (seeded here as state ministries) post real problems as
  `InnovationChallenge` records with a prize description and deadline.
- Anyone verified can submit a `Submission` — no reputation requirement to
  participate, only to judge.
- Community members endorse submissions (a simple upvote), which sorts the
  list — visible social proof before any judge acts.
- **Judging is reputation-gated**: `components/innovation/InnovationEngine.tsx`
  checks `useReputation().currentTier.name === "State Honoree"` before showing
  the "Declare winner" control. This is the second concrete reputation unlock
  in the app (the first being Teaching Hub Master eligibility) — reputation
  tiers are consistently backed by real gated actions, not just cosmetic
  labels.
- **Cross-linked with the Diaspora Engine**: `DiasporaEngineContext` now has
  an `innovation_challenge` contribution type and a seed project ("Top up the
  cassava spoilage challenge prize pool") — directly implementing the
  original brief's "finance innovation challenges" diaspora contribution type.
  The two engines aren't wired at the data level (challenge prize totals don't
  yet increase from diaspora funding automatically) — that's the natural next
  connection if this needs to go further.

## Living State Dashboard — the government capstone

`app/(government)/igr-analytics/page.tsx` (route kept stable so existing links
don't break) is no longer just IGR and infrastructure — it now pulls live
state from every engine in the app:

- `useJobs` — total workers listed, bookings completed
- `useTeachingHub` — active Masters, apprentices in training vs. graduated
- `useTalentEngine` — the category/LGA breakdown the Talent Directory already
  labeled "visible to Living State Dashboard" — now actually true
- `useOpportunityEngine` — total opportunities tracked, interest expressed
- `useInnovationEngine` — open challenges, submissions, winners declared
- `useDiasporaEngine` — total contributed and per-project funding progress
- `usePriceTransparency` — the existing overcharge/diversion monitoring

This is the "digital twin" requirement from the EKIRO brief: one government
view assembled from real citizen activity across the platform, not a mockup
with invented numbers sitting next to it. The LGA-level IGR figures and
infrastructure fault list are still seeded demo data (no real revenue or
public-works system exists to pull from yet) — everything else on the page
now reflects actual in-session state from the engines above.

## Ekiti AI — a real scaffold, not a fake demo

`app/api/ekiti-ai/route.ts` is a genuine Next.js API route, not a mock. Today
it answers a fixed set of question patterns (IGR by LGA, infrastructure
faults, talent breakdown, jobs/Teaching Hub counts, diaspora contributions,
innovation challenges) using:

1. `lib/ekitiStateFacts.ts` — static seed facts (LGA revenue, infrastructure
   faults), shared with the Living State Dashboard so the two never disagree.
2. A `context` object the client (`components/ekitiai/EkitiAI.tsx`) builds
   from live React state at ask-time and sends with every question.

It is deliberately labeled a scaffold in the UI itself — no attempt to pass
this off as a trained model. The upgrade path is intentionally narrow: add
`ANTHROPIC_API_KEY` to the environment, then replace the `answerFromRules(...)`
call in the route with a real call to the Anthropic Messages API, using the
same `context` payload as grounding data in the system prompt. Nothing else
in the request/response shape needs to change.

## Ekiti AI — a real scaffold, not a fake demo

`app/api/ekiti-ai/route.ts` is a genuine Next.js API route, not a mock. It
answers a fixed set of question patterns (IGR by LGA, infrastructure faults,
talent breakdown, jobs/Teaching Hub stats, diaspora contributions, innovation
challenges) using two sources of real data:

1. `lib/ekitiStateFacts.ts` — the static LGA/infrastructure seed facts, now
   extracted into one shared module so the Living State Dashboard and Ekiti
   AI can never drift out of sync with each other.
2. A `context` object the client (`components/ekitiai/EkitiAI.tsx`) builds
   from live React state — talent counts, booking totals, diaspora
   contributions, etc. — and sends with every question.

The UI is explicit that this is a scaffold, not a trained model, with a
visible banner saying so. **To upgrade to a real model**: add an
`ANTHROPIC_API_KEY`, and replace the `answerFromRules(...)` call in the route
with a real call to the Anthropic Messages API, using `question` as the user
message and a system prompt built from the same `context` payload this
version already receives. The client component, request shape, and response
shape all stay the same — the swap is deliberately narrow and isolated to one
function in one file.
## Testing this locally first — do this before Atlas/GitHub/Railway

Since I can't run `npm install` or a real build in the environment I built
this in, this wiring has been checked carefully by hand (every import
resolves, every function signature matches its call sites) but **has not
been run**. Please do the following locally before creating your Atlas
cluster or pushing to GitHub, so any issue gets caught on your machine first:

1. **Start the backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Get a free MongoDB Atlas connection string (see backend/README.md
   # section 2) and paste it into .env as MONGODB_URI
   npm run seed   # populates workers, Masters, opportunities, talent, etc.
   npm run dev
   ```
   Confirm `http://localhost:4000/health` responds before moving on.

2. **Start the frontend, in a second terminal:**
   ```bash
   cp .env.local.example .env.local   # already points at localhost:4000
   npm install
   npm run dev
   ```

3. **Click through this exact sequence** — it exercises every wired context
   in dependency order:
   - `/ekiti-id` → register (try Resident Access first) → submit → simulate
     approval. You should see a real ID number appear.
   - `/dashboard` → confirm it loads without errors and shows your identity.
   - `/jobs` → Browse workers (should show Bimpe, Tunde, etc. from the seed)
     → book one → go to "My Bookings" → accept → mark complete. Balance
     should update.
   - `/teaching-hub` → Become a Master needs 20+ completed jobs OR Verified
     Professional reputation (600+ civic score) — you won't qualify yet on a
     fresh account, which is expected. Try "Find a Master" → apply to Bimpe
     Adeyemi instead.
   - `/talent`, `/price-check`, `/opportunities`, `/innovation`,
     `/reputation` → each should load real data from the backend, not
     placeholder text.
   - `/diaspora` → register a second Ekiti ID with **Indigene Verification**
     and residency set to **diaspora** to actually reach this page instead of
     the gate.
   - `/igr-analytics` (Living State Dashboard) → confirm the numbers here
     match what you just did (worker count, bookings completed, etc.).

If something throws an error in the browser console or the terminal running
`npm run dev`, that's the exact spot to fix before deploying — much cheaper
to catch here than after pushing to Railway.

4. **Only once all of the above works locally:**
   - Create your real MongoDB Atlas cluster (or keep using the same one)
   - Push the repo to GitHub
   - Deploy `backend/` to Railway (set `MONGODB_URI` and `CORS_ORIGINS` there)
   - Deploy the frontend to Vercel (set `NEXT_PUBLIC_API_URL` there to your
     Railway URL)
   - Run `npm run seed` once against the production database too (Railway's
     shell, or run it locally pointed at the production `MONGODB_URI`)
