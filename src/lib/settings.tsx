import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { info } from './data';
import { lkParts, lkDateTime } from './time';

export interface Settings {
  rate: number;              // рупий за $1
  devDate: string | null;    // «как будто сегодня» — для проверки
  syncCode: string;          // код поездки (этап 8)
  device: string;            // имя устройства
}

const KEY = 'sl-settings';
const defaults: Settings = { rate: info.trip.lkrPerUsd, devDate: null, syncCode: '', device: '' };

function load(): Settings {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return defaults;
  }
}

interface Ctx { settings: Settings; update: (p: Partial<Settings>) => void }
const SettingsCtx = createContext<Ctx>({ settings: defaults, update: () => {} });

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* приватный режим */ }
  }, [settings]);
  return <SettingsCtx.Provider value={{ settings, update: (p) => setSettings((s) => ({ ...s, ...p })) }}>{children}</SettingsCtx.Provider>;
}

export const useSettings = () => useContext(SettingsCtx);

/** Текущий момент с учётом dev-переключателя даты (время суток — настоящее). */
export function useNow(intervalMs = 30_000): Date {
  const { settings } = useSettings();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  if (!settings.devDate) return now;
  return lkDateTime(settings.devDate, lkParts(now).time);
}

export function useToday() {
  const now = useNow();
  return { now, ...lkParts(now) };
}
