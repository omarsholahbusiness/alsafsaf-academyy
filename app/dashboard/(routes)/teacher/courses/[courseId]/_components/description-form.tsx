"use client"

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Course } from "@prisma/client";
import { useLanguage } from "@/components/providers/rtl-provider";

interface DescriptionFormProps {
    initialData: Course;

    courseId: string;
}

const formSchema = z.object({
    description: z.string().min(1, {
        message: "الوصف مطلوب",
    }),
});

export const DescriptionForm = ({
    initialData,
    courseId
}: DescriptionFormProps) => {
    const { locale } = useLanguage();
    const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);

    const [isEditing, setIsEditing] = useState(false);

    const toggleEdit = () => setIsEditing((current) => !current);

    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: initialData?.description || "",
        }
    });

    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.patch(`/api/courses/${courseId}`, values);
            toast.success(tr("تم تحديث الكورس", "Course updated"));
            toggleEdit();
            router.refresh();
        } catch {
            toast.error(tr("حدث خطأ", "Something went wrong"));
        }
    }

    return (
        <div className="mt-6 border bg-card rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                {tr("الوصف", "Description")}
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing && <>{tr("إلغاء", "Cancel")}</>}
                    {!isEditing && (
                    <>
                        <Pencil className="h-4 w-4 rtl:mr-2 ltr:ml-2" />
                        {tr("تعديل الوصف", "Edit description")}
                    </>)}
                </Button>
            </div>
            {!isEditing && (
                <p className={cn(
                    "text-sm mt-2 text-muted-foreground",
                    !initialData.description && "text-muted-foreground italic"
                )}>
                    {initialData.description || tr("لا يوجد وصف", "No description")}
                </p>
            )}

            {isEditing && (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <FormField 
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea 
                                            disabled={isSubmitting}
                                            placeholder={tr("مثال: هذه الكورس عن...", "e.g. This course is about...")}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-center gap-x-2">
                            <Button disabled={!isValid || isSubmitting} type="submit">
                                {tr("حفظ", "Save")}
                            </Button>
                        </div>
                    </form>
                </Form>
            )}
        </div>
    )
}