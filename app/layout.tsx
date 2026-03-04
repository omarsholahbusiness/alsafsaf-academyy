import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Footer } from "@/components/footer";
import { NavigationLoading } from "@/components/navigation-loading";
import { Suspense } from "react";
import { theme } from "@/lib/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "اكاديمية الصفصاف التعليمية",
  description: "منصة تعليمية متكاملة",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      lang="ar"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable}`}
    >
      <body suppressHydrationWarning className="font-playpen-sans-arabic">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (document.documentElement) {
                  document.documentElement.style.setProperty('--brand', '${theme.brand}');
                }
              })();
            `,
          }}
        />
        <Providers>
          <Suspense fallback={null}>
            <NavigationLoading />
          </Suspense>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}

