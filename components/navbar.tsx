"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { ScrollProgress } from "@/components/scroll-progress";
import { LogOut } from "lucide-react";
import { LogoCard } from "@/components/logo-card";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/providers/rtl-provider";

export const Navbar = () => {
  const { data: session } = useSession();
  const { t, locale } = useLanguage();

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="fixed top-0 w-full z-50 bg-white overflow-visible">
      <div className="container mx-auto px-4 overflow-visible">
        <div className="flex items-start justify-between h-20 overflow-visible">
          {/* Mobile: plain logo icon. Desktop: logo card */}
          <div className="rtl:ml-4 ltr:mr-4 flex items-center h-20 md:h-auto md:items-start relative z-[60]">
            <Link href="/" className="md:hidden flex items-center shrink-0">
              <Image
                src="/logo.png"
                alt="Logo"
                width={56}
                height={56}
                className="object-contain h-14 w-14"
                unoptimized
              />
            </Link>
            <div className="hidden md:block">
              <LogoCard href="/" />
            </div>
          </div>

          {/* Right side items */}
          <div className="flex items-center gap-2 h-20">
            <LanguageToggle />
            {!session ? (
              <div className="flex items-center gap-3">
                <Button className={`bg-brand hover:bg-brand/90 text-white ${locale === "ar" ? "h-8 text-[11px] px-2.5" : ""}`} asChild>
                  <Link href="/sign-up">{t("navbar.signUp")}</Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className={`border-brand text-brand hover:bg-brand/10 ${locale === "ar" ? "h-8 text-[11px] px-2.5" : ""}`}
                >
                  <Link href="/sign-in">{t("navbar.signIn")}</Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="ghost" asChild>
                  <Link href="/dashboard">{t("navbar.dashboard")}</Link>
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200 ease-in-out"
                >
                  <LogOut className="h-4 w-4 rtl:ml-2 ltr:mr-2"/>
                  {t("common.logout")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <ScrollProgress />
    </div>
  );
}; 