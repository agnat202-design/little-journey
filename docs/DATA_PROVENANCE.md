# Current source update — 4 October 2026

The production entry point now requires Google Auth and HouseholdGate. Household
records/budget come from load_household; changes persist through a transactional
RPC. Pregnancy metrics derive only from saved user HPL; absent HPL shows a neutral
family hero. Files upload to private family-files Storage and views use signed
URLs. Central demo fixtures remain only for isolated tests/fallback harnesses,
not authenticated production state. See PRM.md for server activation/live QA.
The audit below describes the earlier frontend checkpoint.

# Data Provenance Report — 3 October 2026

This report describes the implemented frontend, not future functionality. No Auth,
Supabase, cloud storage, onboarding, sharing, or backend persistence is connected.
All operational collections start empty and remain in React memory until reload.
An always-visible notice explains that limitation. Medical documents and receipts
use local object URLs; selecting a file does not upload it.

## Classification

- **A — USER INPUT:** entered fields and selected files, held in session state.
- **B — DERIVED FROM USER INPUT:** arithmetic, formatting, counts, record status,
  and metadata calculated from A. Empty collection totals are legitimate zero sums.
- **C — MOCK/DEMO DATA:** explicit examples. Derived values from demo inputs remain
  C; a calculation does not turn demo data into real user data.
- **D — STATIC UI COPY:** labels, categories, choices, branding, placeholders,
  validation constraints, and explicitly documented form defaults.

CSS sizes/colors, icon geometry and responsive breakpoints are visual design,
not personal data. Pip's illustrations are D, not health or financial insights.

## Screen-by-screen audit

Current source means the source after this audit. Future sources are plans only.

