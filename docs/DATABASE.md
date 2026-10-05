# Little Journey — Database Saat Ini
Diperbarui: 5 Oktober 2026. [Desain terperinci historis](archive/DATABASE_PRE_2026_10_05.md) dipertahankan; SQL migrations adalah definisi teknis utama.

## Migration yang dijalankan pengguna
1. supabase/migrations/202610030001_household_schema.sql — tables, constraints, RLS, household bootstrap/helper functions.
2. supabase/migrations/202610040001_mvp_persistence.sql — setup/load/save RPC, version guard, private bucket/policies, path checks.
Keduanya berhasil menurut screenshot pengguna; data live diperiksa Table Editor. Jangan jalankan ulang migration create-table secara sembarang.

## Tabel
| Tabel | Sumber / isi |
| --- | --- |
| profiles | Auth user id + display name; tidak menyimpan password/token |
| households | Nama keluarga, IDR currency, timezone, nullable total_budget |
| household_members | user/household membership, owner/member, active/inactive |
| pregnancies | due_date/LMP, status, optional nickname/notes; tanpa derived metrics |
| children | Nama, optional birth date/gender/pregnancy_id |
| tasks | Checklist/status/priority/category/notes dan optional context/timing |
| shopping_items | Item/brand/model/category/URL, quantity, nullable estimated_unit_price, status |
| expenses | paid_amount/date/category/source, optional unique shopping_item_id dan receipt metadata |
| appointments | Purpose/date/optional time/doctor/hospital/notes; no estimated cost |
| documents | Type/title/date/notes, private file metadata/path |
| budget_category_allocations | Optional user-configured planned category amounts, secondary settings |

## Relasi dan akses
Operational tables memiliki household_id; optional pregnancy/child context. Composite FK mencegah cross-household references. One pregnancy → zero/many children via nullable children.pregnancy_id; pregnancy exists before birth. RLS active member/owner normal CRUD/budget; owner-only membership administration. Auth user id dari auth.users. Last active owner guard; tenant/creator identities immutable. Account/household destructive deletion policy belum dibuat.

## Keuangan
Expenses exclusively actual spending. Shopping quantity × estimated_unit_price derives estimate; unknown is NULL, explicitly entered zero valid. Bought/Received links exactly one active Expense via unique FK/check transaction. Reversal/deletion can detach retained Expense without double counting according to existing UI decisions. No installments/refunds. total_budget NULL unconfigured; zero explicitly configured distinct. Currency CHECK currently IDR only.

## Legacy fields dan UI
Target gestational week columns remain schema-compatible but removed from Checklist/Shopping/Jadwal UI. Existing values not migrated away. Store/name/category legacy values preserved; five Expense labels are display choices, not destructive record conversion. Milestone table absent.

## Files, reports, backup
Storage binary in private family-files, household-prefixed paths. Postgres holds metadata. Monthly report/JSON export no new database table; JSON excludes Auth credentials/binary. Free project's Database Backups page states project backups excluded. No restore verification or scheduled independent backup. Public key grants no admin access.

## QA
23 schema checks and 9 persistence groups passed locally. Real records verified in production; all production mutation/attachment/isolation scenarios not yet covered. [QA evidence](MVP_PERSISTENCE_QA.md).
