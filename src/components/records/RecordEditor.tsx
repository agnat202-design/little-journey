import React, { useState } from 'react';
import { LocalAttachment, JourneyStage } from '../../types/domain';
import { isSafeShoppingUrl, isShoppingPrice } from '../../lib/shopping';

export type EntryKind = 'shopping' | 'expense' | 'appointment' | 'document';
export const fieldClass = 'w-full px-4 py-3 rounded-2xl bg-[#FCFBF8] border border-[#E7E2D8] text-[#292442] font-bold focus:outline-none focus:ring-2 focus:ring-[#6C4CF5] focus:bg-white text-sm min-w-0';
export const labelClass = 'block text-xs font-extrabold text-[#79738E] mb-1.5';
export const buttonClass = 'px-4 py-2.5 rounded-xl bg-[#34236B] text-white text-xs font-black cursor-pointer disabled:opacity-40';
export const shoppingCategories = ['Baby Gear', 'Travel', 'Feeding', 'Sleeping', 'Baby clothing', 'Mother', 'Diapering', 'Bathing', 'Safety', 'Hospital bag', 'Other'];
export const documentTypes = ['USG', 'Hasil Lab', 'Dokumen Kontrol', 'Invoice', 'Receipt', 'Resep', 'Lainnya'];
export const quickTimes = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

export function AttachmentPicker({ value, onChange, required = false }: { value?: LocalAttachment; onChange: (file?: LocalAttachment) => void; required?: boolean }) {
  const [error, setError] = useState('');
  const choose = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      onChange({ id: crypto.randomUUID(), name: file.name, mimeType: file.type, size: file.size, localUrl: URL.createObjectURL(file) });
      setError('');
    } catch { setError('File tidak dapat dibuka. Silakan pilih ulang.'); }
    e.target.value = '';
  };
  return <div className="space-y-2">
    <p className={labelClass}>{required ? 'Foto / File *' : 'Bukti Pembayaran (opsional)'}</p>
    <div className="flex flex-wrap gap-2">
      <label className="px-3 py-2 rounded-xl bg-[#EEE9FF] text-[#6C4CF5] text-xs font-black cursor-pointer">Ambil Foto<input aria-label="Ambil Foto" className="sr-only" type="file" accept="image/*" capture="environment" onChange={choose} /></label>
      <label className="px-3 py-2 rounded-xl bg-[#F5F3ED] text-[#34236B] text-xs font-black cursor-pointer">Upload File<input aria-label="Upload File" className="sr-only" type="file" onChange={choose} /></label>
    </div>
    {value && <div className="flex items-center gap-2 text-xs"><span className="font-bold text-[#292442] break-all">{value.name}</span><button type="button" onClick={() => onChange(undefined)} className="text-[#79738E] underline">Hapus file</button></div>}
    {error && <p role="alert" className="text-xs text-[#E05342]">{error}</p>}
    <p className="text-[11px] text-[#79738E]">File disimpan sementara di sesi ini dan hilang saat halaman dimuat ulang.</p>
  </div>;
}

