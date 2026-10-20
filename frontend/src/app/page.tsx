"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import LandingHeroView from "@/components/LandingHeroView";
import DashboardView from "@/components/DashboardView";
import AssessmentWizardView from "@/components/AssessmentWizardView";
import ONAView from "@/components/ONAView";
import KPIView from "@/components/KPIView";
import ConsultingView from "@/components/ConsultingView";
import ChecklistHubView from "@/components/ChecklistHubView";
import CompanyReportView from "@/components/CompanyReportView";
import OnboardingModal from "@/components/OnboardingModal";
import AuthModal from "@/components/AuthModal";
import {
  fetchCurrentUser,
  clearAuthToken,
  fetchSession,
  startCompanySession
} from "@/lib/api";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completedChecklistModules, setCompletedChecklistModules] = useState<Record<string, any>>({});
  const [selectedChecklistGroupId, setSelectedChecklistGroupId] = useState<string>("APP_7_2_LEADERSHIP");

  useEffect(() => {
    async function initAuthAndSession() {
      try {
        const user = await fetchCurrentUser();
        if (user) {
          setCurrentUser(user);
          const storedSessionId = localStorage.getItem("safepulse_session_id");
          if (storedSessionId) {
            const sess = await fetchSession(storedSessionId);
            if (sess) {
              setSession(sess);
            }
          }
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
    initAuthAndSession();
  }, []);

  // 회원가입 또는 로그인 성공 시 핸들러
  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    // 신규 회원이면 온보딩(업종 선택) 모달 오픈
    if (!user.has_completed_assessment) {
      setIsOnboardingOpen(true);
    } else {
      setCurrentTab("dashboard");
    }
  };

  // 온보딩 완료 시 세션 시작 및 진단 서베이로 이동
  const handleSessionStarted = (newSession: any) => {
    setSession(newSession);
    setCurrentTab("assessment");
  };

  // 진단 완료 시 종합 리포트 탭으로 이동
  const handleAssessmentComplete = () => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, has_completed_assessment: true });
    }
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

  // 로그아웃
  const handleLogout = () => {
    clearAuthToken();
    setCurrentUser(null);
    setSession(null);
    setCurrentTab("dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 1. 비로그인 방문자 화면: 랜딩 히어로 우선 노출
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  S
                </div>
                <div>
                  <span className="font-extrabold text-lg text-slate-900">
                    SafePulse <span className="text-blue-600">360</span>
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded-full ml-1.5">
                    Roughton et al. Model
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setAuthMode("login"); setIsAuthOpen(true); }}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  로그인
                </button>
                <button
                  onClick={() => { setAuthMode("register"); setIsAuthOpen(true); }}
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-sm transition-all"
                >
                  무료 자가진단 시작
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <LandingHeroView
            onStartRegister={() => { setAuthMode("register"); setIsAuthOpen(true); }}
            onStartLogin={() => { setAuthMode("login"); setIsAuthOpen(true); }}
          />
        </main>

        <footer className="border-t border-slate-200 bg-white py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
            © 2026 SafePulse 360. All rights reserved. Roughton, Crutchfield & Waite (2019) Safety Culture 기반 자가진단 플랫폼.
          </div>
        </footer>

        <AuthModal
          isOpen={isAuthOpen}
          initialMode={authMode}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  // 2. 로그인된 사용자 전용 대시보드 및 진단 포털
  const hasAssessmentResult = Boolean(session?.results || currentUser?.has_completed_assessment);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* 상단 고정 헤더: 핵심 사업장/계정 정보 중심 */}
      <Navbar
        companyName={currentUser.company_name}
        industry={session?.company?.industry || "manufacturing"}
        userName={currentUser.name}
        hasAssessmentResult={hasAssessmentResult}
        onLogout={handleLogout}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* 좌측 사이드바: 모든 기능적 메뉴 관리 */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        hasAssessmentResult={hasAssessmentResult}
        completedChecklistModules={completedChecklistModules}
        onSelectChecklistModule={(groupId) => {
          setSelectedChecklistGroupId(groupId);
          setCurrentTab("checklists");
        }}
      />

      {/* 본문 콘텐츠 영역 (좌측 사이드바 여백 lg:pl-64) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 transition-all duration-200">
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          {currentTab === "dashboard" && (
            <DashboardView
              onNavigate={setCurrentTab}
              session={session}
              currentUser={currentUser}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              completedChecklistModules={completedChecklistModules}
            />
          )}
          {currentTab === "assessment" && (
            <AssessmentWizardView
              session={session}
              onSessionUpdate={setSession}
              onComplete={handleAssessmentComplete}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />
          )}
          {currentTab === "company_report" && (
            <CompanyReportView
              session={session}
              onRestartAssessment={() => setCurrentTab("assessment")}
            />
          )}
          {(currentTab === "checklists" || currentTab.startsWith("chk_")) && (
            <ChecklistHubView
              initialGroupId={selectedChecklistGroupId}
              completedModules={completedChecklistModules}
              onModuleComplete={handleChecklistModuleComplete}
            />
          )}
          {currentTab === "ona" && <ONAView />}
          {currentTab === "kpi" && <KPIView />}
          {currentTab === "consulting" && <ConsultingView />}
        </main>

        <footer className="border-t border-slate-200 bg-white py-5 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500">
            <p>© 2026 SafePulse 360. [{currentUser.company_name}] 접속 중</p>
            <p className="flex items-center gap-2">
              <span>Roughton, Crutchfield & Waite (2019) Safety Culture 실무 진단 및 컨설팅 엔진</span>
            </p>
          </div>
        </footer>
      </div>

      {/* 온보딩 모달 */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        defaultCompanyName={currentUser.company_name}
        defaultEvaluatorName={currentUser.name}
        onClose={() => setIsOnboardingOpen(false)}
        onSessionStarted={handleSessionStarted}
      />
    </div>
  );
}
