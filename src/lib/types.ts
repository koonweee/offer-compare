export type ThemePreference = 'light' | 'dark' | 'system';

export interface Offer {
  id: string;
  name: string;
  baseSalary: number;
  bonus: { type: 'percentage' | 'amount'; value: number };
  equity: {
    totalValue: number;
    years: number;
    vestingSchedule: number[];
  };
  signOn: number;
  notes: string;
  isCurrent: boolean;
  isPrivateCompany: boolean;
}

export interface Settings {
  mainCurrency: string;
  secondaryCurrency: string;
  conversionRate: number | null;
  taxState: string; // State abbreviation (default: 'CA')
  retirement401k: number; // Annual 401k contribution (default: 0)
  theme: ThemePreference;
  evMultipliers: number[];
}

export interface AppState {
  offers: Offer[];
  settings: Settings;
}
