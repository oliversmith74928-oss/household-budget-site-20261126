// Hearth Ledger — router, state and wiring. No framework, no network:
// state lives in localStorage under one key, seeded from data.js.
import { DEFAULT_BUDGETS, DEFAULT_GOALS, SEED_TRANSACTIONS } from './data.js';
import {
  drawDashboardCharts,
  drawReportsCharts,
  renderBudgets,
  renderDashboard,
  renderGoals,
  renderReports,
  renderTransactions,
} from './views.js';

const STORE_KEY = 'hearth-ledger-v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (Array.isArray(saved.transactions) && saved.budgets && Array.isArray(saved.goals)) return saved;
    }
  } catch (e) { /* corrupted storage: fall through to the seed */ }
  return {
    transactions: SEED_TRANSACTIONS.map((t) => ({ ...t })),
    budgets: { ...DEFAULT_BUDGETS },
    goals: DEFAULT_GOALS.map((g) => ({ ...g })),
  };
}

function saveState(state) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

const state = loadState();
let filter = { category: 'all', q: '' };

const routes = {
  '': () => renderDashboard(state),
  'transactions': () => renderTransactions(state, filter),
  'budgets': () => renderBudgets(state),
  'goals': () => renderGoals(state),
  'reports': () => renderReports(state),
};

function currentRoute() {
  const hash = location.hash.replace(/^#\/?/, '');
  return routes[hash] ? hash : '';
}

function render() {
  const route = currentRoute();
  const main = document.getElementById('view');
  main.innerHTML = routes[route]();
  document.querySelectorAll('nav a').forEach((a) => {
    a.classList.toggle('active', a.dataset.route === route);
    if (a.dataset.route === route) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  if (route === '') drawDashboardCharts(state);
  if (route === 'reports') drawReportsCharts(state);  if (route === 'transactions') wireTransactions();
  if (route === 'budgets') wireBudgets();
  if (route === 'goals') wireGoals();
  window.scrollTo(0, 0);
}

function uid() {
  return 't' + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36);
}

function wireTransactions() {
  const form = document.getElementById('add-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const amount = Math.abs(parseFloat(fd.get('amount')));
    if (!Number.isFinite(amount) || amount <= 0) return;
    state.transactions.unshift({
      id: uid(),
      date: fd.get('date'),
      desc: String(fd.get('desc')).trim(),
      category: fd.get('category'),
      amount: fd.get('kind') === 'income' ? amount : -amount,
    });
    saveState(state);
    render();
  });

  document.getElementById('filter-cat').addEventListener('change', (e) => {
    filter.category = e.target.value;
    render();
  });
  document.getElementById('filter-q').addEventListener('input', (e) => {
    filter.q = e.target.value;
    // Re-render the page, then put the caret back where it was.
    const value = e.target.value;
    render();
    const box = document.getElementById('filter-q');
    box.focus();
    box.value = value;
    box.setSelectionRange(value.length, value.length);
  });

  const dialog = document.getElementById('edit-dialog');
  document.querySelectorAll('[data-del]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tx = state.transactions.find((t) => t.id === btn.dataset.del);
      if (tx && confirm(`Delete "${tx.desc}" (${tx.date})?`)) {
        state.transactions = state.transactions.filter((t) => t.id !== tx.id);
        saveState(state);
        render();
      }
    });
  });
  document.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tx = state.transactions.find((t) => t.id === btn.dataset.edit);
      if (!tx) return;
      document.getElementById('edit-id').value = tx.id;
      document.getElementById('edit-date').value = tx.date;
      document.getElementById('edit-desc').value = tx.desc;
      document.getElementById('edit-cat').value = tx.category;
      document.getElementById('edit-amount').value = Math.abs(tx.amount).toFixed(2);
      dialog.showModal();
    });
  });
  document.getElementById('edit-form').addEventListener('submit', (e) => {
    const fd = new FormData(e.target);
    const tx = state.transactions.find((t) => t.id === fd.get('id'));
    if (!tx) return;
    const amount = Math.abs(parseFloat(fd.get('amount')));
    if (!Number.isFinite(amount) || amount <= 0) return;
    const wasIncome = tx.amount >= 0;
    tx.date = fd.get('date');
    tx.desc = String(fd.get('desc')).trim();
    tx.category = fd.get('category');
    tx.amount = wasIncome ? amount : -amount;
    saveState(state);
    render();
  });
}

function wireBudgets() {
  document.querySelectorAll('[data-budget]').forEach((input) => {
    input.addEventListener('change', () => {
      const v = Math.max(0, parseFloat(input.value) || 0);
      state.budgets[input.dataset.budget] = Math.round(v);
      saveState(state);
      render();
    });
  });
}

function wireGoals() {
  document.querySelectorAll('.goal-add').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const amount = parseFloat(new FormData(form).get('amount'));
      if (!Number.isFinite(amount) || amount <= 0) return;
      const goal = state.goals.find((g) => g.id === form.dataset.goal);
      if (!goal) return;
      goal.saved = Math.min(goal.target, Math.round((goal.saved + amount) * 100) / 100);
      saveState(state);
      render();
    });
  });
}

document.getElementById('reset-demo').addEventListener('click', () => {
  if (confirm('Reset Hearth Ledger to the November demo figures?')) {
    localStorage.removeItem(STORE_KEY);
    location.reload();
  }
});

window.addEventListener('hashchange', render);
render();
