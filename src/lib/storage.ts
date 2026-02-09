import type { AppState, Offer, Settings } from './types';

const STORAGE_KEY = 'salary-compare-state';

const defaultSettings: Settings = {
  mainCurrency: 'USD',
  secondaryCurrency: '',
  conversionRate: null,
  taxState: 'CA',
  retirement401k: 0,
  theme: 'system',
};

const defaultOffer: Omit<Offer, 'id' | 'name'> = {
  baseSalary: 0,
  bonus: { type: 'percentage', value: 0 },
  equity: {
    totalValue: 0,
    years: 4,
    vestingSchedule: [25, 25, 25, 25],
  },
  signOn: 0,
  notes: '',
  isCurrent: false,
  isPrivateCompany: false,
};

export const defaultState: AppState = {
  offers: [],
  settings: defaultSettings,
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as AppState;
    // basic validation
    if (!Array.isArray(parsed.offers) || !parsed.settings) {
      return defaultState;
    }
    // Migrate to fill in any missing fields from older versions
    return migrateState(parsed);
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function exportState(state: AppState): void {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'offers-data.json';
  a.click();
  URL.revokeObjectURL(url);
}

/** Merge defaults into imported state to handle missing fields from older exports */
function migrateState(parsed: AppState): AppState {
  // Merge default settings with parsed settings
  const settings: Settings = {
    ...defaultSettings,
    ...parsed.settings,
  };

  // Merge default offer fields into each offer
  const offers: Offer[] = parsed.offers.map((offer) => ({
    ...defaultOffer,
    ...offer,
    // Ensure nested objects are also merged
    bonus: { ...defaultOffer.bonus, ...offer.bonus },
    equity: { ...defaultOffer.equity, ...offer.equity },
  }));

  return { offers, settings };
}

export function importState(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as AppState;
        if (!Array.isArray(parsed.offers) || !parsed.settings) {
          reject(new Error('Invalid file format'));
          return;
        }
        resolve(migrateState(parsed));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
