# SUPABASE SCHEMA DESIGN REPORT — Phase 1A

> Implementation update, 4 October 2026: the first schema/RLS migration was
> executed by the user. The additive MVP persistence migration implements
> household setup/load/save RPCs, optimistic concurrency and private Storage
> access. See [supabase/README.md](../supabase/README.md). The design-time status
> statements below are historical, not current deployment claims.

Final Phase 1A.1 decisions, 2026-10-03; supersedes V2 and open Phase 1A choices. No SQL, tables, Auth/Storage,
packages, environments, frontend changes, commit or push. Review before implementation.

## 1. Current frontend domain discovered

Reviewed domain.ts, App.tsx, familyRecords.ts, businessLogic.ts, shopping.ts,
mockData.ts, RecordEditor, QuickAddBottomSheet and BudgetSetupModal.

- Household/Member/Child/Pregnancy/Milestone types exist without real account/setup.
- Operational arrays start empty in React state. Tasks add/toggle; Shopping, Expenses,
  Appointments, Documents have CRUD. No milestone screen/CRUD.
- Shopping estimate/category/URL/timing optional; Bought requires explicit actual
  total price/date. Unknown differs from explicit zero.
- buyShopping upserts one current Expense by shoppingItemId; editing either side
  synchronizes title/category/purchase amount/date. Delete Shopping detaches and
  retains Expense with source=shopping. Reverse explicitly keeps/detaches OR removes
  Expense. Repurchase after kept history creates a new transaction. Delete linked
  Expense resets Shopping to Wishlist.
- expenseBudget excludes Bought/Received from legacy budget calculations; actual
  spend/category totals use Expenses only. Legacy engine still has fallback branches.
- Expense model supports cumulative totalAmount/paidAmount/paymentStatus; new UI
  records are fully paid. One expenseDate does not model dated installment history.
- Budget has total, separate configured flag and optional category planning settings.
- Appointment purpose/date required; optional time/doctor/location/notes/week, no cost.
- Document requires file/type/title, optional date/notes. Expense attachment optional.
  LocalAttachment uses ephemeral blob URL and has a future storagePath seam.
- Pregnancy metrics derive from centralized labelled Demo HPL. All new records get
  local-session/local-context dummy IDs and active stage pregnancy; not real tenants.

## 2. Tables and common column specification

Ten core tables: profiles, households, household_members, children, pregnancies,
tasks, shopping_items, expenses, appointments, documents.
Keep budget_category_allocations: BudgetSetupModal has editable category inputs in
“Budget per kategori (opsional)” and saves them via onSaveBudgetSetup; App.tsx stores
and reopens categoryAllocations. Implemented user configuration needs persistence.
Single nullable household budget simpler than separate budgets table. Milestones
evaluated/deferred (type only); no speculative invitations/payments/category tables.

R=required; O=nullable. Common fields inherited by every table unless overridden:

| Column | Type/default/constraint |
|---|---|
| id | R uuid PK default gen_random_uuid(); profile overrides with Auth id |
| created_at | R timestamptz server default now(), immutable |
| updated_at | R timestamptz default now(); future server update hook advances it |
| household_id | R uuid FK households.id, no default; only household-owned tables |
| created_by | R uuid FK profiles.id, authenticated creator, immutable; household-owned tables |

Nullable values default NULL, not empty string or fabricated zero. Required strings
trimmed/nonempty. Monetary fields numeric, <=2 scale and <=999999999999.99, finite and >=0, reject NaN/infinity
and excess precision instead of silently rounding. UI presently whole IDR. Calendar
dates PostgreSQL date; audit timestamptz. No localized dates or timezone midnight.
Stage nullable text CHECK pregnancy/birth/newborn/infant/toddler/preschool, never a
universal pregnancy default. Household/id/creator cannot be moved by client updates.
Household and creator FKs RESTRICT by default; no automatic destructive cascades.
Account/household deletion and retention remain later policy, not a purge subsystem.

## 3. Table columns, purposes, defaults and constraints

### profiles — Auth-backed user display metadata

| Column | Type | Requirement |
|---|---|---|
| id | uuid | R PK FK auth.users.id, supplied, no generated fake user |
| display_name | text | R nonempty user input |
| avatar_storage_path | text | O future object key |
| created_at / updated_at | timestamptz | R server timestamps as above |

No household_id/created_by on profile. No passwords/email copy/tokens/global roles.
Auth/profile deletion restrictive pending later account policy; no automatic cascade
of profile or business history, no retention/anonymization machinery designed now.

### households — top-level tenant and one current preparation budget

Common id, created_by, timestamps; no self-referencing household_id.

