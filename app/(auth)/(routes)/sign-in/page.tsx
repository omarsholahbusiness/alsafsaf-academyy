"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { getDashboardUrlByRole } from "@/lib/utils";
import { useLanguage } from "@/components/providers/rtl-provider";

export default function SignInPage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          toast.error(tr("رقم الهاتف أو كلمة المرور غير صحيحة", "Phone number or password is incorrect"));
        } else {
          toast.error(tr("حدث خطأ أثناء تسجيل الدخول", "An error occurred while signing in"));
        }
        return;
      }

      toast.success(tr("تم تسجيل الدخول بنجاح", "Signed in successfully"));
      
      // Get user data to determine role and redirect accordingly
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      const sessionData = await response.json();
      const userRole = sessionData?.user?.role || "USER";
      const dashboardUrl = getDashboardUrlByRole(userRole);

      // Force a full reload to ensure fresh session on the dashboard
      const target = `${dashboardUrl}?t=${Date.now()}`;
      if (typeof window !== "undefined") {
        window.location.replace(target);
      } else {
        router.replace(target);
      }
    } catch {
      toast.error(tr("حدث خطأ أثناء تسجيل الدخول", "An error occurred while signing in"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background overflow-y-auto">
      <div className="absolute top-4 rtl:left-4 ltr:right-4 z-10">
        <Button variant="ghost" size="lg" asChild>
          <Link href="/">
            <ChevronLeft className="h-10 w-10 rtl:rotate-0 ltr:rotate-180" />
          </Link>
        </Button>
      </div>
      
      {/* Right Side - Image */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-brand/10 to-brand/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand/5"></div>
        <div className="relative z-10 flex items-center justify-center w-full">
          <div className="text-center space-y-6 p-8">
            <div className="relative w-64 h-[268px] mx-auto rounded-full border-4 border-brand/20 shadow-2xl overflow-hidden">
              <div className="absolute inset-8">
                <Image
                  src="/logo.png"
                  alt={tr("شعار المنصة", "Platform logo")}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-brand">
                {tr("مرحباً بك مرة أخرى", "Welcome back")}
              </h3>
              <p className="text-lg text-muted-foreground max-w-md">
                {tr("سجل دخولك واستكشف الكورسات التعليمية المميزة", "Sign in and explore premium educational courses")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Left Side - Form */}
      <div className="flex-1 flex items-start justify-center p-8">
        <div className="w-full max-w-md space-y-6 py-8 mt-8">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              {tr("تسجيل الدخول", "Sign in")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {tr("أدخل رقم هاتفك وكلمة المرور للدخول إلى حسابك", "Enter your phone number and password to access your account")}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">{tr("رقم الهاتف", "Phone number")}</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                required
                disabled={isLoading}
                className="h-10"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="+20XXXXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{tr("كلمة المرور", "Password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  className="h-10"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute rtl:left-0 ltr:right-0 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <LoadingButton
              type="submit"
              loading={isLoading}
              loadingText={tr("جاري تسجيل الدخول...", "Signing in...")}
              className="w-full h-10 bg-brand hover:bg-brand/90 text-white"
            >
              {tr("تسجيل الدخول", "Sign in")}
            </LoadingButton>
          </form>
          <div className="text-center text-sm">
            <span className="text-muted-foreground">{tr("ليس لديك حساب؟ ", "Don't have an account? ")}</span>
            <Link 
              href="/sign-up" 
              className="text-primary hover:underline transition-colors"
            >
              {tr("إنشاء حساب جديد", "Create a new account")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 