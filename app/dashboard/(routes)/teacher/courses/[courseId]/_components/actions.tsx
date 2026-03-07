"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Info } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLanguage } from "@/components/providers/rtl-provider";

interface ActionsProps {
    disabled: boolean;
    courseId: string;
    isPublished: boolean;
}

export const Actions = ({
    disabled,
    courseId,
    isPublished,
}: ActionsProps) => {
    const { locale } = useLanguage();
    const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const onClick = async () => {
        try {
            setIsLoading(true);

            if (isPublished) {
                await axios.patch(`/api/courses/${courseId}/unpublish`);
                toast.success(tr("تم إلغاء النشر", "Unpublished successfully"));
            } else {
                await axios.patch(`/api/courses/${courseId}/publish`);
                toast.success(tr("تم نشر الكورس", "Course published"));
            }

            router.refresh();
        } catch {
            toast.error(tr("حدث خطأ", "Something went wrong"));
        } finally {
            setIsLoading(false);
        }
    }

    const publishButton = (
        <Button
            onClick={onClick}
            disabled={disabled || isLoading}
            className="bg-brand hover:bg-brand/90 text-white"
            size="sm"
        >
            {isPublished ? (
                <>
                    <EyeOff className="h-4 w-4 rtl:mr-2 ltr:ml-2" />
                    {tr("إلغاء النشر", "Unpublish")}
                </>
            ) : (
                <>
                    <Eye className="h-4 w-4 rtl:mr-2 ltr:ml-2" />
                    {tr("نشر الكورس", "Publish course")}
                </>
            )}
        </Button>
    );

    return (
        <div className="flex items-center gap-x-2">
            {disabled && !isPublished ? (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="relative">
                                {publishButton}
                                <Info className="h-4 w-4 absolute -top-1 rtl:-right-1 ltr:-left-1 text-orange-500" />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                            <div className="text-sm">
                                <p className="font-semibold mb-2">{tr("لا يمكن نشر الكورس حتى:", "Course cannot be published until:")}</p>
                                <ul className="space-y-1 text-xs">
                                    <li>{tr("• إضافة عنوان للكورس", "• Add a course title")}</li>
                                    <li>{tr("• إضافة وصف للكورس", "• Add a course description")}</li>
                                    <li>{tr("• إضافة صورة للكورس", "• Add a course image")}</li>
                                    <li>{tr("• تحديد سعر للكورس (يمكن أن يكون مجاني)", "• Set a course price (can be free)")}</li>
                                    <li>{tr("• إضافة فصل واحد على الأقل ونشره", "• Add at least one published chapter")}</li>
                                </ul>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ) : (
                publishButton
            )}
        </div>
    )
} 