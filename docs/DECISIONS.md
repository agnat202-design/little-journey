> Current decisions 5 October 2026: household/Expense source-of-truth and private attachments retained; five optional Indonesian Expense categories; no gestational week inputs on operational forms; age-inclusive child terminology; current report snapshots explicitly labeled; PDF and JSON client exports omit binary attachments; Free plan retained without project backup; Play Store/subscriptions/English and automated email deferred. Earlier ADRs are historical proposals; references to realtime/milestones/zero operating cost are not implemented guarantees. [Current architecture](ARCHITECTURE.md).

# Architecture Decision Records (ADR)

This file maintains records of architectural decisions made for the Baby Preparation Dashboard project.

---

### ADR-001: Supabase as Backend
- **Status**: Accepted
- **Context**: The application requires relational data integrity (10 interconnected tables), user authentication for two partners, file storage for medical and birth plan documents, and real-time updates.
- **Decision**: Adopt Supabase (PostgreSQL 15+, Supabase Auth, Supabase Storage, and PostgREST) as the unified backend service.
- **Consequences**:
  - Eliminates the need to maintain custom server infrastructure or APIs.
  - Leverages battle-tested PostgreSQL Row Level Security (RLS) for data privacy.
  - Generous free-tier handles household workload at $0 operating cost.

---

### ADR-002: React, Vite, and TypeScript Frontend
- **Status**: Accepted
- **Context**: The dashboard requires fast response times, rich client-side interactivity (week calculations, budget aggregations, pipeline toggles), and strict type safety.
- **Decision**: Use a modern Single Page Application (SPA) built with React 19, TypeScript, and Vite.
- **Consequences**:
  - Near-instant local builds and tiny production bundle sizes.
  - Full type safety across Supabase schema models and UI view states.
  - Direct compatibility with edge hosting without Node.js server dependencies.

---

### ADR-003: Cloudflare Pages Deployment
- **Status**: Accepted
- **Context**: Expectant parents need high availability, instant load times on mobile connections, and zero ongoing server maintenance costs.
- **Decision**: Target Cloudflare Pages for continuous production deployments from GitHub.
- **Consequences**:
  - Global CDN edge caching delivers sub-second initial paint.
  - Free tier includes unlimited bandwidth and builds.
  - Static SPA routing handled cleanly via standard `_redirects`.

---

### ADR-004: Household-Based Multi-User Architecture
- **Status**: Accepted
- **Context**: Expectant parents prepare together. Husband and wife must see identical data, while distinct households must have complete data isolation.
- **Decision**: Implement a first-class `household_id` concept on all operational tables. Access is controlled via PostgreSQL RLS using a security-definer helper `is_member_of_household()`. Users join via a unique household invite code.
- **Consequences**:
  - Zero cross-household data leakage.
  - Seamless collaboration between partners without complex enterprise permissions.
  - Simplified query structure: every query is filtered or scoped by the active household.

---

### ADR-005: No AI / LLM API in MVP
- **Status**: Accepted
- **Context**: Baby preparation relies on deterministic medical schedules, verifiable budget numbers, and direct human decisions. Unconstrained LLM generation risks hallucinated medical advice and unnecessary API subscription costs.
- **Decision**: Exclude AI chatbots, assistants, or runtime LLM calls from the MVP scope. Use curated, evidence-based gestational milestone templates and deterministic mathematical calculators instead.
- **Consequences**:
  - Prevents medical misinformation and builds user trust.
  - Operating cost remains zero.
  - Streamlines UI and eliminates token latency.

---

### ADR-006: Mobile-First Responsive Design
- **Status**: Accepted
- **Context**: Expectant parents frequently add shopping items in stores, check checklists in nursery rooms, or review appointment details at doctor clinics.
- **Decision**: Design primarily for mobile viewports (bottom tab navigation, 44px+ touch targets, single-column dashboard cards) while offering an expanded desktop view (collapsible sidebar, multi-column dashboard grid).
- **Consequences**:
  - Eliminates desktop-only layout friction on mobile devices.
  - Quick-Add modal is optimized for 1-hand thumb operation.
  - Calming, warm neutral aesthetic adapts seamlessly across all screen sizes.

---

