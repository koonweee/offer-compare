import { createContext, useContext, useCallback, useState, type ReactNode } from 'react';
import type { AppState, Offer, Settings } from './types';
import { loadState, saveState } from './storage';

interface AppContextValue {
  state: AppState;
  addOffer: (offer: Offer) => void;
  updateOffer: (offer: Offer) => void;
  deleteOffer: (id: string) => void;
  duplicateOffer: (id: string) => void;
  updateSettings: (settings: Settings) => void;
  replaceState: (state: AppState) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  const persist = useCallback((next: AppState) => {
    setState(next);
    saveState(next);
  }, []);

  const addOffer = useCallback((offer: Offer) => {
    setState((prev) => {
      const offers = offer.isCurrent
        ? prev.offers.map((o) => ({ ...o, isCurrent: false }))
        : prev.offers;
      const next = { ...prev, offers: [...offers, offer] };
      saveState(next);
      return next;
    });
  }, []);

  const updateOffer = useCallback((offer: Offer) => {
    setState((prev) => {
      let offers = prev.offers.map((o) => (o.id === offer.id ? offer : o));
      if (offer.isCurrent) {
        offers = offers.map((o) => (o.id === offer.id ? o : { ...o, isCurrent: false }));
      }
      const next = { ...prev, offers };
      saveState(next);
      return next;
    });
  }, []);

  const deleteOffer = useCallback((id: string) => {
    setState((prev) => {
      const next = { ...prev, offers: prev.offers.filter((o) => o.id !== id) };
      saveState(next);
      return next;
    });
  }, []);

  const duplicateOffer = useCallback((id: string) => {
    setState((prev) => {
      const source = prev.offers.find((o) => o.id === id);
      if (!source) return prev;
      const copy: Offer = {
        ...source,
        id: crypto.randomUUID(),
        name: `${source.name} (Copy)`,
        isCurrent: false,
      };
      const next = { ...prev, offers: [...prev.offers, copy] };
      saveState(next);
      return next;
    });
  }, []);

  const updateSettings = useCallback((settings: Settings) => {
    setState((prev) => {
      const next = { ...prev, settings };
      saveState(next);
      return next;
    });
  }, []);

  const replaceState = useCallback((newState: AppState) => {
    persist(newState);
  }, [persist]);

  return (
    <AppContext.Provider
      value={{ state, addOffer, updateOffer, deleteOffer, duplicateOffer, updateSettings, replaceState }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
