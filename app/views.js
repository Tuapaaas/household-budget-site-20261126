// Hearth & Ledger — the five pages, built as HTML strings from state.
// Every figure on screen is computed from the stored transactions.

import { CATEGORIES } from './data.js';
import { categoryColor, categoryName, categorySpent, money, monthLabel, monthTotals, pct } from './store.js';

export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function monthStepper(month) {
  return `<div class="month-stepper">
    <button type="button" data-action="prev-month" aria-label="Previous month">&larr;</button>
    <strong>${monthLabel(month)}</strong>
    <button type="button" data-action="next-month" aria-label="Next month">&rarr;</button>
  </div>`;
}

function categoryOptions(selected) {
  return CATEGORIES.map(
    (c) => `<option value="${c.id}"${c.id === selected ? ' selected' : ''}>${esc(c.name)}</option>`,
  ).join('');
}

export function dashboard(state, month) {
  const t = monthTotals(state, month);
  const over = CATEGORIES.filter((c) => categorySpent(state, month, c.id) > state.limits[c.id]);
  const recent = state.transactions
    .filter((x) => x.date.startsWith(month))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5);
  return `<section class="page-head">
    <h1>Good evening, Alvarez household</h1>
    <p>November is shaping up well: ${money(t.left)} still in the pot after ${money(t.spent)} of spending.</p>
    ${monthStepper(month)}
  </section>
  ${over.length ? `<div class="alert" role="alert">Over budget: ${over.map((c) => esc(c.name)).join(', ')}. Dining Out is $${(categorySpent(state, month, 'dining') - state.limits.dining).toFixed(2)} over its limit — see <a href="#/categories">Categories</a>.</div>` : ''}
  <section class="cards" aria-label="Month totals">
    <div class="card"><span class="card-label">Income</span><strong class="card-value" data-testid="income-total">${money(t.income)}</strong><span class="card-note">3 pay-ins this month</span></div>
    <div class="card"><span class="card-label">Spent</span><strong class="card-value" data-testid="spent-total">${money(t.spent)}</strong><span class="card-note">across 9 categories</span></div>
    <div class="card"><span class="card-label">Left over</span><strong class="card-value" data-testid="left-total">${money(t.left)}</strong><span class="card-note">${pct(t.spent, t.income)}% of income spent</span></div>
  </section>
  <section class="grid-2">
    <div class="panel"><h2>Income vs spending</h2><canvas id="donut" width="360" height="240" aria-label="Donut chart of income versus spending"></canvas></div>
    <div class="panel"><h2>Spending by category</h2><canvas id="catbars" width="520" height="300" aria-label="Bar chart of spending by category"></canvas></div>
  </section>
  <section class="grid-2">
    <div class="panel"><h2>Latest transactions</h2>
      <ul class="tx-list">${recent.map((x) => `<li><span class="tx-desc">${esc(x.description)}</span><span class="tx-cat">${x.kind === 'income' ? 'Income' : esc(categoryName(x.category))}</span><span class="tx-amount ${x.kind}">${x.kind === 'income' ? '+' : '−'}${money(x.amount)}</span></li>`).join('')}</ul>
      <p><a class="btn" href="#/transactions">All transactions &rarr;</a></p>
    </div>
    <div class="panel"><h2>Savings goals</h2>
      ${state.goals.map((g) => `<div class="goal-mini"><div class="goal-mini-head"><strong>${esc(g.name)}</strong><span>${money(g.saved)} of ${money(g.target)}</span></div><div class="progress"><span style="width:${pct(g.saved, g.target)}%;background:#2d5a3d"></span></div></div>`).join('')}
      <p><a class="btn" href="#/goals">Manage goals &rarr;</a></p>
    </div>
  </section>`;
}

