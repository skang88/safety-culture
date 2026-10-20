import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SafePulse 360 | 조직 안전문화 & 리더십 진단 컨설팅 플랫폼",
  description: "Roughton, Crutchfield & Waite (2019) Safety Culture Chapters 1-9 및 RAA 트라이어드 기반 진단 및 컨설팅 솔루션",
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
