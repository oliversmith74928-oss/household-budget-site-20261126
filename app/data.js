// Hearth Ledger — seed data for a fictional household.
// The Alvarez household: two adults, one child, living in a rented
// three-bedroom on Maple Street. All figures are invented for the demo
// and live entirely in this file; the app never fetches anything.

export const HOUSEHOLD = {
  name: 'The Alvarez Household',
  members: ['Mara Alvarez', 'Jonas Alvarez', 'Pip Alvarez (age 7)'],
  monthLabel: 'November 2026',
  currency: 'USD',
};

export const CATEGORIES = [
  { id: 'housing', label: 'Housing', color: '#2f6b4f' },
  { id: 'groceries', label: 'Groceries', color: '#c98a2e' },
  { id: 'utilities', label: 'Utilities', color: '#4a7fa5' },
  { id: 'transport', label: 'Transport', color: '#7a5c9e' },
  { id: 'dining', label: 'Dining Out', color: '#c25e4b' },
  { id: 'health', label: 'Health', color: '#3e8e7e' },
  { id: 'kids', label: 'Kids & School', color: '#8a6d3b' },
  { id: 'fun', label: 'Fun & Leisure', color: '#b0708f' },
  { id: 'income', label: 'Income', color: '#2f6b4f' },
  { id: 'other', label: 'Other', color: '#8a8a7a' },
];

export const DEFAULT_BUDGETS = {
  housing: 1850,
  groceries: 720,
  utilities: 260,
  transport: 380,
  dining: 240,
  health: 180,
  kids: 220,
  fun: 200,
  other: 150,
};

export const DEFAULT_GOALS = [
  { id: 'g1', name: 'Emergency fund', target: 12000, saved: 8450, note: 'Six months of essentials, one deposit at a time.' },
  { id: 'g2', name: 'Summer road trip', target: 2400, saved: 1150, note: 'Two weeks down the coast in July.' },
  { id: 'g3', name: 'New washing machine', target: 900, saved: 620, note: 'The old one rattles like a toolbox.' },
  { id: 'g4', name: "Pip's college jar", target: 5000, saved: 1730, note: 'A little each payday, since the day she was born.' },
];

// November 2026, newest first. Positive amounts are money in.
export const SEED_TRANSACTIONS = [
  { id: 't01', date: '2026-11-25', desc: 'Weekly shop — Green Valley Market', category: 'groceries', amount: -142.60 },
  { id: 't02', date: '2026-11-24', desc: 'Bus passes (monthly, x2)', category: 'transport', amount: -118.00 },
  { id: 't03', date: '2026-11-23', desc: 'Pizza night with the neighbours', category: 'dining', amount: -38.40 },
  { id: 't04', date: '2026-11-22', desc: 'Electricity bill — City Power', category: 'utilities', amount: -96.15 },
  { id: 't05', date: '2026-11-21', desc: 'Mara — freelance invoice #214', category: 'income', amount: 640.00 },
  { id: 't06', date: '2026-11-20', desc: 'School lunch money — Pip', category: 'kids', amount: -45.00 },
  { id: 't07', date: '2026-11-19', desc: 'Pharmacy — Jonas prescription', category: 'health', amount: -28.90 },
  { id: 't08', date: '2026-11-18', desc: 'Weekly shop — Green Valley Market', category: 'groceries', amount: -158.20 },
  { id: 't09', date: '2026-11-17', desc: 'Cinema — family matinee', category: 'fun', amount: -42.00 },
  { id: 't10', date: '2026-11-16', desc: 'Internet bill — NorthLink', category: 'utilities', amount: -59.00 },
  { id: 't11', date: '2026-11-15', desc: 'Jonas — salary (mid-month)', category: 'income', amount: 2840.00 },
  { id: 't12', date: '2026-11-14', desc: 'Fuel — Shell, Maple Street', category: 'transport', amount: -52.30 },
  { id: 't13', date: '2026-11-13', desc: 'Dentist check-up — Pip', category: 'health', amount: -65.00 },
  { id: 't14', date: '2026-11-12', desc: 'Takeaway — Thai Garden', category: 'dining', amount: -47.85 },
  { id: 't15', date: '2026-11-11', desc: 'Weekly shop — Green Valley Market', category: 'groceries', amount: -131.75 },
  { id: 't16', date: '2026-11-10', desc: 'Art supplies — Pip school project', category: 'kids', amount: -23.60 },
  { id: 't17', date: '2026-11-08', desc: 'Water bill — City Water', category: 'utilities', amount: -41.20 },
  { id: 't18', date: '2026-11-07', desc: 'Board games night — dice set', category: 'fun', amount: -31.50 },
  { id: 't19', date: '2026-11-06', desc: 'Weekly shop — Green Valley Market', category: 'groceries', amount: -149.90 },
  { id: 't20', date: '2026-11-05', desc: 'Haircuts — Mara & Pip', category: 'other', amount: -54.00 },
  { id: 't21', date: '2026-11-04', desc: 'Train tickets — Jonas work trip', category: 'transport', amount: -86.00 },
  { id: 't22', date: '2026-11-03', desc: 'Rent — Maple Street, November', category: 'housing', amount: -1850.00 },
  { id: 't23', date: '2026-11-02', desc: 'Mara — salary (first of month)', category: 'income', amount: 3120.00 },
  { id: 't24', date: '2026-11-01', desc: 'Weekly shop — Green Valley Market', category: 'groceries', amount: -121.45 },
];

// Past months, for the Reports comparison chart.
export const MONTHLY_HISTORY = [
  { month: 'Aug 2026', income: 6480, spent: 3985 },
  { month: 'Sep 2026', income: 6620, spent: 4210 },
  { month: 'Oct 2026', income: 6590, spent: 4360 },
  { month: 'Nov 2026', income: 6600, spent: 3383 },
];

export function money(n) {
  const sign = n < 0 ? '−' : '';
  return sign + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function categoryOf(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}
