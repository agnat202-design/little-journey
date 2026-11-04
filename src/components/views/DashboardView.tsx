import { priorityLabel } from '../../lib/plainLabels';
import React from 'react';
import { PipMascot } from '../mascot/PipMascot';
import {
  formatIDR,
  formatIDRCompact,

} from '../../data/mockData';
import { Calendar, CheckCircle2, FolderOpen, Wallet, ShoppingBag, ArrowRight } from 'lucide-react';
import { BudgetCalculationResult } from '../../lib/businessLogic';
import { DesktopNavKey } from '../layout/DesktopSidebar';
import { JourneyStage, DerivedPregnancyMetrics, ChecklistItem, ShoppingItem, Expense, Appointment } from '../../types/domain';
import { shoppingSpend, displayDate } from '../../lib/familyRecords';
import { JourneyHero } from '../dashboard/JourneyHero';

interface DashboardViewProps {
  onNavigateTab: (tab: DesktopNavKey) => void;
  onToggleChecklist: (id: string) => void;
  checklistItems: ChecklistItem[];
  shoppingItems: ShoppingItem[];
  expenses: Expense[];
  appointments: Appointment[];
  budgetSummary: BudgetCalculationResult;
  stage: JourneyStage;
  pregnancyMetrics?: DerivedPregnancyMetrics;
  pregnancyDueDate?: string;
  isDemo?: boolean;
  isBudgetConfigured: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onToggleChecklist,
  checklistItems,
  shoppingItems,
  expenses,
  appointments,
  budgetSummary,
  stage,
  pregnancyMetrics,
  pregnancyDueDate,
  isDemo = true,
  isBudgetConfigured,
}) => {
  const completed=checklistItems.filter(i=>i.status==='Completed').length;
  const pending=checklistItems.filter(i=>i.status!=='Completed'&&i.status!=='Skipped');
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const today=['year','month','day'].map(k=>parts.find(p=>p.type===k)?.value).join('-');
  const upcoming=appointments.filter(a=>a.appointmentDate>=today).sort((a,b)=>a.appointmentDate.localeCompare(b.appointmentDate)||(a.appointmentTime||'23:59').localeCompare(b.appointmentTime||'23:59')).slice(0,2);
  const tasks=[...pending].sort((a,b)=>(a.targetDate||'9999').localeCompare(b.targetDate||'9999')).slice(0,3);
  const remaining=shoppingItems.filter(i=>!['Bought','Received','Skip'].includes(i.status)).length;
  const card='rounded-2xl border border-[#EAE7F0] bg-white p-4 sm:p-5';
  return <div className="space-y-5 px-4 pb-28 max-w-5xl mx-auto">
    {pregnancyMetrics&&pregnancyDueDate?<JourneyHero stage={stage} pregnancyMetrics={pregnancyMetrics} demoDueDate={pregnancyDueDate} isDemo={isDemo}/>:<section className={card}><p className="text-xs font-bold text-[#6C4CF5]">LITTLE JOURNEY</p><h1 className="mt-1 text-2xl font-black">Perjalanan keluarga</h1><p className="mt-2 text-sm text-[#79738E]">Catat kebutuhan, pengeluaran, dan jadwal keluarga di sini.</p></section>}
    <section aria-label="Akses cepat" className="grid grid-cols-4 gap-2">{[['appointments','Jadwal',Calendar],['documents','Dokumen',FolderOpen],['shopping','Belanja',ShoppingBag],['budget','Keuangan',Wallet]].map(([key,label,Icon])=>{const Symbol=Icon as typeof Calendar;return <button key={String(key)} onClick={()=>onNavigateTab(key as DesktopNavKey)} className="flex flex-col items-center gap-2 py-3 rounded-2xl bg-white border border-[#EAE7F0] text-[#34236B]"><span className="rounded-xl bg-[#EEE9FF] p-2"><Symbol className="w-5 h-5"/></span><span className="text-xs font-bold">{String(label)}</span></button>;})}</section>
    <div className="grid lg:grid-cols-2 gap-5 items-start"><section className={card}><div className="flex items-center justify-between gap-2"><h2 className="text-base font-black">Jadwal terdekat</h2><button onClick={()=>onNavigateTab('appointments')} className="text-xs font-bold text-[#6C4CF5] px-2 py-2">Lihat semua →</button></div>{upcoming.length?upcoming.map(a=><button key={a.id} onClick={()=>onNavigateTab('appointments')} className="block w-full text-left border-t border-[#F0ECE4] py-3 mt-2"><p className="text-xs font-bold text-[#138D83]">{a.appointmentDate===today?'Hari ini':displayDate(a.appointmentDate)}{a.appointmentTime?' • '+a.appointmentTime:''}</p><h3 className="font-black text-sm mt-1">{a.purpose}</h3><p className="text-xs text-[#79738E] mt-1">{[a.doctor,a.hospital].filter(Boolean).join(' • ')}</p></button>):<div className="py-4"><p className="text-sm text-[#79738E]">Belum ada jadwal kontrol.</p><button onClick={()=>onNavigateTab('appointments')} className="mt-3 rounded-xl bg-[#EEE9FF] text-[#6C4CF5] px-3 py-2 text-xs font-bold">Atur jadwal kontrol</button></div>}</section>
    <section aria-label="Ringkasan Keuangan" className={card}><div className="flex items-center justify-between"><h2 className="text-base font-black">Keuangan keluarga</h2><button aria-label="Buka Rincian Keuangan" onClick={()=>onNavigateTab('budget')} className="text-[#6C4CF5] p-2"><ArrowRight className="w-5 h-5"/></button></div><p className="text-xs text-[#79738E] mt-3">Sudah dibayar</p><p className="text-2xl font-black mt-1">{formatIDR(budgetSummary.actualPaid)}</p><div className="grid grid-cols-2 gap-3 mt-4"><div className="rounded-xl bg-[#F6F3FF] p-3"><p className="text-xs text-[#79738E]">Perkiraan seluruh kebutuhan</p><p className="font-black text-sm mt-1">{formatIDR(budgetSummary.projectedFinalCost)}</p></div><div className="rounded-xl bg-[#ECF9F5] p-3"><p className="text-xs text-[#79738E]">Sisa setelah rencana</p><p className="font-black text-sm mt-1">{isBudgetConfigured?formatIDR(budgetSummary.projectedBuffer):'Belum atur anggaran'}</p></div></div><details className="mt-3 text-xs text-[#79738E]"><summary className="cursor-pointer py-2">Rincian belanja</summary><p>Total Belanja (Riwayat Pengeluaran): {formatIDR(shoppingSpend(expenses))}</p><p className="mt-1">Termasuk transaksi yang dipertahankan setelah status dibatalkan atau barang dihapus.</p><p className="mt-1">{remaining} barang belum dibeli.</p></details></section>
    <section className={card}><div className="flex justify-between items-center gap-2"><h2 className="text-base font-black">Persiapan berikutnya</h2><button onClick={()=>onNavigateTab('checklist')} className="px-2 py-2 text-xs font-bold text-[#6C4CF5]">Lihat semua →</button></div><p className="text-xs text-[#79738E] mt-1">{completed} dari {checklistItems.length} checklist selesai</p>{tasks.length?tasks.map(t=><div key={t.id} className="flex gap-3 items-start border-t border-[#F0ECE4] mt-3 pt-3"><button aria-label={'Selesaikan '+t.name} onClick={()=>onToggleChecklist(t.id)} className="shrink-0 p-1 text-[#79738E]"><CheckCircle2 className="w-6 h-6"/></button><div><h3 className="text-sm font-bold">{t.name}</h3>{t.targetDate&&<p className={t.targetDate<today?'text-xs text-[#B14435] mt-1':'text-xs text-[#79738E] mt-1'}>{t.targetDate<today?'Lewat target • ':''}{displayDate(t.targetDate)}</p>}</div></div>):<p className="text-sm text-[#79738E] py-4">{checklistItems.length?'Semua persiapan sudah selesai.':'Belum ada checklist.'}</p>}</section>
    <section className="rounded-2xl bg-[#EEE9FF] p-5"><h2 className="text-base font-black">Simpan hasil pemeriksaan</h2><p className="text-sm text-[#655B7B] mt-2">Kumpulkan hasil lab, USG, dan surat kontrol agar mudah ditemukan lagi.</p><button onClick={()=>onNavigateTab('documents')} className="mt-3 rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#6C4CF5]">Buka Dokumen →</button></section></div>
  </div>;
};
