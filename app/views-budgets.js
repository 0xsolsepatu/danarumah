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

  return (
    '<section class="page-head">' +
    '<h1>Anggaran · ' + fmtMonth(monthKey) + '</h1>' +
    '<p>Total anggaran ' + fmtIDR(stats.budgetTotal) + ' untuk 10 kategori. ' +
    (overCount
      ? '<strong>' + overCount + ' kategori sudah melewati batas</strong> — kurangi belanja di sana atau naikkan anggarannya di bawah.'
      : 'Semua kategori masih dalam batas. Pertahankan sampai akhir bulan.') +
    '</p></section>' +
    '<div class="budget-grid">' + cards + '</div>' +
    '<section class="card tip-card"><h2>Cara memakai anggaran ini</h2>' +
    '<p>Anggaran dibuat di awal bulan dari pemasukan yang sudah pasti. Kalau satu kategori jebol, jangan tambah anggaran diam-diam — pindahkan dari kategori lain yang masih longgar, supaya totalnya tetap ' + fmtIDR(stats.budgetTotal) + '. Kategori yang paling sering jebol di keluarga ini: <strong>Belanja Harian</strong> dan <strong>Internet &amp; HP</strong>.</p></section>'
  );
}
