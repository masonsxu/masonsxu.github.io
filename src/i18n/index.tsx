import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { Locale, TranslationSet } from "./types";
import { zh } from "./zh";
import { en } from "./en";

const translations: Record<Locale, TranslationSet> = { zh, en };

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: TranslationSet;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function getDefaultLocale(): Locale {
  const saved = localStorage.getItem("locale");
  if (saved === "zh" || saved === "en") return saved;
  return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getDefaultLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = translations[locale];

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used within I18nProvider");
  return ctx;
}