| Column | Type | Requirement |
|---|---|---|
| name | text | R nonempty user-entered household label |
| currency | text | R default IDR, CHECK IDR for current single-currency MVP |
| timezone | text | R default Asia/Jakarta, validated IANA identifier |
| total_budget | numeric | O default NULL; zero means explicitly configured zero |
| partner_display_name | text | O, display only, never auth/member access |

Ownership authority is membership, not creator. No short invite_code until secure
invitation design. A partner without an account must not become a fake auth user.

### household_members — per-household access and roles

Common id/household_id/created_by/timestamps.

| Column | Type | Requirement |
|---|---|---|
| user_id | uuid | R FK profiles.id |
| role | text | R default member; owner/member |
| status | text | R default active; active/inactive |

UNIQUE(household_id,user_id). No duplicated display_name. First household + owner
created atomically by future authorized bootstrap, never self-enroll by known UUID.
At least one active owner; later lock/enforce last-owner deletion/demotion/deactivation.

### children — multiple real child identities within household

Common id/household_id/created_by/timestamps.

| Column | Type | Requirement |
|---|---|---|
| display_name | text | R nonempty; user nickname allowed |
| pregnancy_id | uuid | O same-household pregnancies FK; NULL for unrelated child entry |
| birth_date | date | O actual date when known |
| gender | text | O boy/girl/surprise/undisclosed, existing domain values |

No duplicated due_date (belongs to Pregnancy), no derived current_stage persisted.
A post-birth child can exist without pregnancy record.

### pregnancies — pregnancy dates/status and optional child continuity

Common id/household_id/created_by/timestamps.

| Column | Type | Requirement |
|---|---|---|
| due_date | date | R authoritative user-confirmed HPL |
| lmp_date | date | O <= due_date when supplied; no forced 280-day equality |
| baby_nickname | text | O, no fake Child required at setup |
| status | text | R default active; active/completed/archived |
| notes | text | O |

No pregnancies.child_id. One Pregnancy has 0..many Children via children.pregnancy_id,
including twins/triplets. No household single-pregnancy uniqueness, stored week/day/
trimester/countdown/progress or automatic completion after HPL.

### tasks — existing checklist, lifecycle-independent

Common id/household_id/created_by/timestamps.

| Column | Type | Requirement |
|---|---|---|
| pregnancy_id / child_id | uuid | O same-household context FKs |
| stage | text | O lifecycle CHECK |
| name | text | R nonempty |
| category | text | O existing label |
| priority | text | R default Medium; High/Medium/Low |
| status | text | R default Pending; Pending/In Progress/Completed/Skipped |
| assigned_member_id | uuid | O same-household household_members FK |
| target_gestational_week | integer | O 1..42, requires stage=pregnancy |
| target_date | date | O |
| target_age_months | integer | O >=0; no arbitrary universal max age |
| notes | text | O |

Assignee active when assigned. Later deactivation need not destroy assignment history.
Schema design does not introduce task edit/delete UI.

### shopping_items — planning/status, no independent spending truth

Common id/household_id/created_by/timestamps.

| Column | Type | Requirement |
|---|---|---|
| pregnancy_id / child_id | uuid | O same-household context FKs |
| stage | text | O lifecycle CHECK |
| item | text | R nonempty |
| category / brand / model / store | text | O |
| quantity | integer | R default 1, >0 |
| priority | text | R default Medium; High/Medium/Low |
| estimated_unit_price | numeric | O NULL unknown, explicit zero valid |
| product_url | text | O absolute http/https, reject unsafe protocols |
| target_gestational_week | integer | O 1..42, stage=pregnancy when supplied |
| target_date | date | O |
| target_age_months | integer | O >=0 |
| status | text | R default Wishlist; Research/Wishlist/Planned/Ordered/Bought/Received/Skip |
| notes | text | O |

No target/current intelligence columns or stored actual price/date duplicates.
Purchase fields derived from one current linked Expense. Estimated total derived as
quantity × estimated_unit_price; unknown unit price means unknown total. No stored
estimated total. Current creation quantity=1 maps without ambiguity.

### expenses — simple MVP actual spending source

Common id/household_id/created_by/timestamps.

| Column | Type | Requirement |
|---|---|---|
| pregnancy_id / child_id | uuid | O same-household context FKs |
| stage | text | O lifecycle CHECK |
| title | text | R nonempty description |
| category | text | O; NULL grouped by UI as Lainnya |
| paid_amount | numeric | R explicit actual transaction total >=0, no zero default |
| expense_date | date | R explicit input, no server today default |
| source | text | R default manual; manual/shopping |
| shopping_item_id | uuid | O current same-household Shopping FK |
| notes | text | O |
| attachment_storage_path | text | O private object key |
| attachment_file_name | text | O |
| attachment_mime_type | text | O |
| attachment_size_bytes | bigint | O >=0 |

