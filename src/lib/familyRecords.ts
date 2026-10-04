import { Appointment, DocumentRecord, Expense, ShoppingItem } from '../types/domain';
import { calculateBudget } from './businessLogic';
import { isShoppingPrice } from './shopping';

export interface FamilyRecords {
  shoppingItems: ShoppingItem[];
  expenses: Expense[];
  appointments: Appointment[];
  documents: DocumentRecord[];
}
export function expenseBudget(total: number, records: FamilyRecords) {
  // Actual spending comes exclusively from transactions. Bought items are
  // represented by their linked transaction, never counted a second time.
  return calculateBudget(total, records.shoppingItems.filter(i => i.status !== 'Bought' && i.status !== 'Received'), records.expenses);
}
export function shoppingSpend(expenses: Expense[]) {
  return expenses.filter(e => e.source === 'shopping' || !!e.shoppingItemId).reduce((sum, e) => sum + e.paidAmount, 0);
}
export function categorySpending(expenses: Expense[]) {
  const totals = new Map<string, number>();
  for (const e of expenses) totals.set(e.category || 'Lainnya', (totals.get(e.category || 'Lainnya') || 0) + e.paidAmount);
  return Array.from(totals, ([category, amount]) => ({ category, amount }));
}
export function buyShopping(records: FamilyRecords, id: string, price: number, date: string): FamilyRecords {
  const item = records.shoppingItems.find(i => i.id === id);
  if (!item || !isShoppingPrice(price) || !isRecordDate(date)) return records;
  const existing = records.expenses.find(e => e.shoppingItemId === id);
  const expense: Expense = {
    ...existing, id: existing?.id || crypto.randomUUID(), householdId: item.householdId,
    childId: item.childId, stage: item.stage, shoppingItemId: id, source: 'shopping',
    title: item.item, category: item.category || 'Other', totalAmount: price, paidAmount: price,
    paymentStatus: 'Paid', expenseDate: date,
  };
  return { ...records,
    shoppingItems: records.shoppingItems.map(i => i.id === id ? { ...i, status: 'Bought', actualPurchasePrice: price, actualPrice: price / (i.quantity || 1), purchaseDate: date } : i),
    expenses: [expense, ...records.expenses.filter(e => e.shoppingItemId !== id)],
  };
}
export function editShopping(records: FamilyRecords, item: ShoppingItem): FamilyRecords {
  const next = { ...records, shoppingItems: records.shoppingItems.map(i => i.id === item.id ? item : i) };
  const linked = records.expenses.some(e => e.shoppingItemId === item.id);
  return linked && (item.status === 'Bought' || item.status === 'Received')
    ? buyShopping(next, item.id, item.actualPurchasePrice ?? item.actualPrice * (item.quantity || 1), item.purchaseDate || '') : next;
}
export function deleteShopping(records: FamilyRecords, id: string): FamilyRecords {
  return { ...records, shoppingItems: records.shoppingItems.filter(i => i.id !== id),
    expenses: records.expenses.map(e => e.shoppingItemId === id ? { ...e, source: 'shopping', shoppingItemId: undefined } : e) };
}
export function reverseShopping(records: FamilyRecords, id: string, removeExpense: boolean): FamilyRecords {
  return { ...records,
    shoppingItems: records.shoppingItems.map(i => i.id === id ? { ...i, status: 'Wishlist', actualPrice: undefined, actualPurchasePrice: undefined, purchaseDate: undefined } : i),
    expenses: removeExpense ? records.expenses.filter(e => e.shoppingItemId !== id)
      : records.expenses.map(e => e.shoppingItemId === id ? { ...e, source: 'shopping', shoppingItemId: undefined } : e),
  };
}
export function editExpense(records: FamilyRecords, expense: Expense): FamilyRecords {
  return { ...records, expenses: records.expenses.map(e => e.id === expense.id ? expense : e),
    shoppingItems: records.shoppingItems.map(i => i.id === expense.shoppingItemId && (i.status === 'Bought' || i.status === 'Received')
      ? { ...i, item: expense.title, category: expense.category, actualPurchasePrice: expense.paidAmount, actualPrice: expense.paidAmount / (i.quantity || 1), purchaseDate: expense.expenseDate } : i) };
}
export function deleteExpense(records: FamilyRecords, id: string): FamilyRecords {
  const expense = records.expenses.find(e => e.id === id);
  const next = expense?.shoppingItemId ? reverseShopping(records, expense.shoppingItemId, true) : records;
  return { ...next, expenses: next.expenses.filter(e => e.id !== id) };
}
export function displayDate(value?: string) {
  if (!value) return '-';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}

export function isRecordDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
