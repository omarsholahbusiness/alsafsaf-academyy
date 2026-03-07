"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/rtl-provider";

export default function AdminRedirect() {
    const router = useRouter();
    const { locale } = useLanguage();
    const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);

    useEffect(() => {
        router.replace("/dashboard/admin/users");
    }, [router]);

    return (
        <div className="h-full flex items-center justify-center">
            <div className="text-center">
                <div className="text-lg">{tr("جاري التوجيه...", "Redirecting...")}</div>
            </div>
        </div>
    );
} 