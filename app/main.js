// DanaRumah boot + router. Hash routes, one per section, all linked from
// the header nav and the footer:
//   #/                Dashboard
//   #/transactions    Ledger (add / edit / delete)
//   #/budgets         Category budgets
//   #/bills           Monthly bills
//   #/goals           Savings goals
//   #/reports         Reports & charts
// The month switcher (?month=2026-10) changes which month the views read.
// All clicks go through one delegated listener; all forms through one
// submit listener. window.__shotReady tells a screenshot script the page
// has rendered.
import { fmtMonth } from './format.js';
import * as store from './store.js';
import { MONTHS } from './store.js';
import { dashboard } from './views-dashboard.js';
import { transactions } from './views-transactions.js';
import { budgets } from './views-budgets.js';
import { bills } from './views-bills.js';
import { goals } from './views-goals.js';
import { reports } from './views-reports.js';

const app = document.getElementById('app');
const toastBox = document.getElementById('toast');
let toastTimer = null;

export function showToast(message) {
  toastBox.textContent = message;
  toastBox.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastBox.classList.remove('show'), 3200);
}

function parseHash() {
  const raw = location.hash || '#/';
  const [pathPart, queryPart] = raw.slice(1).split('?');
  const query = {};
  if (queryPart) {
    for (const pair of queryPart.split('&')) {
      const [k, v] = pair.split('=');
      if (k) query[decodeURIComponent(k)] = v ? decodeURIComponent(v) : '';
    }
  }
  return { path: pathPart || '/', query };
}

function monthFrom(query) {
  return MONTHS.includes(query.month) ? query.month : '2026-11';
}

function navLink(path, label, current) {
  const active = path === current ? ' aria-current="page"' : '';
  return '<a href="#' + path + '"' + active + '>' + label + '</a>';
}

