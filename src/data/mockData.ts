/**
 * Little Journey — DEMO FIXTURES ONLY — not initial user state (Architecture V2)
 *
 * Scoped to Household: "Contoh keluarga"
 * Child: "Contoh anak"
 * Active Journey Stage: "pregnancy" (Trimester 2)
 */

import {
  Household,
  Child,
  Pregnancy,
  JourneyStage,
  ChecklistItem,
  ShoppingItem,
  Expense,
  Appointment,
} from '../types/domain';
import { calculateGestationalAge } from '../lib/businessLogic';

export const DEMO_DUE_DATE = '2027-02-01';

export const INITIAL_HOUSEHOLD: Household = {
  id: 'hh-1',
  name: 'Contoh keluarga',
  inviteCode: '',
  currency: 'IDR (Rp)',
  totalBudget: 35000000, // Rp 35.000.000
};

export const INITIAL_CHILD: Child = {
  id: 'child-1',
  householdId: 'hh-1',
  displayName: 'Contoh anak',
  dueDate: DEMO_DUE_DATE,
  currentStage: 'pregnancy',
};

export const INITIAL_PREGNANCY: Pregnancy = {
  id: 'preg-1',
  householdId: 'hh-1',
  childId: 'child-1',
  dueDate: DEMO_DUE_DATE,
  status: 'active',
  notes: 'Trimester 2 kontrol rutin di RSIA Bunda Menteng',
};

// DEMO date only: not a pregnancy configured by the user.
export const LOCAL_CONTEXT = { householdId: 'local-session', childId: 'local-context' };
const demoDateParts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
export const DEMO_REFERENCE_DATE = ['year', 'month', 'day'].map(type => demoDateParts.find(part => part.type === type)!.value).join('-');
export const DERIVED_PREGNANCY = calculateGestationalAge(DEMO_DUE_DATE, DEMO_REFERENCE_DATE);

export const MOCK_BUDGET_CATEGORIES = [
  { category: 'Hospital / Delivery', planned: 14000000, spent: 4000000, icon: '🏥', color: '#6C4CF5' },
  { category: 'Medical', planned: 3000000, spent: 0, icon: '🩺', color: '#52D6C7' },
  { category: 'Baby Gear', planned: 4500000, spent: 0, icon: '🎠', color: '#FFD45A' },
  { category: 'Feeding', planned: 2500000, spent: 2150000, icon: '🍼', color: '#2B88D9' },
  { category: 'Sleeping', planned: 2000000, spent: 0, icon: '🌙', color: '#6C4CF5' },
  { category: 'Baby clothing', planned: 1500000, spent: 600000, icon: '👶', color: '#FF786A' },
  { category: 'Mother', planned: 1000000, spent: 0, icon: '🌸', color: '#FF786A' },
  { category: 'Travel', planned: 5000000, spent: 6000000, icon: '🚗', color: '#FF786A' },
  { category: 'Other', planned: 500000, spent: 0, icon: '📦', color: '#B8860B' },
];

