import { MonthlyReportModal } from './components/modals/MonthlyReportModal';
import React, { useState, useMemo } from 'react';
import { BottomNav, TabKey } from './components/navigation/BottomNav';
import { TopHeader } from './components/navigation/TopHeader';
import { DesktopSidebar, DesktopNavKey } from './components/layout/DesktopSidebar';
import { DashboardView } from './components/views/DashboardView';
import { ProfileView } from './components/views/ProfileView';
import { ChecklistView } from './components/views/ChecklistView';
import { ShoppingView } from './components/views/ShoppingView';
import { BudgetView } from './components/views/BudgetView';

import { AppointmentsView } from './components/views/AppointmentsView';
import { DocumentsView } from './components/views/DocumentsView';
import { QuickAddBottomSheet, QuickAddType } from './components/modals/QuickAddBottomSheet';
import { BudgetSetupModal, CategoryAllocationInput } from './components/modals/BudgetSetupModal';

import {
  LOCAL_CONTEXT,
} from './data/mockData';
import { FamilyRecords, expenseBudget, buyShopping, editShopping, deleteShopping, reverseShopping, editExpense, deleteExpense, displayDate } from './lib/familyRecords';
import { RecordEditor, EntryKind, shoppingCategories } from './components/records/RecordEditor';
import { AttachmentView } from './components/records/AttachmentView';
import { isShoppingPrice } from './lib/shopping';

import { PipMascot } from './components/mascot/PipMascot';
import { JourneyStage, ChecklistItem, ShoppingItem, Expense, Appointment, DocumentRecord, LocalAttachment } from './types/domain';
import type { HouseholdRuntime } from './components/HouseholdGate';
import type { HouseholdSnapshot } from './lib/householdRecords';
import { persistenceError } from './lib/householdRepository';
import { calculateGestationalAge } from './lib/businessLogic';
import { TaskEditor } from './components/modals/TaskEditor';
import { PregnancySetup } from './components/modals/PregnancySetup';

