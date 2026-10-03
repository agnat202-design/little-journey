> Current frontend status (3 October 2026): see [DATA_PROVENANCE.md](DATA_PROVENANCE.md). The older specification below describes historical designs or future plans, not implemented accounts, sharing, synchronization or real household data. Current lists start empty; pregnancy is an explicitly labeled demo. Timeline, Settings and onboarding prototypes have been removed.

# Little Journey — Project Snapshot

## 1. Project Goal
**Little Journey** is a private, warm, family journey application guiding parents from pregnancy preparation through birth and early childhood (approximately age 5). It replaces scattered spreadsheets, disconnected note apps, and mental fatigue with a single real-time household space.

- **Product Platform**: Little Journey
- **Current MVP Scope**: Pregnancy Preparation (Trimester 2 until delivery)
- **Future Lifecycle Scope**: Birth Transition, Newborn (0–3m), Infant (3–12m), Toddler (1–3y), Preschool (3–5y)

---

## 2. Core Domain Model (Architecture V2)
The application is **HOUSEHOLD-centric** and **CHILD/JOURNEY-aware**:

```
HOUSEHOLD
├── Household Members (Parents / Guardians)
├── Children (Future-compatible multi-child support)
└── Journeys & Lifecycle Stages
    ├── Pregnancy (Active MVP Stage)
    ├── Birth (Future Stage)
    ├── Newborn (Future Stage)
    ├── Infant (Future Stage)
    ├── Toddler (Future Stage)
    └── Preschool (Future Stage)
         ├── Tasks / Checklist
         ├── Shopping / Procurement
         ├── Expenses / Financial Obligations
         ├── Appointments / Healthcare
         ├── Documents / Vault
         └── Milestones
```

**Key Architectural Rule**: Pregnancy is ONE lifecycle stage within Little Journey, NOT the hardcoded root of all application data. Generic operational modules (Checklist, Shopping, Expenses, Appointments, Documents) are decoupled from pregnancy-specific concepts.

---

## 3. Tech Stack
- **Frontend Framework**: React 19 (SPA)
- **Build Tool**: Vite 8
- **Language**: TypeScript 5+ (Strict mode)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) with custom soft digital object tokens
- **Icons**: Lucide React
- **Animations**: Motion (micro-interactions)
- **Database / Auth / Storage (Target)**: Supabase (PostgreSQL 15+ with Row Level Security)
- **Hosting / Edge (Target)**: Cloudflare Pages
- **Repository**: GitHub

---

## 4. Locked Budget Business Formulas (Zero Double-Counting)

- **TOTAL BUDGET**: Maximum household budget allocated for the stage/journey.
- **ESTIMATED / PLANNED**: Expected future cost of unpurchased needs still in planning/wishlist without an active expense ledger record.
- **COMMITTED**: Financial obligations contracted or ordered (e.g. booked hospital package, ordered stroller) not yet fully settled.
- **ACTUAL PAID**: Money actually paid out in cash/transfer (primary financial source of truth).
- **OUTSTANDING**: Committed contract amount remaining to be paid (`committedTotal - paidDeposit`).
- **PROJECTED FINAL COST**: `Actual Paid + Outstanding Commitments + Estimated Planned`.
  - *Example*: Hospital estimate Rp 25.000.000, booked at Rp 25.000.000 with Rp 5.000.000 deposit paid.
  - `Actual Paid` = Rp 5.000.000, `Outstanding` = Rp 20.000.000.
  - Total projected for hospital = `Rp 5.000.000 + Rp 20.000.000 = Rp 25.000.000` (NEVER counted as Rp 30.000.000).
- **PROJECTED BUFFER**: `Total Budget - Projected Final Cost`.
- **REMAINING BUDGET**: `Total Budget - Actual Paid` (Remaining budget headroom from allocated ceiling).
- **Shopping ➔ Expense Linking**: When a shopping item transitions to `Bought` and links to an expense ledger entry (`expenses.shopping_item_id`), its expenditure is solely accounted for by the expense record.

---

## 5. Development Status & Roadmap
- **Current Phase**: Phase 0.8.2 Budget Input & Setup Complete
- **Completed Phases**:
  - Phase 0.0: Initial Product Requirements & Scope
  - Phase 0.5: Persistent Documentation Suite
  - Phase 0.6: Approved Visual Direction (Soft digital objects, `#34236B`, `#6C4CF5`, Pip Mascot, Indonesian Rupiah data)
  - Phase 0.7: Frontend UX QA & Logic Validation
  - Phase 0.8: Architecture V2 Patch (Decoupled lifecycle, Child entity, JourneyHero seam, zero double-counting budget model)
  - Phase 0.8.1: Wishlist & Budget Financial Reconciliation & Real-Time Sync
  - Phase 0.8.2: Budget Input, Setup & Hierarchy Architecture (48/48 tests passing)
- **Current Task**: Present Budget Setup & Hierarchy Architecture Report and await human review/approval.
- **Next Task**: Phase 0.9 Architecture Review ➔ Phase 1 Supabase Configuration & Relational Schemas.

---

## 6. Important Architectural Decisions
- **ADR-001**: Supabase as backend for DB, Auth, and Storage.
- **ADR-002**: React + Vite + TypeScript frontend.
- **ADR-003**: Cloudflare Pages deployment.
- **ADR-004**: Household-based multi-user architecture.
- **ADR-005**: Zero AI/LLM API in MVP (deterministic medical & financial calculation).
- **ADR-006**: Mobile-first responsive UX with desktop sidebar parity.
- **ADR-007**: Mobile-first consumer app design.
- **ADR-008**: Playful premium family visual language.
- **ADR-009**: Pregnancy-to-Age-5 Lifecycle Architecture (Little Journey platform model).

---

## 7. Known Issues & Technical Debt
- *None.* Automated tests (28/28 assertions) and production builds pass cleanly.
