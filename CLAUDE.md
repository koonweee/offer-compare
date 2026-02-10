# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start Vite dev server
- `npm run build` — Type-check with `tsc -b` then build with Vite
- `npm run lint` — ESLint across the project
- `npm run test` — Run Vitest (watch mode by default)
- `npx vitest run` — Run tests once without watch
- `npx vitest run src/lib/__tests__/tax.test.ts` — Run a single test file

## Architecture

React 19 + TypeScript SPA using Vite, Tailwind CSS v4, and react-router-dom v7. No backend — all state persists in `localStorage` under the key `salary-compare-state`.

**State management:** `AppProvider` in `src/lib/app-context.tsx` holds all app state via React Context. State is loaded from localStorage on mount and saved on every mutation. The `migrateState()` function in `src/lib/storage.ts` backfills defaults for missing fields when loading older data.

**Routing:** Defined in `src/App.tsx` — `/` (offers list), `/offer/new` and `/offer/:id` (create/edit), `/compare` (side-by-side), `/settings`.

**Tax calculation pipeline:** `src/lib/tax-brackets.ts` contains all tax constants (federal brackets, state brackets, FICA rates, 401k limit) for a specific tax year. `src/lib/tax.ts` has pure calculation functions (`calculateProgressiveTax`, `calculateFICA`, `calculateTaxes`). `src/lib/calculations.ts` composes these into offer-level computations (summaries, EV rows for private companies, year-by-year vesting, deltas vs current offer).

**UI components:** `src/components/ui/` contains shadcn/ui primitives built on Radix UI. App-specific components are in `src/components/`. Path alias `@/` maps to `src/`.

## Key Domain Concepts

- One offer can be marked `isCurrent` — used as the baseline for delta calculations
- `isPrivateCompany` enables EV (expected value) scenarios at 0.75x and 0.5x equity multipliers
- 401k contributions reduce federal/state taxable income but NOT FICA wages
- Tax brackets are for single filer status only; the federal standard deduction is applied to federal taxable income only
- Supported states: CA, NY, WA, TX, FL, MA, CO, GA, IL

## Updating Tax Data

All tax constants live in `src/lib/tax-brackets.ts`. Update yearly — see `README.md` for sources and timing (federal brackets from IRS Rev. Proc., FICA from SSA, 401k limit from IRS Notice, state brackets from individual state DORs).
