"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Edit, Search, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/components/providers/rtl-provider";

interface User {
    id: string;
    fullName: string;
    phoneNumber: string;
    role: string;
    balance: number;
}

const BalancesPage = () => {
    const { locale } = useLanguage();
    const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newBalance, setNewBalance] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch("/api/admin/users");
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

    const handleBalanceUpdate = async () => {
        if (!selectedUser || !newBalance) {
            toast.error(tr("يرجى إدخال رصيد جديد", "Please enter a new balance"));
            return;
        }

        const balance = parseFloat(newBalance);
        if (isNaN(balance) || balance < 0) {
            toast.error(tr("يرجى إدخال رصيد صحيح", "Please enter a valid balance"));
            return;
        }

        try {
            const response = await fetch(`/api/admin/users/${selectedUser.id}/balance`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ newBalance: balance }),
            });

            if (response.ok) {
                toast.success(tr("تم تحديث الرصيد بنجاح", "Balance updated successfully"));
                setNewBalance("");
                setIsDialogOpen(false);
                setSelectedUser(null);
                fetchUsers(); // Refresh the list
            } else {
                toast.error(tr("حدث خطأ أثناء تحديث الرصيد", "An error occurred while updating balance"));
            }
        } catch (error) {
            console.error("Error updating balance:", error);
            toast.error(tr("حدث خطأ أثناء تحديث الرصيد", "An error occurred while updating balance"));
        }
    };

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber.includes(searchTerm)
    );

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
                    {tr("إدارة الأرصدة", "Balance management")}
                </h1>
            </div>

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
                                    <TableHead className="text-right">{tr("الرصيد الحالي", "Current balance")}</TableHead>
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
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                <Wallet className="h-3 w-3" />
                                                {user.balance} {tr("جنيه", "EGP")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setNewBalance(user.balance.toString());
                                                    setIsDialogOpen(true);
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                                {tr("تعديل الرصيد", "Edit balance")}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
            {/* Single lightweight dialog rendered once */}
            <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsDialogOpen(false);
                        setNewBalance("");
                        setSelectedUser(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {tr("تعديل رصيد", "Edit balance for")} {selectedUser?.fullName}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newBalance">{tr("الرصيد الجديد (جنيه)", "New balance (EGP)")}</Label>
                            <Input
                                id="newBalance"
                                type="number"
                                value={newBalance}
                                onChange={(e) => setNewBalance(e.target.value)}
                                placeholder={tr("أدخل الرصيد الجديد", "Enter new balance")}
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="flex justify-end rtl:space-x-reverse space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsDialogOpen(false);
                                    setNewBalance("");
                                    setSelectedUser(null);
                                }}
                            >
                                {tr("إلغاء", "Cancel")}
                            </Button>
                            <Button onClick={handleBalanceUpdate}>
                                {tr("تحديث الرصيد", "Update balance")}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BalancesPage; 