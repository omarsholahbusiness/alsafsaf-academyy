import { Course, Chapter, User } from "@prisma/client";
import { CourseCard } from "@/components/course-card";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";

interface CoursesListProps {
    items: (Course & {
        chapters: Chapter[];
        user: User;
    })[];
}

export const CoursesList = async ({
    items
}: CoursesListProps) => {
    const cookieStore = await cookies();
    const locale = normalizeLocale(cookieStore.get("site_locale")?.value);

    return (
        <div>
            <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
                {items.map((item) => (
                    <CourseCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        imageUrl={item.imageUrl!}
                        chaptersLength={item.chapters.length}
                        price={item.price!}
                        progress={null}
                        user={{
                            name: item.user.fullName,
                            image: item.user.image || "/male.png"
                        }}
                    />
                ))}
            </div>
            {items.length === 0 && (
                <div className="text-center text-sm text-muted-foreground mt-10">
                    {locale === "ar" ? "لا توجد كورسات" : "No courses found"}
                </div>
            )}
        </div>
    );
}; 