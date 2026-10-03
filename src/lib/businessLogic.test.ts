/**
 * Automated Business Logic & Architecture V2 Test Suite
 * Run with: npm test
 */

import {
  calculateBudget,
  calculateGestationalAge,
  calculateChecklistProgress,
  calculateEnvelopeSummary,
  STAGE_CONFIGS,
} from './businessLogic';
import { JourneyStage, ChecklistItem, ShoppingItem, Expense } from '../types/domain';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('=== RUNNING LITTLE JOURNEY ARCHITECTURE V2 TESTS ===\n');

// 1. Gestational Calculations (Derived dynamically from Due Date)
console.log('TEST 1: Gestational Math & Trimester Mapping');
{
  const reference = new Date('2026-10-02');
  const result = calculateGestationalAge('2027-02-01', reference);

  assert(result.daysRemaining === 122, `Expected 122 days remaining, got ${result.daysRemaining}`);
  assert(result.currentWeek === 22, `Expected week 22, got week ${result.currentWeek}`);
  assert(result.currentDay === 4, `Expected day 4, got day ${result.currentDay}`);
  assert(result.trimester === 2, `Expected Trimester 2 for week 22, got Trimester ${result.trimester}`);
  assert(result.progressPercent === 55, `Expected 55% progress (22/40), got ${result.progressPercent}%`);

  // Trimester 3 transition test
  const eddT3 = new Date(reference.getTime() + 84 * 24 * 60 * 60 * 1000); // 12 weeks = 84 days
  const resultT3 = calculateGestationalAge(eddT3, reference);
  assert(resultT3.currentWeek === 28, `Expected week 28, got ${resultT3.currentWeek}`);
  assert(resultT3.trimester === 3, `Expected Trimester 3 for week 28, got Trimester ${resultT3.trimester}`);
}

