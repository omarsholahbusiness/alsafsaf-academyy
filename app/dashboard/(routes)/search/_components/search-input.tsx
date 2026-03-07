"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useLanguage } from "@/components/providers/rtl-provider";

export const SearchInput = () => {
    const router = useRouter();
    const { locale } = useLanguage();
    const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);
    const searchParams = useSearchParams();

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const title = formData.get("title") as string;

        if (title) {
            router.push(`/dashboard/search?title=${title}`);
        } else {
            router.push("/dashboard/search");
        }
    };

    return (
        <form onSubmit={onSubmit} className="flex items-center gap-x-3 w-full max-w-2xl">
            <div className="relative flex-1">
                <Search className="absolute rtl:right-3 ltr:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    name="title"
                    placeholder={tr("ابحث عن كورسات تعليمية...", "Search educational courses...")}
                    defaultValue={searchParams.get("title") || ""}
                    className="h-12 rtl:pr-10 rtl:pl-4 ltr:pl-10 ltr:pr-4 text-base border-2 focus:border-brand transition-colors"
                />
            </div>
            <Button 
                type="submit" 
                className="h-12 px-6 bg-brand hover:bg-brand/90 text-white font-semibold transition-all duration-200 hover:scale-105"
            >
                <Search className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                {tr("بحث", "Search")}
            </Button>
        </form>
    );
}; 