export const MOCK_SHOPPING_ITEMS: ShoppingItem[] = [
  {
    id: 's-1',
    householdId: 'hh-1',
    childId: 'child-1',
    stage: 'pregnancy',
    item: 'Infant Car Seat',
    category: 'Travel',
    brand: 'Cybex',
    model: 'Cloud T i-Size',
    quantity: 1,
    priority: 'High',
    targetPrice: 5500000,
    currentPrice: 5250000,
    store: 'Mothercare Grand Indonesia',
    productUrl: 'https://mothercare.co.id',
    targetGestationalWeek: 26,
    status: 'Planned',
  },
  {
    id: 's-2',
    householdId: 'hh-1',
    childId: 'child-1',
    stage: 'pregnancy',
    item: 'Compact Stroller Cabin Size',
    category: 'Travel',
    brand: 'Babyzen / Cocolatte',
    model: 'YOYO3 / Iconic Luxe',
    quantity: 1,
    priority: 'High',
    targetPrice: 6200000,
    currentPrice: 6200000,
    actualPrice: 6000000,
    store: 'Shopee Official Store',
    targetGestationalWeek: 24,
    status: 'Bought',
  },
  {
    id: 's-3',
    householdId: 'hh-1',
    childId: 'child-1',
    stage: 'pregnancy',
    item: 'UV Sterilizer & Dryer',
    category: 'Feeding',
    brand: 'Haenim / Upang',
    model: 'Smart Classic 4G',
    quantity: 1,
    priority: 'High',
    targetPrice: 2800000,
    currentPrice: 2650000,
    store: 'Tokopedia Babyshop',
    targetGestationalWeek: 28,
    status: 'Wishlist',
  },
  {
    id: 's-4',
    householdId: 'hh-1',
    childId: 'child-1',
    stage: 'pregnancy',
    item: 'Hospital Grade Breast Pump',
    category: 'Feeding',
    brand: 'Spectra',
    model: 'Dual Compact / S1+',
    quantity: 1,
    priority: 'High',
    targetPrice: 2200000,
    currentPrice: 2200000,
    actualPrice: 2150000,
    store: 'Birds & Bees',
    targetGestationalWeek: 20,
    status: 'Bought',
  },
  {
    id: 's-5',
    householdId: 'hh-1',
    childId: 'child-1',
    stage: 'pregnancy',
    item: 'Crib Kasur Busa Organik',
    category: 'Sleeping',
    brand: 'SnuzKot / Doby',
    model: 'Breathable Mattress',
    quantity: 1,
    priority: 'Medium',
    targetPrice: 1200000,
    currentPrice: 1150000,
    store: 'IKEA Alam Sutera',
    targetGestationalWeek: 30,
    status: 'Research',
  },
  {
    id: 's-6',
    householdId: 'hh-1',
    childId: 'child-1',
    stage: 'pregnancy',
    item: 'Bamboo Swaddle Wrap (Pack of 3)',
    category: 'Baby clothing',
    brand: 'Bohopanna / Petite Mimi',
    model: 'Organic Bamboo Series',
    quantity: 2,
    priority: 'Medium',
    targetPrice: 350000,
    currentPrice: 300000,
    actualPrice: 300000,
    store: 'Shopee Official',
    targetGestationalWeek: 22,
    status: 'Received',
  },
];

export const MOCK_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'c-1',
    householdId: 'hh-1',
    childId: 'child-1',
    stage: 'pregnancy',
    name: 'USG Fetomaternal / 4D Screening Anomaly',
    category: 'Medical',
    priority: 'High',
    targetGestationalWeek: 22,
    status: 'Completed',
    assignedTo: undefined,
    notes: 'Organ dan tulang baby semua lengkap dan sehat normal alhamdulillah!',
  },
  {
    id: 'c-2',
    householdId: 'hh-1',
    childId: 'child-1',
    stage: 'pregnancy',
    name: 'Survey Paket Melahirkan & Kamar Rawat Inap',
    category: 'Hospital / Delivery',
    priority: 'High',
    targetGestationalWeek: 24,
    status: 'In Progress',
    assignedTo: undefined,
    notes: 'Bandingkan RSIA Bunda Menteng vs RS Pondok Indah.',
  },
  {
    id: 'c-3',
    householdId: 'hh-1',
    childId: 'child-1',
    stage: 'pregnancy',
    name: 'Daftar Kelas Edukasi Laktasi & Menyusui',
    category: 'Feeding',
    priority: 'High',
    targetGestationalWeek: 26,
    status: 'Pending',
    assignedTo: undefined,
    notes: 'Daftar sesi online atau offline bareng konselor laktasi.',
  },
  {
    id: 'c-4',
    householdId: 'hh-1',
    childId: 'child-1',
    stage: 'pregnancy',
    name: 'Beli Car Seat Newborn (ISOFIX)',
    category: 'Travel',
    priority: 'High',
    targetGestationalWeek: 26,
    status: 'Pending',
    assignedTo: undefined,
    notes: 'Wajib dipasang di mobil sebelum minggu ke-36 untuk jemput pulang dari RS.',
  },
  {
    id: 'c-5',
    householdId: 'hh-1',
    childId: 'child-1',
    stage: 'pregnancy',
    name: 'Siapkan Tas Bersalin (Hospital Bag) Ibu & Bayi',
    category: 'Hospital bag',
    priority: 'High',
    targetGestationalWeek: 32,
    status: 'Pending',
    assignedTo: undefined,
    notes: 'Baju berkancing depan, selimut bayi, dokumen asuransi & KTP.',
  },
  {
    id: 'c-6',
    householdId: 'hh-1',
    childId: 'child-1',
    stage: 'pregnancy',
    name: 'Cuci Baju Bayi dengan Deterjen Khusus Baby',
    category: 'Baby clothing',
    priority: 'Medium',
    targetGestationalWeek: 34,
    status: 'Pending',
    assignedTo: undefined,
    notes: 'Gunakan deterjen hypoallergenic, simpan di organizer tertutup.',
  },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    householdId: 'hh-1',
    childId: 'child-1',
    stage: 'pregnancy',
    appointmentDate: '2026-10-14',
    doctor: 'dr. Raditya, Sp.OG (K-FM)',
    hospital: 'RSIA Bunda Menteng',
    purpose: 'Kontrol Rutin W24 & Cek Glukosa Darah',
    notes: 'Puasa 8 jam sebelum cek laboratorium toleransi glukosa.',
    targetGestationalWeek: 24,
  },
  {
    id: 'apt-2',
    householdId: 'hh-1',
    childId: 'child-1',
    stage: 'pregnancy',
    appointmentDate: '2026-11-18',
    doctor: 'dr. Raditya, Sp.OG (K-FM)',
    hospital: 'RSIA Bunda Menteng',
    purpose: 'USG Trimester 3 & Evaluasi Posisi Plasenta',
    notes: 'Bawa riwayat buku KIA.',
    targetGestationalWeek: 28,
  },
];