Attachment metadata all-or-none; path/name nonempty. No blob/local/signed URLs or
bytes stored. Linked Expense requires source=shopping, retained when detached.
Partial UNIQUE(shopping_item_id) WHERE non-null yields one CURRENT link; historical
kept Expenses detach and remain spend. No total_amount/payment_status, installments,
refunds, planned obligation or payment-event model in Phase 1. Explicit zero paid_amount
valid; missing amount invalid. Legacy cumulative fields future scope, not MVP schema.

### appointments — visit purpose and schedule, no money

Common id/household_id/created_by/timestamps.

| Column | Type | Requirement |
|---|---|---|
| pregnancy_id / child_id | uuid | O same-household context FKs |
| stage | text | O lifecycle CHECK |
| purpose | text | R nonempty |
| appointment_date | date | R explicit calendar date |
| appointment_time | time(0) without time zone | O minute precision, no invented midnight |
| doctor / hospital | text | O separate doctor/location |
| notes | text | O |
| target_gestational_week | integer | O 1..42, stage=pregnancy when supplied |

No cost/estimated_cost/payments. nextAppointmentDate unused in current CRUD, omit;
future follow-up can be a separate Appointment.

### documents — metadata for one required file per document

Common id/household_id/created_by/timestamps.

| Column | Type | Requirement |
|---|---|---|
| pregnancy_id / child_id | uuid | O same-household context FKs |
| stage | text | O lifecycle CHECK |
| document_type | text | R USG/Hasil Lab/Dokumen Kontrol/Invoice/Receipt/Resep/Lainnya |
| title | text | R nonempty |
| document_date | date | O matching actual frontend optional date |
| notes | text | O |
| storage_path | text | R nonempty private object key |
| file_name | text | R nonempty original filename for display |
| mime_type | text | R server-validated type, not browser assertion alone |
| size_bytes | bigint | R >=0, later configured upload limit |

UNIQUE(storage_path) in one fixed future bucket. No duplicated category/type, fileUrl
or file bytes. Expense receipts use Expense metadata; no automatic Document copy.

### budget_category_allocations — existing optional secondary settings

Common id/household_id/created_by/timestamps.

| Column | Type | Requirement |
|---|---|---|
| category | text | R nonempty |
| planned_amount | numeric | R explicit nonnegative input, zero valid |

UNIQUE(household_id,category). Empty allocations need not materialize. No stored
spent/remaining/percent/icon/color; no forced equality to total budget; no expenses.

## 4. Relationships and tenant-safe FK/deletion rules

profiles.id -> auth.users.id; membership links users/households, allowing multiple
households per profile and multiple active owners. Generic rows require household
ownership independently of optional pregnancy/child context, including neither set.

UNIQUE(household_id,id) on children, pregnancies, household_members, shopping_items.
Context FKs use composite (household_id,child_id/pregnancy_id/assigned_member_id/
shopping_item_id) to same-household target pair. Cross-household links invalid even
if caller is a member of both tenants. RLS alone does not enforce FK tenant integrity.

Context deletion clears ONLY nullable reference, never household_id; preserves
household records. If column-specific SET NULL cannot be safely used, restrictive
FK + authorized unlink/delete transaction. Shopping deletion retains/detaches Expense,
never financial cascade. Pregnancy completion changes no ownership or historical data.
children.pregnancy_id uses the same household/pregnancy composite FK. If both operational
context IDs are supplied, require child's pregnancy_id to match the record's pregnancy_id,
also on child reassignment. This needs server cross-row validation, not ordinary CHECK.
Whole-tenant/account purge is later policy; no automatic history destruction.

## 5. Ownership / Auth/profile model

Auth owns credentials, profiles display only. Role household-specific; browser
claims are not authority. Non-account partner is display information only. Future
flow Auth -> profile -> atomic household/first owner -> pregnancy HPL -> Dashboard.
No onboarding implemented; no fake partner auth rows or public credentials.

## 6. Pregnancy -> Child lifecycle

Create Pregnancy with HPL and optional LMP/nickname before any Child exists. After
birth one or multiple same-household Children reference it via children.pregnancy_id;
enter actual birth dates and explicitly complete Pregnancy. Query children without
bulk ownership rewrites; new post-birth records may use child only. No single-child FK.

