import {useState} from 'react';
import {fieldClass,labelClass} from '../records/RecordEditor';
export function PregnancySetup({dueDate,onSave,onClose}:{dueDate?:string;onSave:(date:string)=>boolean | Promise<boolean>;onClose:()=>void}) {
 const [date,setDate]=useState(dueDate || '');
 return <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"><form role="dialog" aria-modal="true" aria-labelledby="pregnancy-setup-title" className="w-full max-w-md rounded-[28px] bg-white p-6 space-y-4" onSubmit={e=>{e.preventDefault();if(!date)return;const result=onSave(date);if(result instanceof Promise)void result.then(ok=>{if(ok)onClose();});else if(result)onClose();}}>
  <h2 id="pregnancy-setup-title" className="text-xl font-black text-[#34236B]">Atur HPL</h2>
  <p className="text-sm text-[#79738E]">Minggu, trimester, dan progres dihitung dari tanggal ini.</p>
  <div><label className={labelClass} htmlFor="due-date">Hari Perkiraan Lahir *</label><input id="due-date" type="date" required value={date} onChange={e=>setDate(e.target.value)} className={fieldClass}/></div>
  <div className="flex gap-3"><button type="button" onClick={onClose} className="flex-1 py-3 font-bold text-[#79738E]">Batal</button><button className="flex-1 rounded-2xl bg-gradient-to-r from-[#34236B] to-[#6C4CF5] py-3 font-black text-white" disabled={!date}>Simpan</button></div>
 </form></div>;
}