### ADR-007: Mobile-First Consumer App Design
- **Status**: Accepted
- **Context**: The primary device for both husband and wife is their smartphone (390px × 844px target viewport). Traditional desktop-derived dashboards feel alien, cold, and slow on phones.
- **Decision**: Prioritize a native-app-like consumer mobile interface. Desktop is an adaptive secondary view that expands horizontally, but mobile patterns (bottom sheets, bottom nav, chunky pill buttons, large touch targets ≥ 44px) strictly dictate the information architecture.
- **Consequences**:
  - Instant familiarity and comfortable one-handed thumb navigation.
  - Zero dense desktop tables on small viewports.
  - Quick-entry actions happen in comfortable bottom sheets rather than floating desktop modals.

---

### ADR-008: Playful Premium Family Visual Language
- **Status**: Accepted
- **Context**: Pregnancy preparation can induce anxiety, spreadsheet fatigue, and emotional overwhelm. Clinical hospital aesthetics or corporate B2B SaaS patterns exacerbate stress.
- **Decision**: Adopt a fresh, playful, fluffy, contemporary visual language inspired by world-class modern family/kids apps (large 20–32px radii, pill controls, warm off-white `#FCFBF8`, deep purple `#34236B`, vibrant purple `#6C4CF5`, mint `#52D6C7`, sunny yellow `#FFD45A`, and coral `#FF786A`), coupled with an original mascot ("Pip" the Starlight Cloud) for emotional celebration.
- **Consequences**:
  - Maintains strict adult financial clarity (large, readable Indonesian Rupiah numbers, planned vs. spent) without childish novelty.
  - Creates a joyful, supportive atmosphere for both husband and wife.
  - Completely original visual assets without copying any third-party brands or mascots.

---

### ADR-009: Pregnancy-to-Age-5 Lifecycle Architecture
- **Status**: Accepted
- **Context**: Expectant parents continue using digital organization tools as their child grows (birth, newborn, infancy, toddlerhood, and preschool up to age 5). Hardcoding gestational week or pregnancy as the root of all tables would force a painful database migration and application rewrite after childbirth.
- **Decision**: Architect Little Journey as a household-centric, child-aware lifecycle platform spanning Pregnancy through approximately age 5.
  - Current MVP scope remains strictly Pregnancy Preparation.
  - Generic modules (Checklist, Shopping, Expenses, Appointments, Documents, Milestones) do NOT enforce pregnancy-specific fields.
  - Stage-specific concepts (e.g. `targetGestationalWeek`) are optional context properties.
  - Dashboard heroes are architected behind a `JourneyHero` seam (`PregnancyHero` currently active).
- **Consequences**:
  - Zero database migration headaches when the family transitions from pregnancy to newborn care.
  - Zero disruption to the approved Pregnancy MVP experience.
  - Future lifecycle modules (Birth, Newborn, Infant, Toddler, Preschool) can plug into existing operational tables without schema rewrites.

---

### ADR-010: Budget Setup & Derived Financial Calculation Architecture
- **Status**: Accepted
- **Context**: Users must have a clean, explicit way to define preparation budgets without manual manipulation of derived accounting metrics (Actual Paid, Committed, Outstanding, Projected Final, Projected Buffer, Remaining Budget). Furthermore, category allocations act as planning envelopes, not actual transactions, and must support unallocated flexible funds.
- **Decision**:
  - Strict separation between source inputs (Total Budget, Category Envelopes, Expense Records, Shopping Orders) and derived calculations.
  - Users input: Total Preparation Budget via "Atur Budget" modal, optional planning envelope allocations, and transaction records.
  - System derives: All summary metrics and category progress deterministically via `calculateBudget`, `calculateEnvelopeSummary`, and `calculateCategoryBreakdown`.
  - First-time empty state: When `totalBudget === 0`, show an onboarding prompt without fake data assumptions.
  - 3-Second mobile hierarchy: 1. Actual Paid, 2. Total Budget, 3. Remaining Budget, 4. Committed, 5. Outstanding, 6. Projected Final, 7. Projected Buffer.
- **Consequences**:
  - Eliminates spreadsheet errors and user confusion.
  - Supports partial payments (e.g. hospital deposit) and prevents double-counting.
  - Preserves adult financial rigor within a joyful, approachable consumer interface.


