// Rupiah formatting helpers. Everything is plain string building so the
// output is identical in every browser, with no locale-data dependency.
export function fmtIDR(n) {
  const neg = n < 0;
  const abs = Math.abs(Math.round(n));
  const grouped = String(abs).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (neg ? '-Rp ' : 'Rp ') + grouped;
}

// Short form for chart labels: 3.200.000 -> "Rp 3,2 jt", 625.000 -> "Rp 625 rb".
export function fmtShort(n) {
  if (Math.abs(n) >= 1000000) {
    const v = n / 1000000;
    const s = (Math.round(v * 10) / 10).toString().replace('.', ',');
    return 'Rp ' + s + ' jt';
  }
  if (Math.abs(n) >= 1000) {
    return 'Rp ' + Math.round(n / 1000) + ' rb';
  }
  return fmtIDR(n);
}

// "2026-11-15" -> "15 Nov 2026".
const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
export function fmtDate(iso) {
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  return Number(parts[2]) + ' ' + MONTHS_ID[Number(parts[1]) - 1] + ' ' + parts[0];
}

// "2026-11" -> "November 2026".
const MONTHS_LONG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
export function fmtMonth(key) {
  const parts = key.split('-');
  return MONTHS_LONG[Number(parts[1]) - 1] + ' ' + parts[0];
}

export function pct(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}