// 2. Budget Model: Partial Payment, Outstanding & No Double-Counting
console.log('\nTEST 2: Budget Formulas: Partial Payment (Hospital Package) & Zero Double-Counting');
{
  const totalBudget = 40_000_000; // Rp 40.000.000

  // Case from User Brief:
  // Hospital estimate: Rp 25.000.000
  // Hospital booked/committed: Rp 25.000.000
  // Deposit already paid: Rp 5.000.000
  // Outstanding: Rp 20.000.000
  // Result must be Rp 25.000.000 total projected, NEVER Rp 30.000.000!

  // Shopping Items:
  // 1. Cybex Car Seat: Bought, actualPrice 5,250,000, linked to expense exp-carseat
  // 2. Stroller: Ordered (Committed), currentPrice 6,000,000, no expense yet
  // 3. Baby Crib: Planned, currentPrice 2,500,000, no expense yet
  const shoppingItems: Array<Pick<ShoppingItem, 'id' | 'item' | 'category' | 'targetPrice' | 'currentPrice' | 'actualPrice' | 'status'>> = [
    {
      id: 'item-carseat',
      item: 'Cybex Cloud T Car Seat',
      category: 'Travel',
      targetPrice: 5_500_000,
      currentPrice: 5_250_000,
      actualPrice: 5_250_000,
      status: 'Bought',
    },
    {
      id: 'item-stroller',
      item: 'Compact Stroller',
      category: 'Travel',
      targetPrice: 6_200_000,
      currentPrice: 6_000_000,
      status: 'Ordered',
    },
    {
      id: 'item-crib',
      item: 'Baby Crib',
      category: 'Sleeping',
      targetPrice: 2_800_000,
      currentPrice: 2_500_000,
      status: 'Planned',
    },
  ];

  // Expenses:
  // 1. Hospital Delivery Booking: totalAmount 25m, paidAmount 5m (deposit)
  // 2. Expense for Cybex Car Seat: totalAmount 5.25m, paidAmount 5.25m, shoppingItemId = 'item-carseat'
  const expenses: Array<Pick<Expense, 'id' | 'category' | 'totalAmount' | 'paidAmount' | 'paymentStatus' | 'shoppingItemId'>> = [
    {
      id: 'exp-hospital-delivery',
      category: 'Hospital / Delivery',
      totalAmount: 25_000_000,
      paidAmount: 5_000_000,
      paymentStatus: 'Partially Paid',
    },
    {
      id: 'exp-carseat',
      category: 'Travel',
      totalAmount: 5_250_000,
      paidAmount: 5_250_000,
      paymentStatus: 'Paid',
      shoppingItemId: 'item-carseat', // LINKED to item-carseat
    },
  ];

  const budget = calculateBudget(totalBudget, shoppingItems, expenses);

  // 1. Actual Paid = 5,000,000 (hospital deposit) + 5,250,000 (car seat) = 10,250,000
  assert(
    budget.actualPaid === 10_250_000,
    `Actual Paid should be Rp 10.250.000, got ${budget.actualPaid}`
  );

  // 2. Committed = 25,000,000 (hospital package) + 6,000,000 (ordered stroller) = 31,000,000
  assert(
    budget.committed === 31_000_000,
    `Committed should be Rp 31.000.000, got ${budget.committed}`
  );

  // 3. Outstanding = 20,000,000 (hospital balance) + 6,000,000 (ordered stroller) = 26,000,000
  assert(
    budget.outstanding === 26_000_000,
    `Outstanding should be Rp 26.000.000, got ${budget.outstanding}`
  );

  // 4. Estimated / Planned = 2,500,000 (baby crib)
  assert(
    budget.estimatedPlanned === 2_500_000,
    `Estimated Planned should be Rp 2.500.000, got ${budget.estimatedPlanned}`
  );

  // 5. Projected Final Cost = Actual Paid (10.25m) + Outstanding (26m) + Planned (2.5m) = 38.75m
  // CRITICAL CHECK: Verify Hospital is counted exactly as 25m (5m paid + 20m outstanding), NOT 30m!
  assert(
    budget.projectedFinalCost === 38_750_000,
    `Projected Final Cost must be Rp 38.750.000 (hospital counted once at 25m, not 30m), got ${budget.projectedFinalCost}`
  );

  // 6. Remaining Budget = Total (40m) - Actual Paid (10.25m) = 29.75m
  assert(
    budget.remainingBudget === 29_750_000,
    `Remaining Budget should be Rp 29.750.000, got ${budget.remainingBudget}`
  );

  // 7. Projected Buffer = Total (40m) - Projected Final Cost (38.75m) = 1.25m
  assert(
    budget.projectedBuffer === 1_250_000,
    `Projected Buffer should be Rp 1.250.000, got ${budget.projectedBuffer}`
  );
}

// 3. Checklist Progress & Zero-Crash Empty Handling
console.log('\nTEST 3: Checklist Progress');
{
  const tasks = [
    { status: 'Completed' },
    { status: 'Completed' },
    { status: 'Pending' },
    { status: 'In Progress' },
  ];
  const progress = calculateChecklistProgress(tasks);
  assert(progress.total === 4, `Total tasks should be 4, got ${progress.total}`);
  assert(progress.completed === 2, `Completed tasks should be 2, got ${progress.completed}`);
  assert(progress.percentage === 50, `Progress should be 50%, got ${progress.percentage}%`);

  const empty = calculateChecklistProgress([]);
  assert(empty.percentage === 0, `Empty checklist should return 0%, got ${empty.percentage}%`);
}

