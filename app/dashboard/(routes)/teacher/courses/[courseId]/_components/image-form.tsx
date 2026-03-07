"use client"

import axios from "axios";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ImageIcon, Pencil, PlusCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Course } from "@prisma/client";
import Image from "next/image";
import { FileUpload } from "@/components/file-upload";
import { useLanguage } from "@/components/providers/rtl-provider";

interface ImageFormProps {
    initialData: Course;
    courseId: string;
}

export const ImageForm = ({
    initialData,
    courseId
}: ImageFormProps) => {
    const { locale } = useLanguage();
    const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);

    const [isEditing, setIsEditing] = useState(false);

    const toggleEdit = () => setIsEditing((current) => !current);

    const router = useRouter();

    const onSubmit = async (values: { imageUrl: string }) => {
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
                {tr("صورة الكورس", "Course image")}
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing && <>{tr("إلغاء", "Cancel")}</>}
                    {!isEditing && !initialData.imageUrl && (
                        <>
                            <PlusCircle className="h-4 w-4 rtl:mr-2 ltr:ml-2"/>
                            {tr("إضافة صورة", "Add image")}
                        </>
                    )}
                    {!isEditing && initialData.imageUrl && (
                    <>
                        <Pencil className="h-4 w-4 rtl:mr-2 ltr:ml-2" />
                        {tr("تعديل الصورة", "Edit image")}
                    </>)}
                </Button>
            </div>
            {!isEditing && (
                !initialData.imageUrl ? (
                    <div className="flex items-center justify-center h-60 bg-muted rounded-md">
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                ) : (
                    <div className="relative aspect-video mt-2">
                        <Image
                            alt={tr("رفع الصورة", "Uploaded image")}
                            fill
                            className="object-cover rounded-md"
                            src={initialData.imageUrl}
                        />
                    </div>
                )
            )}

            {isEditing && (
                <div>
                    <FileUpload
                        endpoint="courseImage"
                        onChange={(res) => {
                            if (res) {
                                onSubmit({ imageUrl: res.url })
                            }
                        }}
                    />

                    <div className="text-xs text-muted-foreground mt-4">
                        {tr("النسبة العرضية 16:9 موصى بها", "16:9 aspect ratio recommended")}
                    </div>
                </div>
            )}
        </div>
    )
}