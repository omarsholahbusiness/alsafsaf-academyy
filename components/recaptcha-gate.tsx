"use client";

import { useState, useEffect, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { useLanguage } from "@/components/providers/rtl-provider";

interface RecaptchaGateProps {
  children: React.ReactNode;
}

const VERIFICATION_KEY = "recaptcha_verified";
const VERIFICATION_TIMESTAMP_KEY = "recaptcha_verified_timestamp";
const VERIFICATION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function RecaptchaGate({ children }: RecaptchaGateProps) {
  const { locale } = useLanguage();
  const tr = (arText: string, enText: string) => (locale === "ar" ? arText : enText);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    // Check if user is already verified
    const checkVerification = () => {
      try {
        const verified = localStorage.getItem(VERIFICATION_KEY);
        const timestamp = localStorage.getItem(VERIFICATION_TIMESTAMP_KEY);
        
        if (verified === "true" && timestamp) {
          const verificationTime = parseInt(timestamp, 10);
          const now = Date.now();
          
          // Check if verification is still valid (within 24 hours)
          if (now - verificationTime < VERIFICATION_DURATION) {
            setIsVerified(true);
            setIsLoading(false);
            return;
          } else {
            // Verification expired, clear it
            localStorage.removeItem(VERIFICATION_KEY);
            localStorage.removeItem(VERIFICATION_TIMESTAMP_KEY);
          }
        }
      } catch (error) {
        console.error("Error checking verification:", error);
      }
      setIsLoading(false);
    };

    checkVerification();
  }, []);

  const handleVerify = async () => {
    if (!recaptchaToken) {
      toast.error(tr("يرجى إكمال التحقق من reCaptcha", "Please complete reCaptcha verification"));
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post("/api/auth/verify-recaptcha", {
        recaptchaToken,
      });

      if (response.data.success) {
        // Store verification state
        localStorage.setItem(VERIFICATION_KEY, "true");
        localStorage.setItem(VERIFICATION_TIMESTAMP_KEY, Date.now().toString());
        setIsVerified(true);
        toast.success(tr("تم التحقق بنجاح", "Verification successful"));
      } else {
        toast.error(tr("فشل التحقق. يرجى المحاولة مرة أخرى", "Verification failed. Please try again"));
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error(tr("حدث خطأ أثناء التحقق. يرجى المحاولة مرة أخرى", "An error occurred during verification. Please try again"));
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking verification
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-muted-foreground">{tr("جاري التحقق...", "Verifying...")}</p>
        </div>
      </div>
    );
  }

  // Show gate if not verified
  if (!isVerified) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50 p-4">
        <div className="max-w-md w-full bg-card border rounded-lg shadow-lg p-6 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">{tr("التحقق من الأمان", "Security verification")}</h2>
            <p className="text-muted-foreground">
              {tr("يرجى إكمال التحقق من reCaptcha للوصول إلى الموقع", "Please complete reCaptcha verification to access the site")}
            </p>
          </div>
          
          <div className="flex justify-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
              onChange={(token) => setRecaptchaToken(token)}
              onExpired={() => setRecaptchaToken(null)}
              onError={() => {
                setRecaptchaToken(null);
                toast.error(tr("حدث خطأ في التحقق من reCaptcha", "An error occurred in reCaptcha verification"));
              }}
            />
          </div>

          <Button
            onClick={handleVerify}
            disabled={!recaptchaToken || isLoading}
            className="w-full bg-brand hover:bg-brand/90 text-white"
          >
            {isLoading ? tr("جاري التحقق...", "Verifying...") : tr("التحقق والمتابعة", "Verify and continue")}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            {tr("هذه خطوة أمان لمنع الوصول غير المصرح به إلى الموقع", "This security step helps prevent unauthorized access to the site")}
          </p>
        </div>
      </div>
    );
  }

  // Render children if verified
  return <>{children}</>;
}

