"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Eye, FileText } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/rtl-provider";

interface Quiz {
    id: string;
    title: string;
    description: string;
    courseId: string;
    position: number;
    isPublished: boolean;
    course: {
        id: string;
        title: string;
    };
    questions: Question[];
    createdAt: string;
    updatedAt: string;
}

interface Question {
    id: string;
    text: string;
    type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
    options?: string[];
    correctAnswer: string;
    points: number;
}

const QuizViewPage = ({ params }: { params: Promise<{ quizId: string }> }) => {
    const { locale } = useLanguage();
    const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);
    const router = useRouter();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Unwrap the params Promise
    const resolvedParams = use(params);
    const { quizId } = resolvedParams;

    useEffect(() => {
        fetchQuiz();
    }, [quizId]);

    const fetchQuiz = async () => {
        try {
            const response = await fetch(`/api/teacher/quizzes/${quizId}`);
            if (response.ok) {
                const data = await response.json();
                setQuiz(data);
            } else {
                toast.error(tr("لم يتم العثور على الاختبار", "Quiz not found"));
                router.push("/dashboard/teacher/quizzes");
            }
        } catch (error) {
            console.error("Error fetching quiz:", error);
            toast.error(tr("حدث خطأ أثناء تحميل الاختبار", "An error occurred while loading quiz"));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteQuiz = async () => {
        if (!quiz || !confirm(tr("هل أنت متأكد من حذف هذا الاختبار؟", "Are you sure you want to delete this quiz?"))) {
            return;
        }

        try {
            const response = await fetch(`/api/courses/${quiz.courseId}/quizzes/${quiz.id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success(tr("تم حذف الاختبار بنجاح", "Quiz deleted successfully"));
                router.push("/dashboard/teacher/quizzes");
            } else {
                toast.error(tr("حدث خطأ أثناء حذف الاختبار", "An error occurred while deleting quiz"));
            }
        } catch (error) {
            console.error("Error deleting quiz:", error);
            toast.error(tr("حدث خطأ أثناء حذف الاختبار", "An error occurred while deleting quiz"));
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center">{tr("جاري التحميل...", "Loading...")}</div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="p-6">
                <div className="text-center">{tr("لم يتم العثور على الاختبار", "Quiz not found")}</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center rtl:space-x-reverse space-x-4">
                    <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard/teacher/quizzes")}
                    >
                        <ArrowLeft className="h-4 w-4 rtl:mr-2 ltr:ml-2" />
                        {tr("العودة", "Back")}
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {quiz.title}
                    </h1>
                </div>
                <div className="flex items-center rtl:space-x-reverse space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/dashboard/teacher/quizzes/${quiz.id}/edit`)}
                    >
                        <Edit className="h-4 w-4 rtl:mr-2 ltr:ml-2" />
                        {tr("تعديل", "Edit")}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDeleteQuiz}
                    >
                        <Trash2 className="h-4 w-4 rtl:mr-2 ltr:ml-2" />
                        {tr("حذف", "Delete")}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{tr("تفاصيل الاختبار", "Quiz details")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">{tr("الوصف", "Description")}</h3>
                                <p className="text-muted-foreground">{quiz.description || tr("لا يوجد وصف", "No description")}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium mb-1">{tr("الكورس", "Course")}</h4>
                                    <Badge variant="outline">{quiz.course.title}</Badge>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-1">{tr("الموقع", "Position")}</h4>
                                    <Badge variant="secondary">{quiz.position}</Badge>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-1">{tr("الحالة", "Status")}</h4>
                                    <Badge variant={quiz.isPublished ? "default" : "secondary"}>
                                        {quiz.isPublished ? tr("منشور", "Published") : tr("مسودة", "Draft")}
                                    </Badge>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-1">{tr("عدد الأسئلة", "Number of questions")}</h4>
                                    <Badge variant="secondary">{quiz.questions.length} {tr("سؤال", "questions")}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="h-5 w-5 mr-2" />
                                {tr("الأسئلة", "Questions")} ({quiz.questions.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {quiz.questions.map((question, index) => (
                                <div key={question.id} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium">{tr("السؤال", "Question")} {index + 1}</h4>
                                        <Badge variant="outline">{question.points} {tr("درجة", "points")}</Badge>
                                    </div>
                                    
                                    <p className="text-muted-foreground mb-3">{question.text}</p>
                                    
                                    <div className="space-y-2">
                                        <div className="flex items-center rtl:space-x-reverse space-x-2">
                                            <Badge variant="secondary">{question.type}</Badge>
                                        </div>
                                        
                                        {question.type === "MULTIPLE_CHOICE" && question.options && (
                                            <div className="space-y-2">
                                                <h5 className="font-medium text-sm">{tr("الخيارات:", "Options:")}</h5>
                                                <div className="space-y-1">
                                                    {question.options.map((option, optionIndex) => (
                                                        <div
                                                            key={optionIndex}
                                                            className={`p-2 rounded border ${
                                                                option === question.correctAnswer
                                                                    ? "bg-green-50 border-green-200"
                                                                    : "bg-gray-50"
                                                            }`}
                                                        >
                                                            <span className="text-sm">
                                                                {optionIndex + 1}. {option}
                                                                {option === question.correctAnswer && (
                                                                    <Badge variant="default" className="mr-2">
                                                                        {tr("الإجابة الصحيحة", "Correct answer")}
                                                                    </Badge>
                                                                )}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {question.type === "TRUE_FALSE" && (
                                            <div className="space-y-2">
                                                <h5 className="font-medium text-sm">{tr("الإجابة الصحيحة:", "Correct answer:")}</h5>
                                                <Badge variant="default">
                                                    {question.correctAnswer === "true" ? tr("صح", "True") : tr("خطأ", "False")}
                                                </Badge>
                                            </div>
                                        )}
                                        
                                        {question.type === "SHORT_ANSWER" && (
                                            <div className="space-y-2">
                                                <h5 className="font-medium text-sm">{tr("الإجابة الصحيحة:", "Correct answer:")}</h5>
                                                <p className="text-sm bg-green-50 p-2 rounded border border-green-200">
                                                    {question.correctAnswer}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{tr("إحصائيات", "Statistics")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span>{tr("إجمالي الدرجات", "Total points")}</span>
                                <Badge variant="default">
                                    {quiz.questions.reduce((sum, q) => sum + q.points, 0)} {tr("درجة", "points")}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>{tr("تاريخ الإنشاء", "Created at")}</span>
                                <span className="text-sm text-muted-foreground">
                                    {new Date(quiz.createdAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US")}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>{tr("آخر تحديث", "Last update")}</span>
                                <span className="text-sm text-muted-foreground">
                                    {new Date(quiz.updatedAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US")}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{tr("الإجراءات السريعة", "Quick actions")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={() => router.push(`/dashboard/teacher/quizzes/${quiz.id}/edit`)}
                            >
                                <Edit className="h-4 w-4 rtl:mr-2 ltr:ml-2" />
                                {tr("تعديل الاختبار", "Edit quiz")}
                            </Button>
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={() => router.push(`/dashboard/teacher/quiz-results?quizId=${quiz.id}`)}
                            >
                                <Eye className="h-4 w-4 rtl:mr-2 ltr:ml-2" />
                                {tr("عرض النتائج", "View results")}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default QuizViewPage; 