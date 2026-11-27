"use client";

import React from "react";
import { Building2, Menu } from "lucide-react";

interface NavbarProps {
  companyName?: string;
  industry?: string;
  hasCompanyConfigured?: boolean;
  onOpenOnboarding: () => void;
  onToggleSidebar: () => void;
  hasAssessmentResult?: boolean;
}

export default function Navbar({
  companyName = "기관/회사 미설정 (오픈 체험)",
  industry = "",
  hasCompanyConfigured = false,
  onOpenOnboarding,
  onToggleSidebar,
  hasAssessmentResult = false,
}: NavbarProps) {
  const industryLabels: Record<string, string> = {
    manufacturing: "제조업",
    construction: "건설업",
    chemical: "화학·에너지",
    logistics: "운송·물류",
    public_safety: "공공·소방",
    service_other: "서비스·기타",
  };

  const currentIndustryLabel = industry ? industryLabels[industry] || industry : "오픈 체험";

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm h-16 print:hidden">
      <div className="w-full px-3 sm:px-6 flex justify-between h-full items-center gap-2">
        {/* 좌측: 사이드바 토글 햄버거 & 동아대/재난관리학과 로고 + 플랫폼 타이틀 */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            title="메뉴 열기/닫기"
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <img
                src="/logos/donga-univ-logo.png"
                alt="동아대학교 로고"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white p-0.5 border border-slate-200 shadow-xs object-contain shrink-0"
              />
              <img
                src="/logos/disaster-mgmt-logo.jpeg"
                alt="동아대학교 재난관리학과 로고"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white p-0.5 border border-slate-200 shadow-xs object-contain shrink-0"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-lg tracking-tight text-slate-900 whitespace-nowrap">
                  SafePulse <span className="text-blue-600">360</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold tracking-tight px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 whitespace-nowrap">
                  동아대 재난관리학과
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden md:block whitespace-nowrap">
                동아대학교 재난관리학과 · 조직 안전문화 자가진단 플랫폼
              </p>
            </div>
          </div>
        </div>

        {/* 중앙: 현재 진단 대상 기관/회사 정보 및 업종 뱃지 */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
          <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900 max-w-[160px] lg:max-w-[220px] truncate">
              {companyName}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold shrink-0 whitespace-nowrap">
              {currentIndustryLabel}
            </span>
          </div>
          <button
            onClick={onOpenOnboarding}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline pl-1.5 ml-1 border-l border-slate-200 whitespace-nowrap"
          >
            {hasCompanyConfigured ? "변경" : "기관 설정"}
          </button>
        </div>

        {/* 우측: 진단 상태 뱃지 & 모바일 기관 설정 */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenOnboarding}
            className="md:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold whitespace-nowrap"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{hasCompanyConfigured ? "기관 변경" : "기관 설정"}</span>
          </button>

          {hasAssessmentResult ? (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              진단 완료
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              진단 대기
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
