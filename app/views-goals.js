// Savings-goals view: each goal with a progress bar, an add-funds form,
// and a new-goal form. Adding funds caps at the target and shows a
// completion note when a goal is reached.
import { fmtIDR, pct } from './format.js';
import * as store from './store.js';

export function goals() {
  const state = store.load();
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);

  const cards = state.goals.map((g) => {
    const p = pct(g.saved, g.target);
    const done = g.saved >= g.target;
    return (
      '<article class="card goal-card">' +
      '<header><span class="goal-icon" style="background:' + g.color + '">◎</span>' +
      '<div><h3>' + g.name + '</h3><p>' + g.detail + '</p></div>' +
      '<span class="goal-pct">' + p + '%</span></header>' +
      '<div class="budget-figures"><strong>' + fmtIDR(g.saved) + '</strong><span>dari target ' + fmtIDR(g.target) + '</span></div>' +
      '<div class="progress tall"><div class="progress-fill" style="width:' + Math.min(100, p) + '%;background:' + g.color + '"></div></div>' +
      '<p class="budget-left">' + (done
        ? '🎉 Target tercapai! Dana sudah siap dipakai.'
        : 'Kurang <strong>' + fmtIDR(g.target - g.saved) + '</strong> lagi. Menabung ' + fmtIDR(Math.ceil((g.target - g.saved) / 6)) + ' per bulan tercapai dalam 6 bulan.') + '</p>' +
      (done
        ? '<p class="goal-done-note">Target ini sudah penuh — tambah dana tidak lagi diperlukan.</p>'
        : '<form class="fund-form" data-goal="' + g.id + '">' +
          '<label>Tambah dana <input type="number" name="amount" min="1000" step="10000" placeholder="250000" required aria-label="Tambah dana ' + g.name + '"></label>' +
          '<button class="btn small primary" type="submit">Tambah</button>' +
          '</form>') + '</article>'
    );
  }).join('');

  return (
    '<section class="page-head">' +
    '<h1>Target Tabungan</h1>' +
    '<p>Total terkumpul <strong>' + fmtIDR(totalSaved) + '</strong> dari target <strong>' + fmtIDR(totalTarget) + '</strong> (' + pct(totalSaved, totalTarget) + '%). Sisihkan dulu di awal bulan, sebelum belanja — bukan dari sisa.</p>' +
    '</section>' +
    '<div class="goal-grid">' + cards + '</div>' +
    '<section class="card form-card"><h2>＋ Buat target baru</h2>' +
    '<form id="goal-form"><div class="form-grid">' +
    '<label>Nama target<input type="text" name="name" required maxlength="60" placeholder="cth: Biaya masuk SMP"></label>' +
    '<label>Target (Rp)<input type="number" name="target" required min="10000" step="10000" placeholder="5000000"></label>' +
    '<label>Sudah terkumpul (Rp)<input type="number" name="saved" min="0" step="10000" value="0"></label>' +
    '<label>Keterangan<input type="text" name="detail" maxlength="100" placeholder="cth: Untuk tahun ajaran baru"></label>' +
    '</div><div class="form-actions"><button class="btn primary" type="submit">Simpan target</button></div></form></section>' +
    '<section class="card tip-card"><h2>Aturan tabungan keluarga ini</h2>' +
    '<p><strong>Bayar diri sendiri dulu:</strong> begitu gaji masuk tanggal 1, pindahkan 20% ke Dana Darurat sebelum uang belanja disentuh. Dana Darurat hanya dipakai untuk hal yang tidak terduga — bukan untuk promo atau jajan. Liburan dan DP motor ditabung terpisah supaya tidak tercampur.</p></section>'
  );
}
