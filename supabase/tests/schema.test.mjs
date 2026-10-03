// Local PostgreSQL/WASM test only. Never connects to a Supabase project.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
const require = createRequire(resolve('tmp/schema-validation/package.json'));
const { PGlite } = require('@electric-sql/pglite');
const db = new PGlite();
let passed = 0;
const q = (sql, args=[]) => db.query(sql,args);
async function user(uid, run, role='authenticated') {
  await db.exec(`BEGIN; SET LOCAL ROLE ${role};`);
  await q("SELECT set_config('request.jwt.claim.sub',$1,true)",[uid ?? '']);
  try { const result = await run(); await db.exec('COMMIT'); return result; }
  catch(e) { await db.exec('ROLLBACK'); throw e; }
}
async function test(name, run) { await run(); passed++; console.log(`PASS ${name}`); }
async function rejects(uid, run, code) {
  await assert.rejects(user(uid,run),e=>e.code===code);
}
try {
  // Minimal isolated Auth contract; no real accounts/providers configured.
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated;
    CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
    SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    GRANT USAGE ON SCHEMA auth TO authenticated,anon;
    GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated,anon;`);
  await db.exec(await readFile('supabase/migrations/202610030001_household_schema.sql','utf8'));
  const owner=randomUUID(), member=randomUUID(), stranger=randomUUID(), inactive=randomUUID();
  for(const id of [owner,member,stranger,inactive]) {
    await q('INSERT INTO auth.users VALUES($1)',[id]);
    await user(id,()=>q('INSERT INTO public.profiles(id,display_name) VALUES($1,$2)',[id,'Test profile']));
  }
  const make = uid=>user(uid,async()=> (await q("SELECT public.create_household('Test family') AS id")).rows[0].id);
  const h=await make(owner), other=await make(stranger);
  await user(owner,()=>q("INSERT INTO public.household_members(household_id,user_id,status) VALUES($1,$2,'active'),($1,$3,'inactive')",[h,member,inactive]));
  await test('11 tables and RLS enabled',async()=> {
    const rows=(await q("SELECT relname,relrowsecurity FROM pg_class JOIN pg_namespace n ON n.oid=relnamespace WHERE n.nspname='public' AND relkind='r'")).rows;
    assert.equal(rows.length,11); assert.ok(rows.every(r=>r.relrowsecurity));
  });
  await test('member can update budget incl explicit zero; NULL distinct',()=>user(member,async()=> {
    assert.equal((await q('SELECT total_budget FROM public.households WHERE id=$1',[h])).rows[0].total_budget,null);
    await q('UPDATE public.households SET total_budget=0 WHERE id=$1',[h]);
    assert.equal(Number((await q('SELECT total_budget FROM public.households WHERE id=$1',[h])).rows[0].total_budget),0);
  }));
  await test('member can configure category allocation',()=>user(member,async()=> {
    const r=await q("INSERT INTO public.budget_category_allocations(household_id,category,planned_amount) VALUES($1,'Medical',100) RETURNING id",[h]);
    await q('UPDATE public.budget_category_allocations SET planned_amount=200 WHERE id=$1',[r.rows[0].id]);
    await q('DELETE FROM public.budget_category_allocations WHERE id=$1',[r.rows[0].id]);
  }));
  await test('stranger and inactive member see no tenant records',async()=> {
    for(const id of [stranger,inactive]) await user(id,async()=>assert.equal((await q('SELECT id FROM public.households WHERE id=$1',[h])).rows.length,0));
  });
  await test('anonymous access denied',async()=>await assert.rejects(user(null,()=>q('SELECT * FROM public.households'),'anon'),e=>e.code==='42501'));
  await test('member cannot add/promote/remove membership',async()=> {
    await rejects(member,()=>q("INSERT INTO public.household_members(household_id,user_id) VALUES($1,$2)",[h,stranger]),'42501');
    await user(member,async()=> {
      assert.equal((await q("UPDATE public.household_members SET role='owner' WHERE household_id=$1 AND user_id=$2 RETURNING id",[h,member])).rows.length,0);
      assert.equal((await q('DELETE FROM public.household_members WHERE household_id=$1 AND user_id=$2 RETURNING id',[h,owner])).rows.length,0);
    });
  });
  await test('owner can change member role, cannot remove last active owner',async()=> {
    await user(owner,()=>q("UPDATE public.household_members SET role='member' WHERE household_id=$1 AND user_id=$2",[h,member]));
    await rejects(owner,()=>q("UPDATE public.household_members SET status='inactive' WHERE household_id=$1 AND user_id=$2",[h,owner]),'23514');
    await rejects(owner,()=>q('DELETE FROM public.household_members WHERE household_id=$1 AND user_id=$2',[h,owner]),'23514');
  });
  await test('household destruction unavailable pending policy',()=>rejects(owner,()=>q('DELETE FROM public.households WHERE id=$1',[h]),'42501'));
  const p=(await user(member,()=>q("INSERT INTO public.pregnancies(household_id,due_date) VALUES($1,'2020-01-01') RETURNING id",[h]))).rows[0].id;
  const twins=(await user(member,()=>q("INSERT INTO public.children(household_id,pregnancy_id,display_name) VALUES($1,$2,'Twin A'),($1,$2,'Twin B') RETURNING id",[h,p]))).rows;
  await test('overdue pregnancy remains active and twins share one pregnancy',()=>user(member,async()=> {
    assert.equal((await q('SELECT status FROM public.pregnancies WHERE id=$1',[p])).rows[0].status,'active');
    assert.equal((await q('SELECT id FROM public.children WHERE pregnancy_id=$1',[p])).rows.length,2);
  }));
  await test('cross-household reference rejected even for user in both',async()=> {
    await user(stranger,()=>q("INSERT INTO public.household_members(household_id,user_id) VALUES($1,$2)",[other,member]));
    await rejects(member,()=>q("INSERT INTO public.tasks(household_id,child_id,name) VALUES($1,$2,'Invalid')",[other,twins[0].id]),'23503');
    await rejects(member,()=>q("INSERT INTO public.children(household_id,pregnancy_id,display_name) VALUES($1,$2,'Invalid')",[other,p]),'23503');
  });
  await test('normal member CRUD all operational types',async()=> {
    const entries=[
      ['tasks',"name",['Task']],
      ['shopping_items',"item",['Item']],
      ['expenses',"title,paid_amount,expense_date",['Expense',10,'2026-10-03']],
      ['appointments',"purpose,appointment_date",['Control','2026-10-03']],
      ['documents',"title,document_type,storage_path,file_name,mime_type,size_bytes",['Doc','Receipt',`${h}/documents/test.png`,'test.png','image/png',1]],
    ];
    for(const [table,cols,values] of entries) await user(member,async()=> {
      const placeholders=values.map((_,i)=>`$${i+2}`).join(',');
      const id=(await q(`INSERT INTO public.${table}(household_id,${cols}) VALUES($1,${placeholders}) RETURNING id`,[h,...values])).rows[0].id;
      assert.equal((await q(`SELECT id FROM public.${table} WHERE id=$1`,[id])).rows.length,1);
      await q(`UPDATE public.${table} SET updated_at=now() WHERE id=$1`,[id]);
      await q(`DELETE FROM public.${table} WHERE id=$1`,[id]);
    });
  });
  await test('immutable tenant/creator and invalid values rejected',async()=> {
    await rejects(member,()=>q('UPDATE public.households SET created_by=$1 WHERE id=$2',[member,h]),'23514');
    await rejects(member,()=>q("INSERT INTO public.tasks(household_id,name,stage,target_gestational_week) VALUES($1,'Invalid',NULL,22)",[h]),'23514');
    await rejects(member,()=>q("INSERT INTO public.shopping_items(household_id,item,quantity) VALUES($1,'Invalid',0)",[h]),'23514');
    await rejects(member,()=>q("INSERT INTO public.shopping_items(household_id,item,product_url) VALUES($1,'Invalid','javascript:alert(1)')",[h]),'23514');
    await rejects(member,()=>q("INSERT INTO public.expenses(household_id,title,paid_amount,expense_date) VALUES($1,'Invalid',-1,'2026-10-03')",[h]),'23514');
  });
  await test('unknown vs zero unit price, quantity derives total',()=>user(member,async()=> {
    const rows=(await q("INSERT INTO public.shopping_items(household_id,item,quantity,estimated_unit_price) VALUES($1,'Unknown',2,NULL),($1,'Free',2,0),($1,'Priced',3,100) RETURNING quantity*estimated_unit_price AS total",[h])).rows;
    assert.equal(rows[0].total,null); assert.equal(Number(rows[1].total),0); assert.equal(Number(rows[2].total),300);
  }));
  await test('Bought without Expense rejected at commit',()=>rejects(member,()=>q("INSERT INTO public.shopping_items(household_id,item,status) VALUES($1,'Invalid','Bought')",[h]),'23514'));
  const s=(await user(member,()=>q("INSERT INTO public.shopping_items(household_id,item) VALUES($1,'Purchase') RETURNING id",[h]))).rows[0].id;
  await test('atomic purchase accepts explicit zero and one Expense',()=>user(member,async()=> {
    await q("UPDATE public.shopping_items SET status='Bought' WHERE id=$1",[s]);
    await q("INSERT INTO public.expenses(household_id,title,paid_amount,expense_date,source,shopping_item_id) VALUES($1,'Purchase',0,'2026-10-03','shopping',$2)",[h,s]);
  }));
  await test('second linked Expense rejected',()=>rejects(member,()=>q("INSERT INTO public.expenses(household_id,title,paid_amount,expense_date,source,shopping_item_id) VALUES($1,'Duplicate',1,'2026-10-03','shopping',$2)",[h,s]),'23505'));
  await test('expense cannot disappear leaving Bought',()=>rejects(member,()=>q('DELETE FROM public.expenses WHERE shopping_item_id=$1',[s]),'23514'));
  await test('atomic reverse retains history; deleting item does not cascade',async()=> {
    await user(member,async()=> {
      await q('UPDATE public.expenses SET shopping_item_id=NULL WHERE shopping_item_id=$1',[s]);
      await q("UPDATE public.shopping_items SET status='Wishlist' WHERE id=$1",[s]);
      await q('DELETE FROM public.shopping_items WHERE id=$1',[s]);
    });
    await user(member,async()=>assert.equal((await q("SELECT id FROM public.expenses WHERE household_id=$1 AND source='shopping'",[h])).rows.length,1));
  });
  await test('partial attachment metadata rejected',()=>rejects(member,()=>q("INSERT INTO public.expenses(household_id,title,paid_amount,expense_date,attachment_file_name) VALUES($1,'Invalid',1,'2026-10-03','receipt.png')",[h]),'23514'));
  await test('inactive user cannot insert',()=>rejects(inactive,()=>q("INSERT INTO public.tasks(household_id,name) VALUES($1,'Forbidden')",[h]),'42501'));
  await test('excess money precision rejected rather than rounded',()=>rejects(member,()=>q("INSERT INTO public.expenses(household_id,title,paid_amount,expense_date) VALUES($1,'Precision',0.001,'2026-10-03')",[h]),'23514'));
  await test('same-household wrong pregnancy/child combination rejected',async()=> {
    const p2=(await user(member,()=>q("INSERT INTO public.pregnancies(household_id,due_date) VALUES($1,'2027-01-01') RETURNING id",[h]))).rows[0].id;
    await rejects(member,()=>q("INSERT INTO public.documents(household_id,pregnancy_id,child_id,title,document_type,storage_path,file_name,mime_type,size_bytes) VALUES($1,$2,$3,'Wrong context','USG','wrong-context','x.png','image/png',1)",[h,p2,twins[0].id]),'23503');
  });
  await test('profile disclosure limited to self and active co-members',async()=> {
    await user(owner,async()=> {
      assert.equal((await q('SELECT id FROM public.profiles WHERE id=$1',[inactive])).rows.length,0);
      assert.equal((await q('SELECT id FROM public.profiles WHERE id=$1',[member])).rows.length,1);
    });
  });
  console.log(`Schema checks passed: ${passed}; failed: 0`);
} catch(e) {
  console.error(`Schema validation failed: ${e.code ?? ''} ${e.message}`);
  process.exitCode=1;
} finally { await db.close(); }
