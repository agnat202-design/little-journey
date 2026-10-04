-- Additive MVP persistence: run after 202610030001_household_schema.sql.
BEGIN;
ALTER TABLE public.documents ADD CONSTRAINT document_file_household CHECK(left(storage_path,37)=household_id::text || '/');
ALTER TABLE public.expenses ADD CONSTRAINT expense_file_household CHECK(attachment_storage_path IS NULL OR left(attachment_storage_path,37)=household_id::text || '/');
CREATE FUNCTION public.setup_household(p_name text, p_display_name text, p_due_date date DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE h uuid; u uuid := auth.uid();
BEGIN
 IF u IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(u::text,0));
 INSERT INTO public.profiles(id,display_name) VALUES(u,btrim(p_display_name)) ON CONFLICT(id) DO NOTHING;
 SELECT household_id INTO h FROM public.household_members WHERE user_id=u AND status='active' ORDER BY created_at,id LIMIT 1;
 IF h IS NOT NULL THEN RETURN h; END IF;
 h := public.create_household(p_name);
 IF p_due_date IS NOT NULL THEN INSERT INTO public.pregnancies(household_id,due_date) VALUES(h,p_due_date); END IF;
 RETURN h;
END; $$;

CREATE FUNCTION public.load_household(p_household_id uuid) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path='' AS $$
DECLARE result jsonb;
BEGIN
 IF NOT little_journey_private.is_member(p_household_id) THEN RAISE EXCEPTION 'Household access denied' USING ERRCODE='42501'; END IF;
 SELECT jsonb_build_object('household',to_jsonb(h),
 'tasks',(SELECT coalesce(jsonb_agg(t ORDER BY t.created_at DESC,t.id),'[]'::jsonb) FROM public.tasks t WHERE household_id=h.id),
 'shopping_items',(SELECT coalesce(jsonb_agg(t ORDER BY t.created_at DESC,t.id),'[]'::jsonb) FROM public.shopping_items t WHERE household_id=h.id),
 'expenses',(SELECT coalesce(jsonb_agg(t ORDER BY t.expense_date DESC,t.created_at DESC,t.id),'[]'::jsonb) FROM public.expenses t WHERE household_id=h.id),
 'appointments',(SELECT coalesce(jsonb_agg(t ORDER BY t.appointment_date,t.appointment_time,t.id),'[]'::jsonb) FROM public.appointments t WHERE household_id=h.id),
 'documents',(SELECT coalesce(jsonb_agg(t ORDER BY t.document_date DESC,t.created_at DESC,t.id),'[]'::jsonb) FROM public.documents t WHERE household_id=h.id),
 'allocations',(SELECT coalesce(jsonb_agg(t ORDER BY t.category),'[]'::jsonb) FROM public.budget_category_allocations t WHERE household_id=h.id),
 'pregnancies',(SELECT coalesce(jsonb_agg(t ORDER BY t.created_at DESC,t.id),'[]'::jsonb) FROM public.pregnancies t WHERE household_id=h.id))
 INTO result FROM public.households h WHERE id=p_household_id;
 RETURN result;
END; $$;

