// Reports view: October vs November comparison, the six-month trend chart,
// the category donut, and plain-language insights. The CSV button downloads
// the current month's ledger as a file (built in the browser, no network).
import { fmtIDR, fmtShort, fmtMonth, pct } from './format.js';
import { CATEGORIES, TREND } from './data.js';
import * as store from './store.js';
import { trendChart, donutChart, hbarChart } from './charts.js';

function deltaRow(label, oct, nov, invert, octLabel, novLabel) {
  const diff = nov - oct;
  const p = oct ? Math.round((diff / oct) * 100) : 0;
  const good = invert ? diff < 0 : diff > 0;
  const arrow = diff > 0 ? '▲' : diff < 0 ? '▼' : '—';
  return (
    '<tr><td>' + label + '</td><td class="num" data-label="' + octLabel + '">' + fmtIDR(oct) + '</td><td class="num" data-label="' + novLabel + '">' + fmtIDR(nov) + '</td>' +
    '<td class="num ' + (good ? 'good' : 'bad') + '" data-label="Perubahan">' + arrow + ' ' + fmtIDR(Math.abs(diff)) + ' (' + (p > 0 ? '+' : '') + p + '%)</td></tr>'
  );
}

export function reports(monthKey) {
  const stats = store.monthStats(monthKey);
  const prevKey = monthKey === '2026-11' ? '2026-10' : '2026-11';
  const prev = store.monthStats(prevKey);

  const donutItems = CATEGORIES.map((c) => ({
    label: c.name, value: stats.byCategory[c.id] || 0, color: c.color,
  })).filter((i) => i.value > 0);

  const worst = CATEGORIES.map((c) => {
    const spent = stats.byCategory[c.id] || 0;
    const limit = store.load().budgets[c.id];
    return { c, spent, limit, over: spent - limit };
  }).filter((x) => x.over > 0).sort((a, b) => b.over - a.over);

  const best = CATEGORIES.map((c) => {
    const spent = stats.byCategory[c.id] || 0;
    const limit = store.load().budgets[c.id];
    return { c, spent, limit, saved: limit - spent };
  }).filter((x) => x.saved > 0).sort((a, b) => b.saved - a.saved);

  const insights = [];
  if (worst.length) {
    insights.push('<strong>' + worst[0].c.name + '</strong> melewati anggaran ' + fmtIDR(worst[0].over) + ' — kebocoran terbesar bulan ini. Turunkan frekuensi belanja mingguan dari 4x menjadi 3x dan belanja di pasar tradisional di awal minggu.');
  }
  if (best.length) {
    insights.push('<strong>' + best[0].c.name + '</strong> hemat ' + fmtIDR(best[0].saved) + ' dari anggarannya. Pindahkan sisa ini ke Dana Darurat selagi masih ada.');
  }
  const spentDiff = stats.spent - prev.spent;
  insights.push(
    spentDiff <= 0
      ? 'Pengeluaran turun ' + fmtIDR(-spentDiff) + ' (' + Math.abs(Math.round((spentDiff / prev.spent) * 100)) + '%) dibanding ' + fmtMonth(prevKey) + ', sementara pemasukan naik ' + fmtIDR(stats.income - prev.income) + '. Arahnya sudah benar — pertahankan.'
      : 'Pengeluaran naik ' + fmtIDR(spentDiff) + ' dibanding ' + fmtMonth(prevKey) + '. Periksa kategori yang naik paling besar di grafik bawah.'
  );
  insights.push('Rata-rata pengeluaran 6 bulan terakhir: <strong>' + fmtIDR(Math.round(TREND.reduce((s, t) => s + t.spent, 0) / TREND.length)) + '</strong> per bulan. Bulan ini ' + fmtIDR(stats.spent) + ' — ' + (stats.spent <= TREND.reduce((s, t) => s + t.spent, 0) / TREND.length ? 'di bawah' : 'di atas') + ' rata-rata.');

  return (
    '<section class="page-head">' +
    '<h1>Laporan · ' + fmtMonth(monthKey) + '</h1>' +
    '<p>Perbandingan dengan bulan lalu, tren enam bulan, dan apa yang harus dilakukan bulan depan. <button type="button" class="btn small primary" data-action="export-csv">⬇ Unduh CSV bulan ini</button></p>' +
    '</section>' +

    '<section class="card"><h2>' + fmtMonth(prevKey) + ' vs ' + fmtMonth(monthKey) + '</h2>' +
    '<div class="table-wrap"><table class="ledger"><thead><tr><th>Pos</th><th class="num">' + fmtMonth(prevKey) + '</th><th class="num">' + fmtMonth(monthKey) + '</th><th class="num">Perubahan</th></tr></thead><tbody>' +
    deltaRow('Pemasukan', prev.income, stats.income, false, fmtMonth(prevKey), fmtMonth(monthKey)) +
    deltaRow('Pengeluaran', prev.spent, stats.spent, true, fmtMonth(prevKey), fmtMonth(monthKey)) +
    deltaRow('Sisa', prev.left, stats.left, false, fmtMonth(prevKey), fmtMonth(monthKey)) +
    '</tbody></table></div>' +
    '<p class="card-note">Panah hijau berarti membaik (pemasukan/sisa naik, pengeluaran turun); merah berarti sebaliknya.</p></section>' +

    '<div class="two-col">' +
    '<section class="card"><h2>Tren 6 bulan · pengeluaran (hijau) vs pemasukan (oranye)</h2>' +
    trendChart(TREND) +
    '<p class="card-note">Pengeluaran tertinggi: Oktober (' + fmtShort(9860000) + ') karena service AC dan cek kesehatan tahunan. November kembali di bawah rata-rata.</p></section>' +

    '<section class="card"><h2>Pengeluaran ' + fmtMonth(monthKey) + ' per kategori</h2>' +
    '<div class="donut-wrap">' + donutChart(donutItems, 'Total', fmtShort(stats.spent)) + '</div>' +
    '<ul class="legend">' + donutItems.map((i) => '<li><span class="swatch" style="background:' + i.color + '"></span>' + i.label + ' · ' + pct(i.value, stats.spent) + '%</li>').join('') + '</ul>' +
    '</section></div>' +

    '<section class="card"><h2>Pengeluaran per kategori · ' + fmtMonth(monthKey) + '</h2>' +
    hbarChart(CATEGORIES.map((c) => ({ label: c.name, value: stats.byCategory[c.id] || 0, color: c.color })).sort((a, b) => b.value - a.value)) +
    '</section>' +

    '<section class="card"><h2>Yang perlu dilakukan bulan depan</h2>' +
    '<ol class="insights">' + insights.map((s) => '<li>' + s + '</li>').join('') + '</ol></section>'
  );
}
