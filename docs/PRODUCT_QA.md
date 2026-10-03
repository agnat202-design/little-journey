# Final Pre-Supabase Product QA

## Phase 1 — recorded before code changes

Manual rendered-browser QA used a fresh isolated in-app browser tab and synthetic
QA records. Vite was started with the existing npm script. No user review tab was
reloaded. Widths: 390 × 844, 430 × 932, and 1280 × 900.

**P0: 0 found. P1: 3 found.**

| ID | Priority | Observed problem | Unambiguous correction |
| --- | --- | --- | --- |
| QA-01 | P1 | After Edit/save, the native details action menu remains open. On 390px Shopping its Hapus action overlays the Tandai Beli position; the attempted purchase click opened delete confirmation. Also observed in Expenses, Appointments and Documents. | Close the action menu when an action is chosen, including extra detail actions. |
| QA-02 | P1 | A 101-character unbroken Document title had 716px scroll width in a 274px heading at 390px and visibly extended past the card/viewport. | Wrap user-entered text rather than clip it; preserve existing surfaces/layout. |
| QA-03 | P1 | After reversing Shopping while keeping Expense, then deleting the planning item, Dashboard showed 0 Sudah Dibeli with Rp175rb directly below it. Shopping itself correctly explained retained history, Dashboard did not. | Label cash spending as historical Expense spending separately from current item counts. |

No broken financial reconciliation or duplicate linked expense was observed.

### Actual baseline browser interaction log

- Empty Dashboard, Budget, Shopping, Appointments and Documents; anonymous header,
  explicit demo pregnancy HPL/week/day/trimester/progress and local-session notice.
- Budget: configure Rp1m on mobile with no category allocations, then Rp2m on desktop.
- Quick Add: neutral open/reset; all four modes saved in both mobile and desktop.
- Shopping: mobile item with estimate Rp200k, Feeding category and example.com URL;
  link click actually created an external tab; edit name; explicit purchase Rp150k
  and 2026-10-03; linked Expense shown exactly once.
- Expense editing: changed linked paid price to Rp175k; Shopping updated immediately.
- Reverse keep-history, then delete Shopping: Rp175k history remained. Desktop
  unknown estimate displayed a dash; explicit free purchase Rp0 was accepted;
  Bought edit to Rp100k updated its linked Expense; reverse-and-delete-expense
  removed that transaction; unbought item deletion confirmed.
- Manual Expense: mobile Rp25k, date, Medical category, selected local PNG receipt;
  saved in history; opened detail and receipt image; edited to Rp50k; confirmed delete.
  Desktop added Rp25k without category, edited to Rp35k and deleted with confirmation.
- Reconciliation checkpoints: Rp150k spent / Rp850k left / 15%; Rp200k spent /
  Rp800k left / 20% (Feeding Rp175k + Medical Rp25k); edited Rp225k / Rp775k /
  23%; deleted Expense restored Rp175k / Rp825k / 18%. Desktop Rp2m Budget
  with Rp175k history yielded Rp1.825m remaining / 9%.
- Tasks: mobile and desktop add; completed each; Checklist and Dashboard progressed
  0/1 → 1/1, then 1/2 → 2/2 with matching 0%, 100%, 50%, 100%.
- Appointments: mobile purpose/date/doctor/location/notes; quick 10:00; edit manual
  16:45; confirmed deletion. Desktop add without optional time; edit to 09:00;
  confirmed deletion. Cards reflected exact entered dates/times and no costs.
- Documents: mobile add Receipt with local PNG, view image (complete=true,
  naturalWidth=1 for the deliberate one-pixel fixture), edit title. Desktop view,
  edit, confirmed deletion; new desktop USG document/file and view. Dates optional.
- All six reachable screens inspected at all three widths. Ordinary-record document
  scroll width never exceeded viewport. The long-title case exposed QA-02 despite
  outer overflow hiding. Screenshots reviewed at key points.
- Native date fill in the browser controller changed the DOM value without committing
  React state. A real keyboard ArrowUp/ArrowDown change committed it and restored the
  intended date. This controller limitation was not classified as a product defect.
- Browser file picker had one unusually long response; subsequent picks completed.

### Remaining P2/P3 and decisions

