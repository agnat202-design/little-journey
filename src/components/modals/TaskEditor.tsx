import React, { useState } from 'react';
import type { ChecklistItem } from '../../types/domain';

export function TaskEditor({ item, onClose, onSave }: { item: ChecklistItem; onClose: () => void; onSave: (item: ChecklistItem) => boolean | Promise<boolean> }) {
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState(item.category);
  const [notes, setNotes] = useState(item.notes || '');
  const [saving, setSaving] = useState(false);
  const field = 'mt-1 w-full rounded-xl border border-[#EBE6DC] p-3 text-sm';
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#292442]/40 p-4">
    <section role="dialog" aria-modal="true" aria-labelledby="task-editor-title" className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-[28px] bg-white p-6">
      <h2 id="task-editor-title" className="text-xl font-black">Edit Checklist</h2>
      <form className="mt-4 space-y-4" onSubmit={async e => { e.preventDefault(); if (saving || !name.trim()) return; setSaving(true); try { await onSave({ ...item, name: name.trim(), category, notes: notes.trim() || undefined }); } finally { setSaving(false); } }}>
        <label className="block text-sm font-bold">Nama Checklist<input required value={name} onChange={e => setName(e.target.value)} className={field} /></label>
        <label className="block text-sm font-bold">Kategori<select value={category} onChange={e => setCategory(e.target.value)} className={field}>{[...new Set([item.category, 'Pregnancy', 'Mother', 'Hospital bag', 'Baby clothing', 'Feeding', 'Documents', 'Medical', 'Other'])].map(c => <option key={c}>{c}</option>)}</select></label>
        <label className="block text-sm font-bold">Catatan<textarea value={notes} onChange={e => setNotes(e.target.value)} className={field} /></label>
        <div className="flex justify-end gap-3"><button type="button" disabled={saving} onClick={onClose} className="px-4 py-2 font-bold">Batal</button><button disabled={saving} className="rounded-full bg-[#6C4CF5] px-5 py-2 font-bold text-white">{saving ? 'Menyimpan…' : 'Simpan'}</button></div>
      </form>
    </section>
  </div>;
}
