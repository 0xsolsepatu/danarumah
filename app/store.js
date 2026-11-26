// State for DanaRumah. All data lives in localStorage under one key, so the
// site works fully offline and remembers every change between visits.
// The first visit seeds the demo household from data.js; "Reset demo data"
// restores that seed.
import { SEED } from './data.js';

const KEY = 'danarumah-v1';
export const MONTHS = ['2026-10', '2026-11'];

let state = null;

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function seedState() {
  return {
    months: clone(SEED.months),
    budgets: clone(SEED.budgets),
    bills: clone(SEED.bills),
    billsPaid: clone(SEED.billsPaid),
    goals: clone(SEED.goals),
  };
}

export function load() {
  if (state) return state;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.months && parsed.budgets) {
        state = parsed;
        return state;
      }
    }
  } catch (e) {
    // Corrupt storage: fall through and reseed.
  }
  state = seedState();
  save();
  return state;
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    // Storage full or unavailable: the site still works for this visit.
  }
}

export function resetAll() {
  state = seedState();
  save();
  return state;
}

// --- derived figures for one month ---------------------------------------
export function monthStats(monthKey) {
  const txs = state.months[monthKey] || [];
  let income = 0;
  let spent = 0;
  const byCategory = {};
  for (const tx of txs) {
    if (tx.type === 'income') income += tx.amount;
    else {
      spent += tx.amount;
      byCategory[tx.category] = (byCategory[tx.category] || 0) + tx.amount;
    }
  }
  const budgetTotal = Object.values(state.budgets).reduce((a, b) => a + b, 0);
  return {
    income,
    spent,
    left: income - spent,
    rate: income ? Math.round(((income - spent) / income) * 100) : 0,
    byCategory,
    budgetTotal,
    budgetUsed: budgetTotal ? Math.round((spent / budgetTotal) * 100) : 0,
    count: txs.length,
  };
}

export function monthTransactions(monthKey) {
  const txs = (state.months[monthKey] || []).slice();
  txs.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return txs;
}

// --- mutations (each saves immediately) -----------------------------------
export function addTransaction(monthKey, tx) {
  const list = state.months[monthKey] || (state.months[monthKey] = []);
  const entry = {
    id: 'u' + Date.now().toString(36) + Math.floor(Math.random() * 1000),
    date: tx.date,
    desc: tx.desc,
    category: tx.category,
    amount: Math.round(tx.amount),
    type: tx.type,
  };
  list.push(entry);
  save();
  return entry;
}

export function updateTransaction(monthKey, id, patch) {
  const list = state.months[monthKey] || [];
  const found = list.find((t) => t.id === id);
  if (!found) return null;
  Object.assign(found, patch);
  if (patch.amount !== undefined) found.amount = Math.round(patch.amount);
  save();
  return found;
}

export function deleteTransaction(monthKey, id) {
  const list = state.months[monthKey] || [];
  const at = list.findIndex((t) => t.id === id);
  if (at === -1) return false;
  list.splice(at, 1);
  save();
  return true;
}

export function setBudget(categoryId, amount) {
  state.budgets[categoryId] = Math.max(0, Math.round(amount));
  save();
}

export function toggleBill(monthKey, billId) {
  const paid = state.billsPaid[monthKey] || (state.billsPaid[monthKey] = {});
  paid[billId] = !paid[billId];
  save();
  return paid[billId];
}

export function addBill(bill) {
  const entry = {
    id: 'b' + Date.now().toString(36),
    name: bill.name,
    detail: bill.detail || '',
    category: bill.category,
    amount: Math.round(bill.amount),
    day: bill.day,
  };
  state.bills.push(entry);
  save();
  return entry;
}

export function addFunds(goalId, amount) {
  const goal = state.goals.find((g) => g.id === goalId);
  if (!goal) return null;
  goal.saved = Math.min(goal.target, goal.saved + Math.round(amount));
  save();
  return goal;
}

export function addGoal(goal) {
  const entry = {
    id: 'g' + Date.now().toString(36),
    name: goal.name,
    detail: goal.detail || '',
    target: Math.round(goal.target),
    saved: Math.round(goal.saved || 0),
    color: '#0f766e',
  };
  state.goals.push(entry);
  save();
  return entry;
}

export function exportCSV(monthKey) {
  const rows = [['Date', 'Description', 'Category', 'Type', 'Amount (IDR)']];
  for (const tx of monthTransactions(monthKey)) {
    rows.push([tx.date, tx.desc, tx.category, tx.type, String(tx.amount)]);
  }
  return rows
    .map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(','))
    .join('\n');
}
