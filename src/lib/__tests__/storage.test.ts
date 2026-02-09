import { describe, it, expect } from 'vitest';

// Mock File and FileReader for Node environment
class MockFileReader {
  result: string | null = null;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  readAsText(file: { content: string }) {
    this.result = file.content;
    setTimeout(() => this.onload?.(), 0);
  }
}

// @ts-expect-error - mocking FileReader
global.FileReader = MockFileReader;

// Import after mocking
import { importState } from '../storage';
import type { AppState } from '../types';

describe('importState', () => {
  it('successfully imports valid complete state', async () => {
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
      },
    };

    const file = { content: JSON.stringify(validState) } as unknown as File;
    const result = await importState(file);

    expect(result).toEqual(validState);
  });

  it('rejects invalid JSON', async () => {
    const file = { content: 'not valid json' } as unknown as File;

    await expect(importState(file)).rejects.toThrow('Invalid JSON');
  });

  it('rejects missing offers array', async () => {
    const invalidState = {
      settings: { mainCurrency: 'USD' },
    };
    const file = { content: JSON.stringify(invalidState) } as unknown as File;

    await expect(importState(file)).rejects.toThrow('Invalid file format');
  });

  it('rejects missing settings', async () => {
    const invalidState = {
      offers: [],
    };
    const file = { content: JSON.stringify(invalidState) } as unknown as File;

    await expect(importState(file)).rejects.toThrow('Invalid file format');
  });

  it('handles older export missing retirement401k field', async () => {
    // Simulates an export from before retirement401k was added
    const oldState = {
      offers: [],
      settings: {
        mainCurrency: 'USD',
        secondaryCurrency: '',
        conversionRate: null,
        taxState: 'CA',
        // retirement401k is missing
      },
    };
    const file = { content: JSON.stringify(oldState) } as unknown as File;
    const result = await importState(file);

    // Currently this passes but retirement401k will be undefined
    // which causes NaN in tax calculations
    expect(result.settings.retirement401k).toBeDefined();
    expect(result.settings.retirement401k).toBe(0);
  });

  it('handles older export missing taxState field', async () => {
    const oldState = {
      offers: [],
      settings: {
        mainCurrency: 'USD',
        secondaryCurrency: '',
        conversionRate: null,
        // taxState is missing
        retirement401k: 0,
      },
    };
    const file = { content: JSON.stringify(oldState) } as unknown as File;
    const result = await importState(file);

    expect(result.settings.taxState).toBeDefined();
    expect(result.settings.taxState).toBe('CA'); // default
  });

  it('handles older export missing isPrivateCompany on offers', async () => {
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
          // isPrivateCompany is missing
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
    };
    const file = { content: JSON.stringify(oldState) } as unknown as File;
    const result = await importState(file);

    expect(result.offers[0].isPrivateCompany).toBeDefined();
    expect(result.offers[0].isPrivateCompany).toBe(false);
  });

  it('handles older export missing theme field', async () => {
    const oldState = {
      offers: [],
      settings: {
        mainCurrency: 'USD',
        secondaryCurrency: '',
        conversionRate: null,
        taxState: 'CA',
        retirement401k: 0,
        // theme is missing
      },
    };
    const file = { content: JSON.stringify(oldState) } as unknown as File;
    const result = await importState(file);

    expect(result.settings.theme).toBeDefined();
    expect(result.settings.theme).toBe('system'); // default
  });
});
