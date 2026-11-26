// Seed data for DanaRumah: a fictional Indonesian household, Keluarga
// Prasetyo (Budi & Sari, two school-age children), in Jakarta. Every figure
// is invented for this demo; nothing is copied from a real budget or a
// real person's accounts. November 2026 is the full month; October 2026 is
// the comparison month. Totals are checked by the tests in BUILD.md:
//   Nov income Rp 12.850.000, Nov spending Rp 9.412.500, left Rp 3.437.500
//   Oct income Rp 12.650.000, Oct spending Rp 9.860.000, left Rp 2.790.000

export const CATEGORIES = [
  { id: 'belanja', name: 'Belanja Harian', en: 'Groceries', color: '#0f766e', icon: '🛒' },
  { id: 'listrik', name: 'Listrik', en: 'Electricity', color: '#d97706', icon: '💡' },
  { id: 'air', name: 'Air & Gas', en: 'Water & Gas', color: '#0284c7', icon: '💧' },
  { id: 'internet', name: 'Internet & HP', en: 'Internet & Phone', color: '#7c3aed', icon: '📶' },
  { id: 'transport', name: 'Transport', en: 'Transport', color: '#dc2626', icon: '🛵' },
  { id: 'sekolah', name: 'Sekolah Anak', en: 'School', color: '#059669', icon: '🎒' },
  { id: 'makan', name: 'Makan di Luar', en: 'Eating Out', color: '#ea580c', icon: '🍜' },
  { id: 'kesehatan', name: 'Kesehatan', en: 'Health', color: '#db2777', icon: '🩺' },
  { id: 'hiburan', name: 'Hiburan', en: 'Entertainment', color: '#4f46e5', icon: '🎬' },
  { id: 'rumah', name: 'Rumah Tangga', en: 'Household', color: '#65a30d', icon: '🏠' },
];

export const categoryById = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

// Display label for a transaction's category: income rows are "Pemasukan",
// expenses show their category name.
export function categoryLabel(tx) {
  if (tx.type === 'income') return 'Pemasukan · Income';
  return categoryById(tx.category).name + ' · ' + categoryById(tx.category).en;
}

// Monthly budget limits (same plan for both seeded months).
export const BUDGETS = {
  belanja: 2800000,
  listrik: 650000,
  air: 350000,
  internet: 550000,
  transport: 900000,
  sekolah: 1500000,
  makan: 800000,
  kesehatan: 800000,
  hiburan: 400000,
  rumah: 750000,
};

// Recurring monthly bills. `day` is the day of the month it falls due.
export const BILLS = [
  { id: 'bill-internet', name: 'IndiHome Internet', detail: 'Internet rumah 50 Mbps', category: 'internet', amount: 385000, day: 1 },
  { id: 'bill-spp1', name: 'SPP Anak 1 (Dimas)', detail: 'Sekolah dasar, kelas 4', category: 'sekolah', amount: 750000, day: 2 },
  { id: 'bill-spp2', name: 'SPP Anak 2 (Nadia)', detail: 'Sekolah dasar, kelas 1', category: 'sekolah', amount: 450000, day: 2 },
  { id: 'bill-listrik', name: 'Token Listrik PLN', detail: 'Token prabayar 1300 VA', category: 'listrik', amount: 425000, day: 5 },
  { id: 'bill-streaming', name: 'Langganan Streaming', detail: 'Paket keluarga, film & musik', category: 'hiburan', amount: 54000, day: 5 },
  { id: 'bill-pdam', name: 'PDAM Air', detail: 'Air bersih bulanan', category: 'air', amount: 185000, day: 10 },
  { id: 'bill-rt', name: 'Iuran RT & Kebersihan', detail: 'Iuran warga + sampah', category: 'rumah', amount: 75000, day: 15 },
  { id: 'bill-les', name: 'Les Renang Anak', detail: '4x pertemuan per bulan', category: 'sekolah', amount: 200000, day: 16 },
  { id: 'bill-asuransi', name: 'Asuransi Kesehatan', detail: 'Premi keluarga', category: 'kesehatan', amount: 320000, day: 20 },
  { id: 'bill-motor', name: 'Cicilan Motor', detail: 'Angsuran ke-14 dari 35', category: 'transport', amount: 850000, day: 28 },
];

// Savings goals.
export const GOALS = [
  { id: 'goal-darurat', name: 'Dana Darurat', detail: '6x pengeluaran bulanan, untuk keadaan tak terduga', target: 20000000, saved: 12400000, color: '#0f766e' },
  { id: 'goal-liburan', name: 'Liburan Keluarga', detail: 'Liburan akhir tahun ke Yogyakarta', target: 8000000, saved: 3250000, color: '#0284c7' },
  { id: 'goal-motor', name: 'DP Motor Baru', detail: 'Ganti motor lama yang sudah 9 tahun', target: 15000000, saved: 3450000, color: '#d97706' },
];

