import type { Offer, Settings } from './types';
import { afterTax, calculateTaxes, type TaxResult } from './tax';

export function computeAnnualBonus(offer: Offer): number {
  if (offer.bonus.type === 'percentage') {
    return offer.baseSalary * (offer.bonus.value / 100);
  }
  return offer.bonus.value;
}

export function computeAnnualizedEquity(offer: Offer): number {
  if (offer.equity.years === 0) return 0;
  return offer.equity.totalValue / offer.equity.years;
}

export interface ComponentBreakdown {
  baseSalary: number;
  bonus: number;
  equityPerYear: number;
  signOn: number;
}

export function computeComponentBreakdown(offer: Offer): ComponentBreakdown {
  return {
    baseSalary: offer.baseSalary,
    bonus: computeAnnualBonus(offer),
    equityPerYear: computeAnnualizedEquity(offer),
    signOn: offer.signOn,
  };
}

export interface SummaryRow {
  preTaxYearly: number;
  preTaxMonthly: number;
  postTaxYearly: number;
  postTaxMonthly: number;
}

export function computeSummary(offer: Offer, settings: Settings): SummaryRow {
  const bonus = computeAnnualBonus(offer);
  const equityPerYear = computeAnnualizedEquity(offer);
  const preTaxYearly = offer.baseSalary + bonus + equityPerYear;
  const preTaxMonthly = preTaxYearly / 12;
  const postTaxYearly = afterTax(
    preTaxYearly,
    settings.taxState,
    settings.retirement401k
  );
  const postTaxMonthly = postTaxYearly / 12;
  return { preTaxYearly, preTaxMonthly, postTaxYearly, postTaxMonthly };
}

export interface EVRow {
  label: string;
  preTaxYearly: number;
  preTaxMonthly: number;
  postTaxYearly: number;
  postTaxMonthly: number;
}

export function computeEVRows(offer: Offer, settings: Settings): EVRow[] {
  const bonus = computeAnnualBonus(offer);
  const equityPerYear = computeAnnualizedEquity(offer);

  const multipliers = [0.75, 0.5];
  return multipliers.map((m) => {
    const adjustedEquity = offer.isPrivateCompany
      ? equityPerYear * m
      : equityPerYear;
    const preTaxYearly = offer.baseSalary + bonus + adjustedEquity;
    const postTaxYearly = afterTax(
      preTaxYearly,
      settings.taxState,
      settings.retirement401k
    );
    return {
      label: `${m}x EV`,
      preTaxYearly,
      preTaxMonthly: preTaxYearly / 12,
      postTaxYearly,
      postTaxMonthly: postTaxYearly / 12,
    };
  });
}

export interface YearRow {
  year: number;
  preTax: number;
  postTax: number;
}

export function computeYearByYear(offer: Offer, settings: Settings): YearRow[] {
  const bonus = computeAnnualBonus(offer);
  const years = offer.equity.years || 1;
  const schedule = offer.equity.vestingSchedule;

  const rows: YearRow[] = [];
  for (let i = 0; i < years; i++) {
    const vestPct = (schedule[i] ?? 0) / 100;
    const equityThisYear = offer.equity.totalValue * vestPct;
    let preTax = offer.baseSalary + bonus + equityThisYear;
    if (i === 0) {
      preTax += offer.signOn;
    }
    rows.push({
      year: i + 1,
      preTax,
      postTax: afterTax(preTax, settings.taxState, settings.retirement401k),
    });
  }
  return rows;
}

export interface DeltaRow {
  label: string;
  value: number;
  tooltipValue?: number; // pre-tax value shown on hover
  percentage?: number; // percentage change vs current
}

export interface CombinedDeltaRow {
  label: string;
  yearlyValue: number;
  monthlyValue: number;
  yearlyTooltip?: number;
  monthlyTooltip?: number;
  percentage?: number; // Use yearly percentage
}

export function computeDeltas(
  offer: Offer,
  current: Offer,
  settings: Settings
): CombinedDeltaRow[] {
  const offerSummary = computeSummary(offer, settings);
  const currentSummary = computeSummary(current, settings);
  const yearlyPct = currentSummary.postTaxYearly !== 0
    ? ((offerSummary.postTaxYearly - currentSummary.postTaxYearly) / currentSummary.postTaxYearly) * 100
    : 0;
  return [
    {
      label: 'Total',
      yearlyValue: offerSummary.postTaxYearly - currentSummary.postTaxYearly,
      monthlyValue: offerSummary.postTaxMonthly - currentSummary.postTaxMonthly,
      yearlyTooltip: offerSummary.preTaxYearly - currentSummary.preTaxYearly,
      monthlyTooltip: offerSummary.preTaxMonthly - currentSummary.preTaxMonthly,
      percentage: yearlyPct,
    },
  ];
}

export function computeEVDeltas(
  offer: Offer,
  current: Offer,
  settings: Settings
): CombinedDeltaRow[] {
  const offerEV = computeEVRows(offer, settings);
  const currentEV = computeEVRows(current, settings);
  return offerEV.map((ev, i) => {
    const yearlyPct = currentEV[i].postTaxYearly !== 0
      ? ((ev.postTaxYearly - currentEV[i].postTaxYearly) / currentEV[i].postTaxYearly) * 100
      : 0;
    return {
      label: ev.label,
      yearlyValue: ev.postTaxYearly - currentEV[i].postTaxYearly,
      monthlyValue: ev.postTaxMonthly - currentEV[i].postTaxMonthly,
      yearlyTooltip: ev.preTaxYearly - currentEV[i].preTaxYearly,
      monthlyTooltip: ev.preTaxMonthly - currentEV[i].preTaxMonthly,
      percentage: yearlyPct,
    };
  });
}

/**
 * Compute tax result for an offer's total compensation
 */
export function computeTaxResult(offer: Offer, settings: Settings): TaxResult {
  const bonus = computeAnnualBonus(offer);
  const equityPerYear = computeAnnualizedEquity(offer);
  const grossIncome = offer.baseSalary + bonus + equityPerYear + offer.signOn;
  return calculateTaxes(grossIncome, settings.taxState, settings.retirement401k);
}
