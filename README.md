# Salary Compare

A tool for comparing job offers with after-tax compensation calculations.

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

### State Tax Brackets
- **When:** Varies by state (check each state's department of revenue)
- **Update:** `STATE_TAX_DATA` object for each supported state

## Assumptions

- **Single filer status** — All tax calculations assume single filing status
- **No standard deduction** — The app does not apply the federal standard deduction; taxable income is gross income minus 401(k) contributions only
- **401(k) reduces federal/state only** — 401(k) contributions reduce federal and state taxable income but not FICA wages (which is correct)
- **No local taxes** — City/local income taxes (e.g., NYC, SF) are not included
- **Equity taxed as ordinary income** — RSU/equity vesting is treated as ordinary income at the time of vest
- **Private company equity** — EV (expected value) scenarios apply 0.75x and 0.5x multipliers to private company equity to account for liquidity risk
- **No AMT** — Alternative Minimum Tax is not calculated
- **No capital gains** — All income is treated as ordinary income; no distinction for long-term capital gains
