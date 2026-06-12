# Skillnora — AI-powered eLearning (starter)

This repository is a starter scaffold for an AI-first eLearning platform. It contains a minimal Next.js 15 + TypeScript + Tailwind setup, basic components, Supabase client stub, and a reference DB schema.

Quick start

1. Install dependencies:

```bash
npm install
```

2. Copy environment:

```bash
cp .env.example .env
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_SERVICE_ROLE, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

3. Run dev server:

```bash
npm run dev
```
To run the separated backend API (Express) locally:

```bash
cd services/api
npm install
npm run dev
```

To run both frontend and backend concurrently (from project root):

```bash
npm install
npm run dev:api # in one terminal
npm run dev     # in another terminal
# or: npm run dev:all (requires `concurrently` installed by `npm install`)
```

What's included
- Next.js 15 app router scaffold
- Tailwind CSS with dark mode
- Framer Motion animation example
- Supabase client stub in `src/lib/supabaseClient.ts`
- Reference DB schema in `db/schema.sql`

Next steps (recommended)
- Run `npx tailwindcss -i ./src/styles/globals.css -o ./src/styles/output.css --watch` if needed, or use Next.js plugin.
 - Run `npx tailwindcss -i ./src/styles/globals.css -o ./src/styles/output.css --watch` if needed, or use Next.js plugin.
 - Set up Supabase project and run SQL from `db/schema.sql`.
 - Implement auth flows and server APIs.

Razorpay & AI provider notes

- This starter uses Razorpay for payments per your request. You should create a Razorpay account and obtain `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` and add them to your `.env` and deployment secrets.
- For AI features, instead of OpenAI (paid), you can use Hugging Face Inference API (has free tier and hosted models). Add `HUGGINGFACE_API_KEY` to your env and use the inference endpoints for summaries and quiz generation. Alternatively self-host a model or use another provider.

Running DB setup locally

1. Install Supabase CLI (optional but recommended):

```bash
npm install -g supabase
# or: brew install supabase/tap/supabase
```

2. Run the init script to apply schema and RLS policies (requires `supabase` CLI authenticated):

```bash
./db/init_db.sh
```

If you don't have Supabase CLI, open the Supabase UI > SQL editor and run the contents of `db/schema.sql` then `db/rls.sql`.

Environment variables to set (example names):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `HUGGINGFACE_API_KEY` (or other AI provider)


Supabase setup notes

1. Create a Supabase project and copy your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` into `.env`.
2. Add `SUPABASE_SERVICE_ROLE_KEY` (server-side only) to your deployment secrets (do NOT commit).
3. In Supabase > Authentication > Settings, add your app URL (e.g., `http://localhost:3000`) to the allowed redirect URLs for OAuth.
4. Enable GitHub and Google providers and provide client IDs/secrets in Supabase if you want OAuth.
5. Run the SQL in `db/schema.sql` (SQL editor or `psql`) to create the basic tables.
6. For local dev, the client-side flows use Supabase JS; the magic-link & OAuth flows will open redirects handled by Supabase.

Using the app:

- Visit `/auth` to sign in (email magic link or OAuth). After signing in you'll be redirected back and can view `/dashboard`.
