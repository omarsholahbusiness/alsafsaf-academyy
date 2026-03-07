import { ar, enUS } from "date-fns/locale";
import type { Locale as DateFnsLocale } from "date-fns";
import type { Locale } from "@/components/providers/rtl-provider";

export const LOCALE_COOKIE_KEY = "site_locale";

export const normalizeLocale = (value?: string | null): Locale => {
  return value === "en" ? "en" : "ar";
};

export const getDirFromLocale = (locale: Locale): "rtl" | "ltr" => {
  return locale === "ar" ? "rtl" : "ltr";
};

export const getDateFnsLocale = (locale: Locale): DateFnsLocale => {
  return locale === "ar" ? ar : enUS;
};
