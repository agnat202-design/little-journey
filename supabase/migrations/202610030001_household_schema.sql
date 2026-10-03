-- Little Journey Phase 2: first schema. Review before executing on Supabase.
-- Transactional, no seeds, no destructive reset; existing table names cause failure.
BEGIN;
CREATE SCHEMA little_journey_private;
REVOKE ALL ON SCHEMA little_journey_private FROM PUBLIC;
GRANT USAGE ON SCHEMA little_journey_private TO authenticated;
CREATE TABLE public.profiles (
id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE RESTRICT,
display_name text NOT NULL CHECK (length(btrim(display_name))>0),
avatar_storage_path text,
created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.households (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
name text NOT NULL CHECK (length(btrim(name))>0),
currency text NOT NULL DEFAULT 'IDR' CHECK (currency='IDR'),
timezone text NOT NULL DEFAULT 'Asia/Jakarta',
total_budget numeric CHECK (total_budget>=0 AND total_budget<=999999999999.99 AND scale(total_budget)<=2 AND total_budget NOT IN ('NaN'::numeric,'Infinity'::numeric,'-Infinity'::numeric)),
partner_display_name text,
created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE RESTRICT,
created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.household_members (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE RESTRICT,
created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE RESTRICT,
created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner','member')),
status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
UNIQUE (household_id,user_id), UNIQUE (household_id,id));
CREATE TABLE public.pregnancies (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE RESTRICT,
created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE RESTRICT,
created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
due_date date NOT NULL CHECK (isfinite(due_date)),
lmp_date date CHECK (isfinite(lmp_date) AND lmp_date<=due_date),
baby_nickname text, notes text,
status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','archived')),
UNIQUE (household_id,id));
CREATE TABLE public.children (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE RESTRICT,
created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE RESTRICT,
created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
display_name text NOT NULL CHECK (length(btrim(display_name))>0),
birth_date date CHECK (isfinite(birth_date)),
gender text CHECK (gender IN ('boy','girl','surprise','undisclosed')),
pregnancy_id uuid,
FOREIGN KEY (household_id,pregnancy_id) REFERENCES public.pregnancies(household_id,id) ON DELETE RESTRICT,
UNIQUE (household_id,id), UNIQUE (household_id,id,pregnancy_id));
CREATE TABLE public.tasks (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE RESTRICT,
created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE RESTRICT,
created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), pregnancy_id uuid, child_id uuid,
stage text CHECK (stage IN ('pregnancy','birth','newborn','infant','toddler','preschool')),
FOREIGN KEY (household_id,pregnancy_id) REFERENCES public.pregnancies(household_id,id) ON DELETE RESTRICT,
FOREIGN KEY (household_id,child_id) REFERENCES public.children(household_id,id) ON DELETE RESTRICT,
FOREIGN KEY (household_id,child_id,pregnancy_id) REFERENCES public.children(household_id,id,pregnancy_id) ON DELETE RESTRICT, target_gestational_week integer CHECK (target_gestational_week IS NULL OR (target_gestational_week BETWEEN 1 AND 42 AND stage IS NOT NULL AND stage='pregnancy')),
target_date date, target_age_months integer CHECK (target_age_months>=0),
name text NOT NULL CHECK (length(btrim(name))>0), category text, notes text,
priority text NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High','Medium','Low')),
status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','In Progress','Completed','Skipped')),
assigned_member_id uuid,
FOREIGN KEY (household_id,assigned_member_id) REFERENCES public.household_members(household_id,id) ON DELETE RESTRICT);
CREATE TABLE public.shopping_items (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE RESTRICT,
created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE RESTRICT,
created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), pregnancy_id uuid, child_id uuid,
stage text CHECK (stage IN ('pregnancy','birth','newborn','infant','toddler','preschool')),
FOREIGN KEY (household_id,pregnancy_id) REFERENCES public.pregnancies(household_id,id) ON DELETE RESTRICT,
FOREIGN KEY (household_id,child_id) REFERENCES public.children(household_id,id) ON DELETE RESTRICT,
FOREIGN KEY (household_id,child_id,pregnancy_id) REFERENCES public.children(household_id,id,pregnancy_id) ON DELETE RESTRICT, target_gestational_week integer CHECK (target_gestational_week IS NULL OR (target_gestational_week BETWEEN 1 AND 42 AND stage IS NOT NULL AND stage='pregnancy')),
target_date date, target_age_months integer CHECK (target_age_months>=0),
item text NOT NULL CHECK (length(btrim(item))>0), category text, brand text, model text, store text, notes text,
quantity integer NOT NULL DEFAULT 1 CHECK (quantity>0),
estimated_unit_price numeric CHECK (estimated_unit_price>=0 AND estimated_unit_price<=999999999999.99 AND scale(estimated_unit_price)<=2 AND estimated_unit_price NOT IN ('NaN'::numeric,'Infinity'::numeric,'-Infinity'::numeric)),
product_url text CHECK (product_url ~ '^https?://[^[:space:]/?#]+[^[:space:]]*$'),
priority text NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High','Medium','Low')),
status text NOT NULL DEFAULT 'Wishlist' CHECK (status IN ('Research','Wishlist','Planned','Ordered','Bought','Received','Skip')),
UNIQUE (household_id,id));
CREATE TABLE public.expenses (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE RESTRICT,
created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE RESTRICT,
created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), pregnancy_id uuid, child_id uuid,
stage text CHECK (stage IN ('pregnancy','birth','newborn','infant','toddler','preschool')),
FOREIGN KEY (household_id,pregnancy_id) REFERENCES public.pregnancies(household_id,id) ON DELETE RESTRICT,
FOREIGN KEY (household_id,child_id) REFERENCES public.children(household_id,id) ON DELETE RESTRICT,
FOREIGN KEY (household_id,child_id,pregnancy_id) REFERENCES public.children(household_id,id,pregnancy_id) ON DELETE RESTRICT,
title text NOT NULL CHECK (length(btrim(title))>0), category text, notes text,
paid_amount numeric CHECK (paid_amount>=0 AND paid_amount<=999999999999.99 AND scale(paid_amount)<=2 AND paid_amount NOT IN ('NaN'::numeric,'Infinity'::numeric,'-Infinity'::numeric)) NOT NULL,
expense_date date NOT NULL CHECK (isfinite(expense_date)),
source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','shopping')),
shopping_item_id uuid,
attachment_storage_path text, attachment_file_name text, attachment_mime_type text,
attachment_size_bytes bigint CHECK (attachment_size_bytes>=0),
CHECK ((attachment_storage_path IS NULL AND attachment_file_name IS NULL AND attachment_mime_type IS NULL AND attachment_size_bytes IS NULL)
 OR (attachment_storage_path IS NOT NULL AND attachment_file_name IS NOT NULL AND length(btrim(attachment_storage_path))>0 AND length(btrim(attachment_file_name))>0 AND attachment_mime_type IS NOT NULL AND attachment_size_bytes IS NOT NULL)),
