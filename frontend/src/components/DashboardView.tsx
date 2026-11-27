"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Clock,
  Sparkles,
  Layers,
  Award,
  CheckCircle2,
  FileBarChart,
  Scale,
  Building2,
  HardHat,
  RefreshCw,
  Plus,
  Search,
  UserCheck
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip
} from "recharts";
import { fetchAssessmentResults, fetchONAGraph, fetchConsultingReport } from "@/lib/api";
import TextbookSourceBadge from "./TextbookSourceBadge";

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  session?: any;
  sessions?: any[];
  sessionsLoading?: boolean;
  onSelectSession?: (session: any) => void;
  onRefreshSessions?: () => void;
  onCreateNewSession?: () => void;
  onOpenOnboarding?: () => void;
  completedChecklistModules?: Record<string, any>;
}

export default function DashboardView({
  onNavigate,
  session,
  sessions = [],
  sessionsLoading = false,
  onSelectSession,
  onRefreshSessions,
  onCreateNewSession,
  onOpenOnboarding,
  completedChecklistModules = {},
}: DashboardViewProps) {
  const [assessment, setAssessment] = useState<any>(null);
  const [ona, setOna] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [sessionSearch, setSessionSearch] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [aData, oData, rData] = await Promise.all([
          fetchAssessmentResults(),
          fetchONAGraph(),
          fetchConsultingReport(),
        ]);
        setAssessment(aData);
        setOna(oData);
        setReport(rData);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 실제 완료 여부 및 진단 결과 객체 추출
  const sessionResult = session?.assessment_result || session?.result || session?.results;
  const hasCompleted = Boolean(session?.is_completed || sessionResult);

  // 진단이 완료되었을 때만 실제 결과 바인딩 (미완료 시 더미데이터 노출 차단)
  const activeResult = sessionResult || (hasCompleted ? assessment : null);
  const raa = activeResult?.raa_scores;
  const lead = activeResult?.leadership_scores;
  const dim = activeResult?.dimension_scores;

  const answeredCount = session?.answers ? Object.keys(session.answers).length : 0;
  const totalQuestions = session?.total_questions || 26;
  const progressPct =
    session?.progress_percent ??
    session?.progress_percentage ??
    session?.progress_pct ??
    (answeredCount > 0 ? Math.min(100, Math.round((answeredCount / totalQuestions) * 100)) : 0);
  const companyName = session?.company?.company_name || "우리 기관/회사";
  const industryLabels: Record<string, string> = {
    manufacturing: "제조업",
    construction: "건설업",
    chemical: "화학·에너지",
    logistics: "운송·물류",
    public_safety: "공공·소방",
    service_other: "서비스·기타",
  };
  const roleLabels: Record<string, string> = {
    executive: "경영진/임원",
    manager: "중간관리자",
    worker: "현장작업자",
  };
  const industryName = session?.company?.industry
    ? industryLabels[session.company.industry] || session.company.industry
    : "업종 미설정";
  const evaluatorName = session?.company?.evaluator_name || "";

  const filteredSessions = sessions.filter((item) => {
    if (!sessionSearch.trim()) return true;
    const q = sessionSearch.trim().toLowerCase();
    const cName = (item?.company?.company_name || "").toLowerCase();
    const eName = (item?.company?.evaluator_name || "").toLowerCase();
    return cName.includes(q) || eName.includes(q);
  });

  // 부록 8개 모듈 완료 수
  const completedChecklistCount = Object.keys(completedChecklistModules).length;

  // 부록 8대 체크리스트 레이더 차트 및 영역별 집계
  const appendixModuleDefs = [
    { id: "APP_7_2_LEADERSHIP", name: "최고경영진", domain: "roles" },
    { id: "APP_7_3_SITE_MANAGER", name: "공장장", domain: "roles" },
    { id: "APP_7_4_SUPERVISOR", name: "일선감독관", domain: "roles" },
    { id: "APP_7_5_EMPLOYEE", name: "현장작업자", domain: "roles" },
    { id: "APP_2_2_CULTURE_BASIC", name: "문화기초", domain: "culture" },
    { id: "CH_9_12_RISK_PERCEPTION", name: "위험지각", domain: "culture" },
    { id: "TAB_7_3_ACCOUNTABILITY", name: "책무성", domain: "governance" },
    { id: "APP_8_1_COMMITTEE", name: "안전위원회", domain: "governance" },
  ];

  const appendixRadarData = appendixModuleDefs.map((def) => {
    const res = completedChecklistModules[def.id];
    return {
      subject: def.name,
      score: res ? res.avgScore : (completedChecklistCount > 0 ? 0 : 2.5),
      fullMark: 5,
      isDone: Boolean(res),
    };
  });

  const getDomainAvg = (domainName: string) => {
    const mods = appendixModuleDefs.filter((d) => d.domain === domainName);
    const completedMods = mods.filter((d) => completedChecklistModules[d.id]);
    if (completedMods.length === 0) return null;
    const sum = completedMods.reduce((acc, cur) => acc + (completedChecklistModules[cur.id]?.avgScore || 0), 0);
    return Math.round((sum / completedMods.length) * 10) / 10;
  };

  const rolesAvg = getDomainAvg("roles");
  const cultureAvg = getDomainAvg("culture");
  const governanceAvg = getDomainAvg("governance");

  return (
    <div className="space-y-8 pb-16">
      <TextbookSourceBadge
        chapter="Ch 2 (APP 2.2) · Ch 7 (FIG. 7.1) · Ch 8 · Ch 9"
        title="전사 안전문화 & RAA·부록 통합 대시보드"
        law="산안법 제14·15·16·24조 / 중처법 제4조"
      />
      {/* 1. 상단 종합 브리핑 배너 */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 text-slate-900 shadow-sm">
              <img
                src="/logos/donga-univ-logo.png"
                alt="동아대학교 로고"
                className="w-6 h-6 rounded-full object-contain bg-white"
              />
              <img
                src="/logos/disaster-mgmt-logo.jpeg"
                alt="동아대학교 재난관리학과 로고"
                className="w-6 h-6 rounded-full object-contain bg-white"
              />
              <span className="text-[11px] font-extrabold tracking-tight text-slate-900">
                동아대학교 · 재난관리학과 (DADEM)
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[11px] font-bold">
              회원가입 없이 바로 이용 가능
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold tracking-wide uppercase">
              [{companyName}] 안전문화 진단 현황
            </span>
            {evaluatorName && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-600 text-slate-200 text-[11px] font-semibold">
                담당자: {evaluatorName}
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[11px] font-bold">
              업종: {industryName}
            </span>
            {hasCompleted ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                진단 완료
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                진단 대기 중 ({progressPct}%)
              </span>
            )}
          </div>

          {hasCompleted ? (
            <>
              <h1 className="text-2xl sm:text-4xl font-black mt-3 tracking-tight">
                [{companyName}] 안전문화 성숙도{" "}
                <span className="text-blue-400">
                  {activeResult?.overall_index || report?.overall_safety_index || 80}점
                </span>{" "}
                <span className="text-base sm:text-lg font-normal text-slate-300">
                  ({(activeResult?.maturity_level || report?.overall_maturity_level || "Level 3: 시스템 단계").split(":")[0]})
                </span>
              </h1>
              <p className="mt-2 text-slate-300 text-xs sm:text-sm leading-relaxed">
                Roughton, Crutchfield & Waite (2019) 안전문화 모델에 기반하여 리더십 RAA 삼원조, 8대 리더십 기대치,
                조직 네트워크(ONA), 생애주기별 법령 연계 KPI를 실시간 통합 분석한 결과입니다.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight">
                [{companyName}] 첫 안전문화 자가진단을 시작해보세요!
              </h1>
              <p className="mt-2 text-slate-300 text-xs sm:text-sm leading-relaxed">
                현재 등록된 진단 평가 데이터가 없습니다. 약 3~5분 정도 소요되는 모바일/웹 카드형 설문을 완료하시면
                귀사의 RAA 균형 지수, 8대 리더십 기대치 평점, 업종별 벤치마크 비교 및 3단계 맞춤형 로드맵이 실시간 산출됩니다.
              </p>
            </>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => (!session && onOpenOnboarding ? onOpenOnboarding() : onNavigate("assessment"))}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg hover:scale-105"
            >
              {hasCompleted
                ? "자가진단 다시하기 (Wizard)"
                : progressPct > 0
                ? "진단 이어하기 (Wizard)"
                : "맞춤형 진단 시작하기 (Wizard)"}{" "}
              <ArrowRight className="w-4 h-4" />
            </button>
            {hasCompleted && (
              <button
                onClick={() => onNavigate("company_report")}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-colors backdrop-blur-sm"
              >
                종합 진단 보고서 보기
              </button>
            )}
            <button
              onClick={onOpenOnboarding}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-colors backdrop-blur-sm"
            >
              {session ? "회사/업종 변경" : "기관/업종 설정"}
            </button>
          </div>
        </div>
      </div>

      {/* 1-1. 진행 중인 진단 세션 선택기 (회사명 · 담당자명 기반 다중 세션 전환) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                진행 중인 진단 세션 선택
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {sessions.length}개 세션
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              회사명·담당자를 클릭하면 해당 세션의 진단 진행 현황과 보고서로 즉시 전환됩니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {sessions.length >= 4 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                  placeholder="회사명 또는 담당자 검색..."
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                />
              </div>
            )}
            {onRefreshSessions && (
              <button
                type="button"
                onClick={onRefreshSessions}
                disabled={sessionsLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${sessionsLoading ? "animate-spin" : ""}`} />
                <span>새로고침</span>
              </button>
            )}
            <button
              type="button"
              onClick={onCreateNewSession || onOpenOnboarding}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>새 세션 만들기</span>
            </button>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center space-y-2.5">
            <p className="text-xs text-slate-500">
              아직 생성된 진단 세션이 없습니다. 회사명과 담당자를 입력해 첫 세션을 시작하거나 여러 기관 사례를 체험해 보세요.
            </p>
            <button
              type="button"
              onClick={onCreateNewSession || onOpenOnboarding}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>새 진단 세션 만들기</span>
            </button>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center text-xs text-slate-500">
            &ldquo;{sessionSearch}&rdquo;와 일치하는 세션(회사명/담당자)이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[320px] overflow-y-auto pr-1">
            {filteredSessions.map((item) => {
              const isSelected = Boolean(session?.session_id && item.session_id === session.session_id);
              const itemCompany = item?.company?.company_name || "기관명 미입력";
              const itemEvaluator = item?.company?.evaluator_name || "담당자 미지정";
              const itemRole = item?.company?.evaluator_role
                ? roleLabels[item.company.evaluator_role] || item.company.evaluator_role
                : "";
              const itemIndustry = item?.company?.industry
                ? industryLabels[item.company.industry] || item.company.industry
                : "업종 미설정";
              const itemAnswersCount = item?.answers ? Object.keys(item.answers).length : 0;
              const itemTotalQ = item?.total_questions || 26;
              const itemResult = item?.assessment_result || item?.result || item?.results;
              const itemCompleted = Boolean(item?.is_completed || itemResult);
              const itemPct = itemCompleted
                ? 100
                : item?.progress_percent ??
                  item?.progress_percentage ??
                  item?.progress_pct ??
                  Math.min(100, Math.round((itemAnswersCount / itemTotalQ) * 100));
              const itemScore = itemResult?.overall_index;

              let updatedLabel = "";
              if (item?.updated_at) {
                try {
                  updatedLabel = new Date(item.updated_at).toLocaleDateString("ko-KR", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                } catch {
                  updatedLabel = "";
                }
              }

              return (
                <button
                  key={item.session_id}
                  type="button"
                  onClick={() => onSelectSession?.(item)}
                  className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-100 shadow-xs"
                      : "border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-white"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-extrabold text-sm text-slate-900 line-clamp-1">
                        {itemCompany}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white shrink-0">
                          현재 선택
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                        <UserCheck className="w-3 h-3 text-blue-600" />
                        {itemEvaluator}
                      </span>
                      {itemRole && <span className="text-slate-400">({itemRole})</span>}
                      <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 text-[10px] font-bold">
                        {itemIndustry}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      {itemCompleted ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          진단 완료{typeof itemScore === "number" ? ` · ${itemScore}점` : ""}
                        </span>
                      ) : itemAnswersCount > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          진행 중 {itemPct}% ({itemAnswersCount}/{itemTotalQ})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                          시작 전
                        </span>
                      )}

                      {updatedLabel && (
                        <span className="text-[10px] text-slate-400 truncate">{updatedLabel}</span>
                      )}
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          itemCompleted ? "bg-emerald-500" : "bg-blue-600"
                        }`}
                        style={{ width: `${Math.max(itemCompleted ? 100 : itemPct, itemAnswersCount > 0 ? 6 : 0)}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. 4대 핵심 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* RAA 균형 지수 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500">RAA 삼원조 균형 지수</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {hasCompleted && raa?.balance_index ? `${raa.balance_index} / 100` : "- / 100"}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span
              className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg border ${
                hasCompleted && raa?.diagnosis_status
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              {hasCompleted && raa?.diagnosis_status ? raa.diagnosis_status : "진단 대기 중"}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 line-clamp-2">
            {hasCompleted && raa?.status_description
              ? raa.status_description
              : "설문 완료 후 책임·권한·책무 균형 상태가 산출됩니다."}
          </p>
        </div>

        {/* 8대 리더십 기대치 평균 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500">8대 리더십 기대치 평점</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {hasCompleted && lead?.average_score ? `${lead.average_score} / 5.0` : "- / 5.0"}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-600 font-medium truncate">
            최우수:{" "}
            <span className="text-emerald-600 font-bold">
              {hasCompleted && lead?.strongest_attribute ? lead.strongest_attribute : "진단 대기 중"}
            </span>
          </p>
          <p className="mt-1 text-xs text-slate-600 font-medium truncate">
            개선시급:{" "}
            <span className="text-rose-600 font-bold">
              {hasCompleted && lead?.weakest_attribute ? lead.weakest_attribute : "진단 대기 중"}
            </span>
          </p>
        </div>

        {/* ONA 네트워크 활성도 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500">소통 네트워크 밀도 & 오피니언</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                밀도 {((ona?.network_density || 0.42) * 100).toFixed(1)}%
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-600">오피니언 리더:</span>
            <span className="font-bold text-slate-900">{ona?.opinion_leaders?.length || 0}명</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-slate-600">고립 취약 노드:</span>
            <span className="font-bold text-rose-600">{ona?.isolated_nodes_count || 0}명 감지</span>
          </div>
        </div>

        {/* 생애주기 KPI 지표 수 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500">생애주기 법령 KPI 관리</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">6개 핵심 지표</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[11px] font-bold">
              고유(70%): 4건
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              협업(30%): 2건
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">산안법 & 중처법 조문 연동 완료</p>
        </div>
      </div>

      {/* 3. 부록 8대 체크리스트 실시간 점검 & 영역별 방사형 레이더 카드 */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-emerald-900/40 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* 좌측: 진단 안내 및 3대 영역 현황 */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                Roughton et al. (2019) 부록(Appendix) 총람
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-slate-200 font-semibold">
                진행 상태: <strong className="text-emerald-400 font-black">{completedChecklistCount} / 8개 완료</strong>
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                교재 부록 8대 그룹 60대 실무 체크리스트 개별 진단 모듈
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                최고경영진, 공장장, 감독관, 작업자 계층별 실천 책임과 위험 지각 16대 편향을 1~5점 모달 설문으로 진단하고 실시간 리포트를 확인합니다.
              </p>
            </div>

            {/* 3대 핵심 영역별 평균 점수 뱃지 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="text-[11px] text-slate-400 font-medium block">계층별 4대 책임</span>
                <div className="text-base font-extrabold text-blue-300 mt-0.5">
                  {rolesAvg !== null ? `${rolesAvg} / 5.0` : "진단 대기 중"}
                </div>
                <span className="text-[10px] text-slate-500">경영진·공장장·감독관·작업자</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="text-[11px] text-slate-400 font-medium block">문화기초 & 위험지각</span>
                <div className="text-base font-extrabold text-amber-300 mt-0.5">
                  {cultureAvg !== null ? `${cultureAvg} / 5.0` : "진단 대기 중"}
                </div>
                <span className="text-[10px] text-slate-500">문화 4요소 & 16대 편향</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <span className="text-[11px] text-slate-400 font-medium block">책무성 & 위원회</span>
                <div className="text-base font-extrabold text-emerald-300 mt-0.5">
                  {governanceAvg !== null ? `${governanceAvg} / 5.0` : "진단 대기 중"}
                </div>
                <span className="text-[10px] text-slate-500">평가 연동 & 헌장 거버넌스</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate("checklists")}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg hover:scale-105"
              >
                <span>부록 8대 종합 리포트 가기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 우측: 8대 부록 방사형 레이더 그래프 */}
          <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center">
            <div className="w-full flex justify-between items-center mb-2 px-1">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <FileBarChart className="w-3.5 h-3.5 text-emerald-400" />
                부록 8대 진단 방사형 레이더
              </span>
              <span className="text-[10px] text-slate-400">
                {completedChecklistCount > 0 ? "실시간 응답 반영 (5.0 만점)" : "진단 대기 중"}
              </span>
            </div>

            <div className="h-52 w-full flex items-center justify-center">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={appendixRadarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#475569" tick={{ fill: "#64748b", fontSize: 9 }} />
                    <Radar
                      name="성숙도"
                      dataKey="score"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={completedChecklistCount > 0 ? 0.45 : 0.15}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "11px", color: "#fff" }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-400">차트 준비 중...</div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mt-1 text-center">
              {completedChecklistCount > 0
                ? `8개 중 ${completedChecklistCount}개 모듈의 설문 결과가 실시간 방사형 차트에 반영되었습니다.`
                : "각 모듈 설문을 완료하시면 실시간 방사형 다이어그램이 완성됩니다."}
            </p>
          </div>
        </div>
      </div>

      {/* 4. RAA 트라이어드 & 리더십 역할 정밀 분석 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RAA 삼원조 상태 분석 */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                리더십 RAA 삼원조(Triad) 진단 상태
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                책임(Responsibility), 권한(Authority), 책무성(Accountability)의 상호작용 균형도
              </p>
            </div>
            <button
              onClick={() => onNavigate("assessment")}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              {hasCompleted ? "재진단 & 세부항목" : "진단 시작하기"} &rarr;
            </button>
          </div>

          {hasCompleted && raa ? (
            <>
              <div className="grid grid-cols-3 gap-3 my-4 text-center">
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">궁극적 책임 (R)</span>
                  <p className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">
                    {raa.responsibility}점
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">리더십의 결과 책임</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">하향 위임 권한 (A)</span>
                  <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
                    {raa.authority}점
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">현장 작업중지 & 재량</p>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">직무 책무성 (A)</span>
                  <p className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1">
                    {raa.accountability}점
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">수칙 이행 및 해명의무</p>
                </div>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">
                      진단 판정: {raa.diagnosis_status} (균형 지수: {raa.balance_index}점)
                    </h4>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      {raa.status_description} 권한 위임(Delegation)의 부재는 현장의 방어적 순응주의를 유발하므로,
                      관리감독자에게 위험 작업중지권(Stop-Work)과 즉시 예산 집행 권한을 이양해야 합니다.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                아직 RAA 삼원조 진단 결과가 없습니다
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                회사 맞춤진단(Wizard)을 완료하시면 귀사의 책임, 권한, 책무성 3요소 균형도와 위험 판정 코멘트가 실시간 산출됩니다.
              </p>
              <button
                onClick={() => onNavigate("assessment")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
              >
                자가진단 시작하기
              </button>
            </div>
          )}
        </div>

        {/* 관리자 vs 리더 역할 비중 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              관리자 vs 리더 역할 비중
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ch 7 환원주의적 관리 vs 시스템적 리더십
            </p>

            {hasCompleted && dim?.manager_vs_leader ? (
              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-700">관리자 역할 (규정 준수·통제)</span>
                    <span className="text-blue-600">
                      {dim.manager_vs_leader["관리자 성향(규정·통제)"]}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${dim.manager_vs_leader["관리자 성향(규정·통제)"]}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-700">리더십 역할 (비전·문화)</span>
                    <span className="text-indigo-600">
                      {dim.manager_vs_leader["리더십 성향(비전·영감)"]}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{ width: `${dim.manager_vs_leader["리더십 성향(비전·영감)"]}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 my-4 space-y-2">
                <span className="text-xs font-bold text-slate-500 block">진단 대기 중</span>
                <p className="text-[11px] text-slate-400">
                  설문 후 관리 성향 vs 리더십 성향 비율이 계산됩니다.
                </p>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            💡 <strong>교재 통찰:</strong> 단순 규정 관리는 단기 순응에 그칩니다. 안전 전문가는 <strong>기술자 &rarr; 신뢰받는 리더</strong>로 적극 전환해야 합니다.
          </div>
        </div>
      </div>
    </div>
  );
}
