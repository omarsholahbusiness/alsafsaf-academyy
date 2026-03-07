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
import { Course } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";
import { useLanguage } from "@/components/providers/rtl-provider";

interface PriceFormProps {
    initialData: Course;

    courseId: string;
}

const formSchema = z.object({
    price: z.coerce.number()
});

export const PriceForm = ({
    initialData,
    courseId
}: PriceFormProps) => {
    const { locale } = useLanguage();
    const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);

    const [isEditing, setIsEditing] = useState(false);

    const toggleEdit = () => setIsEditing((current) => !current);

    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            price: initialData?.price ?? 0,
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
                {tr("سعر الكورس", "Course price")}
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing && <>{tr("إلغاء", "Cancel")}</>}
                    {!isEditing && (
                    <>
                        <Pencil className="h-4 w-4 rtl:mr-2 ltr:ml-2" />
                        {tr("تعديل السعر", "Edit price")}
                    </>)}
                </Button>
            </div>
            {!isEditing && (
                <p className={cn(
                    "text-sm mt-2 text-muted-foreground",
                    !initialData.price && initialData.price !== 0 && "text-muted-foreground italic"
                )}>
                    {initialData.price === 0
                      ? tr("مجاني", "Free")
                      : initialData.price
                      ? formatPrice(initialData.price)
                      : tr("لا يوجد سعر", "No price")
                    }
                </p>
            )}

            {isEditing && (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <FormField 
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input 
                                            type="number"
                                            step="0.01"
                                            disabled={isSubmitting}
                                            placeholder={tr("ضع سعر للكورس", "Set a course price")}
                                            value={field.value || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                field.onChange(value === '' ? 0 : parseFloat(value));
                                            }}
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