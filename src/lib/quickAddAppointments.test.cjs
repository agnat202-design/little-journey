// Component integration tests run the real App/forms/views with synchronous
// React hooks. Browser interactions and layout are checked separately in QA.
const assert = require('node:assert/strict');
const vm = require('node:vm');
const path = require('node:path');
const crypto = require('node:crypto');
const { buildSync } = require('esbuild');
let passed = 0;
const states = new Map();
let state, index;
const React = {
  createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
  useState(initial) { const n = index++; if (!(n in state)) state[n] = typeof initial === 'function' ? initial() : initial; const own = state; return [own[n], value => { own[n] = typeof value === 'function' ? value(own[n]) : value; }]; },
  useMemo: fn => fn(), useEffect() {},
};
class TestURL extends URL { static createObjectURL(file) { return `blob:test/${file.name}`; } }
const compiled = buildSync({ entryPoints: [path.join(__dirname, '../App.tsx')], bundle: true, write: false, format: 'cjs', platform: 'node', jsx: 'transform', tsconfigRaw: { compilerOptions: { jsx: 'react' } }, define: { 'import.meta.env':'{}' }, external: ['react', 'lucide-react'] }).outputFiles[0].text;
const moduleStub = { exports: {} };
vm.runInNewContext(compiled, { module: moduleStub, exports: moduleStub.exports, require: name => { if (name === 'react') return React; if (name === 'lucide-react') return new Proxy({}, { get: (_, key) => key }); throw new Error(name); }, Date, Intl, URL: TestURL, crypto, setTimeout, clearTimeout });
const App = moduleStub.exports.default;
const stateKey = (type, props) => `${type.name}:${props.kind || ''}:${props.initial?.id || ''}`;
function render(type, props = {}) { const key = stateKey(type, props); if (!states.has(key)) states.set(key, []); state = states.get(key); index = 0; return type(props); }
function nodes(tree) { return !tree || typeof tree !== 'object' ? [] : [tree, ...(tree.props.children || []).flat(Infinity).flatMap(nodes)]; }
function text(tree) { if (tree == null || typeof tree === 'boolean') return ''; return typeof tree !== 'object' ? String(tree) : (tree.props.children || []).flat(Infinity).map(text).join(''); }
function find(tree, test) { const node = nodes(tree).find(test); assert.ok(node, 'Expected UI element exists'); return node; }
const component = (tree, name) => find(tree, n => n.type?.name === name);
const app = () => render(App);
function nav(tab) { component(app(), 'DesktopSidebar').props.onTabChange(tab); return app(); }
function view(name) { return component(app(), name); }
function field(tree, id, value) { find(tree, n => n.props.id === id).props.onChange({ target: { value } }); }
function button(tree, label) { return find(tree, n => n.type === 'button' && text(n) === label); }
const submit = tree => find(tree, n => n.type === 'form').props.onSubmit({ preventDefault() {} });
function entryFromEditor() { const editor = view('RecordEditor'); const container = render(editor.type, editor.props); return component(container, 'RecordEntryForm'); }
function openQuick(label) {
  component(app(), 'DesktopSidebar').props.onQuickAdd();
  const sheet = view('QuickAddBottomSheet');
  const formElement = render(sheet.type, sheet.props);
  const neutral = render(formElement.type, formElement.props);
  assert.ok(text(neutral).includes('Pilih jenis catatan untuk mulai.'));
  button(neutral, label).props.onClick();
  const body = render(formElement.type, formElement.props);
  return component(body, 'RecordEntryForm');
}
function fillEntry(element, data) { let form = render(element.type, element.props); for (const [id, value] of Object.entries(data)) { field(form, id, value); form = render(element.type, element.props); } return form; }
function confirm(label) { const modal = find(app(), n => n.props['aria-labelledby'] === 'confirmation-title'); button(modal, label).props.onClick(); }
function test(label, fn) { states.clear(); fn(); passed++; console.log(`PASS: ${label}`); }

