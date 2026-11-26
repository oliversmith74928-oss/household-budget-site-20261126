// Hearth Ledger — the five pages. Each render function takes the app
// state and returns the HTML for its page; charts are drawn after the
// HTML lands in the document (see main.js).
import { CATEGORIES, HOUSEHOLD, MONTHLY_HISTORY, categoryOf, money } from './data.js';
import { drawDonut, drawMonthlyBars } from './charts.js';

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function spentByCategory(state) {
  const out = {};
  for (const t of state.transactions) {
    if (t.amount < 0 && t.category !== 'income') {
      out[t.category] = (out[t.category] || 0) + Math.abs(t.amount);
    }
  }
  return out;
}

function totals(state) {
  let income = 0;
  let spent = 0;
  for (const t of state.transactions) {
    if (t.amount >= 0) income += t.amount;
    else spent += Math.abs(t.amount);
  }
  return { income, spent, left: income - spent, rate: income > 0 ? Math.round(((income - spent) / income) * 100) : 0 };
}

function progressBar(pct, tone) {
  const p = Math.max(0, Math.min(100, Math.round(pct)));
  return `<div class="bar" role="img" aria-label="${p}% of budget used"><span class="${tone}" style="width:${p}%"></span></div>`;
}

// ---------- Dashboard ----------
export function renderDashboard(state) {
  const t = totals(state);
  const byCat = spentByCategory(state);
  const slices = CATEGORIES.filter((c) => c.id !== 'income' && byCat[c.id])
    .map((c) => ({ label: c.label, value: byCat[c.id], color: c.color }))
    .sort((a, b) => b.value - a.value);
  const recent = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const budgetRows = CATEGORIES.filter((c) => c.id !== 'income' && state.budgets[c.id])
    .map((c) => ({ cat: c, spent: byCat[c.id] || 0, budget: state.budgets[c.id] }))
    .sort((a, b) => b.spent / b.budget - a.spent / a.budget)
    .slice(0, 4);

  return `
  <section class="hero">
    <div>
      <p class="eyebrow">${esc(HOUSEHOLD.monthLabel)} · ${esc(HOUSEHOLD.name)}</p>
      <h1>November, at a glance</h1>
      <p class="lede">Every dollar the household earned and spent this month, in one place — so the next month starts on purpose, not by accident.</p>
    </div>
    <div class="hero-note">
      <strong>${money(t.left)} left</strong>
      <span>of ${money(t.income)} coming in</span>
    </div>
  </section>

  <section class="cards" aria-label="Month overview">
    <article class="card"><p class="card-label">Income</p><p class="card-value good">${money(t.income)}</p><p class="card-sub">Salaries + freelance</p></article>
    <article class="card"><p class="card-label">Spent</p><p class="card-value bad">${money(t.spent)}</p><p class="card-sub">Across ${Object.keys(byCat).length} categories</p></article>
    <article class="card"><p class="card-label">Left over</p><p class="card-value">${money(t.left)}</p><p class="card-sub">${t.rate}% of income saved</p></article>
    <article class="card"><p class="card-label">Biggest cost</p><p class="card-value">Rent</p><p class="card-sub">${money(byCat.housing || 0)} — ${Math.round(((byCat.housing || 0) / Math.max(1, t.spent)) * 100)}% of spending</p></article>
  </section>

  <section class="two-col">
    <article class="panel">
      <h2>Where the money went</h2>
      <canvas id="donut" class="donut" width="320" height="320" aria-label="Donut chart of spending by category"></canvas>
      <ul class="legend">
        ${slices.map((s) => `<li><span class="dot" style="background:${s.color}"></span>${esc(s.label)} <b>${money(s.value)}</b></li>`).join('')}
      </ul>
    </article>
    <article class="panel">
      <h2>Budgets to watch</h2>
      ${budgetRows.map(({ cat, spent, budget }) => `
        <div class="budget-row">
          <div class="budget-head"><span>${esc(cat.label)}</span><span><b>${money(spent)}</b> of ${money(budget)}</span></div>
          ${progressBar((spent / budget) * 100, spent > budget ? 'over' : spent / budget > 0.85 ? 'warn' : 'ok')}
        </div>`).join('')}
      <p class="panel-link"><a href="#/budgets">See all budgets →</a></p>
    </article>
  </section>

  <section class="panel">
    <h2>Recent transactions</h2>
    <table class="tx-table">
      <thead><tr><th>Date</th><th>What</th><th>Category</th><th class="num">Amount</th></tr></thead>
      <tbody>
        ${recent.map((tx) => `<tr><td>${esc(tx.date)}</td><td>${esc(tx.desc)}</td><td><span class="chip" style="--chip:${categoryOf(tx.category).color}">${esc(categoryOf(tx.category).label)}</span></td><td class="num ${tx.amount < 0 ? 'neg' : 'pos'}">${money(tx.amount)}</td></tr>`).join('')}
      </tbody>
    </table>
    <p class="panel-link"><a href="#/transactions">All ${state.transactions.length} transactions →</a></p>
  </section>`;
}

