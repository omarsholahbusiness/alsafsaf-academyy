"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useLanguage } from "@/components/providers/rtl-provider";
import { getDateFnsLocale } from "@/lib/i18n";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface User {
    id: string;
    fullName: string;
    phoneNumber: string;
    parentPhoneNumber: string;
    role: string;
    balance: number;
    createdAt: string;
    updatedAt: string;
    _count: {
        courses: number;
        purchases: number;
        userProgress: number;
    };
}

interface EditUserData {
    fullName: string;
    phoneNumber: string;
    parentPhoneNumber: string;
    role: string;
}

const UsersPage = () => {
    const { locale } = useLanguage();
    const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);
    const roleLabel = (role: string) =>
        role === "TEACHER"
            ? tr("معلم", "Teacher")
            : role === "ADMIN"
              ? tr("مشرف", "Admin")
              : role === "USER"
                ? tr("طالب", "Student")
                : role;
    const roleSubject = (role: string) =>
        role === "TEACHER"
            ? tr("المعلم", "teacher")
            : role === "ADMIN"
              ? tr("المشرف", "admin")
              : tr("الطالب", "student");
    const dateLocale = getDateFnsLocale(locale);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editData, setEditData] = useState<EditUserData>({
        fullName: "",
        phoneNumber: "",
        parentPhoneNumber: "",
        role: ""
    });
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch("/api/teacher/users");
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                console.error("Error fetching users:", response.status, response.statusText);
                if (response.status === 403) {
                    toast.error(tr("ليس لديك صلاحية للوصول إلى هذه الصفحة", "You don't have permission to access this page"));
                } else {
                    toast.error(tr("حدث خطأ في تحميل الطلاب", "An error occurred while loading students"));
                }
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error(tr("حدث خطأ في تحميل الطلاب", "An error occurred while loading students"));
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setEditData({
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            parentPhoneNumber: user.parentPhoneNumber,
            role: user.role
        });
        setIsEditDialogOpen(true);
    };

    const handleSaveUser = async () => {
        if (!editingUser) return;

        try {
            const response = await fetch(`/api/teacher/users/${editingUser.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editData),
            });

            if (response.ok) {
                const userType = roleSubject(editingUser.role);
                toast.success(tr(`تم تحديث بيانات ${userType} بنجاح`, `${userType} data updated successfully`));
                setIsEditDialogOpen(false);
                setEditingUser(null);
                fetchUsers(); // Refresh the list
            } else {
                const error = await response.text();
                console.error("Error updating user:", response.status, error);
                if (response.status === 403) {
                    toast.error(tr("ليس لديك صلاحية لتعديل البيانات", "You don't have permission to edit data"));
                } else if (response.status === 404) {
                    toast.error(tr("المستخدم غير موجود", "User not found"));
                } else if (response.status === 400) {
                    toast.error(error || tr("بيانات غير صحيحة", "Invalid data"));
                } else {
                    toast.error(tr("حدث خطأ في تحديث البيانات", "An error occurred while updating data"));
                }
            }
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error(tr("حدث خطأ في تحديث بيانات الطالب", "An error occurred while updating student data"));
        }
    };

    const handleDeleteUser = async (userId: string) => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/teacher/users/${userId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success(tr("تم حذف المستخدم بنجاح", "User deleted successfully"));
                fetchUsers(); // Refresh the list
            } else {
                const error = await response.text();
                console.error("Error deleting user:", response.status, error);
                if (response.status === 403) {
                    toast.error(tr("ليس لديك صلاحية لحذف المستخدم", "You don't have permission to delete user"));
                } else if (response.status === 404) {
                    toast.error(tr("المستخدم غير موجود", "User not found"));
                } else {
                    toast.error(error || tr("حدث خطأ في حذف المستخدم", "An error occurred while deleting user"));
                }
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error(tr("حدث خطأ في حذف الطالب", "An error occurred while deleting student"));
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber.includes(searchTerm)
    );

    // Separate users by role
    const studentUsers = filteredUsers.filter(user => user.role === "USER");
    const staffUsers = filteredUsers.filter(user => user.role === "TEACHER" || user.role === "ADMIN");

    // Debug logging
    console.log("All users:", users);
    console.log("Filtered users:", filteredUsers);
    console.log("Student users:", studentUsers);
    console.log("Staff users:", staffUsers);
    console.log("Admin users:", filteredUsers.filter(user => user.role === "ADMIN"));

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
                    {tr("إدارة المستخدمين", "User management")}
                </h1>
            </div>

            {/* Staff Table (Admins and Teachers) */}
            {staffUsers.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>{tr("المشرفين والمعلمين", "Admins and teachers")}</CardTitle>
                        <div className="flex items-center rtl:space-x-reverse space-x-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={tr("البحث بالاسم أو رقم الهاتف...", "Search by name or phone number...")}
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
                                    <TableHead className="text-right">{tr("الاسم", "Name")}</TableHead>
                                    <TableHead className="text-right">{tr("رقم الهاتف", "Phone number")}</TableHead>
                                    <TableHead className="text-right">{tr("الدور", "Role")}</TableHead>
                                    <TableHead className="text-right">{tr("تاريخ التسجيل", "Registration date")}</TableHead>
                                    <TableHead className="text-right">{tr("الإجراءات", "Actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {staffUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.fullName}
                                        </TableCell>
                                        <TableCell>{user.phoneNumber}</TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant="secondary"
                                                className={
                                                    user.role === "TEACHER" ? "bg-blue-600 text-white hover:bg-blue-700" : 
                                                    user.role === "ADMIN" ? "bg-orange-600 text-white hover:bg-orange-700" : 
                                                    ""
                                                }
                                            >
                                                {roleLabel(user.role)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: dateLocale })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Dialog open={isEditDialogOpen && editingUser?.id === user.id} onOpenChange={(open) => {
                                                    if (!open) {
                                                        setIsEditDialogOpen(false);
                                                        setEditingUser(null);
                                                    }
                                                }}>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEditUser(user)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>{tr("تعديل بيانات", "Edit")} {roleSubject(user.role)}</DialogTitle>
                                                            <DialogDescription>
                                                                {tr("قم بتعديل معلومات", "Edit")} {roleSubject(user.role)}
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="grid gap-4 py-4">
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label htmlFor="fullName" className="text-right">
                                                                    {tr("الاسم", "Name")}
                                                                </Label>
                                                                <Input
                                                                    id="fullName"
                                                                    value={editData.fullName}
                                                                    onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                                                                    className="col-span-3"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label htmlFor="phoneNumber" className="text-right">
                                                                    {tr("رقم الهاتف", "Phone number")}
                                                                </Label>
                                                                <Input
                                                                    id="phoneNumber"
                                                                    value={editData.phoneNumber}
                                                                    onChange={(e) => setEditData({...editData, phoneNumber: e.target.value})}
                                                                    className="col-span-3"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label htmlFor="role" className="text-right">
                                                                    {tr("الدور", "Role")}
                                                                </Label>
                                                                <Select
                                                                    value={editData.role}
                                                                    onValueChange={(value) => setEditData({...editData, role: value})}
                                                                >
                                                                    <SelectTrigger className="col-span-3">
                                                                        <SelectValue placeholder={tr("اختر الدور", "Select role")} />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="USER">{tr("طالب", "Student")}</SelectItem>
                                                                        <SelectItem value="TEACHER">{tr("معلم", "Teacher")}</SelectItem>
                                                                        <SelectItem value="ADMIN">{tr("مشرف", "Admin")}</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button variant="outline" onClick={() => {
                                                                setIsEditDialogOpen(false);
                                                                setEditingUser(null);
                                                            }}>
                                                                {tr("إلغاء", "Cancel")}
                                                            </Button>
                                                            <Button onClick={handleSaveUser}>
                                                                {tr("حفظ التغييرات", "Save changes")}
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                                
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            disabled={isDeleting}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>{tr("هل أنت متأكد؟", "Are you sure?")}</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                {tr(
                                                                    `هذا الإجراء لا يمكن التراجع عنه. سيتم حذف ${roleSubject(user.role)} وجميع البيانات المرتبطة به نهائياً.`,
                                                                    `This action cannot be undone. The ${roleSubject(user.role)} and all associated data will be permanently deleted.`
                                                                )}
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>{tr("إلغاء", "Cancel")}</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            >
                                                                {tr("حذف", "Delete")}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Students Table */}
            {studentUsers.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>{tr("قائمة الطلاب", "Students list")}</CardTitle>
                        <div className="flex items-center rtl:space-x-reverse space-x-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={tr("البحث بالاسم أو رقم الهاتف...", "Search by name or phone number...")}
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
                                    <TableHead className="text-right">{tr("الاسم", "Name")}</TableHead>
                                    <TableHead className="text-right">{tr("رقم الهاتف", "Phone number")}</TableHead>
                                    <TableHead className="text-right">{tr("الدور", "Role")}</TableHead>
                                    <TableHead className="text-right">{tr("الرصيد", "Balance")}</TableHead>
                                    <TableHead className="text-right">{tr("الكورسات المشتراة", "Purchased courses")}</TableHead>
                                    <TableHead className="text-right">{tr("تاريخ التسجيل", "Registration date")}</TableHead>
                                    <TableHead className="text-right">{tr("الإجراءات", "Actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {studentUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.fullName}
                                        </TableCell>
                                        <TableCell>{user.phoneNumber}</TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant="secondary"
                                                className="bg-green-600 text-white hover:bg-green-700"
                                            >
                                                {tr("طالب", "Student")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {user.balance} {tr("جنيه", "EGP")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {user._count.purchases}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: dateLocale })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Dialog open={isEditDialogOpen && editingUser?.id === user.id} onOpenChange={(open) => {
                                                    if (!open) {
                                                        setIsEditDialogOpen(false);
                                                        setEditingUser(null);
                                                    }
                                                }}>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEditUser(user)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>{tr("تعديل بيانات الطالب", "Edit student data")}</DialogTitle>
                                                            <DialogDescription>
                                                                {tr("قم بتعديل معلومات الطالب", "Edit student information")}
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="grid gap-4 py-4">
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label htmlFor="fullName" className="text-right">
                                                                    {tr("الاسم", "Name")}
                                                                </Label>
                                                                <Input
                                                                    id="fullName"
                                                                    value={editData.fullName}
                                                                    onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                                                                    className="col-span-3"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label htmlFor="phoneNumber" className="text-right">
                                                                    {tr("رقم الهاتف", "Phone number")}
                                                                </Label>
                                                                <Input
                                                                    id="phoneNumber"
                                                                    value={editData.phoneNumber}
                                                                    onChange={(e) => setEditData({...editData, phoneNumber: e.target.value})}
                                                                    className="col-span-3"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label htmlFor="role" className="text-right">
                                                                    {tr("الدور", "Role")}
                                                                </Label>
                                                                <Select
                                                                    value={editData.role}
                                                                    onValueChange={(value) => setEditData({...editData, role: value})}
                                                                >
                                                                    <SelectTrigger className="col-span-3">
                                                                        <SelectValue placeholder={tr("اختر الدور", "Select role")} />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="USER">{tr("طالب", "Student")}</SelectItem>
                                                                        <SelectItem value="TEACHER">{tr("معلم", "Teacher")}</SelectItem>
                                                                        <SelectItem value="ADMIN">{tr("مشرف", "Admin")}</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button variant="outline" onClick={() => {
                                                                setIsEditDialogOpen(false);
                                                                setEditingUser(null);
                                                            }}>
                                                                {tr("إلغاء", "Cancel")}
                                                            </Button>
                                                            <Button onClick={handleSaveUser}>
                                                                {tr("حفظ التغييرات", "Save changes")}
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                                
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            disabled={isDeleting}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>{tr("هل أنت متأكد؟", "Are you sure?")}</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                {tr(
                                                                    "هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الطالب وجميع البيانات المرتبطة به نهائياً.",
                                                                    "This action cannot be undone. The student and all associated data will be permanently deleted."
                                                                )}
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>{tr("إلغاء", "Cancel")}</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            >
                                                                {tr("حذف", "Delete")}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {staffUsers.length === 0 && studentUsers.length === 0 && !loading && (
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center text-muted-foreground">
                            {tr("لا يوجد مستخدمين مسجلين حالياً", "No registered users currently")}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default UsersPage;
