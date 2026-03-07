"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/rtl-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const LanguageToggle = () => {
  const { locale, setLocale } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 w-8 min-w-8 p-0 border-brand/40 hover:bg-brand/10"
          aria-label={locale === "ar" ? "اختيار اللغة" : "Choose language"}
          title={locale === "ar" ? "اختيار اللغة" : "Choose language"}
        >
          <Languages className="h-3.5 w-3.5" />
          <span className="sr-only">{locale === "ar" ? "اختيار اللغة" : "Choose language"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLocale("ar")} className={locale === "ar" ? "bg-accent" : ""}>
          العربية
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale("en")} className={locale === "en" ? "bg-accent" : ""}>
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
