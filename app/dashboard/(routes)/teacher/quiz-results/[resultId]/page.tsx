"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, FileText, User, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { parseQuizOptions } from "@/lib/utils";
import { useLanguage } from "@/components/providers/rtl-provider";

interface QuizResult {
    id: string;
    studentId: string;
    quizId: string;
    score: number;
    totalPoints: number;
    submittedAt: string;
    user: {
        fullName: string;
        phoneNumber: string;
    };
    quiz: {
        title: string;
        course: {
            id: string;
            title: string;
        };
    };
    answers: QuizAnswer[];
}

interface QuizAnswer {
    id: string;
    questionId: string;
    answer: string;
    isCorrect: boolean;
    points: number;
    question: {
        text: string;
        type: string;
        points: number;
        options?: string[];
        correctAnswer?: string;
        imageUrl?: string;
    };
}

const QuizResultDetailPage = ({ params }: { params: Promise<{ resultId: string }> }) => {
    const router = useRouter();
    const { locale } = useLanguage();
    const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);
    const [result, setResult] = useState<QuizResult | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Unwrap the params Promise
    const resolvedParams = use(params);
    const { resultId } = resolvedParams;

    useEffect(() => {
        fetchQuizResult();
    }, [resultId]);

    const fetchQuizResult = async () => {
        try {
            const response = await fetch(`/api/teacher/quiz-results/${resultId}`);
            if (response.ok) {
                const data = await response.json();
                // Parse options for multiple choice questions
                const parsedData = {
                    ...data,
                    answers: data.answers.map((answer: any) => ({
                        ...answer,
                        question: {
                            ...answer.question,
                            options: parseQuizOptions(answer.question.options)
                        }
                    }))
                };
                setResult(parsedData);
            } else {
                toast.error(tr("لم يتم العثور على النتيجة", "Result not found"));
                router.push("/dashboard/teacher/quiz-results");
            }
        } catch (error) {
            console.error("Error fetching quiz result:", error);
            toast.error(tr("حدث خطأ أثناء تحميل النتيجة", "An error occurred while loading the result"));
        } finally {
            setLoading(false);
        }
    };

    const calculatePercentage = (score: number, totalPoints: number) => {
        return totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    };

    const getGradeColor = (percentage: number) => {
        if (percentage >= 90) return "text-green-600";
        if (percentage >= 80) return "text-green-500";
        if (percentage >= 70) return "text-green-400";
        if (percentage >= 60) return "text-orange-600";
        return "text-red-600";
    };

    const getGradeBadge = (percentage: number) => {
        if (percentage >= 90) return { variant: "default" as const, text: tr("ممتاز", "Excellent") };
        if (percentage >= 80) return { variant: "default" as const, text: tr("جيد جداً", "Very good") };
        if (percentage >= 70) return { variant: "secondary" as const, text: tr("جيد", "Good") };
        if (percentage >= 60) return { variant: "outline" as const, text: tr("مقبول", "Pass") };
        return { variant: "destructive" as const, text: tr("ضعيف", "Weak") };
    };

    const renderQuestionChoices = (answer: QuizAnswer) => {
        if (answer.question.type === "MULTIPLE_CHOICE" && answer.question.options) {
            return (
                <div className="space-y-2">
                    <h5 className="font-medium text-sm">{tr("الخيارات:", "Options:")}</h5>
                    <div className="space-y-1">
                        {answer.question.options.map((option: string, optionIndex: number) => (
                            <div
                                key={optionIndex}
                                className={`p-2 rounded border ${
                                    option === answer.answer
                                        ? answer.isCorrect
                                            ? "bg-green-50 border-green-200"
                                            : "bg-red-50 border-red-200"
                                        : option === answer.question.correctAnswer
                                        ? "bg-green-50 border-green-200"
                                        : "bg-gray-50"
                                }`}
                            >
                                <span className="text-sm">
                                    {optionIndex + 1}. {option}
                                    {option === answer.answer && (
                                        <Badge variant={answer.isCorrect ? "default" : "destructive"} className="mr-2">
                                            {tr("إجابة الطالب", "Student answer")}
                                        </Badge>
                                    )}
                                    {option === answer.question.correctAnswer && option !== answer.answer && (
                                        <Badge variant="default" className="mr-2">
                                            {tr("الإجابة الصحيحة", "Correct answer")}
                                        </Badge>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center">{tr("جاري التحميل...", "Loading...")}</div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="p-6">
                <div className="text-center">{tr("لم يتم العثور على النتيجة", "Result not found")}</div>
            </div>
        );
    }

    const percentage = calculatePercentage(result.score, result.totalPoints);
    const grade = getGradeBadge(percentage);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center rtl:space-x-reverse space-x-4">
                    <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard/teacher/quiz-results")}
                    >
                        <ArrowLeft className="h-4 w-4 rtl:ml-2 ltr:mr-2 rtl:rotate-0 ltr:rotate-180" />
                        {tr("العودة", "Back")}
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {tr("تفاصيل النتيجة", "Result details")}
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{tr("معلومات الطالب والاختبار", "Student and quiz information")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center rtl:space-x-reverse space-x-3">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <h4 className="font-medium">{tr("الطالب", "Student")}</h4>
                                        <p className="text-sm text-muted-foreground">{result.user.fullName}</p>
                                        <p className="text-xs text-muted-foreground">{result.user.phoneNumber}</p>
                                    </div>
                                </div>
                                <div className="flex items-center rtl:space-x-reverse space-x-3">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <h4 className="font-medium">{tr("الاختبار", "Quiz")}</h4>
                                        <p className="text-sm text-muted-foreground">{result.quiz.title}</p>
                                        <p className="text-xs text-muted-foreground">{result.quiz.course.title}</p>
                                    </div>
                                </div>
                                <div className="flex items-center rtl:space-x-reverse space-x-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <h4 className="font-medium">{tr("تاريخ التقديم", "Submission date")}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(result.submittedAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US")}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center rtl:space-x-reverse space-x-3">
                                    <Clock className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <h4 className="font-medium">{tr("وقت التقديم", "Submission time")}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(result.submittedAt).toLocaleTimeString(locale === "ar" ? "ar-EG" : "en-US")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{tr("النتيجة النهائية", "Final result")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 border rounded-lg">
                                    <div className="text-2xl font-bold">{result.score} / {result.totalPoints}</div>
                                    <p className="text-sm text-muted-foreground">{tr("الدرجة", "Score")}</p>
                                </div>
                                <div className="text-center p-4 border rounded-lg">
                                    <div className={`text-2xl font-bold ${getGradeColor(percentage)}`}>
                                        {percentage}%
                                    </div>
                                    <p className="text-sm text-muted-foreground">{tr("النسبة المئوية", "Percentage")}</p>
                                </div>
                                <div className="text-center p-4 border rounded-lg">
                                    <Badge variant={grade.variant} className="text-lg px-4 py-2">
                                        {grade.text}
                                    </Badge>
                                    <p className="text-sm text-muted-foreground mt-2">{tr("التقييم", "Evaluation")}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{tr("تفاصيل الإجابات", "Answer details")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {result.answers.map((answer, index) => (
                                <div key={answer.id} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium">{tr("السؤال", "Question")} {index + 1}</h4>
                                        <div className="flex items-center rtl:space-x-reverse space-x-2">
                                            <Badge variant="outline">{answer.question.points} {tr("درجة", "points")}</Badge>
                                            {answer.isCorrect ? (
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-600" />
                                            )}
                                        </div>
                                    </div>
                                    
                                    <p className="text-muted-foreground mb-3">{answer.question.text}</p>
                                    
                                    {/* Question Image */}
                                    {answer.question.imageUrl && (
                                        <div className="mb-3">
                                            <img 
                                                src={answer.question.imageUrl} 
                                                alt="Question" 
                                                className="max-w-full h-auto max-h-64 rounded-lg border shadow-sm"
                                            />
                                        </div>
                                    )}
                                    
                                    {answer.question.type === "MULTIPLE_CHOICE" && renderQuestionChoices(answer)}
                                    
                                    {answer.question.type === "TRUE_FALSE" && (
                                        <div className="space-y-2">
                                            <h5 className="font-medium text-sm">{tr("الإجابة الصحيحة:", "Correct answer:")}</h5>
                                            <div className="space-y-1">
                                                <div className={`p-2 rounded border ${
                                                    answer.question.correctAnswer === "true"
                                                        ? "bg-green-50 border-green-200"
                                                        : "bg-gray-50"
                                                }`}>
                                                    <span className="text-sm">{tr("صح", "True")}</span>
                                                    {answer.question.correctAnswer === "true" && (
                                                        <Badge variant="default" className="mr-2">{tr("الإجابة الصحيحة", "Correct answer")}</Badge>
                                                    )}
                                                </div>
                                                <div className={`p-2 rounded border ${
                                                    answer.question.correctAnswer === "false"
                                                        ? "bg-green-50 border-green-200"
                                                        : "bg-gray-50"
                                                }`}>
                                                    <span className="text-sm">{tr("خطأ", "False")}</span>
                                                    {answer.question.correctAnswer === "false" && (
                                                        <Badge variant="default" className="mr-2">{tr("الإجابة الصحيحة", "Correct answer")}</Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <span className="text-sm font-medium">{tr("إجابة الطالب", "Student answer")}: </span>
                                                <Badge variant={answer.isCorrect ? "default" : "destructive"}>
                                                    {answer.answer === "true" ? tr("صح", "True") : tr("خطأ", "False")}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {answer.question.type === "SHORT_ANSWER" && (
                                        <div className="space-y-2">
                                            <h5 className="font-medium text-sm">{tr("الإجابة الصحيحة:", "Correct answer:")}</h5>
                                            <p className="text-sm bg-green-50 p-2 rounded border border-green-200">
                                                {answer.question.correctAnswer}
                                            </p>
                                            <div className="mt-2">
                                                <span className="text-sm font-medium">{tr("إجابة الطالب", "Student answer")}: </span>
                                                <p className={`text-sm p-2 rounded border ${
                                                    answer.isCorrect 
                                                        ? "bg-green-50 border-green-200" 
                                                        : "bg-red-50 border-red-200"
                                                }`}>
                                                    {answer.answer}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="mt-3 pt-3 border-t">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{tr("الدرجات المكتسبة", "Earned points")}:</span>
                                            <span className={`text-sm font-medium ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                                {answer.points} / {answer.question.points}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{tr("ملخص النتيجة", "Result summary")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span>{tr("إجمالي الدرجات", "Total points")}</span>
                                <Badge variant="default">{result.totalPoints} {tr("درجة", "points")}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>{tr("الدرجات المكتسبة", "Earned points")}</span>
                                <Badge variant="secondary">{result.score} {tr("درجة", "points")}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>{tr("الدرجات المفقودة", "Missing points")}</span>
                                <Badge variant="outline">{result.totalPoints - result.score} {tr("درجة", "points")}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>{tr("عدد الأسئلة الصحيحة", "Correct questions count")}</span>
                                <Badge variant="default">
                                    {result.answers.filter(a => a.isCorrect).length} {tr("سؤال", "questions")}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>{tr("عدد الأسئلة الخاطئة", "Incorrect questions count")}</span>
                                <Badge variant="destructive">
                                    {result.answers.filter(a => !a.isCorrect).length} {tr("سؤال", "questions")}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{tr("الإجراءات", "Actions")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={() => router.push(`/dashboard/teacher/quiz-results?quizId=${result.quizId}`)}
                            >
                                {tr("عرض جميع نتائج هذا الاختبار", "View all results for this quiz")}
                            </Button>
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={() => router.push(`/dashboard/teacher/quizzes/${result.quizId}`)}
                            >
                                {tr("عرض تفاصيل الاختبار", "View quiz details")}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default QuizResultDetailPage; 