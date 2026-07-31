# EKIRO Backend

Express + MongoDB API for EKIRO, structured to be deployed to Railway with a
MongoDB Atlas database. This is a real, working backend for four foundational
pieces - Ekiti ID (identity), Wallet, Jobs Marketplace, Teaching Hub - with a
documented pattern for extending it to the remaining engines (Talent,
Diaspora, Innovation, Price Transparency, Opportunity, Reputation).

## Why these four first

Everything else in the frontend depends on identity and money moving
correctly. Getting Ekiti ID + Wallet + Jobs + Teaching Hub right on a real
database - including the reputation-based Master eligibility path and the
three different settlement splits (80/20 civic tasks, 100% job bookings,
60/40 apprenticeships) - is the foundation the rest of the engines plug into.
Building all eleven modules against an untested database layer in one pass
would risk getting all of them wrong instead of four of them right.

## Local setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env: paste in your MongoDB Atlas connection string
npm run dev
```

The API listens on `http://localhost:4000` by default. `GET /health` returns
`{ "status": "ok" }` once it's running and connected.

## Setting up MongoDB Atlas (free tier is enough to start)

1. Create an account at mongodb.com/cloud/atlas.
2. Create a free (M0) cluster.
3. Under **Database Access**, create a user with a password.
4. Under **Network Access**, add `0.0.0.0/0` (allow from anywhere) - Railway's
   IPs aren't static, so this is the simplest option for a project this size.
5. Click **Connect -> Drivers**, copy the connection string, and paste it
   into `MONGODB_URI` in your `.env` (or into Railway's Variables - see
   below). It looks like:
   `mongodb+srv://<user>:<password>@<cluster-url>/ekiro?retryWrites=true&w=majority`

## Deploying to Railway

1. Push this repo to GitHub (the whole `ekiro` folder, frontend and backend
   together, or split into two repos - either works with Railway).
2. In Railway, **New Project -> Deploy from GitHub repo**.
3. If frontend and backend are in the same repo, set the service's **Root
   Directory** to `backend` in Railway's service settings, so it only builds
   this folder.
4. Add environment variables under the service's **Variables** tab:
   - `MONGODB_URI` - your Atlas connection string
   - `CORS_ORIGINS` - your deployed Vercel frontend URL (e.g.
     `https://your-app.vercel.app`), comma-separated if you have more than one
5. Railway auto-detects Node via Nixpacks, runs `npm install` then `npm run
   build` (compiles TypeScript), then the `startCommand` in `railway.json`
   (`npm run start`, which runs the compiled `dist/server.js`).
6. Once deployed, Railway gives you a public URL
   (`https://your-service.up.railway.app`) - that's your `NEXT_PUBLIC_API_URL`
   for the frontend (see "Connecting the frontend" below).

## API surface (current)

| Method | Path | Purpose |
|---|---|---|
| POST | /api/identity | Register a draft Ekiti ID |
| GET | /api/identity/:id | Fetch an identity record |
| POST | /api/identity/:id/submit | Move to pending |
| POST | /api/identity/:id/approve | Issue the ID number, create the Wallet (admin-only in production) |
| POST | /api/identity/:id/link-nin | Attach a NIN |
| GET | /api/wallet/:ekitiId | Fetch a wallet |
| GET | /api/wallet/:ekitiId/transactions | Transaction history |
| POST | /api/wallet/settle/civic-task | 80/20 treasury/tasker split |
| POST | /api/wallet/settle/job-booking | 100% to worker |
| POST | /api/wallet/settle/apprenticeship | 60/40 apprentice/Master split |
| POST | /api/wallet/listing-fee | Pay the flat 500 naira/month listing fee |
| POST | /api/wallet/withdraw | Withdraw to bank |
| GET | /api/jobs/workers | List workers (optional ?category=) |
| POST | /api/jobs/workers | Create a worker profile |
| POST | /api/jobs/bookings | Book a worker |
| PATCH | /api/jobs/bookings/:id/status | Update booking status |
| GET | /api/jobs/workers/:workerId/bookings | A worker's bookings |
| GET | /api/teaching-hub/masters | List Masters |
| POST | /api/teaching-hub/masters | Become a Master (job-count OR reputation path) |
| POST | /api/teaching-hub/applications | Apply for an apprenticeship |
| POST | /api/teaching-hub/applications/:id/accept | Accept an apprentice |
| POST | /api/teaching-hub/applications/:id/reject | Decline an apprentice |
| POST | /api/teaching-hub/applications/:id/supervised-job | Log a supervised job, auto-graduate at 5 |
| GET | /api/teaching-hub/masters/:masterId/applications | A Master's apprentices |

## Extending this to the remaining engines

Talent, Diaspora, Innovation, Price Transparency, Opportunity, and Reputation
all follow the same three-file pattern already used above:

1. `src/models/<Engine>.ts` - Mongoose schemas. Copy the field shapes
   straight from the matching frontend context (e.g.
   `context/TalentEngineContext.tsx`'s `TalentProfile` interface becomes a
   `TalentProfileSchema`).
2. `src/controllers/<engine>Controller.ts` - one function per action the
   frontend context currently performs in memory (e.g. `createTalentProfile`,
   `nominateTalent`, `expressMentorshipInterest`).
3. `src/routes/<engine>.routes.ts` - an Express router wiring those functions
   to HTTP verbs and paths.

Then mount it in `src/server.ts`:

```ts
import talentRoutes from "./routes/talent.routes";
app.use("/api/talent", talentRoutes);
```

Reputation is the one exception worth calling out: it's derived data (tiers
and badges computed from Wallet + Jobs + Teaching Hub + Talent + Diaspora),
not its own collection. It doesn't need a model - a
`GET /api/reputation/:ekitiId` endpoint that runs the same tier/badge logic
from `context/ReputationContext.tsx` against the database is enough.

## Connecting the frontend (the next phase)

Right now the Next.js app's contexts (WalletContext, JobsContext, etc.) hold
everything in local React state, which resets on every page reload. Wiring
them to this backend means, for each context:

1. Replace the initial `useState(SEED_DATA)` with a `useEffect` that fetches
   from the matching endpoint on mount.
2. Replace state-mutating functions (setBalanceNaira, setWorkers, etc.) with
   a fetch(...) call to the matching endpoint, then update local state from
   the response so the UI still feels instant.
3. Add a `NEXT_PUBLIC_API_URL` environment variable in the Vercel project
   pointing at the Railway URL, and use it as the base URL for all fetches.

This is a genuine migration, not a small tweak - better done one context at a
time (Identity and Wallet first, since everything else depends on them) than
all at once.