CHECK (shopping_item_id IS NULL OR source='shopping'),
FOREIGN KEY (household_id,shopping_item_id) REFERENCES public.shopping_items(household_id,id) ON DELETE RESTRICT);
CREATE UNIQUE INDEX expenses_current_purchase ON public.expenses(shopping_item_id) WHERE shopping_item_id IS NOT NULL;
CREATE TABLE public.appointments (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE RESTRICT,
created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE RESTRICT,
created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), pregnancy_id uuid, child_id uuid,
stage text CHECK (stage IN ('pregnancy','birth','newborn','infant','toddler','preschool')),
FOREIGN KEY (household_id,pregnancy_id) REFERENCES public.pregnancies(household_id,id) ON DELETE RESTRICT,
FOREIGN KEY (household_id,child_id) REFERENCES public.children(household_id,id) ON DELETE RESTRICT,
FOREIGN KEY (household_id,child_id,pregnancy_id) REFERENCES public.children(household_id,id,pregnancy_id) ON DELETE RESTRICT,
purpose text NOT NULL CHECK (length(btrim(purpose))>0),
appointment_date date NOT NULL CHECK (isfinite(appointment_date)),
appointment_time time(0) CHECK (extract(second FROM appointment_time)=0 AND appointment_time<'24:00:00'::time),
doctor text, hospital text, notes text,
target_gestational_week integer CHECK (target_gestational_week IS NULL OR (target_gestational_week BETWEEN 1 AND 42 AND stage IS NOT NULL AND stage='pregnancy')));
CREATE TABLE public.documents (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE RESTRICT,
created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE RESTRICT,
created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), pregnancy_id uuid, child_id uuid,
stage text CHECK (stage IN ('pregnancy','birth','newborn','infant','toddler','preschool')),
FOREIGN KEY (household_id,pregnancy_id) REFERENCES public.pregnancies(household_id,id) ON DELETE RESTRICT,
FOREIGN KEY (household_id,child_id) REFERENCES public.children(household_id,id) ON DELETE RESTRICT,
FOREIGN KEY (household_id,child_id,pregnancy_id) REFERENCES public.children(household_id,id,pregnancy_id) ON DELETE RESTRICT,
document_type text NOT NULL CHECK (document_type IN ('USG','Hasil Lab','Dokumen Kontrol','Invoice','Receipt','Resep','Lainnya')),
title text NOT NULL CHECK (length(btrim(title))>0),
document_date date CHECK (isfinite(document_date)), notes text,
storage_path text NOT NULL UNIQUE CHECK (length(btrim(storage_path))>0),
file_name text NOT NULL CHECK (length(btrim(file_name))>0),
mime_type text NOT NULL CHECK (length(btrim(mime_type))>0),
size_bytes bigint NOT NULL CHECK (size_bytes>=0));
CREATE TABLE public.budget_category_allocations (
id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE RESTRICT,
created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE RESTRICT,
created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
category text NOT NULL CHECK (length(btrim(category))>0),
planned_amount numeric CHECK (planned_amount>=0 AND planned_amount<=999999999999.99 AND scale(planned_amount)<=2 AND planned_amount NOT IN ('NaN'::numeric,'Infinity'::numeric,'-Infinity'::numeric)) NOT NULL,
UNIQUE(household_id,category));

