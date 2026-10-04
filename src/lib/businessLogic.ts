/**
 * Little Journey — Deterministic Business Logic & Financial Formulas (Architecture V2)
 *
 * Principles:
 * 1. Expenses / payments are the primary financial source of truth for actual cash spent.
 * 2. Shopping items represent procurement planning and pipeline state.
 * 3. Zero double-counting when shopping items link to expense ledger entries (`shoppingItemId`).
 * 4. Contractual partial payments (e.g. Hospital booking deposit) correctly track Outstanding commitments
 *    without double-counting (Total Package = Paid Deposit + Outstanding, NOT Package + Deposit).
 * 5. Lifecycle-agnostic core: gestational weeks are stage-specific, not universal application requirements.
 */

import { JourneyStage, ChecklistItem, ShoppingItem, Expense } from '../types/domain';

export interface BudgetCalculationResult {
  totalBudget: number;
  actualPaid: number;          // Money actually paid out
  committed: number;           // Total financial commitments made
  outstanding: number;         // Committed obligation not yet paid
  estimatedPlanned: number;    // Future items still in planning/wishlist
  remainingBudget: number;     // Total Budget - Actual Paid
  projectedFinalCost: number;  // Actual Paid + Outstanding + Estimated Planned
  projectedBuffer: number;     // Total Budget - Projected Final Cost
  spentPercentage: number;     // Math.round((Actual Paid / Total Budget) * 100)
}

/**
 * Deterministic Budget Engine (Single Source of Truth)
 */
export function calculateBudget(
  totalBudget: number,
  shoppingItems: Array<Pick<ShoppingItem, 'id' | 'item' | 'category' | 'targetPrice' | 'currentPrice' | 'actualPrice' | 'status'> & { quantity?: number }>,
  expenses: Array<Pick<Expense, 'id' | 'category' | 'totalAmount' | 'paidAmount' | 'paymentStatus' | 'shoppingItemId'>>
): BudgetCalculationResult {
  // Set of shopping items linked to expense records
  const linkedShoppingIds = new Set(
    expenses.map((e) => e.shoppingItemId).filter(Boolean) as string[]
  );

  // 1. ACTUAL PAID
  // Sum of all paid amounts recorded in expenses ledger
  let actualPaid = expenses.reduce((acc, exp) => acc + (exp.paidAmount || 0), 0);

  // Add any Bought/Received shopping item not yet formalized in expenses ledger
  for (const item of shoppingItems) {
    if (item.status === 'Bought' || item.status === 'Received') {
      if (!linkedShoppingIds.has(item.id)) {
        const qty = item.quantity || 1;
        const price = item.actualPrice ?? item.currentPrice ?? item.targetPrice ?? 0;
        actualPaid += price * qty;
      }
    }
  }

  // 2. COMMITTED & OUTSTANDING
  // Financial obligations already contracted or ordered but not yet fully settled
  let totalCommitted = 0;
  let outstanding = 0;

  for (const exp of expenses) {
    if (exp.paymentStatus === 'Partially Paid' || (exp.totalAmount > exp.paidAmount && exp.paidAmount > 0)) {
      totalCommitted += exp.totalAmount;
      outstanding += Math.max(0, exp.totalAmount - exp.paidAmount);
    }
  }

  for (const item of shoppingItems) {
    if (item.status === 'Ordered') {
      if (!linkedShoppingIds.has(item.id)) {
        const qty = item.quantity || 1;
        const cost = (item.currentPrice || item.targetPrice || 0) * qty;
        totalCommitted += cost;
        outstanding += cost;
      }
    }
  }

  // 3. ESTIMATED / PLANNED
  // Needs that may not yet be ordered or purchased
  let estimatedPlanned = 0;
  for (const item of shoppingItems) {
    if (item.status === 'Research' || item.status === 'Wishlist' || item.status === 'Planned') {
      if (!linkedShoppingIds.has(item.id)) {
        const qty = item.quantity || 1;
        estimatedPlanned += (item.currentPrice || item.targetPrice || 0) * qty;
      }
    }
  }

  // 4. DERIVED AGGREGATIONS
  // Remaining Budget = Total Budget - Actual Paid
  const remainingBudget = totalBudget - actualPaid;

  // Projected Final Cost = Actual Paid + Outstanding Commitments + Estimated Planned
  // (e.g., Hospital package Rp25m with Rp5m paid => Actual Paid 5m + Outstanding 20m = 25m, NOT 30m)
  const projectedFinalCost = actualPaid + outstanding + estimatedPlanned;

  // Projected Buffer = Total Budget - Projected Final Cost
  const projectedBuffer = totalBudget - projectedFinalCost;

  // Spent Percentage
  const spentPercentage = totalBudget > 0 ? Math.round((actualPaid / totalBudget) * 100) : 0;

  return {
    totalBudget,
    actualPaid,
    committed: totalCommitted,
    outstanding,
    estimatedPlanned,
    remainingBudget,
    projectedFinalCost,
    projectedBuffer,
    spentPercentage,
  };
}

