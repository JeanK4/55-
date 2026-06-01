'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PreferenciasAccesibilidad } from '@/lib/types';

const DEFAULT_PREFS: PreferenciasAccesibilidad = {
  tema: 'claro',
  contraste: 'normal',
  tamanioFuente: 'md',
  idioma: 'es',
};

const STORAGE_KEY = 'club55_preferencias';

interface PrefContextValue {
  prefs: PreferenciasAccesibilidad;
  setPrefs: (cambios: Partial<PreferenciasAccesibilidad>) => void;
}

const PrefContext = createContext<PrefContextValue | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefsState] = useState<PreferenciasAccesibilidad>(DEFAULT_PREFS);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as PreferenciasAccesibilidad;
      setPrefsState({ ...DEFAULT_PREFS, ...parsed });
    } catch {
      setPrefsState(DEFAULT_PREFS);
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.dataset.theme = prefs.tema;
    root.dataset.contrast = prefs.contraste;
    root.dataset.font = prefs.tamanioFuente;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    }
  }, [prefs]);

  const setPrefs = (cambios: Partial<PreferenciasAccesibilidad>) => {
    setPrefsState(prev => ({ ...prev, ...cambios }));
  };

  const value = useMemo(() => ({ prefs, setPrefs }), [prefs]);

  return <PrefContext.Provider value={value}>{children}</PrefContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PrefContext);
  if (!ctx) throw new Error('usePreferences debe usarse dentro de <PreferencesProvider>');
  return ctx;
}
