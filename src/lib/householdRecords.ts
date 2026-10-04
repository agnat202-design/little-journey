import type { FamilyRecords } from './familyRecords';
import type { ChecklistItem, LocalAttachment, ShoppingItem } from '../types/domain';
import type { CategoryAllocationInput } from '../components/modals/BudgetSetupModal';

export interface HouseholdSnapshot {
  householdId: string;
  householdName: string;
  version: string;
  records: FamilyRecords;
  tasks: ChecklistItem[];
  totalBudget: number;
  budgetConfigured: boolean;
  allocations: Array<CategoryAllocationInput & { id?: string }>;
  dueDate?: string;
  pregnancyId?: string;
  pregnancyRecord?: Record<string,any>;
  fileCleanupPending?: boolean;
}
export type DatabaseSnapshot = Record<string, any>;
const empty = (value: unknown) => value ?? null;
const optional = (value: any) => value === null ? undefined : value;
function attachment(row: any, prefix=''): LocalAttachment | undefined {
  const path = row[prefix + 'storage_path'];
  return path ? { id: path, storagePath: path, name: row[prefix + 'file_name'], mimeType: row[prefix + 'mime_type'], size: Number(row[prefix ? 'attachment_size_bytes' : 'size_bytes']) } : undefined;
}
export function decodeHousehold(raw: DatabaseSnapshot): HouseholdSnapshot {
  const h = raw.household;
  const common = (r: any) => ({ id: r.id, householdId: h.id, childId: optional(r.child_id), pregnancyId: optional(r.pregnancy_id), stage: optional(r.stage) });
  const expenses = raw.expenses.map((r: any) => ({ ...common(r), title: r.title, category: r.category || '', notes: optional(r.notes),
    paidAmount: Number(r.paid_amount), totalAmount: Number(r.paid_amount), paymentStatus: 'Paid' as const,
    expenseDate: r.expense_date, source: r.source, shoppingItemId: optional(r.shopping_item_id), attachment: attachment(r,'attachment_') }));
  const shoppingItems: ShoppingItem[] = raw.shopping_items.map((r: any) => {
    const purchase = expenses.find((e: any) => e.shoppingItemId === r.id);
    const price = r.estimated_unit_price === null ? undefined : Number(r.estimated_unit_price) * r.quantity;
    return { ...common(r), item: r.item, category: r.category || '', brand: optional(r.brand), model: optional(r.model),
      quantity: r.quantity, priority: r.priority, status: r.status, estimatedPrice: price, currentPrice: price,
      notes: optional(r.notes), productUrl: optional(r.product_url), store: optional(r.store), targetDate: optional(r.target_date),
      targetGestationalWeek: optional(r.target_gestational_week), targetAgeMonths: optional(r.target_age_months),
      actualPurchasePrice: purchase?.paidAmount, actualPrice: purchase ? purchase.paidAmount / r.quantity : undefined, purchaseDate: purchase?.expenseDate };
  });
  const pregnancy = raw.pregnancies.find((r: any) => r.status === 'active');
  return { householdId:h.id, householdName:h.name, version:h.updated_at, totalBudget:Number(h.total_budget ?? 0), budgetConfigured:h.total_budget !== null,
    dueDate:pregnancy?.due_date, pregnancyId:pregnancy?.id, pregnancyRecord:pregnancy,
    allocations:raw.allocations.map((r:any) => ({ id:r.id, category:r.category, planned:Number(r.planned_amount), icon:'', color:'' })),
    tasks:raw.tasks.map((r:any) => ({ ...common(r), name:r.name, category:r.category || '', notes:optional(r.notes), priority:r.priority, status:r.status,
      assignedTo:optional(r.assigned_member_id), targetGestationalWeek:optional(r.target_gestational_week), targetDate:optional(r.target_date), targetAgeMonths:optional(r.target_age_months) })),
    records:{ shoppingItems, expenses,
      appointments:raw.appointments.map((r:any) => ({ ...common(r), purpose:r.purpose, doctor:r.doctor || '', hospital:r.hospital || '',
        appointmentDate:r.appointment_date, appointmentTime:r.appointment_time?.slice(0,5), notes:optional(r.notes), targetGestationalWeek:optional(r.target_gestational_week) })),
      documents:raw.documents.map((r:any) => ({ ...common(r), title:r.title, category:r.document_type, documentType:r.document_type, documentDate:optional(r.document_date),
        notes:optional(r.notes), attachment:attachment(r)!, fileName:r.file_name, fileSize:Number(r.size_bytes), fileUrl:'' })),
    } };
}
export function encodeHousehold(s: HouseholdSnapshot) {
  const context = (r:any) => ({ id:r.id, child_id:empty(r.childId), pregnancy_id:empty(r.pregnancyId), stage:empty(r.stage) });
  const timing = (r:any) => ({ target_gestational_week:empty(r.targetGestationalWeek), target_date:empty(r.targetDate), target_age_months:empty(r.targetAgeMonths) });
  const file = (a:LocalAttachment | undefined, prefix='') => ({ [prefix+'storage_path']:empty(a?.storagePath), [prefix+'file_name']:empty(a?.name),
    [prefix+'mime_type']:empty(a?.mimeType), [prefix ? 'attachment_size_bytes' : 'size_bytes']:empty(a?.size) });
  return {
    tasks:s.tasks.map(r => ({ ...context(r), ...timing(r), name:r.name, category:empty(r.category), notes:empty(r.notes), priority:r.priority, status:r.status, assigned_member_id:empty(r.assignedTo) })),
    shopping_items:s.records.shoppingItems.map(r => ({ ...context(r), ...timing(r), item:r.item, category:empty(r.category), brand:empty(r.brand), model:empty(r.model), store:empty(r.store), notes:empty(r.notes),
      quantity:r.quantity, estimated_unit_price:r.estimatedPrice === undefined ? null : r.estimatedPrice/r.quantity, product_url:empty(r.productUrl), priority:r.priority, status:r.status })),
    expenses:s.records.expenses.map(r => ({ ...context(r), title:r.title, category:empty(r.category), notes:empty(r.notes), paid_amount:r.paidAmount, expense_date:r.expenseDate,
      source:r.source || 'manual', shopping_item_id:empty(r.shoppingItemId), ...file(r.attachment,'attachment_') })),
    appointments:s.records.appointments.map(r => ({ ...context(r), purpose:r.purpose, doctor:empty(r.doctor), hospital:empty(r.hospital), notes:empty(r.notes), appointment_date:r.appointmentDate,
      appointment_time:empty(r.appointmentTime), target_gestational_week:empty(r.targetGestationalWeek) })),
    documents:s.records.documents.map(r => ({ ...context(r), title:r.title, document_type:r.documentType, document_date:empty(r.documentDate), notes:empty(r.notes), ...file(r.attachment) })),
    budget_category_allocations:s.allocations.filter(r => r.id || r.planned>0).map(r => ({ id:r.id!, category:r.category, planned_amount:r.planned })),
  };
}
export function householdChanges(previous:HouseholdSnapshot, next:HouseholdSnapshot) {
  const before = encodeHousehold(previous), after = encodeHousehold(next);
  const changes:Array<{ table:string; kind:'upsert'|'delete'; id:string; row?:any }> = [];
  if(next.dueDate && next.dueDate!==previous.dueDate) changes.push({table:'pregnancies',kind:'upsert',id:next.pregnancyId!,row:{...previous.pregnancyRecord,due_date:next.dueDate,status:'active'}});
  for (const table of Object.keys(after) as Array<keyof typeof after>) {
    const old = new Map(before[table].map(r => [r.id,r]));
    for (const row of after[table]) if (JSON.stringify(old.get(row.id)) !== JSON.stringify(row)) changes.push({ table,kind:'upsert',id:row.id,row });
  }
  // Detach/replace links before deleting Shopping; delete Expenses first.
  for (const table of ['expenses','shopping_items','tasks','appointments','documents','budget_category_allocations'] as Array<keyof typeof before>) {
    const retained = new Set(after[table].map(r => r.id));
    for (const row of before[table]) if (!retained.has(row.id)) changes.push({ table,kind:'delete',id:row.id });
  }
  return changes;
}