// Which bills were already paid in each seeded month (Nov: RT fee and the
// motor instalment are still unpaid; Oct: everything settled).
export const BILLS_PAID = {
  '2026-11': {
    'bill-internet': true, 'bill-spp1': true, 'bill-spp2': true,
    'bill-listrik': true, 'bill-streaming': true, 'bill-pdam': true,
    'bill-rt': false, 'bill-les': true, 'bill-asuransi': true, 'bill-motor': false,
  },
  '2026-10': {
    'bill-internet': true, 'bill-spp1': true, 'bill-spp2': true,
    'bill-listrik': true, 'bill-streaming': true, 'bill-pdam': true,
    'bill-rt': true, 'bill-les': true, 'bill-asuransi': true, 'bill-motor': true,
  },
};

// November 2026 transactions. Expenses sum to Rp 9.412.500,
// income sums to Rp 12.850.000.
export const TX_NOV_2026 = [
  { id: 'n01', date: '2026-11-01', desc: 'Gaji Budi (kantor)', category: 'pendapatan', amount: 9500000, type: 'income' },
  { id: 'n02', date: '2026-11-01', desc: 'Gaji Sari (guru les)', category: 'pendapatan', amount: 2800000, type: 'income' },
  { id: 'n03', date: '2026-11-01', desc: 'IndiHome Internet', category: 'internet', amount: 385000, type: 'expense' },
  { id: 'n04', date: '2026-11-01', desc: 'Pasar tradisional', category: 'belanja', amount: 185000, type: 'expense' },
  { id: 'n05', date: '2026-11-02', desc: 'SPP Anak 1 (Dimas)', category: 'sekolah', amount: 750000, type: 'expense' },
  { id: 'n06', date: '2026-11-02', desc: 'SPP Anak 2 (Nadia)', category: 'sekolah', amount: 450000, type: 'expense' },
  { id: 'n07', date: '2026-11-02', desc: 'PDAM air bersih', category: 'air', amount: 185000, type: 'expense' },
  { id: 'n08', date: '2026-11-03', desc: 'Supermarket mingguan', category: 'belanja', amount: 412500, type: 'expense' },
  { id: 'n09', date: '2026-11-03', desc: 'BBM Pertalite', category: 'transport', amount: 150000, type: 'expense' },
  { id: 'n10', date: '2026-11-04', desc: 'Makan keluarga di luar', category: 'makan', amount: 185000, type: 'expense' },
  { id: 'n11', date: '2026-11-05', desc: 'Token listrik PLN', category: 'listrik', amount: 425000, type: 'expense' },
  { id: 'n12', date: '2026-11-05', desc: 'Langganan streaming', category: 'hiburan', amount: 54000, type: 'expense' },
  { id: 'n13', date: '2026-11-06', desc: 'Sayur & buah pasar', category: 'belanja', amount: 96000, type: 'expense' },
  { id: 'n14', date: '2026-11-06', desc: 'Ojek online', category: 'transport', amount: 48000, type: 'expense' },
  { id: 'n15', date: '2026-11-07', desc: 'Sabun & deterjen', category: 'rumah', amount: 132000, type: 'expense' },
  { id: 'n16', date: '2026-11-07', desc: 'Pulsa Sari', category: 'internet', amount: 75000, type: 'expense' },
  { id: 'n17', date: '2026-11-08', desc: 'Supermarket mingguan', category: 'belanja', amount: 385000, type: 'expense' },
  { id: 'n18', date: '2026-11-08', desc: 'Obat flu anak', category: 'kesehatan', amount: 78000, type: 'expense' },
  { id: 'n19', date: '2026-11-09', desc: 'Buku & alat tulis', category: 'sekolah', amount: 125000, type: 'expense' },
  { id: 'n20', date: '2026-11-10', desc: 'Pasar tradisional', category: 'belanja', amount: 172500, type: 'expense' },
  { id: 'n21', date: '2026-11-10', desc: 'BBM Pertalite', category: 'transport', amount: 150000, type: 'expense' },
  { id: 'n22', date: '2026-11-11', desc: 'Bakso & es teh', category: 'makan', amount: 96000, type: 'expense' },
  { id: 'n23', date: '2026-11-12', desc: 'Gas LPG 3 kg x2', category: 'air', amount: 52000, type: 'expense' },
  { id: 'n24', date: '2026-11-12', desc: 'Bioskop keluarga', category: 'hiburan', amount: 180000, type: 'expense' },
  { id: 'n25', date: '2026-11-13', desc: 'Sayur & buah pasar', category: 'belanja', amount: 88000, type: 'expense' },
  { id: 'n26', date: '2026-11-13', desc: 'Parkir & tol', category: 'transport', amount: 86500, type: 'expense' },
  { id: 'n27', date: '2026-11-14', desc: 'Perbaiki kran bocor', category: 'rumah', amount: 175000, type: 'expense' },
  { id: 'n28', date: '2026-11-14', desc: 'Pulsa Budi', category: 'internet', amount: 100000, type: 'expense' },
  { id: 'n29', date: '2026-11-15', desc: 'Usaha sampingan (kue)', category: 'pendapatan', amount: 550000, type: 'income' },
  { id: 'n30', date: '2026-11-15', desc: 'Supermarket mingguan', category: 'belanja', amount: 421000, type: 'expense' },
  { id: 'n31', date: '2026-11-15', desc: 'Vitamin keluarga', category: 'kesehatan', amount: 145000, type: 'expense' },
  { id: 'n32', date: '2026-11-16', desc: 'Les renang anak', category: 'sekolah', amount: 200000, type: 'expense' },
  { id: 'n33', date: '2026-11-17', desc: 'Pasar tradisional', category: 'belanja', amount: 165000, type: 'expense' },
  { id: 'n34', date: '2026-11-17', desc: 'BBM Pertalite', category: 'transport', amount: 150000, type: 'expense' },
  { id: 'n35', date: '2026-11-18', desc: 'Makan keluarga di luar', category: 'makan', amount: 210000, type: 'expense' },
  { id: 'n36', date: '2026-11-19', desc: 'Token listrik PLN', category: 'listrik', amount: 200000, type: 'expense' },
  { id: 'n37', date: '2026-11-19', desc: 'Mainan anak', category: 'hiburan', amount: 95000, type: 'expense' },
  { id: 'n38', date: '2026-11-20', desc: 'Supermarket mingguan', category: 'belanja', amount: 398000, type: 'expense' },
  { id: 'n39', date: '2026-11-20', desc: 'Ojek online', category: 'transport', amount: 52000, type: 'expense' },
  { id: 'n40', date: '2026-11-21', desc: 'Peralatan dapur', category: 'rumah', amount: 210000, type: 'expense' },
  { id: 'n41', date: '2026-11-21', desc: 'Cek kesehatan Sari', category: 'kesehatan', amount: 300000, type: 'expense' },
  { id: 'n42', date: '2026-11-22', desc: 'Sayur & buah pasar', category: 'belanja', amount: 92000, type: 'expense' },
  { id: 'n43', date: '2026-11-22', desc: 'Dokter gigi anak', category: 'kesehatan', amount: 250000, type: 'expense' },
  { id: 'n44', date: '2026-11-23', desc: 'Stok beras & minyak', category: 'belanja', amount: 250000, type: 'expense' },
  { id: 'n45', date: '2026-11-24', desc: 'Pasar tradisional', category: 'belanja', amount: 158000, type: 'expense' },
  { id: 'n46', date: '2026-11-24', desc: 'Galon air x4', category: 'air', amount: 84000, type: 'expense' },
  { id: 'n47', date: '2026-11-24', desc: 'BBM Pertalite', category: 'transport', amount: 150000, type: 'expense' },
  { id: 'n48', date: '2026-11-25', desc: 'Jajan anak sekolah', category: 'makan', amount: 64000, type: 'expense' },
  { id: 'n49', date: '2026-11-25', desc: 'Ganti lampu & stopkontak', category: 'rumah', amount: 221000, type: 'expense' },
  { id: 'n50', date: '2026-11-26', desc: 'Supermarket mingguan', category: 'belanja', amount: 377000, type: 'expense' },
];

