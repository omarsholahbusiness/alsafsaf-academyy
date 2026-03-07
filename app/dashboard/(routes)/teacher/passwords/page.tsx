"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Eye, Edit, Search, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/components/providers/rtl-provider";

interface User {
    id: string;
    fullName: string;
    phoneNumber: string;
    role: string;
}

const TeacherPasswordsPage = () => {
    const { locale } = useLanguage();
    const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch("/api/teacher/users");
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!selectedUser || !newPassword) {
            toast.error(tr("يرجى إدخال كلمة مرور جديدة", "Please enter a new password"));
            return;
        }

        try {
            const response = await fetch(`/api/teacher/users/${selectedUser.id}/password`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ newPassword }),
            });

            if (response.ok) {
                toast.success(tr("تم تغيير كلمة المرور بنجاح", "Password changed successfully"));
                setNewPassword("");
                setIsDialogOpen(false);
                setSelectedUser(null);
            } else {
                toast.error(tr("حدث خطأ أثناء تغيير كلمة المرور", "An error occurred while changing the password"));
            }
        } catch (error) {
            console.error("Error changing password:", error);
            toast.error(tr("حدث خطأ أثناء تغيير كلمة المرور", "An error occurred while changing the password"));
        }
    };

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber.includes(searchTerm)
    );

    const staffUsers = filteredUsers.filter(user => user.role === "ADMIN" || user.role === "TEACHER");
    const studentUsers = filteredUsers.filter(user => user.role === "USER");

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
                    {tr("إدارة كلمات المرور", "Password management")}
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
                                                    user.role === "ADMIN" ? "bg-orange-600 text-white hover:bg-orange-700" : 
                                                    user.role === "TEACHER" ? "bg-blue-600 text-white hover:bg-blue-700" : 
                                                    ""
                                                }
                                            >
                                                {user.role === "TEACHER" ? tr("معلم", "Teacher") : 
                                                 user.role === "ADMIN" ? tr("مشرف", "Admin") : user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setIsDialogOpen(true);
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                                {tr("تغيير كلمة المرور", "Change password")}
                                            </Button>
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
                                            <Badge variant="secondary">
                                                {tr("طالب", "Student")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setIsDialogOpen(true);
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                                {tr("تغيير كلمة المرور", "Change password")}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {filteredUsers.length === 0 && !loading && (
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center text-muted-foreground">
                            {tr("لا توجد مستخدمين متاحين", "No users available")}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Single lightweight dialog rendered once */}
            <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsDialogOpen(false);
                        setNewPassword("");
                        setSelectedUser(null);
                        setShowPassword(false);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {tr("تغيير كلمة مرور", "Change password for")} {selectedUser?.fullName}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">{tr("كلمة المرور الجديدة", "New password")}</Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder={tr("أدخل كلمة المرور الجديدة", "Enter new password")}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute rtl:left-0 ltr:right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div className="flex justify-end rtl:space-x-reverse space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsDialogOpen(false);
                                    setNewPassword("");
                                    setSelectedUser(null);
                                }}
                            >
                                {tr("إلغاء", "Cancel")}
                            </Button>
                            <Button onClick={handlePasswordChange}>
                                {tr("تغيير كلمة المرور", "Change password")}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TeacherPasswordsPage;
