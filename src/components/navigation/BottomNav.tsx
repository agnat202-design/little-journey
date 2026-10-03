import React from 'react';
import { Home, CheckSquare, Plus, ShoppingBag, PieChart } from 'lucide-react';

export type TabKey = 'home' | 'checklist' | 'shopping' | 'budget';

interface BottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onQuickAdd,
}) => {
  return (
    <nav 
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#F0ECE4] px-4 py-2 pb-safe max-w-[480px] mx-auto transition-all"
    >
      <div className="flex items-center justify-between relative">
        {/* Home Tab */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-transform active:scale-95 ${
            activeTab === 'home' ? 'text-[#6C4CF5]' : 'text-[#79738E]'
          }`}
          aria-label="Home Dashboard"
        >
          <div className={`p-1.5 rounded-2xl transition-colors ${activeTab === 'home' ? 'bg-[#EEE9FF]' : ''}`}>
            <Home className="w-5 h-5" strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          </div>
          <span className={`text-[11px] font-bold mt-0.5 ${activeTab === 'home' ? 'text-[#34236B]' : ''}`}>
            Home
          </span>
        </button>

        {/* Checklist Tab */}
        <button
          onClick={() => onTabChange('checklist')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-transform active:scale-95 ${
            activeTab === 'checklist' ? 'text-[#6C4CF5]' : 'text-[#79738E]'
          }`}
          aria-label="Preparation Checklist"
        >
          <div className={`p-1.5 rounded-2xl transition-colors ${activeTab === 'checklist' ? 'bg-[#EEE9FF]' : ''}`}>
            <CheckSquare className="w-5 h-5" strokeWidth={activeTab === 'checklist' ? 2.5 : 2} />
          </div>
          <span className={`text-[11px] font-bold mt-0.5 ${activeTab === 'checklist' ? 'text-[#34236B]' : ''}`}>
            Checklist
          </span>
        </button>

        {/* Center Elevated Quick Add Button */}
        <div className="relative -top-3">
          <button
            onClick={onQuickAdd}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#34236B] to-[#6C4CF5] text-white flex items-center justify-center shadow-lg shadow-[#6C4CF5]/30 active:scale-90 transition-transform cursor-pointer border-4 border-white"
            aria-label="Quick Add Entry"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Shopping Wishlist Tab */}
        <button
          onClick={() => onTabChange('shopping')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-transform active:scale-95 ${
            activeTab === 'shopping' ? 'text-[#6C4CF5]' : 'text-[#79738E]'
          }`}
          aria-label="Shopping Wishlist"
        >
          <div className={`p-1.5 rounded-2xl transition-colors ${activeTab === 'shopping' ? 'bg-[#EEE9FF]' : ''}`}>
            <ShoppingBag className="w-5 h-5" strokeWidth={activeTab === 'shopping' ? 2.5 : 2} />
          </div>
          <span className={`text-[11px] font-bold mt-0.5 ${activeTab === 'shopping' ? 'text-[#34236B]' : ''}`}>
            Shopping
          </span>
        </button>

        {/* Budget Tab */}
        <button
          onClick={() => onTabChange('budget')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-transform active:scale-95 ${
            activeTab === 'budget' ? 'text-[#6C4CF5]' : 'text-[#79738E]'
          }`}
          aria-label="Budget Overview"
        >
          <div className={`p-1.5 rounded-2xl transition-colors ${activeTab === 'budget' ? 'bg-[#EEE9FF]' : ''}`}>
            <PieChart className="w-5 h-5" strokeWidth={activeTab === 'budget' ? 2.5 : 2} />
          </div>
          <span className={`text-[11px] font-bold mt-0.5 ${activeTab === 'budget' ? 'text-[#34236B]' : ''}`}>
            Budget
          </span>
        </button>
      </div>
    </nav>
  );
};
