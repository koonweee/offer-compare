import {
  FEDERAL_BRACKETS,
  FEDERAL_STANDARD_DEDUCTION,
  FICA,
  STATE_TAX_DATA,
  type TaxBracket,
} from './tax-brackets';

export interface TaxResult {
  taxableIncome: number; // Federal taxable income (after 401k + standard deduction)
  federalTax: number;
  stateTax: number;
  ficaTax: number; // Social Security + Medicare
  totalTax: number;
  effectiveRate: number; // totalTax / grossIncome
  stateLabel: string; // For tooltip (e.g., "CA")
}

/**
 * Calculate tax using progressive brackets.
 * Pure function - easy to test with known bracket inputs.
 */
export function calculateProgressiveTax(
  income: number,
  brackets: TaxBracket[]
): number {
  if (income <= 0 || brackets.length === 0) return 0;

  let tax = 0;
  for (const bracket of brackets) {
    if (income <= bracket.min) break;

    const taxableInBracket = Math.min(income, bracket.max) - bracket.min;
    tax += taxableInBracket * bracket.rate;
  }

  return tax;
}

/**
 * Calculate FICA taxes (Social Security + Medicare).
 * SS capped at wage base, Medicare has additional tax above threshold.
 */
export function calculateFICA(income: number): number {
  if (income <= 0) return 0;

  // Social Security: 6.2% up to wage base
  const ssWages = Math.min(income, FICA.socialSecurity.wageBase);
  const socialSecurity = ssWages * FICA.socialSecurity.rate;

  // Medicare: 1.45% on all wages
  let medicare = income * FICA.medicare.rate;

  // Additional Medicare Tax: 0.9% on wages above threshold
  if (income > FICA.medicare.threshold) {
    medicare += (income - FICA.medicare.threshold) * FICA.medicare.additionalRate;
  }

  return socialSecurity + medicare;
}

/**
 * Main tax calculation - combines federal, state, and FICA.
 * @param income - Gross annual income (before any deductions)
 * @param state - State abbreviation (e.g., 'CA')
 * @param retirement401k - Annual 401k contribution (reduces federal/state, NOT FICA)
 */
export function calculateTaxes(
  income: number,
  state: string,
  retirement401k: number
): TaxResult {
  // Federal taxable income = income minus 401k minus standard deduction
  const federalTaxableIncome = Math.max(0, income - retirement401k - FEDERAL_STANDARD_DEDUCTION);

  // State taxable income = income minus 401k only (no federal standard deduction)
  const stateTaxableIncome = Math.max(0, income - retirement401k);

  // Federal tax on federal taxable income
  const federalTax = calculateProgressiveTax(federalTaxableIncome, FEDERAL_BRACKETS);

  // State tax on state taxable income
  const stateData = STATE_TAX_DATA[state];
  let stateTax = 0;
  if (stateData && !stateData.hasNoIncomeTax) {
    stateTax = calculateProgressiveTax(stateTaxableIncome, stateData.brackets);
  }

  // FICA is calculated on full income (401k does NOT reduce FICA)
  const ficaTax = calculateFICA(income);

  const totalTax = federalTax + stateTax + ficaTax;
  const effectiveRate = income > 0 ? totalTax / income : 0;

  return {
    taxableIncome: federalTaxableIncome,
    federalTax,
    stateTax,
    ficaTax,
    totalTax,
    effectiveRate,
    stateLabel: stateData?.name || state,
  };
}

/** Convenience wrapper returning net income after all taxes */
export function afterTax(
  amount: number,
  state: string,
  retirement401k: number
): number {
  const result = calculateTaxes(amount, state, retirement401k);
  return amount - result.totalTax;
}

/** Format for tooltip: "32% for CA and federal taxes" */
export function formatEffectiveRate(result: TaxResult): string {
  const pct = Math.round(result.effectiveRate * 100);
  return `${pct}% effective rate (${result.stateLabel} + federal + FICA)`;
}
