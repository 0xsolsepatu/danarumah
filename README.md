# DanaRumah — Anggaran Keluarga

[![make.fun](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/0xsolsepatu/danarumah/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/0xsolsepatu/danarumah/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

**DanaRumah** is a household budget site for an Indonesian family — a
working tracker, not a mockup. It runs entirely offline from static files:
no account, no network requests, all data stored in the browser's
localStorage.

## What it does

- **Dashboard** — income, spending, remaining money and savings rate for
  the month, spending by category, tightest budgets, unpaid bills, savings
  goals and recent transactions.
- **Transaksi (Transactions)** — the full ledger (84 seeded transactions
  across October–November 2026). Search, filter by type/category, add,
  edit and delete — the dashboard figures update immediately.
- **Anggaran (Budgets)** — 10 categories with spent-vs-limit progress
  bars, over-budget flags and inline limit editing.
- **Tagihan (Bills)** — the month's fixed payment schedule with due dates,
  paid/unpaid toggles, overdue flags and an add-bill form.
- **Target (Savings goals)** — Dana Darurat, Liburan Keluarga and DP Motor
  Baru with progress, add-funds controls and a new-goal form.
- **Laporan (Reports)** — October vs November comparison, a six-month
  trend chart, a category donut, and plain-language next steps. CSV export
  downloads the month's ledger.

Figures are real and consistent: November 2026 income Rp 12.850.000,
spending Rp 9.412.500, remaining Rp 3.437.500 (27% savings rate). The
household is fictional (Keluarga Prasetyo, Jakarta); every number is
invented demo data.

## Run it

```sh
node serve.ts        # serves app/ on http://localhost:8080
```

Open `app/index.html` in any modern browser, desktop or phone. No build
step, no dependencies.

## Layout

- `app/index.html` — the page shell
- `app/style.css` — the whole design (system fonts only, nothing fetched)
- `app/main.js` — hash router + event handling
- `app/data.js` — seed data (categories, budgets, bills, goals, 84 transactions)
- `app/store.js` — localStorage state, CRUD, monthly figures
- `app/format.js` — Rupiah/date formatting
- `app/charts.js` — hand-drawn SVG charts
- `app/views-*.js` — one view per section
- `main.ts` — the make.fun entrypoint (copies `app/` + `screenshots/` to
  `/output` and writes `dossier.json`)
- `screenshots/` — real headless-Chrome renders of the site
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged

## Entry

Built for the make.fun competition
[best-household-budget-site-20261126-1457](https://make.fun/bounty/best-household-budget-site-20261126-1457)
($50 shared by the top 10, closes 29 Nov 2026 21:57 WIB). See `BUILD.md`
for what was verified and `SUBMISSION.md` for the submit checklist.

## License

MIT — see `LICENSE`.
