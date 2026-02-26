"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoCardSize = "default" | "medium" | "small";

const sizeClasses: Record<
  LogoCardSize,
  { card: string; logo: string; imageSize: number }
> = {
  default: {
    card: "h-[9rem] min-w-[9rem] px-3 py-2",
    logo: "w-[7.5rem] h-[7.5rem]",
    imageSize: 160,
  },
  medium: {
    card: "h-[7.5rem] min-w-[7.5rem] px-2.5 py-1.5",
    logo: "w-[5.5rem] h-[5.5rem]",
    imageSize: 120,
  },
  small: {
    card: "h-20 min-w-20 px-2 py-1",
    logo: "w-14 h-14",
    imageSize: 80,
  },
};

interface LogoCardProps {
  href?: string;
  size?: LogoCardSize;
  className?: string;
}

export const LogoCard = ({
  href,
  size = "default",
  className,
}: LogoCardProps) => {
  const { card, logo, imageSize } = sizeClasses[size];

  const cardContent = (
    <div
      className={cn(
        "bg-white rounded-xl shadow-md border border-border/50 flex items-center justify-center overflow-visible",
        card,
        className
      )}
    >
      <Image
        src="/logo.png"
        alt="Logo"
        width={imageSize}
        height={imageSize}
        className={cn("object-contain", logo)}
        unoptimized
      />
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center shrink-0 overflow-visible"
      >
        {cardContent}
      </Link>
    );
  }

  return <div className="shrink-0 overflow-visible">{cardContent}</div>;
};
