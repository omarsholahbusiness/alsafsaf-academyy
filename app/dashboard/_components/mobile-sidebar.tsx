"use client";

import { Menu, X } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetClose,
    SheetTitle
} from "@/components/ui/sheet";
import { Sidebar } from './sidebar';
import { Logo } from './logo';
import { useLanguage } from "@/components/providers/rtl-provider";

export const MobileSidebar = () => {
    const { t, isRTL } = useLanguage();

    return (
        <Sheet>
            <SheetTrigger className='md:hidden rtl:pl-4 ltr:pr-4 hover:opacity-75 transition'>
                <Menu />
            </SheetTrigger>
            <SheetContent side={isRTL ? "right" : "left"} className='p-0 bg-card gap-0'>
                <SheetTitle className="sr-only">{t("mobileSidebar.navigationMenu")}</SheetTitle>
                <div className="flex items-center justify-between p-4 border-b">
                    <Logo />
                    <SheetClose className="hover:opacity-75 transition p-2">
                        <X className="h-6 w-6" />
                    </SheetClose>
                </div>
                <Sidebar closeOnClick />
            </SheetContent>
        </Sheet>
    );
}