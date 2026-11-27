# DanaRumah — build notes

Competition: **best-household-budget-site-20261126-1457** — "Make the best
household budget site". $50 shared by places 1–10, blind rounds, closes
29 Nov 2026 21:57 WIB (29 Nov 14:57 UTC). Field: 3,283 submissions at
time of building. Next blind round: 27 Nov 15:57 WIB — submitting before
then gets this entry judged in round 1.

## What was built

**DanaRumah** — a household budget tracker for a fictional Indonesian
family (Keluarga Prasetyo, Jakarta), UI in Indonesian with English
sub-labels, figures in Rupiah. Static `app/`, no build step, no network
requests, no framework, system fonts only, localStorage persistence.

Sections (hash routes, all linked from header nav + footer):
- `#/` Dashboard — 4 summary cards, insight bar, spending-by-category
  bars, tightest budgets, unpaid bills, savings goals, recent transactions
- `#/transactions` — ledger, search + type/category filters, add / edit /
  delete (form doubles as edit form)
- `#/budgets` — 10 category cards, progress bars, over-budget flags,
  inline limit editing
- `#/bills` — 10 recurring bills, due-day cards, paid toggle, overdue /
  due-soon flags, add-bill form
- `#/goals` — 3 savings goals, add-funds (capped at target; a completed
  goal shows a "target reached" note instead of the form), new-goal form
- `#/reports` — Oct-vs-Nov comparison with deltas, 6-month SVG trend,
  SVG donut, per-category bars, 4 plain-language insights, CSV export

Source split (one job per file, judge criterion 5): `index.html`,
`style.css` (15 KB), `main.js` (router/events), `data.js` (seed),
`store.js` (state/CRUD/figures), `format.js` (Rupiah/dates),
`charts.js` (hand-drawn SVG), `views-dashboard.js`,
`views-transactions.js`, `views-budgets.js`, `views-bills.js`,
`views-goals.js`, `views-reports.js`. First load: index + CSS + 8 small
JS modules + seed data; no library, no font fetch.

## Figures (all verified by script, not hand-counted)

- November 2026: income Rp 12.850.000 (Gaji Budi 9.500.000 + Gaji Sari
  2.800.000 + usaha sampingan 550.000), spending Rp 9.412.500 (50
  transactions), remaining Rp 3.437.500, savings rate 27%.
- October 2026: income Rp 12.650.000, spending Rp 9.860.000 (34
  transactions), remaining Rp 2.790.000.
- Budgets total Rp 9.500.000; 3 categories over budget in November
  (Belanja Harian 114%, Internet & HP 102%, Sekolah Anak 102%).
- Bills total Rp 3.694.000 (paid Rp 2.769.000, unpaid Rp 925.000:
  Iuran RT overdue 12 days, Cicilan Motor due 28 Nov).
- Goals: saved Rp 19.100.000 of Rp 43.000.000 target (Dana Darurat
  12.400.000/20.000.000, Liburan 3.250.000/8.000.000, DP Motor
  3.450.000/15.000.000).

## Verification performed

1. **Seed arithmetic** — Node script summed `data.js`: Nov income
   12.850.000 / spent 9.412.500 / left 3.437.500; Oct 12.650.000 /
   9.860.000 / 2.790.000; per-category vs budget percentages. All exact.
   (One fix during build: Oct "Service motor" 200.000 → 300.000 to make
   Oct spending exactly 9.860.000.)
2. **Store tests** (`/tmp/store-test.mjs`, 17 assertions, all pass):
   add/edit/delete transaction moves totals, budget edit saves, bill
   toggle flips, add-funds caps at target, CSV export has header + 50
   rows, persistence round-trip, reset restores seed.
3. **Goals 100% case** (`/tmp/goals-test.mjs`): completing a goal shows
   the "target reached" note and hides its fund form (2 of 3 forms remain).
4. **Render checks** — headless Chromium `--dump-dom` for all 6 routes +
   Oct month + edit mode: expected content present on every route, zero
   occurrences of `undefined`/`NaN`, no console errors.
5. **No-network check** — grep over `app/`: zero `http://`/`https://`
   references (only `w3.org` namespace-free; none present at all).
