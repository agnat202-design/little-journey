import assert from 'node:assert/strict';
import type {SupabaseClient} from '@supabase/supabase-js';
import {decodeHousehold,encodeHousehold,householdChanges,type HouseholdSnapshot} from './householdRecords';
import {HouseholdRepository} from './householdRepository';
import {buyShopping,reverseShopping,deleteShopping,expenseBudget} from './familyRecords';
import {calculateGestationalAge} from './businessLogic';

const householdId=crypto.randomUUID(),itemId=crypto.randomUUID();
const raw:any={household:{id:householdId,name:'User family',updated_at:'2026-10-04T00:00:00.123456+00:00',total_budget:null},
 tasks:[],expenses:[],appointments:[],documents:[],allocations:[],pregnancies:[],
 shopping_items:[{id:itemId,household_id:householdId,item:'Stroller',quantity:2,estimated_unit_price:null,priority:'Medium',status:'Wishlist',category:null,pregnancy_id:null,child_id:null,stage:'pregnancy'}]};
let before=decodeHousehold(raw);
assert.equal(before.budgetConfigured,false);
assert.equal(before.records.shoppingItems[0].estimatedPrice,undefined);
assert.equal(encodeHousehold(before).shopping_items[0].estimated_unit_price,null);
const explicit=decodeHousehold({...raw,household:{...raw.household,total_budget:0},shopping_items:[{...raw.shopping_items[0],estimated_unit_price:0}]});
assert.equal(explicit.budgetConfigured,true);assert.equal(explicit.records.shoppingItems[0].estimatedPrice,0);
assert.equal(encodeHousehold(explicit).shopping_items[0].estimated_unit_price,0);
const quantity=decodeHousehold({...raw,shopping_items:[{...raw.shopping_items[0],estimated_unit_price:125000}]});
assert.equal(quantity.records.shoppingItems[0].estimatedPrice,250000);
assert.equal(encodeHousehold(quantity).shopping_items[0].estimated_unit_price,125000);
const purchased:HouseholdSnapshot={...before,records:buyShopping(before.records,itemId,0,'2026-10-04')};
const changes=householdChanges(before,purchased);
assert.deepEqual(changes.map(r=>r.table),['shopping_items','expenses']);
assert.match(changes[1].id,/^[0-9a-f-]{36}$/);
assert.equal(changes[1].row.paid_amount,0);
assert.equal(changes[1].row.expense_date,'2026-10-04');
assert.equal(expenseBudget(100000,purchased.records).actualPaid,0);
const paidRaw={...raw,shopping_items:[{...raw.shopping_items[0],status:'Bought'}],expenses:[{...changes[1].row,id:changes[1].id,household_id:householdId}]};
const restored=decodeHousehold(paidRaw);
assert.equal(restored.records.shoppingItems[0].actualPurchasePrice,0);
assert.equal(restored.records.shoppingItems[0].purchaseDate,'2026-10-04');
assert.equal(restored.records.expenses.length,1);
const detached={...restored,records:reverseShopping(restored.records,itemId,false)};
assert.equal(householdChanges(restored,detached).find(r=>r.table==='expenses')?.row.shopping_item_id,null);
const deleted={...restored,records:deleteShopping(restored.records,itemId)};
const removal=householdChanges(restored,deleted);
assert.equal(removal.findIndex(r=>r.table==='expenses'),0);
assert.equal(removal.at(-1)?.kind,'delete');
assert.equal(removal.at(-1)?.table,'shopping_items');
const appointment=decodeHousehold({...raw,appointments:[{id:crypto.randomUUID(),purpose:'Control',appointment_date:'2026-10-28',appointment_time:'09:00:00'}]});
assert.equal(appointment.records.appointments[0].appointmentTime,'09:00');
assert.equal(encodeHousehold(appointment).appointments[0].appointment_date,'2026-10-28');
assert.equal(calculateGestationalAge('2026-10-01','2026-10-08').currentWeek,41);

let captured:any;let fail=false;const uploaded:string[]=[],removed:string[][]=[];
const client={rpc:async(name:string,args:any)=>{
 if(name==='load_household')return {data:raw,error:null};
 captured=args;if(fail)return {data:null,error:{code:'40001'}};
 const doc=args.p_changes.find((op:any)=>op.table==='documents');
 return {data:{...raw,documents:doc?[{...doc.row,id:doc.id}]:[],household:{...raw.household,updated_at:'2026-10-04T00:00:01+00:00'}},error:null};
},storage:{from:(bucket:string)=>{
 assert.equal(bucket,'family-files');return {
 upload:async(path:string,file:File,options:any)=>{assert.equal(options.upsert,false);assert.equal(file.name,'receipt.txt');uploaded.push(path);return {error:null};},
 remove:async(paths:string[])=>{removed.push(paths);return {error:null};},
 };}}} as unknown as SupabaseClient;
const repository=await HouseholdRepository.load(client,householdId);
const file=new File(['receipt'],'receipt.txt',{type:'text/plain'});
const next={...repository.current,records:{...repository.current.records,documents:[{id:crypto.randomUUID(),householdId,title:'Receipt',category:'Receipt',documentType:'Receipt' as const,fileName:file.name,fileUrl:'blob:temporary',documentDate:'2026-10-04',attachment:{id:'selected',name:file.name,size:file.size,mimeType:file.type,localUrl:'blob:temporary',file}}]}};
const committed=await repository.save(next);
assert.equal(captured.p_version,raw.household.updated_at,'Keep microsecond version string unchanged');
assert.equal(committed.records.documents[0].attachment.storagePath,uploaded[0]);
assert.equal(committed.records.documents[0].attachment.localUrl,undefined);
assert.equal(committed.records.documents[0].attachment.file,undefined);
assert.ok(!JSON.stringify(captured).includes('blob:'));
assert.equal(removed.length,0);
fail=true;
const failedRepository=await HouseholdRepository.load(client,householdId);
await assert.rejects(failedRepository.save(next));
assert.equal(failedRepository.current.records.documents.length,0);
assert.deepEqual(removed[0],[uploaded[1]],'Failed transaction removes its upload, never committed files');
assert.equal(before.records.expenses.length,0,'Pure transformations must not mutate loaded state');
console.log('PASS persistence adapters/repository: unknown/zero/quantity, purchase round-trip, deletion order, dates, overdue, microsecond version, private upload metadata, failed-save cleanup');
