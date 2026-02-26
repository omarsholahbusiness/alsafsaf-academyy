import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
    /** "sm" for navbars (dashboard), "md" for larger contexts */
    size?: "sm" | "md";
    className?: string;
}

const sizeMap = {
    sm: { width: 72, height: 72, className: "h-[4.5rem] w-[4.5rem]" },
    md: { width: 120, height: 120, className: "h-[7.5rem] w-[7.5rem]" },
};

export const Logo = ({ size = "sm", className }: LogoProps) => {
    const { width, height, className: sizeClass } = sizeMap[size];
    return (
        <Image
            width={width}
            height={height}
            alt="logo"
            src="/logo.png"
            className={cn("object-contain", sizeClass, className)}
            unoptimized
        />
    );
}