| Screen / displayed value | Class / current source | Future source | Action taken |
| --- | --- | --- | --- |
| Mobile header greeting and Little Journey name | D: neutral TopHeader copy | Greeting may use profiles after onboarding | Removed parent names, initials, member button, Synced and onboarding shortcut |
| Desktop header greeting / brand | D: neutral App copy | profiles / household_members | Removed family name, avatars, invite code and partner-share button |
| Desktop sidebar W / D | C: DERIVED_PREGNANCY passed by App | Pregnancy date derivation | Explicit Demo label; no separate week constants |
| Sidebar footer | D: Prototipe Lokal / Sesi sementara | Household identity after onboarding | Removed Keluarga Agung & Sarah and Household Aktif claim |
| Mobile and desktop navigation labels / selected state | D labels; B selected tab from user click | Same navigation | All remaining routes work; removed Timeline / Settings links to unsupported prototypes |
| Global prototype notice | D: truthful capabilities copy | Replace only when persistence exists | States accounts/sharing/permanent storage unavailable |
| Dashboard week / trimester / days remaining / percentage | C: centralized demo date calculation | pregnancies due_date / lmp_date | Marked Demo, exposes HPL example and says setup unavailable |
| Dashboard due date | C: DEMO_DUE_DATE, localized only for display | pregnancies | One constant in mockData; passed through App / Dashboard / JourneyHero |
| Dashboard baby fruit / size / weight / development claims | Previously C from logic's static fruit map and 28 cm / 430 g fixtures | No validated source exists | Removed from rendered UI; no clinical claim or fake measurement |
| Dashboard "Setengah jalan" headline | Previously D copy that implied a specific stage | Date-derived text, if needed | Replaced with Contoh perjalanan kehamilan |
| Dashboard actual spent / shopping spent | B: expenseBudget and shoppingSpend over expenses | Expense records | No seeded expense totals |
| Dashboard total / remaining / used percentage | A budget; B subtraction and ratio | User Budget Setup | Unconfigured budget shows dash/message rather than a fabricated limit |
| Dashboard checklist completed / total / percentage | B: checklistItems count and status | User task records | Empty by default; no sample completions |
| Dashboard trimester focus | C: supplied demo trimester | Pregnancy dates | Explicit Demo label |
| Dashboard next appointment fields | A records; B ISO date formatting and date ordering | User appointments | Empty-state text; no fabricated doctor/date; only upcoming dates are candidates |
| Dashboard shopping preview, brand, price, target week | A: first pending user shopping record | User shopping records | Removed implied urgent recommendation; does not suggest already-bought items |
| Dashboard shopping bought / pending / total counts | B: user shopping records | User shopping records | No seed counts |
| Dashboard shopping remaining estimate | B: sum estimated price × quantity; dash when any estimate is unknown | User shopping records | Still explicitly labeled Perkiraan; never cash spending |
| Dashboard three displayed tasks | A: first three saved tasks; B completed styling | User task records | Renamed fake weekly focus to Tugas Tersimpan, no invented weekly relevance |
| Task PIC | A if supplied; D Belum ditentukan fallback | Future explicit assignment / household_members | Removed Sarah & Agung assignment and Ayah & Bunda assumption |
| Checklist names / notes / categories / target week | A: Quick Add task state | User task records | Removed six seed tasks from initial state |
| Checklist status / counts / percent | B: create Pending, user completion toggle, counts | User task records | Preserved actual completion behavior; empty collection = 0 / 0 and 0% |
| Checklist priority | D: Medium creation default; B stored record display | User task priority if later supported | No fake priority inference; creation default documented here |
| Checklist current-week filter | C: demo currentWeek prop; D filter rule | Pregnancy dates | Replaced hardcoded W24 label and cutoff with supplied week, explicitly Demo |
| Checklist trimester filter | D: fixed trimester-2 range W14–W27 | Same rule on configured pregnancy | A selectable filter, not a claim about the user's trimester |
| Shopping name / brand / variant / estimate / URL / category / timing / notes | A: RecordEntryForm / ShoppingItem | User shopping records | Six seeded products removed from initial state; unknown estimate = dash |
| Shopping purchase price / date | A: required explicit Bought confirmation | User purchase / linked Expense | Not inferred from estimate; explicit zero remains valid |
| Shopping status | B: user create / buy / reverse actions | User shopping records | Pending/Bought labels reflect actual actions |
| Shopping bought / remaining counts | B: collection filtering | User shopping records | Zero counts now come from empty collections |
| Shopping Total Belanja | B: shopping-source Expense paid amounts, including retained history | Actual shopping Expenses | No demo spend; no double counting with Shopping |
| Product link button | B: existence of A valid HTTP(S) URL | Same user URL | Only shown when valid; safe new tab |
| Budget total / optional category values | A: BudgetSetupModal; D blank category schema | User Budget Setup | Removed Rp35m preset and nine monetary allocations; total-only save still works |
| Budget actual spent | B: sum expense paidAmount | Expenses | Starts at legitimate zero sum; source caption and history retained |
| Budget remaining / percent / bar | B: total minus actual, actual / total | Budget + Expenses | Unconfigured budget has no purported available balance / used percentage |
| Spending by category | B: expenses grouped by stored category | Expenses | No hardcoded category spending |
| Planned / unpaid section | B: pending Shopping estimates and Expense total − paid | Source Shopping / Expense records | Appears only with source records; removed seed package/DP |
| Expense history date / description / category / amount / notes | A manual form; B linked Shopping purchase fields / date localization | Expenses | No four seeded transactions; visible empty history |
| History transaction count / attachment indicator | B: collection count / attachment existence | Expenses and attachment metadata | Actual records only |
| Appointments purpose / doctor / location / date / time / notes / week | A: Quick Add or editor | User appointments | Removed two seeded controls; required dates remain ISO |
| Appointment count | B: appointments.length | User appointments | Honest empty state; no costs or reminders invented |
| Documents type / title / date / notes | A: document editor | User document records | Collection remains empty until user adds a document |
| Document count / file name / MIME / size | B: record count and selected File metadata | Document records / future storage metadata | No static sample uploads; local-only disclaimer retained |
| Attachment preview / download URL | B: local URL.createObjectURL(selected File) | Storage adapter producing real authorized URLs | Works in session; storagePath is reserved metadata, not an upload claim |
| Quick Add selection / typed values / saved destination | A: form state; B saved domain records and navigation | Same records with future persistence | Neutral each reopen; no fabricated identity attached to tasks |
| Quick Add labels / time choices / categories / optional week range | D: explicit UI schema | Same schema | Not user facts; date / price input starts blank |
| Task default Pending / Medium / quantity 1 | D creation defaults, B later stored state | Same frontend rules | Explicitly not inferred personal data or a recommendation |
| Record editor defaults (USG type, blank category, Paid when fully paid) | D type choice; B payment status from numeric fields | User records | Visible selection can be changed; no pretend existing file |
| Timeline | Previously C: seven component-local week/milestone entries | Future actual timeline records, if implemented | Removed view and navigation; no invented developmental / completed events |
| Onboarding / partner / Settings prototype | Previously C names/date/code and D nonpersistent controls | Future onboarding / accounts / household membership | Removed unused onboarding component and all entry points; no pretend sharing or success |