- P2: English category/navigation/priority labels mixed with Indonesian.
- P2: tab title still Baby Preparation Dashboard.
- P2: mobile navigation uses Home selected state for Jadwal/Dokumen.
- P3: Task edit/delete unsupported; only add/toggle exists and was intentionally
  preserved by prior requirements. Adding CRUD needs product authorization.
- P3: no real pregnancy setup, profile, household membership, sharing, auth, cloud
  persistence or synchronization. These are explicitly unavailable in UI.
- Camera hardware capture is device-dependent and was not verified on physical
  hardware; Upload File and local image viewing were actually tested.
- PDF-specific preview and every document file format were not claimed as tested.

No ambiguous product decision blocks the three P1 fixes.

## Phase 2 — fixes and revalidation

During cross-record revalidation, another P1 was observed **before its correction**:
QA-04 — editing a linked Expense category to Medical correctly updates Shopping,
but Shopping Edit displayed Tanpa kategori because Medical was absent from its
options. Corrected by including the existing stored category when it is outside
the normal selector options. New-item category choices remain unchanged.

Total findings: P0 0; P1 4. Final revalidation results follow below.

### Corrections delivered

- QA-01: RecordActions closes its disclosure before Edit, Delete or the detail
  action. The shared fix applies to Shopping, Expenses, Appointments and Documents.
- QA-02: user content inherits overflow-wrap:anywhere from the application root.
  Long unbroken titles wrap within the existing card instead of clipping.
- QA-03: Dashboard separates current bought-item counts from historical shopping
  Expense spending and explicitly explains retained transactions.
- QA-04: Edit displays the record's stored category even when a linked Expense
  changed it to a category outside Shopping's normal new-item choices.

### Actual post-fix browser revalidation

- Shopping add with unknown estimate, edit, menu closed after save; next purchase
  click opened the correct form. Explicit Rp30k/date purchase created one Expense.
- Edited linked Expense to Medical; Shopping Edit selected Medical, and saving
  preserved it. Deleting the bought item preserved its Rp30k transaction.
- With no Shopping items, Dashboard clearly displayed historical Rp30k spending.
  Budget Rp100k reconciled to Rp30k spent, Rp70k remaining, 30%, Medical Rp30k.
- Expense history detail action worked and closed its action menu.
- Appointment added 2026-10-12 11:00, edited to 12:00, menu closed after save;
  confirmed delete returned to the empty state.
- Desktop Document uploaded local PNG, saved a 107-character unbroken title,
  edited/saved, and confirmed menu closed. Image viewer loaded the fixture
  (complete=true, naturalWidth=1). Deleted with confirmation on mobile.
- Long document title width/scroll width matched at mobile 390 (274/274), mobile
  430 (314/314); desktop document also had no horizontal overflow.
- Added/completed a task again: Checklist 1/1 and Dashboard 100% matched.
- Navigated all six screens again at 390, 430 and 1280. Document scroll widths
  were equal to available viewport widths on every screen; 6px scrollbar gutters
  reduced usable widths on long pages. Reviewed mobile and desktop screenshots.
- Browser error log: no errors captured.

Final observed P0: 0. Final observed P1: 0 in the exercised coverage.
P2/P3 and hardware/file-format limitations listed above remain unchanged.
No unresolved product decision blocks these fixes; Task CRUD and real pregnancy
setup remain future product scope, not implemented during this QA.

### Final automated validation

- npm test: exit 0; business logic 48 passed / 0 failed; UI integration groups
  24 passed / 0 failed (three focused regression groups added).
- npm run lint: exit 0; TypeScript tsc --noEmit passed.
- npm run build: exit 0; 1,681 modules transformed; production build succeeded.
  Existing Vite warning about __dirname and future native config loading remains.
- No Supabase, Auth, persistence or backend changes. Development preview remains
  running on port 3000; browser QA used the Codex in-app browser on this host.

Screenshots: tmp/qa/final-mobile-390.jpg, tmp/qa/final-mobile-430.jpg,
tmp/qa/final-desktop.jpg. All populated screenshots use synthetic QA records.
After capture, the isolated QA tab was reloaded to return to zero operational
records for human review; the user's original tab was not reloaded.
