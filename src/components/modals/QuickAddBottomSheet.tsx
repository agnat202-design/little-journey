import { isRecordDate } from '../../lib/familyRecords';
import React, { useEffect, useState } from 'react';
import { X, ShoppingBag, Receipt, CheckSquare, Calendar, ArrowRight, Sparkles } from 'lucide-react';

import { JourneyStage } from '../../types/domain';
import { RecordEntryForm, fieldClass, labelClass } from '../records/RecordEditor';

export type QuickAddType = 'belanja' | 'pengeluaran' | 'tugas' | 'jadwal';

interface QuickAddBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveItem: (type: QuickAddType, data: any) => void | boolean | Promise<boolean>;
  activeStage?: JourneyStage;
  initialType?: QuickAddType | null;
}

export const QuickAddBottomSheet: React.FC<QuickAddBottomSheetProps> = (props) =>
  props.isOpen ? <QuickAddForm {...props} /> : null;

const QuickAddForm: React.FC<QuickAddBottomSheetProps> = ({
  onClose,
  onSaveItem,
  activeStage = 'pregnancy',
  initialType = null,
}) => {
  const [selectedType, setSelectedType] = useState<QuickAddType | null>(initialType);
  
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('Pregnancy');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSaving,setIsSaving] = useState(false);
  const save = (type:QuickAddType,data:any) => {
    if(isSaving)return false;
    setIsSaving(true);
    const result=onSaveItem(type,data);
    const finish=(ok:void | boolean)=>{setIsSaving(false);if(ok!==false)setIsSuccess(true);return ok!==false;};
    return result instanceof Promise?result.then(finish).catch(()=>finish(false)):finish(result);
  };
  useEffect(() => { if (!isSuccess) return; const timer = setTimeout(onClose, 500); return () => clearTimeout(timer); }, [isSuccess, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 p-0 sm:p-4">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Bottom Sheet on Mobile / Centered Card on Desktop */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-add-title"
        className="relative z-10 w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] px-5 sm:px-6 pt-3 pb-8 sm:py-6 shadow-2xl border border-[#F0ECE4] animate-in slide-in-from-bottom duration-300 max-h-[92vh] overflow-y-auto"
      >
        {/* Pull handle indicator on mobile */}
        <div className="w-12 h-1.5 bg-[#E5E1D8] rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h2 id="quick-add-title" className="text-xl font-black text-[#292442]">Catat Cepat</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#F5F3ED] text-[#79738E] hover:text-[#292442] active:scale-90 transition-transform cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Mode Selectors Pills: Belanja, Pengeluaran, Tugas, Jadwal */}
        <div className="grid grid-cols-4 gap-1.5 bg-[#F6F4EE] p-1.5 rounded-2xl mb-5">
          <button
            type="button"
            aria-pressed={selectedType === 'belanja'}
            onClick={() => { setSelectedType('belanja'); setCategory(''); }}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedType === 'belanja'
                ? 'bg-white text-[#6C4CF5] shadow-xs font-extrabold'
                : 'text-[#79738E] hover:text-[#292442]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 mb-1" />
            Belanja
          </button>

          <button
            type="button"
            aria-pressed={selectedType === 'pengeluaran'}
            onClick={() => { setSelectedType('pengeluaran'); setCategory('Medical'); }}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedType === 'pengeluaran'
                ? 'bg-white text-[#6C4CF5] shadow-xs font-extrabold'
                : 'text-[#79738E] hover:text-[#292442]'
            }`}
          >
            <Receipt className="w-4 h-4 mb-1" />
            Pengeluaran
          </button>

          <button
            type="button"
            aria-pressed={selectedType === 'tugas'}
            onClick={() => { setSelectedType('tugas'); setCategory('Pregnancy'); }}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedType === 'tugas'
                ? 'bg-white text-[#6C4CF5] shadow-xs font-extrabold'
                : 'text-[#79738E] hover:text-[#292442]'
            }`}
          >
            <CheckSquare className="w-4 h-4 mb-1" />
            Checklist
          </button>

          <button
            type="button"
            aria-pressed={selectedType === 'jadwal'}
            onClick={() => { setSelectedType('jadwal'); setCategory('Hospital / Delivery'); }}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedType === 'jadwal'
                ? 'bg-white text-[#6C4CF5] shadow-xs font-extrabold'
                : 'text-[#79738E] hover:text-[#292442]'
            }`}
          >
            <Calendar className="w-4 h-4 mb-1" />
            Jadwal
          </button>
        </div>

        {selectedType === null ? (
          <p className="text-sm font-bold text-[#79738E] text-center py-3">Pilih jenis catatan untuk mulai.</p>
        ) : selectedType === 'tugas' ? (
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); if (!title.trim() || (targetDate && !isRecordDate(targetDate)) || isSuccess || isSaving) return; void save('tugas', { title: title.trim(), category, notes: notes.trim() || undefined, targetDate: targetDate || undefined }); }}>
            <div><label htmlFor="task-title" className={labelClass}>Nama Checklist *</label><input id="task-title" required autoFocus value={title} onChange={e => setTitle(e.target.value)} className={fieldClass} /></div>
            <div><label htmlFor="task-date" className={labelClass}>Target tanggal (opsional)</label><input id="task-date" type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className={fieldClass} /></div>
            <div><label htmlFor="task-notes" className={labelClass}>Catatan (opsional)</label><textarea id="task-notes" value={notes} onChange={e => setNotes(e.target.value)} className={fieldClass} rows={3} /></div>
            <div><label htmlFor="task-category" className={labelClass}>Kategori</label><select id="task-category" value={category} onChange={e => setCategory(e.target.value)} className={fieldClass}>{['Pregnancy', 'Mother', 'Hospital bag', 'Baby clothing', 'Feeding', 'Documents', 'Medical', 'Other'].map(c => <option key={c}>{c}</option>)}</select></div>
            <button disabled={!title.trim() || isSuccess || isSaving} className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#34236B] to-[#6C4CF5] text-white font-black disabled:opacity-40">{isSuccess ? 'Berhasil Dicatat!' : isSaving?'Menyimpan…':'Simpan Checklist'}</button>
          </form>
        ) : (
          <RecordEntryForm key={selectedType} kind={selectedType === 'belanja' ? 'shopping' : selectedType === 'pengeluaran' ? 'expense' : 'appointment'} stage={activeStage} onSave={data => save(selectedType, data)} />
        )}
      </div>
    </div>
  );
};
