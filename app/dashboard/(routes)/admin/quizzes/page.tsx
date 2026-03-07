"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import { useNavigationRouter } from "@/lib/hooks/use-navigation-router";
import { useLanguage } from "@/components/providers/rtl-provider";

interface Quiz {
  id: string;
  title: string;
  description: string;
  courseId: string;
  position: number;
  isPublished: boolean;
  course: { id: string; title: string };
  questions: { id: string }[];
  createdAt: string;
}

export default function AdminQuizzesPage() {
  const router = useNavigationRouter();
  const { locale } = useLanguage();
  const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch("/api/admin/quizzes");
        if (response.ok) {
          const data = await response.json();
          setQuizzes(data);
        } else {
          toast.error(tr("تعذر تحميل الاختبارات", "Failed to load quizzes"));
        }
      } catch (e) {
        toast.error(tr("حدث خطأ أثناء التحميل", "An error occurred while loading"));
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const filteredQuizzes = quizzes.filter((quiz) =>
    [quiz.title, quiz.course.title].some((value) =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleViewQuiz = (quiz: Quiz) => {
    router.push(`/dashboard/teacher/quizzes/${quiz.id}`);
  };

  const handleTogglePublish = async (quiz: Quiz) => {
    setPublishingId(quiz.id);
    try {
      const response = await fetch(`/api/teacher/quizzes/${quiz.id}/publish`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublished: !quiz.isPublished }),
      });

      if (!response.ok) {
        throw new Error(tr("حدث خطأ أثناء تحديث حالة الاختبار", "An error occurred while updating quiz status"));
      }

      toast.success(quiz.isPublished ? tr("تم إلغاء النشر", "Unpublished successfully") : tr("تم النشر بنجاح", "Published successfully"));
      setQuizzes((prev) =>
        prev.map((item) =>
          item.id === quiz.id ? { ...item, isPublished: !quiz.isPublished } : item
        )
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tr("حدث خطأ", "An error occurred"));
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (quizId: string, quizTitle: string) => {
    const confirmed = window.confirm(
      locale === "ar"
        ? `هل أنت متأكد من حذف الاختبار "${quizTitle}"؟ سيتم حذف جميع الأسئلة المرتبطة به.`
        : `Are you sure you want to delete quiz "${quizTitle}"? All related questions will be deleted.`
    );
    if (!confirmed) {
      return;
    }

    setDeletingId(quizId);
    try {
      const response = await fetch(`/api/admin/quizzes/${quizId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || tr("تعذر حذف الاختبار", "Failed to delete quiz"));
      }

      setQuizzes((previous) => previous.filter((quiz) => quiz.id !== quizId));
      toast.success(tr("تم حذف الاختبار بنجاح", "Quiz deleted successfully"));
    } catch (error) {
      console.error("[ADMIN_DELETE_QUIZ]", error);
      toast.error(error instanceof Error ? error.message : tr("تعذر حذف الاختبار", "Failed to delete quiz"));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">{tr("جاري التحميل...", "Loading...")}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{tr("كل الاختبارات", "All quizzes")}</h1>
        <Button onClick={() => router.push("/dashboard/admin/quizzes/create")} className="bg-brand hover:bg-brand/90 text-white">
          <Plus className="h-4 w-4" />
          {tr("إنشاء اختبار", "Create quiz")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tr("الاختبارات", "Quizzes")}</CardTitle>
          <div className="flex items-center rtl:space-x-reverse space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={tr("البحث في الاختبارات...", "Search quizzes...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">{tr("عنوان الاختبار", "Quiz title")}</TableHead>
                <TableHead className="text-right">{tr("الكورس", "Course")}</TableHead>
                <TableHead className="text-right">{tr("الموقع", "Position")}</TableHead>
                <TableHead className="text-right">{tr("الحالة", "Status")}</TableHead>
                <TableHead className="text-right">{tr("عدد الأسئلة", "Questions count")}</TableHead>
                <TableHead className="text-right">{tr("تاريخ الإنشاء", "Created at")}</TableHead>
                <TableHead className="text-right">{tr("الإجراءات", "Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">{quiz.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{quiz.course.title}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{quiz.position}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={quiz.isPublished ? "default" : "secondary"}>
                      {quiz.isPublished ? tr("منشور", "Published") : tr("مسودة", "Draft")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{quiz.questions.length} {tr("سؤال", "questions")}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(quiz.createdAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US")}
                  </TableCell>
                  <TableCell className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                      className="bg-brand hover:bg-brand/90 text-white"
                      size="sm"
                      onClick={() => handleViewQuiz(quiz)}
                    >
                      <Eye className="h-4 w-4" />
                      {tr("عرض", "View")}
                    </Button>
                    <Button
                      className="bg-brand hover:bg-brand/90 text-white"
                      size="sm"
                      onClick={() => router.push(`/dashboard/admin/quizzes/${quiz.id}/edit`)}
                    >
                      <Pencil className="h-4 w-4" />
                      {tr("تعديل", "Edit")}
                    </Button>
                    <Button
                      variant={quiz.isPublished ? "destructive" : "default"}
                      className={!quiz.isPublished ? "bg-brand hover:bg-brand/90 text-white" : ""}
                      size="sm"
                      disabled={publishingId === quiz.id}
                      onClick={() => handleTogglePublish(quiz)}
                    >
                      {publishingId === quiz.id
                        ? tr("جاري التحديث...", "Updating...")
                        : quiz.isPublished
                        ? tr("إلغاء النشر", "Unpublish")
                        : tr("نشر", "Publish")}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deletingId === quiz.id}
                      onClick={() => handleDelete(quiz.id, quiz.title)}
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingId === quiz.id ? tr("جاري الحذف...", "Deleting...") : tr("حذف", "Delete")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


