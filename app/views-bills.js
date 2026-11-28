// Bills view: the month's fixed payment schedule — due day, amount,
// paid/unpaid toggle, and an add-bill form. Unpaid bills past their due day
// are flagged overdue; the next unpaid bill is highlighted as "due soon".
import { fmtIDR, fmtMonth } from './format.js';
import { categoryById } from './data.js';
import * as store from './store.js';

export const TODAY_DAY = 27; // "today" inside the demo month (27 Nov 2026).

export function bills(monthKey) {
  const state = store.load();
  const paid = state.billsPaid[monthKey] || {};
  const sorted = state.bills.slice().sort((a, b) => a.day - b.day);
  let totalDue = 0;
  let totalPaid = 0;
  for (const b of sorted) {
    if (paid[b.id]) totalPaid += b.amount;
    else totalDue += b.amount;
  }

  const rows = sorted.map((b) => {
    const isPaid = !!paid[b.id];
    const overdue = !isPaid && b.day < TODAY_DAY;
    const dueSoon = !isPaid && !overdue && b.day - TODAY_DAY <= 3;
    const cat = categoryById(b.category);
    return (
      '<article class="card bill-card' + (isPaid ? ' paid' : '') + (overdue ? ' overdue' : '') + '">' +
      '<div class="bill-date"><span class="bill-day">' + b.day + '</span><span>' + fmtMonth(monthKey).split(' ')[0] + '</span></div>' +
      '<div class="bill-main"><h3>' + b.name + '</h3><p>' + b.detail + ' · ' + cat.icon + ' ' + cat.name + '</p>' +
      (isPaid ? '<span class="paid-flag">✓ Lunas</span>'
        : overdue ? '<span class="over-flag">TERLAMBAT ' + (TODAY_DAY - b.day) + ' HARI</span>'
        : dueSoon ? '<span class="soon-flag">JATUH TEMPO ' + (b.day - TODAY_DAY) + ' HARI LAGI</span>'
        : '<span class="soon-flag soft">Jatuh tempo tgl ' + b.day + '</span>') +
      '</div>' +
      '<div class="bill-side"><strong>' + fmtIDR(b.amount) + '</strong>' +
      '<button type="button" class="btn small' + (isPaid ? '' : ' primary') + '" data-action="toggle-bill" data-id="' + b.id + '">' +
      (isPaid ? 'Batalkan lunas' : 'Tandai lunas') + '</button></div>' +
      '</article>'
    );
  }).join('');

  return (
    '<section class="page-head">' +
    '<h1>Tagihan · ' + fmtMonth(monthKey) + '</h1>' +
    '<p>Jadwal tagihan tetap keluarga. Tandai lunas begitu dibayar — tagihan yang telat langsung kelihatan.</p>' +
    '</section>' +

    '<section class="stat-grid three">' +
    '<div class="card stat-card"><div class="stat-label">Total tagihan bulan ini</div><div class="stat-value">' + fmtIDR(totalDue + totalPaid) + '</div><div class="stat-sub">' + sorted.length + ' tagihan</div></div>' +
    '<div class="card stat-card"><div class="stat-label">Sudah dibayar</div><div class="stat-value">' + fmtIDR(totalPaid) + '</div><div class="stat-sub">' + sorted.filter((b) => paid[b.id]).length + ' dari ' + sorted.length + ' tagihan</div></div>' +
    '<div class="card stat-card spent"><div class="stat-label">Belum dibayar</div><div class="stat-value">' + fmtIDR(totalDue) + '</div><div class="stat-sub">' + sorted.filter((b) => !paid[b.id]).length + ' tagihan menunggu</div></div>' +
    '</section>' +

    '<div class="bill-list">' + rows + '</div>' +

    '<section class="card form-card"><h2>＋ Tambah tagihan rutin</h2>' +
    '<form id="bill-form"><div class="form-grid">' +
    '<label>Nama tagihan<input type="text" name="name" required maxlength="60" placeholder="cth: Iuran sampah"></label>' +
    '<label>Jumlah (Rp)<input type="number" name="amount" required min="1000" step="1000" placeholder="50000"></label>' +
    '<label>Jatuh tempo (tanggal)<input type="number" name="day" required min="1" max="31" value="1"></label>' +
    '<label>Kategori<select name="category">' +
    ['belanja', 'listrik', 'air', 'internet', 'transport', 'sekolah', 'makan', 'kesehatan', 'hiburan', 'rumah']
      .map((id) => '<option value="' + id + '">' + categoryById(id).name + '</option>').join('') +
    '</select></label>' +
    '</div><div class="form-actions"><button class="btn primary" type="submit">Simpan tagihan</button></div></form></section>'
  );
}
