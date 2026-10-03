/**
 * Little Journey — Core Domain Models (Architecture V2)
 *
 * Domain Topology:
 * HOUSEHOLD
 * ├── Household Members (Parents/Guardians)
 * ├── Children (Future-compatible multi-child model)
 * └── Journeys & Lifecycle Stages
 *     ├── Pregnancy (Active MVP Stage)
 *     ├── Birth (Future)
 *     ├── Newborn (Future)
 *     ├── Infant (Future)
 *     ├── Toddler (Future)
 *     └── Preschool (Future)
 *          ├── Tasks / Checklist
 *          ├── Shopping
 *          ├── Expenses
 *          ├── Appointments
 *          ├── Documents
 *          └── Milestones
 */

export type JourneyStage =
  | 'pregnancy'
  | 'birth'
  | 'newborn'
  | 'infant'
  | 'toddler'
  | 'preschool';

export interface Household {
  id: string;
  name: string;
  inviteCode: string;
  currency: string;
  totalBudget: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface HouseholdMember {
  id: string;
  householdId: string;
  userId: string;
  role: 'owner' | 'member';
  displayName: string;
}

export interface Child {
  id: string;
  householdId: string;
  displayName: string;
  birthDate?: string | null;
  dueDate?: string | null;
  gender?: 'boy' | 'girl' | 'surprise' | 'undisclosed';
  currentStage: JourneyStage;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pregnancy {
  id: string;
  householdId: string;
  childId?: string | null;
  dueDate: string; // ISO date string YYYY-MM-DD
  lmpDate?: string | null;
  status: 'active' | 'completed' | 'archived';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Derived Pregnancy Metrics (Calculated dynamically, not persisted)
 */
export interface DerivedPregnancyMetrics {
  currentWeek: number;
  currentDay: number;
  trimester: 1 | 2 | 3;
  daysRemaining: number;
  progressPercent: number;
  sizeComparison: string;
  fruitEmoji: string;
  milestoneTitle: string;
}

/**
 * Generic Checklist Task (Usable across all lifecycle stages)
 */
export interface ChecklistItem {
  id: string;
  householdId: string;
  childId?: string;
  stage?: JourneyStage;
  name: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Skipped';
  assignedTo?: string;
  notes?: string;
  // Flexible Timing (Gestational week is optional and stage-specific)
  targetGestationalWeek?: number;
  targetDate?: string;
  targetAgeMonths?: number;
}

/**
 * Generic Shopping Item (Usable across all lifecycle stages)
 */
interface ShoppingItemDetails {
  id: string;
  householdId: string;
  childId?: string;
  stage?: JourneyStage;
  item: string;
  category: string;
  brand?: string;
  model?: string;
  quantity: number;
  priority: 'High' | 'Medium' | 'Low';
  targetPrice?: number | null;
  currentPrice?: number | null;
  estimatedPrice?: number;
  purchaseDate?: string;
  actualPurchasePrice?: number; // Total transaction amount, not a unit estimate
  store?: string;
  productUrl?: string;
  notes?: string;
  // Flexible Timing
  targetGestationalWeek?: number;
  targetDate?: string;
  targetAgeMonths?: number;
}

// Completing a purchase requires a known actual price, including explicit zero.
export type ShoppingItem = ShoppingItemDetails & (
  | { status: 'Bought'; actualPrice: number }
  | { status: 'Received'; actualPrice: number }
  | { status: 'Research' | 'Wishlist' | 'Planned' | 'Ordered' | 'Skip'; actualPrice?: number }
);

/**
 * Generic Expense / Financial Obligation
 * Primary source of truth for actual cash spent and committed contracts
 */
export interface Expense {
  id: string;
  householdId: string;
  childId?: string;
  stage?: JourneyStage;
  shoppingItemId?: string; // Foreign link to ShoppingItem to prevent double-counting
  source?: 'shopping' | 'manual';
  attachment?: LocalAttachment;
  category: string;
  title: string;
  totalAmount: number; // Total contracted or estimated cost (e.g. Hospital package Rp 25.000.000)
  paidAmount: number;  // Actual cash paid out so far (e.g. Deposit Rp 5.000.000)
  paymentStatus: 'Unpaid' | 'Partially Paid' | 'Paid';
  expenseDate: string;
  notes?: string;
}

/**
 * Generic Appointment / Visit
 */
export interface Appointment {
  id: string;
  householdId: string;
  childId?: string;
  stage?: JourneyStage;
  appointmentDate: string; // ISO date string YYYY-MM-DD for newly saved appointments
  appointmentTime?: string; // Local wall-clock time HH:mm, when provided
  doctor: string;
  hospital?: string;
  purpose: string;
  notes?: string;
  nextAppointmentDate?: string;
  targetGestationalWeek?: number;
}

/**
 * Generic Document / Record
 */
export interface DocumentRecord {
  id: string;
  householdId: string;
  childId?: string;
  stage?: JourneyStage;
  title: string;
  category: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  notes?: string;
  documentType: 'USG' | 'Hasil Lab' | 'Dokumen Kontrol' | 'Invoice' | 'Receipt' | 'Resep' | 'Lainnya';
  documentDate?: string;
  attachment: LocalAttachment;
}

// Local preview data is separate from a future storage object key.
export interface LocalAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  localUrl?: string;
  storagePath?: string;
}

/**
 * Generic Milestone
 */
export interface Milestone {
  id: string;
  householdId: string;
  childId?: string;
  stage?: JourneyStage;
  title: string;
  description?: string;
  targetGestationalWeek?: number;
  targetAgeMonths?: number;
  isCompleted: boolean;
  achievedAt?: string;
  category: string;
}
