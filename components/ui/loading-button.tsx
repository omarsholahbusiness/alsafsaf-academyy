"use client";

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { useLanguage } from "@/components/providers/rtl-provider";

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ 
    loading = false, 
    loadingText,
    children, 
    className,
    disabled,
    ...props 
  }, ref) => {
    const { locale } = useLanguage();
    const resolvedLoadingText = loadingText ?? (locale === "ar" ? "جاري التحميل..." : "Loading...");
    return (
      <Button
        ref={ref}
        disabled={disabled || loading}
        className={cn(className)}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            {resolvedLoadingText}
          </>
        ) : (
          children
        )}
      </Button>
    );
  }
);

LoadingButton.displayName = "LoadingButton"; 