export function transactionsPage(state, month, filter) {
  const rows = state.transactions
    .filter((x) => x.date.startsWith(month))
    .filter((x) => !filter.kind || x.kind === filter.kind)
    .filter((x) => !filter.category || x.category === filter.category)
    .filter((x) => !filter.q || (x.description + ' ' + categoryName(x.category)).toLowerCase().includes(filter.q.toLowerCase()))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return `<section class="page-head"><h1>Transactions</h1><p>Every pay-in and payment for ${monthLabel(month)}.</p>${monthStepper(month)}</section>
  <section class="panel"><h2>Filter</h2>
    <div class="form-grid filter-row">
      <label>Search <input type="search" id="filter-q" placeholder="Search description…" value="${esc(filter.q)}"></label>
      <label>Type <select id="filter-kind"><option value="">All</option><option value="expense"${filter.kind === 'expense' ? ' selected' : ''}>Expenses</option><option value="income"${filter.kind === 'income' ? ' selected' : ''}>Income</option></select></label>
      <label>Category <select id="filter-category"><option value="">All categories</option>${categoryOptions(filter.category)}</select></label>
    </div>
  </section>
  <section class="panel"><h2>${rows.length} transaction${rows.length === 1 ? '' : 's'}</h2>
    ${rows.length ? `<table class="tx-table"><thead><tr><th>Date</th><th>Description</th><th>Category</th><th class="num">Amount</th><th></th></tr></thead><tbody>
    ${rows.map((x) => `<tr data-tx="${x.id}"><td>${x.date.slice(5)}</td><td>${esc(x.description)}</td><td>${x.kind === 'income' ? 'Income' : esc(categoryName(x.category))}</td><td class="num ${x.kind}">${x.kind === 'income' ? '+' : '−'}${money(x.amount)}</td><td class="row-actions"><button type="button" data-action="edit" data-id="${x.id}">Edit</button><button type="button" data-action="delete" data-id="${x.id}">Delete</button></td></tr>`).join('')}
    </tbody></table>` : '<p class="empty">No transactions match. Add one below, or step to another month.</p>'}
  </section>
  <section class="panel"><h2>Add a transaction</h2>
    <form id="tx-form" class="form-grid">
      <input type="hidden" id="tx-id" value="">
      <label>Type <select id="tx-kind"><option value="expense">Expense</option><option value="income">Income</option></select></label>
      <label>Date <input type="date" id="tx-date" value="${month}-15" required></label>
      <label>Description <input type="text" id="tx-desc" placeholder="e.g. Weekly shop" required></label>
      <label>Category <select id="tx-category">${categoryOptions('groceries')}</select></label>
      <label>Amount <input type="number" id="tx-amount" min="0.01" step="0.01" placeholder="0.00" required></label>
      <span></span>
      <span><button class="btn primary" type="submit" id="tx-submit">Add transaction</button>
      <button class="btn" type="button" id="tx-cancel" hidden>Cancel edit</button></span>
    </form>
    <p class="hint">Pick a row's Edit to change it here; income needs no category.</p>
  </section>`;
}

export function categoriesPage(state, month) {
  return `<section class="page-head"><h1>Categories &amp; budgets</h1><p>Monthly limits for ${monthLabel(month)}. The dark tick marks each limit; red means over.</p>${monthStepper(month)}</section>
  <section class="panel"><canvas id="catbars" width="520" height="300" aria-label="Bar chart of spending by category"></canvas></section>
  <div class="cat-grid">
  ${CATEGORIES.map((c) => {
    const spent = categorySpent(state, month, c.id);
    const limit = state.limits[c.id];
    const overBy = spent - limit;
    return `<section class="panel cat-card" data-cat="${c.id}">
      <div class="cat-head"><span class="dot" style="background:${c.color}"></span><h2>${esc(c.name)}</h2></div>
      <p class="cat-figures"><strong>${money(spent)}</strong> of ${money(limit)} <span class="muted">(${pct(spent, limit)}%)</span></p>
      <div class="progress"><span style="width:${Math.min(100, pct(spent, limit))}%;background:${spent > limit ? '#b3402e' : c.color}"></span></div>
      ${spent > limit ? `<p class="over">Over budget by ${money(overBy)} — trim something here or raise the limit.</p>` : `<p class="muted">${money(Math.max(0, limit - spent))} left this month.</p>`}
      <label class="limit-edit">Monthly limit $ <input type="number" min="0" step="1" value="${limit}" data-limit-for="${c.id}"></label>
    </section>`;
  }).join('')}
  </div>`;
}

