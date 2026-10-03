import React, { useState, useMemo } from 'react';
import { BottomNav, TabKey } from './components/navigation/BottomNav';
import { TopHeader } from './components/navigation/TopHeader';
import { DesktopSidebar, DesktopNavKey } from './components/layout/DesktopSidebar';
import { DashboardView } from './components/views/DashboardView';
import { ChecklistView } from './components/views/ChecklistView';
import { ShoppingView } from './components/views/ShoppingView';
import { BudgetView } from './components/views/BudgetView';

import { AppointmentsView } from './components/views/AppointmentsView';
import { DocumentsView } from './components/views/DocumentsView';
import { QuickAddBottomSheet, QuickAddType } from './components/modals/QuickAddBottomSheet';
import { BudgetSetupModal, CategoryAllocationInput } from './components/modals/BudgetSetupModal';

import {
  LOCAL_CONTEXT,
  DERIVED_PREGNANCY,
  INITIAL_PREGNANCY,
} from './data/mockData';
import { FamilyRecords, expenseBudget, buyShopping, editShopping, deleteShopping, reverseShopping, editExpense, deleteExpense, displayDate } from './lib/familyRecords';
import { RecordEditor, EntryKind, shoppingCategories } from './components/records/RecordEditor';
import { AttachmentView } from './components/records/AttachmentView';
import { isShoppingPrice } from './lib/shopping';

import { PipMascot } from './components/mascot/PipMascot';
import { JourneyStage, ChecklistItem, ShoppingItem, Expense, Appointment, DocumentRecord, LocalAttachment } from './types/domain';

