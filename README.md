# Offer Compare

A tool for comparing job offers with after-tax compensation calculations.

## Getting Started

### Prerequisites
- Node.js (v20 or later recommended)
- npm

### Local Development

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## Docker Support

This project includes a Dockerfile for building a production-ready container served by Nginx.

### Build the Image
```bash
docker build -t salary-compare .
```

### Run the Container
```bash
docker run -p 8080:80 salary-compare
```
The application will be accessible at `http://localhost:8080`.

## Updating Tax Calculations Yearly

All tax data is located in `src/lib/tax-brackets.ts`. Update the following values each year:

### Federal Tax Brackets

- **When:** October/November (IRS releases Rev. Proc. for next tax year)
- **Source:** [IRS Tax Inflation Adjustments](https://www.irs.gov/newsroom)
- **Update:** `FEDERAL_BRACKETS` array and `TAX_YEAR` constant

### FICA (Social Security & Medicare)

- **When:** October (SSA announces next year's figures)
- **Source:** [SSA Cost-of-Living Adjustments](https://www.ssa.gov/oact/cola/cbb.html)
- **Update:** `FICA.socialSecurity.wageBase` (the cap changes yearly; rates rarely change)

### 401(k) Contribution Limit

- **When:** November (IRS releases Notice for next tax year)
- **Source:** IRS Newsroom
- **Update:** `RETIREMENT_401K_LIMIT` constant

### Federal Standard Deduction

- **When:** October/November (same IRS Rev. Proc. as federal brackets)
- **Source:** [IRS Tax Inflation Adjustments](https://www.irs.gov/newsroom)
- **Update:** `FEDERAL_STANDARD_DEDUCTION` constant in `src/lib/tax-brackets.ts` (single filer amount)

### State Tax Brackets

- **When:** Varies by state (check each state's department of revenue)
- **Update:** `STATE_TAX_DATA` object for each supported state

## Assumptions

- **Single filer status** — All tax calculations assume single filing status
- **Federal standard deduction applied** — The 2025 federal standard deduction ($15,000 for single filers) is subtracted from federal taxable income only. State standard deductions are not applied — their impact is negligible due to lower state tax rates (typically <$600 difference)
- **401(k) reduces federal/state only** — 401(k) contributions reduce federal and state taxable income but not FICA wages (which is correct)
- **Equity taxed as ordinary income** — RSU/equity vesting is treated as ordinary income at the time of vest
- **Private company equity** — EV (expected value) scenarios apply 0.75x and 0.5x multipliers to private company equity to account for liquidity risk
- **No capital gains** — All income is treated as ordinary income; no distinction for long-term capital gains
