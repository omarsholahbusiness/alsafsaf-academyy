"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { File, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { UploadButton } from "@/lib/uploadthing";
import { useLanguage } from "@/components/providers/rtl-provider";

interface AttachmentsFormProps {
    initialData: {
        id: string;
        attachments: {
            id: string;
            name: string;
            url: string;
        }[];
    };
    courseId: string;
}

export const AttachmentsForm = ({
    initialData,
    courseId
}: AttachmentsFormProps) => {
    const { locale } = useLanguage();
    const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const router = useRouter();

    const onDelete = async (id: string) => {
        try {
            setIsDeleting(id);
            await axios.delete(`/api/courses/${courseId}/attachments/${id}`);
            toast.success(tr("تم حذف الملف", "File deleted"));
            router.refresh();
        } catch {
            toast.error(tr("حدث خطأ", "Something went wrong"));
        } finally {
            setIsDeleting(null);
        }
    }

    return (
        <div className="mt-6 border bg-card rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <File className="h-5 w-5" />
                    <h2 className="text-lg font-medium">
                        {tr("الملفات والمرفقات", "Files and attachments")}
                    </h2>
                </div>
                <UploadButton
                    endpoint="courseAttachment"
                    onClientUploadComplete={async (res) => {
                        if (res && res[0]) {
                            try {
                                await axios.post(`/api/courses/${courseId}/attachments`, {
                                    url: res[0].url,
                                    name: res[0].name
                                });
                                toast.success(tr("تم رفع الملف", "File uploaded"));
                                router.refresh();
                            } catch {
                                toast.error(tr("حدث خطأ", "Something went wrong"));
                            }
                        }
                    }}
                    onUploadError={(error: Error) => {
                        toast.error(`${tr("حدث خطأ", "Error")}: ${error.message}`);
                    }}
                />
            </div>
            {initialData.attachments.length === 0 && (
                <div className="flex items-center justify-center h-60 bg-muted rounded-md mt-4">
                    <p className="text-sm text-muted-foreground">
                        {tr("لا يوجد ملفات حاليا", "No files yet")}
                    </p>
                </div>
            )}
            {initialData.attachments.length > 0 && (
                <div className="space-y-2 mt-4">
                    {initialData.attachments.map((attachment) => (
                        <div
                            key={attachment.id}
                            className="flex items-center p-3 w-full bg-muted rounded-md border"
                        >
                            <File className="h-4 w-4 rtl:mr-2 ltr:ml-2 flex-shrink-0 text-muted-foreground" />
                            <p className="text-sm line-clamp-1">
                                {attachment.name}
                            </p>
                            <div className="rtl:mr-auto ltr:ml-auto flex items-center gap-x-2">
                                {isDeleting === attachment.id && (
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                )}
                                {isDeleting !== attachment.id && (
                                    <Button
                                        onClick={() => onDelete(attachment.id)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}; 