Metrics derive from authoritative HPL and household-local civil date, avoiding
elapsed-millisecond time-zone errors. LMP may suggest HPL, never silently override
confirmed HPL. After due_date Pregnancy stays active until explicitly completed/birth.
Application may derive overdue state from date/status; never store gestational snapshots.
Age-stage thresholds remain later application rules, not a Phase 1 SQL blocker.
Labelled Demo remains unchanged until onboarding authorized, never seeds production.

## 7. Shopping <-> Expense, single truth and atomic transactions

Actual spent = SUM(expenses.paid_amount), household-scoped, exclusively. Remaining =
configured total_budget - spend; NULL budget means unknown remaining. Planning not
spend. Shopping spend includes detached source=shopping historical transactions.

Persist one FK expenses.shopping_item_id. Shopping linked_expense_id can be derived
by join, avoiding circular persisted pointers. Actual total/date from Expense,
unit amount = total/quantity; no separately writable financial cache.

Future atomic, membership-authorized database operations, not client two-call writes:

1. Buy: lock item, require explicit total >=0 and date, upsert one actual linked
   Expense, mark Bought. Concurrent repeat requests serialize to same current link.
2. Edit Bought or linked Expense: lock pair consistently; synchronize title/category
   and Expense amount/date. Same financial truth.
3. Reverse keep history: detach Expense, preserve shopping source, mark Wishlist.
4. Reverse delete: remove current Expense and mark Wishlist together.
5. Delete item: detach Expense then remove item, keep finance history.
6. Delete linked Expense: reset item Wishlist and delete transaction together.
7. Repurchase after retained history: new current Expense, historical row unchanged.

Unique link alone cannot ensure Bought has an Expense. Deferred transaction-end
enforcement must require Bought/Received to have exactly one actual shopping
Expense; linked Expense must correspond to those statuses. Ordinary CHECK cannot
enforce cross-table invariants. Later controlled RPCs plus deferred constraint triggers
or equivalent server enforcement needed; direct protected status/link writes restricted.
Privileged RPCs authorize caller/tenant and fixed search_path, concurrency/retry tested.
No RPC/SQL executed now; no invented refunds/split payments/additional cash records.

## 8. Documents / future Storage metadata boundary

One proposed private fixed bucket; keys household UUID / record-kind / record UUID /
random filename. Database metadata only. Later authorized short-lived viewing URLs,
never persisted signed/blob/local URLs. Object policies independently enforce active
membership/record scope. No Storage configured. Database and object deletion are not
one transaction; later retryable orphan cleanup handles failed uploads/deletions.
Future byte/type/size validation, not trusting local MIME alone.

## 9. Proposed RLS rules, conceptual only

All public tables RLS-enabled later, explicit minimum grants, anonymous denied.
Membership means auth.uid() matches active household_members row. Avoid recursive
membership policies through narrow private SECURITY DEFINER helper, fixed search_path,
reviewed execute grants; no broad privileged bypass.

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| profiles | self or active same-household co-member | own Auth id | self | controlled account lifecycle only |
| households | active member | authorized household/first-owner transaction | active owner/member for normal data and budget; destructive admin owner-only | controlled owner lifecycle |
| household_members | active member of same household | owner invites; trusted bootstrap | owner changes roles/membership; protect last owner | owner removes; protect last owner |
| children / pregnancies | active member | active member | active member | active member, safe contextual unlink |
| tasks / shopping / expenses / appointments / documents | active member | active member | active member | active member; linked financial operation atomic |
| budget_category_allocations | active member | active member | active member | active member |

Owner and active member can create/edit normal household data and preparation budget.
Only active owner invites/removes members, changes roles, or performs destructive
household administration. Column grants/controlled routines must distinguish normal
household updates from privileged administration; RLS alone cannot express all column
permissions. No non-owner self-removal/membership role mutation path proposed.
INSERT WITH CHECK validates tenant and creator uid; UPDATE USING old row and WITH
CHECK new scope; separate immutable tenant/creator guard. DELETE uses old row scope.
Profile co-member visibility requires both memberships active in same household.
No self-promotion/arbitrary tenant joining. RLS not substitute for column immutability,
last-owner or cross-table purchase constraints. Future aggregate views respect invoker
RLS; service-role credentials server-only. Storage authorization independent of row RLS.

## 10. Important indexes and constraints

- PKs, membership/allocations/object-key uniqueness, partial unique active purchase
  link, tenant/id composite unique pairs for contextual references.
- Membership (user_id,household_id) WHERE active; (household_id,role) WHERE active
  for owner checks. FK referencing indexes are not automatically created.
- Expenses(household_id,expense_date DESC,id), Appointments(household_id,
  appointment_date,appointment_time,id), Documents(household_id,document_date DESC,id).
