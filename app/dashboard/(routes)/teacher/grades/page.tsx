"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Search, Eye, Award, TrendingUp, Users, FileText } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/components/providers/rtl-provider";
import { getDateFnsLocale } from "@/lib/i18n";

interface Course {
    id: string;
    title: string;
}

interface Quiz {
    id: string;
    title: string;
    courseId: string;
    course: {
        title: string;
    };
    totalPoints: number;
}

interface QuizResult {
    id: string;
    studentId: string;
    user: {
        fullName: string;
        phoneNumber: string;
    };
    quizId: string;
    quiz: {
        title: string;
        course: {
            id: string;
            title: string;
        };
        totalPoints: number;
    };
    score: number;
    totalPoints: number;
    percentage: number;
    submittedAt: string;
    answers: QuizAnswer[];
}

interface QuizAnswer {
    questionId: string;
    question: {
        text: string;
        type: string;
        points: number;
    };
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    pointsEarned: number;
}

const GradesPage = () => {
    const { locale } = useLanguage();
    const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);
    const dateLocale = getDateFnsLocale(locale);
    const [courses, setCourses] = useState<Course[]>([]);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [selectedQuiz, setSelectedQuiz] = useState<string>("");
    const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        fetchCourses();
        fetchQuizzes();
        fetchQuizResults();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await fetch("/api/courses");
            if (response.ok) {
                const data = await response.json();
                setCourses(data);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    const fetchQuizzes = async () => {
        try {
            const response = await fetch("/api/teacher/quizzes");
            if (response.ok) {
                const data = await response.json();
                setQuizzes(data);
            }
        } catch (error) {
            console.error("Error fetching quizzes:", error);
        }
    };

    const fetchQuizResults = async () => {
        try {
            const response = await fetch("/api/teacher/quiz-results");
            if (response.ok) {
                const data = await response.json();
                setQuizResults(data);
            }
        } catch (error) {
            console.error("Error fetching quiz results:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewResult = (result: QuizResult) => {
        setSelectedResult(result);
        setIsDialogOpen(true);
    };

    const filteredResults = quizResults.filter(result => {
        const matchesSearch = 
            result.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.quiz.course.title.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCourse = !selectedCourse || selectedCourse === "all" || result.quiz.course.id === selectedCourse;
        const matchesQuiz = !selectedQuiz || selectedQuiz === "all" || result.quizId === selectedQuiz;
        
        return matchesSearch && matchesCourse && matchesQuiz;
    });

    const getGradeColor = (percentage: number) => {
        if (percentage >= 90) return "text-green-600";
        if (percentage >= 80) return "text-green-500";
        if (percentage >= 70) return "text-green-400";
        if (percentage >= 60) return "text-orange-600";
        return "text-red-600";
    };

    const getGradeBadge = (percentage: number) => {
        if (percentage >= 90) return { variant: "default" as const, className: "bg-green-600 text-white" };
        if (percentage >= 80) return { variant: "default" as const, className: "bg-green-500 text-white" };
        if (percentage >= 70) return { variant: "default" as const, className: "bg-green-400 text-white" };
        if (percentage >= 60) return { variant: "default" as const, className: "bg-orange-600 text-white" };
        return { variant: "destructive" as const, className: "" };
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {tr("درجات الطلاب", "Student grades")}
                </h1>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <Users className="h-8 w-8 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{tr("إجمالي الطلاب", "Total students")}</p>
                                <p className="text-2xl font-bold">
                                    {new Set(quizResults.map(r => r.studentId)).size}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <Award className="h-8 w-8 text-green-600" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{tr("متوسط الدرجات", "Average score")}</p>
                                <p className="text-2xl font-bold">
                                    {quizResults.length > 0 
                                        ? Math.round(quizResults.reduce((sum, r) => sum + r.percentage, 0) / quizResults.length)
                                        : 0}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="h-8 w-8 text-purple-600" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{tr("أعلى درجة", "Highest score")}</p>
                                <p className="text-2xl font-bold">
                                    {quizResults.length > 0 
                                        ? Math.max(...quizResults.map(r => r.percentage))
                                        : 0}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <FileText className="h-8 w-8 text-orange-600" />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{tr("إجمالي الاختبارات", "Total quizzes")}</p>
                                <p className="text-2xl font-bold">{quizResults.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>{tr("فلاتر البحث", "Search filters")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{tr("البحث", "Search")}</label>
                            <div className="flex items-center space-x-2">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={tr("البحث بالطالب أو الاختبار...", "Search by student or quiz...")}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{tr("الكورس", "Course")}</label>
                            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                <SelectTrigger>
                                    <SelectValue placeholder={tr("جميع الكورسات", "All courses")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{tr("جميع الكورسات", "All courses")}</SelectItem>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={course.id}>
                                            {course.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{tr("الاختبار", "Quiz")}</label>
                            <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
                                <SelectTrigger>
                                    <SelectValue placeholder={tr("جميع الاختبارات", "All quizzes")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{tr("جميع الاختبارات", "All quizzes")}</SelectItem>
                                    {quizzes.map((quiz) => (
                                        <SelectItem key={quiz.id} value={quiz.id}>
                                            {quiz.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results Table */}
            <Card>
                <CardHeader>
                    <CardTitle>{tr("نتائج الاختبارات", "Quiz results")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">{tr("الطالب", "Student")}</TableHead>
                                <TableHead className="text-right">{tr("الاختبار", "Quiz")}</TableHead>
                                <TableHead className="text-right">{tr("الكورس", "Course")}</TableHead>
                                <TableHead className="text-right">{tr("الدرجة", "Score")}</TableHead>
                                <TableHead className="text-right">{tr("النسبة المئوية", "Percentage")}</TableHead>
                                <TableHead className="text-right">{tr("تاريخ التقديم", "Submission date")}</TableHead>
                                <TableHead className="text-right">{tr("الإجراءات", "Actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredResults.map((result) => {
                                const gradeBadge = getGradeBadge(result.percentage);
                                return (
                                    <TableRow key={result.id}>
                                        <TableCell className="font-medium">
                                            {result.user.fullName}
                                        </TableCell>
                                        <TableCell>
                                            {result.quiz.title}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {result.quiz.course.title}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-bold">
                                                {result.score}/{result.totalPoints}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge {...gradeBadge}>
                                                {result.percentage}%
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(result.submittedAt), "dd/MM/yyyy", { locale: dateLocale })}
                                        </TableCell>
                                        <TableCell>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => handleViewResult(result)}
                                            >
                                                <Eye className="h-4 w-4" />
                                                {tr("عرض التفاصيل", "View details")}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Result Details Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {tr("تفاصيل نتيجة", "Result details")} {selectedResult?.user.fullName}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedResult && (
                        <div className="space-y-6">
                            {/* Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{tr("ملخص النتيجة", "Result summary")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {selectedResult.score}/{selectedResult.totalPoints}
                                            </div>
                                            <div className="text-sm text-muted-foreground">{tr("الدرجة", "Score")}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className={`text-2xl font-bold ${getGradeColor(selectedResult.percentage)}`}>
                                                {selectedResult.percentage}%
                                            </div>
                                            <div className="text-sm text-muted-foreground">{tr("النسبة المئوية", "Percentage")}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                {selectedResult.answers.filter(a => a.isCorrect).length}
                                            </div>
                                            <div className="text-sm text-muted-foreground">{tr("إجابات صحيحة", "Correct answers")}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-600">
                                                {selectedResult.answers.filter(a => !a.isCorrect).length}
                                            </div>
                                            <div className="text-sm text-muted-foreground">{tr("إجابات خاطئة", "Incorrect answers")}</div>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">{tr("التقدم العام", "Overall progress")}</span>
                                            <span className="text-sm font-medium">{selectedResult.percentage}%</span>
                                        </div>
                                        <Progress value={selectedResult.percentage} className="w-full" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Detailed Answers */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{tr("تفاصيل الإجابات", "Answer details")}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {selectedResult.answers.map((answer, index) => (
                                            <div key={answer.questionId} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium">{tr("السؤال", "Question")} {index + 1}</h4>
                                                    <Badge variant={answer.isCorrect ? "default" : "destructive"}>
                                                        {answer.isCorrect ? tr("صحيح", "Correct") : tr("خاطئ", "Incorrect")}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-2">{answer.question.text}</p>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="font-medium">{tr("إجابة الطالب:", "Student answer:")}</span>
                                                        <p className="text-muted-foreground">{answer.studentAnswer}</p>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">{tr("الإجابة الصحيحة:", "Correct answer:")}</span>
                                                        <p className="text-green-600">{answer.correctAnswer}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-sm">
                                                    <span className="font-medium">{tr("الدرجات:", "Points:")}</span>
                                                    <span className="text-muted-foreground">
                                                        {" "}{answer.pointsEarned}/{answer.question.points}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default GradesPage; 