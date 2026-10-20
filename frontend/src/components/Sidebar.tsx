"use client";

import React, { useState } from "react";
import {
  BarChart3,
  ShieldAlert,
  FileBarChart,
  Scale,
  ClipboardCheck,
  Target,
  Network,
  FileText,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  CircleDashed,
  Sparkles,
  X,
  Layers,
  Building2,
  Users,
  HardHat,
  AlertTriangle,
  Flame
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  hasAssessmentResult?: boolean;
  completedChecklistModules?: Record<string, any>;
  onSelectChecklistModule?: (groupId: string) => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  isOpen,
  onClose,
  hasAssessmentResult = false,
  completedChecklistModules = {},
  onSelectChecklistModule,
}: SidebarProps) {
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(true);

  // 부록 8대 진단 모듈 정의
  const checklistModules = [
    { id: "APP_7_2_LEADERSHIP", label: "최고경영진 직무책임", chapter: "App 7.2", icon: Building2 },
    { id: "APP_7_3_SITE_MANAGER", label: "사업장 총괄 책임", chapter: "App 7.3", icon: Scale },
    { id: "APP_7_4_SUPERVISOR", label: "현장 감독관 직무책임", chapter: "App 7.4", icon: Users },
    { id: "APP_7_5_EMPLOYEE", label: "현장 작업자 직무책임", chapter: "App 7.5", icon: HardHat },
    { id: "APP_2_2_CULTURE_BASIC", label: "안전문화 기초진단", chapter: "App 2.2", icon: ShieldAlert },
    { id: "CH_9_12_RISK_PERCEPTION", label: "위험지각 16대 진단", chapter: "Ch 9.12", icon: AlertTriangle },
    { id: "TAB_7_3_ACCOUNTABILITY", label: "책무성 RAA 시스템", chapter: "Tab 7.3", icon: Scale },
    { id: "APP_8_1_COMMITTEE", label: "안전위원회 헌장 진단", chapter: "App 8.1", icon: Users },
  ];

  const handleModuleClick = (groupId: string) => {
    setCurrentTab(`chk_${groupId}`);
    if (onSelectChecklistModule) {
      onSelectChecklistModule(groupId);
    }
    onClose();
  };

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    onClose();
  };

  // 완료된 부록 모듈 수
  const completedCount = Object.keys(completedChecklistModules).length;

  return (
    <>
      {/* 모바일 배경 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* 좌측 사이드바 본체 */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* 모바일 닫기 버튼 */}
        <div className="lg:hidden flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50">
          <span className="text-xs font-bold text-slate-700">전체 기능 메뉴</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 메뉴 리스트 (스크롤 지원) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {/* 1. 핵심 전사 진단 */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              핵심 안전문화 진단
            </div>

            <button
              onClick={() => handleTabClick("dashboard")}
              className={`w-full text-left flex items-center gap-2.5 p-2.5 rounded-xl transition-all ${
                currentTab === "dashboard"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <BarChart3 className={`w-4 h-4 ${currentTab === "dashboard" ? "text-white" : "text-slate-500"}`} />
              <span className="text-xs font-bold flex-1">전사 대시보드</span>
            </button>

            <button
              onClick={() => handleTabClick("assessment")}
              className={`w-full text-left flex items-center gap-2.5 p-2.5 rounded-xl transition-all ${
                currentTab === "assessment"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <ShieldAlert className={`w-4 h-4 ${currentTab === "assessment" ? "text-white" : "text-slate-500"}`} />
              <span className="text-xs font-bold flex-1">회사 맞춤진단 (Wizard)</span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  hasAssessmentResult
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                {hasAssessmentResult ? "완료" : "진행중"}
              </span>
            </button>

            <button
              onClick={() => handleTabClick("company_report")}
              className={`w-full text-left flex items-center gap-2.5 p-2.5 rounded-xl transition-all ${
                currentTab === "company_report"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <FileBarChart className={`w-4 h-4 ${currentTab === "company_report" ? "text-white" : "text-slate-500"}`} />
              <span className="text-xs font-bold flex-1">종합 진단 보고서</span>
              {hasAssessmentResult && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  리포트
                </span>
              )}
            </button>
          </div>

          {/* 2. 부록 정밀진단 (8대 모듈 아코디언 메뉴) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 pb-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                부록 정밀진단 (8대 모듈)
              </span>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded-full">
                {completedCount}/8 완료
              </span>
            </div>

            {/* 부록 전체 한눈에 보기 종합 리포트 탭 */}
            <button
              onClick={() => handleTabClick("checklists")}
              className={`w-full text-left flex items-center gap-2.5 p-2.5 rounded-xl transition-all ${
                currentTab === "checklists"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <ClipboardCheck className={`w-4 h-4 ${currentTab === "checklists" ? "text-white" : "text-blue-600"}`} />
              <span className="text-xs font-bold flex-1">부록 8대 종합 리포트</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-800">
                한눈에 보기
              </span>
            </button>

            {/* 8개 개별 진단 모듈 리스트 */}
            <div className="pt-1 space-y-0.5 pl-1.5 border-l-2 border-slate-100 ml-3">
              {checklistModules.map((mod) => {
                const Icon = mod.icon;
                const isSelected = currentTab === `chk_${mod.id}`;
                const result = completedChecklistModules[mod.id];
                const isCompleted = Boolean(result);

                return (
                  <button
                    key={mod.id}
                    onClick={() => handleModuleClick(mod.id)}
                    className={`w-full text-left flex items-center gap-2 p-2 rounded-lg text-xs transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white font-bold shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-white" : "text-slate-400"}`} />
                    <span className="truncate flex-1 text-[11px] font-semibold">{mod.label}</span>

                    {/* 완료 / 미완료 상태 뱃지 */}
                    {isCompleted ? (
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full shrink-0 flex items-center gap-0.5 ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        ✓ {result.avgScore ? `${result.avgScore}점` : "완료"}
                      </span>
                    ) : (
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full shrink-0 ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        미완료
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. 성과 및 네트워크 */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              성과 및 네트워크
            </div>

            <button
              onClick={() => handleTabClick("kpi")}
              className={`w-full text-left flex items-center gap-2.5 p-2.5 rounded-xl transition-all ${
                currentTab === "kpi"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Target className={`w-4 h-4 ${currentTab === "kpi" ? "text-white" : "text-slate-500"}`} />
              <span className="text-xs font-bold flex-1">생애주기 KPI (월/분기 추적)</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                시계열
              </span>
            </button>

            <button
              onClick={() => handleTabClick("ona")}
              className={`w-full text-left flex items-center gap-2.5 p-2.5 rounded-xl transition-all ${
                currentTab === "ona"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Network className={`w-4 h-4 ${currentTab === "ona" ? "text-white" : "text-slate-500"}`} />
              <span className="text-xs font-bold flex-1">조직 네트워크 (ONA)</span>
            </button>

            <button
              onClick={() => handleTabClick("consulting")}
              className={`w-full text-left flex items-center gap-2.5 p-2.5 rounded-xl transition-all ${
                currentTab === "consulting"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <FileText className={`w-4 h-4 ${currentTab === "consulting" ? "text-white" : "text-slate-500"}`} />
              <span className="text-xs font-bold flex-1">실행 컨설팅 로드맵</span>
            </button>
          </div>
        </div>

        {/* 사이드바 하단 정보 */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 text-slate-500 text-[11px] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>학술 기반 안전문화 솔루션</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Roughton, Crutchfield & Waite (2019)
          </p>
        </div>
      </aside>
    </>
  );
}