test('Initial empty records contain no invented personal data or misleading session status', () => {
  const root = app();
  assert.ok(!text(root).includes('Prototipe lokal'));
  assert.ok(!/Sarah|Agung|Synced|BBY-772|Kalian terhubung/.test(text(root)));
  const header = component(root, 'TopHeader');
  const headerText = text(render(header.type, header.props));
  assert.ok(headerText.includes('Little Journey')); assert.ok(!/Synced|Sarah|Agung/.test(headerText));
  const sidebar = component(root, 'DesktopSidebar');
  const sidebarText = text(render(sidebar.type, sidebar.props));
  assert.ok(!sidebarText.includes('Demo')); assert.ok(!/Household Aktif|Timeline|Settings|Sarah|Agung/.test(sidebarText));
  const dashboard = view('DashboardView');
  const dashboardTree = render(dashboard.type, dashboard.props);
  assert.equal(dashboard.props.pregnancyMetrics,undefined);
  assert.equal(dashboard.props.pregnancyDueDate,undefined);
  assert.ok(text(dashboardTree).includes('Perjalanan keluarga'));
  assert.ok(!/Demo|HPL contoh|Ukuran Bayi|430g|28 cm|Setengah jalan/.test(text(dashboardTree)));
  assert.equal(dashboard.props.checklistItems.length, 0); assert.equal(dashboard.props.shoppingItems.length, 0);
  assert.equal(dashboard.props.appointments.length, 0); assert.equal(dashboard.props.expenses.length, 0);
  nav('budget'); const budget = view('BudgetView');
  assert.equal(budget.props.budgetSummary.totalBudget, 0); assert.equal(budget.props.budgetSummary.actualPaid, 0);
  assert.equal(budget.props.isBudgetConfigured, false);
  assert.ok(text(render(budget.type, budget.props)).includes('Atur budget pertama kamu'));
  nav('documents'); assert.equal(view('DocumentsView').props.documents.length, 0);
});

test('Checklist has no gestational timing controls', () => {
  nav('checklist'); const list=view('ChecklistView');const tree=render(list.type,list.props);
  assert.ok(!/Semua Minggu|Target Trimester/.test(text(tree)));
  component(app(),'DesktopSidebar').props.onQuickAdd();const sheet=view('QuickAddBottomSheet');const shell=render(sheet.type,sheet.props);let body=render(shell.type,shell.props);
  button(body,'Checklist').props.onClick();body=render(shell.type,shell.props);
  assert.ok(text(body).includes('Simpan Checklist'));assert.ok(!text(body).includes('Target Minggu'));
  assert.ok(!nodes(body).some(n=>n.props.id==='task-week'));
});

test('Tasks can edit/delete without toggling status and use compact relevant categories', () => {
  nav('checklist'); let list = view('ChecklistView');
  list.props.onEditItem({id:'task-qa',householdId:'household',stage:'pregnancy',name:'Original',category:'Medical',status:'Completed',priority:'Medium'});
  const editor = view('TaskEditor');
  assert.equal(editor.props.item.name,'Original');
  editor.props.onSave({...editor.props.item,name:'Changed'});
  const item = {id:'task-qa',name:'Changed',category:'Medical',status:'Completed',priority:'Medium'};
  let edited=0,deleted=0,toggled=0;
  const tree=render(list.type,{...list.props,items:[item],onEditItem:()=>edited++,onDeleteItem:()=>deleted++,onToggleItem:()=>toggled++});
  button(tree,'Edit').props.onClick();button(tree,'Hapus').props.onClick();
  assert.equal(edited,1);assert.equal(deleted,1);assert.equal(toggled,0);
  assert.ok(!text(tree).includes('PIC:'));
  const selector=find(tree,n=>n.type==='select');
  assert.equal(nodes(selector).filter(n=>n.type==='option').length,2);
  assert.ok(!text(selector).includes('Travel'));
  list.props.onDeleteItem(item);confirm('Hapus Checklist');
});

test('Record action menu closes before Edit, Delete and extra detail actions', () => {
  const list = newShopping(); const card = render(list.type, list.props);
  const actions = component(card, 'RecordActions'); let edited = 0, deleted = 0;
  const tree = render(actions.type, { ...actions.props, onEdit: () => edited++, onDelete: () => deleted++ });
  const menu = find(tree, n => n.props.onClickCapture);
  const details = { open: true };
  const actionEvent = { target: { closest: selector => selector === 'button' ? {} : null }, currentTarget: { closest: () => details } };
  menu.props.onClickCapture(actionEvent); button(tree, 'Edit').props.onClick();
  assert.equal(details.open, false); assert.equal(edited, 1);
  details.open = true; menu.props.onClickCapture(actionEvent); button(tree, 'Hapus').props.onClick();
  assert.equal(details.open, false); assert.equal(deleted, 1);
  details.open = true; menu.props.onClickCapture(actionEvent); assert.equal(details.open, false, 'Extra detail buttons use the same closure');
});

test('Dashboard explains retained Shopping spend independently of current bought-item count', () => {
  let list = purchase(newShopping(), 175000); list.props.onReverse(list.props.items[0]);
  confirm('Batalkan status saja, pertahankan pengeluaran');
  list = view('ShoppingView'); list.props.onDelete(list.props.items[0]); confirm('Hapus Barang');
  nav('home'); const dashboard = view('DashboardView'); const output = text(render(dashboard.type, dashboard.props));
  assert.equal(dashboard.props.shoppingItems.length, 0);
  assert.ok(output.includes('Total Belanja (Riwayat Pengeluaran): Rp 175.000'));
  assert.ok(output.includes('Termasuk transaksi yang dipertahankan'));
});

