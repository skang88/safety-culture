"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import DashboardView from "@/components/DashboardView";
import AssessmentWizardView from "@/components/AssessmentWizardView";
import ONAView from "@/components/ONAView";
import KPIView from "@/components/KPIView";
import ConsultingView from "@/components/ConsultingView";
import ChecklistHubView from "@/components/ChecklistHubView";
import CompanyReportView from "@/components/CompanyReportView";
import OnboardingModal from "@/components/OnboardingModal";
import SMSCoreDashboardView from "@/components/SMSCoreDashboardView";
import RiskWorkflowView from "@/components/RiskWorkflowView";
import MagerTrainingTreeView from "@/components/MagerTrainingTreeView";
import SMSMirrorAssessmentView from "@/components/SMSMirrorAssessmentView";
import ABSSActivityTrackerView from "@/components/ABSSActivityTrackerView";
import JHAHPIBuilderView from "@/components/JHAHPIBuilderView";
import PDCADMAICBoardView from "@/components/PDCADMAICBoardView";
import KnowledgeCurationView from "@/components/KnowledgeCurationView";
import ContentIPOHubView from "@/components/ContentIPOHubView";
import { fetchSession } from "@/lib/api";

export default function Home() {
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completedChecklistModules, setCompletedChecklistModules] = useState<Record<string, any>>({});
  const [selectedChecklistGroupId, setSelectedChecklistGroupId] = useState<string>("APP_7_2_LEADERSHIP");

  useEffect(() => {
    async function initSession() {
      try {
        const storedSessionId = localStorage.getItem("safepulse_session_id");
        let restoredSession: any = null;
        if (storedSessionId) {
          restoredSession = await fetchSession(storedSessionId);
        }
        if (!restoredSession) {
          const storedRaw = localStorage.getItem("safepulse_session_data");
          if (storedRaw) {
            try {
              restoredSession = JSON.parse(storedRaw);
            } catch (e) {}
          }
        }
        if (restoredSession) {
          setSession(restoredSession);
        }
        // 부록 진단 완료 모듈 복원
        const storedChecklists = localStorage.getItem("safepulse_completed_checklists");
        if (storedChecklists) {
          try {
            setCompletedChecklistModules(JSON.parse(storedChecklists));
          } catch (e) {}
        }
      } finally {
        setLoading(false);
      }
    }
    initSession();
  }, []);

  // 온보딩 완료 시 세션 시작 및 진단 서베이로 이동
  const handleSessionStarted = (newSession: any) => {
    setSession(newSession);
    if (typeof window !== "undefined") {
      localStorage.setItem("safepulse_session_data", JSON.stringify(newSession));
    }
    setCurrentTab("assessment");
  };

  // 진단 진행 상태 업데이트
  const handleSessionUpdate = (updatedSession: any) => {
    setSession(updatedSession);
    if (typeof window !== "undefined") {
      localStorage.setItem("safepulse_session_data", JSON.stringify(updatedSession));
    }
  };

  // 진단 완료 시 종합 리포트 탭으로 이동
  const handleAssessmentComplete = () => {
    setCurrentTab("company_report");
  };

  // 부록 개별 진단 모듈 완료 핸들러
  const handleChecklistModuleComplete = (groupId: string, result: any) => {
    setCompletedChecklistModules((prev) => {
      const updated = { ...prev, [groupId]: result };
      localStorage.setItem("safepulse_completed_checklists", JSON.stringify(updated));
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 오픈 액세스: 로그인/회원가입 없이 누구나 즉시 진단 및 플랫폼 이용 가능
  const hasCompanyConfigured = Boolean(session?.company?.company_name);
  const activeCompanyName = session?.company?.company_name || "기관/회사 미설정 (오픈 체험)";
  const activeIndustry = session?.company?.industry || "";
  const hasAssessmentResult = Boolean(
    session?.results || session?.result || session?.assessment_result || session?.is_completed
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* 상단 고정 헤더: 동아대학교 · 재난관리학과 브랜딩 및 사업장 정보 */}
      <Navbar
        companyName={activeCompanyName}
        industry={activeIndustry}
        hasCompanyConfigured={hasCompanyConfigured}
        hasAssessmentResult={hasAssessmentResult}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onToggleSidebar={() => {
          if (typeof window !== "undefined" && window.innerWidth >= 1024) {
            setIsDesktopSidebarOpen((prev) => !prev);
          } else {
            setIsSidebarOpen((prev) => !prev);
          }
        }}
      />

      {/* 좌측 사이드바: 모든 기능적 메뉴 관리 */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isOpen={isSidebarOpen}
        isDesktopOpen={isDesktopSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        hasAssessmentResult={hasAssessmentResult}
        completedChecklistModules={completedChecklistModules}
        onSelectChecklistModule={(groupId) => {
          setSelectedChecklistGroupId(groupId);
          setCurrentTab("checklists");
        }}
      />

      {/* 본문 콘텐츠 영역 (데스크톱 사이드바 열림 여부에 따라 여백 동적 전환) */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          isDesktopSidebarOpen ? "lg:pl-64" : "lg:pl-0"
        }`}
      >
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          {currentTab === "dashboard" && (
            <DashboardView
              onNavigate={setCurrentTab}
              session={session}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              completedChecklistModules={completedChecklistModules}
            />
          )}
          {currentTab === "assessment" && (
            <AssessmentWizardView
              session={session}
              onSessionUpdate={handleSessionUpdate}
              onComplete={handleAssessmentComplete}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onNavigate={setCurrentTab}
            />
          )}
          {currentTab === "company_report" && (
            <CompanyReportView
              session={session}
              onRestartAssessment={() => setCurrentTab("assessment")}
              onNavigate={setCurrentTab}
              completedChecklistModules={completedChecklistModules}
            />
          )}
          {(currentTab === "checklists" || currentTab.startsWith("chk_")) && (
            <ChecklistHubView
              initialGroupId={selectedChecklistGroupId}
              completedModules={completedChecklistModules}
              onModuleComplete={handleChecklistModuleComplete}
            />
          )}
          {currentTab === "sms_core" && (
            <SMSCoreDashboardView
              onNavigate={setCurrentTab}
              session={session}
              completedChecklistModules={completedChecklistModules}
            />
          )}
          {currentTab === "risk_workflow" && <RiskWorkflowView />}
          {currentTab === "mager_tree" && <MagerTrainingTreeView />}
          {currentTab === "sms_mirror" && <SMSMirrorAssessmentView />}
          {currentTab === "abss_tracker" && <ABSSActivityTrackerView />}
          {currentTab === "jha_hpi" && <JHAHPIBuilderView />}
          {currentTab === "pdca_dmaic" && <PDCADMAICBoardView />}
          {currentTab === "knowledge_curation" && <KnowledgeCurationView />}
          {currentTab === "content_ipo" && <ContentIPOHubView />}
          {currentTab === "ona" && <ONAView />}
          {currentTab === "kpi" && <KPIView />}
          {currentTab === "consulting" && (
            <ConsultingView
              session={session}
              completedChecklistModules={completedChecklistModules}
              onNavigate={setCurrentTab}
            />
          )}
        </main>

        <footer className="border-t border-slate-200 bg-white py-5 mt-auto print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 shrink-0">
                <img
                  src="/logos/donga-univ-logo.png"
                  alt="동아대학교 로고"
                  className="w-6 h-6 rounded-full bg-white p-0.5 border border-slate-200 object-contain"
                />
                <img
                  src="/logos/disaster-mgmt-logo.jpeg"
                  alt="동아대학교 재난관리학과 로고"
                  className="w-6 h-6 rounded-full bg-white p-0.5 border border-slate-200 object-contain"
                />
              </div>
              <p>© 2026 SafePulse 360 · 동아대학교 재난관리학과 (DADEM) · [{activeCompanyName}]</p>
            </div>
            <p className="flex items-center gap-2 text-slate-400">
              <span>Roughton, Crutchfield &amp; Waite (2019) Safety Culture 실무 진단 및 컨설팅 엔진</span>
            </p>
          </div>
        </footer>
      </div>

      {/* 온보딩 모달 */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        defaultCompanyName={session?.company?.company_name || ""}
        defaultEvaluatorName={session?.company?.evaluator_name || ""}
        onClose={() => setIsOnboardingOpen(false)}
        onSessionStarted={handleSessionStarted}
      />
    </div>
  );
}