-- Private helpers are not exposed as API RPCs. Fixed search_path and explicit grants.
CREATE FUNCTION little_journey_private.is_member(h uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
SELECT auth.uid() IS NOT NULL AND EXISTS (
 SELECT 1 FROM public.household_members m WHERE m.household_id=h AND m.user_id=auth.uid() AND m.status='active');
$$;
CREATE FUNCTION little_journey_private.is_owner(h uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
SELECT auth.uid() IS NOT NULL AND EXISTS (
 SELECT 1 FROM public.household_members m WHERE m.household_id=h AND m.user_id=auth.uid() AND m.status='active' AND m.role='owner');
$$;
CREATE FUNCTION little_journey_private.can_read_profile(u uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
SELECT u=auth.uid() OR EXISTS (
 SELECT 1 FROM public.household_members me JOIN public.household_members other
 ON me.household_id=other.household_id
 WHERE me.user_id=auth.uid() AND other.user_id=u AND me.status='active' AND other.status='active');
$$;
CREATE FUNCTION little_journey_private.guard_row() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
 IF TG_OP='UPDATE' THEN
  IF NEW.id IS DISTINCT FROM OLD.id OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
   RAISE EXCEPTION 'Immutable record identity' USING ERRCODE='23514';
  END IF;
  IF TG_TABLE_NAME<>'profiles' THEN
   IF NEW.created_by IS DISTINCT FROM OLD.created_by THEN RAISE EXCEPTION 'Immutable creator' USING ERRCODE='23514'; END IF;
   IF TG_TABLE_NAME<>'households' THEN
    IF NEW.household_id IS DISTINCT FROM OLD.household_id THEN
     RAISE EXCEPTION 'Immutable household' USING ERRCODE='23514';
    END IF;
   END IF;
  END IF;
 ELSE
  IF TG_TABLE_NAME<>'profiles' THEN
   IF NEW.created_by IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Creator must be authenticated user' USING ERRCODE='42501';
   END IF;
  END IF;
  NEW.created_at=now();
 END IF;
 NEW.updated_at=now();
 RETURN NEW;
END;
$$;
CREATE FUNCTION little_journey_private.guard_membership() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE h uuid;
BEGIN
 h=OLD.household_id;
 -- Serialize membership administration within one household.
 PERFORM 1 FROM public.households WHERE id=h FOR UPDATE;
 IF TG_OP='UPDATE' AND NEW.user_id IS DISTINCT FROM OLD.user_id THEN
  RAISE EXCEPTION 'Membership user is immutable' USING ERRCODE='23514';
 END IF;
 IF OLD.role='owner' AND OLD.status='active' THEN
  IF TG_OP='DELETE' OR NEW.role<>'owner' OR NEW.status<>'active' THEN
   IF NOT EXISTS(SELECT 1 FROM public.household_members WHERE household_id=h AND id<>OLD.id AND role='owner' AND status='active') THEN
    RAISE EXCEPTION 'Last active owner cannot be removed' USING ERRCODE='23514';
   END IF;
  END IF;
 END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER guard_membership BEFORE UPDATE OR DELETE ON public.household_members
FOR EACH ROW EXECUTE FUNCTION little_journey_private.guard_membership();
CREATE FUNCTION little_journey_private.guard_household() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_catalog.pg_timezone_names WHERE name=NEW.timezone) THEN
  RAISE EXCEPTION 'Invalid household timezone' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER guard_household BEFORE INSERT OR UPDATE ON public.households FOR EACH ROW
EXECUTE FUNCTION little_journey_private.guard_household();
CREATE FUNCTION little_journey_private.guard_assignee() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF NEW.assigned_member_id IS NOT NULL AND
 (TG_OP='INSERT' OR NEW.assigned_member_id IS DISTINCT FROM OLD.assigned_member_id) THEN
  IF NOT EXISTS(SELECT 1 FROM public.household_members WHERE id=NEW.assigned_member_id
   AND household_id=NEW.household_id AND status='active') THEN
   RAISE EXCEPTION 'Assignee must be active household member' USING ERRCODE='23514';
  END IF;
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER guard_assignee BEFORE INSERT OR UPDATE ON public.tasks FOR EACH ROW
EXECUTE FUNCTION little_journey_private.guard_assignee();

-- Checks use final transaction state. No cached purchase price/date columns.
CREATE FUNCTION little_journey_private.assert_purchase(i uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE s text; n bigint;
BEGIN
 SELECT status INTO s FROM public.shopping_items WHERE id=i;
 IF NOT FOUND THEN RETURN; END IF;
 SELECT count(*) INTO n FROM public.expenses WHERE shopping_item_id=i;
 IF (s IN ('Bought','Received') AND n<>1) OR (s NOT IN ('Bought','Received') AND n<>0) THEN
  RAISE EXCEPTION 'Shopping status and linked Expense disagree' USING ERRCODE='23514';
 END IF;
END;
$$;
CREATE FUNCTION little_journey_private.check_purchase() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF TG_TABLE_NAME='shopping_items' THEN
  IF TG_OP<>'DELETE' THEN PERFORM little_journey_private.assert_purchase(NEW.id); END IF;
 ELSE
  IF TG_OP<>'INSERT' THEN PERFORM little_journey_private.assert_purchase(OLD.shopping_item_id); END IF;
  IF TG_OP<>'DELETE' THEN PERFORM little_journey_private.assert_purchase(NEW.shopping_item_id); END IF;
 END IF;
 RETURN NULL;
END;
$$;
CREATE CONSTRAINT TRIGGER shopping_purchase_valid AFTER INSERT OR UPDATE OR DELETE ON public.shopping_items
DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION little_journey_private.check_purchase();
CREATE CONSTRAINT TRIGGER expense_purchase_valid AFTER INSERT OR UPDATE OR DELETE ON public.expenses
DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION little_journey_private.check_purchase();

-- First-owner bootstrapping cannot rely on an existing membership.
CREATE FUNCTION public.create_household(p_name text, p_partner_name text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE h uuid; u uuid;
BEGIN
 u=auth.uid();
 IF u IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=u) THEN
  RAISE EXCEPTION 'Create own profile first' USING ERRCODE='23514';
 END IF;
 INSERT INTO public.households(name,partner_display_name,created_by)
 VALUES(btrim(p_name),nullif(btrim(p_partner_name),''),u) RETURNING id INTO h;
 INSERT INTO public.household_members(household_id,user_id,role,created_by)
 VALUES(h,u,'owner',u);
 RETURN h;
END;
$$;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.profiles FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_row BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION little_journey_private.guard_row();
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.households FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_row BEFORE INSERT OR UPDATE ON public.households FOR EACH ROW EXECUTE FUNCTION little_journey_private.guard_row();
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.household_members FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_row BEFORE INSERT OR UPDATE ON public.household_members FOR EACH ROW EXECUTE FUNCTION little_journey_private.guard_row();
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.children FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_row BEFORE INSERT OR UPDATE ON public.children FOR EACH ROW EXECUTE FUNCTION little_journey_private.guard_row();
ALTER TABLE public.pregnancies ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pregnancies FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_row BEFORE INSERT OR UPDATE ON public.pregnancies FOR EACH ROW EXECUTE FUNCTION little_journey_private.guard_row();
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tasks FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_row BEFORE INSERT OR UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION little_journey_private.guard_row();
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.shopping_items FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_row BEFORE INSERT OR UPDATE ON public.shopping_items FOR EACH ROW EXECUTE FUNCTION little_journey_private.guard_row();
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.expenses FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_row BEFORE INSERT OR UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION little_journey_private.guard_row();
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.appointments FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_row BEFORE INSERT OR UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION little_journey_private.guard_row();
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.documents FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_row BEFORE INSERT OR UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION little_journey_private.guard_row();
ALTER TABLE public.budget_category_allocations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.budget_category_allocations FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_row BEFORE INSERT OR UPDATE ON public.budget_category_allocations FOR EACH ROW EXECUTE FUNCTION little_journey_private.guard_row();
GRANT SELECT,INSERT,UPDATE ON public.profiles TO authenticated;
CREATE POLICY profile_read ON public.profiles FOR SELECT TO authenticated USING(little_journey_private.can_read_profile(id));
CREATE POLICY profile_insert ON public.profiles FOR INSERT TO authenticated WITH CHECK(id=auth.uid());
CREATE POLICY profile_update ON public.profiles FOR UPDATE TO authenticated USING(id=auth.uid()) WITH CHECK(id=auth.uid());
GRANT SELECT,UPDATE ON public.households TO authenticated;
CREATE POLICY household_read ON public.households FOR SELECT TO authenticated USING(little_journey_private.is_member(id));
CREATE POLICY household_update ON public.households FOR UPDATE TO authenticated USING(little_journey_private.is_member(id)) WITH CHECK(little_journey_private.is_member(id));
GRANT SELECT,INSERT,UPDATE,DELETE ON public.household_members TO authenticated;
CREATE POLICY member_read ON public.household_members FOR SELECT TO authenticated USING(little_journey_private.is_member(household_id));
CREATE POLICY member_insert ON public.household_members FOR INSERT TO authenticated WITH CHECK(little_journey_private.is_owner(household_id) AND created_by=auth.uid());
CREATE POLICY member_update ON public.household_members FOR UPDATE TO authenticated USING(little_journey_private.is_owner(household_id)) WITH CHECK(little_journey_private.is_owner(household_id));
CREATE POLICY member_delete ON public.household_members FOR DELETE TO authenticated USING(little_journey_private.is_owner(household_id));
GRANT SELECT,INSERT,UPDATE,DELETE ON public.children TO authenticated;
CREATE POLICY record_read ON public.children FOR SELECT TO authenticated USING(little_journey_private.is_member(household_id));
CREATE POLICY record_insert ON public.children FOR INSERT TO authenticated WITH CHECK(little_journey_private.is_member(household_id) AND created_by=auth.uid());
CREATE POLICY record_update ON public.children FOR UPDATE TO authenticated USING(little_journey_private.is_member(household_id)) WITH CHECK(little_journey_private.is_member(household_id));
CREATE POLICY record_delete ON public.children FOR DELETE TO authenticated USING(little_journey_private.is_member(household_id));
GRANT SELECT,INSERT,UPDATE,DELETE ON public.pregnancies TO authenticated;
CREATE POLICY record_read ON public.pregnancies FOR SELECT TO authenticated USING(little_journey_private.is_member(household_id));
CREATE POLICY record_insert ON public.pregnancies FOR INSERT TO authenticated WITH CHECK(little_journey_private.is_member(household_id) AND created_by=auth.uid());
CREATE POLICY record_update ON public.pregnancies FOR UPDATE TO authenticated USING(little_journey_private.is_member(household_id)) WITH CHECK(little_journey_private.is_member(household_id));
CREATE POLICY record_delete ON public.pregnancies FOR DELETE TO authenticated USING(little_journey_private.is_member(household_id));
GRANT SELECT,INSERT,UPDATE,DELETE ON public.tasks TO authenticated;
CREATE POLICY record_read ON public.tasks FOR SELECT TO authenticated USING(little_journey_private.is_member(household_id));
CREATE POLICY record_insert ON public.tasks FOR INSERT TO authenticated WITH CHECK(little_journey_private.is_member(household_id) AND created_by=auth.uid());
CREATE POLICY record_update ON public.tasks FOR UPDATE TO authenticated USING(little_journey_private.is_member(household_id)) WITH CHECK(little_journey_private.is_member(household_id));
CREATE POLICY record_delete ON public.tasks FOR DELETE TO authenticated USING(little_journey_private.is_member(household_id));
GRANT SELECT,INSERT,UPDATE,DELETE ON public.shopping_items TO authenticated;
CREATE POLICY record_read ON public.shopping_items FOR SELECT TO authenticated USING(little_journey_private.is_member(household_id));
CREATE POLICY record_insert ON public.shopping_items FOR INSERT TO authenticated WITH CHECK(little_journey_private.is_member(household_id) AND created_by=auth.uid());
CREATE POLICY record_update ON public.shopping_items FOR UPDATE TO authenticated USING(little_journey_private.is_member(household_id)) WITH CHECK(little_journey_private.is_member(household_id));
CREATE POLICY record_delete ON public.shopping_items FOR DELETE TO authenticated USING(little_journey_private.is_member(household_id));
GRANT SELECT,INSERT,UPDATE,DELETE ON public.expenses TO authenticated;
CREATE POLICY record_read ON public.expenses FOR SELECT TO authenticated USING(little_journey_private.is_member(household_id));
CREATE POLICY record_insert ON public.expenses FOR INSERT TO authenticated WITH CHECK(little_journey_private.is_member(household_id) AND created_by=auth.uid());
CREATE POLICY record_update ON public.expenses FOR UPDATE TO authenticated USING(little_journey_private.is_member(household_id)) WITH CHECK(little_journey_private.is_member(household_id));
CREATE POLICY record_delete ON public.expenses FOR DELETE TO authenticated USING(little_journey_private.is_member(household_id));
GRANT SELECT,INSERT,UPDATE,DELETE ON public.appointments TO authenticated;
CREATE POLICY record_read ON public.appointments FOR SELECT TO authenticated USING(little_journey_private.is_member(household_id));
CREATE POLICY record_insert ON public.appointments FOR INSERT TO authenticated WITH CHECK(little_journey_private.is_member(household_id) AND created_by=auth.uid());
CREATE POLICY record_update ON public.appointments FOR UPDATE TO authenticated USING(little_journey_private.is_member(household_id)) WITH CHECK(little_journey_private.is_member(household_id));
CREATE POLICY record_delete ON public.appointments FOR DELETE TO authenticated USING(little_journey_private.is_member(household_id));
GRANT SELECT,INSERT,UPDATE,DELETE ON public.documents TO authenticated;
CREATE POLICY record_read ON public.documents FOR SELECT TO authenticated USING(little_journey_private.is_member(household_id));
CREATE POLICY record_insert ON public.documents FOR INSERT TO authenticated WITH CHECK(little_journey_private.is_member(household_id) AND created_by=auth.uid());
CREATE POLICY record_update ON public.documents FOR UPDATE TO authenticated USING(little_journey_private.is_member(household_id)) WITH CHECK(little_journey_private.is_member(household_id));
CREATE POLICY record_delete ON public.documents FOR DELETE TO authenticated USING(little_journey_private.is_member(household_id));
GRANT SELECT,INSERT,UPDATE,DELETE ON public.budget_category_allocations TO authenticated;
CREATE POLICY record_read ON public.budget_category_allocations FOR SELECT TO authenticated USING(little_journey_private.is_member(household_id));
CREATE POLICY record_insert ON public.budget_category_allocations FOR INSERT TO authenticated WITH CHECK(little_journey_private.is_member(household_id) AND created_by=auth.uid());
CREATE POLICY record_update ON public.budget_category_allocations FOR UPDATE TO authenticated USING(little_journey_private.is_member(household_id)) WITH CHECK(little_journey_private.is_member(household_id));
CREATE POLICY record_delete ON public.budget_category_allocations FOR DELETE TO authenticated USING(little_journey_private.is_member(household_id));
CREATE INDEX member_lookup ON public.household_members(user_id,household_id) WHERE status='active';
CREATE INDEX owner_lookup ON public.household_members(household_id,role) WHERE status='active';
CREATE INDEX expense_history ON public.expenses(household_id,expense_date DESC,id);
CREATE INDEX appointment_schedule ON public.appointments(household_id,appointment_date,appointment_time,id);
CREATE INDEX document_history ON public.documents(household_id,document_date DESC,id);
CREATE INDEX task_list ON public.tasks(household_id,status,created_at DESC,id);
CREATE INDEX shopping_list ON public.shopping_items(household_id,status,created_at DESC,id);
CREATE INDEX pregnancy_list ON public.pregnancies(household_id,status);
CREATE INDEX child_list ON public.children(household_id,birth_date);
CREATE INDEX task_assignee ON public.tasks(household_id,assigned_member_id);
CREATE INDEX children_pregnancy ON public.children(household_id,pregnancy_id);
CREATE INDEX tasks_pregnancy ON public.tasks(household_id,pregnancy_id);
CREATE INDEX shopping_items_pregnancy ON public.shopping_items(household_id,pregnancy_id);
CREATE INDEX expenses_pregnancy ON public.expenses(household_id,pregnancy_id);
CREATE INDEX appointments_pregnancy ON public.appointments(household_id,pregnancy_id);
CREATE INDEX documents_pregnancy ON public.documents(household_id,pregnancy_id);
CREATE INDEX tasks_child ON public.tasks(household_id,child_id);
CREATE INDEX shopping_items_child ON public.shopping_items(household_id,child_id);
CREATE INDEX expenses_child ON public.expenses(household_id,child_id);
CREATE INDEX appointments_child ON public.appointments(household_id,child_id);
CREATE INDEX documents_child ON public.documents(household_id,child_id);
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA little_journey_private FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION little_journey_private.is_member(uuid),little_journey_private.is_owner(uuid),little_journey_private.can_read_profile(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.create_household(text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.create_household(text,text) TO authenticated;
COMMIT;

