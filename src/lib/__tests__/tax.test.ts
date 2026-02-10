import { describe, it, expect } from 'vitest';
import {
  calculateProgressiveTax,
  calculateFICA,
  calculateTaxes,
  afterTax,
  formatEffectiveRate,
} from '../tax';
import { FEDERAL_BRACKETS, FEDERAL_STANDARD_DEDUCTION } from '../tax-brackets';

describe('calculateProgressiveTax', () => {
  it('calculates tax for income in first bracket only', () => {
    // $10,000 at 10% = $1,000
    expect(calculateProgressiveTax(10000, FEDERAL_BRACKETS)).toBe(1000);
  });

  it('calculates tax across multiple brackets', () => {
    // $100,000 income breakdown:
    // First $11,925 at 10% = $1,192.50
    // $11,925 to $48,475 ($36,550) at 12% = $4,386.00
    // $48,475 to $100,000 ($51,525) at 22% = $11,335.50
    // Total = $16,914
    const tax = calculateProgressiveTax(100000, FEDERAL_BRACKETS);
    expect(tax).toBeCloseTo(16914, 0);
  });

  it('handles zero income', () => {
    expect(calculateProgressiveTax(0, FEDERAL_BRACKETS)).toBe(0);
  });

  it('handles negative income', () => {
    expect(calculateProgressiveTax(-1000, FEDERAL_BRACKETS)).toBe(0);
  });

  it('handles empty brackets array', () => {
    expect(calculateProgressiveTax(100000, [])).toBe(0);
  });

  it('calculates correctly for income at exact bracket boundary', () => {
    // Income exactly at end of first bracket: $11,925 at 10% = $1,192.50
    expect(calculateProgressiveTax(11925, FEDERAL_BRACKETS)).toBeCloseTo(1192.5, 1);
  });

  it('calculates top bracket tax correctly', () => {
    // $700,000 income (touches the 37% bracket)
    const tax = calculateProgressiveTax(700000, FEDERAL_BRACKETS);
    // Verify it's more than if we stopped at 35% bracket
    const maxAt35 = calculateProgressiveTax(626350, FEDERAL_BRACKETS);
    expect(tax).toBeGreaterThan(maxAt35);
  });
});

describe('calculateFICA', () => {
  it('calculates SS + Medicare for income below wage base', () => {
    // $100,000: SS = 6,200 (6.2%), Medicare = 1,450 (1.45%)
    // Total = 7,650
    expect(calculateFICA(100000)).toBeCloseTo(7650, 0);
  });

  it('caps Social Security at wage base ($176,100)', () => {
    // $200,000:
    // SS = $176,100 * 0.062 = $10,918.20
    // Medicare = $200,000 * 0.0145 = $2,900
    // No additional Medicare (at exactly $200k)
    // Total = $13,818.20
    expect(calculateFICA(200000)).toBeCloseTo(13818.2, 1);
  });

  it('applies additional Medicare tax above $200k', () => {
    // $250,000:
    // SS = $176,100 * 0.062 = $10,918.20
    // Medicare base = $250,000 * 0.0145 = $3,625
    // Medicare additional = $50,000 * 0.009 = $450
    // Total = $15,093.20
    expect(calculateFICA(250000)).toBeCloseTo(14993.2, 1);
  });

  it('handles zero income', () => {
    expect(calculateFICA(0)).toBe(0);
  });

  it('handles negative income', () => {
    expect(calculateFICA(-1000)).toBe(0);
  });

  it('handles income below Medicare additional threshold', () => {
    // $150,000: SS = 9,300, Medicare = 2,175 (no additional)
    expect(calculateFICA(150000)).toBeCloseTo(11475, 0);
  });
});

