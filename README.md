# Little Journey frontend

React/Vite household app with Google Auth, household setup, database-backed records,
transactional Shopping/Expense updates and private attachment uploads. See
[PRM](docs/PRM.md) for the rollout status. The persistence migration must be applied
before the new frontend can load household records. Production save/reload QA is
required before calling the deployment ready for real family data.

## Run locally

- Install dependencies: npm install
- Start Vite: npm run dev (port 3000, host 0.0.0.0)
- Tests: npm test
- TypeScript check: npm run lint
- Production build: npm run build

## Supabase configuration

SDK and lazy client installed. Copy .env.example to .env.local and fill
VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY from the project's Connect panel.
Only publishable keys accepted; .env.local ignored by Git. Real values never in source.
Never use secret/service-role/database credentials here.

Without configuration the login screen reports that login is unavailable; it does
not expose an in-memory prototype. Signed-in users select/setup a household, then
load records from Supabase. Saves update the UI only after server acknowledgement.
Failed/uncertain saves require reload before retry to prevent duplicate records.
Google setup: [GOOGLE_AUTH.md](docs/GOOGLE_AUTH.md).
Database/Storage setup: [supabase/README.md](supabase/README.md).

For Cloudflare Pages, set both VITE_ variables in this project's build environment
and rebuild. Local .env.local does not configure Cloudflare. These are public browser
configuration, not server privileges. Do not change build commands.

See [Data Provenance Report](docs/DATA_PROVENANCE.md) for the current source of every displayed data group, removed prototypes, limitations and the future source map.
