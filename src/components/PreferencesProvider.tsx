'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PreferenciasAccesibilidad } from '@/lib/types';

const DEFAULT_PREFS: PreferenciasAccesibilidad = {
  tema: 'sistema',
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
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefsState({ ...DEFAULT_PREFS, ...(JSON.parse(raw) as PreferenciasAccesibilidad) });
    } catch {
      setPrefsState(DEFAULT_PREFS);
    }
    setCargado(true);

    // Mantener sincronizadas otras pestañas
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try { setPrefsState({ ...DEFAULT_PREFS, ...JSON.parse(e.newValue) }); } catch {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    // No escribir antes de leer lo guardado (evita pisarlo con los valores por defecto)
    if (!cargado || typeof document === 'undefined') return;
    const root = document.documentElement;
    root.dataset.theme = prefs.tema;
    root.dataset.contrast = prefs.contraste;
    root.dataset.font = prefs.tamanioFuente;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch {}
  }, [prefs, cargado]);

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