export default function App() {
  const [activeTab, setActiveTab] = useState<DesktopNavKey>('home');
  // Active Lifecycle Stage (MVP is 'pregnancy'; future-ready for birth, newborn, etc.)
  const [activeStage] = useState<JourneyStage>('pregnancy');

  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);



  // In-Memory Collections for stateful UX testing
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [records, setRecords] = useState<FamilyRecords>(() => ({ shoppingItems: [], expenses: [], appointments: [], documents: [] }));
  const { shoppingItems, expenses, appointments, documents } = records;
  const [editor, setEditor] = useState<{ kind: EntryKind; record?: any } | null>(null);
  const [attachment, setAttachment] = useState<LocalAttachment | null>(null);
  const [expenseDetail, setExpenseDetail] = useState<Expense | null>(null);
  const [confirmation, setConfirmation] = useState<{ title: string; body: string; actions: Array<{ label: string; run: () => void }> } | null>(null);

  // User-defined Budget Setup (Source of truth for user-entered budget)
  const [totalHouseholdBudget, setTotalHouseholdBudget] = useState<number>(0);
  const [categoryAllocations, setCategoryAllocations] = useState<CategoryAllocationInput[]>(() => ['Hospital / Delivery', 'Medical', ...shoppingCategories].map(category => ({ category, planned: 0, icon: '', color: '' })));
  const [isBudgetConfigured, setIsBudgetConfigured] = useState(false);
  const [isBudgetSetupOpen, setIsBudgetSetupOpen] = useState<boolean>(false);

  // Deterministic calculation of Budget using locked business rules (zero double-counting)
  const budgetSummary = useMemo(() => {
    return expenseBudget(totalHouseholdBudget, records);
  }, [totalHouseholdBudget, records]);

  // Toggle Checklist Item
  const handleToggleChecklist = (id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === 'Completed' ? 'Pending' : 'Completed',
            }
          : item
      )
    );
  };

  const saveRecord = (kind: EntryKind, data: any, previous?: any) => {
    const common = { householdId: LOCAL_CONTEXT.householdId, childId: LOCAL_CONTEXT.childId, stage: activeStage, ...previous, id: previous?.id || crypto.randomUUID() };
    setRecords(prev => {
      if (kind === 'shopping') {
        const item: ShoppingItem = { ...common, item: data.title, brand: data.brand, model: data.model, category: data.category || '',
          estimatedPrice: data.estimatedPrice, targetPrice: undefined, currentPrice: data.estimatedPrice,
          productUrl: data.productUrl, targetDate: data.targetDate, targetGestationalWeek: data.targetGestationalWeek,
          notes: data.notes, quantity: previous?.quantity || 1, priority: previous?.priority || 'Medium', status: previous?.status || 'Wishlist',
          actualPurchasePrice: data.actualPurchasePrice, purchaseDate: data.purchaseDate || undefined,
          actualPrice: isShoppingPrice(data.actualPurchasePrice) ? data.actualPurchasePrice / (previous?.quantity || 1) : previous?.actualPrice };
        return previous ? editShopping(prev, item) : { ...prev, shoppingItems: [item, ...prev.shoppingItems] };
      }
      if (kind === 'expense') {
        const total = previous?.paymentStatus === 'Partially Paid' ? Math.max(previous.totalAmount, data.amount) : data.amount;
        const expense: Expense = { ...common, source: previous?.source || 'manual', title: data.title, category: data.category || 'Other',
          totalAmount: total, paidAmount: data.amount, paymentStatus: total > data.amount ? 'Partially Paid' : 'Paid',
          expenseDate: data.expenseDate, notes: data.notes, attachment: data.attachment };
        return previous ? editExpense(prev, expense) : { ...prev, expenses: [expense, ...prev.expenses] };
      }
      if (kind === 'appointment') {
        const appointment: Appointment = { ...common, purpose: data.title, doctor: data.doctor || '', hospital: data.hospital || '',
          appointmentDate: data.appointmentDate, appointmentTime: data.appointmentTime,
          notes: data.notes, targetGestationalWeek: data.targetGestationalWeek };
        return { ...prev, appointments: previous ? prev.appointments.map(i => i.id === previous.id ? appointment : i) : [appointment, ...prev.appointments] };
      }
      const doc: DocumentRecord = { ...common, title: data.title, category: data.documentType, documentType: data.documentType,
        documentDate: data.documentDate, notes: data.notes, attachment: data.attachment,
        fileName: data.attachment.name, fileSize: data.attachment.size, fileUrl: data.attachment.localUrl || '' };
      return { ...prev, documents: previous ? prev.documents.map(i => i.id === previous.id ? doc : i) : [doc, ...prev.documents] };
    });
    setEditor(null);
    setActiveTab(kind === 'shopping' ? 'shopping' : kind === 'expense' ? 'budget' : kind === 'appointment' ? 'appointments' : 'documents');
  };
  const handleSaveQuickItem = (type: QuickAddType, data: any) => {
    if (type !== 'tugas') { saveRecord(type === 'belanja' ? 'shopping' : type === 'pengeluaran' ? 'expense' : 'appointment', data); return; }
    const item: ChecklistItem = { id: crypto.randomUUID(), householdId: LOCAL_CONTEXT.householdId, childId: LOCAL_CONTEXT.childId,
      stage: activeStage, name: data.title, category: data.category || 'Pregnancy', priority: 'Medium', targetGestationalWeek: data.targetGestationalWeek,
      status: 'Pending', assignedTo: undefined, notes: 'Ditambahkan dari Catat Cepat' };
    setChecklistItems(prev => [item, ...prev]); setActiveTab('checklist');
  };
  const requestShoppingDelete = (item: ShoppingItem) => {
    const linked = expenses.some(e => e.shoppingItemId === item.id);
    setConfirmation({ title: 'Hapus Barang?', body: linked ? 'Barang ini sudah tercatat sebagai pengeluaran. Menghapus barang tidak akan menghapus riwayat pengeluarannya.' : 'Barang akan dihapus dari daftar belanja.',
      actions: [{ label: 'Hapus Barang', run: () => setRecords(prev => deleteShopping(prev, item.id)) }] });
  };
  const requestReverse = (item: ShoppingItem) => {
    const linked = expenses.some(e => e.shoppingItemId === item.id);
    setConfirmation({ title: 'Batalkan Status Dibeli?', body: linked ? 'Transaksi pembelian sudah ada di Riwayat Pengeluaran. Pilih apakah pengeluaran tetap disimpan atau pembelian dibatalkan.' : 'Ubah barang menjadi Belum Dibeli?',
      actions: linked ? [
        { label: 'Batalkan status saja, pertahankan pengeluaran', run: () => setRecords(prev => reverseShopping(prev, item.id, false)) },
        { label: 'Batalkan pembelian dan hapus pengeluaran terkait', run: () => setRecords(prev => reverseShopping(prev, item.id, true)) },
      ] : [{ label: 'Batalkan Status', run: () => setRecords(prev => reverseShopping(prev, item.id, false)) }] });
  };
  const requestExpenseDelete = (expense: Expense) => setConfirmation({ title: 'Hapus Pengeluaran?',
    body: expense.shoppingItemId && shoppingItems.some(i => i.id === expense.shoppingItemId) ? 'Pengeluaran ini terkait barang yang dibeli. Menghapus transaksi juga mengubah barang menjadi Belum Dibeli. Lanjutkan?' : 'Transaksi ini akan dihapus dari Riwayat Pengeluaran.',
    actions: [{ label: expense.shoppingItemId ? 'Hapus dan Batalkan Status Barang' : 'Hapus Pengeluaran', run: () => setRecords(prev => deleteExpense(prev, expense.id)) }] });
  const requestRecordDelete = (kind: 'appointment' | 'document', id: string) => setConfirmation({ title: kind === 'appointment' ? 'Hapus Jadwal?' : 'Hapus Dokumen?', body: 'Catatan ini akan dihapus. Lanjutkan?', actions: [{ label: 'Hapus', run: () => setRecords(prev => kind === 'appointment' ? { ...prev, appointments: prev.appointments.filter(i => i.id !== id) } : { ...prev, documents: prev.documents.filter(i => i.id !== id) }) }] });

  // Map mobile bottom nav keys to desktop keys
  const handleMobileTabChange = (tab: TabKey) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] text-[#292442] flex flex-col lg:flex-row antialiased [overflow-wrap:anywhere]">
      {/* 1. DESKTOP SIDEBAR (Visible on >= 1024px) */}
      <DesktopSidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onQuickAdd={() => setIsQuickAddOpen(true)}
        currentWeek={DERIVED_PREGNANCY.currentWeek}
        currentDay={DERIVED_PREGNANCY.currentDay}
      />

      {/* 2. MAIN APPLICATION CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-screen relative overflow-x-hidden">
        {/* Mobile Sticky Top Header (Hidden on Desktop) */}
        <div className="lg:hidden">
          <TopHeader />
        </div>

        <div className="lg:hidden flex gap-2 px-4 py-2"><button onClick={() => setActiveTab('appointments')} className="px-3 py-1.5 rounded-full bg-[#EEE9FF] text-[#6C4CF5] text-xs font-black">Jadwal</button><button onClick={() => setActiveTab('documents')} className="px-3 py-1.5 rounded-full bg-[#F5F3ED] text-[#34236B] text-xs font-black">Dokumen</button></div>
        {/* Neutral desktop header; profiles are not configured. */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white/80 border-b border-[#F0ECE4] sticky top-0 z-20"><div><span className="text-xs font-bold text-[#79738E]">Selamat datang 👋</span><h2 className="text-lg font-black text-[#292442]">Little Journey</h2></div></header>
        <p className="px-4 lg:px-8 py-2 text-xs text-[#79738E] bg-[#FAF8F5]">Prototipe lokal: catatan tersimpan hanya selama sesi ini. Akun, berbagi keluarga, dan penyimpanan permanen belum tersedia.</p>
        {/* Dynamic View Display */}
        <main className="flex-1 py-4 sm:py-6">
          {activeTab === 'home' && (
            <DashboardView
              onNavigateTab={(tab) => setActiveTab(tab)}
              onToggleChecklist={handleToggleChecklist}
              checklistItems={checklistItems}
              shoppingItems={shoppingItems}
              budgetSummary={budgetSummary}
              stage={activeStage}
              pregnancyMetrics={DERIVED_PREGNANCY}
              pregnancyDueDate={INITIAL_PREGNANCY.dueDate}
              isBudgetConfigured={isBudgetConfigured}
              expenses={expenses}
              appointments={appointments}
            />
          )}

          {activeTab === 'checklist' && (
            <ChecklistView
              currentWeek={DERIVED_PREGNANCY.currentWeek}
              items={checklistItems}
              onToggleItem={handleToggleChecklist}
              onAddItem={() => setIsQuickAddOpen(true)}
            />
          )}

          {activeTab === 'shopping' && (
            <ShoppingView
              items={shoppingItems}
              expenses={expenses}
              onBuy={(id, price, date) => setRecords(prev => buyShopping(prev, id, price, date))}
              onReverse={requestReverse}
              onEdit={record => setEditor({ kind: 'shopping', record })}
              onDelete={requestShoppingDelete}
              onAddItem={() => setIsQuickAddOpen(true)}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetView
              isBudgetConfigured={isBudgetConfigured}
              onAddExpense={() => setEditor({ kind: 'expense' })}
              onEditExpense={record => setEditor({ kind: 'expense', record })}
              onDeleteExpense={requestExpenseDelete}
              onViewExpense={setExpenseDetail}
              onOpenBudgetSetup={() => setIsBudgetSetupOpen(true)}
              budgetSummary={budgetSummary}
              categoryAllocations={categoryAllocations}
              shoppingItems={shoppingItems}
              expenses={expenses}
            />
          )}



          {activeTab === 'appointments' && (
            <AppointmentsView
              appointments={appointments}
              onAddAppointment={() => setEditor({ kind: 'appointment' })}
              onEdit={record => setEditor({ kind: 'appointment', record })}
              onDelete={record => requestRecordDelete('appointment', record.id)}
            />
          )}

          {activeTab === 'documents' && <DocumentsView documents={documents} onAdd={() => setEditor({ kind: 'document' })} onView={doc => setAttachment(doc.attachment)} onEdit={record => setEditor({ kind: 'document', record })} onDelete={record => requestRecordDelete('document', record.id)} />}

        </main>

        {/* 3. MOBILE BOTTOM NAVIGATION (Hidden on Desktop >= 1024px) */}
        <div className="lg:hidden">
          <BottomNav
            activeTab={
              activeTab === 'home' || activeTab === 'checklist' || activeTab === 'shopping' || activeTab === 'budget'
                ? activeTab
                : 'home'
            }
            onTabChange={handleMobileTabChange}
            onQuickAdd={() => setIsQuickAddOpen(true)}
          />
        </div>
      </div>

      {/* 4. QUICK ADD BOTTOM SHEET */}
      <QuickAddBottomSheet
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSaveItem={handleSaveQuickItem}
        activeStage={activeStage}
      />

      {editor && <RecordEditor key={editor.kind + (editor.record?.id || 'new')} kind={editor.kind} record={editor.record} stage={editor.record?.stage || activeStage} onSave={data => saveRecord(editor.kind, data, editor.record)} onClose={() => setEditor(null)} />}
      {confirmation && <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"><div role="dialog" aria-modal="true" aria-labelledby="confirmation-title" className="bg-white rounded-[28px] p-6 w-full max-w-md shadow-xl space-y-4"><h2 id="confirmation-title" className="text-lg font-black text-[#292442]">{confirmation.title}</h2><p className="text-sm text-[#79738E]">{confirmation.body}</p><div className="space-y-2">{confirmation.actions.map(action => <button key={action.label} onClick={() => { action.run(); setConfirmation(null); }} className="block w-full px-4 py-3 rounded-2xl bg-[#34236B] text-white text-xs font-black">{action.label}</button>)}<button onClick={() => setConfirmation(null)} className="w-full py-2 text-xs font-bold text-[#79738E]">Batal</button></div></div></div>}
      {expenseDetail && <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"><div role="dialog" aria-modal="true" aria-labelledby="expense-detail-title" className="bg-white rounded-[28px] p-6 w-full max-w-md space-y-3"><div className="flex items-start justify-between"><h2 id="expense-detail-title" className="font-black text-[#292442]">{expenseDetail.title}</h2><button aria-label="Tutup Detail" onClick={() => setExpenseDetail(null)}>✕</button></div><p className="text-sm text-[#79738E]">{displayDate(expenseDetail.expenseDate)} • {expenseDetail.category || 'Tanpa kategori'}</p><p className="font-black text-[#34236B]">Rp {expenseDetail.paidAmount.toLocaleString('id-ID')}</p>{expenseDetail.notes && <p className="text-sm text-[#79738E]">{expenseDetail.notes}</p>}{expenseDetail.attachment && <button onClick={() => setAttachment(expenseDetail.attachment!)} className="px-3 py-2 rounded-xl bg-[#EEE9FF] text-[#6C4CF5] font-black text-xs">Lihat Lampiran: {expenseDetail.attachment.name}</button>}</div></div>}
      {attachment && <AttachmentView attachment={attachment} onClose={() => setAttachment(null)} />}

      {/* 4.5 BUDGET SETUP MODAL */}
      <BudgetSetupModal
        isOpen={isBudgetSetupOpen}
        onClose={() => setIsBudgetSetupOpen(false)}
        currentTotalBudget={totalHouseholdBudget}
        currentCategories={categoryAllocations}
        onSaveBudgetSetup={(newBudget, newCats) => {
          setTotalHouseholdBudget(newBudget);
          setIsBudgetConfigured(true);
          setCategoryAllocations(newCats);
        }}
      />

    </div>
  );
}
