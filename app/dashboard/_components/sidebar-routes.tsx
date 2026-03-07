"use client";

import { BarChart, Compass, Layout, List, Wallet, Shield, Users, Eye, TrendingUp, BookOpen, FileText, Award, Key, Ticket } from "lucide-react";
import { SidebarItem } from "./sidebar-item";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/providers/rtl-provider";

const guestRoutes = [
    {
        icon: Layout,
        label: "sidebar.guest.dashboard",
        href: "/dashboard",
    },
    {
        icon: Compass,
        label: "sidebar.guest.courses",
        href: "/dashboard/search",
    },
    {
        icon: Wallet,
        label: "sidebar.guest.balance",
        href: "/dashboard/balance",
    },
];

const teacherRoutes = [
    {
        icon: List,
        label: "sidebar.teacher.courses",
        href: "/dashboard/teacher/courses",
    },
    {
        icon: FileText,
        label: "sidebar.teacher.quizzes",
        href: "/dashboard/teacher/quizzes",
    },
    {
        icon: Award,
        label: "sidebar.teacher.grades",
        href: "/dashboard/teacher/grades",
    },
    {
        icon: BarChart,
        label: "sidebar.teacher.analytics",
        href: "/dashboard/teacher/analytics",
    },
    {
        icon: Users,
        label: "sidebar.teacher.manageStudents",
        href: "/dashboard/teacher/users",
    },
    {
        icon: Wallet,
        label: "sidebar.teacher.manageBalances",
        href: "/dashboard/teacher/balances",
    },
    {
        icon: BookOpen,
        label: "sidebar.teacher.manageCourses",
        href: "/dashboard/teacher/add-courses",
    },
    {
        icon: Key,
        label: "sidebar.teacher.passwords",
        href: "/dashboard/teacher/passwords",
    },
    {
        icon: Ticket,
        label: "sidebar.teacher.codes",
        href: "/dashboard/teacher/codes",
    },
    {
        icon: Shield,
        label: "sidebar.teacher.createStudentAccount",
        href: "/dashboard/teacher/create-account",
    },
];

const adminRoutes = [
    {
        icon: Users,
        label: "sidebar.admin.manageUsers",
        href: "/dashboard/admin/users",
    },
    {
        icon: List,
        label: "sidebar.admin.courses",
        href: "/dashboard/admin/courses",
    },
    {
        icon: FileText,
        label: "sidebar.admin.quizzes",
        href: "/dashboard/admin/quizzes",
    },
    {
        icon: Shield,
        label: "sidebar.admin.createStudentAccount",
        href: "/dashboard/admin/create-account",
    },
    {
        icon: Eye,
        label: "sidebar.admin.passwords",
        href: "/dashboard/admin/passwords",
    },
    {
        icon: Wallet,
        label: "sidebar.admin.manageBalances",
        href: "/dashboard/admin/balances",
    },
    {
        icon: TrendingUp,
        label: "sidebar.admin.studentProgress",
        href: "/dashboard/admin/progress",
    },
    {
        icon: BookOpen,
        label: "sidebar.admin.manageCourses",
        href: "/dashboard/admin/add-courses",
    },
    {
        icon: Ticket,
        label: "sidebar.admin.codes",
        href: "/dashboard/admin/codes",
    },
];

export const SidebarRoutes = ({ closeOnClick = false }: { closeOnClick?: boolean }) => {
    const pathName = usePathname();
    const { t } = useLanguage();

    const isTeacherPage = pathName?.includes("/dashboard/teacher");
    const isAdminPage = pathName?.includes("/dashboard/admin");
    const routes = (isAdminPage ? adminRoutes : isTeacherPage ? teacherRoutes : guestRoutes).map((route) => ({
        ...route,
        label: t(route.label),
    }));

    return (
        <div className="flex flex-col w-full pt-0">
            {routes.map((route) => (
                <SidebarItem
                  key={route.href}
                  icon={route.icon}
                  label={route.label}
                  href={route.href}
                  closeOnClick={closeOnClick}
                />
            ))}
        </div>
    );
}