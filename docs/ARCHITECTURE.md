# Little Journey — Architecture / Final Phase 1A.1 decisions

## Phase 4 implementation update (current source)

Google sign-in/sign-up, PKCE callback handling, session restoration and local
logout now wrap the frontend. Signed-out users see a login screen; signed-in
users still see explicitly labelled prototype records with no database
persistence. Account changes remount the frontend to clear ephemeral records.
Google provider activation remains an account-owner action. See
[GOOGLE_AUTH.md](GOOGLE_AUTH.md). The historical deployed boundary below describes
the pre-Auth checkpoint; it is not a claim about the current source.

Frontend deployed on Cloudflare Pages; backend DESIGN ONLY. Supersedes old claims
that Supabase Auth, database, Storage and realtime were already connected.

## Current deployed boundary

Vite frontend served by Cloudflare. React useState holds operational records,
Budget/configured flag and optional category allocations for one page session.
familyRecords coordinates Shopping/Expense mutations. Tasks add/toggle; other
record screens CRUD. Browser blob attachments ephemeral. No Auth, Supabase client,
backend persistence, Storage or realtime synchronization. Central labelled Demo
pregnancy remains unchanged until real onboarding authorized. No source/UI/dependency,
Cloudflare or environment changes in Phase 1A.

## Proposed domain boundary

Household owns children, pregnancies, tasks, shopping_items, expenses, appointments,
documents, optional budget_category_allocations. Profiles represent Auth users,
membership grants active owner/member per-household access; users may join multiple
households. Generic pregnancy_id/child_id/stage optional; household_id mandatory.
Pregnancy never root owner of family/financial records. Child can enter after birth
without Pregnancy. Nullable children.pregnancy_id supports one Pregnancy -> 0..many
Children, including twins; pregnancies has no child_id. No persisted gestational metrics.
Past HPL Pregnancy remains active until explicitly completed/birth; overdue derived
by application date logic. Milestones deferred, no table. Invitation delivery future
scope; only owner may invite/remove members or change their roles.
Complete columns, constraints, mappings and questions in [DATABASE.md](DATABASE.md).

## Proposed financial boundary

Expenses alone actual spend. Nullable household total_budget distinguishes unconfigured
from explicit zero. Keep category allocations: current BudgetSetupModal has editable
optional category inputs, saves them and App retains/reopens these settings; user
configuration needs persistence. Both active owner/member may edit total and categories.
Allocations planning only. Shopping quantity and nullable estimated_unit_price define
derived estimate quantity × unit price, unknown if unit price NULL; no stored total.
actual purchase amount/date derive from current Expense. Only persisted purchase FK
expenses.shopping_item_id, unique when non-null. Reverse keep/delete item detaches
and retains Expense history. Later atomic database operations and deferred invariants
enforce linked state; not separate client requests. Legacy Shopping spending fallback
must not become production aggregate. MVP Expense stores only actual paid_amount/date,
not cumulative obligation total/payment status. Installments/refunds future scope only.

## Proposed Auth/security boundary

Auth owns credentials, profiles display metadata only. Non-account partner name is
household display information, not fake auth identity. First household/owner bootstrap
atomic; protect last active owner; no arbitrary self-enrollment. Proposed RLS uses
active membership: owner/member can create/edit normal data including preparation
budget. Owner alone invites/removes members, changes roles and performs destructive
household administration. No non-owner membership mutation path. Same-household composite FKs
enforce context isolation, old/new update scope checked and creator/tenant immutable.
Narrow private membership helper avoids recursion; privileged RPC explicitly authorizes
caller and tenant with fixed search_path. Service-role credentials never in browser.
No actual Auth/policies/functions configured. Account/household deletion and retention
later policy; restrictive defaults avoid automatic financial/document history cascades.
No retention/anonymization/purge subsystem designed now.

## Proposed file boundary

DB stores metadata, future private Storage stores bytes. Document metadata required,
Expense receipt metadata optional. No automatic Document copy. Blob/local/signed URLs
not persisted; independent file membership policies and retryable orphan cleanup later.
DB metadata and byte deletion not one transaction. No Storage configured now.

## Review gate

Human schema review before separately authorized SQL/RLS tests, Auth, Storage,
packages/env/adapters/onboarding. Real setup supplies household/profile/HPL; then Demo
removed from production path. Never seed real users with fixtures or dummy local IDs.
No remaining product blocker for drafting Phase 1 SQL; explicit migration authorization
still required, with tenant/RLS and atomic finance invariant tests at that later step.
Phase 1A.1 documentation-only decisions are frozen. Phase 2 migration is now prepared
under supabase/migrations with 23 local PostgreSQL/WASM checks (minimal Auth stubs).
It has not been executed on the user's project. See [manual preflight and validation
limits](../supabase/README.md). No frontend client/Auth/Storage/env connection added.
Dedicated financial RPC integration and multi-connection concurrency verification
remain required before real frontend persistence; deferred constraints reject partial
purchase writes meanwhile. Generic context deletion currently RESTRICTs until explicit
unlink, preventing silent history destruction. No household/account deletion API.

## Phase 3 — client configuration, 2026-10-04

User screenshots confirm initial migration execution and 11 public tables with RLS
active. Live owner/member policy behavior has not yet been verified. Supabase SDK is
now installed with lazy client initialization and validated public-only Vite variables.
Local .env.local is ignored, .env.example contains names only. No frontend Auth,
onboarding or module data persistence added; Demo/session notice remains accurate.
Cloudflare build variables must be configured separately by the user before hosted
Auth integration. App records remain ephemeral until later persistence phases.

Phase 3 validation: SDK connection to the supplied project reached REST profiles;
anonymous access returned 401 / PostgreSQL 42501 as expected. No records read or written.
This verifies endpoint/public key and anonymous denial, not authenticated membership.
Frontend tests, configuration tests, TypeScript and build passed. Real local values
remain in ignored .env.local. Hosted build configuration is user action pending.