Empty states and category names, field labels, validation errors, button labels,
modal explanations and success text following a real in-memory save are D.
Success means saved into the current frontend session, not uploaded/synchronized.
There are no rendered notification counts, price alerts, promotions, AI advice,
live updates, or cloud synchronization claims.

## Exact pregnancy provenance

`mockData.ts` owns `DEMO_DUE_DATE = 2027-02-01`. Both legacy demo Child and
Pregnancy fixtures refer to that same constant. `DEMO_REFERENCE_DATE` is the
current calendar date in Asia/Jakarta, resolved once when the module loads.
`DERIVED_PREGNANCY` calls `calculateGestationalAge(DEMO_DUE_DATE,
DEMO_REFERENCE_DATE)`. It is C, because the HPL was not entered by the user.

The calculator uses 280 days / 40 weeks as its documented gestation baseline:

- days remaining = max(0, ceil((HPL − reference date) / one day));
- elapsed days = max(0, 280 − days remaining);
- week = min(42, floor(elapsed days / 7)); day = elapsed days modulo 7;
- trimester = 1 before W14, 2 before W28, otherwise 3;
- percentage = min(100, round(week / 40 × 100)).

For the audit date **2026-10-03**, the demo yields **W22 / D5**, trimester 2,
121 days remaining, and 55%. These are example results, not production user facts
or medical measurements. Values refresh on reload, not through a live timer.
Progress comes through props from the same calculator; the Hero no longer
recalculates a competing percentage.

The calculator still returns a legacy static fruit/milestone lookup for backwards
compatibility. It is not displayed anywhere; no fruit comparison, length, weight,
or developmental conclusion is presented as a real measurement.

## Removed personal/demo values

Removed from reachable UI and default state:

- Sarah, Agung, Sarah & Agung, Keluarga Agung & Sarah, avatars S / A,
  Baby K child identity and BBY-772 invite code.
- Synced, Household Aktif, "Kalian terhubung", partner-sharing button,
  "Tautan Tersalin!" that never copied/shared anything, and nonpersistent onboarding.
- Rp35,000,000 household budget and nine category allocations: Rp14m, Rp3m,
  Rp4.5m, Rp2.5m, Rp2m, Rp1.5m, Rp1m, Rp5m, Rp0.5m.
- Six seeded Shopping records: Infant Car Seat, Compact Stroller Cabin Size,
  UV Sterilizer & Dryer, Hospital Grade Breast Pump, Crib Kasur Busa Organik,
  Bamboo Swaddle Wrap (Pack of 3). All sample brands, variants, stores, URLs,
  prices, quantities, target weeks and purchase statuses were removed from
  initial user state together with those records.
