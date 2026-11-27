// Reports view: October vs November comparison, the six-month trend chart,
// the category donut, and plain-language insights. The CSV button downloads
// the current month's ledger as a file (built in the browser, no network).
import { fmtIDR, fmtShort, fmtMonth, pct, pct1 } from './format.js';
import { CATEGORIES, TREND, RULE_503020, categoryById } from './data.js';
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

// 50/30/20 comparison: needs vs wants vs savings as shares of this
// month's income, each against its guide percentage. All figures are
// computed from the month's own ledger, so editing a transaction moves
// them; nothing here is hard-coded.
function fiftyThirtyTwenty(stats, monthKey) {
  const income = stats.income;
  const groups = [
    { id: 'needs', label: 'Kebutuhan', en: 'Needs', ideal: 50, color: '#0f766e', ids: RULE_503020.needs, note: 'Belanja harian, listrik, air, internet, transport, sekolah, kesehatan, rumah tangga' },
    { id: 'wants', label: 'Keinginan', en: 'Wants', ideal: 30, color: '#d97706', ids: RULE_503020.wants, note: 'Makan di luar dan hiburan saja' },
    { id: 'saved', label: 'Tabungan', en: 'Savings', ideal: 20, color: '#0284c7', ids: [], note: 'Sisa pemasukan yang belum terpakai' },
  ];
  const rows = groups.map((g) => {
    const amount = g.id === 'saved' ? stats.left : g.ids.reduce((s, id) => s + (stats.byCategory[id] || 0), 0);
    const p = (amount / income) * 100;
    const idealRp = Math.round((income * g.ideal) / 100);
    const diffRp = amount - idealRp;
    const diffPts = p - g.ideal;
    const over = diffRp > 0;
    return (
      '<div class="split-row">' +
      '<div class="split-head"><strong>' + g.label + ' · ' + g.en + '</strong><span>' + fmtIDR(amount) + ' · ' + pct1(amount, income) + '% dari pemasukan</span></div>' +
      '<div class="split-track"><div class="split-fill" style="width:' + Math.min(100, Math.max(1, p)).toFixed(1) + '%;background:' + g.color + '"></div>' +
      '<span class="split-ideal" style="left:' + g.ideal + '%" title="Patokan ' + g.ideal + '%"></span></div>' +
      '<div class="split-scale"><span>Patokan ' + g.ideal + '% · ' + fmtIDR(idealRp) + ' &nbsp;·&nbsp; ' + g.note + '</span>' +
      '<span class="split-diff ' + (over ? 'bad' : 'good') + '">' + (over ? '+' : '') + fmtIDR(diffRp) + ' (' + (diffPts > 0 ? '+' : '') + diffPts.toFixed(1).replace('.', ',') + ' poin)</span></div>' +
      '</div>'
    );
  }).join('');

  // Verdict: name the biggest needs category and say plainly where the
  // money actually leaks, instead of repeating the numbers.
  const biggestNeed = RULE_503020.needs
    .map((id) => ({ c: categoryById(id), spent: stats.byCategory[id] || 0, limit: store.load().budgets[id] }))
    .sort((a, b) => b.spent - a.spent)[0];
  const needsAmount = groups[0].ids.reduce((s, id) => s + (stats.byCategory[id] || 0), 0);
  const needsPct = (needsAmount / income) * 100;
  const wantsAmount = groups[1].ids.reduce((s, id) => s + (stats.byCategory[id] || 0), 0);
  const savedPct = (stats.left / income) * 100;
  const overPct = biggestNeed.limit ? Math.round(((biggestNeed.spent - biggestNeed.limit) / biggestNeed.limit) * 100) : 0;
  const needsGap = Math.abs(needsPct - 50).toFixed(1).replace('.', ',');
  const verdict =
    'Kebutuhan memakan <strong>' + pct1(needsAmount, income) + '% pemasukan</strong> — ' + needsGap + ' poin ' + (needsPct >= 50 ? 'di atas' : 'di bawah') + ' patokan 50%. ' +
    'Biang terbesarnya <strong>' + biggestNeed.c.name + '</strong> (' + fmtShort(biggestNeed.spent) + (overPct > 0 ? ', ' + overPct + '% di atas anggarannya sendiri' : '') + '). ' +
    'Keinginan justru hanya ' + pct1(wantsAmount, income) + '% — jauh di bawah patokan 30% — jadi memangkas jajan tidak banyak membantu; yang perlu ditekan adalah belanja mingguan. ' +
    'Tabungan ' + pct1(stats.left, income) + '% ' + (savedPct >= 20 ? 'sudah di atas patokan 20%: pertahankan.' : 'masih di bawah patokan 20%: sisihkan dulu di awal bulan.');

  return (
    '<section class="card"><h2>Aturan 50/30/20 · ' + fmtMonth(monthKey) + '</h2>' +
    '<p class="card-note" style="margin-bottom:14px">Patokan klasik anggaran rumah tangga: 50% pemasukan untuk kebutuhan, 30% untuk keinginan, 20% ditabung. Garis hitam pada tiap bar adalah patokannya.</p>' +
    rows +
    '<p class="card-note">' + verdict + '</p></section>'
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

    fiftyThirtyTwenty(stats, monthKey) +

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
