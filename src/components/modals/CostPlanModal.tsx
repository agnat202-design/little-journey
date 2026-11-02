import {formatRupiahInput,readRupiahInput} from '../../lib/rupiahInput';
import {ExtraAttachments} from '../records/ExtraAttachments';
import React,{useState} from 'react';
import type {Expense,LocalAttachment} from '../../types/domain';
import type {SupabaseClient} from '@supabase/supabase-js';
import {isRecordDate} from '../../lib/familyRecords';
import {expenseCategories,expenseCategoryLabel} from '../../lib/expenseCategories';
import {fieldClass,labelClass,AttachmentPicker} from '../records/RecordEditor';
export function CostPlanModal({expense,paying,client,onSave,onClose}:{expense?:Expense;paying?:boolean;client?:SupabaseClient;onSave:(data:{title:string;amount:number;date:string;category:string;notes?:string;attachment?:LocalAttachment;extraAttachments?:LocalAttachment[]})=>boolean|Promise<boolean>;onClose:()=>void}){
 const [attachment,setAttachment]=useState(expense?.attachment);const [extraAttachments,setExtraAttachments]=useState(expense?.extraAttachments||[]);
 const [title,setTitle]=useState(expense?.title||'');const [amount,setAmount]=useState(String(expense?.totalAmount??''));const [date,setDate]=useState(paying?'':expense?.expenseDate||'');const [category,setCategory]=useState(expense?.category||'Medical');const [notes,setNotes]=useState(expense?.notes||'');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const value=amount.trim()?Number(amount):NaN;const valid=title.trim()&&Number.isFinite(value)&&value>0&&value<=999999999999.99&&Math.abs(value*100-Math.round(value*100))<0.000001&&isRecordDate(date);
 return <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"><form role="dialog" aria-modal="true" aria-labelledby="cost-plan-title" className="bg-white rounded-[28px] p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4" onSubmit={async e=>{e.preventDefault();if(!valid||busy)return;setBusy(true);setError('');try{
 if(client){const check=await client.from('expenses').select('total_amount').limit(0);if(check.error){setError('Rencana Biaya belum aktif di database. Jalankan pembaruan database 202611010001 terlebih dahulu.');return;}}
 const ok=await onSave({title:title.trim(),amount:value,date,category,notes:notes.trim()||undefined,attachment,extraAttachments});if(ok)onClose();else setError('Belum berhasil disimpan. Periksa pemberitahuan penyimpanan.');
 }catch{setError('Belum berhasil disimpan. Silakan coba lagi.');}finally{setBusy(false);}}}>
 <h2 id="cost-plan-title" className="font-black text-xl">{paying?'Catat Pembayaran':expense?'Edit Rencana Biaya':'Tambah Rencana Biaya'}</h2><p className="text-xs text-[#79738E]">{paying?'Isi jumlah yang benar-benar dibayar. Rencana ini akan diganti menjadi pengeluaran, tanpa dihitung dua kali.':'Untuk pemeriksaan, persalinan, vaksin, atau biaya lain yang belum dibayar. Masuk proyeksi, bukan uang yang sudah keluar.'}</p>
 <label className={labelClass}>Nama biaya<input id="plan-title" required value={title} onChange={e=>setTitle(e.target.value)} className={fieldClass}/></label>
 <label className={labelClass}>{paying?'Jumlah dibayar (Rp)':'Perkiraan biaya (Rp)'}<input id="plan-amount" required type="text" inputMode="decimal" value={formatRupiahInput(amount)} onChange={e=>setAmount(readRupiahInput(e.target.value))} className={fieldClass}/></label>
 <label className={labelClass}>{paying?'Tanggal pembayaran':'Rencana tanggal pembayaran'}<input id="plan-date" required type="date" value={date} onChange={e=>setDate(e.target.value)} className={fieldClass}/></label>
 <label className={labelClass}>Kategori<select value={category} onChange={e=>setCategory(e.target.value)} className={fieldClass}>{[...new Set([...expenseCategories,category])].map(c=><option key={c} value={c}>{expenseCategoryLabel(c)}</option>)}</select></label>
 <label className={labelClass}>Catatan (opsional)<textarea id="plan-notes" value={notes} onChange={e=>setNotes(e.target.value)} className={fieldClass}/></label>
 <AttachmentPicker value={attachment} onChange={setAttachment}/><ExtraAttachments value={extraAttachments} onChange={setExtraAttachments}/>
 {error&&<p role="alert" className="text-sm text-[#B14435]">{error}</p>}<div className="flex gap-2"><button type="button" disabled={busy} onClick={onClose} className="flex-1 rounded-xl bg-[#F5F3ED] p-3 font-bold">Batal</button><button disabled={!valid||busy} className="flex-1 rounded-xl bg-[#6C4CF5] text-white p-3 font-bold disabled:opacity-40">{busy?'Menyimpan…':paying?'Simpan Pembayaran':'Simpan Rencana'}</button></div>
 </form></div>;
}