export function drawDashboardCharts(state) {
  const canvas = document.getElementById('donut');
  if (!canvas) return;
  const byCat = spentByCategory(state);
  const slices = CATEGORIES.filter((c) => c.id !== 'income' && byCat[c.id])
    .map((c) => ({ label: c.label, value: byCat[c.id], color: c.color }))
    .sort((a, b) => b.value - a.value);
  drawDonut(canvas, slices);
}

// ---------- Transactions ----------
export function renderTransactions(state, filter) {
  const cats = CATEGORIES.filter((c) => c.id !== 'income');
  let list = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  if (filter.category && filter.category !== 'all') list = list.filter((t) => t.category === filter.category);
  if (filter.q) {
    const q = filter.q.toLowerCase();
    list = list.filter((t) => t.desc.toLowerCase().includes(q));
  }
  const t = totals(state);

  return `
  <section class="page-head">
    <div><h1>Transactions</h1><p class="lede">${list.length} of ${state.transactions.length} shown · ${money(t.spent)} spent in November</p></div>
  </section>

  <section class="panel">
    <h2>Add a transaction</h2>
    <form id="add-form" class="form-grid">
      <label>Date <input type="date" name="date" value="2026-11-26" required></label>
      <label>Description <input type="text" name="desc" placeholder="e.g. Weekly shop — Green Valley" required maxlength="80"></label>
      <label>Category <select name="category">${cats.map((c) => `<option value="${c.id}">${esc(c.label)}</option>`).join('')}</select></label>
      <label>Amount ($) <input type="number" name="amount" step="0.01" min="0.01" placeholder="42.50" required></label>
      <label>Type <select name="kind"><option value="expense">Expense</option><option value="income">Income</option></select></label>
      <button type="submit" class="btn">Add transaction</button>
    </form>
    <p class="hint">Added transactions are saved in this browser (localStorage) and survive a reload.</p>
  </section>

  <section class="panel">
    <div class="filter-row">
      <label>Category
        <select id="filter-cat">
          <option value="all">All categories</option>
          ${cats.map((c) => `<option value="${c.id}" ${filter.category === c.id ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}
        </select>
      </label>
      <label>Search
        <input type="search" id="filter-q" placeholder="Search descriptions…" value="${esc(filter.q || '')}">
      </label>
    </div>
    <table class="tx-table">
      <thead><tr><th>Date</th><th>What</th><th>Category</th><th class="num">Amount</th><th></th></tr></thead>
      <tbody>
        ${list.map((tx) => `<tr>
          <td>${esc(tx.date)}</td><td>${esc(tx.desc)}</td>
          <td><span class="chip" style="--chip:${categoryOf(tx.category).color}">${esc(categoryOf(tx.category).label)}</span></td>
          <td class="num ${tx.amount < 0 ? 'neg' : 'pos'}">${money(tx.amount)}</td>
          <td class="row-actions"><button class="btn-small" data-edit="${tx.id}">Edit</button> <button class="btn-small danger" data-del="${tx.id}">Delete</button></td>
        </tr>`).join('') || '<tr><td colspan="5">Nothing matches — try a different filter.</td></tr>'}
      </tbody>
    </table>
  </section>

  <dialog id="edit-dialog">
    <form method="dialog" id="edit-form" class="form-grid">
      <h2>Edit transaction</h2>
      <input type="hidden" name="id" id="edit-id">
      <label>Date <input type="date" name="date" id="edit-date" required></label>
      <label>Description <input type="text" name="desc" id="edit-desc" required maxlength="80"></label>
      <label>Category <select name="category" id="edit-cat">${cats.map((c) => `<option value="${c.id}">${esc(c.label)}</option>`).join('')}</select></label>
      <label>Amount ($) <input type="number" name="amount" id="edit-amount" step="0.01" min="0.01" required></label>
      <div class="dialog-actions"><button class="btn" value="save">Save changes</button> <button class="btn ghost" value="cancel" formnovalidate>Cancel</button></div>
    </form>
  </dialog>`;
}

// ---------- Budgets ----------
export function renderBudgets(state) {
  const byCat = spentByCategory(state);
  const t = totals(state);
  const totalBudget = Object.values(state.budgets).reduce((a, b) => a + b, 0);
  const rows = CATEGORIES.filter((c) => c.id !== 'income' && state.budgets[c.id] !== undefined)
    .map((c) => ({ cat: c, spent: byCat[c.id] || 0, budget: state.budgets[c.id] }));

  return `
  <section class="page-head">
    <div><h1>Monthly budgets</h1><p class="lede">November 2026 · ${money(t.spent)} of ${money(totalBudget)} budgeted spent</p></div>
  </section>
  <section class="panel">
    <p class="lede">Set a monthly limit for each category. Amounts save in this browser as soon as you change them.</p>
    ${rows.map(({ cat, spent, budget }) => {
      const pct = budget > 0 ? (spent / budget) * 100 : 0;
      const left = budget - spent;
      return `
      <div class="budget-block">
        <div class="budget-head">
          <span><span class="dot" style="background:${cat.color}"></span> ${esc(cat.label)}</span>
          <span><b>${money(spent)}</b> of ${money(budget)} · ${left >= 0 ? money(left) + ' left' : money(-left) + ' over'}</span>
        </div>
        ${progressBar(pct, pct > 100 ? 'over' : pct > 85 ? 'warn' : 'ok')}
        <label class="budget-edit">Monthly limit ($)
          <input type="number" min="0" step="10" value="${budget}" data-budget="${cat.id}" aria-label="Monthly budget for ${esc(cat.label)}">
        </label>
      </div>`;
    }).join('')}
    <p class="hint">Tip: rent is fixed at ${money(state.budgets.housing)} — the lever that moves the month is groceries, dining and fun.</p>
  </section>`;
}

// ---------- Goals ----------
export function renderGoals(state) {
  const totalSaved = state.goals.reduce((a, g) => a + g.saved, 0);
  const totalTarget = state.goals.reduce((a, g) => a + g.target, 0);
  return `
  <section class="page-head">
    <div><h1>Savings goals</h1><p class="lede">${money(totalSaved)} saved toward ${money(totalTarget)} across ${state.goals.length} goals</p></div>
  </section>
  <section class="goals-grid">
    ${state.goals.map((g) => {
      const pct = (g.saved / g.target) * 100;
      return `
      <article class="panel goal-card">
        <h2>${esc(g.name)}</h2>
        <p class="goal-amount"><b>${money(g.saved)}</b> of ${money(g.target)}</p>
        ${progressBar(pct, 'ok')}
        <p class="goal-note">${esc(g.note)}</p>
        <p class="goal-pct">${Math.round(pct)}% there · ${money(g.target - g.saved)} to go</p>
        <form class="goal-add" data-goal="${g.id}">
          <label>Add to this goal ($) <input type="number" name="amount" min="1" step="1" placeholder="50" required></label>
          <button class="btn-small" type="submit">Add savings</button>
        </form>
      </article>`;
    }).join('')}
  </section>
  <section class="panel">
    <h2>How the goals get funded</h2>
    <p class="lede">On the 1st of every month, ${money(400)} moves to the emergency fund, ${money(150)} to the road trip and ${money(100)} to Pip's college jar — before anything else is spent. What's left over at month's end is split the same way. That's how ${money(totalSaved)} got saved without a single heroic month.</p>
  </section>`;
}

// ---------- Reports ----------
export function renderReports(state) {
  const byCat = spentByCategory(state);
  const t = totals(state);
  const rows = CATEGORIES.filter((c) => c.id !== 'income' && byCat[c.id])
    .map((c) => ({ cat: c, spent: byCat[c.id], budget: state.budgets[c.id] || 0 }))
    .sort((a, b) => b.spent - a.spent);

  return `
  <section class="page-head">
    <div><h1>Reports</h1><p class="lede">Four months of the household's money, side by side.</p></div>
  </section>
  <section class="panel">
    <h2>Income vs spending</h2>
    <canvas id="bars" class="bars" width="640" height="300" aria-label="Bar chart of income versus spending, August to November 2026"></canvas>
    <p class="hint">November is tracking ${money(t.income - t.spent)} under income — the best month of the four. October ran hot on transport (two work trips) and dining.</p>
  </section>
  <section class="panel">
    <h2>November by category</h2>
    <table class="tx-table">
      <thead><tr><th>Category</th><th class="num">Spent</th><th class="num">Budget</th><th class="num">Share</th><th class="num">Left</th></tr></thead>
      <tbody>
        ${rows.map(({ cat, spent, budget }) => `<tr>
          <td><span class="dot" style="background:${cat.color}"></span> ${esc(cat.label)}</td>
          <td class="num">${money(spent)}</td><td class="num">${money(budget)}</td>
          <td class="num">${Math.round((spent / Math.max(1, t.spent)) * 100)}%</td>
          <td class="num ${budget - spent < 0 ? 'neg' : 'pos'}">${money(budget - spent)}</td>
        </tr>`).join('')}
        <tr class="total-row"><td>Total</td><td class="num">${money(t.spent)}</td><td class="num">${money(Object.values(state.budgets).reduce((a, b) => a + b, 0))}</td><td class="num">100%</td><td class="num">${money(Object.values(state.budgets).reduce((a, b) => a + b, 0) - t.spent)}</td></tr>
      </tbody>
    </table>
  </section>
  <section class="panel">
    <h2>What November taught us</h2>
    <ul class="lessons">
      <li><b>Every category came in under budget.</b> Groceries landed at ${money(byCat.groceries || 0)} of a ${money(state.budgets.groceries)} budget — five shops, none over ${money(160)}.</li>
      <li><b>Dining out is the cheapest month yet:</b> ${money(byCat.dining || 0)} against a ${money(state.budgets.dining)} budget. The two takeaways were the only ones all month.</li>
      <li><b>Transport came in under budget</b> thanks to the bus passes — the car stayed parked for 9 days straight, and fuel was just ${money(52.30)}.</li>
    </ul>
  </section>`;
}

export function drawReportsCharts(state) {
  const canvas = document.getElementById('bars');
  if (!canvas) return;
  // November's bars use the live totals, so an added transaction moves the chart.
  let income = 0;
  let spent = 0;
  for (const t of state.transactions) {
    if (t.amount >= 0) income += t.amount;
    else spent += Math.abs(t.amount);
  }
  const rows = MONTHLY_HISTORY.map((m) => (m.month === 'Nov 2026' ? { ...m, spent: Math.round(spent), income: Math.round(income) } : m));
  drawMonthlyBars(canvas, rows);
}
