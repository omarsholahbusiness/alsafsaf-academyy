"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    SortingState,
    getSortedRowModel,
    ColumnFiltersState,
    getFilteredRowModel,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLanguage } from "@/components/providers/rtl-provider";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DataTableProps<TData extends { id: string }, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    hideActions?: boolean;
}

export function CoursesTable<TData extends { id: string }, TValue>({
    columns,
    data,
    hideActions = false,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [filterValue, setFilterValue] = useState("");
    const router = useRouter();
    const { locale } = useLanguage();
    const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    });

    const handleFilterChange = (value: string) => {
        setFilterValue(value);
        table.getColumn("title")?.setFilterValue(value);
    };

    const onDelete = async (courseId: string) => {
        try {
            const response = await fetch(`/api/courses/${courseId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(tr("فشل حذف الكورس", "Failed to delete course"));
            }

            toast.success(tr("تم حذف الكورس بنجاح", "Course deleted successfully"));
            router.refresh();
        } catch {
            toast.error(tr("حدث خطأ", "An error occurred"));
        }
    };

    return (
        <div>
            <div className="flex items-center py-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute h-4 w-4 top-3 rtl:left-3 ltr:right-3 text-muted-foreground" />
                    <Input
                        placeholder={tr("ابحث عن الكورسات...", "Search courses...")}
                        value={filterValue}
                        onChange={(e) => handleFilterChange(e.target.value)}
                        className="w-full rtl:pl-9 ltr:pr-9"
                    />
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="text-right">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                    {!hideActions && (
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Link href={`/dashboard/teacher/courses/${row.original.id}`}>
                                                    <Button className="bg-brand hover:bg-brand/90 text-white" size="icon">
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="icon">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>{tr("هل أنت متأكد؟", "Are you sure?")}</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                {tr("لا يمكن التراجع عن هذا العمل. سيتم حذف الكورس وكل محتواها بشكل دائم.", "This action cannot be undone. The course and all its content will be permanently deleted.")}
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>{tr("إلغاء", "Cancel")}</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => onDelete(row.original.id)}>
                                                                {tr("حذف", "Delete")}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    {tr("لا يوجد نتائج.", "No results.")}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end rtl:space-x-reverse space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    {tr("السابق", "Previous")}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    {tr("التالي", "Next")}
                </Button>
            </div>
        </div>
    );
} 