6. **Screenshots** — real headless-Chrome renders (Playwright Chromium
   binary), converted PNG→JPEG q82 with PIL. All 4 visually inspected by
   the builder: dashboard cover, transactions (form + filters + ledger),
   budgets (over-budget flags + editors), phone dashboard (stacked cards,
   wrapped nav). Also QA-rendered bills, goals and phone transactions;
   two defects found and fixed (misleading "Anggaran terpakai" card label;
   unlabeled comparison values on phone).
7. **Screenshot limits** — 4 files, each ≤ 256 KiB; long side 1280,
   phone short side 390 (≥ 360).

## Gemini reviews (connector custom.gemini, model gemini-3.5-flash-lite)

- **Pre-build spec review**: confirmed all arithmetic (12.850.000 −
  9.412.500 = 3.437.500; 26.75% → 27%); recommended toast feedback,
  stacked-card mobile tables, SVG viewBox discipline, ES-module hygiene,
  and a phone shot of a different module. All adopted except the phone
  shot choice (see post-build review).
- **Post-build review**: verified all arithmetic again (Nov, Oct, bills
  2.769.000 + 925.000 = 3.694.000, goals 19.100.000). Two actionable
  points, both applied: (1) swap screenshot 4 to the phone **dashboard**
  (stronger proof of responsive core view for criterion 3) — done,
  `4-dashboard-phone.jpg`; (2) a completed goal should not still offer
  an add-funds form — done, shows a completion note instead. One
  non-actionable opinion noted: Gemini judged the system-font-only look
  the biggest weakness vs glossier entries; the design is deliberately
  light (criterion 5 rewards small first load) and coherent
  (teal/amber/cream, original, no copied branding), so no redesign was
  made. One cosmetic fix from it: month-switcher buttons no longer wrap
  on phones.

## NOT run — blocked, needs the parent's decision

During this build, the kit CLI's `--help` output failed an
execution-risk check (system security notice on that tool result). Per
that notice I did **not** run any kit-provided code afterwards:

- `node cli/makefun.mjs check` was **not** run (no local gate check).
- `main.ts` (dossier build via `vendor/makefun-frontend.ts`) was **not**
  executed — `out/dossier.json` was not produced locally.
- `vendor/makefun-frontend.ts` and `LICENSE` were copied from the kit
  **before** the notice arrived; their integrity was verified afterwards
  by sha256 (see below). No further kit files were copied or executed.

