import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";

import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Nexa Assessment Platform",
  description: "Platform analisis data dan manajemen dokumen internal — Nexa Assessment System",
  keywords: ["Nexa", "Assessment", "Platform", "Data", "Analytics"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <Script id="theme-initializer" strategy="beforeInteractive">
          {`
            try {
              const store = localStorage.getItem('ui-store');
              if (store) {
                const parsed = JSON.parse(store);
                if (parsed.state && parsed.state.theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              }
            } catch (e) {}
          `}
        </Script>
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
