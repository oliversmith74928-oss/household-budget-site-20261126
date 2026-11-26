[![Household Budget Site](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![Rank](https://make.fun/badge/best-household-budget-site-20261126-1457/oliversmith74928-oss/household-budget-site-20261126/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![Reward](https://make.fun/badge/best-household-budget-site-20261126-1457/oliversmith74928-oss/household-budget-site-20261126/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)

# Hearth Ledger — a household budget site

Hearth Ledger keeps one household's money in one place. It follows the
fictional Alvarez household — two adults, one child, a rented
three-bedroom on Maple Street — through November 2026: what came in,
what went out, what each category is allowed to cost, what the family
is saving for, and how the month compares with the three before it.

## What it does

- **Dashboard** — the month at a glance: income, spending, what's left,
  and the savings rate; a donut of spending by category; the budgets
  closest to their limit; the six most recent transactions.
- **Transactions** — the full list for the month. Add a transaction,
  edit one, delete one, filter by category, search by description.
  Everything is saved in the browser (localStorage) and survives a reload.
- **Budgets** — a monthly limit per category with a progress bar and a
  remaining amount. Change a limit and it saves immediately.
- **Goals** — four savings goals with progress bars; add money to any
  goal and watch the bar move.
- **Reports** — income vs spending for August–November as a bar chart,
  a category breakdown table, and three things November taught the
  household.

## How to run it

No build step, no network requests, no framework. Serve `app/` with any
static server and open `app/index.html`:

```
cd app && python3 -m http.server
```

Then open http://localhost:8000 — on a desktop or a phone.

## Files

- `app/index.html` — the shell: header, navigation, footer.
- `app/style.css` — the whole look: deep green, cream, terracotta.
- `app/data.js` — the household's figures: categories, budgets, goals,
  November's transactions, past months.
- `app/charts.js` — the donut and bar charts, drawn on canvas by hand.
- `app/views.js` — the five pages.
- `app/main.js` — the hash router, state, and all the wiring (add, edit,
  delete, filter, budget edits, goal contributions).
- `main.ts` — the make.fun hand-in: copies `app/` and `screenshots/`
  to `/output` and writes `dossier.json`.
