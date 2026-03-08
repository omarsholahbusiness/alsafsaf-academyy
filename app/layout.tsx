import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Footer } from "@/components/footer";
import { NavigationLoading } from "@/components/navigation-loading";
import { Suspense } from "react";
import { theme } from "@/lib/theme";
import { cookies } from "next/headers";
import { getDirFromLocale, normalizeLocale, LOCALE_COOKIE_KEY } from "@/lib/i18n";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE_KEY)?.value);

  return (
    <html
      suppressHydrationWarning
      lang={locale}
      dir={getDirFromLocale(locale)}
      className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable}`}
    >
      <body
        suppressHydrationWarning
        className={locale === "ar" ? "font-playpen-sans-arabic" : undefined}
      >
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function stripFdProcessedId() {
                  try {
                    document.querySelectorAll('[fdprocessedid]').forEach(function(el) {
                      el.removeAttribute('fdprocessedid');
                    });
                  } catch (e) {}
                }
                stripFdProcessedId();
                if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(stripFdProcessedId);
                setTimeout(stripFdProcessedId, 0);
                document.addEventListener('DOMContentLoaded', stripFdProcessedId);
                if (document.body) {
                  var obs = new MutationObserver(stripFdProcessedId);
                  obs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['fdprocessedid'] });
                }
              })();
            `,
          }}
        />
        <Providers initialLocale={locale}>
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

