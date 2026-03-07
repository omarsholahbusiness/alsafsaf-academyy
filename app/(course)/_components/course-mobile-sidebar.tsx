"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { CourseSidebar } from "./course-sidebar";
import { DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/components/providers/rtl-provider";

export const CourseMobileSidebar = () => {
  const { isRTL, locale } = useLanguage();

  return (
    <Sheet>
      <SheetTrigger className="md:hidden rtl:pl-4 ltr:pr-4 hover:opacity-75 transition">
        <div className="flex items-center justify-center h-10 w-10 rounded-md hover:bg-slate-100">
          <Menu className="h-6 w-6" />
        </div>
      </SheetTrigger>
      <SheetContent side={isRTL ? "right" : "left"} className="p-0 w-72">
        <DialogTitle className="sr-only">{locale === "ar" ? "قائمة الكورس" : "Course menu"}</DialogTitle>
        <CourseSidebar />
      </SheetContent>
    </Sheet>
  );
}; 