export default function App({ runtime, onLogout }: { runtime?: HouseholdRuntime; onLogout?:()=>Promise<boolean> } = {}) {
  const [reportOpen,setReportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DesktopNavKey>('home');
  // Active Lifecycle Stage (MVP is 'pregnancy'; future-ready for birth, newborn, etc.)
  const [activeStage] = useState<JourneyStage>('pregnancy');

  const [quickAddInitialType, setQuickAddInitialType] = useState<QuickAddType | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);



  // Loaded household records; mutations commit to the server before updating UI.
  const [checklistItems, applyTasks] = useState<ChecklistItem[]>(runtime?.initial.tasks || []);
  const [records, applyRecords] = useState<FamilyRecords>(() => runtime?.initial.records || ({ shoppingItems: [], expenses: [], appointments: [], documents: [] }));
  const { shoppingItems, expenses, appointments, documents } = records;
  const [editor, setEditor] = useState<{ kind: EntryKind; record?: any; template?: any } | null>(null);
  const [taskEditor, setTaskEditor] = useState<ChecklistItem | null>(null);
  const [attachment, setAttachment] = useState<LocalAttachment | null>(null);
  const [expenseDetail, setExpenseDetail] = useState<Expense | null>(null);
  const [confirmation, setConfirmation] = useState<{ title: string; body: string; actions: Array<{ label: string; run: () => void }> } | null>(null);

  // User-defined Budget Setup (Source of truth for user-entered budget)
  const [totalHouseholdBudget, setTotalHouseholdBudget] = useState<number>(runtime?.initial.totalBudget || 0);
  const [categoryAllocations, setCategoryAllocations] = useState<CategoryAllocationInput[]>(() => [...new Set(['Hospital / Delivery', 'Medical', ...shoppingCategories,...(runtime?.initial.allocations.map(a=>a.category) || [])])].map(category => runtime?.initial.allocations.find(a => a.category===category) || ({ category, planned: 0, icon: '', color: '' })));
  const [isBudgetConfigured, setIsBudgetConfigured] = useState(runtime?.initial.budgetConfigured || false);
  const [isBudgetSetupOpen, setIsBudgetSetupOpen] = useState<boolean>(false);
  const [saving,setSaving] = useState(false);
  const [saveError,setSaveError] = useState('');
  const [control] = useState(() => ({ current:runtime?.initial, busy:false, blocked:false }));
  const [pregnancySetup,setPregnancySetup] = useState(false);
  const dueDate = control.current?.dueDate;
  const pregnancyMetrics = dueDate ? calculateGestationalAge(dueDate,new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())) : undefined;
  const context = runtime ? {householdId:runtime.initial.householdId,childId:undefined,pregnancyId:control.current?.pregnancyId} : LOCAL_CONTEXT;
  const apply = (next:HouseholdSnapshot) => {
    control.current=next;applyRecords(next.records);applyTasks(next.tasks);
    setTotalHouseholdBudget(next.totalBudget);setIsBudgetConfigured(next.budgetConfigured);
    setCategoryAllocations([...new Set(['Hospital / Delivery','Medical',...shoppingCategories,...next.allocations.map(a=>a.category)])].map(category=>next.allocations.find(a=>a.category===category) || {category,planned:0,icon:'',color:''}));
  };
  const commit = (partial:Partial<HouseholdSnapshot>,after?:()=>void):boolean | Promise<boolean> => {
    if(!runtime) {
      if(partial.records)applyRecords(partial.records);if(partial.tasks)applyTasks(partial.tasks);
      if(partial.totalBudget!==undefined)setTotalHouseholdBudget(partial.totalBudget);
      if(partial.budgetConfigured!==undefined)setIsBudgetConfigured(partial.budgetConfigured);
      if(partial.allocations)setCategoryAllocations(partial.allocations);
      after?.();return true;
    }
    if(control.busy || control.blocked)return false;
    control.busy=true;setSaving(true);setSaveError('');
    return runtime.save({...control.current!,...partial}).then(next=>{apply(next);after?.();return true;})
      .catch(e=>{control.blocked=true;setSaveError(persistenceError(e)+' Muat ulang untuk memastikan keadaan terakhir sebelum mencoba lagi.');return false;})
      .finally(()=>{control.busy=false;setSaving(false);});
  };
  const setRecords = (update:(prev:FamilyRecords)=>FamilyRecords,after?:()=>void) => commit({records:update(control.current?.records || records)},after);
  const setChecklistItems = (update:(prev:ChecklistItem[])=>ChecklistItem[],after?:()=>void) => commit({tasks:update(control.current?.tasks || checklistItems)},after);

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
    const common = { ...context, stage: activeStage, ...previous, id: previous?.id || crypto.randomUUID() };
    return setRecords(prev => {
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
    },()=>{
      setEditor(null);
      setActiveTab(kind === 'shopping' ? 'shopping' : kind === 'expense' ? 'budget' : kind === 'appointment' ? 'appointments' : 'documents');
    });
  };
  const handleSaveQuickItem = (type: QuickAddType, data: any) => {
    if (type !== 'tugas') return saveRecord(type === 'belanja' ? 'shopping' : type === 'pengeluaran' ? 'expense' : 'appointment', data);
    const item: ChecklistItem = { id: crypto.randomUUID(), ...context,
      stage: activeStage, name: data.title, category: data.category || 'Pregnancy', priority: 'Medium', targetGestationalWeek: data.targetGestationalWeek,
      status: 'Pending', assignedTo: undefined, notes: data.notes, targetDate: data.targetDate };
    return setChecklistItems(prev => [item, ...prev],()=>setActiveTab('checklist'));
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
        currentWeek={pregnancyMetrics?.currentWeek}
        currentDay={pregnancyMetrics?.currentDay}
        householdName={runtime?.initial.householdName}
        isDemo={false}
      />

      {/* 2. MAIN APPLICATION CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-screen relative overflow-x-hidden">
        {/* Mobile Sticky Top Header (Hidden on Desktop) */}
        <div className="lg:hidden">
          <TopHeader />
        </div>

        <div className="lg:hidden flex gap-2 px-4 py-2"><button onClick={() => setActiveTab('appointments')} className="px-3 py-1.5 rounded-full bg-[#EEE9FF] text-[#6C4CF5] text-xs font-black">Jadwal</button><button onClick={() => setActiveTab('documents')} className="px-3 py-1.5 rounded-full bg-[#F5F3ED] text-[#34236B] text-xs font-black">Dokumen</button>{runtime && <button onClick={()=>setPregnancySetup(true)} className="px-3 py-1.5 rounded-full bg-[#EEE9FF] text-[#6C4CF5] text-xs font-black">Atur HPL</button>}</div>
        {/* Neutral desktop header; profiles are not configured. */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white/80 border-b border-[#F0ECE4] sticky top-0 z-20"><div><span className="text-xs font-bold text-[#79738E]">Selamat datang 👋</span><h2 className="text-lg font-black text-[#292442]">Little Journey</h2></div>{runtime && <button onClick={()=>setPregnancySetup(true)} className="px-4 py-2 rounded-full bg-[#EEE9FF] text-[#6C4CF5] text-xs font-black">Atur HPL</button>}</header>
        {control.current?.fileCleanupPending && <p role="alert" className="px-4 py-3 text-sm bg-[#FFF8DE]">Catatan tersimpan, tetapi file lama belum berhasil dihapus dari penyimpanan.</p>}
        {saveError && <div role="alert" className="fixed inset-x-4 top-4 z-[110] mx-auto max-w-xl rounded-2xl border border-[#F0C6BF] px-5 py-4 shadow-xl text-sm text-[#B14435] bg-[#FFF2EF]">{saveError} <button onClick={()=>window.location.reload()} className="mt-2 block underline font-bold">Muat ulang data</button></div>}
        <div className="lg:hidden px-4"><button onClick={()=>setActiveTab('profile')} className="px-3 py-2 text-xs font-bold text-[#6C4CF5]">Profil</button></div>
        {runtime && <div className="px-4 lg:px-8 py-2"><button onClick={()=>setReportOpen(true)} className="rounded-full border border-[#E9E4DC] bg-white px-4 py-2 text-xs font-bold text-[#6C4CF5]">Download Laporan Bulanan</button></div>}
        {/* Dynamic View Display */}
        <main className="flex-1 py-4 sm:py-6">
          {activeTab === 'profile' && runtime?.client && runtime?.user && <ProfileView client={runtime.client} user={runtime.user} householdId={runtime.initial.householdId} onLogout={onLogout} />}
          {activeTab === 'home' && (
            <DashboardView
              onNavigateTab={(tab) => setActiveTab(tab)}
              onToggleChecklist={handleToggleChecklist}
              checklistItems={checklistItems}
              shoppingItems={shoppingItems}
              budgetSummary={budgetSummary}
              stage={activeStage}
              pregnancyMetrics={pregnancyMetrics}
              pregnancyDueDate={dueDate}
              isDemo={false}
              isBudgetConfigured={isBudgetConfigured}
              expenses={expenses}
              appointments={appointments}
            />
          )}

          {activeTab === 'checklist' && (
            <ChecklistView
              currentWeek={pregnancyMetrics?.currentWeek || 0}
              items={checklistItems}
              onToggleItem={handleToggleChecklist}
              onEditItem={setTaskEditor}
              onDeleteItem={task => setConfirmation({title:'Hapus Checklist?',body:'Item ini akan dihapus dari checklist. Lanjutkan?',actions:[{label:'Hapus Checklist',run:()=>setChecklistItems(prev=>prev.filter(item=>item.id!==task.id))}]})}
              onAddItem={() => {setQuickAddInitialType('tugas'); setIsQuickAddOpen(true);}}
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
              onScheduleAgain={record => setEditor({kind:'appointment',template:{purpose:record.purpose,doctor:record.doctor,hospital:record.hospital}})}
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
        initialType={quickAddInitialType}
        onClose={() => {setIsQuickAddOpen(false); setQuickAddInitialType(null);}}
        onSaveItem={handleSaveQuickItem}
        activeStage={activeStage}
      />

      {editor && <RecordEditor key={editor.kind + (editor.record?.id || 'new')} kind={editor.kind} record={editor.record} template={editor.template} stage={editor.record?.stage || activeStage} onSave={data => saveRecord(editor.kind, data, editor.record)} onClose={() => setEditor(null)} />}
      {confirmation && <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"><div role="dialog" aria-modal="true" aria-labelledby="confirmation-title" className="bg-white rounded-[28px] p-6 w-full max-w-md shadow-xl space-y-4"><h2 id="confirmation-title" className="text-lg font-black text-[#292442]">{confirmation.title}</h2><p className="text-sm text-[#79738E]">{confirmation.body}</p><div className="space-y-2">{confirmation.actions.map(action => <button key={action.label} onClick={() => { action.run(); setConfirmation(null); }} className="block w-full px-4 py-3 rounded-2xl bg-[#34236B] text-white text-xs font-black">{action.label}</button>)}<button onClick={() => setConfirmation(null)} className="w-full py-2 text-xs font-bold text-[#79738E]">Batal</button></div></div></div>}
      {expenseDetail && <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"><div role="dialog" aria-modal="true" aria-labelledby="expense-detail-title" className="bg-white rounded-[28px] p-6 w-full max-w-md space-y-3"><div className="flex items-start justify-between"><h2 id="expense-detail-title" className="font-black text-[#292442]">{expenseDetail.title}</h2><button aria-label="Tutup Detail" onClick={() => setExpenseDetail(null)}>✕</button></div><p className="text-sm text-[#79738E]">{displayDate(expenseDetail.expenseDate)} • {expenseDetail.category || 'Tanpa kategori'}</p><p className="font-black text-[#34236B]">Rp {expenseDetail.paidAmount.toLocaleString('id-ID')}</p>{expenseDetail.notes && <p className="text-sm text-[#79738E]">{expenseDetail.notes}</p>}{expenseDetail.attachment && <button onClick={() => setAttachment(expenseDetail.attachment!)} className="px-3 py-2 rounded-xl bg-[#EEE9FF] text-[#6C4CF5] font-black text-xs">Lihat Lampiran</button>}</div></div>}
      {attachment && <AttachmentView attachment={attachment} onClose={() => setAttachment(null)} />}
      {pregnancySetup && <PregnancySetup dueDate={dueDate} onSave={date=>commit({dueDate:date,pregnancyId:control.current?.pregnancyId || crypto.randomUUID()})} onClose={()=>setPregnancySetup(false)}/>}

      {/* 4.5 BUDGET SETUP MODAL */}
      <BudgetSetupModal
        isOpen={isBudgetSetupOpen}
        onClose={() => setIsBudgetSetupOpen(false)}
        currentTotalBudget={totalHouseholdBudget}
        currentCategories={categoryAllocations}
        onSaveBudgetSetup={(newBudget, newCats) => commit({totalBudget:newBudget,budgetConfigured:true,allocations:newCats})}
      />

      {reportOpen && runtime && <MonthlyReportModal runtime={runtime} onClose={()=>setReportOpen(false)} />}
      {taskEditor && <TaskEditor key={taskEditor.id} item={taskEditor} onClose={()=>setTaskEditor(null)} onSave={item=>setChecklistItems(prev=>prev.map(old=>old.id===item.id?item:old),()=>setTaskEditor(null))} />}
      {saving && <div role="status" aria-live="polite" className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-xs flex items-center justify-center"><p className="rounded-2xl bg-white px-6 py-4 shadow-lg font-bold text-[#34236B]">Menyimpan…</p></div>}
    </div>
  );
}
