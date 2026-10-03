# Proposed Database Schema V2 (Little Journey)

*Status: PROPOSED SCHEMA SPECIFICATION ONLY. No tables have been created or modified in Supabase yet.*

---

## 1. Domain Entities & Table Definitions

The schema establishes a household-centric, child-aware lifecycle model. All operational records belong to `household_id`, with optional association to a `child_id` and `stage`.

```
profiles
households
household_members
children ──────────┐ (Optional 1:M link)
pregnancies        │
                   ├── checklist_items
                   ├── shopping_items
                   ├── expenses
                   ├── appointments
                   ├── documents
                   └── milestones
```

---

### 1.1 `profiles`
User metadata extending `auth.users`.
- `id` (uuid, PK, references `auth.users.id` on delete cascade)
- `full_name` (text, not null)
- `avatar_url` (text, nullable)
- `role` (text, check in `'parent'`, `'partner'`, `'admin'`)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

### 1.2 `households`
Top-level multi-tenant household container.
- `id` (uuid, PK, default `uuid_generate_v4()`)
- `name` (text, not null) — e.g. "Keluarga Agung & Sarah"
- `invite_code` (text, unique, not null) — 6-character alphanumeric pairing code
- `currency` (text, default `'IDR'`)
- `total_budget` (numeric(14,2), default 0.00)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 1.3 `household_members`
User membership within a household.
- `id` (uuid, PK)
- `household_id` (uuid, FK ➔ `households.id` on delete cascade)
- `user_id` (uuid, FK ➔ `profiles.id` on delete cascade)
- `role` (text, check in `'owner'`, `'member'`)
- `created_at` (timestamptz)
- *Constraint*: `UNIQUE(household_id, user_id)`

### 1.4 `children` *(New in Architecture V2)*
Child domain entity decoupling the app from single-pregnancy termination.
- `id` (uuid, PK)
- `household_id` (uuid, FK ➔ `households.id` on delete cascade)
- `display_name` (text, not null) — e.g. "Baby K"
- `birth_date` (date, nullable) — populated upon birth
- `due_date` (date, nullable) — initial gestational reference
- `gender` (text, check in `'boy'`, `'girl'`, `'surprise'`, `'undisclosed'`)
- `current_stage` (text, default `'pregnancy'` check in `'pregnancy'`, `'birth'`, `'newborn'`, `'infant'`, `'toddler'`, `'preschool'`)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 1.5 `pregnancies`
Dedicated entity for pregnancy tracking.
- `id` (uuid, PK)
- `household_id` (uuid, FK ➔ `households.id` on delete cascade)
- `child_id` (uuid, FK ➔ `children.id` on delete set null, nullable)
- `due_date` (date, not null)
- `lmp_date` (date, nullable)
- `status` (text, default `'active'` check in `'active'`, `'completed'`, `'archived'`)
- `notes` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)
*Note: Gestational week, day, trimester, and countdown are DERIVED at runtime from `due_date`.*

---

## 2. Generic Lifecycle-Capable Operational Modules

Operational entities include optional `child_id` and optional `stage`. Gestational week is an optional property and does NOT constrain non-pregnancy stages.

