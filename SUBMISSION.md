# Submission checklist — DanaRumah

Competition: **best-household-budget-site-20261126-1457**
("Make the best household budget site")
Prize: $50 shared by places 1–10 ($5 each), escrow-funded in USDC on Solana.
Closes: **29 Nov 2026 21:57 WIB** (29 Nov 14:57 UTC). Next blind round:
**27 Nov 15:57 WIB** — submit before then to be judged in round 1.
Auto-submit window: open until 5 Dec 2026 23:59 WIB (her standing order).

## Status: SUBMIT-READY except the items below

The site is built, verified in a real browser, and screenshotted. The
parent still has to do the GitHub + bundle + submit steps (this worker
does not push or submit).

## Parent to-do

1. **Run the kit code the builder could not run** (see BUILD.md "NOT
   run" — the kit CLI output failed an execution-risk check, so the
   builder stopped before executing kit code; the user's go-ahead or
   the parent's own run is needed):
   ```sh
   cd ~/workspace/makefun-household-budget
   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # writes out/dossier.json
   ```
   Inspect `out/dossier.json` (Totals line: first-load bytes/files) and
   confirm it builds cleanly.
2. **Create the public GitHub repo** under `0xsolsepatu` (created after
   the competition opened 26 Nov 2026 21:57 WIB), MIT license, and push
   this workdir's files (text files via the github connector).
   Set the repo About: website `https://make.fun`, topic `makefun`.
   Add `.makefun/owner.json` with `{"wallet": "<address>"}` if the repo
   owner is not the signed-in GitHub account.
3. **Finish README badges**: add the two repo-specific live badges
   (rank.svg, reward.svg) with the real `0xsolsepatu/<repo>` path —
   the generic competition badge is already in README.md.
4. **Upload the 4 screenshots via the browser route** (binary files):
   `screenshots/1-dashboard.jpg` (cover), `2-transactions.jpg`,
   `3-budgets.jpg`, `4-dashboard-phone.jpg`.
5. **Bundle the transcripts** of this session + any subagent sessions
   (`node <kit>/cli/makefun.mjs bundle --repo <workdir> ...`), run the
   pre-submit check:
   ```sh
   node <kit>/cli/makefun.mjs check --kit <kit> --repo <workdir> --transcripts transcripts.tar.gz
   ```
   Fix anything it flags; the entry must pass the transcript gate
   (sessions in-window: this session started after the 26 Nov 21:57 WIB
   opening; all code was written with the write/edit tools in-session).
6. **Submit** (auto-submit is authorized until 5 Dec 2026 23:59 WIB):
   ```sh
   node <kit>/cli/makefun.mjs submit --competition best-household-budget-site-20261126-1457 \
     --repo-url https://github.com/0xsolsepatu/<repo> --commit <sha> \
     --title "DanaRumah — Household Budget Site" \
     --bundle transcripts.tar.gz --keypair /home/hatch/.makefun/keypairs/https_make.fun.json
   ```
   Then `node <kit>/cli/makefun.mjs status --submission <id>` and record
   the submission id in `~/workspace/makefun-watch/seen.json` +
   `scores.json` (blind rounds: no live rank until rounds publish; the
   first round's board appears after 27 Nov 15:57 WIB).

## Verified already (see BUILD.md)

- Seed arithmetic exact for both months; 17/17 store assertions pass;
  all 6 routes render with no `undefined`/`NaN` and no console errors;
  zero external URLs in `app/`; 4 real screenshots visually inspected,
  all within size limits.
- Gemini pre-build + post-build reviews done; all arithmetic re-verified
  by Gemini; its two actionable post-build points applied.
- `vendor/makefun-frontend.ts` sha256 matches kit.json; LICENSE is MIT.
