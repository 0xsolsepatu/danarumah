// Dashboard view: the month at a glance — summary cards, spending by
// category, budget progress, upcoming bills, savings goals, recent
// transactions. Every number comes from store.monthStats, never hard-coded.
import { fmtIDR, fmtShort, fmtDate, fmtMonth, pct, pct1 } from './format.js';
import { CATEGORIES, RULE_503020, categoryById } from './data.js';
import * as store from './store.js';
import { hbarChart } from './charts.js';
import { TODAY_DAY } from './views-bills.js';

function moneyCard(label, value, sub, tone) {
  return (
    '<div class="card stat-card ' + (tone || '') + '">' +
    '<div class="stat-label">' + label + '</div>' +
    '<div class="stat-value">' + fmtIDR(value) + '</div>' +
    '<div class="stat-sub">' + sub + '</div>' +
    '</div>'
  );
}

export function dashboard(monthKey) {
  const state = store.load();
  const stats = store.monthStats(monthKey);
  const txs = store.monthTransactions(monthKey);

  const byCat = CATEGORIES.map((c) => ({
    label: c.name,
    value: stats.byCategory[c.id] || 0,
    color: c.color,
  })).sort((a, b) => b.value - a.value);

  const budgets = CATEGORIES.map((c) => {
    const spent = stats.byCategory[c.id] || 0;
    const limit = state.budgets[c.id];
    const p = pct(spent, limit);
    const over = spent > limit;
    return { c, spent, limit, p, over };
  }).sort((a, b) => b.p - a.p);

  const paid = state.billsPaid[monthKey] || {};
  const upcoming = state.bills
    .filter((b) => !paid[b.id])
    .sort((a, b) => a.day - b.day);
  const billsDueTotal = upcoming.reduce((s, b) => s + b.amount, 0);

  const goals = state.goals.map((g) => {
    const p = pct(g.saved, g.target);
    return (
      '<div class="goal-row">' +
      '<div class="goal-head"><strong>' + g.name + '</strong><span>' + fmtIDR(g.saved) + ' / ' + fmtIDR(g.target) + '</span></div>' +
      '<div class="progress"><div class="progress-fill" style="width:' + Math.min(100, p) + '%;background:' + g.color + '"></div></div>' +
      '<div class="goal-sub">' + p + '% tercapai · ' + fmtIDR(g.target - g.saved) + ' lagi · <a href="#/goals">Lihat target</a></div>' +
      '</div>'
    );
  }).join('');

  const recent = txs.slice(0, 5).map((tx) => {
    const cat = categoryById(tx.category);
    const sign = tx.type === 'income' ? '+' : '−';
    return (
      '<li class="tx-line">' +
      '<span class="tx-dot" style="background:' + (tx.type === 'income' ? '#059669' : cat.color) + '">' + (tx.type === 'income' ? '↓' : cat.icon) + '</span>' +
      '<span class="tx-desc"><strong>' + tx.desc + '</strong><small>' + fmtDate(tx.date) + '</small></span>' +
      '<span class="tx-amount ' + tx.type + '">' + sign + ' ' + fmtIDR(tx.amount) + '</span>' +
      '</li>'
    );
  }).join('');

  const budgetRows = budgets.slice(0, 5).map((b) => (
    '<div class="budget-mini">' +
    '<span class="budget-mini-name">' + b.c.icon + ' ' + b.c.name + (b.over ? ' <em class="over-flag">OVER BUDGET</em>' : '') + '</span>' +
    '<div class="progress slim"><div class="progress-fill' + (b.over ? ' over' : '') + '" style="width:' + Math.min(100, b.p) + '%"></div></div>' +
    '<span class="budget-mini-fig">' + fmtShort(b.spent) + ' / ' + fmtShort(b.limit) + ' · ' + b.p + '%</span>' +
    '</div>'
  )).join('');

  const insight = stats.left >= 0
    ? 'Sisa ' + fmtIDR(stats.left) + ' bulan ini — ' + stats.rate + '% dari pemasukan belum terpakai. Pindahkan ke Dana Darurat sebelum akhir bulan.'
    : 'Pengeluaran sudah melewati pemasukan bulan ini sebesar ' + fmtIDR(-stats.left) + '. Cek kategori yang over budget di bawah.';

  // Compact 50/30/20 strip: the same comparison as the Reports page, in
  // one glanceable row — needs/wants/savings vs the 50/30/20 guide.
  const splitGroups = [
    { label: 'Kebutuhan · Needs', ideal: 50, color: '#0f766e', amount: RULE_503020.needs.reduce((s, id) => s + (stats.byCategory[id] || 0), 0) },
    { label: 'Keinginan · Wants', ideal: 30, color: '#d97706', amount: RULE_503020.wants.reduce((s, id) => s + (stats.byCategory[id] || 0), 0) },
    { label: 'Tabungan · Savings', ideal: 20, color: '#0284c7', amount: stats.left },
  ];
  const splitMini = splitGroups.map((g) => {
    const p = (g.amount / stats.income) * 100;
    return (
      '<div class="split-mini-row"><span class="split-mini-label">' + g.label + '</span>' +
      '<div class="split-mini-track"><div class="split-mini-fill" style="width:' + Math.min(100, Math.max(1, p)).toFixed(1) + '%;background:' + g.color + '"></div>' +
      '<span class="split-ideal" style="left:' + g.ideal + '%"></span></div>' +
      '<span class="split-mini-fig">' + fmtShort(g.amount) + ' · ' + pct1(g.amount, stats.income) + '% <small>(patokan ' + g.ideal + '%)</small></span></div>'
    );
  }).join('');

  return (
    '<section class="page-head">' +
    '<h1>Selamat datang, Keluarga Prasetyo</h1>' +
    '<p>Anggaran ' + fmtMonth(monthKey) + ' · ' + stats.count + ' transaksi tercatat · Semua data tersimpan di browser Anda, tanpa akun dan tanpa internet.</p>' +
    '</section>' +

    '<section class="stat-grid">' +
    moneyCard('Pemasukan · Income', stats.income, 'Gaji + usaha sampingan') +
    moneyCard('Pengeluaran · Spent', stats.spent, pct(stats.spent, stats.income) + '% dari pemasukan', 'spent') +
    moneyCard('Sisa · Remaining', stats.left, stats.rate + '% bisa ditabung', 'left') +
    moneyCard('Total anggaran', stats.budgetTotal, 'Terpakai ' + stats.budgetUsed + '% · ' + fmtIDR(stats.spent) + ' dari ' + fmtIDR(stats.budgetTotal), '') +
    '</section>' +

    '<div class="insight-bar">💡 <strong>Insight bulan ini:</strong> ' + insight + '</div>' +

    '<section class="card split-mini-card"><h2>Aturan 50/30/20 · ' + fmtMonth(monthKey) + '</h2>' +
    splitMini +
    '<p class="card-link"><a href="#/reports">Lihat perbandingan lengkap + saran →</a></p></section>' +

    '<div class="two-col">' +
    '<section class="card"><h2>Pengeluaran per kategori</h2>' +
    hbarChart(byCat.slice(0, 7)) +
    '<p class="card-link"><a href="#/reports">Lihat laporan lengkap →</a></p></section>' +

    '<section class="card"><h2>Anggaran paling ketat</h2>' +
    budgetRows +
    '<p class="card-link"><a href="#/budgets">Atur semua anggaran →</a></p></section>' +
    '</div>' +

    '<div class="two-col">' +
    '<section class="card"><h2>Tagihan belum dibayar · ' + upcoming.length + ' tagihan</h2>' +
    (upcoming.length
      ? '<ul class="bill-mini">' + upcoming.map((b) => {
        const overdue = b.day < TODAY_DAY;
        const dueSoon = !overdue && b.day - TODAY_DAY <= 3;
        return '<li><span><strong>' + b.name + '</strong><small>Jatuh tempo tgl ' + b.day + ' · ' + fmtMonth(monthKey) +
          (overdue ? ' · <em class="over-flag">TERLAMBAT ' + (TODAY_DAY - b.day) + ' HARI</em>'
            : dueSoon ? ' · <span class="soon-flag">JATUH TEMPO ' + (b.day - TODAY_DAY) + ' HARI LAGI</span>' : '') +
          '</small></span><span class="bill-amount">' + fmtIDR(b.amount) + '</span></li>';
      }).join('') + '</ul><p class="card-link">Total belum dibayar: <strong>' + fmtIDR(billsDueTotal) + '</strong> · <a href="#/bills">Kelola tagihan →</a></p>'
      : '<p>Semua tagihan bulan ini sudah lunas. 🎉</p><p class="card-link"><a href="#/bills">Lihat riwayat tagihan →</a></p>') +
    '</section>' +

    '<section class="card"><h2>Target tabungan</h2>' + goals +
    '<p class="card-link"><a href="#/goals">Tambah dana / buat target baru →</a></p></section>' +
    '</div>' +

    '<section class="card"><h2>Transaksi terakhir</h2>' +
    '<ul class="tx-list">' + recent + '</ul>' +
    '<p class="card-link"><a href="#/transactions">Lihat semua ' + stats.count + ' transaksi →</a></p></section>'
  );
}
