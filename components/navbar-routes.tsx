"use client";

import { LogOut } from "lucide-react";
import { UserButton } from "./user-button";
import { useSession, signOut } from "next-auth/react";
import { LoadingButton } from "@/components/ui/loading-button";
import { useState } from "react";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/providers/rtl-provider";

export const NavbarRoutes = () => {
    const { data: session } = useSession();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { t } = useLanguage();

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await signOut({ callbackUrl: "/" });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="flex items-center gap-x-2 rtl:mr-auto ltr:ml-auto">
            <LanguageToggle />
            {/* Logout button for all user types */}
            {session?.user && (
                <LoadingButton 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleLogout}
                    loading={isLoggingOut}
                    loadingText={t("common.logoutLoading")}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200 ease-in-out"
                >
                    <LogOut className="h-4 w-4 rtl:ml-2 ltr:mr-2"/>
                    {t("common.logout")}
                </LoadingButton>
            )}
            
            <UserButton />
        </div>
    )
}