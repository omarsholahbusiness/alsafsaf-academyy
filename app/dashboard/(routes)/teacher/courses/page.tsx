import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CoursesTable } from "./_components/courses-table";
import { columns } from "./_components/columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";

const CoursesPage = async () => {
    const cookieStore = await cookies();
    const locale = normalizeLocale(cookieStore.get("site_locale")?.value);
    const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);

    const { userId } = await auth();

    if (!userId) {
        return redirect("/");
    }

    const courses = await db.course.findMany({
        where: {
            userId,
        },
        include: {
            chapters: {
                select: {
                    id: true,
                    isPublished: true,
                }
            },
            quizzes: {
                select: {
                    id: true,
                    isPublished: true,
                }
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    }).then(courses => courses.map(course => ({
        ...course,
        price: course.price || 0,
        publishedChaptersCount: course.chapters.filter(ch => ch.isPublished).length,
        publishedQuizzesCount: course.quizzes.filter(q => q.isPublished).length,
    })));

    const unpublishedCourses = courses.filter(course => !course.isPublished);
    const hasUnpublishedCourses = unpublishedCourses.length > 0;

    return (
        <div className="p-4 sm:p-6 min-w-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-xl sm:text-2xl font-bold shrink-0">{tr("الكورسات الخاصة بك", "Your courses")}</h1>
                <Link href="/dashboard/teacher/courses/create" className="w-full sm:w-auto">
                    <Button className="bg-brand hover:bg-brand/90 text-white w-full sm:w-auto">
                        <PlusCircle className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                        {tr("إنشاء كورس جديدة", "Create a new course")}
                    </Button>
                </Link>
            </div>

            {hasUnpublishedCourses && (
                <Alert className="mt-4 sm:mt-6 border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                        <div className="mb-2">
                            <strong>{tr("لنشر الكورسات على الصفحة الرئيسية، تحتاج إلى:", "To publish courses on the homepage, you need to:")}</strong>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>{tr("إضافة عنوان للكورس", "Add a course title")}</li>
                            <li>{tr("إضافة وصف للكورس", "Add a course description")}</li>
                            <li>{tr("إضافة صورة للكورس", "Add a course image")}</li>
                            <li>{tr("إضافة فصل واحد على الأقل ونشره", "Add at least one chapter and publish it")}</li>
                            <li>{tr("النقر على زر \"نشر\" في صفحة إعدادات الكورس", "Click the \"Publish\" button in course settings")}</li>
                        </ul>
                    </AlertDescription>
                </Alert>
            )}

            <div className="mt-4 sm:mt-6 min-w-0 overflow-hidden">
                <CoursesTable columns={columns} data={courses} />
            </div>
        </div>
    );
};

export default CoursesPage;