export function goalsPage(state) {
  return `<section class="page-head"><h1>Savings goals</h1><p>Three things the Alvarez household is saving for. Contributions move money into the goal — they do not count as spending.</p></section>
  <div class="goal-grid">
  ${state.goals.map((g) => `<section class="panel goal-card" data-goal="${g.id}">
    <h2>${esc(g.name)}</h2>
    <p class="muted">${esc(g.note)}</p>
    <p class="goal-figures"><strong data-testid="goal-saved-${g.id}">${money(g.saved)}</strong> saved of ${money(g.target)} <span class="muted">(${pct(g.saved, g.target)}%)</span></p>
    <div class="progress tall"><span style="width:${pct(g.saved, g.target)}%;background:#2d5a3d"></span></div>
    <p class="muted">${money(Math.max(0, g.target - g.saved))} to go.</p>
    <form class="contribute" data-goal-form="${g.id}">
      <label>Add to this goal $ <input type="number" id="goal-amount-${g.id}" min="1" step="1" placeholder="20" required></label>
      <button class="btn primary" type="submit" data-action="contribute" data-goal="${g.id}">Contribute</button>
    </form>
  </section>`).join('')}
  </div>
  <section class="panel"><h2>How goals work</h2><p>Money moved into a goal stays part of your savings, not your spending. Add a contribution whenever there is money left over — even $20 a week reaches the bikes by spring.</p></section>`;
}

export function reportsPage(state, month) {
  const t = monthTotals(state, month);
  // Weekly buckets: Nov 1–7, 8–14, 15–21, 22–30 (generic: weeks of the month).
  const weeks = [1, 8, 15, 22].map((start, i) => {
    const end = [7, 14, 21, 31][i];
    let amount = 0;
    for (const x of state.transactions) {
      if (x.kind !== 'expense' || !x.date.startsWith(month)) continue;
      const day = Number(x.date.slice(8, 10));
      if (day >= start && day <= end) amount += x.amount;
    }
    return { label: `${start}–${end}`, amount: Math.round(amount * 100) / 100 };
  });
  const top = CATEGORIES.map((c) => ({ name: c.name, spent: categorySpent(state, month, c.id) }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3);
  return `<section class="page-head"><h1>Reports</h1><p>Where November's money went, week by week.</p>${monthStepper(month)}</section>
  <section class="grid-2">
    <div class="panel"><h2>Spending by week</h2><canvas id="weekly" width="520" height="260" aria-label="Bar chart of spending by week"></canvas></div>
    <div class="panel"><h2>Month at a glance</h2>
      <dl class="facts">
        <dt>Income</dt><dd data-testid="income-total">${money(t.income)}</dd>
        <dt>Spent</dt><dd data-testid="spent-total">${money(t.spent)}</dd>
        <dt>Left over</dt><dd data-testid="left-total">${money(t.left)}</dd>
        <dt>Biggest category</dt><dd>${esc(top[0]?.name ?? '—')} — ${money(top[0]?.spent ?? 0)}</dd>
        <dt>Transactions</dt><dd>${state.transactions.filter((x) => x.date.startsWith(month)).length}</dd>
      </dl>
      <p>Top three categories: ${top.map((x) => `${esc(x.name)} ${money(x.spent)}`).join(' · ')}.</p>
    </div>
  </section>
  <section class="panel"><h2>What November teaches</h2>
    <ul class="lessons">
      <li><strong>Housing is fixed.</strong> Rent takes ${pct(categorySpent(state, month, 'housing'), t.spent)}% of spending — it is the one line that never moves.</li>
      <li><strong>Dining Out ran over.</strong> $${(categorySpent(state, month, 'dining') - state.limits.dining).toFixed(2)} past its $150 limit, mostly the birthday dinner. One takeout less a week would cover it.</li>
      <li><strong>Groceries are steady.</strong> Four weekly shops, $76–$132 each, and nothing wasted — the corner grocer week was the cheapest.</li>
      <li><strong>Savings are on track.</strong> ${money(t.left)} left over this month; moving even half of it to the emergency fund closes a tenth of the gap.</li>
    </ul>
  </section>`;
}