-- All changes for one UI action commit together. Version check prevents stale
-- tabs overwriting household edits; no blind full-list replacement or wipe.
CREATE FUNCTION public.save_household_changes(p_household_id uuid, p_version timestamptz, p_changes jsonb, p_budget jsonb DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE current_version timestamptz; op jsonb; t text; cols text[]; columns_sql text; updates_sql text; row_data jsonb; row_id uuid; col text; affected integer;
BEGIN
 IF NOT little_journey_private.is_member(p_household_id) THEN RAISE EXCEPTION 'Household access denied' USING ERRCODE='42501'; END IF;
 SELECT updated_at INTO current_version FROM public.households WHERE id=p_household_id FOR UPDATE;
 IF current_version IS DISTINCT FROM p_version THEN RAISE EXCEPTION 'Household changed; reload before saving' USING ERRCODE='40001'; END IF;
 IF jsonb_typeof(p_changes) IS DISTINCT FROM 'array' OR jsonb_array_length(p_changes)>500 THEN RAISE EXCEPTION 'Invalid changes' USING ERRCODE='22023'; END IF;
 FOR op IN SELECT value FROM jsonb_array_elements(p_changes) LOOP
  t := op->>'table'; row_id := (op->>'id')::uuid;
  IF row_id IS NULL THEN RAISE EXCEPTION 'Missing record ID' USING ERRCODE='22023'; END IF;
  cols := CASE t
   WHEN 'tasks' THEN ARRAY['pregnancy_id','child_id','stage','name','category','notes','priority','status','target_gestational_week','target_date','target_age_months','assigned_member_id']
   WHEN 'shopping_items' THEN ARRAY['pregnancy_id','child_id','stage','item','category','brand','model','store','notes','quantity','estimated_unit_price','product_url','priority','status','target_gestational_week','target_date','target_age_months']
   WHEN 'expenses' THEN ARRAY['pregnancy_id','child_id','stage','title','category','notes','paid_amount','expense_date','source','shopping_item_id','attachment_storage_path','attachment_file_name','attachment_mime_type','attachment_size_bytes']
   WHEN 'appointments' THEN ARRAY['pregnancy_id','child_id','stage','purpose','appointment_date','appointment_time','doctor','hospital','notes','target_gestational_week']
   WHEN 'documents' THEN ARRAY['pregnancy_id','child_id','stage','document_type','title','document_date','notes','storage_path','file_name','mime_type','size_bytes']
   WHEN 'budget_category_allocations' THEN ARRAY['category','planned_amount']
   WHEN 'pregnancies' THEN ARRAY['due_date','lmp_date','baby_nickname','notes','status']
   ELSE NULL END;
  IF cols IS NULL THEN RAISE EXCEPTION 'Unsupported table' USING ERRCODE='22023'; END IF;
  IF op->>'kind'='delete' THEN
   EXECUTE format('DELETE FROM public.%I WHERE id=$1 AND household_id=$2',t) USING row_id,p_household_id;
  ELSIF op->>'kind'='upsert' THEN
   row_data := (op->'row') || jsonb_build_object('id',row_id,'household_id',p_household_id);
   IF jsonb_typeof(op->'row') IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Invalid record' USING ERRCODE='22023'; END IF;
   columns_sql := ''; updates_sql := '';
   FOREACH col IN ARRAY cols LOOP
    columns_sql := columns_sql || ',' || quote_ident(col);
    updates_sql := updates_sql || CASE WHEN updates_sql='' THEN '' ELSE ',' END || format('%I=EXCLUDED.%I',col,col);
   END LOOP;
   EXECUTE format('INSERT INTO public.%I(id,household_id%s) SELECT id,household_id%s FROM jsonb_populate_record(NULL::public.%I,$1) ON CONFLICT(id) DO UPDATE SET %s WHERE %I.household_id=$2',t,columns_sql,columns_sql,t,updates_sql,t) USING row_data,p_household_id;
  ELSE RAISE EXCEPTION 'Unsupported operation' USING ERRCODE='22023'; END IF;
  GET DIAGNOSTICS affected=ROW_COUNT;
  IF affected<>1 THEN RAISE EXCEPTION 'Record unavailable in household' USING ERRCODE='42501'; END IF;
 END LOOP;
 IF p_budget IS NOT NULL THEN
  UPDATE public.households SET total_budget=(p_budget->>'total_budget')::numeric WHERE id=p_household_id;
 ELSE
  UPDATE public.households SET updated_at=now() WHERE id=p_household_id;
 END IF;
 -- Force financial invariants before returning success to the browser.
 SET CONSTRAINTS ALL IMMEDIATE;
 RETURN public.load_household(p_household_id);
END; $$;
REVOKE ALL ON FUNCTION public.setup_household(text,text,date), public.load_household(uuid), public.save_household_changes(uuid,timestamptz,jsonb,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.setup_household(text,text,date), public.load_household(uuid), public.save_household_changes(uuid,timestamptz,jsonb,jsonb) TO authenticated;

-- Private files only. The first path segment is the owning household UUID.
INSERT INTO storage.buckets(id,name,public,file_size_limit) VALUES('family-files','family-files',false,10485760)
ON CONFLICT(id) DO UPDATE SET public=false,file_size_limit=10485760;
CREATE POLICY family_files_read ON storage.objects FOR SELECT TO authenticated
USING(bucket_id='family-files' AND CASE WHEN (storage.foldername(name))[1] ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN little_journey_private.is_member(((storage.foldername(name))[1])::uuid) ELSE false END);
CREATE POLICY family_files_insert ON storage.objects FOR INSERT TO authenticated
WITH CHECK(bucket_id='family-files' AND CASE WHEN (storage.foldername(name))[1] ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN little_journey_private.is_member(((storage.foldername(name))[1])::uuid) ELSE false END);
CREATE POLICY family_files_delete ON storage.objects FOR DELETE TO authenticated
USING(bucket_id='family-files' AND CASE WHEN (storage.foldername(name))[1] ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN little_journey_private.is_member(((storage.foldername(name))[1])::uuid) ELSE false END);
COMMIT;