export interface CategorySpendingSummary {
  category: string;
  planned: number;
  spent: number;
  remaining: number;
  spentPercentage: number;
  itemCount: number;
  icon: string;
  color: string;
}

/**
 * Envelope Allocation Summary (Planning Envelopes vs Total Preparation Budget)
 * Category allocations are planning envelopes, NOT expenses.
 * Allocations are not required to equal total budget, but show allocated vs unallocated amount.
 */
export function calculateEnvelopeSummary(
  totalBudget: number,
  categories: Array<{ planned: number }>
): {
  totalBudget: number;
  allocatedAmount: number;
  unallocatedAmount: number;
  allocatedPercent: number;
  unallocatedPercent: number;
  isOverallocated: boolean;
} {
  const allocatedAmount = categories.reduce((acc, c) => acc + (c.planned || 0), 0);
  const unallocatedAmount = totalBudget - allocatedAmount;
  const allocatedPercent = totalBudget > 0 ? Math.round((allocatedAmount / totalBudget) * 100) : 0;
  const unallocatedPercent = totalBudget > 0 ? Math.max(0, Math.round((unallocatedAmount / totalBudget) * 100)) : 0;
  const isOverallocated = totalBudget > 0 && allocatedAmount > totalBudget;

  return {
    totalBudget,
    allocatedAmount,
    unallocatedAmount,
    allocatedPercent,
    unallocatedPercent,
    isOverallocated,
  };
}

/**
 * Dynamically derive category allocations based on real expenses & purchased shopping items
 */
export function calculateCategoryBreakdown(
  baselineCategories: Array<{ category: string; planned: number; icon: string; color: string }>,
  shoppingItems: Array<Pick<ShoppingItem, 'id' | 'category' | 'targetPrice' | 'currentPrice' | 'actualPrice' | 'status'> & { quantity?: number }>,
  expenses: Array<Pick<Expense, 'id' | 'category' | 'paidAmount' | 'shoppingItemId'>>
): CategorySpendingSummary[] {
  const linkedShoppingIds = new Set(
    expenses.map((e) => e.shoppingItemId).filter(Boolean) as string[]
  );

  const categorySpentMap: Record<string, { spent: number; itemCount: number }> = {};

  // 1. Add expenses paid amounts
  for (const exp of expenses) {
    if (!categorySpentMap[exp.category]) {
      categorySpentMap[exp.category] = { spent: 0, itemCount: 0 };
    }
    categorySpentMap[exp.category].spent += exp.paidAmount || 0;
    categorySpentMap[exp.category].itemCount += 1;
  }

  // 2. Add unlinked bought/received shopping items
  for (const item of shoppingItems) {
    if (item.status === 'Bought' || item.status === 'Received') {
      if (!linkedShoppingIds.has(item.id)) {
        if (!categorySpentMap[item.category]) {
          categorySpentMap[item.category] = { spent: 0, itemCount: 0 };
        }
        const qty = item.quantity || 1;
        const price = item.actualPrice ?? item.currentPrice ?? item.targetPrice ?? 0;
        categorySpentMap[item.category].spent += price * qty;
        categorySpentMap[item.category].itemCount += 1;
      }
    }
  }

  return baselineCategories.map((base) => {
    const data = categorySpentMap[base.category] || { spent: 0, itemCount: 0 };
    const spent = data.spent;
    const remaining = Math.max(0, base.planned - spent);
    const spentPercentage = base.planned > 0 ? Math.min(100, Math.round((spent / base.planned) * 100)) : 0;

    return {
      category: base.category,
      planned: base.planned,
      spent,
      remaining,
      spentPercentage,
      itemCount: data.itemCount,
      icon: base.icon,
      color: base.color,
    };
  });
}