test('Global + opens neutral and resets after closing', () => {
  openQuick('Belanja'); const sheet = view('QuickAddBottomSheet'); sheet.props.onClose();
  assert.equal(render(sheet.type, view('QuickAddBottomSheet').props), null);
  for (const key of states.keys()) if (key.startsWith('QuickAddForm:') || key.startsWith('RecordEntryForm:')) states.delete(key);
  component(app(), 'DesktopSidebar').props.onQuickAdd();
  const reopened = render(sheet.type, view('QuickAddBottomSheet').props);
  assert.ok(text(render(reopened.type, reopened.props)).includes('Pilih jenis catatan untuk mulai.'));
});

test('Expense categories are five plain choices, optional, with legacy values preserved', () => {
  const entry=openQuick('Pengeluaran');const form=render(entry.type,entry.props);const select=find(form,n=>n.props.id==='record-category');
  assert.equal(nodes(select).filter(n=>n.type==='option').length,6);
  assert.ok(text(select).includes('Kesehatan'));assert.ok(text(select).includes('Kebutuhan anak'));
  assert.ok(!text(select).includes('Diapering'));assert.equal(select.props.required,undefined);
});

test('Appointments prioritize upcoming, include today, group past months and paginate history', () => {
  nav('appointments');const list=view('AppointmentsView');const props={...list.props,today:'2026-10-05',appointments:[{id:'future',purpose:'Future',appointmentDate:'2026-11-17'},{id:'today',purpose:'Today',appointmentDate:'2026-10-05',appointmentTime:'09:00',notes:'long '.repeat(50)},...Array.from({length:12},(_,i)=>({id:'past-'+i,purpose:'Past '+i,appointmentDate:i<6?'2026-10-03':'2026-09-18'}))]};
  let tree=render(list.type,props);assert.ok(text(tree).includes('Mendatang (2)'));assert.ok(text(tree).includes('Riwayat (12)'));assert.ok(text(tree).includes('Hari ini'));assert.ok(!text(tree).includes('Past 0'));assert.ok(text(tree).indexOf('Today')<text(tree).indexOf('Future'));assert.ok(nodes(tree).some(n=>n.type==='details'));
  const buttons=nodes(tree).filter(n=>n.type==='button');assert.equal(text(buttons[0]),'Tambah Jadwal');
  button(tree,'Riwayat (12)').props.onClick();tree=render(list.type,props);assert.equal(nodes(tree).filter(n=>n.type==='article').length,10);assert.ok(text(tree).includes('Oktober 2026'));assert.ok(text(tree).includes('September 2026'));assert.ok(text(tree).includes('Tidak berarti kontrol telah dilakukan.'));assert.ok(!text(tree).includes('Today'));
  button(tree,'Lihat lebih banyak').props.onClick();tree=render(list.type,props);assert.equal(nodes(tree).filter(n=>n.type==='article').length,12);
});

