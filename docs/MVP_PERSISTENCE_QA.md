# Little Journey — QA Evidence
Diperbarui: 5 Oktober 2026.

## Latest local validation
npm test, npm run lint (tsc --noEmit), npm run build passed for f64bbb6 code. Includes 48 business assertions, 27 record integration groups, persistent App acknowledgement/failure guards, config/Google SDK checks, adapters/repository rollback, Profil, HTML report month filters/escaping, PDF multipage, and stale OAuth error/URL cleanup. Existing Vite config/chunk-size advisories remain.
Schema local suite: 23 checks passed. Persistence local suite: 9 groups passed. Covers active/stranger/anonymous RLS, cross-household references, price null/zero, valid purchase atomicity/rollback, stale household version, operation whitelist and private Storage paths.
These SQL tests use PGlite + stubbed Auth/Storage contract; not remote HTTP/OAuth verification.

## Live evidence
- User screenshots show Google login, household/HPL entry and persisted record use.
- User successfully executed first schema and second persistence migrations.
- Anonymous load RPC probe returned 401/42501 after activation, expected denial.
- Agent read production Table Editor: Checklist, appointments, bought Shopping, Expenses and document metadata exist. Verified one Shopping purchase had one linked Expense, matching actual price/date. No private record contents copied into source.
- Database → Backups explicitly says Free Plan does not include project backups.

## Remaining live QA
Not complete: every add/edit/delete/reload flow; private file upload/reload/view/delete; multi-user/session conflicts; logout/error patch; mobile PDF download and PDF/preview visual acceptance; latest Cloudflare build verification. No restore/backup drill, Play Store Android test, billing test or account deletion test.
Earlier prototype P0/P1 gate does not automatically certify newly added persistence/Auth/reporting/Profile code. Do not label current complete product P0=0/P1=0 without a new rendered end-to-end pass.

## QA rules
Only create named test records; don't delete existing family history. Financial summaries must reconcile with Expenses. Failed/uncertain saves must not show success or retry blindly. Unknown price not Rp0. Preview snapshots not historical completion records. Backup claims require file coverage and restore evidence.