/**
 * Gestational Age Engine (Deterministic, derived dynamically from due date)
 */
export function calculateGestationalAge(
  dueDate: string | Date,
  referenceDate: string | Date = new Date()
): {
  currentWeek: number;
  currentDay: number;
  trimester: 1 | 2 | 3;
  daysRemaining: number;
  progressPercent: number;
  sizeComparison: string;
  fruitEmoji: string;
  milestoneTitle: string;
} {
  const edd = new Date(dueDate);
  const now = new Date(referenceDate);

  const diffMs = edd.getTime() - now.getTime();
  const signedDaysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, signedDaysRemaining);

  // Standard full-term human gestation: 280 days (40 weeks)
  const daysPregnant = Math.max(0, 280 - signedDaysRemaining);
  const currentWeek = Math.floor(daysPregnant / 7);
  const currentDay = daysPregnant % 7;

  let trimester: 1 | 2 | 3 = 1;
  if (currentWeek >= 28) {
    trimester = 3;
  } else if (currentWeek >= 14) {
    trimester = 2;
  }

  const progressPercent = Math.min(100, Math.round((currentWeek / 40) * 100));

  // Stage fruits & milestones
  const sizeMap: Record<number, { fruit: string; emoji: string; milestone: string }> = {
    20: { fruit: 'Banana', emoji: '🍌', milestone: 'Anatomy scan & senses awaken' },
    22: { fruit: 'Papaya', emoji: '🥭', milestone: 'Hearing & sensory growth' },
    24: { fruit: 'Corn', emoji: '🌽', milestone: 'Viability stage & taste buds' },
    28: { fruit: 'Eggplant', emoji: '🍆', milestone: 'Entering Trimester 3, eyelids open' },
    32: { fruit: 'Pineapple', emoji: '🍍', milestone: 'Rapid weight gain & practicing breathing' },
    36: { fruit: 'Honeydew', emoji: '🍈', milestone: 'Early term & head descending' },
    40: { fruit: 'Watermelon', emoji: '🍉', milestone: 'Full term & ready to meet the world!' },
  };

  const closestWeek = Object.keys(sizeMap)
    .map(Number)
    .reduce((prev, curr) => (Math.abs(curr - currentWeek) < Math.abs(prev - currentWeek) ? curr : prev), 22);

  const meta = sizeMap[closestWeek] || { fruit: 'Baby', emoji: '👶', milestone: 'Growing healthy' };

  return {
    currentWeek,
    currentDay,
    trimester,
    daysRemaining,
    progressPercent,
    sizeComparison: meta.fruit,
    fruitEmoji: meta.emoji,
    milestoneTitle: meta.milestone,
  };
}

/**
 * Checklist Progress Calculator
 */
export function calculateChecklistProgress(items: Array<{ status: string }>): {
  completed: number;
  total: number;
  percentage: number;
} {
  if (items.length === 0) return { completed: 0, total: 0, percentage: 0 };
  const completed = items.filter((i) => i.status === 'Completed').length;
  const percentage = Math.round((completed / items.length) * 100);
  return { completed, total: items.length, percentage };
}

/**
 * Stage display metadata
 */
export const STAGE_CONFIGS: Record<JourneyStage, { label: string; icon: string; description: string }> = {
  pregnancy: {
    label: 'Kehamilan',
    icon: '🤰',
    description: 'Trimester 2 hingga kelahiran buah hati',
  },
  birth: {
    label: 'Persalinan',
    icon: '🏥',
    description: 'Hari kelahiran & perawatan RS',
  },
  newborn: {
    label: 'Newborn',
    icon: '🍼',
    description: 'Usia 0–3 bulan pertama',
  },
  infant: {
    label: 'Bayi',
    icon: '👶',
    description: 'Usia 3–12 bulan',
  },
  toddler: {
    label: 'Batita',
    icon: '🧸',
    description: 'Usia 1–3 tahun',
  },
  preschool: {
    label: 'Prasekolah',
    icon: '🎒',
    description: 'Usia 3–5 tahun',
  },
};
