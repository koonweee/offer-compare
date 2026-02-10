# Project Overview

`salary-compare` is a React-based single-page application (SPA) designed to help users compare job offers by calculating after-tax compensation. It accounts for Federal, State, and FICA taxes, as well as 401(k) contributions and equity vesting.

## Key Technologies

-   **Framework:** React 19 + Vite 7
-   **Language:** TypeScript 5
-   **Styling:** Tailwind CSS 4
-   **UI Components:** Radix UI primitives (likely shadcn/ui pattern) + Lucide React icons
-   **Routing:** React Router DOM 7
-   **State Management:** Context API (`src/lib/app-context.tsx`)
-   **Testing:** Vitest

## Architecture

-   **Entry Point:** `src/main.tsx` mounts `src/App.tsx`.
-   **Routing:** Configured in `src/App.tsx`.
    -   `/`: List of offers (`OffersPage`)
    -   `/offer/new` & `/offer/:id`: Create/Edit offer (`OfferFormPage`)
    -   `/compare`: Comparison view (`ComparePage`)
    -   `/settings`: Global settings like tax state (`SettingsPage`)
-   **Data Model:** defined in `src/lib/types.ts`. Key interfaces: `Offer`, `Settings`, `AppState`.
-   **Business Logic:**
    -   `src/lib/calculations.ts`: Core logic for computing annual/monthly values, equity amortization, and comparisons.
    -   `src/lib/tax.ts` & `src/lib/tax-brackets.ts`: Tax calculation engines and bracket data.

## Building and Running

*   **Install Dependencies:** `npm install`
*   **Dev Server:** `npm run dev` (runs Vite)
*   **Build:** `npm run build` (runs `tsc` then `vite build`)
*   **Test:** `npm run test` (runs Vitest)
*   **Lint:** `npm run lint`

## Development Conventions

-   **Styling:** Utility-first using Tailwind CSS.
-   **Components:** Located in `src/components`. UI primitives (buttons, inputs) are in `src/components/ui`.
-   **State:** The application uses a global context (`AppProvider`) to manage offers and settings, likely persisted to `localStorage` (implied by `src/lib/storage.ts`).
-   **Tax Updates:** Tax data in `src/lib/tax-brackets.ts` must be updated manually each year (see `README.md` for sources/schedule).

## Key Files to Know

-   `src/lib/tax-brackets.ts`: **CRITICAL**. Contains all tax rates and brackets. Needs annual updates.
-   `src/lib/calculations.ts`: Logic for "Annualized Equity", "Take Home Pay", and "EV" (Expected Value) scenarios.
-   `src/components/offer-form.tsx`: Complex form for entering offer details including vesting schedules.
-   `src/lib/app-context.tsx`: Global state logic.
