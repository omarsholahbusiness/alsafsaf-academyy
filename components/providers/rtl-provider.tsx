"use client";

import { createContext, useContext, useEffect, useState } from "react";
import arMessages from "@/messages/ar.json";
import enMessages from "@/messages/en.json";

export type Locale = "ar" | "en";

type Messages = Record<string, unknown>;

interface RTLContextType {
  isRTL: boolean;
  setIsRTL: (isRTL: boolean) => void;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, fallback?: string) => string;
}

const LOCALE_COOKIE_KEY = "site_locale";
const LOCALE_STORAGE_KEY = "site_locale";

const normalizeLocale = (value?: string | null): Locale => {
  return value === "en" ? "en" : "ar";
};

const getMessageByKey = (messages: Messages, key: string): string | undefined => {
  const value = key.split(".").reduce<unknown>((accumulator, part) => {
    if (accumulator && typeof accumulator === "object") {
      return (accumulator as Record<string, unknown>)[part];
    }
    return undefined;
  }, messages);

  return typeof value === "string" ? value : undefined;
};

const RTLContext = createContext<RTLContextType>({
  isRTL: true,
  setIsRTL: () => {},
  locale: "ar",
  setLocale: () => {},
  toggleLocale: () => {},
  t: (key, fallback) => fallback ?? key,
});

export const useRTL = () => useContext(RTLContext);
export const useLanguage = () => useContext(RTLContext);

export const RTLProvider = ({
  children,
  initialLocale = "ar",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) => {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [mounted, setMounted] = useState(false);

  const isRTL = locale === "ar";

  useEffect(() => {
    const htmlLocale = normalizeLocale(
      typeof document !== "undefined" ? document.documentElement.lang : undefined
    );

    const cookieLocale = document.cookie
      .split("; ")
      .find((item) => item.startsWith(`${LOCALE_COOKIE_KEY}=`))
      ?.split("=")[1];

    const storageLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
    const preferredLocale = htmlLocale || normalizeLocale(cookieLocale) || normalizeLocale(storageLocale);

    setLocale(preferredLocale);

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = locale;
    document.cookie = `${LOCALE_COOKIE_KEY}=${locale}; path=/; max-age=31536000; samesite=lax`;
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [isRTL, locale, mounted]);

  const setIsRTL = (value: boolean) => {
    setLocale(value ? "ar" : "en");
  };

  const toggleLocale = () => {
    setLocale((current) => (current === "ar" ? "en" : "ar"));
  };

  const t = (key: string, fallback?: string): string => {
    const messages = (locale === "ar" ? arMessages : enMessages) as Messages;
    return getMessageByKey(messages, key) ?? fallback ?? key;
  };

  return (
    <RTLContext.Provider value={{ isRTL, setIsRTL, locale, setLocale, toggleLocale, t }}>
      {children}
    </RTLContext.Provider>
  );
};