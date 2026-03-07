"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { Check, X, Eye, EyeOff, ChevronLeft } from "lucide-react";
import Image from "next/image";
import ReCAPTCHA from "react-google-recaptcha";
import { useLanguage } from "@/components/providers/rtl-provider";

export default function SignUpPage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePasswords = () => {
    return {
      match: formData.password === formData.confirmPassword,
      isValid: formData.password === formData.confirmPassword && formData.password.length > 0,
    };
  };

  const passwordChecks = validatePasswords();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!passwordChecks.isValid) {
      toast.error(tr("كلمات المرور غير متطابقة", "Passwords do not match"));
      setIsLoading(false);
      return;
    }

    if (!recaptchaToken) {
      toast.error(tr("يرجى إكمال التحقق من reCaptcha", "Please complete the reCAPTCHA verification"));
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("/api/auth/register", {
        ...formData,
        recaptchaToken,
      });
      
      if (response.data.success) {
        toast.success(tr("تم إنشاء الحساب بنجاح", "Account created successfully"));
        router.push("/sign-in");
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 400) {
        const errorMessage = axiosError.response.data as string;
        if (errorMessage.includes("Phone number already exists")) {
          toast.error(tr("رقم الهاتف مسجل مسبقاً", "Phone number is already registered"));
        } else if (errorMessage.includes("Passwords do not match")) {
          toast.error(tr("كلمات المرور غير متطابقة", "Passwords do not match"));
        } else if (errorMessage.includes("reCAPTCHA")) {
          toast.error(tr("فشل التحقق من reCaptcha. يرجى المحاولة مرة أخرى", "reCAPTCHA verification failed. Please try again."));
          recaptchaRef.current?.reset();
          setRecaptchaToken(null);
        } else {
          toast.error(tr("حدث خطأ أثناء إنشاء الحساب", "An error occurred while creating your account"));
        }
      } else {
        toast.error(tr("حدث خطأ أثناء إنشاء الحساب", "An error occurred while creating your account"));
      }
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
                {tr("مرحباً بك في اكاديمية الصفصاف التعليمية", "Welcome to Alsafsaf Academy")}
              </h3>
              <p className="text-lg text-muted-foreground max-w-md">
                {tr("انضم إلينا اليوم وابدأ رحلة التعلم مع أفضل المدرسين", "Join us today and start your learning journey with the best teachers")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Left Side - Form */}
      <div className="flex-1 flex items-start justify-center p-8">
        <div className="w-full max-w-md space-y-6 py-8 mt-8">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold tracking-tight mt-8">
              {tr("إنشاء حساب جديد", "Create a new account")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {tr("أدخل بياناتك لإنشاء حساب جديد", "Enter your details to create a new account")}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{tr("الاسم الكامل", "Full name")}</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                disabled={isLoading}
                className="h-10"
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </div>
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
                  autoComplete="new-password"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{tr("تأكيد كلمة المرور", "Confirm password")}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                  className="h-10"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute rtl:left-0 ltr:right-0 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {passwordChecks.match ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm text-muted-foreground">{tr("كلمات المرور متطابقة", "Passwords match")}</span>
              </div>
            </div>

            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                onChange={(token) => setRecaptchaToken(token)}
                onExpired={() => setRecaptchaToken(null)}
                onError={() => {
                  setRecaptchaToken(null);
                  toast.error(tr("حدث خطأ في التحقق من reCaptcha", "An error occurred while verifying reCAPTCHA"));
                }}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-10 bg-brand hover:bg-brand/90 text-white"
              disabled={isLoading || !passwordChecks.isValid || !recaptchaToken}
            >
              {isLoading ? tr("جاري إنشاء الحساب...", "Creating account...") : tr("إنشاء حساب", "Create account")}
            </Button>
          </form>
          <div className="text-center text-sm">
            <span className="text-muted-foreground">{tr("لديك حساب بالفعل؟ ", "Already have an account? ")}</span>
            <Link 
              href="/sign-in" 
              className="text-primary hover:underline transition-colors"
            >
              {tr("تسجيل الدخول", "Sign in")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 