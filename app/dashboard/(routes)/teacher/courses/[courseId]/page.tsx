import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { LayoutDashboard } from "lucide-react";
import { redirect } from "next/navigation";
import { TitleForm } from "./_components/title-form";
import { DescriptionForm } from "./_components/description-form";
import { ImageForm } from "./_components/image-form";
import { PriceForm } from "./_components/price-form";
import { CourseContentForm } from "./_components/course-content-form";
import { Banner } from "@/components/banner";
import { Actions } from "./_components/actions";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";

export default async function CourseIdPage({
    params,
}: {
    params: Promise<{ courseId: string }>
}) {
    const cookieStore = await cookies();
    const locale = normalizeLocale(cookieStore.get("site_locale")?.value);
    const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);

    const resolvedParams = await params;
    const { courseId } = resolvedParams;

    const { userId, user } = await auth();

    if (!userId) {
        return redirect("/");
    }

    const course = await db.course.findUnique({
        where: {
            id: courseId,
        },
        include: {
            chapters: {
                orderBy: {
                    position: "asc",
                },
            },
            quizzes: {
                orderBy: {
                    position: "asc",
                },
            },
        }
    });

    if (!course) {
        return redirect("/");
    }

    // Only owner or admin can view editor
    if (user?.role !== "ADMIN" && course.userId !== userId) {
        return redirect("/dashboard");
    }

    const requiredFields = [
        course.title,
        course.description,
        course.imageUrl,
        course.price,
        course.chapters.some(chapter => chapter.isPublished)
    ];

    const totalFields = requiredFields.length;
    const completedFields = requiredFields.filter(Boolean).length;

    const completionText = `(${completedFields}/${totalFields})`;

    const isComplete = requiredFields.every(Boolean);

    // Create detailed completion status
    const completionStatus = {
        title: !!course.title,
        description: !!course.description,
        imageUrl: !!course.imageUrl,
        price: course.price !== null && course.price !== undefined,
        publishedChapters: course.chapters.some(chapter => chapter.isPublished)
    };

    return (
        <div className="min-w-0 overflow-x-hidden">
            {!course.isPublished && (
                <Banner
                    variant="warning"
                    label={tr("هذه الكورس غير منشورة. لن تكون مرئية للطلاب.", "This course is unpublished. It will not be visible to students.")}
                />
            )}
            <div className="p-4 sm:p-6 min-w-0">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-col gap-y-2 min-w-0">
                        <h1 className="text-xl sm:text-2xl font-medium">
                            {tr("إعداد الكورس", "Course setup")}
                        </h1>
                        <span className="text-sm text-slate-700">
                            {tr("أكمل جميع الحقول", "Complete all fields")} {completionText}
                        </span>
                        {!isComplete && (
                            <div className="text-xs text-muted-foreground mt-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className={`flex items-center gap-1 ${completionStatus.title ? 'text-brand' : 'text-red-600'}`}>
                                        <span>{completionStatus.title ? '✓' : '✗'}</span>
                                        <span>{tr("العنوان", "Title")}</span>
                                    </div>
                                    <div className={`flex items-center gap-1 ${completionStatus.description ? 'text-brand' : 'text-red-600'}`}>
                                        <span>{completionStatus.description ? '✓' : '✗'}</span>
                                        <span>{tr("الوصف", "Description")}</span>
                                    </div>
                                    <div className={`flex items-center gap-1 ${completionStatus.imageUrl ? 'text-brand' : 'text-red-600'}`}>
                                        <span>{completionStatus.imageUrl ? '✓' : '✗'}</span>
                                        <span>{tr("الصورة", "Image")}</span>
                                    </div>
                                    <div className={`flex items-center gap-1 ${completionStatus.price ? 'text-brand' : 'text-red-600'}`}>
                                        <span>{completionStatus.price ? '✓' : '✗'}</span>
                                        <span>{tr("السعر", "Price")}</span>
                                    </div>
                                    <div className={`flex items-center gap-1 ${completionStatus.publishedChapters ? 'text-brand' : 'text-red-600'}`}>
                                        <span>{completionStatus.publishedChapters ? '✓' : '✗'}</span>
                                        <span>{tr("فصل منشور", "At least one published chapter")}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="shrink-0">
                        <Actions
                            disabled={!isComplete}
                            courseId={courseId}
                            isPublished={course.isPublished}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 sm:mt-12 lg:mt-16">
                    <div className="min-w-0">
                        <div className="flex items-center gap-x-2">
                            <IconBadge icon={LayoutDashboard} />
                            <h2 className="text-xl">
                                {tr("تخصيص دورتك", "Customize your course")}
                            </h2>
                        </div>
                        <TitleForm
                            initialData={course}
                            courseId={course.id}
                        />
                        <DescriptionForm
                            initialData={course}
                            courseId={course.id}
                        />
                        <PriceForm
                            initialData={course}
                            courseId={course.id}
                        />
                    </div>
                    <div className="space-y-6 min-w-0">
                        <div>
                            <div className="flex items-center gap-x-2">
                                <IconBadge icon={LayoutDashboard} />
                                <h2 className="text-xl">
                                    {tr("الموارد والفصول", "Resources and chapters")}
                                </h2>
                            </div>
                            <CourseContentForm
                                initialData={course}
                                courseId={course.id}
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-x-2">
                                <IconBadge icon={LayoutDashboard} />
                                <h2 className="text-xl">
                                    {tr("إعدادات الكورس", "Course settings")}
                                </h2>
                            </div>
                            <ImageForm
                                initialData={course}
                                courseId={course.id}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}