- Task/Shopping lists(household_id,status,created_at DESC,id), Pregnancies
  (household_id,status), Children(household_id,birth_date).
- Household-prefixed child/pregnancy/assignee FK indexes where query/delete needs them.
- Finite nonnegative amounts, positive quantity, valid date/minute time, nonblank
  required text, optional timing ranges and safe URLs; tenant-consistent references.
- No speculative search indexes. Later migrations require RLS allow/deny, invalid
  links and concurrent purchase tests; design alone is not executed validation.

## 11. Frontend mapping/migration, later only

| Current | Proposed mapping |
|---|---|
| camelCase | explicit snake_case adapter |
| fixture/local-session/local-context IDs | never migrate; real authorized UUID context |
| totalBudget + configured flag | nullable household total_budget, zero distinct |
| IDR (Rp) | IDR stored; formatting UI only |
| category planned/icon/color/spent | allocation planned_amount only, visuals/static and spend derived |
| inviteCode | defer invitation model |
| Member.displayName | profile join |
| Child.dueDate/currentStage | Pregnancy HPL / derived child stage |
| Pregnancy nickname absent | future baby_nickname adapter |
| generic pregnancyId absent | later optional context adapter |
| ChecklistItem / assignedTo | tasks / assigned_member_id, not arbitrary name FK |
| estimate/currentPrice/targetPrice | estimated_unit_price; quantity=1 current UI; total derived quantity × unit |
| actualPrice/unit, actualPurchasePrice/total, purchaseDate | hydrate from linked Expense amount/date, not dual truth |
| totalAmount/paymentStatus | omit MVP obligation model; current fully paid adapter may expose total=paid and Paid |
| legacy cumulative partial rows | no silent import; future installments policy, not production Demo migration |
| Pregnancy.childId | remove; query children.pregnancy_id, never single-child restriction |
| date/time | ISO date + nullable HH:mm, UI localization only |
| doctor/hospital empty | NULL |
| nextAppointmentDate | unused, omit |
| Document category/type | one document_type |
| fileUrl/localUrl/File | ephemeral, upload bytes later; no URL migration |
| storagePath/name/mimeType/size | storage-path/name/type/bytes metadata |
| Dashboard counts/totals/progress | derived queries, no stored snapshots |

No automatic session/demo import. Later adapter hydrates aliases for current UI from
Expenses and persists mutations atomically without exposing a second financial source.

## 12. Architectural conflicts found

1. Old schema had appointment cost, timestamp-only dates, unknown prices zero, and
   Expense-plus-Shopping spend. Superseded here.
2. Legacy budget/category helpers retain Shopping fallback; active expenseBudget
   avoids it. Production adapter must never resurrect double counting.
3. App persists price/date aliases in local state; not independent database truths.
4. Dummy child/household IDs and missing generic pregnancyId require later mapping.
5. Single React setter atomicity does not translate into separate Supabase requests.
6. Legacy Expense types allow cumulative obligations; final MVP schema only actual
   transactions. No installment/refund model or automatic legacy partial-row import.
7. Blob attachments cannot be persisted/recovered after reload without real upload.
8. Old architecture claimed connected Supabase services; documentation corrected.

## 13. Final decisions / deferred scope / SQL readiness

Permissions, twins, estimated unit price, overdue active status and category settings
are settled above. No unresolved product blocker for drafting the Phase 1 schema.
Installments/refunds, milestone table, secure invitation delivery, account/household
deletion/retention and child stage thresholds are later scope, not invented now.
Owner-only membership authorization is specified; delivery/invitation mechanics deferred.
Destructive household/account actions remain unavailable until later policy review.
Next gate: explicit permission to write/review migrations, then separate authorization
to execute them. SQL must validate active membership, immutable tenant fields,
composite tenant FKs and atomic Bought/Expense invariants; no SQL performed here.

## 14. Reference basis and review gate

[Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security),
[PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html),
[Storage access](https://supabase.com/docs/guides/storage/security/access-control)
consulted for technical design. RLS/grants and independent Storage authorization
require later tests; FKs protect tenant links; cross-table invariants need transactions.
Human review first, separate authorization for SQL/Auth/Storage/adapters/onboarding.

## Phase 2 preparation status

Schema frozen. First migration prepared in supabase/migrations, tested locally with
23 PostgreSQL/WASM checks using Auth stubs. Not applied to the user project; remote
Auth/grants and concurrency remain unverified. See supabase/README.md for preflight.
Money uses unconstrained numeric plus scale/range checks to reject rounding; context
FK deletion restrictive until explicit unlink. Financial RPCs/synchronization are
later persistence work; deferred invariants reject incomplete purchase transactions.