- Six seeded tasks: USG Fetomaternal / 4D Screening Anomaly; Survey Paket
  Melahirkan & Kamar Rawat Inap; Daftar Kelas Edukasi Laktasi & Menyusui;
  Beli Car Seat Newborn (ISOFIX); Siapkan Tas Bersalin (Hospital Bag) Ibu & Bayi;
  Cuci Baju Bayi dengan Deterjen Khusus Baby. Their sample assignments,
  notes, priorities, completion states and W22/24/26/32/34 targets are not loaded.
- Two seeded appointments: 2026-10-14 and 2026-11-18, dr. Raditya,
  RSIA Bunda Menteng, sample purposes / preparation notes and W24/W28 targets.
- Four seeded expenses: stroller Rp6m on 2026-09-09; pump Rp2.15m on
  2026-09-15; swaddles Rp600k on 2026-09-20; hospital package Rp14m with
  Rp4m paid on 2026-09-25. Consequently fake initial Rp12.75m actual spend,
  Rp22.25m balance, 36% used, item counts and completion ratios disappeared.
- Seven hardcoded Timeline entries at W20/22/24/28/32/36/40, their completed /
  current flags, medical and developmental statements and named hospital comparisons.
- Dashboard 28 cm / 430 g, fruit/development claims and fixed half-way headline;
  hardcoded Checklist W24 cutoff and misleading weekly-focus wording.
- No demo Documents had been loaded before this audit; none were added.

Historical record fixtures remain isolated in `src/data/mockData.ts` for tests or
explicit future demos. App no longer imports or hydrates those record arrays,
INITIAL_HOUSEHOLD or INITIAL_CHILD. Personal names in fixtures were neutralized.
Only the clearly labeled centralized pregnancy example remains on screen.
`LOCAL_CONTEXT` contains session routing IDs, not registered profiles/children.

## Future data source map (not implemented)

| Value | Future source | Setup / derivation |
| --- | --- | --- |
| Parent names | profiles / household_members | Future onboarding |
| Household name / members | households / household_members | Future onboarding and actual membership |
| Child identity | children | Future onboarding |
| Pregnancy HPL / LMP | pregnancies | Future pregnancy setup |
| Week / day / trimester / remaining days / progress | Pregnancy dates | Same deterministic derivation, input becomes A and result B |
| Budget | User Budget Setup | Explicitly saved total / optional categories |
| Shopping | User records | Add/edit/delete / actual purchase confirmation |
| Actual spending | Expenses | One expense per purchase; grouped/summed once |
| Appointments | User records | User scheduling forms |
| Documents | User uploads / document metadata | Future storage adapter; local File now |
| Tasks | User records | Quick Add + completion actions |
| Sync status | Real persistence layer only | Show only once actual persistence/error state exists |

## Unsupported capabilities / remaining limitations

Removed actions rather than pretending they work: partner invitation/sharing,
registration/onboarding, account settings and sample Timeline. No replacement
feature was invented. Pregnancy setup, household assignment, cloud persistence,
and synchronization are unavailable, explicitly stated in UI. Tasks preserve
their existing add/toggle behavior; no task edit/delete feature was added.

Receipts/documents and all records disappear on reload. Camera capture uses
the browser's file input capture hint; whether it opens a camera depends on
the device/browser. Upload File remains a local file picker.

## Validation

Executed on completion:

- `npm test`: exit 0; 48 existing checks and 21 integration groups passed,
  zero failures.
- `npm run lint`: exit 0; TypeScript `tsc --noEmit` passed.
- `npm run build`: exit 0; Vite production build passed. Existing warning:
  `vite.config.ts` uses `__dirname`, unsupported by a future native config loader.

Integration coverage checks anonymous headers, empty initial collections,
unconfigured budget and supplied-week filtering, plus the existing CRUD,
attachment, linked-expense and no-double-counting flows. Exact execution
results are also reported with task completion. This pass did not claim a new
manual browser CRUD verification.
