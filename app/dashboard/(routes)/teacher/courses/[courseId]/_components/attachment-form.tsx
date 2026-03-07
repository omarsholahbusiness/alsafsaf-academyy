"use client"

import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { File, Loader2, PlusCircle, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { FileUpload } from "@/components/file-upload";
import { Attachment, Course } from "@prisma/client";
import { useLanguage } from "@/components/providers/rtl-provider";

interface AttachmentFormProps {
    initialData: Course & { attachments: Attachment[] };
    courseId: string;
}

export const AttachmentForm = ({
    initialData,
    courseId
}: AttachmentFormProps) => {
    const { locale } = useLanguage();
    const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);
    const [isEditing, setIsEditing] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const toggleEdit = () => setIsEditing((current) => !current);

    const router = useRouter();

    const onSubmit = async (values: { url: string; name: string }) => {
        try {
            await axios.post(`/api/courses/${courseId}/attachments`, values);
            toast.success(tr("تم تحديث الكورس", "Course updated"));
            toggleEdit();
            router.refresh();
        } catch {
            toast.error(tr("حدث خطأ", "Something went wrong"));
        }
    }

    const onDelete = async (id: string) => {
        try {
            setDeletingId(id);
            await axios.delete(`/api/courses/${courseId}/attachments/${id}`);
            toast.success(tr("تم حذف المرفق", "Attachment deleted"));
            router.refresh();
        } catch {
            toast.error(tr("حدث خطأ", "Something went wrong"));
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="mt-6 border bg-card rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                {tr("المرفقات", "Attachments")}
                <Button onClick={toggleEdit} variant="ghost">
                    {isEditing && <>{tr("إلغاء", "Cancel")}</>}
                    {!isEditing && (
                        <>
                            <PlusCircle className="h-4 w-4 rtl:mr-2 ltr:ml-2" />
                            {tr("إضافة ملف", "Add file")}
                        </>
                    )}
                </Button>
            </div>
            {!isEditing && (
                <>
                    {initialData.attachments.length === 0 && (
                        <p className="text-sm mt-2 text-muted-foreground italic">
                            {tr("لا يوجد ملفات مرفوعة", "No uploaded files")}
                        </p>
                    )}
                    {initialData.attachments.length > 0 && (
                        <div className="space-y-2">
                            {initialData.attachments.map((attachment) => (
                                <div
                                    key={attachment.id}
                                    className="flex items-center p-3 w-full bg-secondary/50 border-secondary/50 border text-secondary-foreground rounded-md"
                                >
                                    <File className="h-4 w-4 rtl:mr-2 ltr:ml-2" />
                                    <p className="text-xs line-clamp-1">
                                        {attachment.name}
                                    </p>
                                    {deletingId === attachment.id && (
                                        <div className="rtl:mr-auto ltr:ml-auto">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        </div>
                                    )}
                                    {deletingId !== attachment.id && (
                                        <button
                                            onClick={() => onDelete(attachment.id)}
                                            className="rtl:mr-auto ltr:ml-auto hover:opacity-75 transition"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
            {isEditing && (
                <div>
                    <FileUpload
                        endpoint="courseAttachment"
                        onChange={(res) => {
                            if (res) {
                                onSubmit({ 
                                    url: res.url,
                                    name: res.name 
                                });
                            }
                        }}
                    />
                    <div className="text-xs text-muted-foreground mt-4">
                        {tr("أضف أي شيء قد يحتاجه الطلاب لإكمال الكورس.", "Add anything students may need to complete the course.")}
                    </div>
                </div>
            )}
        </div>
    )
} 