### 2.1 `checklist_items`
- `id` (uuid, PK)
- `household_id` (uuid, FK ➔ `households.id` on delete cascade)
- `child_id` (uuid, FK ➔ `children.id` on delete set null, nullable)
- `stage` (text, default `'pregnancy'`)
- `name` (text, not null)
- `category` (text, not null)
- `priority` (text, default `'Medium'` check in `'High'`, `'Medium'`, `'Low'`)
- `status` (text, default `'Pending'` check in `'Pending'`, `'In Progress'`, `'Completed'`, `'Skipped'`)
- `assigned_to` (uuid, FK ➔ `profiles.id` on delete set null, nullable)
- `target_gestational_week` (integer, nullable) — *Pregnancy-specific timing*
- `target_date` (date, nullable) — *Calendar timing*
- `target_age_months` (integer, nullable) — *Post-birth milestone timing*
- `notes` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 2.2 `shopping_items`
- `id` (uuid, PK)
- `household_id` (uuid, FK ➔ `households.id` on delete cascade)
- `child_id` (uuid, FK ➔ `children.id` on delete set null, nullable)
- `stage` (text, default `'pregnancy'`)
- `item` (text, not null)
- `category` (text, not null)
- `brand` (text)
- `model` (text)
- `quantity` (integer, default 1)
- `priority` (text, default `'Medium'` check in `'High'`, `'Medium'`, `'Low'`)
- `target_price` (numeric(14,2), default 0.00)
- `current_price` (numeric(14,2), default 0.00)
- `actual_price` (numeric(14,2), nullable)
- `store` (text)
- `product_url` (text)
- `image_url` (text)
- `target_gestational_week` (integer, nullable)
- `target_date` (date, nullable)
- `status` (text, default `'Wishlist'` check in `'Research'`, `'Wishlist'`, `'Planned'`, `'Ordered'`, `'Bought'`, `'Received'`, `'Skip'`)
- `notes` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 2.3 `expenses` (Primary Financial Source of Truth)
- `id` (uuid, PK)
- `household_id` (uuid, FK ➔ `households.id` on delete cascade)
- `child_id` (uuid, FK ➔ `children.id` on delete set null, nullable)
- `stage` (text, default `'pregnancy'`)
- `shopping_item_id` (uuid, FK ➔ `shopping_items.id` on delete set null, nullable) — *Prevents double-counting with procurement pipeline*
- `category` (text, not null)
- `title` (text, not null)
- `total_amount` (numeric(14,2), default 0.00) — *Contract or estimated total (e.g. Hospital booking package Rp 25.000.000)*
- `paid_amount` (numeric(14,2), default 0.00) — *Actual cash paid out so far (e.g. Deposit Rp 5.000.000)*
- `payment_status` (text, default `'Paid'` check in `'Unpaid'`, `'Partially Paid'`, `'Paid'`)
- `expense_date` (date, default current_date)
- `notes` (text)
- `created_at` (timestamptz)

### 2.4 `appointments`
- `id` (uuid, PK)
- `household_id` (uuid, FK ➔ `households.id` on delete cascade)
- `child_id` (uuid, FK ➔ `children.id` on delete set null, nullable)
- `stage` (text, default `'pregnancy'`)
- `appointment_date` (timestamptz, not null)
- `doctor` (text, not null)
- `hospital` (text)
- `purpose` (text, not null)
- `cost` (numeric(14,2), default 0.00)
- `notes` (text)
- `next_appointment_date` (date)
- `target_gestational_week` (integer, nullable)
- `created_at` (timestamptz)

### 2.5 `documents`
- `id` (uuid, PK)
- `household_id` (uuid, FK ➔ `households.id` on delete cascade)
- `child_id` (uuid, FK ➔ `children.id` on delete set null, nullable)
- `stage` (text, default `'pregnancy'`)
- `title` (text, not null)
- `category` (text, not null)
- `file_url` (text, not null)
- `file_name` (text, not null)
- `file_size` (integer)
- `notes` (text)
- `created_at` (timestamptz)

### 2.6 `milestones`
- `id` (uuid, PK)
- `household_id` (uuid, FK ➔ `households.id` on delete cascade)
- `child_id` (uuid, FK ➔ `children.id` on delete set null, nullable)
- `stage` (text, default `'pregnancy'`)
- `title` (text, not null)
- `description` (text)
- `target_gestational_week` (integer, nullable)
- `target_age_months` (integer, nullable)
- `achieved_at` (date, nullable)
- `is_completed` (boolean, default false)
- `category` (text, not null)
- `created_at` (timestamptz)

---

## 3. Financial Single Source-of-Truth Formula

```
TOTAL BUDGET: Maximum household allocation.
ACTUAL PAID: Sum of all expenses.paid_amount + any unlinked shopping_items with status ('Bought', 'Received').
COMMITTED: Sum of contracted expenses (expenses.total_amount for partially paid) + unlinked shopping_items with status 'Ordered'.
OUTSTANDING: Sum of (expenses.total_amount - expenses.paid_amount) + unlinked shopping_items with status 'Ordered'.
ESTIMATED / PLANNED: Sum of unlinked shopping_items with status ('Research', 'Wishlist', 'Planned').
PROJECTED FINAL COST: Actual Paid + Outstanding + Estimated / Planned.
PROJECTED BUFFER: Total Budget - Projected Final Cost.
REMAINING BUDGET: Total Budget - Actual Paid.
```

---

## 4. Row Level Security (RLS) Strategy

All tables enforce RLS enabled by default. Household membership validates access:

```sql
create or replace function public.is_member_of_household(_household_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.household_members
    where household_id = _household_id
      and user_id = auth.uid()
  );
$$;
```

All operational tables (`children`, `pregnancies`, `checklist_items`, `shopping_items`, `expenses`, `appointments`, `documents`, `milestones`) use:
```sql
create policy "Household members full access"
  on public.<table_name> for all
  using (public.is_member_of_household(household_id))
  with check (public.is_member_of_household(household_id));
```
