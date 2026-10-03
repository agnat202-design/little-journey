import React from 'react';
import {
  Home,
  CheckSquare,
  ShoppingBag,
  PieChart,
  Stethoscope,
  FolderOpen,
  Plus,
  Sparkles,
} from 'lucide-react';
import { PipMascot } from '../mascot/PipMascot';

export type DesktopNavKey =
  | 'home'
  | 'checklist'
  | 'shopping'
  | 'budget'
  | 'appointments'
  | 'documents'
  ;

interface DesktopSidebarProps {
  activeTab: DesktopNavKey;
  onTabChange: (tab: DesktopNavKey) => void;
  onQuickAdd: () => void;
  currentWeek: number;
  currentDay: number;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onTabChange,
  onQuickAdd,
  currentWeek,
  currentDay,
}) => {
  const primaryNav = [
    { key: 'home' as const, label: 'Home', icon: Home },
    { key: 'checklist' as const, label: 'Checklist', icon: CheckSquare },
    { key: 'shopping' as const, label: 'Shopping', icon: ShoppingBag },
    { key: 'budget' as const, label: 'Budget', icon: PieChart },

  ];

  const secondaryNav = [
    { key: 'appointments' as const, label: 'Appointments', icon: Stethoscope },
    { key: 'documents' as const, label: 'Documents', icon: FolderOpen },

  ];

  return (
    <aside 
      aria-label="Sidebar Navigasi Desktop"
      className="hidden lg:flex flex-col justify-between w-64 h-screen sticky top-0 bg-white border-r border-[#F0ECE4] px-5 py-6 shrink-0 z-30 select-none"
    >
      <div>
        {/* App Logo & Branding */}
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#34236B] to-[#6C4CF5] flex items-center justify-center text-white shadow-md shadow-[#6C4CF5]/20 shrink-0">
            <Sparkles className="w-5 h-5 fill-current text-[#FFD45A]" />
          </div>
          <div>
            <h1 className="text-lg font-black text-[#292442] tracking-tight leading-none">
              Little Journey
            </h1>
            <span className="text-[11px] font-extrabold text-[#6C4CF5] bg-[#EEE9FF] px-2 py-0.5 rounded-full inline-block mt-1">
              Demo • W{currentWeek} • D{currentDay}
            </span>
          </div>
        </div>

        {/* Primary Desktop Action: + Catat Cepat */}
        <button
          onClick={onQuickAdd}
          className="w-full py-3.5 px-4 mb-6 rounded-2xl bg-gradient-to-r from-[#34236B] to-[#6C4CF5] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#6C4CF5]/25 hover:opacity-95 active:scale-98 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>+ Catat Cepat</span>
        </button>

        {/* Primary Navigation List */}
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase text-[#A7A1B8] tracking-wider px-3 block mb-1">
            Menu Utama
          </span>
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#EEE9FF] text-[#6C4CF5] font-black shadow-xs'
                    : 'text-[#5A556B] hover:bg-[#FAF8F5] hover:text-[#292442]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#6C4CF5]' : 'text-[#79738E]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="space-y-1 mt-6 pt-4 border-t border-[#F0ECE4]">
          <span className="text-[10px] font-black uppercase text-[#A7A1B8] tracking-wider px-3 block mb-1">
            Lainnya
          </span>
          {secondaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-2xl text-sm font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#EEE9FF] text-[#6C4CF5] font-black shadow-xs'
                    : 'text-[#5A556B] hover:bg-[#FAF8F5] hover:text-[#292442]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#6C4CF5]' : 'text-[#79738E]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Household Info & Pip Mascot Card */}
      <div className="bg-[#FCFBF8] p-3.5 rounded-2xl border border-[#F0ECE4] flex items-center gap-3">
        <PipMascot mood="happy" size={44} className="shrink-0" />
        <div className="overflow-hidden">
          <p className="text-xs font-black text-[#292442] truncate">Prototipe Lokal</p>
          <span className="text-[11px] font-bold text-[#1EA896] flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#52D6C7]" />
            Sesi sementara
          </span>
        </div>
      </div>
    </aside>
  );
};
