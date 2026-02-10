import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import type { AppState } from './types';
import { migrateState } from './storage';

const MAX_URL_LENGTH = 50_000;

export function encodeShareUrl(state: AppState): string {
  const shareable = {
    ...state,
    settings: { ...state.settings, theme: 'system' as const },
  };
  const json = JSON.stringify(shareable);
  const compressed = compressToEncodedURIComponent(json);
  const url = `${window.location.origin}${window.location.pathname}#d=${compressed}`;
  if (url.length > MAX_URL_LENGTH) {
    throw new Error('Share URL is too long. Try removing some offers.');
  }
  return url;
}

export function getShareDataFromUrl(): string | null {
  const hash = window.location.hash;
  if (hash.startsWith('#d=')) {
    return hash.slice(3);
  }
  return null;
}

export function decodeShareData(encoded: string): AppState {
  const json = decompressFromEncodedURIComponent(encoded);
  if (!json) {
    throw new Error('Failed to decompress share data');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('Invalid share data');
  }

  const state = parsed as AppState;
  if (!state || !Array.isArray(state.offers) || !state.settings) {
    throw new Error('Invalid share data format');
  }

  const migrated = migrateState(state);

  // Generate fresh IDs to avoid collisions with existing offers
  return {
    ...migrated,
    offers: migrated.offers.map((offer) => ({
      ...offer,
      id: crypto.randomUUID(),
    })),
  };
}

export function clearShareHash(): void {
  history.replaceState(null, '', window.location.pathname + window.location.search);
}
