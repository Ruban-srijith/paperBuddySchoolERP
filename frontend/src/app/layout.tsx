import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import SmoothScroller from "@/components/SmoothScroller";

export const metadata: Metadata = {
  title: "Genesis ERP - AI-Powered School Operations & ERP System",
  description: "Next-Gen AI Autonomous School Management System with 9-Role RBAC, LKG to 12th Standard",
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-pt-24" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap"
          rel="stylesheet"
        />
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" content="#122218" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Genesis ERP" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('pb_theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen antialiased bg-[#EEF2F6] dark:bg-[#0b0f19] text-[#131313] dark:text-slate-100 transition-colors duration-200">
        <SmoothScroller>
          <ClientLayout>{children}</ClientLayout>
        </SmoothScroller>
      </body>
    </html>
  );
}
