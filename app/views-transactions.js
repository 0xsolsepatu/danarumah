// Transactions view: the full ledger for the month — search, filter by
// type and category, add a transaction, edit one in place, delete one.
// The form at the top doubles as the edit form: clicking "Ubah" on a row
// fills it and switches the button to "Simpan perubahan".
import { fmtIDR, fmtDate, fmtMonth } from './format.js';
import { CATEGORIES, categoryLabel } from './data.js';
import * as store from './store.js';

function option(value, label, selected) {
  return '<option value="' + value + '"' + (selected ? ' selected' : '') + '>' + label + '</option>';
}

export function transactions(monthKey, query) {
  const state = store.load();
  const q = (query.search || '').trim().toLowerCase();
  const typeFilter = query.type || 'all';
  const catFilter = query.cat || 'all';
  let txs = store.monthTransactions(monthKey);
  if (typeFilter !== 'all') txs = txs.filter((t) => t.type === typeFilter);
  if (catFilter !== 'all') txs = txs.filter((t) => t.category === catFilter);
  if (q) txs = txs.filter((t) => (t.desc + ' ' + t.date).toLowerCase().includes(q));

  const income = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const spent = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const editing = query.edit ? (state.months[monthKey] || []).find((t) => t.id === query.edit) : null;

  const rows = txs.map((tx) => {
    const cat = CATEGORIES.find((c) => c.id === tx.category);
    return (
      '<tr>' +
      '<td data-label="Tanggal">' + fmtDate(tx.date) + '</td>' +
      '<td data-label="Keterangan"><strong>' + tx.desc + '</strong></td>' +
      '<td data-label="Kategori">' + (cat ? cat.icon + ' ' + cat.name : categoryLabel(tx)) + '</td>' +
      '<td data-label="Jumlah" class="num ' + tx.type + '">' + (tx.type === 'income' ? '+' : '−') + ' ' + fmtIDR(tx.amount) + '</td>' +
      '<td data-label="Aksi" class="row-actions">' +
      '<button type="button" class="btn small" data-action="edit-tx" data-id="' + tx.id + '">Ubah</button> ' +
      '<button type="button" class="btn small danger" data-action="delete-tx" data-id="' + tx.id + '">Hapus</button>' +
      '</td></tr>'
    );
  }).join('');

  const catOptions = CATEGORIES.map((c) => option(c.id, c.icon + ' ' + c.name, editing ? editing.category === c.id : false)).join('');

  return (
    '<section class="page-head">' +
    '<h1>Transaksi · ' + fmtMonth(monthKey) + '</h1>' +
    '<p>Semua pemasukan dan pengeluaran keluarga. Tambah, ubah, atau hapus — angka di dashboard ikut berubah langsung.</p>' +
    '</section>' +

    '<section class="card form-card"><h2>' + (editing ? 'Ubah transaksi' : '＋ Tambah transaksi') + '</h2>' +
    '<form id="tx-form" data-edit-id="' + (editing ? editing.id : '') + '">' +
    '<div class="form-grid">' +
    '<label>Tanggal<input type="date" name="date" required value="' + (editing ? editing.date : monthKey + '-27') + '"></label>' +
    '<label>Keterangan<input type="text" name="desc" required maxlength="80" placeholder="cth: Pasar tradisional" value="' + (editing ? editing.desc.replace(/"/g, '&quot;') : '') + '"></label>' +
    '<label>Kategori<select name="category">' + catOptions + '</select></label>' +
    '<label>Jenis<select name="type">' +
    option('expense', 'Pengeluaran', !editing || editing.type === 'expense') +
    option('income', 'Pemasukan', editing && editing.type === 'income') +
    '</select></label>' +
    '<label>Jumlah (Rp)<input type="number" name="amount" required min="1000" step="500" placeholder="150000" value="' + (editing ? editing.amount : '') + '"></label>' +
    '</div>' +
    '<div class="form-actions"><button class="btn primary" type="submit">' + (editing ? 'Simpan perubahan' : 'Simpan transaksi') + '</button>' +
    (editing ? ' <a class="btn" href="#/transactions">Batal</a>' : '') +
    '<span class="form-note">Tersimpan otomatis di browser Anda.</span></div>' +
    '</form></section>' +

    '<section class="card"><h2>Cari &amp; saring</h2>' +
    '<form id="tx-filter" class="filter-row">' +
    '<input type="search" name="search" placeholder="Cari keterangan… (cth: pasar, listrik)" value="' + (query.search || '').replace(/"/g, '&quot;') + '" aria-label="Cari transaksi">' +
    '<select name="type" aria-label="Jenis">' +
    option('all', 'Semua jenis', typeFilter === 'all') +
    option('expense', 'Pengeluaran', typeFilter === 'expense') +
    option('income', 'Pemasukan', typeFilter === 'income') +
    '</select>' +
    '<select name="cat" aria-label="Kategori">' +
    option('all', 'Semua kategori', catFilter === 'all') +
    CATEGORIES.map((c) => option(c.id, c.name, catFilter === c.id)).join('') +
    '</select>' +
    '<button class="btn primary" type="submit">Terapkan</button>' +
    (q || typeFilter !== 'all' || catFilter !== 'all' ? ' <a class="btn" href="#/transactions">Reset</a>' : '') +
    '</form>' +
    '<p class="filter-summary">Menampilkan <strong>' + txs.length + '</strong> transaksi · Pemasukan ' + fmtIDR(income) + ' · Pengeluaran ' + fmtIDR(spent) + '</p>' +
    (txs.length
      ? '<div class="table-wrap"><table class="ledger"><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th class="num">Jumlah</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
      : '<p class="empty">Tidak ada transaksi yang cocok. Ubah kata kunci atau saringan di atas.</p>') +
    '</section>'
  );
}
