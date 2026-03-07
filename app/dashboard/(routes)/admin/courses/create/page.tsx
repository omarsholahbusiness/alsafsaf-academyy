import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { normalizeLocale } from "@/lib/i18n";

const AdminCreateCoursePage = async () => {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("site_locale")?.value);

  const { userId } = await auth();

  if (!userId) {
    return redirect("/");
  }

  const course = await db.course.create({
    data: {
      userId,
      title: locale === "ar" ? "كورس غير معرفة" : "Untitled course",
    },
  });

  // Redirect to admin course edit page
  return redirect(`/dashboard/admin/courses/${course.id}`);
};

export default AdminCreateCoursePage;