// 4. Decoupled Lifecycle & Non-Pregnancy Journey Stages
console.log('\nTEST 4: Decoupled Lifecycle (Generic Items & Non-Pregnancy Stages)');
{
  // A generic toddler task does NOT require gestational week
  const toddlerTask: ChecklistItem = {
    id: 't-1',
    householdId: 'hh-1',
    childId: 'child-1',
    stage: 'toddler',
    name: 'Jadwal Vaksin Batita 18 Bulan',
    category: 'Medical',
    priority: 'High',
    status: 'Pending',
    targetAgeMonths: 18,
    // Note: targetGestationalWeek is NOT present and must compile cleanly!
  };
  assert(toddlerTask.stage === 'toddler', 'Task should belong to toddler stage');
  assert(toddlerTask.targetGestationalWeek === undefined, 'Toddler task has no gestational week');
  assert(toddlerTask.targetAgeMonths === 18, 'Toddler task correctly targets 18 months');

  // A generic preschool shopping item
  const preschoolItem: ShoppingItem = {
    id: 's-preschool',
    householdId: 'hh-1',
    childId: 'child-1',
    stage: 'preschool',
    item: 'Tas Ransel Sekolah Ringan',
    category: 'Education',
    quantity: 1,
    priority: 'Medium',
    targetPrice: 350_000,
    currentPrice: 350_000,
    status: 'Planned',
  };
  assert(preschoolItem.stage === 'preschool', 'Item belongs to preschool stage');

  // Verify all 6 journey stages are configured
  const stages: JourneyStage[] = ['pregnancy', 'birth', 'newborn', 'infant', 'toddler', 'preschool'];
  stages.forEach((st) => {
    assert(!!STAGE_CONFIGS[st].label, `Stage ${st} is defined with label: ${STAGE_CONFIGS[st].label}`);
  });
}

// 5. Quantity Support, All-Bought Reconciliation & Dynamic Category Breakdown
console.log('\nTEST 5: All-Bought Shopping Reconciliation & Dynamic Category Breakdown');
{
  const totalBudget = 35_000_000;

  // The 6 household shopping items
  const items: Array<Pick<ShoppingItem, 'id' | 'item' | 'category' | 'targetPrice' | 'currentPrice' | 'actualPrice' | 'quantity' | 'status'>> = [
    { id: 's-1', item: 'Car Seat', category: 'Travel', targetPrice: 5_500_000, currentPrice: 5_250_000, actualPrice: 5_250_000, quantity: 1, status: 'Bought' },
    { id: 's-2', item: 'Stroller', category: 'Travel', targetPrice: 6_200_000, currentPrice: 6_200_000, actualPrice: 6_000_000, quantity: 1, status: 'Bought' },
    { id: 's-3', item: 'Sterilizer', category: 'Feeding', targetPrice: 2_800_000, currentPrice: 2_650_000, actualPrice: 2_650_000, quantity: 1, status: 'Bought' },
    { id: 's-4', item: 'Pump', category: 'Feeding', targetPrice: 2_200_000, currentPrice: 2_200_000, actualPrice: 2_150_000, quantity: 1, status: 'Bought' },
    { id: 's-5', item: 'Crib', category: 'Sleeping', targetPrice: 1_200_000, currentPrice: 1_150_000, actualPrice: 1_150_000, quantity: 1, status: 'Bought' },
    { id: 's-6', item: 'Swaddle', category: 'Baby clothing', targetPrice: 350_000, currentPrice: 300_000, actualPrice: 300_000, quantity: 2, status: 'Bought' }, // qty 2 = 600_000
  ];

  // Expenses with linked shopping items and standalone hospital DP
  const expenses: Array<Pick<Expense, 'id' | 'category' | 'totalAmount' | 'paidAmount' | 'paymentStatus' | 'shoppingItemId'>> = [
    { id: 'exp-stroller', category: 'Travel', totalAmount: 6_000_000, paidAmount: 6_000_000, paymentStatus: 'Paid', shoppingItemId: 's-2' },
    { id: 'exp-pump', category: 'Feeding', totalAmount: 2_150_000, paidAmount: 2_150_000, paymentStatus: 'Paid', shoppingItemId: 's-4' },
    { id: 'exp-swaddle', category: 'Baby clothing', totalAmount: 600_000, paidAmount: 600_000, paymentStatus: 'Paid', shoppingItemId: 's-6' },
    { id: 'exp-dp-rs', category: 'Hospital / Delivery', totalAmount: 14_000_000, paidAmount: 4_000_000, paymentStatus: 'Partially Paid' },
  ];

  const budget = calculateBudget(totalBudget, items, expenses);

  // 1. Total shopping bought spent:
  // s-1: 5.25m + s-2: 6.0m + s-3: 2.65m + s-4: 2.15m + s-5: 1.15m + s-6: 0.6m = 17.8m
  const shoppingBought = items.reduce((acc, i) => acc + (i.actualPrice! * i.quantity), 0);
  assert(shoppingBought === 17_800_000, `Shopping bought total should be 17.800.000, got ${shoppingBought}`);

  // 2. Total actual paid across family:
  // Shopping (17.8m) + Hospital DP (4.0m) = 21.8m
  assert(budget.actualPaid === 21_800_000, `Actual paid must be 21.800.000 (17.8m shopping + 4m hospital), got ${budget.actualPaid}`);

  // 3. Outstanding = 10m (14m hospital total - 4m paid)
  assert(budget.outstanding === 10_000_000, `Outstanding should be 10.000.000, got ${budget.outstanding}`);

  // 4. Estimated planned = 0 (all shopping items bought)
  assert(budget.estimatedPlanned === 0, `Estimated planned should be 0 when all bought, got ${budget.estimatedPlanned}`);

  // 5. Projected final cost = 21.8m + 10m = 31.8m
  assert(budget.projectedFinalCost === 31_800_000, `Projected final cost should be 31.800.000, got ${budget.projectedFinalCost}`);

  // 6. Remaining budget = 35m - 21.8m = 13.2m
  assert(budget.remainingBudget === 13_200_000, `Remaining budget should be 13.200.000, got ${budget.remainingBudget}`);
}

