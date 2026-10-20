"use client";

import React from "react";
import {
  ShieldAlert,
  Building2,
  LogOut,
  UserCheck,
  Menu,
  ChevronDown
} from "lucide-react";

interface NavbarProps {
  companyName?: string;
  industry?: string;
  userName?: string;
  onOpenOnboarding: () => void;
  onLogout?: () => void;
  onToggleSidebar: () => void;
  hasAssessmentResult?: boolean;
}

export default function Navbar({
  companyName = "(주)한국안전정밀",
  industry = "manufacturing",
  userName,
  onOpenOnboarding,
  onLogout,
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

  const currentIndustryLabel = industryLabels[industry] || industry;

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm h-16">
      <div className="w-full px-4 sm:px-6 flex justify-between h-full items-center">
        {/* 좌측: 사이드바 토글 햄버거 & 로고 */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            title="메뉴 열기/닫기"
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 whitespace-nowrap">
                  SafePulse <span className="text-blue-600">360</span>
                </span>
                <span className="hidden sm:inline-block text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 whitespace-nowrap">
                  Roughton et al. Model
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden md:block whitespace-nowrap">
                조직 안전문화 & 리더십 자가진단 플랫폼
              </p>
            </div>
          </div>
        </div>

        {/* 중앙: 현재 접속 중인 회사 정보 및 업종 뱃지 */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
          <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900 max-w-[140px] sm:max-w-none truncate">
              {companyName}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold shrink-0 whitespace-nowrap">
              {currentIndustryLabel}
            </span>
          </div>
          <button
            onClick={onOpenOnboarding}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline pl-1 ml-1 border-l border-slate-200 whitespace-nowrap"
          >
            변경
          </button>
        </div>

        {/* 우측: 사용자 정보, 상태 뱃지 및 로그아웃 */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {hasAssessmentResult ? (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              진단 완료
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              진단 대기
            </span>
          )}

          {userName && (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>{userName}</span>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  title="로그아웃"
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1 text-xs font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">로그아웃</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
