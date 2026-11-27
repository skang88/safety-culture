import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SafePulse 360 | 동아대학교 재난관리학과 조직 안전문화 진단 플랫폼",
  description: "동아대학교 재난관리학과 · Roughton, Crutchfield & Waite (2019) Safety Culture Chapters 1-16 기반 조직 안전문화 자가진단 및 컨설팅 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full antialiased bg-slate-50 light">
      <body className="min-h-full flex flex-col text-slate-900 bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
