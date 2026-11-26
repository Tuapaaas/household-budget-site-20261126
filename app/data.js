// Hearth & Ledger — seed data for the fictional Alvarez household, November 2026.
// Income $4,892.00, spending $2,826.40 across nine categories, three savings goals.
// Every figure below is hand-written seed content; the app recomputes all totals
// from these transactions, so the numbers on screen always add up.

export const HOUSEHOLD = {
  name: 'The Alvarez Household',
  members: ['Marta Alvarez', 'Diego Alvarez', 'Lucia Alvarez', 'Tomás Alvarez'],
  currency: 'USD',
};

export const CATEGORIES = [
  { id: 'housing', name: 'Housing', color: '#2d5a3d', limit: 1450 },
  { id: 'groceries', name: 'Groceries', color: '#c96f4a', limit: 550 },
  { id: 'transport', name: 'Transport', color: '#3e7ca6', limit: 250 },
  { id: 'utilities', name: 'Utilities', color: '#d9a441', limit: 220 },
  { id: 'dining', name: 'Dining Out', color: '#b4556d', limit: 150 },
  { id: 'entertainment', name: 'Entertainment', color: '#7a5ea8', limit: 120 },
  { id: 'health', name: 'Health', color: '#4a9b8e', limit: 150 },
  { id: 'clothing', name: 'Clothing', color: '#8a6d4b', limit: 100 },
  { id: 'subscriptions', name: 'Subscriptions', color: '#5c6b73', limit: 50 },
];

export const SEED_TRANSACTIONS = [
  // Income — $4,892.00
  { id: 't01', date: '2026-11-01', kind: 'income', category: null, description: 'Paycheck — Marta (school district)', amount: 3900.0 },
  { id: 't02', date: '2026-11-14', kind: 'income', category: null, description: 'Freelance design — Diego', amount: 742.0 },
  { id: 't03', date: '2026-11-20', kind: 'income', category: null, description: 'Utility rebate refund', amount: 250.0 },
  // Housing — $1,400.00
  { id: 't04', date: '2026-11-01', kind: 'expense', category: 'housing', description: 'Monthly rent', amount: 1400.0 },
  // Groceries — $486.35
  { id: 't05', date: '2026-11-03', kind: 'expense', category: 'groceries', description: 'Weekly shop — Green Valley Market', amount: 132.4 },
  { id: 't06', date: '2026-11-10', kind: 'expense', category: 'groceries', description: 'Weekly shop — Green Valley Market', amount: 98.75 },
  { id: 't07', date: '2026-11-17', kind: 'expense', category: 'groceries', description: 'Weekly shop — corner grocer', amount: 87.2 },
  { id: 't08', date: '2026-11-24', kind: 'expense', category: 'groceries', description: 'Weekly shop — Green Valley Market', amount: 76.0 },
  { id: 't09', date: '2026-11-28', kind: 'expense', category: 'groceries', description: 'Thanksgiving extras — bakery & market', amount: 92.0 },
  // Transport — $212.80
  { id: 't10', date: '2026-11-02', kind: 'expense', category: 'transport', description: 'Fuel — Shell on Route 9', amount: 58.0 },
  { id: 't11', date: '2026-11-09', kind: 'expense', category: 'transport', description: 'Monthly bus pass — Lucia', amount: 45.6 },
  { id: 't12', date: '2026-11-16', kind: 'expense', category: 'transport', description: 'Fuel — Shell on Route 9', amount: 62.2 },
  { id: 't13', date: '2026-11-23', kind: 'expense', category: 'transport', description: 'Parking & fuel', amount: 47.0 },
  // Utilities — $187.45
  { id: 't14', date: '2026-11-05', kind: 'expense', category: 'utilities', description: 'Electricity bill', amount: 96.3 },
  { id: 't15', date: '2026-11-12', kind: 'expense', category: 'utilities', description: 'Water bill', amount: 54.15 },
  { id: 't16', date: '2026-11-19', kind: 'expense', category: 'utilities', description: 'Internet bill', amount: 37.0 },
  // Dining Out — $164.20 (over its $150 limit)
  { id: 't17', date: '2026-11-07', kind: 'expense', category: 'dining', description: 'Pizza night — Tony’s', amount: 42.5 },
  { id: 't18', date: '2026-11-14', kind: 'expense', category: 'dining', description: 'Lunch out — Diego & Marta', amount: 38.9 },
  { id: 't19', date: '2026-11-21', kind: 'expense', category: 'dining', description: 'Birthday dinner — Lucia', amount: 51.3 },
  { id: 't20', date: '2026-11-27', kind: 'expense', category: 'dining', description: 'Takeout after Thanksgiving', amount: 31.5 },
  // Entertainment — $98.50
  { id: 't21', date: '2026-11-06', kind: 'expense', category: 'entertainment', description: 'Cinema — family movie night', amount: 24.0 },
  { id: 't22', date: '2026-11-13', kind: 'expense', category: 'entertainment', description: 'Film rental — movie night', amount: 15.99 },
  { id: 't23', date: '2026-11-22', kind: 'expense', category: 'entertainment', description: 'Museum tickets — science hall', amount: 58.51 },
  // Health — $142.10
  { id: 't24', date: '2026-11-04', kind: 'expense', category: 'health', description: 'Pharmacy — prescriptions', amount: 65.0 },
  { id: 't25', date: '2026-11-11', kind: 'expense', category: 'health', description: 'Dentist checkup — Tomás', amount: 42.1 },
  { id: 't26', date: '2026-11-25', kind: 'expense', category: 'health', description: 'Gym membership', amount: 35.0 },
  // Clothing — $89.00
  { id: 't27', date: '2026-11-08', kind: 'expense', category: 'clothing', description: 'Winter coats — kids', amount: 54.0 },
  { id: 't28', date: '2026-11-18', kind: 'expense', category: 'clothing', description: 'School shoes — Tomás', amount: 35.0 },
  // Subscriptions — $46.00
  { id: 't29', date: '2026-11-01', kind: 'expense', category: 'subscriptions', description: 'Music streaming', amount: 15.99 },
  { id: 't30', date: '2026-11-03', kind: 'expense', category: 'subscriptions', description: 'Cloud storage', amount: 12.99 },
  { id: 't31', date: '2026-11-05', kind: 'expense', category: 'subscriptions', description: 'News subscription', amount: 9.99 },
  { id: 't32', date: '2026-11-09', kind: 'expense', category: 'subscriptions', description: 'Photo backup app', amount: 7.03 },
];

export const SEED_GOALS = [
  { id: 'g1', name: 'Emergency fund', target: 5000, saved: 3250, note: 'Six months of rent, kept apart for the unexpected.' },
  { id: 'g2', name: 'Summer holiday', target: 1800, saved: 940, note: 'A week by the coast next July — train, cottage, ice cream.' },
  { id: 'g3', name: 'New bikes', target: 650, saved: 210, note: 'Two bikes for Lucia and Tomás before spring.' },
];
