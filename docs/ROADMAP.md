# Development Roadmap V2 (Little Journey)

> Current roadmap (4 October 2026): see [PRM.md](PRM.md). Frontend QA,
> GitHub baseline, Cloudflare hosting, schema/RLS and Google Auth implementation
> are complete. Household onboarding, operational persistence and private
> attachment storage are implemented in source; migration activation and live
> save/reload acceptance remain pending.
> The phase checklist below is historical and superseded by PRM.md.

Status Legend:
- `[x]` Completed
- `[~]` In Progress
- `[ ]` Pending

---

## Foundation
- [x] Phase 0.0 Product Architecture & Scope
- [x] Phase 0.5 Persistent Documentation Repository (`/docs`)
- [x] Phase 0.6 Visual Prototype & Original Pip Mascot
- [x] Phase 0.7 Frontend Prototype + QA (Horizontal filter fix, locked terminology, 2-column desktop composition)
- [x] Phase 0.8 Architecture V2 — Pregnancy → Age 5 (Decoupled lifecycle, Child entity, JourneyHero seam, zero double-counting budget model, 28/28 tests passing)
- [ ] Phase 0.9 Architecture Review / Approval

---

## MVP — Pregnancy Preparation
- [ ] Phase 1 Supabase Schema + RLS (Proposed Schema V2: `profiles`, `households`, `household_members`, `children`, `pregnancies`, `checklist_items`, `shopping_items`, `expenses`, `appointments`, `documents`, `milestones`)
- [ ] Phase 2 Authentication + Household Multi-User Sync
- [ ] Phase 3 Real Data Integration (Supabase client singleton & real-time subscriptions)
- [ ] Phase 4 Pregnancy MVP Feature Completion
- [ ] Phase 5 Production QA & Cross-Browser Verification
- [ ] Phase 6 Cloudflare Pages Production Deployment

---

## Post-MVP (Future Lifecycle Stages)
- [ ] Birth Transition Module
- [ ] Newborn Stage (0–3 Months)
- [ ] Infant Stage (3–12 Months)
- [ ] Toddler Stage (1–3 Years)
- [ ] Preschool Stage (3–5 Years)
