// Hearth & Ledger — router and wiring. Five hash routes, one state object in
// localStorage, charts drawn after every render. window.__shotReady is false
// while a page renders and true once it is on screen, so a screenshot script
// knows when to capture.

import { CATEGORIES } from './data.js';
import { drawCategoryBars, drawDonut, drawWeeklyBars } from './charts.js';
import { loadState, saveState, resetState, DEFAULT_MONTH, categorySpent, monthTotals, nextId, round2, shiftMonth } from './store.js';
import { categoriesPage, dashboard, goalsPage, reportsPage, transactionsPage } from './views.js';

const app = document.getElementById('app');
let state = loadState();
let month = DEFAULT_MONTH;
let filter = { q: '', kind: '', category: '' };

function categoryRows() {
  return CATEGORIES.map((c) => ({
    name: c.name,
    color: c.color,
    spent: categorySpent(state, month, c.id),
    limit: state.limits[c.id],
  }));
}

function weeklyRows() {
  const weeks = [1, 8, 15, 22].map((start, i) => {
    const end = [7, 14, 21, 31][i];
    let amount = 0;
    for (const x of state.transactions) {
      if (x.kind !== 'expense' || !x.date.startsWith(month)) continue;
      const day = Number(x.date.slice(8, 10));
      if (day >= start && day <= end) amount += x.amount;
    }
    return { label: `${start}–${end}`, amount: round2(amount) };
  });
  return weeks;
}

function drawCharts(route) {
  const donut = document.getElementById('donut');
  if (donut) {
    const t = monthTotals(state, month);
    drawDonut(donut, t.income, t.spent);
  }
  const catbars = document.getElementById('catbars');
  if (catbars) drawCategoryBars(catbars, categoryRows());
  const weekly = document.getElementById('weekly');
  if (weekly) drawWeeklyBars(weekly, weeklyRows());
}

function route() {
  const hash = location.hash || '#/';
  if (hash.startsWith('#/transactions')) return 'transactions';
  if (hash.startsWith('#/categories')) return 'categories';
  if (hash.startsWith('#/goals')) return 'goals';
  if (hash.startsWith('#/reports')) return 'reports';
  return 'dashboard';
}

function render() {
  window.__shotReady = false;
  const r = route();
  const titles = {
    dashboard: 'Hearth & Ledger — Household Budget',
    transactions: 'Transactions | Hearth & Ledger',
    categories: 'Categories & Budgets | Hearth & Ledger',
    goals: 'Savings Goals | Hearth & Ledger',
    reports: 'Reports | Hearth & Ledger',
  };
  document.title = titles[r];
  if (r === 'transactions') app.innerHTML = transactionsPage(state, month, filter);
  else if (r === 'categories') app.innerHTML = categoriesPage(state, month);
  else if (r === 'goals') app.innerHTML = goalsPage(state);
  else if (r === 'reports') app.innerHTML = reportsPage(state, month);
  else app.innerHTML = dashboard(state, month);

  document.querySelectorAll('nav a').forEach((a) => {
    a.classList.toggle('active', a.getAttribute('href') === '#/' + (r === 'dashboard' ? '' : r));
  });
  drawCharts(r);
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function readForm() {
  return {
    id: document.getElementById('tx-id').value || null,
    kind: document.getElementById('tx-kind').value,
    date: document.getElementById('tx-date').value,
    description: document.getElementById('tx-desc').value.trim(),
    category: document.getElementById('tx-category').value,
    amount: round2(Number(document.getElementById('tx-amount').value)),
  };
}

function fillForm(tx) {
  document.getElementById('tx-id').value = tx.id;
  document.getElementById('tx-kind').value = tx.kind;
  document.getElementById('tx-date').value = tx.date;
  document.getElementById('tx-desc').value = tx.description;
  document.getElementById('tx-category').value = tx.category ?? 'groceries';
  document.getElementById('tx-amount').value = tx.amount;
  document.getElementById('tx-submit').textContent = 'Save changes';
  document.getElementById('tx-cancel').hidden = false;
  document.getElementById('tx-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

app.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;
  if (form.id === 'tx-form') {
    const v = readForm();
    if (!v.date || !v.description || !(v.amount > 0)) return;
    if (v.kind === 'income') v.category = null;
    if (v.id) {
      const i = state.transactions.findIndex((t) => t.id === v.id);
      if (i >= 0) state.transactions[i] = { ...v };
    } else {
      state.transactions.push({ ...v, id: nextId(state) });
    }
    saveState(state);
    render();
    return;
  }
  if (form.dataset.goalForm) {
    const goal = state.goals.find((g) => g.id === form.dataset.goalForm);
    const input = document.getElementById('goal-amount-' + goal.id);
    const amount = round2(Number(input.value));
    if (goal && amount > 0) {
      goal.saved = round2(goal.saved + amount);
      saveState(state);
      render();
    }
  }
});

app.addEventListener('click', (event) => {
  const btn = event.target.closest('button');
  if (!btn) return;
  const action = btn.dataset.action;
  if (btn.id === 'tx-cancel') {
    document.getElementById('tx-form').reset();
    document.getElementById('tx-id').value = '';
    document.getElementById('tx-submit').textContent = 'Add transaction';
    btn.hidden = true;
    return;
  }
  if (action === 'prev-month' || action === 'next-month') {
    month = shiftMonth(month, action === 'prev-month' ? -1 : 1);
    render();
    return;
  }
  if (action === 'edit') {
    const tx = state.transactions.find((t) => t.id === btn.dataset.id);
    if (tx) fillForm(tx);
    return;
  }
  if (action === 'delete') {
    const tx = state.transactions.find((t) => t.id === btn.dataset.id);
    if (tx && confirm(`Delete "${tx.description}" ($${tx.amount.toFixed(2)})?`)) {
      state.transactions = state.transactions.filter((t) => t.id !== tx.id);
      saveState(state);
      render();
    }
  }
});

app.addEventListener('input', (event) => {
  const el = event.target;
  if (el.id === 'filter-q') {
    filter.q = el.value;
    const pos = el.selectionStart;
    render();
    const again = document.getElementById('filter-q');
    if (again) {
      again.focus();
      again.setSelectionRange(pos, pos);
    }
    return;
  }
  if (el.id === 'filter-kind') {
    filter.kind = el.value;
    render();
    return;
  }
  if (el.id === 'filter-category') {
    filter.category = el.value;
    render();
    return;
  }
  if (el.dataset.limitFor) {
    const value = Number(el.value);
    if (value >= 0) {
      state.limits[el.dataset.limitFor] = value;
      saveState(state);
    }
  }
});

app.addEventListener('change', (event) => {
  const el = event.target;
  if (el.dataset.limitFor) {
    render();
  }
  if (el.id === 'tx-kind') {
    document.getElementById('tx-category').disabled = el.value === 'income';
  }
});

document.getElementById('reset-data').addEventListener('click', () => {
  if (confirm('Reset Hearth & Ledger to the November 2026 seed data?')) {
    state = resetState();
    month = DEFAULT_MONTH;
    filter = { q: '', kind: '', category: '' };
    render();
  }
});

window.addEventListener('hashchange', render);
render();
