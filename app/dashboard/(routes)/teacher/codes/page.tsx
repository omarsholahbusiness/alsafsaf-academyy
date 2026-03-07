"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Plus, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useLanguage } from "@/components/providers/rtl-provider";
import { getDateFnsLocale } from "@/lib/i18n";

interface Course {
  id: string;
  title: string;
  isPublished: boolean;
}

interface PurchaseCode {
  id: string;
  code: string;
  courseId: string;
  isUsed: boolean;
  usedAt: string | null;
  createdAt: string;
  course: {
    id: string;
    title: string;
  };
  user: {
    id: string;
    fullName: string;
    phoneNumber: string;
  } | null;
}

const TeacherCodesPage = () => {
  const { locale } = useLanguage();
  const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);
  const dateLocale = getDateFnsLocale(locale);
  const [codes, setCodes] = useState<PurchaseCode[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [codeCount, setCodeCount] = useState<string>("1");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchCodes();
    fetchCourses();
  }, []);

  const fetchCodes = async () => {
    try {
      const response = await fetch("/api/teacher/codes");
      if (response.ok) {
        const data = await response.json();
        setCodes(data);
      } else {
        toast.error(tr("حدث خطأ في تحميل الأكواد", "Failed to load codes"));
      }
    } catch (error) {
      console.error("Error fetching codes:", error);
      toast.error(tr("حدث خطأ في تحميل الأكواد", "Failed to load codes"));
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses");
      if (response.ok) {
        const data = await response.json();
        // Filter only published courses
        const publishedCourses = data.filter((course: Course) => course.isPublished);
        setCourses(publishedCourses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleGenerateCodes = async () => {
    if (!selectedCourse || !codeCount || parseInt(codeCount) < 1 || parseInt(codeCount) > 100) {
      toast.error(tr("يرجى اختيار الكورس وعدد الأكواد (1-100)", "Please select a course and code count (1-100)"));
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/teacher/codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: selectedCourse,
          count: parseInt(codeCount),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          locale === "ar"
            ? `تم إنشاء ${data.count} كود بنجاح`
            : `Successfully created ${data.count} code${data.count > 1 ? "s" : ""}`
        );
        setIsDialogOpen(false);
        setSelectedCourse("");
        setCodeCount("1");
        fetchCodes(); // Refresh the list
      } else {
        const error = await response.text();
        toast.error(error || tr("حدث خطأ أثناء إنشاء الأكواد", "Error creating codes"));
      }
    } catch (error) {
      console.error("Error generating codes:", error);
      toast.error(tr("حدث خطأ أثناء إنشاء الأكواد", "Error creating codes"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(tr("تم نسخ الكود", "Code copied"));
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast.error(tr("فشل نسخ الكود", "Failed to copy code"));
    }
  };

  const filteredCodes = codes.filter((code) => {
    const matchesSearch =
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = courseFilter === "all" || code.courseId === courseFilter;
    return matchesSearch && matchesCourse;
  });

  const usedCodes = filteredCodes.filter((code) => code.isUsed);
  const unusedCodes = filteredCodes.filter((code) => !code.isUsed);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">{tr("جاري التحميل...", "Loading...")}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{tr("إدارة الأكواد", "Code management")}</h1>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-brand hover:bg-brand/90 w-full sm:w-auto">
          <Plus className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
          {tr("إنشاء أكواد جديدة", "Create new codes")}
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={tr("البحث بالكود أو اسم الكورس...", "Search by code or course name...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:max-w-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
              <Label htmlFor="course-filter" className="whitespace-nowrap">{tr("تصفية حسب الكورس:", "Filter by course:")}</Label>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger id="course-filter" className="w-full sm:w-[250px]">
                  <SelectValue placeholder={tr("جميع الكورسات", "All courses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tr("جميع الكورسات", "All courses")}</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{tr("إجمالي الأكواد", "Total codes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredCodes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{tr("أكواد غير مستخدمة", "Unused codes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{unusedCodes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{tr("أكواد مستخدمة", "Used codes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{usedCodes.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>{tr("قائمة الأكواد", "Code list")}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {tr("لا توجد أكواد", "No codes found")}
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
            <Table className="min-w-[850px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">{tr("الكود", "Code")}</TableHead>
                  <TableHead className="text-right">{tr("الكورس", "Course")}</TableHead>
                  <TableHead className="text-right">{tr("الحالة", "Status")}</TableHead>
                  <TableHead className="text-right">{tr("المستخدم", "User")}</TableHead>
                  <TableHead className="text-right">{tr("تاريخ الاستخدام", "Usage date")}</TableHead>
                  <TableHead className="text-right">{tr("تاريخ الإنشاء", "Created date")}</TableHead>
                  <TableHead className="text-right">{tr("الإجراءات", "Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell>
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                          {code.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCode(code.code)}
                          className="h-6 w-6 p-0"
                        >
                          {copiedCode === code.code ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{code.course.title}</TableCell>
                    <TableCell>
                      <Badge variant={code.isUsed ? "secondary" : "default"}>
                        {code.isUsed ? tr("مستخدم", "Used") : tr("غير مستخدم", "Unused")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {code.user ? (
                        <div>
                          <div className="font-medium">{code.user.fullName}</div>
                          <div className="text-sm text-muted-foreground">{code.user.phoneNumber}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {code.usedAt
                        ? format(new Date(code.usedAt), "yyyy-MM-dd HH:mm", { locale: dateLocale })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(code.createdAt), "yyyy-MM-dd HH:mm", { locale: dateLocale })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCode(code.code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Codes Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tr("إنشاء أكواد جديدة", "Create new codes")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="course" className="mb-2 block">{tr("الكورس", "Course")}</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder={tr("اختر الكورس", "Select a course")} />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="count" className="mb-2 block">{tr("عدد الأكواد", "Number of codes")}</Label>
              <Input
                id="count"
                type="number"
                min="1"
                max="100"
                value={codeCount}
                onChange={(e) => setCodeCount(e.target.value)}
                placeholder="1-100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {tr("إلغاء", "Cancel")}
            </Button>
            <Button
              onClick={handleGenerateCodes}
              disabled={isGenerating || !selectedCourse || !codeCount}
              className="bg-brand hover:bg-brand/90"
            >
              {isGenerating ? tr("جاري الإنشاء...", "Creating...") : tr("إنشاء", "Create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherCodesPage;