// October 2026 transactions. Expenses sum to Rp 9.860.000,
// income sums to Rp 12.650.000.
export const TX_OCT_2026 = [
  { id: 'o01', date: '2026-10-01', desc: 'Gaji Budi (kantor)', category: 'pendapatan', amount: 9500000, type: 'income' },
  { id: 'o02', date: '2026-10-01', desc: 'Gaji Sari (guru les)', category: 'pendapatan', amount: 2600000, type: 'income' },
  { id: 'o03', date: '2026-10-01', desc: 'IndiHome Internet', category: 'internet', amount: 385000, type: 'expense' },
  { id: 'o04', date: '2026-10-02', desc: 'SPP Anak 1 (Dimas)', category: 'sekolah', amount: 750000, type: 'expense' },
  { id: 'o05', date: '2026-10-02', desc: 'SPP Anak 2 (Nadia)', category: 'sekolah', amount: 450000, type: 'expense' },
  { id: 'o06', date: '2026-10-03', desc: 'Supermarket mingguan', category: 'belanja', amount: 620000, type: 'expense' },
  { id: 'o07', date: '2026-10-03', desc: 'BBM Pertalite', category: 'transport', amount: 150000, type: 'expense' },
  { id: 'o08', date: '2026-10-05', desc: 'Token listrik PLN', category: 'listrik', amount: 410000, type: 'expense' },
  { id: 'o09', date: '2026-10-05', desc: 'Langganan streaming', category: 'hiburan', amount: 54000, type: 'expense' },
  { id: 'o10', date: '2026-10-07', desc: 'PDAM air bersih', category: 'air', amount: 178000, type: 'expense' },
  { id: 'o11', date: '2026-10-08', desc: 'Makan keluarga di luar', category: 'makan', amount: 220000, type: 'expense' },
  { id: 'o12', date: '2026-10-10', desc: 'Supermarket mingguan', category: 'belanja', amount: 580000, type: 'expense' },
  { id: 'o13', date: '2026-10-10', desc: 'Service AC rumah', category: 'rumah', amount: 890000, type: 'expense' },
  { id: 'o14', date: '2026-10-12', desc: 'Cek kesehatan tahunan', category: 'kesehatan', amount: 420000, type: 'expense' },
  { id: 'o15', date: '2026-10-14', desc: 'Pulsa Sari', category: 'internet', amount: 85000, type: 'expense' },
  { id: 'o16', date: '2026-10-15', desc: 'Usaha sampingan (kue)', category: 'pendapatan', amount: 550000, type: 'income' },
  { id: 'o17', date: '2026-10-15', desc: 'Supermarket mingguan', category: 'belanja', amount: 640000, type: 'expense' },
  { id: 'o18', date: '2026-10-16', desc: 'Les renang anak', category: 'sekolah', amount: 250000, type: 'expense' },
  { id: 'o19', date: '2026-10-17', desc: 'BBM Pertalite', category: 'transport', amount: 150000, type: 'expense' },
  { id: 'o20', date: '2026-10-18', desc: 'Bioskop keluarga', category: 'hiburan', amount: 240000, type: 'expense' },
  { id: 'o21', date: '2026-10-19', desc: 'Token listrik PLN', category: 'listrik', amount: 200000, type: 'expense' },
  { id: 'o22', date: '2026-10-20', desc: 'Makan keluarga di luar', category: 'makan', amount: 145000, type: 'expense' },
  { id: 'o23', date: '2026-10-21', desc: 'Gas LPG 3 kg x2', category: 'air', amount: 48000, type: 'expense' },
  { id: 'o24', date: '2026-10-22', desc: 'Supermarket mingguan', category: 'belanja', amount: 590000, type: 'expense' },
  { id: 'o25', date: '2026-10-23', desc: 'Obat & vitamin', category: 'kesehatan', amount: 270000, type: 'expense' },
  { id: 'o26', date: '2026-10-24', desc: 'BBM Pertalite', category: 'transport', amount: 150000, type: 'expense' },
  { id: 'o27', date: '2026-10-25', desc: 'Supermarket mingguan', category: 'belanja', amount: 620000, type: 'expense' },
  { id: 'o28', date: '2026-10-26', desc: 'Service motor berkala', category: 'transport', amount: 300000, type: 'expense' },
  { id: 'o29', date: '2026-10-27', desc: 'Makan keluarga di luar', category: 'makan', amount: 320000, type: 'expense' },
  { id: 'o30', date: '2026-10-28', desc: 'Mainan & buku anak', category: 'hiburan', amount: 186000, type: 'expense' },
  { id: 'o31', date: '2026-10-29', desc: 'Galon air x4', category: 'air', amount: 72000, type: 'expense' },
  { id: 'o32', date: '2026-10-30', desc: 'Pulsa Budi', category: 'internet', amount: 75000, type: 'expense' },
  { id: 'o33', date: '2026-10-31', desc: 'Peralatan rumah', category: 'rumah', amount: 350000, type: 'expense' },
  { id: 'o34', date: '2026-10-31', desc: 'Ojek online', category: 'transport', amount: 62000, type: 'expense' },
];

// Six-month spending trend used by the Reports view (Jun–Nov 2026).
export const TREND = [
  { month: '2026-06', label: 'Jun', income: 12400000, spent: 9120000 },
  { month: '2026-07', label: 'Jul', income: 12500000, spent: 9480000 },
  { month: '2026-08', label: 'Agu', income: 12650000, spent: 9210000 },
  { month: '2026-09', label: 'Sep', income: 12650000, spent: 9640000 },
  { month: '2026-10', label: 'Okt', income: 12650000, spent: 9860000 },
  { month: '2026-11', label: 'Nov', income: 12850000, spent: 9412500 },
];

export const SEED = {
  months: { '2026-11': TX_NOV_2026, '2026-10': TX_OCT_2026 },
  budgets: BUDGETS,
  bills: BILLS,
  billsPaid: BILLS_PAID,
  goals: GOALS,
};
