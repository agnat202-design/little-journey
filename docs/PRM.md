# Little Journey — Product Requirements & Milestones

Updated: 4 October 2026. Current implementation is the source of truth.
This status supersedes historical prototype completion claims in older documents.

## Readiness verdict

ROLLOUT IN PROGRESS. Operational persistence and private uploads are implemented
and locally tested. The second migration must be activated in the real Supabase
project, the frontend deployed, and production save/reload/attachment QA verified
before declaring readiness for important family data. Google login success was
demonstrated in the user's screenshot. Do not confuse local SQL tests with live QA.

## Current status

| Area | Implemented | Remaining before real use |
| --- | --- | --- |
| Hosting | Cloudflare Pages at https://little-journey.pages.dev/ | Verify each production deployment |
| Branding | Original SVG logo, favicon, responsive Google login screen | Human acceptance |
| Database | Household schema migration; 11 tables and RLS confirmed by user screenshots | Live authenticated authorization/integration tests |
| Authentication | Google OAuth/PKCE, session restoration, local logout, account state reset; Google provider Enabled confirmed by screenshot | Successful deployed login, reload/session restoration and logout still require end-to-end confirmation |
| Household | Atomic profile/household/owner bootstrap; membership discovery and explicit household selection | Activate migration and verify real setup |
| Pregnancy | User HPL setup/edit; derived metrics; neutral family hero without HPL | Verify real saved HPL reload |
| Tasks | Add/complete backed by transactional household persistence | Production save/reload QA; edit/delete not currently exposed |
| Shopping | Add/edit/delete/link/buy/reverse; atomic Expense linkage and version conflict handling | Production save/reload and reconciliation QA |
| Expenses | Persistent history/add/edit/delete and linked purchase consistency | Production save/reload QA; Expenses alone drive actual spend |
| Budget | Household total and optional category allocation persistence | Production save/reload and total reconciliation QA |
| Appointments | Persistent CRUD, date/optional time, no cost | Production save/reload QA |
| Documents and receipts | Private upload, metadata CRUD, signed view URLs, upload/file-delete cleanup | Activate bucket/policies and verify live upload/view/reload/delete |

## Data durability boundary

- Login session is persisted by Supabase Auth in the browser.
- React state holds the last acknowledged household snapshot, loaded from Supabase
  after login/reload. Changed records save through one atomic, version-checked RPC.
- Selected files use a temporary browser preview until uploaded. Database records
  contain private Storage paths, not blob URLs or files. Signed URLs are temporary
  view access, not permanent public sharing links.
- Operational screens must not claim cloud synchronization or durable record saves.
- Do not advise real record entry until save -> reload -> retrieve is verified.

## Activation / acceptance milestones

Implementation of milestones 2–5 below is complete in source. Server activation
and production acceptance remain pending; no Play Store or monetization added.

1. Verify deployed Google sign-in, session restoration and logout.
2. Implement profile and household bootstrap/onboarding with owner membership.
3. Connect household-scoped operational records and budget to Supabase; handle
   loading, empty states and failed writes honestly.
4. Implement transactional purchase/reversal operations. A Bought item links to
   exactly one Expense; Expenses alone drive actual spending. Unknown price cannot
   become zero; explicit zero is valid. Preserve supported history decisions.
5. Add private file upload/view/delete with database metadata and authorization.
6. Run real persistence/authorization QA: reload, second session/device, CRUD,
   attachment retrieval, failed requests, cross-household isolation and totals.

## Product requirements retained

- Household is the owner of operational data; pregnancy/child context optional.
- Owner and active member can edit normal household records and budget. Membership
  administration is owner-only.
- One pregnancy may have zero or many children via nullable children.pregnancy_id.
- Shopping estimate = quantity × estimated unit price; no fabricated price insights.
- Appointments carry no financial information. Expenses are actual-spend truth.
- Optional category budgets are secondary settings. Keep the approved visual style.
- No invented identities, promotions, recommendations, or sync claims.

## Future direction, not current capability

Play Store distribution and monetization are product goals. Android packaging,
store submission, privacy/account-deletion requirements and monetization model
remain future work. No payment/subscription system exists. Milestones,
installments/refunds and additional lifecycle features remain deferred.

## Release gate for real record entry

Google login alone does not satisfy the release gate. Required: household setup,
all operational records and files durably stored, records retrieved after reload,
RLS verified between households, purchase spending reconciled once, errors do not
pretend to save successfully, and human acceptance of production flows.

Evidence: src/components/AuthBoundary.tsx, src/lib/supabase.ts, src/App.tsx,
supabase/migrations/202610030001_household_schema.sql; user screenshots confirm
schema/RLS, provider activation and URL configuration. Live Google login and
operational persistence have not been demonstrated by those screenshots.
