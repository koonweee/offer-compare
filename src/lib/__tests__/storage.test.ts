import { describe, it, expect } from 'vitest';
import { migrateState } from '../storage';
import type { AppState } from '../types';

describe('migrateState', () => {
  it('returns complete state unchanged', () => {
    const validState: AppState = {
      offers: [
        {
          id: 'test-1',
          name: 'Test Offer',
          baseSalary: 100000,
          bonus: { type: 'percentage', value: 15 },
          equity: {
            totalValue: 200000,
            years: 4,
            vestingSchedule: [25, 25, 25, 25],
          },
          signOn: 10000,
          notes: 'Test notes',
          isCurrent: false,
          isPrivateCompany: false,
        },
      ],
      settings: {
        mainCurrency: 'USD',
        secondaryCurrency: 'EUR',
        conversionRate: 1.1,
        taxState: 'CA',
        retirement401k: 23000,
        theme: 'system',
        evMultipliers: [0.5, 0.75, 2, 4],
      },
    };

    const result = migrateState(validState);
    expect(result).toEqual(validState);
  });

  it('handles missing retirement401k field', () => {
    const oldState = {
      offers: [],
      settings: {
        mainCurrency: 'USD',
        secondaryCurrency: '',
        conversionRate: null,
        taxState: 'CA',
      },
    } as unknown as AppState;

    const result = migrateState(oldState);
    expect(result.settings.retirement401k).toBe(0);
  });

  it('handles missing taxState field', () => {
    const oldState = {
      offers: [],
      settings: {
        mainCurrency: 'USD',
        secondaryCurrency: '',
        conversionRate: null,
        retirement401k: 0,
      },
    } as unknown as AppState;

    const result = migrateState(oldState);
    expect(result.settings.taxState).toBe('CA');
  });

  it('handles missing isPrivateCompany on offers', () => {
    const oldState = {
      offers: [
        {
          id: 'test-1',
          name: 'Old Offer',
          baseSalary: 100000,
          bonus: { type: 'percentage', value: 15 },
          equity: {
            totalValue: 200000,
            years: 4,
            vestingSchedule: [25, 25, 25, 25],
          },
          signOn: 10000,
          notes: '',
          isCurrent: true,
        },
      ],
      settings: {
        mainCurrency: 'USD',
        secondaryCurrency: '',
        conversionRate: null,
        taxState: 'CA',
        retirement401k: 0,
        theme: 'system',
      },
    } as unknown as AppState;

    const result = migrateState(oldState);
    expect(result.offers[0].isPrivateCompany).toBe(false);
  });

  it('handles missing theme field', () => {
    const oldState = {
      offers: [],
      settings: {
        mainCurrency: 'USD',
        secondaryCurrency: '',
        conversionRate: null,
        taxState: 'CA',
        retirement401k: 0,
      },
    } as unknown as AppState;

    const result = migrateState(oldState);
    expect(result.settings.theme).toBe('system');
  });
});
