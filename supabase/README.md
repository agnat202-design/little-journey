# Database Phase 2 — prepared, not deployed

## Current rollout — MVP persistence (4 October 2026)

The user has executed the first migration and confirmed 11 RLS-enabled tables.
Run **only the new migration** in the same project's SQL Editor:
`migrations/202610040001_mvp_persistence.sql` (new query, paste full file, Run).
It is additive: creates setup/load/save RPCs, validates tenant file paths and adds
private family-files bucket policies (10 MB file limit). It does not reset tables,
seed personal data or change Google credentials. Do not rerun the first migration.
The transaction fails as a whole if existing/conflicting objects prevent creation.

After Success, deploy current main on Cloudflare. Sign in, set up a household,
create a small test record, reload, then verify editing/deletion and file upload,
reload/view and removal. Actual live acceptance is required before readiness claims.

Local verification also runs `node supabase/tests/persistence.test.mjs`: 9 groups
cover idempotent setup, save/reload, failed purchase rollback, explicit zero,
stale version rejection, reversal/history, active member access, tenant file
isolation and operation whitelisting. PostgreSQL/Storage schema stubs are local;
they do not certify the real Supabase Storage HTTP service or OAuth session.

Uploads follow [Supabase Storage RLS](https://supabase.com/docs/guides/storage/security/access-control),
using household folders, insert without overwrite, and private signed views.
No service-role key is used in the frontend. The older phase notes follow.

First migration: migrations/202610030001_household_schema.sql.
11 tables, tenant-safe references, RLS/grants, timestamp/identity guards,
last-owner protection, atomic household bootstrap, deferred purchase consistency.
No seeds, destructive reset, Auth provider setup, Storage, application client or env changes.
Target PostgreSQL 15+ in Supabase; requires existing auth.users/auth.uid() and
authenticated/anon roles. Plain CREATE statements deliberately fail on conflicting
objects rather than overwrite. BEGIN/COMMIT makes this first migration all-or-nothing.

## Local verification

Run from repository root:

```powershell
npm install --prefix tmp/schema-validation --no-save --package-lock=false @electric-sql/pglite@0.5.8
node supabase/tests/schema.test.mjs
```

PGlite is installed only under ignored tmp/, not a frontend dependency. Tests use an
in-memory PostgreSQL and minimal Auth UID/role stubs. No external database connection.
23 checks passed: migration executes; active/inactive/anonymous/other-household access,
member Budget/category CRUD, membership/last-owner restrictions, twins, context FK
isolation, actual purchase linkage, retained history, optional prices and money precision.
This does not verify the real project's grants/Auth integration, Storage, or concurrent
multi-connection races. Those require target verification before frontend integration.

## Manual Supabase gate — inspect first

Open the intended Supabase project -> SQL Editor -> New query. Run this read-only
preflight first and share the result. Do not paste credentials or connection URLs.

```sql
SELECT schemaname, tablename
FROM pg_catalog.pg_tables
WHERE schemaname IN ('public', 'little_journey_private')
ORDER BY schemaname, tablename;
```

Expected for a new project: no application tables. If existing records/tables appear,
stop; never reset/drop/overwrite them. After reviewing the result, the migration can
be applied through the project's normal migration workflow or SQL Editor by the user.
No remote migration has been executed by this task.

## Later integration work

Purchase invariant rejects committing Bought without exactly one actual Expense.
Mutations must run in one server transaction. Dedicated shopping/edit/reverse/delete
RPCs and concurrency tests belong to the later persistence phase; do not connect
frontend CRUD as independent writes in the meantime. Shared purchase title/category
synchronization also belongs to those RPCs; schema does not invent a second money truth.
Deletion of referenced child/pregnancy/member requires explicit unlink first; restrictive
FKs keep history safe. Destructive household/account API is deliberately not exposed.
Document rows prepare metadata only: no bytes, bucket or Storage access policies yet.

Money uses numeric with <=2 scale and 14-digit range constraints, avoiding implicit
rounding of numeric(14,2). Object filenames/paths and URL parsing require further
application/upload validation in their respective later phases.
