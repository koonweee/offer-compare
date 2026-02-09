/**
 * Tax Bracket Data for 2025 Tax Year
 *
 * UPDATE INSTRUCTIONS:
 * - Federal brackets: Update annually from IRS Rev. Proc. (usually released Oct/Nov)
 * - State brackets: Check each state's dept of revenue for annual adjustments
 * - FICA limits: Update Social Security wage base from SSA announcement (Oct)
 * - 401k limit: Update from IRS Notice (usually Nov of prior year)
 *
 * Sources:
 * - Federal: https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2025
 * - FICA: https://www.ssa.gov/oact/cola/cbb.html
 */

export const TAX_YEAR = 2025;

export interface TaxBracket {
  min: number;
  max: number; // Infinity for top bracket
  rate: number; // Decimal (0.22 = 22%)
}

/**
 * 2025 Federal Income Tax Brackets (Single Filer)
 * Source: IRS Rev. Proc. 2024-40
 */
export const FEDERAL_BRACKETS: TaxBracket[] = [
  { min: 0, max: 11925, rate: 0.1 },
  { min: 11925, max: 48475, rate: 0.12 },
  { min: 48475, max: 103350, rate: 0.22 },
  { min: 103350, max: 197300, rate: 0.24 },
  { min: 197300, max: 250525, rate: 0.32 },
  { min: 250525, max: 626350, rate: 0.35 },
  { min: 626350, max: Infinity, rate: 0.37 },
];

/**
 * FICA Tax Constants for 2025
 * - Social Security: 6.2% on wages up to $176,100
 * - Medicare: 1.45% on all wages + 0.9% additional on wages over $200,000
 * Source: SSA Cost-of-Living Adjustment for 2025
 */
export const FICA = {
  socialSecurity: {
    rate: 0.062, // 6.2%
    wageBase: 176100, // Maximum wages subject to SS tax
  },
  medicare: {
    rate: 0.0145, // 1.45%
    additionalRate: 0.009, // Additional 0.9% Medicare Tax
    threshold: 200000, // Income threshold for additional tax
  },
};

/**
 * 401(k) Contribution Limit for 2025
 * Does not include catch-up contributions ($7,500 for age 50+)
 */
export const RETIREMENT_401K_LIMIT = 23500;

export interface StateTaxData {
  name: string;
  brackets: TaxBracket[];
  hasNoIncomeTax?: boolean;
}

/**
 * State Tax Brackets for 2025
 * Supporting major tech employment states
 */
export const STATE_TAX_DATA: Record<string, StateTaxData> = {
  CA: {
    name: 'California',
    brackets: [
      { min: 0, max: 10412, rate: 0.01 },
      { min: 10412, max: 24684, rate: 0.02 },
      { min: 24684, max: 38959, rate: 0.04 },
      { min: 38959, max: 54081, rate: 0.06 },
      { min: 54081, max: 68350, rate: 0.08 },
      { min: 68350, max: 349137, rate: 0.093 },
      { min: 349137, max: 418961, rate: 0.103 },
      { min: 418961, max: 698271, rate: 0.113 },
      { min: 698271, max: Infinity, rate: 0.123 },
    ],
  },
  NY: {
    name: 'New York',
    brackets: [
      { min: 0, max: 8500, rate: 0.04 },
      { min: 8500, max: 11700, rate: 0.045 },
      { min: 11700, max: 13900, rate: 0.0525 },
      { min: 13900, max: 80650, rate: 0.055 },
      { min: 80650, max: 215400, rate: 0.06 },
      { min: 215400, max: 1077550, rate: 0.0685 },
      { min: 1077550, max: 5000000, rate: 0.0965 },
      { min: 5000000, max: 25000000, rate: 0.103 },
      { min: 25000000, max: Infinity, rate: 0.109 },
    ],
  },
  WA: {
    name: 'Washington',
    brackets: [],
    hasNoIncomeTax: true,
  },
  TX: {
    name: 'Texas',
    brackets: [],
    hasNoIncomeTax: true,
  },
  FL: {
    name: 'Florida',
    brackets: [],
    hasNoIncomeTax: true,
  },
  MA: {
    name: 'Massachusetts',
    brackets: [{ min: 0, max: Infinity, rate: 0.05 }], // 5% flat tax
  },
  CO: {
    name: 'Colorado',
    brackets: [{ min: 0, max: Infinity, rate: 0.044 }], // 4.4% flat tax
  },
  GA: {
    name: 'Georgia',
    brackets: [
      { min: 0, max: 750, rate: 0.01 },
      { min: 750, max: 2250, rate: 0.02 },
      { min: 2250, max: 3750, rate: 0.03 },
      { min: 3750, max: 5250, rate: 0.04 },
      { min: 5250, max: 7000, rate: 0.05 },
      { min: 7000, max: Infinity, rate: 0.0575 },
    ],
  },
  IL: {
    name: 'Illinois',
    brackets: [{ min: 0, max: Infinity, rate: 0.0495 }], // 4.95% flat tax
  },
};

export const SUPPORTED_STATES = Object.keys(STATE_TAX_DATA);
