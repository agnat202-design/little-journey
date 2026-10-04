# Little Journey frontend

Frontend prototype only. No account, cloud synchronization or backend persistence is connected. Records and local attachments are lost on reload. Lists start empty; the pregnancy example is clearly labeled Demo.

## Run locally

- Install dependencies: npm install
- Start Vite: npm run dev (port 3000, host 0.0.0.0)
- Tests: npm test
- TypeScript check: npm run lint
- Production build: npm run build

## Supabase client preparation (Phase 3)

SDK and lazy client installed. Copy .env.example to .env.local and fill
VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY from the project's Connect panel.
Only publishable keys accepted; .env.local ignored by Git. Real values never in source.
Never use secret/service-role/database credentials here.

Without configuration the prototype remains available. Client construction alone
does not query or write records. Auth, household onboarding and feature persistence
still pending; entering important records is not safe yet.

For Cloudflare Pages, set both VITE_ variables in this project's build environment
and rebuild. Local .env.local does not configure Cloudflare. These are public browser
configuration, not server privileges. Do not change build commands.

See [Data Provenance Report](docs/DATA_PROVENANCE.md) for the current source of every displayed data group, removed prototypes, limitations and the future source map.
