import React, { useState } from 'react';
import { ChecklistItem } from '../../types/domain';
import { CATEGORY_STYLES } from '../../design/tokens';
import { CheckCircle2, Circle, Plus } from 'lucide-react';
import { PipMascot } from '../mascot/PipMascot';

interface ChecklistViewProps {
  items: ChecklistItem[];
  currentWeek: number;
  onToggleItem: (id: string) => void;
  onAddItem: () => void;
  onEditItem: (item: ChecklistItem) => void;
  onDeleteItem: (item: ChecklistItem) => void;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({
  items,
  currentWeek,
  onToggleItem,
  onAddItem,
  onEditItem,
  onDeleteItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [weekFilter, setWeekFilter] = useState<'all' | 'current' | 'trimester2'>('all');

  const categories = [...new Set(items.map(item => item.category).filter(Boolean))].sort();

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    const week = item.targetGestationalWeek;
    if (weekFilter === 'current' && week && week > currentWeek) return false;
    if (weekFilter === 'trimester2' && week && (week < 14 || week > 27)) return false;
    return true;
  });

  const completedCount = items.filter((i) => i.status === 'Completed').length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="space-y-4 px-4 pb-28 pt-2 max-w-4xl mx-auto">
      {/* Top Banner with Progress Ring / Bar */}
      <section 
        aria-label="Kemajuan Checklist"
        className="bg-white rounded-[28px] p-5 sm:p-6 border border-[#F0ECE4] shadow-xs"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#6C4CF5] bg-[#EEE9FF] px-2.5 py-0.5 rounded-full">
              Kesiapan Keluarga
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#292442] mt-1.5">
              Checklist Perlengkapan & Tugas
            </h1>
            <p className="text-xs sm:text-sm font-bold text-[#79738E] mt-0.5">
              {completedCount} dari {items.length} tugas selesai ({progressPercent}%)
            </p>
          </div>
          <PipMascot mood={progressPercent > 50 ? 'celebrate' : 'happy'} size={60} />
        </div>

        <div className="w-full h-3 rounded-full bg-[#F4F1EA] overflow-hidden p-0.5 mt-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#52D6C7] to-[#6C4CF5] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </section>

      {/* FIXED HORIZONTAL WEEK FILTER CHIPS */}
      <div className="relative -mx-4 px-4">
        <div 
          className="flex items-center gap-2 overflow-x-auto py-1 px-4 -mx-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Filter Minggu Kehamilan"
        >
          <button
            role="tab"
            aria-selected={weekFilter === 'all'}
            onClick={() => setWeekFilter('all')}
            className={`shrink-0 whitespace-nowrap min-h-[38px] px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer select-none active:scale-95 ${
              weekFilter === 'all'
                ? 'bg-[#34236B] text-white shadow-xs'
                : 'bg-white text-[#79738E] border border-[#EBE6DC] hover:text-[#292442]'
            }`}
          >
            Semua Minggu
          </button>
          <button
            role="tab"
            aria-selected={weekFilter === 'current'}
            onClick={() => setWeekFilter('current')}
            className={`shrink-0 whitespace-nowrap min-h-[38px] px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer select-none active:scale-95 ${
              weekFilter === 'current'
                ? 'bg-[#34236B] text-white shadow-xs'
                : 'bg-white text-[#79738E] border border-[#EBE6DC] hover:text-[#292442]'
            }`}
          >
            {currentWeek ? `s/d W${currentWeek}` : 'HPL belum diatur'}
          </button>
          <button
            role="tab"
            aria-selected={weekFilter === 'trimester2'}
            onClick={() => setWeekFilter('trimester2')}
            className={`shrink-0 whitespace-nowrap min-h-[38px] px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer select-none active:scale-95 ${
              weekFilter === 'trimester2'
                ? 'bg-[#34236B] text-white shadow-xs'
                : 'bg-white text-[#79738E] border border-[#EBE6DC] hover:text-[#292442]'
            }`}
          >
            Target Trimester 2
          </button>
          <div className="w-3 shrink-0 pointer-events-none" />
        </div>
      </div>

      <label className="block text-xs font-bold text-[#79738E]">Kategori
        <select aria-label="Filter kategori tugas" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="mt-1 block w-full sm:max-w-xs rounded-2xl border border-[#EBE6DC] bg-white p-3 text-[#292442]">
          <option value="All">Semua kategori</option>
          {categories.map(category => <option key={category} value={category}>{category}</option>)}
        </select>
      </label>

      {/* Checklist Cards List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-[28px] p-8 text-center border border-[#F0ECE4]">
            <PipMascot mood="sleeping" size={72} className="mx-auto mb-2" />
            <h2 className="text-base font-black text-[#292442]">Belum ada tugas di kategori ini</h2>
            <p className="text-xs font-bold text-[#79738E] mt-1 max-w-[240px] mx-auto">
              Tambahkan tugas pertama untuk mempersiapkan kebutuhan buah hati!
            </p>
            <button
              onClick={onAddItem}
              className="mt-4 px-5 py-2.5 rounded-full bg-[#EEE9FF] text-[#6C4CF5] font-extrabold text-xs inline-flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Tugas
            </button>
          </div>
        ) : (
          filteredItems.map((task) => {
            const isDone = task.status === 'Completed';
            const catStyle = CATEGORY_STYLES[task.category] || { bg: 'bg-stone-100', text: 'text-stone-700', icon: '📝' };

            return (
              <div
                key={task.id}
                className={`p-4 rounded-[24px] border transition-all flex items-start justify-between gap-3 active:scale-99 ${
                  isDone
                    ? 'bg-[#F9F8F6] border-[#E9E4DC] opacity-75'
                    : 'bg-white border-[#E9E4DC] hover:border-[#6C4CF5] shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Touch-Friendly Checkbox */}
                  <button
                    type="button"
                    onClick={() => onToggleItem(task.id)}
                    className="mt-0.5 p-1 -m-1 text-[#6C4CF5] focus:outline-none shrink-0"
                    aria-label={isDone ? 'Tandai belum selesai' : 'Tandai selesai'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 text-[#1EA896] fill-[#E7FAF5]" />
                    ) : (
                      <Circle className="w-6 h-6 text-[#C8C2B4]" />
                    )}
                  </button>

                  <div>
                    <h2
                      className={`text-sm font-black leading-snug ${
                        isDone ? 'line-through text-[#79738E]' : 'text-[#292442]'
                      }`}
                    >
                      {task.name}
                    </h2>

                    {task.notes && (
                      <p className="text-xs font-semibold text-[#79738E] mt-1 leading-relaxed">
                        {task.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${catStyle.bg} ${catStyle.text}`}>
                        <span>{catStyle.icon}</span>
                        <span>{task.category}</span>
                      </span>

                      {task.targetGestationalWeek && (
                        <span className="text-[10px] font-extrabold text-[#79738E] bg-[#F5F3ED] px-2 py-0.5 rounded-full">
                          Target W{task.targetGestationalWeek}
                        </span>
                      )}


                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                    task.priority === 'High'
                      ? 'bg-[#FFF0E9] text-[#FF786A]'
                      : 'bg-[#F5F3ED] text-[#79738E]'
                  }`}
                >
                  {task.priority}
                </span>
                <button type="button" onClick={() => onEditItem(task)} className="text-xs font-bold text-[#6C4CF5] px-2 py-1">Edit</button>
                <button type="button" onClick={() => onDeleteItem(task)} className="text-xs font-bold text-[#B14435] px-2 py-1">Hapus</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