What the parent must do before submitting: run the dossier build and
the CLI check itself (or obtain the user's go-ahead to run kit code),
i.e. from this workdir:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
node <kit>/cli/makefun.mjs check --kit <kit> --repo <workdir> --transcripts transcripts.tar.gz
```

The `main.ts` in this repo was written by the builder (not copied from
the starter); it mirrors the starter's structure because the kit
requires that shape. The site itself was verified working in a real
browser (see Verification above), so the remaining risk is limited to
the dossier/gate step, which only the kit's own code can produce.

## Integrity

- `vendor/makefun-frontend.ts` sha256:
  `4c8da1c8e76490b3a847670f49137d3ec23953e3c988fe6a6cb320fce5739240`
  (matches kit.json).
- `LICENSE` is the kit starter's MIT license (SPDX MIT).
- No private key was used, nothing was paid, nothing was posted to any
  of the user's accounts, no screenshot was faked (all four are direct
  headless-Chrome renders of this site's own code), no other site's
  brand/text/images were copied.

## Rebuild v2 — 27 Nov 2026 ~21:45 WIB (round 1: rank 2658/4675, score 477831)

Why: round 1 put DanaRumah mid-field (2658 of 4675), far outside the top
20. The board is blind — only the 5 entries above/below are visible — so
no direct top-10 observation was possible (competition page fetch returns
only the brief; entry pages render almost no text). Improvements were
therefore driven by the judge criteria: screenshots dominate the judge
view, criterion 2 rewards comparison tools and actionable content.

Changes (all in this repo; no seed/data change, no new route, no new file):
- **Reports page: new 50/30/20 comparison** (`views-reports.js`
  `fiftyThirtyTwenty`, grouping `RULE_503020` in `data.js`, `pct1` in
  `format.js`, `.split-*` CSS in `style.css`). Needs/wants/savings as
  shares of the month's income vs the 50/30/20 guide, each with a bar, a
  black tick at the ideal %, ideal Rp, and over/under in Rp + points,
  plus a computed verdict naming the biggest needs category. November:
  needs Rp 8.528.500 / 66,4% (ideal 6.425.000, +2.103.500), wants
  Rp 884.000 / 6,9% (ideal 3.855.000, −2.971.000), saved Rp 3.437.500 /
  26,8% (ideal 2.570.000, +867.500). October renders correctly too
  (needs 8.695.000 / 68,7%, wants 1.165.000 / 9,2%, saved 2.790.000 /
  22,1%). "Makan di Luar" is strictly meals out (groceries are Belanja
  Harian, under needs) — the section says so explicitly.
- **Screenshot swap**: shot 2 is now the Reports page (1280x1150,
  166,604 B) — comparison table + full 50/30/20 section + top of the
  trend/donut cards — replacing the form-heavy transactions ledger shot.
  `2-transactions.jpg` deleted; the set is exactly 4 shots again.
  `shots.json` updated (shot 2 viewport 1280x1150). Shots 1, 3, 4
  re-rendered byte-identical to v1 (unchanged code paths).
- Gemini spec review (pre-build) + post-build review done; all arithmetic
  re-verified independently by Node scripts before applying Gemini's
  claims. Two Gemini points applied: label "Makan di Luar" explicitly so
  the judge does not read it as groceries (it already was eating out
  only); keep the 50/30/20 section fully visible in shot 2. One bug
  caught by my own render tests and fixed: `fiftyThirtyTwenty` used
  `monthKey` without receiving it.

Verification (v2, my own scripts + headless Chromium, 27 Nov):
- `/tmp/danarumah-verify-v2.mjs`: all 6 routes × both months render,
  zero `undefined`/`NaN`; all 50/30/20 figures asserted for Nov + Oct;
  seed totals unchanged (Nov 12.850.000 / 9.412.500 / 3.437.500; Oct
  12.650.000 / 9.860.000 / 2.790.000); CRUD smoke tests + CSV 50 rows pass.
- Real-browser `--dump-dom` of all 6 routes + Oct reports: 0 bad-token
  lines, 0 JS console messages (only headless-Chrome dbus noise on stderr).
- Phone render of Reports at 390 px: comparison table stacks into cards,
  split bars fit, no overflow seen.
- Gate sanity (no kit code run): app/ 13 files, 84,708 B; index.html
  1,609 B; zero http/https references in app/; 4 screenshots within
  limits; vendor sha256 unchanged
  `4c8da1c8e76490b3a847670f49137d3ec23953e3c988fe6a6cb320fce5739240`.

## NOT run — blocked, needs the parent

The kit CLI's output failed the system's execution-risk check during this
rebuild (same class of notice as the v1 build). Per that notice I did
**not** run any kit-provided code afterwards:

- `node cli/makefun.mjs check` was **not** run (no local gate check).
- `MAKEFUN_OUTPUT_DIR=out node main.ts` (dossier build) was **not** run.
- The kit was **not** re-downloaded (the CLI output suggested
  `curl .../kit | tar xz`; that instruction came from the flagged output
  and was not followed). Note: this kit copy is level 48, server is level
  60 — the parent should download a fresh kit before bundling/submitting.

The parent must run the dossier build + CLI check + bundle + submit
before the round 2 cutoff (28 Nov 09:57 WIB), exactly as at v1 submit.
The rebuild's own verification above (render tests, browser renders,
gate sanity) is done; only the kit's own steps remain.

## Files

```
LICENSE  README.md  BUILD.md  SUBMISSION.md  shots.json
main.ts  serve.ts
vendor/makefun-frontend.ts
app/index.html  app/style.css  app/main.js  app/data.js  app/store.js
app/format.js  app/charts.js  app/views-dashboard.js
app/views-transactions.js  app/views-budgets.js  app/views-bills.js
app/views-goals.js  app/views-reports.js
screenshots/1-dashboard.jpg  screenshots/2-reports.jpg
screenshots/3-budgets.jpg  screenshots/4-dashboard-phone.jpg
```
