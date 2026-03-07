"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical, X, Mic } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useParams, usePathname } from "next/navigation";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { UploadDropzone } from "@/lib/uploadthing";
import { useLanguage } from "@/components/providers/rtl-provider";

interface Course {
    id: string;
    title: string;
    isPublished: boolean;
}

interface Chapter {
    id: string;
    title: string;
    position: number;
    isPublished: boolean;
}

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
    timer?: number;
    maxAttempts?: number;
}

interface Question {
    id: string;
    text: string;
    imageUrl?: string;
    type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
    options?: string[];
    correctAnswer: string | number; // Can be string for TRUE_FALSE/SHORT_ANSWER or number for MULTIPLE_CHOICE
    points: number;
}

interface CourseItem {
    id: string;
    title: string;
    type: "chapter" | "quiz";
    position: number;
    isPublished: boolean;
}

const EditQuizPage = () => {
    const { locale } = useLanguage();
    const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);
    const router = useRouter();
    const params = useParams();
    const quizId = params.quizId as string;
    const pathname = usePathname();
    const dashboardPath = pathname.includes("/dashboard/admin/")
        ? "/dashboard/admin/quizzes"
        : "/dashboard/teacher/quizzes";
    
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [quizTitle, setQuizTitle] = useState("");
    const [quizDescription, setQuizDescription] = useState("");
    const [quizTimer, setQuizTimer] = useState<number | null>(null);
    const [quizMaxAttempts, setQuizMaxAttempts] = useState<number>(1);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedPosition, setSelectedPosition] = useState<number>(1);
    const [courseItems, setCourseItems] = useState<CourseItem[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [isLoadingCourseItems, setIsLoadingCourseItems] = useState(false);
    const [isUpdatingQuiz, setIsUpdatingQuiz] = useState(false);
    const [isLoadingQuiz, setIsLoadingQuiz] = useState(true);
    const [uploadingImages, setUploadingImages] = useState<{ [key: string]: boolean }>({});
    const [listeningQuestionId, setListeningQuestionId] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        fetchCourses();
        fetchQuiz();
    }, [quizId]);

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await fetch("/api/courses");
            if (response.ok) {
                const data = await response.json();
                const teacherCourses = data.filter((course: Course) => course.isPublished);
                setCourses(teacherCourses);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    const fetchQuiz = async () => {
        try {
            const response = await fetch(`/api/teacher/quizzes/${quizId}`);
            if (response.ok) {
                const quiz: Quiz = await response.json();
                setQuizTitle(quiz.title);
                setQuizDescription(quiz.description);
                setQuizTimer(quiz.timer || null);
                setQuizMaxAttempts(quiz.maxAttempts || 1);
                setSelectedCourse(quiz.courseId);
                
                // Convert stored string correctAnswer values back to indices for multiple choice questions
                const processedQuestions = quiz.questions.map(question => {
                    if (question.type === "MULTIPLE_CHOICE" && question.options) {
                        const validOptions = question.options.filter(option => option.trim() !== "");
                        const correctAnswerIndex = validOptions.findIndex(option => option === question.correctAnswer);
                        return {
                            ...question,
                            correctAnswer: correctAnswerIndex >= 0 ? correctAnswerIndex : 0
                        };
                    }
                    return question;
                });
                
                setQuestions(processedQuestions);
                setSelectedPosition(quiz.position);
                await fetchCourseItems(quiz.courseId);
            } else {
                toast.error(tr("حدث خطأ أثناء تحميل الاختبار", "An error occurred while loading quiz"));
                router.push(dashboardPath);
            }
        } catch (error) {
            console.error("Error fetching quiz:", error);
            toast.error(tr("حدث خطأ أثناء تحميل الاختبار", "An error occurred while loading quiz"));
            router.push(dashboardPath);
        } finally {
            setIsLoadingQuiz(false);
        }
    };

    const fetchCourseItems = async (courseId: string) => {
        try {
            setIsLoadingCourseItems(true);
            // Clear existing items first
            setCourseItems([]);
            
            const [chaptersResponse, quizzesResponse] = await Promise.all([
                fetch(`/api/courses/${courseId}/chapters`),
                fetch(`/api/courses/${courseId}/quizzes`)
            ]);
            
            const chaptersData = chaptersResponse.ok ? await chaptersResponse.json() : [];
            const quizzesData = quizzesResponse.ok ? await quizzesResponse.json() : [];
            
            // Combine chapters and existing quizzes for display
            const items: CourseItem[] = [
                ...chaptersData.map((chapter: Chapter) => ({
                    id: chapter.id,
                    title: chapter.title,
                    type: "chapter" as const,
                    position: chapter.position,
                    isPublished: chapter.isPublished
                })),
                ...quizzesData.map((quiz: Quiz) => ({
                    id: quiz.id,
                    title: quiz.title,
                    type: "quiz" as const,
                    position: quiz.position,
                    isPublished: quiz.isPublished
                }))
            ];
            
            // Sort by position
            items.sort((a, b) => a.position - b.position);
            
            setCourseItems(items);
            setChapters(chaptersData);
            
            // Update the selected position to reflect the actual position of the quiz in the list
            const quizInList = items.find(item => item.id === quizId);
            if (quizInList) {
                setSelectedPosition(quizInList.position);
            }
        } catch (error) {
            console.error("Error fetching course items:", error);
            // Clear items on error
            setCourseItems([]);
        } finally {
            setIsLoadingCourseItems(false);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (error) {
                console.error("[SPEECH_RECOGNITION_STOP]", error);
            }
            recognitionRef.current = null;
        }
        setListeningQuestionId(null);
    };

    const handleSpeechInput = (index: number) => {
        if (typeof window === "undefined") {
            return;
        }

        const question = questions[index];
        if (!question) {
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            toast.error(tr("المتصفح لا يدعم الإملاء الصوتي", "Speech dictation is not supported in this browser"));
            return;
        }

        if (listeningQuestionId === question.id) {
            stopListening();
            return;
        }

        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.lang = locale === "ar" ? "ar-SA" : "en-US";
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                setListeningQuestionId(question.id);
            };

            recognition.onresult = (event: any) => {
                const transcript = event.results?.[0]?.[0]?.transcript;
                if (transcript) {
                    setQuestions((prev) => {
                        const updated = [...prev];
                        const current = updated[index];
                        if (!current) {
                            return prev;
                        }
                        const newText = current.text ? `${current.text} ${transcript}` : transcript;
                        updated[index] = { ...current, text: newText };
                        return updated;
                    });
                }
            };

            recognition.onerror = (event: any) => {
                console.error("[SPEECH_RECOGNITION_ERROR]", event.error);
                toast.error(tr("تعذر التعرف على الصوت", "Could not recognize speech"));
            };

            recognition.onend = () => {
                setListeningQuestionId(null);
                recognitionRef.current = null;
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (error) {
            console.error("[SPEECH_RECOGNITION]", error);
            toast.error(tr("تعذر بدء التسجيل الصوتي", "Could not start voice recording"));
            stopListening();
        }
    };

    const handleUpdateQuiz = async () => {
        stopListening();
        if (!selectedCourse || !quizTitle.trim()) {
            toast.error(tr("يرجى إدخال جميع البيانات المطلوبة", "Please enter all required data"));
            return;
        }

        // Validate questions
        const validationErrors: string[] = [];

        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            
            // Validate question text
            if (!question.text || question.text.trim() === "") {
                validationErrors.push(
                    tr(`السؤال ${i + 1}: نص السؤال مطلوب`, `Question ${i + 1}: question text is required`)
                );
                continue;
            }

            // Validate correct answer
            if (question.type === "MULTIPLE_CHOICE") {
                const validOptions = question.options?.filter(option => option.trim() !== "") || [];
                if (validOptions.length === 0) {
                    validationErrors.push(
                        tr(`السؤال ${i + 1}: يجب إضافة خيار واحد على الأقل`, `Question ${i + 1}: add at least one option`)
                    );
                    continue;
                }
                
                // Check if correct answer index is valid
                if (typeof question.correctAnswer !== 'number' || question.correctAnswer < 0 || question.correctAnswer >= validOptions.length) {
                    validationErrors.push(
                        tr(`السؤال ${i + 1}: يجب اختيار إجابة صحيحة`, `Question ${i + 1}: select a correct answer`)
                    );
                    continue;
                }
            } else if (question.type === "TRUE_FALSE") {
                if (!question.correctAnswer || (question.correctAnswer !== "true" && question.correctAnswer !== "false")) {
                    validationErrors.push(
                        tr(`السؤال ${i + 1}: يجب اختيار إجابة صحيحة`, `Question ${i + 1}: select a correct answer`)
                    );
                    continue;
                }
            } else if (question.type === "SHORT_ANSWER") {
                if (!question.correctAnswer || question.correctAnswer.toString().trim() === "") {
                    validationErrors.push(
                        tr(`السؤال ${i + 1}: الإجابة الصحيحة مطلوبة`, `Question ${i + 1}: correct answer is required`)
                    );
                    continue;
                }
            }

            // Check if points are valid
            if (question.points <= 0) {
                validationErrors.push(
                    tr(`السؤال ${i + 1}: الدرجات يجب أن تكون أكبر من صفر`, `Question ${i + 1}: points must be greater than zero`)
                );
                continue;
            }
        }

        if (validationErrors.length > 0) {
            toast.error(validationErrors.join('\n'));
            return;
        }

        // Additional validation: ensure no questions are empty
        if (questions.length === 0) {
            toast.error(tr("يجب إضافة سؤال واحد على الأقل", "You must add at least one question"));
            return;
        }

        // Clean up questions before sending
        const cleanedQuestions = questions.map(question => {
            if (question.type === "MULTIPLE_CHOICE" && question.options) {
                // Filter out empty options and ensure correct answer is included
                const filteredOptions = question.options.filter(option => option.trim() !== "");
                return {
                    ...question,
                    options: filteredOptions
                };
            }
            return question;
        });

        setIsUpdatingQuiz(true);
        try {
            const response = await fetch(`/api/teacher/quizzes/${quizId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: quizTitle,
                    description: quizDescription,
                    courseId: selectedCourse,
                    questions: cleanedQuestions,
                    position: selectedPosition,
                    timer: quizTimer,
                    maxAttempts: quizMaxAttempts,
                }),
            });

            if (response.ok) {
                toast.success(tr("تم تحديث الاختبار بنجاح", "Quiz updated successfully"));
                router.push(dashboardPath);
            } else {
                const error = await response.json();
                toast.error(error.message || tr("حدث خطأ أثناء تحديث الاختبار", "An error occurred while updating quiz"));
            }
        } catch (error) {
            console.error("Error updating quiz:", error);
            toast.error(tr("حدث خطأ أثناء تحديث الاختبار", "An error occurred while updating quiz"));
        } finally {
            setIsUpdatingQuiz(false);
        }
    };

    const addQuestion = () => {
        const newQuestion: Question = {
            id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: "",
            type: "MULTIPLE_CHOICE",
            options: ["", "", "", ""],
            correctAnswer: 0, // Default to index 0 for MULTIPLE_CHOICE
            points: 1,
        };
        setQuestions([...questions, newQuestion]);
    };

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
        setQuestions(updatedQuestions);
    };

    const removeQuestion = (index: number) => {
        if (questions[index]?.id === listeningQuestionId) {
            stopListening();
        }
        const updatedQuestions = questions.filter((_, i) => i !== index);
        setQuestions(updatedQuestions);
    };

    const handleDragEnd = async (result: any) => {
        if (!result.destination) return;

        // Handle dragging the quiz being edited
        if (result.draggableId === quizId) {
            // Calculate the position for the quiz based on where it was dropped
            const newQuizPosition = result.destination.index + 1;
            setSelectedPosition(newQuizPosition);
            
            // Reorder the items array to reflect the new position
            const reorderedItems = Array.from(courseItems);
            const [movedItem] = reorderedItems.splice(result.source.index, 1);
            reorderedItems.splice(result.destination.index, 0, movedItem);
            
            setCourseItems(reorderedItems);

            // Create update data for all items with type information
            const updateData = reorderedItems.map((item, index) => ({
                id: item.id,
                type: item.type,
                position: index + 1,
            }));

            // Call the mixed reorder API
            try {
                const response = await fetch(`/api/courses/${selectedCourse}/reorder`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        list: updateData
                    }),
                });

                if (response.ok) {
                    toast.success(tr("تم ترتيب الاختبار بنجاح", "Quiz reordered successfully"));
                } else {
                    toast.error(tr("حدث خطأ أثناء ترتيب الاختبار", "An error occurred while reordering quiz"));
                }
            } catch (error) {
                console.error("Error reordering quiz:", error);
                toast.error(tr("حدث خطأ أثناء ترتيب الاختبار", "An error occurred while reordering quiz"));
            }
        }
        // For other items, we don't want to reorder them, so we ignore the drag
        // The drag and drop library will handle the visual feedback, but we don't update state
    };

    if (isLoadingQuiz) {
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
                    {tr("تعديل الاختبار", "Edit quiz")}
                </h1>
                <Button variant="outline" onClick={() => router.push(dashboardPath)}>
                    {tr("العودة إلى الاختبارات", "Back to quizzes")}
                </Button>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>{tr("اختر الكورس", "Select course")}</Label>
                        <Select value={selectedCourse} onValueChange={(value) => {
                            setSelectedCourse(value);
                            // Clear previous data immediately
                            setCourseItems([]);
                            // Don't reset position when changing course - keep the quiz's current position
                            if (value) {
                                fetchCourseItems(value);
                            }
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder={tr("اختر كورس...", "Select a course...")} />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map((course) => (
                                    <SelectItem key={course.id} value={course.id}>
                                        {course.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>{tr("عنوان الاختبار", "Quiz title")}</Label>
                        <Input
                            value={quizTitle}
                            onChange={(e) => setQuizTitle(e.target.value)}
                            placeholder={tr("أدخل عنوان الاختبار", "Enter quiz title")}
                        />
                    </div>
                </div>

                {selectedCourse && (
                    <Card>
                        <CardHeader>
                            <CardTitle>{tr("ترتيب الاختبار في الكورس", "Quiz position in course")}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {tr("اسحب الاختبار إلى الموقع المطلوب بين الفصول والاختبارات الموجودة", "Drag the quiz to the desired position among existing chapters and quizzes")}
                            </p>
                            <p className="text-sm text-blue-600">
                                {tr("الموقع المحدد", "Selected position")}: {selectedPosition}
                            </p>
                        </CardHeader>
                        <CardContent>
                            {isLoadingCourseItems ? (
                                <div className="text-center py-8">
                                    <div className="text-muted-foreground">{tr("جاري تحميل محتوى الكورس...", "Loading course content...")}</div>
                                </div>
                            ) : courseItems.length > 0 ? (
                                <DragDropContext onDragEnd={handleDragEnd}>
                                    <Droppable droppableId="course-items">
                                        {(provided) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className="space-y-2"
                                            >
                                                {courseItems.map((item, index) => (
                                                    <Draggable key={item.id} draggableId={item.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                className={`p-3 border rounded-lg flex items-center justify-between ${
                                                                    snapshot.isDragging ? "bg-blue-50" : "bg-white"
                                                                } ${item.id === quizId ? "border-2 border-dashed border-blue-300 bg-blue-50" : ""}`}
                                                            >
                                                                <div className="flex items-center rtl:space-x-reverse space-x-3">
                                                                    <div {...provided.dragHandleProps} className={item.id === quizId ? "cursor-grab active:cursor-grabbing" : ""}>
                                                                        <GripVertical className={`h-4 w-4 ${item.id === quizId ? "text-blue-600" : "text-gray-300 cursor-not-allowed"}`} />
                                                                    </div>
                                                                    <div>
                                                                        <div className={`font-medium ${item.id === quizId ? "text-blue-800" : ""}`}>
                                                                            {item.title}
                                                                        </div>
                                                                        <div className={`text-sm ${item.id === quizId ? "text-blue-600" : "text-muted-foreground"}`}>
                                                                            {item.type === "chapter" ? tr("فصل", "Chapter") : tr("اختبار", "Quiz")}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <Badge variant={item.id === quizId ? "outline" : (item.isPublished ? "default" : "secondary")} className={item.id === quizId ? "border-blue-300 text-blue-700" : ""}>
                                                                    {item.id === quizId ? tr("قيد التعديل", "Editing") : (item.isPublished ? tr("منشور", "Published") : tr("مسودة", "Draft"))}
                                                                </Badge>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground mb-4">
                                        {tr("لا توجد فصول أو اختبارات في هذه الكورس. سيتم إضافة الاختبار في الموقع الأول.", "No chapters or quizzes in this course yet. The quiz will be added in the first position.")}
                                    </p>
                                    <div className="p-3 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
                                        <div className="flex items-center justify-center rtl:space-x-reverse space-x-3">
                                            <div>
                                                <div className="font-medium text-blue-800">
                                                    {quizTitle || tr("اختبار جديد", "New quiz")}
                                                </div>
                                                <div className="text-sm text-blue-600">{tr("اختبار", "Quiz")}</div>
                                            </div>
                                            <Badge variant="outline" className="border-blue-300 text-blue-700">
                                                {tr("قيد التعديل", "Editing")}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-2">
                    <Label>{tr("وصف الاختبار", "Quiz description")}</Label>
                    <Textarea
                        value={quizDescription}
                        onChange={(e) => setQuizDescription(e.target.value)}
                        placeholder={tr("أدخل وصف الاختبار", "Enter quiz description")}
                        rows={3}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>{tr("مدة الاختبار (بالدقائق)", "Quiz duration (minutes)")}</Label>
                        <Input
                            type="number"
                            value={quizTimer || ""}
                            onChange={(e) => setQuizTimer(e.target.value ? parseInt(e.target.value) : null)}
                            placeholder={tr("اترك فارغاً لعدم تحديد مدة", "Leave empty for no time limit")}
                            min="1"
                        />
                        <p className="text-sm text-muted-foreground">
                            {tr("اترك الحقل فارغاً إذا كنت لا تريد تحديد مدة للاختبار", "Leave this field empty if you don't want a quiz time limit")}
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label>{tr("عدد المحاولات المسموحة", "Allowed attempts")}</Label>
                        <Input
                            type="number"
                            value={quizMaxAttempts}
                            onChange={(e) => setQuizMaxAttempts(parseInt(e.target.value))}
                            min="1"
                            max="10"
                        />
                        <p className="text-sm text-muted-foreground">
                            {tr("عدد المرات التي يمكن للطالب إعادة الاختبار", "How many times a student can retake this quiz")}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>{tr("الأسئلة", "Questions")}</Label>
                        <Button type="button" variant="outline" onClick={addQuestion}>
                            <Plus className="h-4 w-4 rtl:mr-2 ltr:ml-2" />
                            {tr("إضافة سؤال", "Add question")}
                        </Button>
                    </div>

                    {questions.map((question, index) => (
                        <Card key={question.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-lg">{tr("السؤال", "Question")} {index + 1}</CardTitle>
                                        {(!question.text.trim() || 
                                            (question.type === "MULTIPLE_CHOICE" && 
                                             (!question.options || question.options.filter(opt => opt.trim() !== "").length === 0)) ||
                                            (question.type === "TRUE_FALSE" && 
                                             (typeof question.correctAnswer !== 'string' || (question.correctAnswer !== "true" && question.correctAnswer !== "false"))) ||
                                            (question.type === "SHORT_ANSWER" && 
                                             (typeof question.correctAnswer !== 'string' || question.correctAnswer.trim() === ""))) && (
                                            <Badge variant="destructive" className="text-xs">
                                                {tr("غير مكتمل", "Incomplete")}
                                            </Badge>
                                        )}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => removeQuestion(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>{tr("نص السؤال", "Question text")}</Label>
                                        <div className="flex items-center gap-2">
                                            {listeningQuestionId === question.id && (
                                                <span className="text-xs text-blue-600">
                                                    {tr("جاري الاستماع...", "Listening...")}
                                                </span>
                                            )}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                aria-pressed={listeningQuestionId === question.id}
                                                onClick={() => handleSpeechInput(index)}
                                                className={listeningQuestionId === question.id ? "text-red-500 animate-pulse" : ""}
                                            >
                                                <Mic className="h-4 w-4" />
                                                <span className="sr-only">
                                                    {listeningQuestionId === question.id ? tr("إيقاف التسجيل الصوتي", "Stop voice input") : tr("بدء التسجيل الصوتي", "Start voice input")}
                                                </span>
                                            </Button>
                                        </div>
                                    </div>
                                    <Textarea
                                        value={question.text}
                                        onChange={(e) => updateQuestion(index, "text", e.target.value)}
                                        placeholder={tr("أدخل نص السؤال", "Enter question text")}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>{tr("صورة السؤال (اختياري)", "Question image (optional)")}</Label>
                                    <div className="space-y-2">
                                        {question.imageUrl ? (
                                            <div className="relative">
                                                <img 
                                                    src={question.imageUrl} 
                                                    alt="Question" 
                                                    className="max-w-full h-auto max-h-48 rounded-lg border"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute top-2 right-2"
                                                    onClick={() => updateQuestion(index, "imageUrl", "")}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                                <UploadDropzone
                                                    endpoint="courseAttachment"
                                                    onClientUploadComplete={(res) => {
                                                        if (res && res[0]) {
                                                            updateQuestion(index, "imageUrl", res[0].url);
                                                            toast.success(tr("تم رفع الصورة بنجاح", "Image uploaded successfully"));
                                                        }
                                                        setUploadingImages(prev => ({ ...prev, [index]: false }));
                                                    }}
                                                    onUploadError={(error: Error) => {
                                                        toast.error(`${tr("حدث خطأ أثناء رفع الصورة", "Error uploading image")}: ${error.message}`);
                                                        setUploadingImages(prev => ({ ...prev, [index]: false }));
                                                    }}
                                                    onUploadBegin={() => {
                                                        setUploadingImages(prev => ({ ...prev, [index]: true }));
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>{tr("نوع السؤال", "Question type")}</Label>
                                        <Select
                                            value={question.type}
                                            onValueChange={(value: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER") =>
                                                updateQuestion(index, "type", value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MULTIPLE_CHOICE">{tr("اختيار من متعدد", "Multiple choice")}</SelectItem>
                                                <SelectItem value="TRUE_FALSE">{tr("صح أو خطأ", "True/False")}</SelectItem>
                                                <SelectItem value="SHORT_ANSWER">{tr("إجابة قصيرة", "Short answer")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{tr("الدرجات", "Points")}</Label>
                                        <Input
                                            type="number"
                                            value={question.points}
                                            onChange={(e) => updateQuestion(index, "points", parseInt(e.target.value))}
                                            min="1"
                                        />
                                    </div>
                                </div>

                                {question.type === "MULTIPLE_CHOICE" && (
                                    <div className="space-y-2">
                                        <Label>{tr("الخيارات", "Options")}</Label>
                                        {(question.options || ["", "", "", ""]).map((option, optionIndex) => (
                                            <div key={optionIndex} className="flex items-center space-x-2">
                                                <Input
                                                    value={option}
                                                    onChange={(e) => {
                                                        const newOptions = [...(question.options || ["", "", "", ""])];
                                                        const oldOptionValue = newOptions[optionIndex];
                                                        newOptions[optionIndex] = e.target.value;
                                                        updateQuestion(index, "options", newOptions);
                                                        
                                                        // If this option was the correct answer, update the correct answer to the new value
                                                        if (question.correctAnswer === oldOptionValue) {
                                                            updateQuestion(index, "correctAnswer", optionIndex);
                                                        }
                                                    }}
                                                    placeholder={`${tr("الخيار", "Option")} ${optionIndex + 1}`}
                                                />
                                                <input
                                                    type="radio"
                                                    name={`correct-${index}`}
                                                    checked={question.correctAnswer === optionIndex}
                                                    onChange={() => updateQuestion(index, "correctAnswer", optionIndex)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {question.type === "TRUE_FALSE" && (
                                    <div className="space-y-2">
                                        <Label>{tr("الإجابة الصحيحة", "Correct answer")}</Label>
                                        <Select
                                            value={typeof question.correctAnswer === 'string' ? question.correctAnswer : ''}
                                            onValueChange={(value) => updateQuestion(index, "correctAnswer", value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={tr("اختر الإجابة الصحيحة", "Select correct answer")} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">{tr("صح", "True")}</SelectItem>
                                                <SelectItem value="false">{tr("خطأ", "False")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {question.type === "SHORT_ANSWER" && (
                                    <div className="space-y-2">
                                        <Label>{tr("الإجابة الصحيحة", "Correct answer")}</Label>
                                        <Input
                                            value={typeof question.correctAnswer === 'string' ? question.correctAnswer : ''}
                                            onChange={(e) => updateQuestion(index, "correctAnswer", e.target.value)}
                                            placeholder={tr("أدخل الإجابة الصحيحة", "Enter correct answer")}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex justify-end rtl:space-x-reverse space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push(dashboardPath)}
                    >
                        {tr("إلغاء", "Cancel")}
                    </Button>
                    <Button
                        onClick={handleUpdateQuiz}
                        disabled={isUpdatingQuiz || questions.length === 0}
                    >
                        {isUpdatingQuiz ? tr("جاري التحديث...", "Updating...") : tr("تحديث الاختبار", "Update quiz")}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EditQuizPage; 