// Budgets view: one card per category with spent vs limit, a progress bar,
// an over-budget flag, and an inline editor for the limit. The "remaining"
// figure and the bar update the moment a limit is saved.
import { fmtIDR, fmtMonth, pct } from './format.js';
import { CATEGORIES } from './data.js';
import * as store from './store.js';

export function budgets(monthKey) {
  const state = store.load();
  const stats = store.monthStats(monthKey);
  const cards = CATEGORIES.map((c) => {
    const spent = stats.byCategory[c.id] || 0;
    const limit = state.budgets[c.id];
    const p = pct(spent, limit);
    const over = spent > limit;
    const left = limit - spent;
    return (
      '<article class="card budget-card' + (over ? ' over' : '') + '">' +
      '<header><span class="budget-icon" style="background:' + c.color + '">' + c.icon + '</span>' +
      '<div><h3>' + c.name + '</h3><p>' + c.en + '</p></div>' +
      (over ? '<span class="over-flag">OVER BUDGET</span>' : '<span class="ok-flag">' + p + '%</span>') +
      '</header>' +
      '<div class="budget-figures"><strong>' + fmtIDR(spent) + '</strong><span>dari ' + fmtIDR(limit) + '</span></div>' +
      '<div class="progress"><div class="progress-fill' + (over ? ' over' : '') + '" style="width:' + Math.min(100, p) + '%"></div></div>' +
      '<p class="budget-left">' + (over
        ? 'Melebihi anggaran <strong>' + fmtIDR(-left) + '</strong> (' + (p - 100) + '% di atas batas).'
        : 'Sisa <strong>' + fmtIDR(left) + '</strong> sampai akhir bulan.') + '</p>' +
      '<form class="budget-edit" data-category="' + c.id + '">' +
      '<label>Ubah anggaran <input type="number" name="amount" min="0" step="50000" value="' + limit + '" aria-label="Anggaran ' + c.name + '"></label>' +
      '<button class="btn small" type="submit">Simpan</button>' +
      '</form></article>'
    );
  }).join('');

  const overCount = CATEGORIES.filter((c) => (stats.byCategory[c.id] || 0) > state.budgets[c.id]).length;
  const budgetLeft = stats.budgetTotal - stats.spent;

  // Reallocation tip, computed from this month's own figures: which
  // categories blew their limit, and which still have room to cover them.
  const overList = CATEGORIES.map((c) => ({ c, over: (stats.byCategory[c.id] || 0) - state.budgets[c.id] }))
    .filter((x) => x.over > 0).sort((a, b) => b.over - a.over);
  const roomList = CATEGORIES.map((c) => ({ c, room: state.budgets[c.id] - (stats.byCategory[c.id] || 0) }))
    .filter((x) => x.room > 0).sort((a, b) => b.room - a.room);
  const tip = overList.length && roomList.length
    ? 'Yang jebol: ' + overList.map((x) => x.c.name + ' (+' + fmtIDR(x.over) + ')').join(', ') +
      '. Tutup dari yang masih longgar: ' + roomList.slice(0, 2).map((x) => x.c.name + ' (sisa ' + fmtIDR(x.room) + ')').join(' dan ') +
      ' — total anggaran tetap ' + fmtIDR(stats.budgetTotal) + ', tidak perlu tambah uang.'
    : 'Semua kategori masih dalam batas — tidak ada yang perlu dipindahkan bulan ini.';

  return (
    '<section class="page-head">' +
    '<h1>Anggaran · ' + fmtMonth(monthKey) + '</h1>' +
    '<p>Total anggaran ' + fmtIDR(stats.budgetTotal) + ' untuk 10 kategori. ' +
    (overCount
      ? '<strong>' + overCount + ' kategori sudah melewati batas</strong> — kurangi belanja di sana atau naikkan anggarannya di bawah.'
      : 'Semua kategori masih dalam batas. Pertahankan sampai akhir bulan.') +
    '</p></section>' +
    '<section class="stat-grid three">' +
    '<div class="card stat-card"><div class="stat-label">Total anggaran</div><div class="stat-value">' + fmtIDR(stats.budgetTotal) + '</div><div class="stat-sub">10 kategori</div></div>' +
    '<div class="card stat-card spent"><div class="stat-label">Terpakai</div><div class="stat-value">' + fmtIDR(stats.spent) + '</div><div class="stat-sub">' + stats.budgetUsed + '% dari total anggaran</div></div>' +
    '<div class="card stat-card' + (budgetLeft < 0 ? ' spent' : ' left') + '"><div class="stat-label">' + (budgetLeft < 0 ? 'Melebihi total anggaran' : 'Sisa anggaran') + '</div><div class="stat-value">' + fmtIDR(Math.abs(budgetLeft)) + '</div><div class="stat-sub">' + (budgetLeft < 0 ? 'di atas total yang direncanakan' : 'belum terpakai dari total') + '</div></div>' +
    '</section>' +
    '<div class="budget-grid">' + cards + '</div>' +
    '<section class="card tip-card"><h2>Cara memakai anggaran ini</h2>' +
    '<p>Anggaran dibuat di awal bulan dari pemasukan yang sudah pasti. Kalau satu kategori jebol, jangan tambah anggaran diam-diam — pindahkan dari kategori lain yang masih longgar, supaya totalnya tetap ' + fmtIDR(stats.budgetTotal) + '. ' + tip + '</p></section>'
  );
}