test('Appointment required date, quick time, separate doctor/location and notes; no cost', () => {
  const entry = openQuick('Jadwal');
  let form = fillEntry(entry, { 'record-title': 'Kontrol keluarga' });
  assert.equal(find(form, n => n.type === 'button' && n.props.type === 'submit').props.disabled, true);
  submit(form); nav('appointments'); assert.equal(view('AppointmentsView').props.appointments.length, 0);
  form = fillEntry(entry, { 'record-date': '2026-10-25', 'appointment-time-choice': '10:00', 'appointment-doctor': 'dr. Keluarga', 'appointment-location': 'Klinik pilihan', 'record-notes': 'Bawa hasil lab' });
  const options = find(form, n => n.props.id === 'appointment-time-choice');
  for (const time of ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','Lainnya']) assert.ok(text(options).includes(time));
  submit(form); const list = view('AppointmentsView'); const saved = list.props.appointments[0];
  assert.equal(saved.appointmentDate, '2026-10-25'); assert.equal(saved.appointmentTime, '10:00'); assert.equal(saved.doctor, 'dr. Keluarga'); assert.equal(saved.hospital, 'Klinik pilihan'); assert.equal(saved.notes, 'Bawa hasil lab'); assert.ok(!('cost' in saved));
  const display = text(render(list.type, list.props)); assert.ok(display.includes('25 Okt 2026 • 10:00')); assert.ok(!/Estimasi Biaya|Rp /.test(display));
});

test('Schedule again creates a separate appointment with same doctor/location and requires a new date', () => {
  const entry=openQuick('Jadwal');submit(fillEntry(entry,{'record-title':'Kontrol','record-date':'2026-10-16','appointment-doctor':'Dr Indri','appointment-location':'Klinik','appointment-time-choice':'11:00','record-notes':'Catatan lama'}));
  let list=view('AppointmentsView');const original=list.props.appointments[0];
  const tree=render(list.type,list.props);button(tree,'Jadwalkan Lagi').props.onClick();
  const next=entryFromEditor();states.delete(stateKey(next.type,next.props));let form=render(next.type,next.props);
  assert.equal(find(form,n=>n.props.id==='record-title').props.value,'Kontrol');
  assert.equal(find(form,n=>n.props.id==='appointment-doctor').props.value,'Dr Indri');
  assert.equal(find(form,n=>n.props.id==='appointment-location').props.value,'Klinik');
  assert.equal(find(form,n=>n.props.id==='record-date').props.value,'');
  assert.equal(find(form,n=>n.props.id==='appointment-time-choice').props.value,'');
  assert.equal(find(form,n=>n.props.id==='record-notes').props.value,'');
  assert.ok(!nodes(form).some(n=>n.props.id==='record-week'));
  submit(form);assert.equal(view('AppointmentsView').props.appointments.length,1);
  form=fillEntry(next,{'record-date':'2026-11-17'});submit(form);
  list=view('AppointmentsView');assert.equal(list.props.appointments.length,2);
  assert.equal(list.props.appointments[0].appointmentDate,'2026-11-17');
  assert.notEqual(list.props.appointments[0].id,original.id);
  assert.deepEqual(list.props.appointments[1],original);
});

test('Appointment custom time, optional time, edit and confirmed delete', () => {
  const entry = openQuick('Jadwal'); const form = fillEntry(entry, { 'record-title': 'Kontrol sore', 'record-date': '2026-10-26', 'appointment-time-choice': 'other', 'appointment-custom-time': '16:45' });
  submit(form); let list = view('AppointmentsView'); const id = list.props.appointments[0].id; assert.equal(list.props.appointments[0].appointmentTime, '16:45');
  list.props.onEdit(list.props.appointments[0]); const edit = entryFromEditor(); submit(fillEntry(edit, { 'record-title': 'Kontrol revisi', 'record-date': '2026-10-27', 'appointment-time-choice': '' }));
  list = view('AppointmentsView'); assert.equal(list.props.appointments[0].appointmentTime, undefined); assert.equal(list.props.appointments[0].purpose, 'Kontrol revisi');
  list.props.onDelete(list.props.appointments[0]); assert.equal(view('AppointmentsView').props.appointments.length, 1); confirm('Hapus'); assert.ok(!view('AppointmentsView').props.appointments.some(i => i.id === id));
});

function newShopping(estimate) { const entry = openQuick('Belanja'); const data = { 'record-title': 'Barang pilihan' }; if (estimate !== undefined) data['shopping-estimate'] = String(estimate); submit(fillEntry(entry, data)); return view('ShoppingView'); }
function purchase(list, price, date = '2026-10-03') { const item = list.props.items[0]; let card = render(list.type, { ...list.props, items: [item] }); button(card, 'Tandai Beli').props.onClick(); card = render(list.type, { ...list.props, items: [item] }); assert.equal(find(card, n => n.type === 'input' && n.props.type === 'number').props.value, '', 'Estimate is never prefilled as actual'); field(card, `buy-price-${item.id}`, String(price)); card = render(list.type, { ...list.props, items: [item] }); field(card, `buy-date-${item.id}`, date); card = render(list.type, { ...list.props, items: [item] }); submit(card); return view('ShoppingView'); }

test('Shopping estimate, optional fields, URL and no comparison or research terminology', () => {
  const entry = openQuick('Belanja'); let form = render(entry.type, entry.props); assert.equal(nodes(form).filter(n => n.props.required).length, 1); assert.ok(!nodes(form).some(n=>n.props.id==='record-week')); assert.ok(!text(form).includes('Target Minggu')); assert.ok(text(form).includes('Rencana Beli'));
  form = fillEntry(entry, { 'record-title': 'Barang URL', 'shopping-brand': 'Brand kami', 'shopping-model': 'Biru', 'shopping-estimate': '5500000', 'shopping-url': 'https://example.com/item?variant=blue', 'record-category': 'Travel', 'shopping-target-date': '2026-12-01', 'record-notes': 'Pilihan keluarga' });
  submit(form); const list = view('ShoppingView'); const saved = list.props.items[0]; assert.equal(saved.estimatedPrice, 5500000); assert.equal(saved.brand, 'Brand kami'); assert.equal(saved.targetDate, '2026-12-01');
  const card = render(list.type, { ...list.props, items: [saved] }); const link = find(card, n => n.type === 'a'); assert.equal(link.props.target, '_blank'); assert.equal(link.props.rel, 'noopener noreferrer');
  assert.ok(text(card).includes('Harga Perkiraan')); assert.ok(!/Target Plafon|Riset Harga|di bawah target|di atas target|Harga sesuai target|promo|diskon/i.test(text(card)));
});

test('Shopping unknown estimate differs from explicit zero; no URL button without URL', () => {
  let list = newShopping(); let item = list.props.items[0]; assert.equal(item.estimatedPrice, undefined); assert.equal(item.currentPrice, undefined); const card = render(list.type, { ...list.props, items: [item] }); assert.equal(nodes(card).filter(n => n.type === 'a').length, 0);
  list.props.onEdit(item); submit(fillEntry(entryFromEditor(), { 'shopping-estimate': '0' })); list = view('ShoppingView'); item = list.props.items[0]; assert.equal(item.estimatedPrice, 0); assert.ok(text(render(list.type, { ...list.props, items: [item] })).includes('Rp 0'));
});

test('Bought requires actual price AND date, allows explicit zero, creates at most one linked expense', () => {
  let list = newShopping(500000); const id = list.props.items[0].id; const baseline = list.props.expenses.length;
  list.props.onBuy(id, undefined, '2026-10-03'); assert.equal(view('ShoppingView').props.items[0].status, 'Wishlist'); list.props.onBuy(id, 0, ''); assert.equal(view('ShoppingView').props.items[0].status, 'Wishlist');
  list = purchase(list, 0); let saved = list.props.items[0]; assert.equal(saved.actualPurchasePrice, 0); assert.equal(saved.purchaseDate, '2026-10-03'); assert.equal(list.props.expenses.length, baseline + 1);
  const expense = list.props.expenses.find(e => e.shoppingItemId === id); assert.equal(expense.paidAmount, 0); assert.equal(expense.expenseDate, saved.purchaseDate);
  list.props.onBuy(id, 0, '2026-10-03'); assert.equal(view('ShoppingView').props.expenses.filter(e => e.shoppingItemId === id).length, 1);
});

test('Bought edit updates linked expense and Budget once; deleting item preserves financial history', () => {
  let list = purchase(newShopping(500000), 375000); const id = list.props.items[0].id;
  list.props.onEdit(list.props.items[0]); submit(fillEntry(entryFromEditor(), { 'record-title': 'Barang baru namanya', 'record-category': 'Feeding', 'shopping-actual': '425000', 'shopping-purchase-date': '2026-10-04' }));
  list = view('ShoppingView'); const expense = list.props.expenses.find(e => e.shoppingItemId === id); assert.equal(expense.paidAmount, 425000); assert.equal(expense.title, 'Barang baru namanya'); assert.equal(expense.category, 'Feeding'); assert.equal(expense.expenseDate, '2026-10-04');
  const allSpend = list.props.expenses.reduce((sum, e) => sum + e.paidAmount, 0); nav('budget'); const budget = view('BudgetView'); assert.equal(budget.props.budgetSummary.actualPaid, allSpend); assert.equal(budget.props.budgetSummary.remainingBudget, budget.props.budgetSummary.totalBudget - allSpend);
  const output = text(render(budget.type, budget.props)); assert.ok(output.includes('Riwayat Pengeluaran')); assert.ok(!/Committed|Outstanding|Projected|Allocated|Unallocated|Envelope|Amplop/.test(output));
  nav('shopping'); list = view('ShoppingView'); list.props.onDelete(list.props.items[0]); assert.ok(text(app()).includes('Menghapus barang tidak akan menghapus riwayat')); confirm('Hapus Barang'); list = view('ShoppingView'); assert.ok(!list.props.items.some(i => i.id === id)); const retained = list.props.expenses.find(e => e.id === expense.id); assert.equal(retained.shoppingItemId, undefined); assert.equal(retained.paidAmount, 425000); nav('budget'); assert.equal(view('BudgetView').props.budgetSummary.actualPaid, allSpend);
});

for (const remove of [false, true]) test(`Reverse bought explicitly ${remove ? 'deletes' : 'preserves'} the expense`, () => {
  let list = purchase(newShopping(), 120000); const id = list.props.items[0].id; const transactionId = list.props.expenses.find(e => e.shoppingItemId === id).id; list.props.onReverse(list.props.items[0]); assert.equal(view('ShoppingView').props.items[0].status, 'Bought');
  confirm(remove ? 'Batalkan pembelian dan hapus pengeluaran terkait' : 'Batalkan status saja, pertahankan pengeluaran');
  list = view('ShoppingView'); assert.equal(list.props.items[0].status, 'Wishlist'); const historical = list.props.expenses.filter(e => e.id === transactionId); assert.equal(historical.length, remove ? 0 : 1); if (!remove) assert.equal(historical[0].shoppingItemId, undefined);
});

test('Buying again after retaining history creates a distinct transaction and keeps one active link', () => {
  let list = purchase(newShopping(), 120000); const id = list.props.items[0].id;
  const original = list.props.expenses.find(e => e.shoppingItemId === id);
  list.props.onReverse(list.props.items[0]); confirm('Batalkan status saja, pertahankan pengeluaran');
  list = purchase(view('ShoppingView'), 130000);
  const linked = list.props.expenses.filter(e => e.shoppingItemId === id);
  assert.equal(linked.length, 1); assert.notEqual(linked[0].id, original.id);
  const historical = list.props.expenses.find(e => e.id === original.id);
  assert.equal(historical.paidAmount, 120000); assert.equal(historical.shoppingItemId, undefined);
  assert.equal(new Set(list.props.expenses.map(e => e.id)).size, list.props.expenses.length);
});

test('Invalid purchase dates do not create a transaction', () => {
  const list = newShopping(); const id = list.props.items[0].id; const count = list.props.expenses.length;
  for (const date of ['28 Okt 2026', '2026-02-30', '2026-13-01']) {
    list.props.onBuy(id, 10000, date);
    assert.equal(view('ShoppingView').props.items[0].status, 'Wishlist');
    assert.equal(view('ShoppingView').props.expenses.length, count);
  }
});

test('Deleting an unbought item requires confirmation', () => {
  const list = newShopping(); const count = list.props.items.length; list.props.onDelete(list.props.items[0]); assert.equal(view('ShoppingView').props.items.length, count); confirm('Hapus Barang'); assert.equal(view('ShoppingView').props.items.length, count - 1);
});

function attach(entry, name, mimeType) {
  const form = render(entry.type, entry.props); const picker = component(form, 'AttachmentPicker'); const controls = render(picker.type, picker.props);
  assert.equal(find(controls, n => n.props['aria-label'] === 'Ambil Foto').props.capture, 'environment');
  const upload = find(controls, n => n.props['aria-label'] === 'Upload File');
  upload.props.onChange({ target: { files: [{ name, type: mimeType, size: 2048 }], value: name } });
  return render(entry.type, entry.props);
}

test('Expense required amount/date, add with local receipt metadata, history, view, edit and confirmed delete', () => {
  const entry = openQuick('Pengeluaran'); let form = fillEntry(entry, { 'record-title': 'Pembayaran lab' }); assert.equal(find(form, n => n.type === 'button' && n.props.type === 'submit').props.disabled, true);
  form = fillEntry(entry, { 'expense-amount': '175000', 'record-date': '2026-10-03', 'record-category': 'Medical', 'record-notes': 'Pembayaran pribadi' });
  form = attach(entry, 'receipt.jpg', 'image/jpeg'); submit(form); let budget = view('BudgetView'); const saved = budget.props.expenses[0]; assert.equal(saved.paidAmount, 175000); assert.equal(saved.expenseDate, '2026-10-03'); assert.equal(saved.attachment.name, 'receipt.jpg'); assert.equal(saved.attachment.mimeType, 'image/jpeg'); assert.equal(saved.attachment.size, 2048); assert.ok(saved.attachment.localUrl.startsWith('blob:'));
  const history = text(render(budget.type, budget.props)); assert.ok(history.includes('Pembayaran lab')); assert.ok(history.includes('Foto • 2 KB'));
  budget.props.onViewExpense(saved); const detail = find(app(), n => n.props['aria-labelledby'] === 'expense-detail-title'); button(detail, 'Lihat Lampiran').props.onClick(); const attachment = view('AttachmentView'); assert.equal(attachment.props.attachment.name, 'receipt.jpg'); assert.equal(find(render(attachment.type, attachment.props), n => n.type === 'img').props.src, saved.attachment.localUrl); attachment.props.onClose();
  button(detail, '✕').props.onClick();
  budget.props.onEditExpense(saved); submit(fillEntry(entryFromEditor(), { 'expense-amount': '250000', 'record-title': 'Lab revisi' })); budget = view('BudgetView'); const edited = budget.props.expenses.find(e => e.id === saved.id); assert.equal(edited.paidAmount, 250000); assert.equal(edited.attachment.id, saved.attachment.id);
  budget.props.onDeleteExpense(edited); assert.ok(view('BudgetView').props.expenses.some(e => e.id === saved.id)); confirm('Hapus Pengeluaran'); assert.ok(!view('BudgetView').props.expenses.some(e => e.id === saved.id));
});

test('Deleting a linked Expense asks for an explicit Shopping status change', () => {
  let list = purchase(newShopping(), 85000); const id = list.props.items[0].id; const expense = list.props.expenses.find(e => e.shoppingItemId === id);
  nav('budget'); view('BudgetView').props.onDeleteExpense(expense); assert.ok(text(app()).includes('Menghapus transaksi juga mengubah barang menjadi Belum Dibeli'));
  nav('shopping'); assert.equal(view('ShoppingView').props.items[0].status, 'Bought'); confirm('Hapus dan Batalkan Status Barang'); assert.equal(view('ShoppingView').props.items[0].status, 'Wishlist'); assert.ok(!view('ShoppingView').props.expenses.some(e => e.id === expense.id));
});

test('Expense edits synchronize a linked Shopping purchase', () => {
  const list = purchase(newShopping(), 85000); const id = list.props.items[0].id; const expense = list.props.expenses.find(e => e.shoppingItemId === id);
  nav('budget'); view('BudgetView').props.onEditExpense(expense); submit(fillEntry(entryFromEditor(), { 'record-title': 'Nama transaksi revisi', 'expense-amount': '90000', 'record-date': '2026-10-04', 'record-category': 'Travel' })); nav('shopping'); const item = view('ShoppingView').props.items[0]; assert.equal(item.item, 'Nama transaksi revisi'); assert.equal(item.actualPurchasePrice, 90000); assert.equal(item.purchaseDate, '2026-10-04'); assert.equal(item.category, 'Travel');
});

test('Shopping Edit displays a category saved through the linked Expense', () => {
  let list = purchase(newShopping(), 30000); const item = list.props.items[0];
  const expense = list.props.expenses.find(e => e.shoppingItemId === item.id);
  nav('budget'); view('BudgetView').props.onEditExpense(expense);
  submit(fillEntry(entryFromEditor(), { 'record-category': 'Medical' }));
  nav('shopping'); list = view('ShoppingView'); list.props.onEdit(list.props.items[0]);
  const entry = entryFromEditor(); const form = render(entry.type, entry.props);
  const category = find(form, n => n.props.id === 'record-category');
  assert.equal(category.props.value, 'Medical'); assert.ok(nodes(category).some(n=>n.type==='option' && n.props.value==='Medical'));
  submit(form); assert.equal(view('ShoppingView').props.items[0].category, 'Medical');
  assert.equal(view('ShoppingView').props.expenses.find(e => e.shoppingItemId === item.id).category, 'Medical');
});

test('Documents add/view/edit/delete with local file metadata and required file', () => {
  nav('documents'); let list = view('DocumentsView'); assert.equal(list.props.documents.length, 0); list.props.onAdd(); let entry = entryFromEditor(); let form = fillEntry(entry, { 'record-title': 'USG keluarga', 'record-date': '2026-10-03', 'record-notes': 'Untuk kontrol berikutnya' }); assert.equal(find(form, n => n.type === 'button' && n.props.type === 'submit').props.disabled, true);
  const selector = find(form, n => n.props.id === 'document-type'); for (const type of ['USG','Hasil Lab','Dokumen Kontrol','Invoice','Receipt','Resep','Lainnya']) assert.ok(text(selector).includes(type));
  form = attach(entry, 'USG.pdf', 'application/pdf'); submit(form); list = view('DocumentsView'); const doc = list.props.documents[0]; assert.equal(doc.documentType, 'USG'); assert.equal(doc.documentDate, '2026-10-03'); assert.equal(doc.attachment.name, 'USG.pdf'); assert.equal(doc.fileSize, 2048);
  list.props.onView(doc); const attachment = view('AttachmentView'); const preview = render(attachment.type, attachment.props); assert.equal(find(preview, n => n.type === 'iframe').props.src, doc.fileUrl); attachment.props.onClose();
  list.props.onEdit(doc); entry = entryFromEditor(); submit(fillEntry(entry, { 'record-title': 'Resep keluarga', 'document-type': 'Resep' })); list = view('DocumentsView'); assert.equal(list.props.documents.length, 1); assert.equal(list.props.documents[0].documentType, 'Resep'); assert.equal(list.props.documents[0].attachment.id, doc.attachment.id);
  list.props.onDelete(list.props.documents[0]); assert.equal(view('DocumentsView').props.documents.length, 1); confirm('Hapus'); assert.equal(view('DocumentsView').props.documents.length, 0);
});

test('Total-only Budget setup saves with no category allocation requirement', () => {
  nav('budget'); view('BudgetView').props.onOpenBudgetSetup(); const modal = view('BudgetSetupModal'); const wrapper = render(modal.type, { ...modal.props, currentCategories: [] }); let form = render(wrapper.type, wrapper.props); field(form, 'budget-total', '40000000'); form = render(wrapper.type, wrapper.props); submit(form); assert.equal(view('BudgetView').props.budgetSummary.totalBudget, 40000000);
});

test('An explicitly configured zero Budget differs from an unconfigured Budget', () => {
  nav('budget'); view('BudgetView').props.onOpenBudgetSetup(); const modal = view('BudgetSetupModal');
  const wrapper = render(modal.type, modal.props); let form = render(wrapper.type, wrapper.props);
  field(form, 'budget-total', '0'); form = render(wrapper.type, wrapper.props); submit(form);
  const budget = view('BudgetView'); assert.equal(budget.props.isBudgetConfigured, true);
  assert.equal(budget.props.budgetSummary.totalBudget, 0);
  assert.ok(!text(render(budget.type, budget.props)).includes('Atur budget pertama kamu'));
});

test('Budget category totals include all actual Expense categories without double counting', () => {
  const list = purchase(newShopping(), 75000); const paid = list.props.expenses.reduce((sum,e) => sum + e.paidAmount, 0); nav('budget'); const budget = view('BudgetView'); assert.equal(budget.props.budgetSummary.actualPaid, paid);
  const output = text(render(budget.type, budget.props)); assert.ok(output.includes('Pengeluaran per Kategori')); assert.ok(output.includes('Riwayat Pengeluaran'));
  const recordsCode = buildSync({ entryPoints: [path.join(__dirname, 'familyRecords.ts')], bundle: true, write: false, platform: 'node', format: 'cjs' }).outputFiles[0].text;
  const m = { exports: {} }; vm.runInNewContext(recordsCode, { module: m, exports: m.exports, Date, Intl }); const totals = m.exports.categorySpending(list.props.expenses); assert.equal(totals.reduce((sum,e) => sum + e.amount, 0), paid); assert.equal(m.exports.shoppingSpend(list.props.expenses), list.props.expenses.filter(e => e.shoppingItemId || e.source === 'shopping').reduce((sum,e) => sum + e.paidAmount, 0));
});

console.log(`UX cleanup integration groups passed: ${passed}; failed: 0`);

async function persistentIntegration() {
  states.clear();
  const initial={householdId:crypto.randomUUID(),householdName:'User family',version:'v1',records:{shoppingItems:[],expenses:[],appointments:[],documents:[]},tasks:[],totalBudget:1000000,budgetConfigured:true,allocations:[]};
  let resolveSave, rejectSave, sent, calls=0;
  const runtime={initial,save:next=>{calls++;sent=next;return new Promise((resolve,reject)=>{resolveSave=resolve;rejectSave=reject;});}};
  const persistent=()=>render(App,{runtime});
  const quick=component(persistent(),'QuickAddBottomSheet');
  const saving=quick.props.onSaveItem('belanja',{title:'User stroller',estimatedPrice:250000,category:''});
  assert.equal(component(persistent(),'DashboardView').props.shoppingItems.length,0,'Uncommitted item must not appear as saved');
  assert.equal(sent.records.shoppingItems[0].householdId,initial.householdId);
  assert.ok(text(persistent()).includes('Menyimpan'));
  resolveSave({...sent,version:'v2'});assert.equal(await saving,true);
  let list=component(persistent(),'ShoppingView');assert.equal(list.props.items.length,1);
  assert.equal(list.props.items[0].item,'User stroller');
  const buying=list.props.onBuy(list.props.items[0].id,225000,'2026-10-04');
  assert.equal(sent.records.shoppingItems[0].status,'Bought');assert.equal(sent.records.expenses.length,1);
  assert.equal(sent.records.expenses[0].paidAmount,225000);assert.equal(sent.records.expenses[0].shoppingItemId,sent.records.shoppingItems[0].id);
  assert.equal(component(persistent(),'ShoppingView').props.expenses.length,0);
  resolveSave({...sent,version:'v3'});assert.equal(await buying,true);
  list=component(persistent(),'ShoppingView');assert.equal(list.props.expenses.length,1);
  component(persistent(),'DesktopSidebar').props.onTabChange('home');
  const dashboard=component(persistent(),'DashboardView');assert.equal(dashboard.props.budgetSummary.actualPaid,225000);
  assert.equal(dashboard.props.isDemo,false);assert.equal(dashboard.props.pregnancyMetrics,undefined,'No hardcoded pregnancy when HPL absent');
  const failing=component(persistent(),'QuickAddBottomSheet').props.onSaveItem('jadwal',{title:'Control',appointmentDate:'2026-10-28'});
  rejectSave({code:'40001'});assert.equal(await failing,false);
  assert.equal(component(persistent(),'DashboardView').props.appointments.length,0);
  assert.ok(text(persistent()).includes('Muat ulang'));
  assert.equal(component(persistent(),'QuickAddBottomSheet').props.onSaveItem('jadwal',{title:'Do not duplicate',appointmentDate:'2026-10-28'}),false);
  assert.equal(calls,3,'Unknown/stale save must require reload before retry to prevent duplicate entry');
  console.log('PASS persistent App: commit acknowledgement, atomic purchase/Expense budget, failed-write state and duplicate-retry protection');
}
persistentIntegration().catch(error=>{console.error(error);process.exitCode=1;});
