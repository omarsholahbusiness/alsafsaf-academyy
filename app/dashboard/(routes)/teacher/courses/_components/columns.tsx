"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { format } from "date-fns";
import { getDateFnsLocale } from "@/lib/i18n";
import { useLanguage } from "@/components/providers/rtl-provider";

export type Course = {
    id: string;
    title: string;
    price: number;
    isPublished: boolean;
    createdAt: Date;
}

const ColumnHeader = ({
    column,
    arLabel,
    enLabel,
}: {
    column: any;
    arLabel: string;
    enLabel: string;
}) => {
    const { locale } = useLanguage();
    return (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
            {locale === "en" ? enLabel : arLabel}
            <ArrowUpDown className="rtl:mr-2 ltr:ml-2 h-4 w-4" />
        </Button>
    );
};

const StatusCell = ({ isPublished }: { isPublished: boolean }) => {
    const { locale } = useLanguage();
    return (
        <Badge variant={isPublished ? "default" : "secondary"}>
            {isPublished
                ? (locale === "en" ? "Published" : "منشور")
                : (locale === "en" ? "Draft" : "مسودة")}
        </Badge>
    );
};

const DateCell = ({ date }: { date: Date }) => {
    const { locale } = useLanguage();
    return <div>{format(date, "dd/MM/yyyy", { locale: getDateFnsLocale(locale) })}</div>;
};

export const columns: ColumnDef<Course>[] = [
    {
        accessorKey: "title",
        header: ({ column }) => {
            return <ColumnHeader column={column} arLabel="العنوان" enLabel="Title" />;
        },
    },
    {
        accessorKey: "price",
        header: ({ column }) => {
            return <ColumnHeader column={column} arLabel="السعر" enLabel="Price" />;
        },
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("price"));
            return <div>{formatPrice(price)}</div>;
        },
    },
    {
        accessorKey: "isPublished",
        header: ({ column }) => {
            return <ColumnHeader column={column} arLabel="الحالة" enLabel="Status" />;
        },
        cell: ({ row }) => {
            const isPublished = row.getValue("isPublished") || false;
            return <StatusCell isPublished={Boolean(isPublished)} />;
        },
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return <ColumnHeader column={column} arLabel="انشئ في" enLabel="Created on" />;
        },
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"));
            return <DateCell date={date} />;
        },
    }
]; 