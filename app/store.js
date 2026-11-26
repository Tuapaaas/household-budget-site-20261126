// Hearth & Ledger — state: loads the seed once, then keeps every change in
// localStorage so the household's books survive a reload. All totals are
// recomputed from the stored transactions, never cached.

import { CATEGORIES, SEED_GOALS, SEED_TRANSACTIONS } from './data.js';

const STORAGE_KEY = 'hearth-ledger-v1';

export const DEFAULT_MONTH = '2026-11';

function freshState() {
  return {
    transactions: SEED_TRANSACTIONS.map((t) => ({ ...t })),
    goals: SEED_GOALS.map((g) => ({ ...g })),
    limits: Object.fromEntries(CATEGORIES.map((c) => [c.id, c.limit])),
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const state = freshState();
      saveState(state);
      return state;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.transactions) || !Array.isArray(parsed.goals)) return freshState();
    return parsed;
  } catch {
    return freshState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  return loadState();
}

export function monthOf(date) {
  return String(date).slice(0, 7);
}

export function monthLabel(month) {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function shiftMonth(month, delta) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function monthTransactions(state, month) {
  return state.transactions.filter((t) => monthOf(t.date) === month);
}

export function monthTotals(state, month) {
  const rows = monthTransactions(state, month);
  let income = 0;
  let spent = 0;
  for (const t of rows) {
    if (t.kind === 'income') income += t.amount;
    else spent += t.amount;
  }
  return { income: round2(income), spent: round2(spent), left: round2(income - spent) };
}

export function categorySpent(state, month, categoryId) {
  let sum = 0;
  for (const t of state.transactions) {
    if (t.kind === 'expense' && t.category === categoryId && monthOf(t.date) === month) sum += t.amount;
  }
  return round2(sum);
}

export function categoryName(id) {
  return CATEGORIES.find((c) => c.id === id)?.name ?? id;
}

export function categoryColor(id) {
  return CATEGORIES.find((c) => c.id === id)?.color ?? '#5c6b73';
}

export function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function money(n) {
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function pct(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

export function nextId(state) {
  const nums = state.transactions.map((t) => Number(String(t.id).replace(/\D/g, '')) || 0);
  return 't' + String(Math.max(0, ...nums) + 1);
}