/**
 * Baseline ledger expenses with deterministic foreign key links to shopping items
 */
export const MOCK_EXPENSES: Expense[] = [
  {
    id: 'exp-stroller',
    householdId: 'hh-1',
    childId: 'child-1',
    stage: 'pregnancy',
    category: 'Travel',
    title: 'Pembelian Stroller YOYO3 Super Brand Day',
    totalAmount: 6000000,
    paidAmount: 6000000,
    paymentStatus: 'Paid',
    expenseDate: '2026-09-09',
    shoppingItemId: 's-2', // Linked to Cocolatte/Babyzen stroller
  },
  {
    id: 'exp-pump',
    householdId: 'hh-1',
    childId: 'child-1',
    stage: 'pregnancy',
    category: 'Feeding',
    title: 'Hospital Grade Breast Pump Spectra',
    totalAmount: 2150000,
    paidAmount: 2150000,
    paymentStatus: 'Paid',
    expenseDate: '2026-09-15',
    shoppingItemId: 's-4', // Linked to Spectra pump
  },
  {
    id: 'exp-swaddle',
    householdId: 'hh-1',
    childId: 'child-1',
    stage: 'pregnancy',
    category: 'Baby clothing',
    title: 'Bamboo Swaddle 3-Pack (2 Set)',
    totalAmount: 600000,
    paidAmount: 600000,
    paymentStatus: 'Paid',
    expenseDate: '2026-09-20',
    shoppingItemId: 's-6', // Linked to bamboo swaddles (2 pack x 300.000)
  },
  {
    id: 'exp-dp-rs',
    householdId: 'hh-1',
    childId: 'child-1',
    stage: 'pregnancy',
    category: 'Hospital / Delivery',
    title: 'Booking & DP Kamar Bersalin RSIA Bunda',
    totalAmount: 14000000, // Total package cost
    paidAmount: 4000000,   // DP paid
    paymentStatus: 'Partially Paid',
    expenseDate: '2026-09-25',
  },
];

export function formatIDR(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

export function formatIDRCompact(amount: number): string {
  if (amount >= 1000000) {
    const val = (amount / 1000000).toFixed(1).replace('.', ',');
    return `Rp ${val} jt`;
  }
  if (amount >= 1000) {
    const val = Math.round(amount / 1000);
    return `Rp ${val} rb`;
  }
  return `Rp ${amount}`;
}