describe('calculateTaxes', () => {
  it('reduces taxable income by 401k for federal/state but not FICA', () => {
    const withoutDeduction = calculateTaxes(100000, 'CA', 0);
    const withDeduction = calculateTaxes(100000, 'CA', 23500);

    expect(withDeduction.federalTax).toBeLessThan(withoutDeduction.federalTax);
    expect(withDeduction.stateTax).toBeLessThan(withoutDeduction.stateTax);
    // FICA should be identical since 401k doesn't reduce FICA
    expect(withDeduction.ficaTax).toBe(withoutDeduction.ficaTax);
  });

  it('returns zero state tax for no-income-tax states', () => {
    const waResult = calculateTaxes(100000, 'WA', 0);
    const txResult = calculateTaxes(100000, 'TX', 0);
    const flResult = calculateTaxes(100000, 'FL', 0);

    expect(waResult.stateTax).toBe(0);
    expect(txResult.stateTax).toBe(0);
    expect(flResult.stateTax).toBe(0);
  });

  it('calculates state tax for states with income tax', () => {
    const caResult = calculateTaxes(100000, 'CA', 0);
    const nyResult = calculateTaxes(100000, 'NY', 0);

    expect(caResult.stateTax).toBeGreaterThan(0);
    expect(nyResult.stateTax).toBeGreaterThan(0);
  });

  it('calculates correct total tax', () => {
    const result = calculateTaxes(100000, 'CA', 0);
    expect(result.totalTax).toBe(
      result.federalTax + result.stateTax + result.ficaTax
    );
  });

  it('calculates effective rate correctly', () => {
    const result = calculateTaxes(100000, 'CA', 0);
    expect(result.effectiveRate).toBeCloseTo(result.totalTax / 100000, 4);
  });

  it('returns state label', () => {
    const caResult = calculateTaxes(100000, 'CA', 0);
    expect(caResult.stateLabel).toBe('California');

    const waResult = calculateTaxes(100000, 'WA', 0);
    expect(waResult.stateLabel).toBe('Washington');
  });

  it('handles unknown state gracefully', () => {
    const result = calculateTaxes(100000, 'XX', 0);
    expect(result.stateTax).toBe(0);
    expect(result.stateLabel).toBe('XX');
  });

  it('handles zero income', () => {
    const result = calculateTaxes(0, 'CA', 0);
    expect(result.totalTax).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  it('applies standard deduction to federal but not state or FICA', () => {
    // With WA (no state tax), we can isolate the federal effect
    const result = calculateTaxes(100000, 'WA', 0);

    // Federal taxable income should be income minus standard deduction
    expect(result.taxableIncome).toBe(100000 - FEDERAL_STANDARD_DEDUCTION);

    // Federal tax should be on (income - standard deduction), not full income
    const expectedFederal = calculateProgressiveTax(
      100000 - FEDERAL_STANDARD_DEDUCTION,
      FEDERAL_BRACKETS
    );
    expect(result.federalTax).toBe(expectedFederal);

    // State tax on a taxing state should use full income (no standard deduction)
    const caResult = calculateTaxes(100000, 'MA', 0);
    // MA flat 5% on full income
    expect(caResult.stateTax).toBe(5000);

    // FICA should be on full income
    expect(result.ficaTax).toBe(calculateFICA(100000));
  });

  it('caps 401k deduction at income level', () => {
    // If income is less than 401k contribution, taxable income should be 0
    const result = calculateTaxes(10000, 'CA', 23500);
    expect(result.taxableIncome).toBe(0);
    expect(result.federalTax).toBe(0);
    expect(result.stateTax).toBe(0);
    // FICA is still calculated on full income
    expect(result.ficaTax).toBeGreaterThan(0);
  });
});

describe('afterTax', () => {
  it('returns income minus total tax', () => {
    const result = calculateTaxes(100000, 'CA', 0);
    const netIncome = afterTax(100000, 'CA', 0);
    expect(netIncome).toBe(100000 - result.totalTax);
  });

  it('reflects 401k deduction savings', () => {
    const withoutDeduction = afterTax(100000, 'CA', 0);
    const withDeduction = afterTax(100000, 'CA', 23500);
    // With 401k, net income should be higher (less tax paid)
    expect(withDeduction).toBeGreaterThan(withoutDeduction);
  });
});

describe('formatEffectiveRate', () => {
  it('formats effective rate correctly', () => {
    const result = calculateTaxes(100000, 'CA', 0);
    const formatted = formatEffectiveRate(result);
    const expectedPct = Math.round(result.effectiveRate * 100);
    expect(formatted).toContain(`${expectedPct}%`);
    expect(formatted).toContain('California');
    expect(formatted).toContain('federal');
    expect(formatted).toContain('FICA');
  });
});

describe('flat tax states', () => {
  it('calculates MA flat tax correctly', () => {
    // Massachusetts has 5% flat tax
    const result = calculateTaxes(100000, 'MA', 0);
    expect(result.stateTax).toBe(5000);
  });

  it('calculates CO flat tax correctly', () => {
    // Colorado has 4.4% flat tax
    const result = calculateTaxes(100000, 'CO', 0);
    expect(result.stateTax).toBe(4400);
  });

  it('calculates IL flat tax correctly', () => {
    // Illinois has 4.95% flat tax
    const result = calculateTaxes(100000, 'IL', 0);
    expect(result.stateTax).toBe(4950);
  });
});

describe('progressive state tax', () => {
  it('calculates GA progressive tax', () => {
    const result = calculateTaxes(100000, 'GA', 0);
    // GA has progressive brackets up to 5.75%
    expect(result.stateTax).toBeGreaterThan(0);
    expect(result.stateTax).toBeLessThan(5750); // Can't be more than 5.75% flat
  });
});
