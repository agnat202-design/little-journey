# Changelog

All notable changes to the Little Journey project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## 2026-10-05 — Appointment presentation
- Upcoming default with nearest first, including today; past dates latest first grouped by month, ten records per page.
- Add action moved above list; long notes expand; existing Edit/Delete/Schedule Again retained. Past date never implies completed visit. No database migration.

## 2026-10-05 — Current checkpoint
- Database persistence and private Storage activated by user; real records inspected read-only.
- Checklist Edit/Delete and compact category filter; unified Checklist wording; removed PIC placeholder and gestational task controls (04bc29d, fb08c0f).
- Appointment schedule-again and removed gestational controls (b2c5e05).
- Shopping removed gestational controls and clarified planned purchase timing (a4860d8).
- Profile email/family/child names (769b195).
- Simplified Indonesian Expense categories, age-inclusive child label (1338b8a, c42aba8).
- Monthly HTML preview/PDF and JSON record export (381d19c, 08bc89c).
- Budget unrealized plans wording (3a395d6).
- Stale login feedback cleared, top auth bar removed, logout in Profile (f64bbb6).
- Refreshed status/product/architecture/database/QA/roadmap documentation; archived previous design/audit copies.
- Push does not prove latest Cloudflare deployment; no email automation/Android/subscription/import created.

## Historical checkpoint — 2026-10-02

### Added
- **Phase 0.8.2 Budget Input, Setup & Hierarchy Architecture**:
  - Implemented user-facing "Atur Budget" setup flow (`/src/components/modals/BudgetSetupModal.tsx`) allowing parents to input source Total Preparation Budget and optional planning envelope category allocations (Hospital / Delivery, Medical, Baby Gear, Feeding, Sleeping, Baby clothing, Mother, Travel, Other).
  - Enforced strict core accounting principle: Users INPUT source budget & transactions; application DERIVES all financial summaries (Actual Paid, Committed, Outstanding, Projected Final, Projected Buffer, Remaining Budget).
  - Implemented First-Time Empty State in `BudgetView.tsx` when `totalBudget === 0`: shows friendly onboarding prompt ("Yuk atur budget Little Journey", "Tentukan batas budget agar pengeluaran dan rencana belanja bisa dipantau otomatis", `[Atur Budget]`) without fake mock assumptions.
  - Re-architected mobile Budget information hierarchy for 3-second comprehension:
    1. Actual Paid
    2. Total Budget
    3. Remaining Budget (Sisa Plafon)
    4. Committed costs
    5. Outstanding obligations
    6. Projected Final
    7. Projected Buffer
  - Implemented `calculateEnvelopeSummary` in `/src/lib/businessLogic.ts` displaying real-time allocated envelope vs unallocated flexible reserve amounts without requiring rigid parity.
  - Moved detailed accounting explanations & cash reconciliation into a secondary collapsible section ("Detail Keuangan & Rekonsiliasi Kas").
  - Added Test 6 to `/src/lib/businessLogic.test.ts` verifying total budget setting, category envelope allocation, partial payment modeling (Hospital Rp20m with Rp5m deposit = Committed Rp20m, Actual Rp5m, Outstanding Rp15m, Projected Rp20m), and empty state handling (48/48 unit tests passing).
- **Phase 0.8.1 Wishlist & Budget Financial Reconciliation & Real-Time Sync**:
  - Resolved discrepancy between Shopping Wishlist and Household Budget when all items are marked as bought.
  - Added quantity multiplier (`item.quantity || 1`) to `calculateBudget` in `/src/lib/businessLogic.ts` for accurate total procurement calculation.
  - Fixed swaddle expense ledger amount to Rp 600.000 (2 sets x Rp 300.000) to perfectly align with shopping item data.
  - Implemented `calculateCategoryBreakdown` in `/src/lib/businessLogic.ts`, making category spending in `BudgetView.tsx` dynamically reactive to shopping item state changes (e.g. marking Car Seat or Crib as Bought instantly updates Travel & Sleeping categories).
  - Re-architected `/src/components/views/ShoppingView.tsx` with a 3-metric financial overview (Sudah Dibelanjakan, Sisa Wishlist, Target Plafon Wishlist) and an explicit financial reconciliation banner explaining store promo savings (Target Rp 18.6m vs Realisasi Rp 17.8m = Hemat Rp 800rb).
  - Added Household Cashflow Bridge banner in `ShoppingView` and `BudgetView` connecting Shopping Wishlist spending (Rp 17.800.000) and Hospital Delivery DP (Rp 4.000.000) to Total Actual Paid (Rp 21.800.000).
  - Enhanced status filter tabs with live item count badges (Semua, Belum Dibeli, Sudah Dibeli, Wishlist, Direncanakan, Riset Harga).
  - Added Test 5 to automated test suite `/src/lib/businessLogic.test.ts` (34 passing assertions).
- **Phase 0.8 Architecture V2 Patch — Little Journey (Pregnancy → Age 5)**:
  - Transitioned product platform architecture from "Baby Preparation Dashboard" to "Little Journey" spanning Pregnancy through age 5 while keeping current MVP focused on Pregnancy Preparation.
  - Introduced `Child` domain entity and `JourneyStage` lifecycle union (`'pregnancy' | 'birth' | 'newborn' | 'infant' | 'toddler' | 'preschool'`) in `/src/types/domain.ts`.
  - Decoupled generic operational modules (Checklist, Shopping, Expenses, Appointments, Documents, Milestones) from mandatory pregnancy-specific fields.
  - Implemented `JourneyHero` architectural seam in `/src/components/dashboard/JourneyHero.tsx`, rendering `PregnancyHero` for active pregnancy stage.
  - Refactored `calculateBudget` in `/src/lib/businessLogic.ts` to implement single-source-of-truth financial rules, supporting partial payments (e.g. Hospital package Rp25m with Rp5m paid deposit => Outstanding Rp20m, Projected Cost Rp25m, avoiding double-counting).
  - Cleaned unused dependencies (`@google/genai`, `dotenv`, `express`, `@types/express`) from `package.json`.
  - Updated automated test suite in `/src/lib/businessLogic.test.ts` to 28 passing assertions.
  - Recorded ADR-009 (Pregnancy-to-Age-5 Lifecycle Architecture) in `DECISIONS.md`.
  - Documented Proposed Schema V2 in `DATABASE.md` and updated `ROADMAP.md` to Roadmap V2.
