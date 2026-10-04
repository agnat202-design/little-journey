import React from 'react';
import { PipMascot } from '../mascot/PipMascot';
import {
  formatIDR,
  formatIDRCompact,

} from '../../data/mockData';
import { Calendar, CheckCircle2, ChevronRight, Clock, ArrowRight } from 'lucide-react';
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
  // Counts & Amounts
  const completedChecklist = checklistItems.filter((i) => i.status === 'Completed').length;
  const totalChecklist = checklistItems.length;
  const prepPercent = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

  const boughtItems = shoppingItems.filter((i) => i.status === 'Bought' || i.status === 'Received');
  const boughtCount = boughtItems.length;
  const shoppingSpent = shoppingSpend(expenses);

  const pendingItems = shoppingItems.filter(
    (i) => i.status !== 'Bought' && i.status !== 'Received' && i.status !== 'Skip'
  );
  const pendingCount = pendingItems.length;
  const shoppingPending = pendingItems.reduce(
    (acc, i) => acc + (i.estimatedPrice ?? 0) * (i.quantity || 1),
    0
  );

  const pendingPricesKnown = pendingItems.every(i => i.estimatedPrice != null);
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const nextAppt = appointments.filter(a => a.appointmentDate >= today).sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate))[0];
  const urgentShopping = pendingItems[0];

  return (
    <div className="space-y-4 px-4 pb-24 pt-2 max-w-6xl mx-auto">
      {/* DESKTOP 2-COLUMN COMPOSITION (>= 1024px) / MOBILE VERTICAL STACK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN (7 COLS ON DESKTOP): Journey Hero, Budget Pulse, Readiness */}
        <div className="lg:col-span-7 space-y-4">
          {/* 1. JOURNEY HERO (Architectural seam; renders PregnancyHero for active stage) */}
          {pregnancyMetrics && pregnancyDueDate ? <JourneyHero stage={stage} pregnancyMetrics={pregnancyMetrics} demoDueDate={pregnancyDueDate} isDemo={isDemo}/> : <section className="rounded-[30px] bg-gradient-to-br from-[#34236B] to-[#6C4CF5] p-6 text-white"><h1 className="text-2xl font-black">Perjalanan keluarga</h1><p className="mt-2 text-sm text-white/80">Catat kebutuhan, pengeluaran, dan jadwal keluarga di sini.</p></section>}

          {/* 2. BUDGET OVERVIEW (3-Second Financial Clarity in IDR) */}
          <section 
            aria-label="Ringkasan Budget"
            className="bg-white rounded-[28px] p-5 sm:p-6 border border-[#F0ECE4] shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#79738E]">
                  Dana & Pengeluaran Keluarga
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-[#34236B]">
                    {formatIDRCompact(budgetSummary.actualPaid)}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-[#79738E]">
                    {isBudgetConfigured ? `terpakai (${budgetSummary.spentPercentage}%)` : 'pengeluaran tercatat'}
                  </span>
                </div>
                <span className="text-[10px] text-[#79738E] font-bold block mt-0.5">
                  Belanja Barang: {formatIDR(shoppingSpent)} • lihat Riwayat Pengeluaran
                  {!isBudgetConfigured && <span className="block">Atur budget pertama kamu.</span>}
                </span>
              </div>
              <button
                onClick={() => onNavigateTab('budget')}
                className="p-2.5 rounded-2xl bg-[#EEE9FF] text-[#6C4CF5] hover:bg-[#6C4CF5] hover:text-white transition-colors cursor-pointer"
                aria-label="Buka Rincian Budget"
              >
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-3.5 rounded-full bg-[#F4F1EA] overflow-hidden p-0.5 my-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#6C4CF5] to-[#FF786A] transition-all duration-500"
                style={{ width: `${Math.min(100, budgetSummary.spentPercentage)}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-[#F5F2EA]">
              <div>
                <span className="text-[#79738E] font-bold block text-[10px] uppercase">Total Budget</span>
                <span className="font-black text-[#292442] text-sm">{isBudgetConfigured ? formatIDR(budgetSummary.totalBudget) : '-'}</span>
              </div>
              <div className="text-right">
                <span className="text-[#79738E] font-bold block text-[10px] uppercase">Sisa Budget</span>
                <span className="font-black text-[#1EA896] text-sm">{isBudgetConfigured ? formatIDR(budgetSummary.remainingBudget) : '-'}</span>
              </div>
            </div>
          </section>

          {/* 3. PREPARATION READINESS CARD */}
          <section 
            aria-label="Kesiapan Persiapan"
            className="bg-white rounded-[28px] p-5 sm:p-6 border border-[#F0ECE4] shadow-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#79738E]">
                  Kesiapan Persiapan
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#292442]">
                  Persiapan {prepPercent}% Selesai
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('checklist')}
                className="text-xs font-extrabold text-[#6C4CF5] flex items-center gap-1 hover:underline cursor-pointer"
              >
                Semua ({totalChecklist})
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="w-full h-4 rounded-full bg-[#F4F1EA] overflow-hidden p-0.5 mb-3.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#52D6C7] to-[#6C4CF5] transition-all duration-500"
                style={{ width: `${prepPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-center">
              <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#F0ECE4]">
                <span className="text-[11px] font-bold text-[#79738E] block">Checklist Selesai</span>
                <span className="text-base font-black text-[#1EA896]">
                  {completedChecklist} dari {totalChecklist} item
                </span>
              </div>
              <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#F0ECE4]">
                <span className="text-[11px] font-bold text-[#79738E] block">Fokus Tahapan</span>
                <span className="text-base font-black text-[#6C4CF5]">
                  {pregnancyMetrics?`${isDemo?'Demo • ':''}Trimester ${pregnancyMetrics.trimester}`:'Keluarga'}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN (5 COLS ON DESKTOP): Next Up, Actionable Tasks, Shopping Status */}
        <div className="lg:col-span-5 space-y-4">
          {/* 4. NEXT UP (Actionable Stacked Cards) */}
          <section aria-label="Jadwal & Tugas Terdekat">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <h2 className="text-sm font-black text-[#292442] uppercase tracking-wider">
                Jadwal Terdekat
              </h2>
              
            </div>

            <div className="space-y-2.5">
              {/* Next Doctor Visit */}
              {!nextAppt && <p className="p-4 bg-white rounded-[24px] text-xs text-[#79738E]">Belum ada jadwal kontrol.</p>}
              {nextAppt && (
                <div 
                  onClick={() => onNavigateTab('appointments')}
                  className="bg-white rounded-[24px] p-4 border border-[#F0ECE4] shadow-xs flex items-center justify-between gap-3 cursor-pointer active:scale-99 hover:border-[#6C4CF5] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#E7FAF5] text-[#1EA896] flex items-center justify-center font-black shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#E7FAF5] text-[#1EA896]">
                          {displayDate(nextAppt.appointmentDate)}{nextAppt.appointmentTime && ` • ${nextAppt.appointmentTime}`}
                        </span>
                      </div>
                      <h3 className="text-xs font-black text-[#292442] mt-0.5 line-clamp-1">
                        {nextAppt.purpose}
                      </h3>
                      <p className="text-[11px] font-bold text-[#79738E] line-clamp-1">
                        {nextAppt.doctor} • {nextAppt.hospital}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#79738E] shrink-0" />
                </div>
              )}

              {/* Urgent Gear Purchase */}
              {urgentShopping && (
                <div 
                  onClick={() => onNavigateTab('shopping')}
                  className="bg-white rounded-[24px] p-4 border border-[#F0ECE4] shadow-xs flex items-center justify-between gap-3 cursor-pointer active:scale-99 hover:border-[#6C4CF5] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#FFF0E9] text-[#FF786A] flex items-center justify-center font-black shrink-0">
                      <span className="text-lg">🚗</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        {urgentShopping.targetGestationalWeek && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FFF0E9] text-[#FF786A]">
                            Target W{urgentShopping.targetGestationalWeek}
                          </span>
                        )}
                        <span className="text-[10px] text-[#79738E] font-bold">
                          {urgentShopping.brand}
                        </span>
                      </div>
                      <h3 className="text-xs font-black text-[#292442] mt-0.5">
                        {urgentShopping.item}
                      </h3>
                      <p className="text-[11px] font-extrabold text-[#6C4CF5]">
                        {urgentShopping.estimatedPrice == null ? '-' : formatIDR(urgentShopping.estimatedPrice)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#EEE9FF] text-[#6C4CF5] shrink-0">
                    Lihat
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* 5. SHOPPING PIPELINE SUMMARY */}
          <section 
            aria-label="Status Belanja Perlengkapan"
            className="bg-white rounded-[28px] p-5 border border-[#F0ECE4] shadow-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-black text-[#292442] uppercase tracking-wider">
                Status Wishlist Belanja
              </h2>
              <button
                onClick={() => onNavigateTab('shopping')}
                className="text-xs font-black text-[#6C4CF5] hover:underline cursor-pointer"
              >
                Buka Wishlist →
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#E7FAF5] p-3 rounded-2xl text-center">
                <span className="text-xl font-black text-[#1EA896] block">{boughtCount}</span>
                <span className="text-[11px] font-extrabold text-[#292442] block">Sudah Dibeli</span>
              </div>
              <div className="bg-[#EEE9FF] p-3 rounded-2xl text-center">
                <span className="text-xl font-black text-[#6C4CF5] block">{pendingCount}</span>
                <span className="text-[11px] font-extrabold text-[#292442] block">Belum Dibeli</span>
                <span className="text-[10px] font-bold text-[#6C4CF5] block mt-0.5">Perkiraan: {pendingPricesKnown ? formatIDRCompact(shoppingPending) : '-'}</span>
              </div>
              <div className="bg-[#FFF9E5] p-3 rounded-2xl text-center">
                <span className="text-xl font-black text-[#B8860B] block">{shoppingItems.length}</span>
                <span className="text-[11px] font-extrabold text-[#292442] block">Total Barang</span>
                <span className="text-[10px] font-bold text-[#B8860B] block mt-0.5">di daftar belanja</span>
              </div>
            </div>
            <p className="mt-3 text-xs font-bold text-[#79738E]">Total Belanja (Riwayat Pengeluaran): {formatIDR(shoppingSpent)}</p>
            <p className="mt-1 text-[11px] text-[#79738E]">Termasuk transaksi yang dipertahankan setelah status dibatalkan atau barang dihapus.</p>
          </section>

          {/* 6. THIS WEEK'S FOCUS CHECKLIST */}
          <section 
            aria-label="Tugas Tersimpan"
            className="bg-white rounded-[28px] p-5 border border-[#F0ECE4] shadow-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FFD45A] text-[#34236B]">
                  Checklist kamu
                </span>
                <h2 className="text-base font-black text-[#292442] mt-1">
                  Tugas Tersimpan
                </h2>
              </div>
            </div>

            <div className="space-y-2.5">
              {checklistItems.length === 0 && <p className="text-xs text-[#79738E]">Belum ada tugas.</p>}
              {checklistItems.slice(0, 3).map((task) => {
                const isDone = task.status === 'Completed';
                return (
                  <div
                    key={task.id}
                    onClick={() => onToggleChecklist(task.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isDone
                        ? 'bg-[#F9F8F6] border-[#EAE6DD] opacity-70'
                        : 'bg-[#FCFBF8] border-[#EAE6DD] hover:border-[#6C4CF5]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          isDone ? 'bg-[#52D6C7] text-white' : 'border-2 border-[#C8C2B4]'
                        }`}
                      >
                        {isDone && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <p
                          className={`text-xs font-black ${
                            isDone ? 'line-through text-[#79738E]' : 'text-[#292442]'
                          }`}
                        >
                          {task.name}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        task.priority === 'High'
                          ? 'bg-[#FFF0E9] text-[#FF786A]'
                          : 'bg-[#EEE9FF] text-[#6C4CF5]'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
