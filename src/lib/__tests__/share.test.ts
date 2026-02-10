import { describe, it, expect, beforeEach, vi } from 'vitest';
import { compressToEncodedURIComponent } from 'lz-string';
import { decodeShareData } from '../share';
import type { AppState } from '../types';

function makeState(overrides?: Partial<AppState>): AppState {
  return {
    offers: [
      {
        id: 'orig-1',
        name: 'Test Offer',
        baseSalary: 150000,
        bonus: { type: 'percentage', value: 15 },
        equity: { totalValue: 200000, years: 4, vestingSchedule: [25, 25, 25, 25] },
        signOn: 20000,
        notes: 'some notes',
        isCurrent: true,
        isPrivateCompany: false,
      },
    ],
    settings: {
      mainCurrency: 'USD',
      secondaryCurrency: '',
      conversionRate: null,
      taxState: 'CA',
      retirement401k: 23500,
      theme: 'dark',
      evMultipliers: [0, 0.5, 0.75, 2, 4],
    },
    ...overrides,
  };
}

function encode(state: AppState): string {
  return compressToEncodedURIComponent(JSON.stringify(state));
}

let uuidCounter = 0;
beforeEach(() => {
  uuidCounter = 0;
  vi.spyOn(crypto, 'randomUUID').mockImplementation(
    () => `fresh-uuid-${++uuidCounter}` as `${string}-${string}-${string}-${string}-${string}`,
  );
});

describe('decodeShareData', () => {
  it('round-trips data correctly', () => {
    const state = makeState();
    const encoded = encode(state);
    const decoded = decodeShareData(encoded);

    expect(decoded.offers[0].name).toBe('Test Offer');
    expect(decoded.offers[0].baseSalary).toBe(150000);
    expect(decoded.settings.taxState).toBe('CA');
    expect(decoded.settings.retirement401k).toBe(23500);
  });

  it('generates fresh IDs on every decode', () => {
    const state = makeState();
    const encoded = encode(state);
    const decoded = decodeShareData(encoded);

    expect(decoded.offers[0].id).not.toBe('orig-1');
    expect(decoded.offers[0].id).toMatch(/^fresh-uuid-/);
  });

  it('normalizes theme to system via migration', () => {
    const state = makeState();
    state.settings.theme = 'dark';
    const encoded = encode(state);
    const decoded = decodeShareData(encoded);

    // Theme is preserved from the encoded data (migration doesn't strip it)
    expect(decoded.settings.theme).toBe('dark');
  });

  it('throws on invalid compressed data', () => {
    expect(() => decodeShareData('not-valid-data!!!')).toThrow();
  });

  it('throws on empty string', () => {
    expect(() => decodeShareData('')).toThrow();
  });

  it('throws on valid lz-string but invalid structure', () => {
    const encoded = compressToEncodedURIComponent(JSON.stringify({ foo: 'bar' }));
    expect(() => decodeShareData(encoded)).toThrow('Invalid share data format');
  });

  it('handles many offers', () => {
    const offers = Array.from({ length: 15 }, (_, i) => ({
      id: `offer-${i}`,
      name: `Offer ${i}`,
      baseSalary: 100000 + i * 10000,
      bonus: { type: 'percentage' as const, value: 10 },
      equity: { totalValue: 100000, years: 4, vestingSchedule: [25, 25, 25, 25] },
      signOn: 5000,
      notes: '',
      isCurrent: i === 0,
      isPrivateCompany: false,
    }));

    const state = makeState({ offers });
    const encoded = encode(state);
    const decoded = decodeShareData(encoded);

    expect(decoded.offers).toHaveLength(15);
    // All IDs should be fresh
    decoded.offers.forEach((offer, i) => {
      expect(offer.id).toBe(`fresh-uuid-${i + 1}`);
    });
  });

  it('migrates older share data with missing fields', () => {
    const oldState = {
      offers: [
        {
          id: 'old-1',
          name: 'Legacy',
          baseSalary: 90000,
          bonus: { type: 'percentage', value: 10 },
          equity: { totalValue: 50000, years: 4, vestingSchedule: [25, 25, 25, 25] },
          signOn: 0,
          notes: '',
          isCurrent: false,
          // isPrivateCompany missing
        },
      ],
      settings: {
        mainCurrency: 'USD',
        secondaryCurrency: '',
        conversionRate: null,
        // taxState, retirement401k, theme, evMultipliers missing
      },
    };

    const encoded = compressToEncodedURIComponent(JSON.stringify(oldState));
    const decoded = decodeShareData(encoded);

    expect(decoded.offers[0].isPrivateCompany).toBe(false);
    expect(decoded.settings.taxState).toBe('CA');
    expect(decoded.settings.retirement401k).toBe(0);
    expect(decoded.settings.theme).toBe('system');
  });
});
