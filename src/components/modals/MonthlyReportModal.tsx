import React,{useState} from 'react';
import type {HouseholdRuntime} from '../HouseholdGate';
import {decodeHousehold} from '../../lib/householdRecords';
import {monthlyReport,downloadReportFile} from '../../lib/monthlyReport';
export function MonthlyReportModal({runtime,onClose}:{runtime:HouseholdRuntime;onClose:()=>void}) {
  const [month,setMonth]=useState(new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',timeZone:'Asia/Jakarta'}).format(new Date()).slice(0,7));
  const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
  async function download(full:boolean){if(busy || !month)return;setBusy(true);setMessage('');try {
    if(!runtime.client)throw new Error();
    const result=await runtime.client.rpc('load_household',{p_household_id:runtime.initial.householdId});if(result.error)throw result.error;
    if(full){
      const [children,profile]=await Promise.all([runtime.client.from('children').select('*').eq('household_id',runtime.initial.householdId),runtime.client.from('profiles').select('*').eq('id',runtime.user!.id)]);
      if(children.error || profile.error)throw children.error || profile.error;
      downloadReportFile('little-journey-data-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify({format:'little-journey-export',version:1,exportedAt:new Date().toISOString(),includesAttachmentFiles:false,data:result.data,children:children.data,profile:profile.data,accountEmail:runtime.user?.email},null,2),'application/json');
    }else downloadReportFile('little-journey-laporan-'+month+'.html',monthlyReport(decodeHousehold(result.data),month),'text/html;charset=utf-8');
    setMessage('Unduhan disiapkan. Periksa folder Downloads.');
  }catch{setMessage('Unduhan gagal. Coba lagi; data di akun tidak diubah.');}finally{setBusy(false);}}
  return <div className="fixed inset-0 z-50 bg-[#292442]/40 flex items-center justify-center p-4"><section role="dialog" aria-modal="true" aria-labelledby="monthly-report-title" className="w-full max-w-md rounded-[28px] bg-white p-6 space-y-4"><h2 id="monthly-report-title" className="text-xl font-black">Laporan Bulanan</h2><label className="block text-sm font-bold">Bulan<input type="month" required value={month} onChange={e=>setMonth(e.target.value)} className="mt-2 w-full rounded-xl border border-[#EBE6DC] p-3"/></label><p className="text-xs text-[#79738E]">Pengeluaran, jadwal, dan dokumen sesuai bulan. Checklist, belanja, dan budget menampilkan kondisi saat diunduh.</p><button disabled={busy || !month} onClick={()=>void download(false)} className="w-full rounded-full bg-[#6C4CF5] p-3 font-bold text-white disabled:opacity-50">Download Laporan Bulanan</button><button disabled={busy} onClick={()=>void download(true)} className="w-full rounded-full bg-[#EEE9FF] p-3 font-bold text-[#6C4CF5] disabled:opacity-50">Download Semua Data (JSON)</button><p className="text-xs text-[#79738E]">Laporan HTML bisa dibuka di browser dan dicetak ke PDF. JSON menyimpan semua catatan, termasuk nama keluarga dan anak. File lampiran asli tidak ikut; unduh terpisah. Fitur impor belum tersedia.</p>{message && <p role="status" className="text-sm">{message}</p>}<button disabled={busy} onClick={onClose} className="w-full p-2 font-bold">Tutup</button></section></div>;
}
