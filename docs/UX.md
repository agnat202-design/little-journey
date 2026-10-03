> Current frontend status (3 October 2026): see [DATA_PROVENANCE.md](DATA_PROVENANCE.md). The older specification below describes historical designs or future plans, not implemented accounts, sharing, synchronization or real household data. Current lists start empty; pregnancy is an explicitly labeled demo. Timeline, Settings and onboarding prototypes have been removed.

# User Experience & Design Specification (Little Journey)

## 1. Locked Visual Direction: "Kids-App Friendliness + Adult Financial Clarity + Premium Consumer Polish"

The visual direction has been reviewed, approved, and **LOCKED**:
- **Palette**: Warm Off-White (`#FCFBF8`), Primary Deep Purple (`#34236B`), Secondary Vibrant Purple (`#6C4CF5`), Mint/Aqua (`#52D6C7`), Sunny Yellow (`#FFD45A`), Coral (`#FF786A`), and soothing pastel tints (`#EEE9FF`, `#E7FAF5`, `#FFF0E9`).
- **Surfaces**: Soft digital objects with 20px–32px radii, pill controls, and diffuse ambient shadows (`0 8px 24px -4px rgba(41, 36, 66, 0.06)`).
- **Typography**: Clean rounded modern sans-serif (`Nunito`). Large, clear Indonesian Rupiah figures (`Rp 12.450.000` / `Rp 12,4 jt`).
- **Mascot**: "Pip" The Little Starlight Cloud—an original vector SVG companion offering emotional celebrations and gentle tips at key milestones without hindering productivity.

---

## 2. Mobile-First — Critical Requirement

- **Primary Target Viewport**: `390px × 844px` (tested across 360px, 375px, 390px, and 430px).
- **Zero-Friction Thumb Interactions**:
  - Touch targets exceed 44px × 44px.
  - Sticky bottom navigation and bottom sheets.
  - Touch-friendly horizontal carousels with zero text clipping and hidden scrollbars.

---

## 3. Desktop Responsive Experience (>= 1024px)

While mobile-first is strictly enforced, the application expands gracefully onto desktop screens without stretching into giant mobile cards:
- **Desktop Sidebar Navigation**:
  - Displays Little Journey branding, active gestational week pill (`W22 • D4`), household status, and navigation links (`Home`, `Checklist`, `Shopping`, `Budget`, `Timeline`, `Appointments`, `Documents`, `Settings`).
  - Contains a prominent `+ Catat Cepat` action button replacing the mobile floating button.
- **Top Header Bar**:
  - Displays parental greeting, household code (`BBY-772`), and partner avatars.
- **Multi-Column Dashboard Composition**:
  - Left column (7 columns): Journey Hero Card, Budget Pulse with large formatted numbers, and Preparation Readiness progress.
  - Right column (5 columns): Next Up appointments/purchases, Actionable Checklist items with instant completion toggles, and Pip Companion tip widget.
- **Mobile Bottom Navigation**:
  - Automatically hidden on screens ≥ 1024px (`lg:hidden`).

---

## 4. JourneyHero Architectural Seam

The dashboard hero card is decoupled from hardcoded pregnancy assumptions:
```
JourneyHero
  ├── PregnancyHero (Active in MVP — Week 22, 122 days countdown, Papaya fruit comparison)
  ├── NewbornHero (Future lifecycle stage)
  ├── InfantHero (Future lifecycle stage)
  ├── ToddlerHero (Future lifecycle stage)
  └── PreschoolHero (Future lifecycle stage)
```
In the current MVP, `JourneyHero` renders the approved `PregnancyHero` without altering any visual elements.

---

## 5. Stage-Aware Quick Add ("Catat Cepat")

The universal Quick Add action offers 4 standard options:
1. **`Belanja`** ➔ `shopping_items`
2. **`Pengeluaran`** ➔ `expenses`
3. **`Tugas`** ➔ `checklist_items`
4. **`Jadwal`** ➔ `appointments`

**Contextual Timing**:
- When `activeStage === 'pregnancy'`, the form contextually presents an optional **Target Minggu Kehamilan** selector.
- In future post-birth stages, this pregnancy-specific field is omitted, keeping data entry fast and relevant.

---

## 6. Budget Input, Setup & 3-Second Information Hierarchy

### A. Source Data Separation vs. Derived Values
- **Users Input**:
  - Total Preparation Budget via the "Atur Budget" setup modal.
  - Optional Planning Envelopes (Category Allocations).
  - Actual expense payments (cash outflow) and shopping wishlist items.
- **System Derives**:
  - `Actual Paid`, `Committed`, `Outstanding`, `Estimated Planned`, `Projected Final`, `Projected Buffer`, `Remaining Budget`.
  - Manual editing of these calculated totals is strictly prevented.

### B. First-Time Empty State
- When `totalBudget === 0`, fake mock numbers are hidden.
- The user is greeted with a friendly, welcoming prompt:
  - *"Yuk atur budget Little Journey"*
  - *"Tentukan batas budget agar pengeluaran dan rencana belanja bisa dipantau otomatis."*
  - Prominent `[Atur Budget]` action button.

### C. 3-Second Mobile Information Hierarchy
1. **Actual Paid**: Large hero currency metric.
2. **Total Budget**: Allocated maximum ceiling.
3. **Remaining Budget**: Mint highlighted available cash headroom.
4. **Committed**: Legally or operationally contracted orders.
5. **Outstanding**: Unsettled obligations on commitments (`committed - deposit`).
6. **Projected Final**: `Paid + Outstanding + Planned` (without double-counting).
7. **Projected Buffer**: Safety margin under total ceiling.

### D. Planning Envelopes (Category Allocations)
- Categories (Hospital / Delivery, Medical, Baby Gear, Feeding, Sleeping, Baby Clothing, Mother, Travel, Other) are planning envelopes, NOT expenses.
- Clear distribution gauge shows **Teralokasi** vs **Belum Teralokasi (Fleksibel)**.
- Detailed accounting and cashflow reconciliation are moved to a secondary collapsible section ("Detail Keuangan & Rekonsiliasi Kas").

