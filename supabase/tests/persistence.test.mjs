// Real PostgreSQL semantics in isolated PGlite; Storage HTTP is tested separately.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
const require=createRequire(resolve('tmp/schema-validation/package.json'));
const {PGlite}=require('@electric-sql/pglite');
const db=new PGlite();
const q=(s,a=[])=>db.query(s,a);
let count=0;
async function user(id,run,role='authenticated') {
 await db.exec(`BEGIN; SET LOCAL ROLE ${role};`);
 await q("SELECT set_config('request.jwt.claim.sub',$1,true)",[id || '']);
 try{const result=await run();await db.exec('COMMIT');return result;}catch(e){await db.exec('ROLLBACK');throw e;}
}
async function test(name,fn){await fn();console.log('PASS '+name);count++;}
const up=(table,id,row)=>({table,id,kind:'upsert',row});
const del=(table,id)=>({table,id,kind:'delete'});
try {
 await db.exec(`CREATE ROLE anon;CREATE ROLE authenticated;
 CREATE SCHEMA auth;CREATE TABLE auth.users(id uuid PRIMARY KEY);
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 GRANT USAGE ON SCHEMA auth TO authenticated,anon;
 CREATE SCHEMA storage;CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint);
 CREATE TABLE storage.objects(id uuid DEFAULT gen_random_uuid(),bucket_id text,name text);
 ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
 CREATE FUNCTION storage.foldername(text) RETURNS text[] LANGUAGE sql IMMUTABLE AS $$ SELECT string_to_array($1,'/') $$;
 GRANT USAGE ON SCHEMA storage TO authenticated;GRANT SELECT,INSERT,DELETE ON storage.objects TO authenticated;`);
 await db.exec(await readFile('supabase/migrations/202610030001_household_schema.sql','utf8'));
 await db.exec(await readFile('supabase/migrations/202610040001_mvp_persistence.sql','utf8'));
 const owner=randomUUID(), stranger=randomUUID(), member=randomUUID();
 for(const id of [owner,stranger,member])await q('INSERT INTO auth.users VALUES($1)',[id]);
 const setup=(id,name)=>user(id,async()=> (await q('SELECT public.setup_household($1,$2,$3) AS id',[name,'User input','2027-01-01'])).rows[0].id);
 const h=await setup(owner,'My family'), other=await setup(stranger,'Another family');
 await user(member,()=>q("INSERT INTO public.profiles(id,display_name) VALUES($1,'Member')",[member]));
 await user(owner,()=>q("INSERT INTO public.household_members(household_id,user_id) VALUES($1,$2)",[h,member]));
 const load=(id=owner,house=h)=>user(id,async()=> (await q('SELECT public.load_household($1) AS data',[house])).rows[0].data);
 let snapshot=await load();
 const save=(changes,budget=null,id=owner,version=snapshot.household.updated_at)=>user(id,async()=> (await q('SELECT public.save_household_changes($1,$2,$3,$4) AS data',[h,version,JSON.stringify(changes),budget===null?null:JSON.stringify(budget)])).rows[0].data);
 await test('Household bootstrap is idempotent and derives no stored pregnancy metrics',async()=>{
  assert.equal(await setup(owner,'Do not duplicate'),h);
  assert.equal(snapshot.pregnancies.length,1);assert.equal(snapshot.tasks.length,0);
  assert.equal(snapshot.pregnancies[0].due_date,'2027-01-01');assert.equal(snapshot.pregnancies[0].current_week,undefined);
 });
 const item=randomUUID(),expense=randomUUID(),appointment=randomUUID(),task=randomUUID(),document=randomUUID();
 const shopping={item:'Stroller',quantity:1,estimated_unit_price:null,priority:'Medium',status:'Wishlist',stage:'pregnancy'};
 await test('Save/reload task, shopping unknown estimate, appointment ISO date and budget',async()=>{
  snapshot=await save([up('shopping_items',item,shopping),up('tasks',task,{name:'Pack bag',priority:'Medium',status:'Pending'}),
   up('appointments',appointment,{purpose:'Control',appointment_date:'2026-10-28',appointment_time:'09:00',doctor:'User doctor',hospital:'User clinic'})],{total_budget:1000000});
  const restored=await load();assert.equal(restored.household.total_budget,1000000);
  assert.equal(restored.shopping_items[0].estimated_unit_price,null);assert.equal(restored.tasks[0].name,'Pack bag');
  assert.equal(restored.appointments[0].appointment_date,'2026-10-28');assert.equal(restored.appointments[0].appointment_time,'09:00:00');
 });
 await test('Failed purchase rolls back Shopping and Expense together',async()=>{
  await assert.rejects(save([up('shopping_items',item,{...shopping,status:'Bought'}),up('expenses',expense,{title:'Stroller',paid_amount:-1,expense_date:'2026-10-04',source:'shopping',shopping_item_id:item})]),e=>e.code==='23514');
  assert.equal((await load()).shopping_items[0].status,'Wishlist');assert.equal((await load()).expenses.length,0);
 });
 await test('Explicit free purchase persists one Expense and linked Bought state',async()=>{
  snapshot=await save([up('shopping_items',item,{...shopping,status:'Bought'}),up('expenses',expense,{title:'Stroller',paid_amount:0,expense_date:'2026-10-04',source:'shopping',shopping_item_id:item})]);
  assert.equal(snapshot.expenses[0].paid_amount,0);assert.equal(snapshot.expenses[0].shopping_item_id,item);
 });
 await test('Stale second tab cannot overwrite newer data',async()=>{
  const stale=snapshot.household.updated_at;
  snapshot=await save([up('tasks',task,{name:'Pack bag',priority:'Medium',status:'Completed'})]);
  await assert.rejects(save([del('tasks',task)],null,owner,stale),e=>e.code==='40001');assert.equal((await load()).tasks[0].status,'Completed');
 });
 await test('Reverse status preserves detached Expense; buying again creates one active link',async()=>{
  snapshot=await save([up('shopping_items',item,shopping),up('expenses',expense,{title:'Stroller',paid_amount:0,expense_date:'2026-10-04',source:'shopping',shopping_item_id:null})]);
  assert.equal(snapshot.expenses.length,1);assert.equal(snapshot.expenses[0].shopping_item_id,null);
  const nextExpense=randomUUID();snapshot=await save([up('shopping_items',item,{...shopping,status:'Bought'}),up('expenses',nextExpense,{title:'Stroller',paid_amount:125000,expense_date:'2026-10-05',source:'shopping',shopping_item_id:item})]);
  assert.equal(snapshot.expenses.reduce((n,e)=>n+e.paid_amount,0),125000);
  snapshot=await save([up('expenses',nextExpense,{title:'Stroller',paid_amount:125000,expense_date:'2026-10-05',source:'shopping',shopping_item_id:null}),del('shopping_items',item)]);
  assert.equal(snapshot.shopping_items.length,0);assert.equal(snapshot.expenses.length,2);
 });
 await test('Normal active member may save; stranger/anonymous cannot access household RPC',async()=>{
  snapshot=await save([up('tasks',task,{name:'Updated by member',priority:'Medium',status:'Completed'})],null,member);
  await assert.rejects(load(stranger),e=>e.code==='42501');
  await assert.rejects(save([],null,stranger),e=>e.code==='42501');
  await assert.rejects(user(null,()=>q('SELECT public.load_household($1)',[h]),'anon'),e=>e.code==='42501');
 });
 await test('Private Storage enforces household path; document metadata cannot reference another household',async()=>{
  const path=`${h}/${randomUUID()}`;
  await user(owner,()=>q("INSERT INTO storage.objects(bucket_id,name) VALUES('family-files',$1)",[path]));
  assert.equal((await user(stranger,()=>q('SELECT * FROM storage.objects'))).rows.length,0);
  await assert.rejects(user(stranger,()=>q("INSERT INTO storage.objects(bucket_id,name) VALUES('family-files',$1)",[path])),e=>e.code==='42501');
  await assert.rejects(save([up('documents',document,{title:'Receipt',document_type:'Receipt',storage_path:`${other}/file`,file_name:'receipt.pdf',mime_type:'application/pdf',size_bytes:10})]),e=>e.code==='23514');
  snapshot=await save([up('documents',document,{title:'Receipt',document_type:'Receipt',document_date:'2026-10-04',storage_path:path,file_name:'receipt.pdf',mime_type:'application/pdf',size_bytes:10})]);
  assert.equal((await load()).documents[0].storage_path,path);
  snapshot=await save([del('documents',document),del('appointments',appointment)]);assert.equal(snapshot.documents.length,0);assert.equal(snapshot.appointments.length,0);
 });
 await test('Caller cannot mutate arbitrary tables or ownership fields',async()=>{
  await assert.rejects(save([up('household_members',randomUUID(),{user_id:stranger})]),e=>e.code==='22023');
  snapshot=await save([up('tasks',task,{name:'Still ours',priority:'Low',status:'Pending',household_id:other,created_by:stranger})]);
  assert.equal(snapshot.tasks[0].household_id,h);assert.equal(snapshot.tasks[0].created_by,owner);
  const foreignTask=randomUUID();
  await user(stranger,()=>q("INSERT INTO public.tasks(id,household_id,name) VALUES($1,$2,'Another household task')",[foreignTask,other]));
  await assert.rejects(save([up('tasks',foreignTask,{name:'Attempted overwrite',priority:'Medium',status:'Pending'})]),e=>e.code==='42501');
 });
 console.log(`Persistence SQL: ${count} groups passed`);
}finally{await db.close();}
