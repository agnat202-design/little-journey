# MVP persistence validation — 4 October 2026

## Implemented

Google Auth -> household gate -> acknowledged database state. Atomic bootstrap,
consistent reads, version-checked changed-record writes, transactional purchase /
Expense updates, persisted budget, real HPL setup/edit, private attachment upload
and signed view. Failed or uncertain writes do not update the displayed saved
records; reload is required before retry. Existing Shopping history decisions
are preserved. No production demo pregnancy or prototype/session banners.
Login uses the homepage purple gradient and shared logo.

## Checks executed

- npm test: passed (48 business assertions, 24 existing UI integration groups,
  persistent App acknowledgement/rollback tests, configuration/Auth suites and
  new adapter/repository assertions).
- npm run lint: passed (TypeScript).
- npm run build: passed. Existing Vite future-config warning and JS chunk-size
  advisory remain; neither failed the build.
- Local PostgreSQL schema suite: 23 checks passed.
- Local PostgreSQL persistence suite: 9 groups passed, including stale version,
  invalid purchase rollback, reverse/retained spending, active member writes,
  stranger/anonymous denial, cross-household object IDs, whitelisted operations,
  private file policies and tenant metadata paths.
- Rendered login inspected at 390px mobile and 1280px desktop; no horizontal
  overflow on the inspected mobile view; prototype/development copy absent.

## Explicit validation limits / remaining acceptance

SQL tests use PGlite and a local Auth/Storage schema contract; they do not exercise
the real project's Storage HTTP service or OAuth token validation. New production
household CRUD has not yet been tested in the browser. Owner must activate the
additive SQL migration, then accept the deployment by testing real save -> reload,
edit/delete, purchase totals and upload -> reload -> view/delete. Existing real
Google sign-in was demonstrated by the user's screenshot; no account secrets are
needed in chat.

Task UX currently supports add/complete, consistent with the approved frontend;
edit/delete is not exposed. Household invitation UI, Play Store packaging,
payments and monetization are not implemented. Optional file cleanup failures are
reported; upload/DB commits are not a distributed Storage transaction. A failed
cleanup may leave an unreferenced private object requiring operator cleanup.

Migration: supabase/migrations/202610040001_mvp_persistence.sql.
Do not rerun the original schema migration or delete/reset existing tables.
