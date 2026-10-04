# Little Journey — Product Requirements & Milestones

Updated: 4 October 2026. Current implementation is the source of truth.
This status supersedes historical prototype completion claims in older documents.

## Readiness verdict

NOT READY for durable entry of real family records. Supabase Auth is connected,
but operational frontend records are not connected to database reads/writes.
Creating database tables does not automatically persist frontend form entries.

## Current status

| Area | Implemented | Remaining before real use |
| --- | --- | --- |
| Hosting | Cloudflare Pages at https://little-journey.pages.dev/ | Verify each production deployment |
| Branding | Original SVG logo, favicon, responsive Google login screen | Human acceptance |
| Database | Household schema migration; 11 tables and RLS confirmed by user screenshots | Live authenticated authorization/integration tests |
| Authentication | Google OAuth/PKCE, session restoration, local logout, account state reset; Google provider Enabled confirmed by screenshot | Successful deployed login, reload/session restoration and logout still require end-to-end confirmation |
| Household | Schema and atomic create_household RPC | Profile creation, household onboarding and selecting household context |
| Pregnancy | Clearly labelled demo | Real due-date setup and derived metrics; no stored gestational snapshots |
| Tasks | Frontend add/complete | Household-scoped database reads/writes |
| Shopping | Frontend add/edit/delete, reference link, purchase/reversal flows | Database persistence and atomic Shopping/Expense operations |
| Expenses | Frontend history/add/edit/delete, linked purchase consistency | Database persistence; actual spending exclusively from Expenses |
| Budget | Frontend total budget, actual spending and optional category settings | Persist household budget/settings and calculate from persisted Expenses |
| Appointments | Frontend add/edit/delete; selected date/time; no cost | Database persistence |
| Documents and receipts | Frontend local file metadata, preview and CRUD | Private Supabase Storage, household access checks, metadata persistence |

## Data durability boundary

- Login session is persisted by Supabase Auth in the browser.
- Tasks, Shopping, Expenses, Budget, Appointments and Documents currently use React
  state. They reset on page reload and when the operational app unmounts on logout.
- Attachments use temporary browser file/blob references, not uploaded storage.
- Operational screens must not claim cloud synchronization or durable record saves.
- Do not advise real record entry until save -> reload -> retrieve is verified.

## Next implementation milestones

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