export function RecordEntryForm({ kind, initial = {}, stage = 'pregnancy', onSave, onCancel }: {
  kind: EntryKind; initial?: any; stage?: JourneyStage; onSave: (data: any) => void; onCancel?: () => void;
}) {
  const [title, setTitle] = useState(initial.title ?? initial.item ?? initial.purpose ?? '');
  const [brand, setBrand] = useState(initial.brand || '');
  const [model, setModel] = useState(initial.model || '');
  const [price, setPrice] = useState(String(initial.estimatedPrice ?? initial.currentPrice ?? initial.targetPrice ?? ''));
  const [amount, setAmount] = useState(String(initial.paidAmount ?? ''));
  const [category, setCategory] = useState(initial.category || '');
  const [date, setDate] = useState(initial.appointmentDate ?? initial.expenseDate ?? initial.documentDate ?? '');
  const [time, setTime] = useState(initial.appointmentTime || '');
  const [customTime, setCustomTime] = useState(!!initial.appointmentTime && !quickTimes.includes(initial.appointmentTime));
  const [doctor, setDoctor] = useState(initial.doctor || '');
  const [hospital, setHospital] = useState(initial.hospital || '');
  const [notes, setNotes] = useState(initial.notes || '');
  const [targetDate, setTargetDate] = useState(initial.targetDate || '');
  const [week, setWeek] = useState(String(initial.targetGestationalWeek ?? ''));
  const [url, setUrl] = useState(initial.productUrl || '');
  const [attachment, setAttachment] = useState<LocalAttachment | undefined>(initial.attachment);
  const [documentType, setDocumentType] = useState(initial.documentType || 'USG');
  const [actualPrice, setActualPrice] = useState(String(initial.actualPurchasePrice ?? (initial.actualPrice === undefined ? '' : initial.actualPrice * (initial.quantity || 1))));
  const [purchaseDate, setPurchaseDate] = useState(initial.purchaseDate || '');
  const [saving, setSaving] = useState(false);
  const isBought = kind === 'shopping' && (initial.status === 'Bought' || initial.status === 'Received');
  const categoryOptions = kind === 'shopping' ? shoppingCategories : ['Hospital / Delivery', 'Medical', ...shoppingCategories];
  const visibleCategories = initial.category && !categoryOptions.includes(initial.category)
    ? [initial.category, ...categoryOptions] : categoryOptions;
  const optionalPrice = price.trim() ? Number(price) : undefined;
  const actual = actualPrice.trim() ? Number(actualPrice) : undefined;
  const paid = amount.trim() ? Number(amount) : undefined;
  const valid = !!title.trim() && !saving
    && (kind !== 'appointment' || !!date)
    && (kind !== 'expense' || (isShoppingPrice(paid) && !!date))
    && (kind !== 'document' || (!!documentType && !!attachment))
    && (kind !== 'shopping' || ((!url.trim() || isSafeShoppingUrl(url.trim())) && (optionalPrice === undefined || isShoppingPrice(optionalPrice))))
    && (!isBought || (isShoppingPrice(actual) && !!purchaseDate));
  const field = (id: string, label: string, value: string, update: (value: string) => void, type = 'text', required = false) => <div><label htmlFor={id} className={labelClass}>{label}{required ? ' *' : ''}</label><input id={id} type={type} required={required} min={type === 'number' ? 0 : undefined} step={type === 'number' ? 1 : undefined} value={value} onChange={e => update(e.target.value)} className={fieldClass} /></div>;
  return <form className="space-y-4" onSubmit={e => {
    e.preventDefault(); if (!valid) return; setSaving(true);
    onSave({ title: title.trim(), brand: brand.trim() || undefined, model: model.trim() || undefined,
      estimatedPrice: optionalPrice, amount: paid, category, appointmentDate: date, expenseDate: date, documentDate: date || undefined,
      appointmentTime: time || undefined, doctor: doctor.trim(), hospital: hospital.trim(), notes: notes.trim() || undefined,
      targetDate: targetDate || undefined, targetGestationalWeek: stage === 'pregnancy' && week ? Number(week) : undefined,
      productUrl: url.trim() || undefined, attachment, documentType, actualPurchasePrice: actual, purchaseDate });
  }}>
    {kind === 'document' && <div><label htmlFor="document-type" className={labelClass}>Jenis Dokumen *</label><select id="document-type" value={documentType} onChange={e => setDocumentType(e.target.value)} className={fieldClass}>{documentTypes.map(t => <option key={t}>{t}</option>)}</select></div>}
    {field('record-title', kind === 'shopping' ? 'Nama Barang' : kind === 'appointment' ? 'Tujuan / Nama Kontrol' : kind === 'expense' ? 'Uraian Pengeluaran' : 'Judul', title, setTitle, 'text', true)}
    {kind === 'shopping' && <>
      <div className="grid grid-cols-2 gap-3">{field('shopping-brand', 'Brand (opsional)', brand, setBrand)}{field('shopping-model', 'Model / Varian (opsional)', model, setModel)}</div>
      {field('shopping-estimate', 'Harga Perkiraan (IDR, opsional)', price, setPrice, 'number')}
      {field('shopping-url', 'Link Produk / Referensi (opsional)', url, setUrl, 'url')}
      {url.trim() && !isSafeShoppingUrl(url.trim()) && <p role="alert" className="text-xs text-[#E05342]">Gunakan link HTTP atau HTTPS yang valid.</p>}
      {field('shopping-target-date', 'Target Tanggal (opsional)', targetDate, setTargetDate, 'date')}
      {isBought && <div className="p-3 rounded-2xl bg-[#F5F3ED] space-y-3">{field('shopping-actual', 'Harga Beli (IDR)', actualPrice, setActualPrice, 'number', true)}{field('shopping-purchase-date', 'Tanggal Beli', purchaseDate, setPurchaseDate, 'date', true)}</div>}
    </>}
    {kind === 'expense' && field('expense-amount', 'Nominal (IDR)', amount, setAmount, 'number', true)}
    {kind !== 'shopping' && field('record-date', 'Tanggal', date, setDate, 'date', kind !== 'document')}
    {kind === 'appointment' && <>
      {field('appointment-doctor', 'Dokter (opsional)', doctor, setDoctor)}
      {field('appointment-location', 'Rumah Sakit / Klinik (opsional)', hospital, setHospital)}
      <div><label htmlFor="appointment-time-choice" className={labelClass}>Jam (opsional)</label><select id="appointment-time-choice" value={customTime ? 'other' : time} onChange={e => { const other = e.target.value === 'other'; setCustomTime(other); setTime(other ? '' : e.target.value); }} className={fieldClass}><option value="">Tanpa jam</option>{quickTimes.map(t => <option key={t}>{t}</option>)}<option value="other">Lainnya</option></select></div>
      {customTime && field('appointment-custom-time', 'Jam lainnya', time, setTime, 'time')}
    </>}
    {(kind === 'shopping' || kind === 'expense') && <div><label htmlFor="record-category" className={labelClass}>Kategori (opsional)</label><select id="record-category" value={category} onChange={e => setCategory(e.target.value)} className={fieldClass}><option value="">Tanpa kategori</option>{visibleCategories.map(c => <option key={c}>{c}</option>)}</select></div>}
    {stage === 'pregnancy' && (kind === 'shopping' || kind === 'appointment') && <div><label htmlFor="record-week" className={labelClass}>Target Minggu Kehamilan (opsional)</label><input id="record-week" type="number" min="1" max="42" value={week} onChange={e => setWeek(e.target.value)} className={fieldClass} /></div>}
    <div><label htmlFor="record-notes" className={labelClass}>Catatan (opsional)</label><textarea id="record-notes" rows={2} value={notes} onChange={e => setNotes(e.target.value)} className={fieldClass} /></div>
    {(kind === 'expense' || kind === 'document') && <AttachmentPicker value={attachment} onChange={setAttachment} required={kind === 'document'} />}
    <div className="flex gap-2">{onCancel && <button type="button" onClick={onCancel} className="flex-1 px-4 py-3 rounded-2xl bg-[#F5F3ED] text-[#79738E] font-bold">Batal</button>}<button type="submit" disabled={!valid} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#34236B] to-[#6C4CF5] text-white font-black disabled:bg-none disabled:bg-[#DDD7CD] disabled:text-[#79738E] cursor-pointer">{initial.id ? 'Simpan Perubahan' : 'Simpan'}</button></div>
  </form>;
}

