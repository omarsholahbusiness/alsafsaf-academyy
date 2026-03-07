"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, Eye, Trash2 } from "lucide-react";
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
    course: {
        title: string;
    };
    questions: Question[];
    createdAt: string;
    updatedAt: string;
}

interface Question {
    id: string;
    text: string;
    imageUrl?: string;
    type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
    options?: string[];
    correctAnswer: string;
    points: number;
}

const QuizzesPage = () => {
    const router = useNavigationRouter();
    const { locale } = useLanguage();
    const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const response = await fetch("/api/teacher/quizzes");
            if (response.ok) {
                const data = await response.json();
                setQuizzes(data);
            }
        } catch (error) {
            console.error("Error fetching quizzes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteQuiz = async (quiz: Quiz) => {
        if (!confirm(tr("هل أنت متأكد من حذف هذا الاختبار؟", "Are you sure you want to delete this quiz?"))) {
            return;
        }

        setIsDeleting(quiz.id);
        try {
            const response = await fetch(`/api/courses/${quiz.courseId}/quizzes/${quiz.id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success(tr("تم حذف الاختبار بنجاح", "Quiz deleted successfully"));
                fetchQuizzes();
            } else {
                toast.error(tr("حدث خطأ أثناء حذف الاختبار", "An error occurred while deleting the quiz"));
            }
        } catch (error) {
            console.error("Error deleting quiz:", error);
            toast.error(tr("حدث خطأ أثناء حذف الاختبار", "An error occurred while deleting the quiz"));
        } finally {
            setIsDeleting(null);
        }
    };

    const handleViewQuiz = (quiz: Quiz) => {
        router.push(`/dashboard/teacher/quizzes/${quiz.id}`);
    };

    const filteredQuizzes = quizzes.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {tr("إدارة الاختبارات", "Quiz management")}
                </h1>
                <Button onClick={() => router.push("/dashboard/teacher/quizzes/create")} className="bg-brand hover:bg-brand/90 text-white">
                    <Plus className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                    {tr("إنشاء اختبار جديد", "Create new quiz")}
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
                                    <TableCell className="font-medium">
                                        {quiz.title}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {quiz.course.title}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {quiz.position}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={quiz.isPublished ? "default" : "secondary"}>
                                            {quiz.isPublished ? tr("منشور", "Published") : tr("مسودة", "Draft")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {quiz.questions.length} {tr("سؤال", "questions")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(quiz.createdAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US")}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center rtl:space-x-reverse space-x-2">
                                            <Button 
                                                size="sm" 
                                                className="bg-brand hover:bg-brand/90 text-white"
                                                onClick={() => handleViewQuiz(quiz)}
                                            >
                                                <Eye className="h-4 w-4" />
                                                {tr("عرض", "View")}
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                className="bg-brand hover:bg-brand/90 text-white"
                                                onClick={() => router.push(`/dashboard/teacher/quizzes/${quiz.id}/edit`)}
                                            >
                                                <Edit className="h-4 w-4" />
                                                {tr("تعديل", "Edit")}
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant={quiz.isPublished ? "destructive" : "default"}
                                                className={!quiz.isPublished ? "bg-brand hover:bg-brand/90 text-white" : ""}
                                                onClick={async () => {
                                                    try {
                                                        const response = await fetch(`/api/teacher/quizzes/${quiz.id}/publish`, {
                                                            method: "PATCH",
                                                            headers: {
                                                                "Content-Type": "application/json",
                                                            },
                                                            body: JSON.stringify({
                                                                isPublished: !quiz.isPublished
                                                            }),
                                                        });
                                                        if (response.ok) {
                                                            toast.success(quiz.isPublished ? tr("تم إلغاء النشر", "Unpublished successfully") : tr("تم النشر بنجاح", "Published successfully"));
                                                            fetchQuizzes();
                                                        }
                                                    } catch (error) {
                                                        toast.error(tr("حدث خطأ", "An error occurred"));
                                                    }
                                                }}
                                            >
                                                {quiz.isPublished ? tr("إلغاء النشر", "Unpublish") : tr("نشر", "Publish")}
                                            </Button>

                                            <Button 
                                                size="sm" 
                                                variant="destructive"
                                                onClick={() => handleDeleteQuiz(quiz)}
                                                disabled={isDeleting === quiz.id}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                {isDeleting === quiz.id ? tr("جاري الحذف...", "Deleting...") : tr("حذف", "Delete")}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default QuizzesPage; 