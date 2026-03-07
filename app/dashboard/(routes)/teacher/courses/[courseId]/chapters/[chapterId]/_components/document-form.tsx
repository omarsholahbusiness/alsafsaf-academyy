"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, Pencil, Upload, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import toast from "react-hot-toast";
import { useLanguage } from "@/components/providers/rtl-provider";

interface DocumentFormProps {
    initialData: {
        documentUrl: string | null;
        documentName: string | null;
    };
    courseId: string;
    chapterId: string;
}

export const DocumentForm = ({
    initialData,
    courseId,
    chapterId
}: DocumentFormProps) => {
    const { locale } = useLanguage();
    const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);
    const [isEditing, setIsEditing] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    // Helper function to extract filename from URL
    const getFilenameFromUrl = (url: string): string => {
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            const filename = pathname.split('/').pop();
            
            if (filename) {
                // Decode URL encoding and handle special characters
                const decodedFilename = decodeURIComponent(filename);
                // Remove query parameters if any
                const cleanFilename = decodedFilename.split('?')[0];
                return cleanFilename || tr("مستند الفصل", "Chapter document");
            }
            return tr("مستند الفصل", "Chapter document");
        } catch {
            return tr("مستند الفصل", "Chapter document");
        }
    };

    // Helper function to download document
    const downloadDocument = async (url: string) => {
        try {
            const relative = `/api/courses/${courseId}/chapters/${chapterId}/document/download`;
            const absoluteUrl = typeof window !== 'undefined' ? new URL(relative, window.location.origin).toString() : relative;
            // Navigate directly to download URL to leverage WebView native download handling
            window.location.href = absoluteUrl;
        } catch (error) {
            console.error('Download failed:', error);
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const onSubmitUpload = async (url: string, name: string) => {
        try {
            setIsSubmitting(true);
            const response = await fetch(`/api/courses/${courseId}/chapters/${chapterId}/document`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url, name }),
            });

            if (!response.ok) {
                throw new Error('Failed to upload document');
            }

            toast.success(tr("تم رفع المستند بنجاح", "Document uploaded successfully"));
            setIsEditing(false);
            router.refresh();
        } catch (error) {
            console.error("[CHAPTER_DOCUMENT]", error);
            toast.error(tr("حدث خطأ ما", "Something went wrong"));
        } finally {
            setIsSubmitting(false);
        }
    }

    const onDelete = async () => {
        try {
            setIsSubmitting(true);
            const response = await fetch(`/api/courses/${courseId}/chapters/${chapterId}/document`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete document');
            }

            toast.success(tr("تم حذف المستند بنجاح", "Document deleted successfully"));
            router.refresh();
        } catch (error) {
            console.error("[CHAPTER_DOCUMENT_DELETE]", error);
            toast.error(tr("حدث خطأ ما", "Something went wrong"));
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!isMounted) {
        return null;
    }

    return (
        <div className="mt-6 border bg-card rounded-md p-4">
            <div className="font-medium flex items-center justify-between">
                {tr("مستند الفصل", "Chapter document")}
                <Button onClick={() => setIsEditing(!isEditing)} variant="ghost">
                    {isEditing ? (
                        <>{tr("إلغاء", "Cancel")}</>
                    ) : (
                        <>
                            <Pencil className="h-4 w-4 rtl:mr-2 ltr:ml-2" />
                            {tr("تعديل المستند", "Edit document")}
                        </>
                    )}
                </Button>
            </div>
            
            {!isEditing && (
                <div className="mt-2">
                    {initialData.documentUrl ? (
                        <div className="flex items-center p-3 w-full bg-secondary/50 border-secondary/50 border text-secondary-foreground rounded-md">
                            <FileText className="h-4 w-4 rtl:mr-2 ltr:ml-2 flex-shrink-0" />
                            <div className="flex flex-col min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                    {initialData.documentName || getFilenameFromUrl(initialData.documentUrl || '')}
                                </p>
                                <p className="text-xs text-muted-foreground">{tr("مستند الفصل", "Chapter document")}</p>
                            </div>
                            <div className="rtl:mr-auto ltr:ml-auto flex items-center gap-2 flex-shrink-0">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(initialData.documentUrl!, '_blank')}
                                >
                                    {tr("عرض", "View")}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        if (initialData.documentUrl) {
                                            downloadDocument(initialData.documentUrl).catch(console.error);
                                        }
                                    }}
                                    className="flex items-center gap-1"
                                >
                                    <Download className="h-3 w-3" />
                                    {tr("تحميل", "Download")}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onDelete}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    ) : (
                                        <X className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm mt-2 text-muted-foreground italic">
                            {tr("لا يوجد مستند مرفوع", "No uploaded document")}
                        </p>
                    )}
                </div>
            )}
            
            {isEditing && (
                <div className="mt-4">
                    <FileUpload
                        endpoint="courseAttachment"
                        onChange={(res) => {
                            if (res) {
                                onSubmitUpload(res.url, res.name);
                            }
                        }}
                    />
                    <div className="text-xs text-muted-foreground mt-4">
                        {tr("أضف مستندات إضافية قد يحتاجها الطلاب لفهم الفصل بشكل أفضل.", "Add supporting documents students may need to better understand this chapter.")}
                    </div>
                </div>
            )}
        </div>
    );
}; 