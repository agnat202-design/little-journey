import React from 'react';
import { PipMascot } from '../mascot/PipMascot';
import { displayDate } from '../../lib/familyRecords';

interface PregnancyHeroProps {
  demoDueDate: string;
  isDemo?: boolean;
  currentWeek: number;
  trimester: number;
  daysRemaining: number;
  progressPercent: number;
}

/**
 * Approved Pregnancy Hero Component
 * Displays clearly labeled demo gestational metrics received through props.
 */
export const PregnancyHero: React.FC<PregnancyHeroProps> = ({
  demoDueDate,
  isDemo = true,
  currentWeek,
  trimester,
  daysRemaining,
  progressPercent,
}) => {
  return (
    <section 
      aria-label="Status Kehamilan"
      className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#34236B] via-[#452D8A] to-[#6C4CF5] p-5 sm:p-6 text-white shadow-xl shadow-[#34236B]/20"
    >
      {/* Soft Background Accents */}
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[#52D6C7]/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-[#FFD45A] text-xs font-black mb-2">
            
            <span>{isDemo?'Demo • ':''}Minggu ke-{currentWeek} • Trimester {trimester}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            {isDemo?'Contoh perjalanan kehamilan':'Perjalanan kehamilan'}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-white/80 mt-1">
            {daysRemaining>0?`${daysRemaining} hari menuju `:''}HPL {isDemo?'contoh ':''}{displayDate(demoDueDate)}
          </p>
        </div>

        {/* Pip Mascot in Hero */}
        <div className="relative -mt-2 -mr-2">
          <PipMascot mood="happy" size={92} />
        </div>
      </div>

      {/* Gestational Progress Bar (40 Weeks Standard) */}
      <div className="mt-4 pt-3 border-t border-white/15">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-extrabold text-white/90 mb-1.5">
          <span>Progress Kehamilan: {currentWeek} / 40 Minggu</span>
          <span className="text-[#52D6C7]">
            {progressPercent}%
          </span>
        </div>
        <div className="w-full h-3.5 rounded-full bg-black/25 overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#FFD45A] via-[#52D6C7] to-white transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <p className="mt-3 text-[11px] text-white/80">{isDemo?'Data demo dari HPL contoh, bukan data kehamilan kamu. Pengaturan kehamilan belum tersedia.':'Dihitung dari HPL yang Anda masukkan.'}</p>
    </section>
  );
};
