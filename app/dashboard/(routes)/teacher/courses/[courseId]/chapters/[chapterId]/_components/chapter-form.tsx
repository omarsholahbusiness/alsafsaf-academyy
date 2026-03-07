"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, Pencil, EyeOff, LayoutDashboard, Files } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import axios from "axios";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Editor } from "@/components/editor";
import { Checkbox } from "@/components/ui/checkbox";
import { IconBadge } from "@/components/icon-badge";
import { AttachmentsForm } from "./attachments-form";
import { useLanguage } from "@/components/providers/rtl-provider";

interface ChapterAttachment {
    id: string;
    name: string;
    url: string;
    position: number;
    createdAt: Date | string;
}

interface ChapterFormProps {
    initialData: {
        title: string;
        description: string | null;
        isFree: boolean;
        isPublished: boolean;
        attachments: ChapterAttachment[];
    };
    courseId: string;
    chapterId: string;
}

export const ChapterForm = ({
    initialData,
    courseId,
    chapterId
}: ChapterFormProps) => {
    const { locale } = useLanguage();
    const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);
    const titleSchema = z.object({
        title: z.string().min(1, {
            message: tr("عنوان الفصل مطلوب", "Chapter title is required"),
        }),
    });

    const descriptionSchema = z.object({
        description: z.string().min(1, {
            message: tr("وصف الفصل مطلوب", "Chapter description is required"),
        }),
    });

    const accessSchema = z.object({
        isFree: z.boolean().default(false),
    });
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [isEditingAccess, setIsEditingAccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const titleForm = useForm<z.infer<typeof titleSchema>>({
        resolver: zodResolver(titleSchema),
        defaultValues: {
            title: initialData?.title || "",
        },
    });

    const descriptionForm = useForm<z.infer<typeof descriptionSchema>>({
        resolver: zodResolver(descriptionSchema),
        defaultValues: {
            description: initialData?.description || "",
        },
    });

    const accessForm = useForm<z.infer<typeof accessSchema>>({
        resolver: zodResolver(accessSchema),
        defaultValues: {
            isFree: !!initialData.isFree
        }
    });

    const { isSubmitting: isSubmittingTitle, isValid: isValidTitle } = titleForm.formState;
    const { isSubmitting: isSubmittingDescription, isValid: isValidDescription } = descriptionForm.formState;
    const { isSubmitting: isSubmittingAccess, isValid: isValidAccess } = accessForm.formState;

    const onSubmitTitle = async (values: z.infer<typeof titleSchema>) => {
        try {
            const response = await fetch(`/api/courses/${courseId}/chapters/${chapterId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                throw new Error(tr("فشل تحديث عنوان الفصل", "Failed to update chapter title"));
            }

            toast.success(tr("تم تحديث عنوان الفصل", "Chapter title updated"));
            setIsEditingTitle(false);
            router.refresh();
        } catch (error) {
            console.error("[CHAPTER_TITLE]", error);
            toast.error(tr("حدث خطأ", "Something went wrong"));
        }
    }

    const onSubmitDescription = async (values: z.infer<typeof descriptionSchema>) => {
        try {
            const response = await fetch(`/api/courses/${courseId}/chapters/${chapterId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                throw new Error(tr("فشل تحديث وصف الفصل", "Failed to update chapter description"));
            }

            toast.success(tr("تم تحديث وصف الفصل", "Chapter description updated"));
            setIsEditingDescription(false);
            router.refresh();
        } catch (error) {
            console.error("[CHAPTER_DESCRIPTION]", error);
            toast.error(tr("حدث خطأ", "Something went wrong"));
        }
    }

    const onSubmitAccess = async (values: z.infer<typeof accessSchema>) => {
        try {
            await fetch(`/api/courses/${courseId}/chapters/${chapterId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            toast.success(tr("تم تحديث إعدادات الوصول", "Chapter access updated"));
            setIsEditingAccess(false);
            router.refresh();
        } catch (error) {
            console.error("[CHAPTER_ACCESS]", error);
            toast.error(tr("حدث خطأ", "Something went wrong"));
        }
    }

    const onPublish = async () => {
        try {
            setIsLoading(true);
            
            await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}/publish`);
            
            toast.success(initialData.isPublished ? tr("تم إلغاء النشر", "Unpublished successfully") : tr("تم النشر", "Published successfully"));
            router.refresh();
        } catch {
            toast.error(tr("حدث خطأ", "Something went wrong"));
        } finally {
            setIsLoading(false);
        }
    }

    if (!isMounted) {
        return null;
    }

    return (
        <div className="space-y-10">
            <div className="flex items-center gap-x-2">
                <IconBadge icon={LayoutDashboard} />
                <h2 className="text-xl">
                    {tr("إعدادات الفصل", "Chapter settings")}
                </h2>
            </div>
            <div className="space-y-4">
                <div className="border bg-card rounded-md p-4">
                    <div className="font-medium flex items-center justify-between">
                        {tr("عنوان الفصل", "Chapter title")}
                        <Button onClick={() => setIsEditingTitle(!isEditingTitle)} variant="ghost">
                            {isEditingTitle ? (
                                <>{tr("إلغاء", "Cancel")}</>
                            ) : (
                                <>
                                    <Pencil className="h-4 w-4 rtl:mr-2 ltr:ml-2" />
                                    {tr("تعديل العنوان", "Edit title")}
                                </>
                            )}
                        </Button>
                    </div>
                    {!isEditingTitle && (
                        <p className={cn(
                            "text-sm mt-2",
                            !initialData.title && "text-muted-foreground italic"
                        )}>
                            {initialData.title || tr("لا يوجد عنوان", "No title")}
                        </p>
                    )}
                    {isEditingTitle && (
                        <Form {...titleForm}>
                            <form
                                onSubmit={titleForm.handleSubmit(onSubmitTitle)}
                                className="space-y-4 mt-4"
                            >
                                <FormField
                                    control={titleForm.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    disabled={isSubmittingTitle}
                                                    placeholder={tr("مثال: مقدمة الفصل", "e.g. Chapter introduction")}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex items-center gap-x-2">
                                    <Button
                                        disabled={!isValidTitle || isSubmittingTitle}
                                        type="submit"
                                    >
                                        {tr("حفظ", "Save")}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}
                </div>
                <div className="border bg-card rounded-md p-4">
                    <div className="font-medium flex items-center justify-between">
                        {tr("وصف الفصل", "Chapter description")}
                        <Button onClick={() => setIsEditingDescription(!isEditingDescription)} variant="ghost">
                            {isEditingDescription ? (
                                <>{tr("إلغاء", "Cancel")}</>
                            ) : (
                                <>
                                    <Pencil className="h-4 w-4 rtl:mr-2 ltr:ml-2" />
                                    {tr("تعديل الوصف", "Edit description")}
                                </>
                            )}
                        </Button>
                    </div>
                    {!isEditingDescription && (
                        <div className={cn(
                            "text-sm mt-2",
                            !initialData.description && "text-muted-foreground italic"
                        )}>
                            {!initialData.description && tr("لا يوجد وصف", "No description")}
                            {initialData.description && (
                                <div 
                                    className="prose prose-sm max-w-none space-y-4"
                                    dangerouslySetInnerHTML={{ __html: initialData.description }}
                                />
                            )}
                        </div>
                    )}
                    {isEditingDescription && (
                        <Form {...descriptionForm}>
                            <form
                                onSubmit={descriptionForm.handleSubmit(onSubmitDescription)}
                                className="space-y-4 mt-4"
                            >
                                <FormField
                                    control={descriptionForm.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Editor
                                                    onChange={field.onChange}
                                                    value={field.value}
                                                    placeholder={tr("مثال: سيتناول هذا الفصل أساسيات...", "e.g. This chapter will cover the basics of...")}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex items-center gap-x-2">
                                    <Button
                                        disabled={!isValidDescription || isSubmittingDescription}
                                        type="submit"
                                    >
                                        {tr("حفظ", "Save")}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-x-2">
                    <IconBadge icon={Eye} />
                    <h2 className="text-xl">
                        {tr("إعدادات الوصول", "Access settings")}
                    </h2>
                </div>
                <div className="space-y-4 mt-4">
                    <div className="border bg-card rounded-md p-4">
                        <div className="font-medium flex items-center justify-between">
                            {tr("إعدادات الوصول", "Access settings")}
                            <Button onClick={() => setIsEditingAccess(!isEditingAccess)} variant="ghost">
                                {isEditingAccess ? (
                                    <>{tr("إلغاء", "Cancel")}</>
                                ) : (
                                    <>
                                        <Pencil className="h-4 w-4 rtl:mr-2 ltr:ml-2" />
                                        {tr("تعديل الوصول", "Edit access")}
                                    </>
                                )}
                            </Button>
                        </div>
                        {!isEditingAccess && (
                            <p className={cn(
                                "text-sm mt-2",
                                !initialData.isFree && "text-muted-foreground italic"
                            )}>
                                {initialData.isFree ? tr("هذا الفصل مجاني للمعاينة", "This chapter is free for preview") : tr("هذا الفصل غير مجاني", "This chapter is not free")}
                            </p>
                        )}
                        {isEditingAccess && (
                            <Form {...accessForm}>
                                <form
                                    onSubmit={accessForm.handleSubmit(onSubmitAccess)}
                                    className="space-y-4 mt-4"
                                >
                                    <FormField
                                        control={accessForm.control}
                                        name="isFree"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormDescription>
                                                        {tr("قم بالتحقق من هذا المربع إذا أردت جعل هذا الفصل مجانيًا للمعاينة", "Check this box if you want to make this chapter free for preview")}
                                                    </FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex items-center gap-x-2">
                                        <Button
                                            disabled={!isValidAccess || isSubmittingAccess}
                                            type="submit"
                                        >
                                            {tr("حفظ", "Save")}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-x-2">
                    <IconBadge icon={Files} />
                    <h2 className="text-xl">
                        {tr("مستندات الفصل", "Chapter documents")}
                    </h2>
                </div>
                <AttachmentsForm
                    initialData={{ attachments: initialData.attachments || [] }}
                    courseId={courseId}
                    chapterId={chapterId}
                />
            </div>

            <div className="border bg-card rounded-md p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">
                            {initialData.isPublished ? tr("الفصل منشور", "Chapter is published") : tr("الفصل غير منشور", "Chapter is unpublished")}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {initialData.isPublished
                                ? tr("يمكن للطلاب مشاهدة هذا الفصل الآن. يمكنك إلغاء النشر لإخفائه مؤقتًا.", "Students can now view this chapter. You can unpublish it to hide it temporarily.")
                                : tr("لن يكون هذا الفصل مرئيًا للطلاب حتى يتم نشره.", "This chapter will not be visible to students until it is published.")}
                        </p>
                    </div>
                    <Button
                        onClick={onPublish}
                        disabled={isLoading}
                        variant={initialData.isPublished ? "outline" : "default"}
                        className={`w-full sm:w-auto px-8 py-6 text-base font-semibold ${!initialData.isPublished ? "bg-green-600 hover:bg-green-700 text-white border-0" : ""}`}
                    >
                        {initialData.isPublished ? (
                            <>
                                <EyeOff className="h-4 w-4 rtl:mr-2 ltr:ml-2" />
                                {tr("إلغاء النشر", "Unpublish")}
                            </>
                        ) : (
                            <>
                                <Eye className="h-4 w-4 rtl:mr-2 ltr:ml-2" />
                                {tr("نشر الفصل", "Publish chapter")}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
} 