// 6. Budget Setup, Envelope Allocations & Partial Payment Accounting Specification
console.log('\nTEST 6: Budget Setup, Planning Envelopes & Strict Accounting Rules');
{
  // 6.1 Setting Total Budget & Envelope Allocations (Allocated vs Unallocated)
  const totalBudget = 35_000_000;
  const envelopes = [
    { planned: 14_000_000 }, // Hospital / Delivery
    { planned: 3_000_000 },  // Medical
    { planned: 4_500_000 },  // Baby Gear
    { planned: 2_500_000 },  // Feeding
    { planned: 2_000_000 },  // Sleeping
    { planned: 1_500_000 },  // Baby Clothing
    { planned: 1_000_000 },  // Mother
    { planned: 5_000_000 },  // Travel
    { planned: 500_000 },    // Other
  ];

  const envelopeSummary = calculateEnvelopeSummary(totalBudget, envelopes);
  assert(envelopeSummary.totalBudget === 35_000_000, 'Total budget setup should be 35.000.000');
  assert(envelopeSummary.allocatedAmount === 34_000_000, `Allocated amount should be 34.000.000, got ${envelopeSummary.allocatedAmount}`);
  assert(envelopeSummary.unallocatedAmount === 1_000_000, `Unallocated flexible reserve should be 1.000.000, got ${envelopeSummary.unallocatedAmount}`);
  assert(envelopeSummary.allocatedPercent === 97, `Allocated percent should be 97%, got ${envelopeSummary.allocatedPercent}%`);
  assert(envelopeSummary.isOverallocated === false, 'Envelope allocation should not be overallocated');

  // 6.2 Partial Payment Model (Strict Spec from User Brief):
  // Hospital commitment: Rp 20.000.000
  // Deposit paid: Rp 5.000.000
  // Then:
  // Committed = Rp 20.000.000
  // Actual Paid = Rp 5.000.000
  // Outstanding = Rp 15.000.000
  // Projected Final must NOT count as Rp 25.000.000!
  const hospitalExpense: Array<Pick<Expense, 'id' | 'category' | 'totalAmount' | 'paidAmount' | 'paymentStatus' | 'shoppingItemId'>> = [
    {
      id: 'exp-hospital',
      category: 'Hospital / Delivery',
      totalAmount: 20_000_000,
      paidAmount: 5_000_000,
      paymentStatus: 'Partially Paid',
    },
  ];

  const shoppingItems: Array<Pick<ShoppingItem, 'id' | 'item' | 'category' | 'targetPrice' | 'currentPrice' | 'actualPrice' | 'quantity' | 'status'>> = [
    // 1. Car Seat linked to expense: price 5m, paid in expense
    {
      id: 'item-carseat',
      item: 'Car Seat',
      category: 'Travel',
      targetPrice: 5_000_000,
      currentPrice: 5_000_000,
      actualPrice: 5_000_000,
      quantity: 1,
      status: 'Bought',
    },
    // 2. Unlinked Planned Crib: price 2.5m
    {
      id: 'item-crib',
      item: 'Baby Crib',
      category: 'Sleeping',
      targetPrice: 2_500_000,
      currentPrice: 2_500_000,
      quantity: 1,
      status: 'Planned',
    },
  ];

  const expensesWithCarseat: Array<Pick<Expense, 'id' | 'category' | 'totalAmount' | 'paidAmount' | 'paymentStatus' | 'shoppingItemId'>> = [
    ...hospitalExpense,
    {
      id: 'exp-carseat',
      category: 'Travel',
      totalAmount: 5_000_000,
      paidAmount: 5_000_000,
      paymentStatus: 'Paid',
      shoppingItemId: 'item-carseat', // LINKED to item-carseat
    },
  ];

  const result = calculateBudget(totalBudget, shoppingItems, expensesWithCarseat);

  // Verification 1: Actual Paid = 5m (hospital deposit) + 5m (carseat) = 10m
  assert(result.actualPaid === 10_000_000, `Actual Paid should be 10.000.000, got ${result.actualPaid}`);

  // Verification 2: Committed = 20m (hospital package)
  assert(result.committed === 20_000_000, `Committed should be 20.000.000, got ${result.committed}`);

  // Verification 3: Outstanding = 15m (20m hospital - 5m deposit)
  assert(result.outstanding === 15_000_000, `Outstanding should be 15.000.000, got ${result.outstanding}`);

  // Verification 4: Planned Cost = 2.5m (baby crib)
  assert(result.estimatedPlanned === 2_500_000, `Planned cost should be 2.500.000, got ${result.estimatedPlanned}`);

  // Verification 5: Projected Final = Actual Paid (10m) + Outstanding (15m) + Planned (2.5m) = 27.5m
  // ZERO DOUBLE COUNTING: Hospital is counted as 20m (5m paid + 15m outstanding), NEVER 25m!
  // Car seat is counted once via expense ledger, NEVER doubled with shopping item!
  assert(result.projectedFinalCost === 27_500_000, `Projected final should be 27.500.000, got ${result.projectedFinalCost}`);

  // Verification 6: Projected Buffer = Total Budget (35m) - Projected Final (27.5m) = 7.5m
  assert(result.projectedBuffer === 7_500_000, `Projected buffer should be 7.500.000, got ${result.projectedBuffer}`);

  // Verification 7: Remaining Budget = Total Budget (35m) - Actual Paid (10m) = 25m
  assert(result.remainingBudget === 25_000_000, `Remaining budget should be 25.000.000, got ${result.remainingBudget}`);

  // Verification 8: Empty Budget Configuration
  const emptyResult = calculateBudget(0, [], []);
  assert(emptyResult.totalBudget === 0, 'Empty budget should have totalBudget 0');
  assert(emptyResult.remainingBudget === 0, 'Empty budget should have remainingBudget 0');
}

console.log('\n=== TEST RESULTS ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\nAll Little Journey Architecture V2 Tests Passed! 🌟\n');
}
