import type { ChecklistItem, LocalAttachment } from '../types/domain';
import type { FamilyRecords } from './familyRecords';
import { expenseCategoryLabel } from './expenseCategories';
export type SearchKind = 'Dokumen' | 'Pengeluaran' | 'Jadwal' | 'Checklist' | 'Belanja';
export interface SearchRecord {id:string;kind:SearchKind;title:string;notes?:string;date?:string;meta:string;amount?:number;attachment?:LocalAttachment;}
const normalize=(value:string)=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const aliases:Record<string,string>={laboratorium:'lab',laboratory:'lab',laboratories:'lab'};
const words=(value:string)=>normalize(value).split(/\s+/).map(w=>aliases[w]||w);
export function searchRecords(records:FamilyRecords,tasks:ChecklistItem[],query:string,kind:SearchKind|'Semua'='Semua'):SearchRecord[]{
 const terms=words(query).filter(Boolean);if(!terms.length)return [];
 const all:SearchRecord[]=[
 ...records.documents.map(d=>({id:d.id,kind:'Dokumen' as const,title:d.title,notes:d.notes,date:d.documentDate,meta:d.documentType,attachment:d.attachment})),
 ...records.expenses.map(e=>({id:e.id,kind:'Pengeluaran' as const,title:e.title,notes:e.notes,date:e.expenseDate,meta:expenseCategoryLabel(e.category),amount:e.paidAmount,attachment:e.attachment})),
 ...records.appointments.map(a=>({id:a.id,kind:'Jadwal' as const,title:a.purpose,notes:a.notes,date:a.appointmentDate,meta:[a.doctor,a.hospital,a.appointmentTime].filter(Boolean).join(' • ')})),
 ...tasks.map(t=>({id:t.id,kind:'Checklist' as const,title:t.name,notes:t.notes==='Ditambahkan dari Catat Cepat'?undefined:t.notes,date:t.targetDate,meta:t.category+' • '+(t.status==='Completed'?'Selesai':'Belum selesai')})),
 ...records.shoppingItems.map(s=>({id:s.id,kind:'Belanja' as const,title:s.item,notes:s.notes,date:s.purchaseDate||s.targetDate,meta:[s.category,s.brand,s.model,s.store].filter(Boolean).join(' • '),amount:s.actualPurchasePrice??s.estimatedPrice}))];
 return all.filter(r=>kind==='Semua'||r.kind===kind).map(r=>({r,haystack:words([r.title,r.notes,r.meta,r.date,r.attachment?.name].filter(Boolean).join(' ')).join(' ')})).filter(({haystack})=>terms.every(t=>haystack.includes(t))).sort((a,b)=>Number(words(b.r.title).join(' ').includes(terms.join(' ')))-Number(words(a.r.title).join(' ').includes(terms.join(' ')))||(b.r.date||'').localeCompare(a.r.date||'')||a.r.title.localeCompare(b.r.title)).map(({r})=>r);
}