- **Phase 0.7 Frontend UX QA & Logic Validation**:
  - Implemented `/src/lib/businessLogic.ts` and automated test suite `/src/lib/businessLogic.test.ts` (26 assertions passing).
  - Enforced locked budget business definitions (`TOTAL BUDGET`, `PLANNED`, `COMMITTED`, `ACTUAL SPENT`, `REMAINING BUDGET`, `PROJECTED FINAL COST`, `PROJECTED BUFFER`) with single-source-of-truth zero double-counting prevention.
  - Implemented Desktop Sidebar Navigation (`/src/components/layout/DesktopSidebar.tsx`) with `+ Catat Cepat` action button and multi-column dashboard composition for viewports `>= 1024px`.
  - Added full views for `TimelineView`, `AppointmentsView`, and `DocumentsView`.
  - Fixed mobile horizontal filter overflow on `ShoppingView` and `ChecklistView` with non-shrinking labels, smooth touch scrolling, and zero text clipping across 360px, 375px, 390px, and 430px viewports.
  - Standardized Quick Add terminology to: `Belanja` (shopping), `Pengeluaran` (expenses), `Tugas` (checklist tasks), and `Jadwal` (appointments).
  - Removed development-only prototype controls (`Prototype Desain Visual`, viewport dimension buttons, dev onboarding shortcut) in favor of native responsive behavior.
- **Design Direction & Visual Exploration Prototype**:
  - Implemented design tokens in `/src/design/tokens.ts` (Soft digital objects, `#FCFBF8` canvas, `#34236B` deep purple, `#6C4CF5` vibrant purple, `#52D6C7` mint aqua, `#FFD45A` sunny yellow, `#FF786A` coral).
  - Designed "Pip" The Little Starlight Cloud original mascot (`/src/components/mascot/PipMascot.tsx`) with mood states (`happy`, `celebrate`, `waving`, `sleeping`, `proud`, `curious`).
  - Added Nunito font family to `index.html` and `src/index.css`.
  - Built interactive 5-step Mobile Onboarding Flow (`/src/components/onboarding/MobileOnboardingFlow.tsx`).
  - Built Mobile Home Dashboard (`/src/components/views/DashboardView.tsx`) with gestational progress, Papaya fruit size, Next Up cards, readiness progress, and IDR financial pulse.
  - Built Preparation Checklist View (`/src/components/views/ChecklistView.tsx`) with 12 domain categories, week filters, and tactile check states.
  - Built Shopping Wishlist View (`/src/components/views/ShoppingView.tsx`) with 7-stage statuses, price difference tags, and buy actions.
  - Built Budget View (`/src/components/views/BudgetView.tsx`) with 3-second comprehension metrics and category expense cards.
  - Built Quick Add Bottom Sheet (`/src/components/modals/QuickAddBottomSheet.tsx`) with mobile touch inputs.
  - Built Viewport Frame Switcher (`390px` primary, `360px`, `430px`, `Full`) for instant mobile testing.
  - Documented ADR-007 (Mobile-First Consumer App Design) and ADR-008 (Playful Premium Family Visual Language) in `DECISIONS.md` and updated `UX.md`.
- **Phase 0 System Architecture & Specifications**:
  - Defined 12 checklist domains and 7-stage shopping pipeline.
  - Architected 10-table PostgreSQL schema for Supabase with Row Level Security (RLS).
  - Drafted comprehensive desktop and mobile wireframes adhering to warm neutral visual principles.
- **Persistent Documentation Suite (`/docs`)**:
  - `/docs/PROJECT.md`: Project snapshot, core modules, tech stack, and AI instructions.
  - `/docs/ARCHITECTURE.md`: Frontend, Supabase, and edge deployment topology.
  - `/docs/DATABASE.md`: Schema tables, field definitions, performance indexes, and RLS policies.
  - `/docs/UX.md`: Design principles, IA, desktop and mobile responsive specs.
  - `/docs/ROADMAP.md`: Checkbox-based milestone tracking across Phases 0–5.
  - `/docs/DECISIONS.md`: Initial Architecture Decision Records (ADR-001 through ADR-006).
  - `/docs/CHANGELOG.md`: Historical change log tracking milestones.
- **Project Metadata**:
  - Configured `metadata.json` and `index.html` headers with the official project name and description.

### Upload foto — 5 Oktober 2026
Foto JPG/PNG/WebP baru di atas 400 KB diperkecil sebelum upload (sisi terpanjang maksimal 2200 px, target sekitar 600 KB; hasil bergantung isi foto). File kecil dan PDF tetap asli. Daftar menampilkan jenis dan ukuran, bukan nama panjang. Teks prototipe lokal di Dokumen dihapus. Penggantian tetap menyimpan metadata baru sebelum menghapus file lama; kegagalan cleanup diberi peringatan. Foto lama tidak dikompres ulang.

- 5 Oktober 2026: tombol Tambah Checklist selalu tersedia di atas filter kategori, termasuk saat daftar sudah berisi. Menggunakan alur tambah checklist yang sama.
