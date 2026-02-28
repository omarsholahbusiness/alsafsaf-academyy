"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { ScrollProgress } from "@/components/scroll-progress";
import { LogOut } from "lucide-react";
import { LogoCard } from "@/components/logo-card";

export const Navbar = () => {
  const { data: session } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="fixed top-0 w-full z-50 bg-white overflow-visible">
      <div className="container mx-auto px-4 overflow-visible">
        <div className="flex items-start justify-between h-20 overflow-visible">
          {/* Mobile: plain logo icon. Desktop: logo card */}
          <div className="rtl:ml-4 ltr:mr-4 flex items-center h-20 md:h-auto md:items-start">
            <Link href="/" className="md:hidden flex items-center shrink-0">
              <Image
                src="/logo.png"
                alt="Logo"
                width={48}
                height={48}
                className="object-contain h-12 w-12"
                unoptimized
              />
            </Link>
            <div className="hidden md:block">
              <LogoCard href="/" />
            </div>
          </div>

          {/* Right side items */}
          <div className="flex items-center gap-4 h-20">
            {!session ? (
              <>
                <Button className="bg-brand hover:bg-brand/90 text-white" asChild>
                  <Link href="/sign-up">انشاء الحساب</Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="border-brand text-brand hover:bg-brand/10"
                >
                  <Link href="/sign-in">تسجيل الدخول</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard">لوحة التحكم</Link>
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200 ease-in-out"
                >
                  <LogOut className="h-4 w-4 rtl:ml-2 ltr:mr-2"/>
                  تسجيل الخروج
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      <ScrollProgress />
    </div>
  );
}; 