export function RecordEditor({ kind, record, stage, onSave, onClose }: { kind: EntryKind; record?: any; stage: JourneyStage; onSave: (data: any) => void; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4"><div className="absolute inset-0" onClick={onClose} /><div role="dialog" aria-modal="true" aria-labelledby="record-editor-title" className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] p-5 sm:p-6 max-h-[92vh] overflow-y-auto border border-[#F0ECE4] shadow-2xl"><div className="flex items-center justify-between mb-4"><h2 id="record-editor-title" className="text-xl font-black text-[#292442]">{record ? 'Edit' : 'Tambah'} {kind === 'shopping' ? 'Barang' : kind === 'expense' ? 'Pengeluaran' : kind === 'appointment' ? 'Jadwal' : 'Dokumen'}</h2><button aria-label="Tutup" onClick={onClose} className="p-2 rounded-full bg-[#F5F3ED] text-[#79738E]">✕</button></div><RecordEntryForm kind={kind} initial={record} stage={stage} onSave={onSave} onCancel={onClose} /></div></div>;
}

export function RecordActions({ onEdit, onDelete, extra }: { onEdit: () => void; onDelete: () => void; extra?: React.ReactNode }) {
  const closeOnAction = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!(event.target as HTMLElement).closest('button')) return;
    const menu = event.currentTarget.closest('details');
    if (menu) menu.open = false;
  };
  return <details className="relative shrink-0"><summary aria-label="Aksi catatan" className="list-none px-3 py-1.5 rounded-xl bg-[#F5F3ED] text-[#79738E] text-lg cursor-pointer">⋮</summary><div onClickCapture={closeOnAction} className="absolute right-0 top-full mt-1 z-20 w-44 rounded-2xl bg-white shadow-lg border border-[#E7E2D8] p-1 text-xs font-bold"><button onClick={onEdit} className="block w-full text-left p-3 text-[#34236B]">Edit</button>{extra}<button onClick={onDelete} className="block w-full text-left p-3 text-[#E05342]">Hapus</button></div></details>;
}
