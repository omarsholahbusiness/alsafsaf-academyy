"use client";

import { useState, useEffect, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ArrowLeft, Eye } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
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
    };
}

const QuizResultsContent = () => {
    const router = useRouter();
    const { locale } = useLanguage();
    const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);
    const searchParams = useSearchParams();
    const quizId = searchParams.get('quizId');
    
    const [results, setResults] = useState<QuizResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [quizDetails, setQuizDetails] = useState<{ title?: string; course?: { title?: string }; questions?: unknown[] } | null>(null);
    const [filteredResults, setFilteredResults] = useState<QuizResult[]>([]);

    useEffect(() => {
        if (quizId) {
            fetchQuizResults();
            fetchQuizDetails();
        } else {
            toast.error(tr("لم يتم تحديد الاختبار", "Quiz is not specified"));
            router.push("/dashboard/teacher/quizzes");
        }
    }, [quizId]);

    useEffect(() => {
        // Filter results based on search term
        let filtered = results;
        
        if (searchTerm) {
            filtered = filtered.filter(result =>
                result.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                result.user.phoneNumber.includes(searchTerm)
            );
        }
        
        setFilteredResults(filtered);
    }, [results, searchTerm]);

    const fetchQuizResults = async () => {
        try {
            const response = await fetch(`/api/teacher/quiz-results?quizId=${quizId}`);
            if (response.ok) {
                const data = await response.json();
                setResults(data);
            } else {
                toast.error(tr("حدث خطأ أثناء تحميل النتائج", "An error occurred while loading results"));
            }
        } catch (error) {
            console.error("Error fetching quiz results:", error);
            toast.error(tr("حدث خطأ أثناء تحميل النتائج", "An error occurred while loading results"));
        } finally {
            setLoading(false);
        }
    };

    const fetchQuizDetails = async () => {
        try {
            const response = await fetch(`/api/teacher/quizzes/${quizId}`);
            if (response.ok) {
                const data = await response.json();
                setQuizDetails(data);
            }
        } catch (error) {
            console.error("Error fetching quiz details:", error);
        }
    };

    const handleViewDetails = (result: QuizResult) => {
        router.push(`/dashboard/teacher/quiz-results/${result.id}`);
    };

    const calculatePercentage = (score: number, totalPoints: number) => {
        return totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    };

    const getGradeColor = (percentage: number) => {
        if (percentage >= 90) return "text-green-600";
        if (percentage >= 80) return "text-blue-600";
        if (percentage >= 70) return "text-yellow-600";
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

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center">{tr("جاري التحميل...", "Loading...")}</div>
            </div>
        );
    }

    if (!quizId) {
        return (
            <div className="p-6">
                <div className="text-center">{tr("لم يتم تحديد الاختبار", "Quiz is not specified")}</div>
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
                        <ArrowLeft className="h-4 w-4 rtl:ml-2 ltr:mr-2 rtl:rotate-0 ltr:rotate-180" />
                        {tr("العودة", "Back")}
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {tr("نتائج الاختبار", "Quiz results")}: {quizDetails?.title || tr("جاري التحميل...", "Loading...")}
                    </h1>
                </div>
            </div>

            {quizDetails && (
                <Card>
                    <CardHeader>
                        <CardTitle>{tr("معلومات الاختبار", "Quiz information")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <h4 className="font-medium mb-1">{tr("عنوان الاختبار", "Quiz title")}</h4>
                                <p className="text-sm text-muted-foreground">{quizDetails.title}</p>
                            </div>
                            <div>
                                <h4 className="font-medium mb-1">{tr("الكورس", "Course")}</h4>
                                <p className="text-sm text-muted-foreground">{quizDetails.course?.title}</p>
                            </div>
                            <div>
                                <h4 className="font-medium mb-1">{tr("عدد الأسئلة", "Questions count")}</h4>
                                <Badge variant="secondary">
                                    {quizDetails.questions?.length || 0} {tr("سؤال", "questions")}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{tr("إجمالي النتائج", "Total results")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{results.length}</div>
                        <p className="text-xs text-muted-foreground">{tr("نتيجة", "results")}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{tr("متوسط الدرجات", "Average score")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {results.length > 0 
                                ? Math.round(results.reduce((sum, r) => sum + calculatePercentage(r.score, r.totalPoints), 0) / results.length)
                                : 0
                            }%
                        </div>
                        <p className="text-xs text-muted-foreground">{tr("متوسط", "average")}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{tr("أعلى درجة", "Highest score")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {results.length > 0 
                                ? Math.max(...results.map(r => calculatePercentage(r.score, r.totalPoints)))
                                : 0
                            }%
                        </div>
                        <p className="text-xs text-muted-foreground">{tr("أفضل نتيجة", "Best result")}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{tr("أدنى درجة", "Lowest score")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {results.length > 0 
                                ? Math.min(...results.map(r => calculatePercentage(r.score, r.totalPoints)))
                                : 0
                            }%
                        </div>
                        <p className="text-xs text-muted-foreground">{tr("أسوأ نتيجة", "Worst result")}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{tr("نتائج الطلاب", "Student results")}</CardTitle>
                    <div className="flex items-center rtl:space-x-reverse space-x-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={tr("البحث في الطلاب...", "Search students...")}
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
                                <TableHead className="text-right">{tr("الطالب", "Student")}</TableHead>
                                <TableHead className="text-right">{tr("الدرجة", "Score")}</TableHead>
                                <TableHead className="text-right">{tr("النسبة المئوية", "Percentage")}</TableHead>
                                <TableHead className="text-right">{tr("التقييم", "Evaluation")}</TableHead>
                                <TableHead className="text-right">{tr("تاريخ التقديم", "Submission date")}</TableHead>
                                <TableHead className="text-right">{tr("الإجراءات", "Actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredResults.map((result) => {
                                const percentage = calculatePercentage(result.score, result.totalPoints);
                                const grade = getGradeBadge(percentage);
                                
                                return (
                                    <TableRow key={result.id}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <div>{result.user.fullName}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {result.user.phoneNumber}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">
                                                {result.score} / {result.totalPoints}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className={`font-medium ${getGradeColor(percentage)}`}>
                                                {percentage}%
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={grade.variant}>
                                                {grade.text}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-muted-foreground">
                                                {new Date(result.submittedAt).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US")}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(result.submittedAt).toLocaleTimeString(locale === "ar" ? "ar-EG" : "en-US")}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleViewDetails(result)}
                                            >
                                                <Eye className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                                                {tr("تفاصيل", "Details")}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    
                    {filteredResults.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">{tr("لا توجد نتائج للعرض", "No results to display")}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

const QuizResultsPage = () => {
    return (
        <Suspense fallback={
            <div className="p-6">
                <div className="text-center">Loading...</div>
            </div>
        }>
            <QuizResultsContent />
        </Suspense>
    );
};

export default QuizResultsPage; 