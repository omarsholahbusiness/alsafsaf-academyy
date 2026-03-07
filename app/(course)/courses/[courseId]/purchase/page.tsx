"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, CreditCard, Wallet, AlertCircle, Ticket, Check } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/providers/rtl-provider";

interface Course {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  price?: number | null;
}

export default function PurchasePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const router = useRouter();
  const { locale } = useLanguage();
  const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);
  const { courseId } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [code, setCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [codeRedeemed, setCodeRedeemed] = useState(false);

  useEffect(() => {
    fetchCourse();
    fetchUserBalance();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data);
      } else {
        toast.error(tr("حدث خطأ أثناء تحميل الكورس", "An error occurred while loading the course"));
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      toast.error(tr("حدث خطأ أثناء تحميل الكورس", "An error occurred while loading the course"));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserBalance = async () => {
    try {
      const response = await fetch("/api/user/balance");
      if (response.ok) {
        const data = await response.json();
        setUserBalance(data.balance);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleRedeemCode = async () => {
    if (!code.trim()) {
      toast.error(tr("يرجى إدخال الكود", "Please enter a code"));
      return;
    }

    setIsRedeeming(true);
    try {
      const response = await fetch("/api/codes/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: code.trim() }),
      });

      if (response.ok) {
        await response.json();
        toast.success(tr("تم استبدال الكود بنجاح! تم شراء الكورس", "Code redeemed successfully! Course purchased."));
        setCodeRedeemed(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        const error = await response.text();
        if (error.includes("already been used")) {
          toast.error(tr("هذا الكود مستخدم بالفعل", "This code has already been used"));
        } else if (error.includes("already purchased")) {
          toast.error(tr("لقد قمت بشراء هذا الكورس مسبقاً", "You already purchased this course"));
        } else if (error.includes("Invalid code")) {
          toast.error(tr("كود غير صحيح", "Invalid code"));
        } else {
          toast.error(error || tr("حدث خطأ أثناء استبدال الكود", "An error occurred while redeeming the code"));
        }
      }
    } catch (error) {
      console.error("Error redeeming code:", error);
      toast.error(tr("حدث خطأ أثناء استبدال الكود", "An error occurred while redeeming the code"));
    } finally {
      setIsRedeeming(false);
    }
  };

  const handlePurchase = async () => {
    if (!course) return;

    setIsPurchasing(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/purchase`, {
        method: "POST",
      });

      if (response.ok) {
        await response.json();
        toast.success(tr("تم شراء الكورس بنجاح!", "Course purchased successfully!"));
        router.push("/dashboard");
      } else {
        const error = await response.text();
        if (error.includes("Insufficient balance")) {
          toast.error(tr("رصيد غير كافي. يرجى إضافة رصيد إلى حسابك", "Insufficient balance. Please add balance to your account."));
        } else if (error.includes("already purchased")) {
          toast.error(tr("لقد قمت بشراء هذا الكورس مسبقاً", "You already purchased this course"));
        } else {
          toast.error(error || tr("حدث خطأ أثناء الشراء", "An error occurred during purchase"));
        }
      }
    } catch (error) {
      console.error("Error purchasing course:", error);
      toast.error(tr("حدث خطأ أثناء الشراء", "An error occurred during purchase"));
    } finally {
      setIsPurchasing(false);
    }
  };

  const hasSufficientBalance = course && userBalance >= (course.price || 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{tr("الكورس غير موجود", "Course not found")}</h1>
          <Button asChild>
            <Link href="/dashboard">{tr("العودة إلى لوحة التحكم", "Back to dashboard")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
              {tr("رجوع", "Back")}
            </Button>
            <h1 className="text-2xl font-bold">{tr("شراء الكورس", "Purchase course")}</h1>
          </div>

          {/* Course Details */}
          <Card>
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
              <CardDescription>
                {course.description || tr("لا يوجد وصف للكورس", "No description available for this course")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {course.imageUrl && (
                <div className="mb-4">
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="text-2xl font-bold text-brand">
                {course.price?.toFixed(2) || "0.00"} {tr("جنيه", "EGP")}
              </div>
            </CardContent>
          </Card>

          {/* Balance Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                {tr("رصيد الحساب", "Account balance")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingBalance ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xl font-bold">
                    {userBalance.toFixed(2)} {tr("جنيه", "EGP")}
                  </div>
                  {!hasSufficientBalance && (
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{tr("رصيد غير كافي لشراء هذا الكورس", "Insufficient balance to purchase this course")}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Code Redemption */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                {tr("لديك كود خصم؟", "Do you have a discount code?")}
              </CardTitle>
              <CardDescription>
                {tr("أدخل الكود للحصول على الكورس مجاناً", "Enter the code to get this course for free")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="code" className="sr-only">
                    {tr("كود الخصم", "Discount code")}
                  </Label>
                  <Input
                    id="code"
                    placeholder={tr("أدخل الكود هنا", "Enter code here")}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    disabled={isRedeeming || codeRedeemed}
                    className="text-center font-mono"
                  />
                </div>
                <Button
                  onClick={handleRedeemCode}
                  disabled={isRedeeming || !code.trim() || codeRedeemed}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isRedeeming ? (
                    tr("جاري الاستبدال...", "Redeeming...")
                  ) : codeRedeemed ? (
                    <>
                      <Check className="h-4 w-4 rtl:ml-2 ltr:mr-2" />
                      {tr("تم الاستبدال", "Redeemed")}
                    </>
                  ) : (
                    tr("استبدال الكود", "Redeem code")
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">{tr("أو", "or")}</span>
            </div>
          </div>

          {/* Purchase Actions */}
          <div className="space-y-4">
            {!hasSufficientBalance && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-amber-700 mb-4">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">{tr("رصيد غير كافي", "Insufficient balance")}</span>
                  </div>
                  <p className="text-amber-700 mb-4">
                    {tr("تحتاج إلى", "You need")} {(course.price || 0) - userBalance} {tr("جنيه إضافية لشراء هذا الكورس", "more EGP to purchase this course")}
                  </p>
                  <Button asChild className="bg-brand hover:bg-brand/90">
                    <Link href="/dashboard/balance">{tr("إضافة رصيد", "Add balance")}</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            <Button
              onClick={handlePurchase}
              disabled={isPurchasing || !hasSufficientBalance || codeRedeemed}
              className="w-full bg-brand hover:bg-brand/90 text-white"
              size="lg"
            >
              {isPurchasing ? (
                tr("جاري الشراء...", "Processing purchase...")
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {tr("شراء الكورس", "Purchase course")}
                </div>
              )}
            </Button>

            {!codeRedeemed && (
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  {tr("سيتم خصم", "An amount of")} {course.price?.toFixed(2) || "0.00"} {tr("جنيه من رصيدك", "EGP will be deducted from your balance")}
                </p>
                <p>{tr("ستتمكن من الوصول إلى الكورس فوراً بعد الشراء", "You will get immediate access to the course after purchase")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 