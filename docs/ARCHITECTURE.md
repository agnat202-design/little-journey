# Little Journey — Arsitektur Saat Ini
Diperbarui: 5 Oktober 2026. Detail desain lama tersimpan di [arsip](archive/ARCHITECTURE_PRE_2026_10_05.md); bukan status runtime.

## Alur aplikasi
main.tsx → AuthBoundary → HouseholdGate → App → views/modals.
AuthBoundary memeriksa SDK session, Google PKCE login dan local logout. Session berhasil membersihkan error OAuth lama dari UI/URL. Keluar ada di Profil. HouseholdGate menemukan membership atau setup profile/household/owner/HPL melalui setup_household; beberapa household dapat dipilih.

## Batas kode
| Lokasi | Tanggung jawab |
| --- | --- |
| src/App.tsx | Navigation, current acknowledged snapshot, editor/confirmation, save coordination |
| src/components/views | Dashboard, Checklist, Shopping, Budget/history, Appointments, Documents, Profile |
| src/components/modals | Catat Cepat, budget/HPL/task editors, monthly reports |
| src/components/records | Shared record forms/actions, attachment picker/signed viewer |
| src/lib/supabase* | SDK/config public URL/key validation |
| src/lib/householdRecords.ts | Decode/encode rows and calculate changed operations |
| src/lib/householdRepository.ts | Load/save RPC, version concurrency, Storage uploads/cleanup |
| src/lib/familyRecords.ts | Shopping/Expense linkage, reversal and spending helpers |
| src/lib/businessLogic.ts | Pregnancy/budget/progress derived calculations |
| src/lib/expenseCategories.ts | Five simple expense choices and legacy display labels |
| src/lib/monthlyReport.ts | Month-filtered escaped HTML and download utility |
| src/lib/reportPdf.ts | Lazy jsPDF/AutoTable PDF generator, pagination |
| supabase/migrations | Schema/RLS and additive household RPC/private Storage policies |
| supabase/tests | Local schema/persistence security tests; not production proof |

## Persistence and errors
load_household returns household/operational snapshot. save_household_changes locks household and compares microsecond updated_at version. Only whitelisted changed operations are accepted; transaction validates Shopping/Expense relationships. UI success/state changes after acknowledgement only. Failed/uncertain mutations block retries until reload; stale data cannot silently overwrite newer snapshot.
Profile reads/updates own profile-authorized household and children directly through SDK/RLS. Household name save reloads app so version/display are fresh. Profile is not a household administrator screen.

## Attachments
Private family-files, maximum 10 MB. Paths begin household UUID, files not in Postgres. Upload before record commit; failed transaction cleanup best effort. Replaced/deleted file cleanup after commit; failure is reported. AttachmentView requests five-minute signed URL. No distributed transaction between Storage and Postgres: orphan cleanup remains operational concern.

## Reporting
Report modal fetches fresh load_household snapshot on request. Expenses, appointments and dated documents filtered by selected month; checklist/shopping/budget present current state. No persisted audit log or monthly historical balances. PDF generated client-side, plain text escaped in HTML; preview iframe sandboxed. JSON also reads children and own profile; credentials and actual Storage binary omitted. No email, restore/import or backup scheduling.

## Boundaries
Production requires Auth; no user-facing demo data or sync claims. No realtime subscriptions. All money remains IDR. Pregnancy is active lifecycle in App. Core budget is household total; actual spend comes only from Expenses. No service-role secret in Vite. Read [STATUS](STATUS.md) for production evidence and limitations.