function render() {
  window.__shotReady = false;
  store.load();
  const { path, query } = parseHash();
  const month = monthFrom(query);
  const otherMonth = month === '2026-11' ? '2026-10' : '2026-11';

  const nav =
    '<nav class="main-nav" aria-label="Bagian utama">' +
    navLink('/', 'Dashboard', path) +
    navLink('/transactions', 'Transaksi', path) +
    navLink('/budgets', 'Anggaran', path) +
    navLink('/bills', 'Tagihan', path) +
    navLink('/goals', 'Target', path) +
    navLink('/reports', 'Laporan', path) +
    '</nav>';

  const switcher =
    '<div class="month-switcher" role="group" aria-label="Pilih bulan">' +
    '<a class="btn small" href="#' + path + '?month=' + otherMonth + '">‹ ' + fmtMonth(otherMonth) + '</a>' +
    '<strong>' + fmtMonth(month) + '</strong>' +
    '<a class="btn small" href="#' + path + '?month=' + otherMonth + '">' + fmtMonth(otherMonth) + ' ›</a>' +
    '</div>';

  let body = '';
  let title = 'DanaRumah';
  if (path === '/transactions') { body = transactions(month, query); title = 'Transaksi'; }
  else if (path === '/budgets') { body = budgets(month); title = 'Anggaran'; }
  else if (path === '/bills') { body = bills(month); title = 'Tagihan'; }
  else if (path === '/goals') { body = goals(); title = 'Target Tabungan'; }
  else if (path === '/reports') { body = reports(month); title = 'Laporan'; }
  else { body = dashboard(month); title = 'Dashboard'; }

  document.title = title + ' · DanaRumah — Anggaran Keluarga';
  app.innerHTML = nav + switcher + body;

  const navLinks = app.querySelectorAll('.main-nav a');
  navLinks.forEach((a) => {
    const href = a.getAttribute('href');
    const base = href === '#/' ? '#/' : href;
    const target = base === '#/' ? '#/?month=' + month : base + '?month=' + month;
    if (!href.includes('month=')) a.setAttribute('href', target);
  });

  bindForms(month, query);
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function rerenderWithToast(message) {
  render();
  if (message) showToast(message);
}

function bindForms(month, query) {
  const txForm = document.getElementById('tx-form');
  if (txForm) {
    txForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(txForm);
      const amount = Number(data.get('amount'));
      const desc = String(data.get('desc') || '').trim();
      if (!desc || !(amount > 0)) { showToast('Isi keterangan dan jumlah yang benar.'); return; }
      const tx = {
        date: String(data.get('date')),
        desc,
        category: String(data.get('category')),
        amount,
        type: String(data.get('type')),
      };
      const editId = txForm.dataset.editId;
      if (editId) {
        store.updateTransaction(month, editId, tx);
        location.hash = '#/transactions?month=' + month;
        rerenderWithToast('Transaksi diubah.');
      } else {
        store.addTransaction(month, tx);
        rerenderWithToast('Transaksi tersimpan.');
      }
    });
  }

  const filterForm = document.getElementById('tx-filter');
  if (filterForm) {
    filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(filterForm);
      const params = new URLSearchParams();
      const search = String(data.get('search') || '').trim();
      if (search) params.set('search', search);
      if (data.get('type') !== 'all') params.set('type', String(data.get('type')));
      if (data.get('cat') !== 'all') params.set('cat', String(data.get('cat')));
      params.set('month', month);
      location.hash = '#/transactions?' + params.toString();
    });
  }

  document.querySelectorAll('.budget-edit').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const amount = Number(new FormData(form).get('amount'));
      if (!(amount >= 0)) { showToast('Anggaran harus angka 0 atau lebih.'); return; }
      store.setBudget(form.dataset.category, amount);
      rerenderWithToast('Anggaran diperbarui.');
    });
  });

  const billForm = document.getElementById('bill-form');
  if (billForm) {
    billForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(billForm);
      store.addBill({
        name: String(data.get('name')).trim(),
        amount: Number(data.get('amount')),
        day: Number(data.get('day')),
        category: String(data.get('category')),
      });
      rerenderWithToast('Tagihan ditambahkan.');
    });
  }

  document.querySelectorAll('.fund-form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const amount = Number(new FormData(form).get('amount'));
      if (!(amount > 0)) { showToast('Masukkan jumlah dana yang ditambahkan.'); return; }
      const goal = store.addFunds(form.dataset.goal, amount);
      rerenderWithToast(goal && goal.saved >= goal.target ? '🎉 Target ' + goal.name + ' tercapai!' : 'Dana ditambahkan ke ' + (goal ? goal.name : 'target') + '.');
    });
  });

  const goalForm = document.getElementById('goal-form');
  if (goalForm) {
    goalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(goalForm);
      store.addGoal({
        name: String(data.get('name')).trim(),
        target: Number(data.get('target')),
        saved: Number(data.get('saved') || 0),
        detail: String(data.get('detail') || '').trim(),
      });
      rerenderWithToast('Target baru dibuat.');
    });
  }
}

// One delegated click handler for every button in the app.
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const { query } = parseHash();
  const month = monthFrom(query);
  const action = el.dataset.action;

  if (action === 'delete-tx') {
    if (store.deleteTransaction(month, el.dataset.id)) rerenderWithToast('Transaksi dihapus.');
  } else if (action === 'edit-tx') {
    location.hash = '#/transactions?month=' + month + '&edit=' + encodeURIComponent(el.dataset.id);
  } else if (action === 'toggle-bill') {
    const nowPaid = store.toggleBill(month, el.dataset.id);
    rerenderWithToast(nowPaid ? 'Tagihan ditandai lunas.' : 'Tagihan dikembalikan ke belum dibayar.');
  } else if (action === 'export-csv') {
    const csv = store.exportCSV(month);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'danarumah-' + month + '.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('CSV bulan ' + fmtMonth(month) + ' diunduh.');
  } else if (action === 'reset-data') {
    store.resetAll();
    rerenderWithToast('Data demo dikembalikan seperti semula.');
  }
});

window.addEventListener('hashchange', render);
render();
