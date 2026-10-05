# Little Journey — Data Provenance
Diperbarui: 5 Oktober 2026. [Prototype audit historis](archive/DATA_PROVENANCE_PRE_2026_10_05.md).
A = input pengguna, B = derived input, C = demo fixture, D = static UI.

| Screen/value | Class / current source |
| --- | --- |
| Email Profil | A / Supabase Auth user.email |
| Nama keluarga/anak | A / households.name, children.display_name |
| HPL | A / pregnancies.due_date |
| Week/day/trimester/countdown/progress | B / HPL and Jakarta current date; not persisted |
| Checklist/status/category | A / tasks; progress B from record counts |
| Shopping name/estimate/link/notes/status | A / shopping_items; purchase price/date from linked Expense |
| Spending/history/category totals | A expenses; B sums of paid_amount, not estimates |
| Budget/remaining/percent | A household total_budget; B Expense totals and arithmetic |
| Appointment date/time/details | A / appointments; localized date only in UI |
| Documents/receipts | A / metadata + user-uploaded private Storage binary |
| Report | A/B / fresh authorized snapshot, month filters + deterministic sums |
| Labels/logo/mascot/navigation | D / static product assets/copy |
| mockData fixtures | C / isolated test/fallback harness; not production household records |

No fake people identities, cloud sync state, promotions, recommendations or external financial/price insights. Household membership/children are not demo user identities. Existing user-entered promotion notes remain user data. Report current snapshots are explicitly labeled; completed tasks are not claimed completed during selected month. No onboarding or Auth credentials are inferred from static values.
