"use client";

import React, { useEffect, useState } from "react";
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  BarChart3,
  Scale,
  Send,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  HardHat,
  Layers,
  Flame,
  Check,
  RotateCcw,
  FileBarChart,
  ShieldAlert,
  Info
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
import { fetchChecklistGroups, fetchChecklistStats } from "@/lib/api";
import ChecklistSurveyModal from "./ChecklistSurveyModal";

interface ChecklistHubViewProps {
  initialGroupId?: string;
  completedModules?: Record<string, any>;
  onModuleComplete?: (groupId: string, result: any) => void;
}

export default function ChecklistHubView({
  initialGroupId,
  completedModules = {},
  onModuleComplete,
}: ChecklistHubViewProps) {
  const [groups, setGroups] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [selectedDomain, setSelectedDomain] = useState<string>("all");

  // 설문 모달 상태
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [activeSurveyGroup, setActiveSurveyGroup] = useState<any>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>("");

  useEffect(() => {
    setIsMounted(true);
    async function init() {
      try {
        const [grpData, statData] = await Promise.all([
          fetchChecklistGroups("all", "all"),
          fetchChecklistStats(),
        ]);
        if (grpData && grpData.length > 0) {
          setGroups(grpData);
          setStats(statData);
        }
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // initialGroupId 변경 시 해당 모듈 자동 선택 및 모달 오픈
  useEffect(() => {
    if (initialGroupId && groups.length > 0) {
      const target = groups.find((g: any) => g.group_id === initialGroupId);
      if (target) {
        setActiveSurveyGroup(target);
        setModalOpen(true);
      }
    }
  }, [initialGroupId, groups]);

  const handleOpenSurvey = (group: any) => {
    setActiveSurveyGroup(group);
    setModalOpen(true);
  };

  const handleSurveyComplete = (groupId: string, result: any) => {
    if (onModuleComplete) {
      onModuleComplete(groupId, result);
    }
    setFeedbackMsg(`[${result.title}] 진단이 완료되어 리포트에 반영되었습니다! (평점: ${result.avgScore} / 5.0)`);
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 8대 모듈 종합 달성률 및 평균 평점 집계
  const completedKeys = Object.keys(completedModules);
  const totalCompletedCount = completedKeys.length;
  const avgOverallScore =
    totalCompletedCount > 0
      ? Math.round(
          (Object.values(completedModules).reduce((acc: number, cur: any) => acc + (cur.avgScore || 0), 0) /
            totalCompletedCount) *
            10
        ) / 10
      : 0;

  // 8대 모듈 전체 비교 레이더 차트 데이터
  const overviewRadarData = groups.map((g) => {
    const res = completedModules[g.group_id];
    const score = res ? res.avgScore : (totalCompletedCount > 0 ? 0 : 2.5);
    return {
      subject: g.title.split("/")[0].trim().slice(0, 7),
      score,
      fullMark: 5,
    };
  });

  // 3대 영역(Domain)별 정의 및 데이터 세팅
  const domainSections = [
    {
      id: "roles",
      title: "1. 계층별 4대 직무책임 실천 영역",
      subtitle: "Roughton et al. (2019) Chapter 7 RAA 모델 (최고경영진 - 공장장 - 감독관 - 작업자)",
      color: "#2563eb",
      fillColor: "#3b82f6",
      themeClass: "from-blue-950/40 via-slate-900/60 to-slate-900 border-blue-500/30",
      badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
      moduleIds: [
        "APP_7_2_LEADERSHIP",
        "APP_7_3_SITE_MANAGER",
        "APP_7_4_SUPERVISOR",
        "APP_7_5_EMPLOYEE",
      ],
      radarData: [
        {
          subject: "최고경영진",
          score: completedModules["APP_7_2_LEADERSHIP"]?.avgScore || 0,
          fullMark: 5,
        },
        {
          subject: "공장장/총괄",
          score: completedModules["APP_7_3_SITE_MANAGER"]?.avgScore || 0,
          fullMark: 5,
        },
        {
          subject: "일선감독관",
          score: completedModules["APP_7_4_SUPERVISOR"]?.avgScore || 0,
          fullMark: 5,
        },
        {
          subject: "현장작업자",
          score: completedModules["APP_7_5_EMPLOYEE"]?.avgScore || 0,
          fullMark: 5,
        },
      ],
      insight:
        "최고경영진의 안전 비전 선언과 실시간 자원 배분(R)이 일선 감독관의 작업중지 재량권 위임(A)과 결합될 때 최상-현장 간 안전 시너지와 자기규율 예방체계가 확립됩니다.",
    },
    {
      id: "culture_risk",
      title: "2. 안전문화 기초 & 위험 지각 16대 편향 영역",
      subtitle: "Roughton et al. (2019) Chapter 2 & Chapter 9 심리적 위험 지각 및 편향 진단",
      color: "#d97706",
      fillColor: "#f59e0b",
      themeClass: "from-amber-950/40 via-slate-900/60 to-slate-900 border-amber-500/30",
      badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
      moduleIds: ["APP_2_2_CULTURE_BASIC", "CH_9_12_RISK_PERCEPTION"],
      radarData: [
        {
          subject: "리더십실천",
          score: completedModules["APP_2_2_CULTURE_BASIC"]?.avgScore || 0,
          fullMark: 5,
        },
        {
          subject: "근로자참여",
          score: completedModules["APP_2_2_CULTURE_BASIC"]
            ? Math.max(1, Math.min(5, Number((completedModules["APP_2_2_CULTURE_BASIC"].avgScore * 0.95).toFixed(1))))
            : 0,
          fullMark: 5,
        },
        {
          subject: "무사고편향방어",
          score: completedModules["CH_9_12_RISK_PERCEPTION"]?.avgScore || 0,
          fullMark: 5,
        },
        {
          subject: "속도압박통제",
          score: completedModules["CH_9_12_RISK_PERCEPTION"]
            ? Math.max(1, Math.min(5, Number((completedModules["CH_9_12_RISK_PERCEPTION"].avgScore * 0.9).toFixed(1))))
            : 0,
          fullMark: 5,
        },
        {
          subject: "위험식별감수성",
          score: completedModules["CH_9_12_RISK_PERCEPTION"]
            ? Math.max(1, Math.min(5, Number((completedModules["CH_9_12_RISK_PERCEPTION"].avgScore * 1.05).toFixed(1))))
            : 0,
          fullMark: 5,
        },
      ],
      insight:
        "'과거에 사고가 없었으니 오늘도 안전할 것'이라는 정상화 편향(Normalization of Deviance)과 작업속도 우선 심리를 차단하고, 일상적 잠재 위험을 선제 보고하는 심리적 안전감이 중요합니다.",
    },
    {
      id: "governance",
      title: "3. 책무성 RAA 시스템 & 안전위원회 거버넌스 영역",
      subtitle: "Roughton et al. (2019) Table 7.3 & Chapter 10 노사 합동 위원회 헌장 운영",
      color: "#059669",
      fillColor: "#10b981",
      themeClass: "from-emerald-950/40 via-slate-900/60 to-slate-900 border-emerald-500/30",
      badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
      moduleIds: ["TAB_7_3_ACCOUNTABILITY", "APP_8_1_COMMITTEE"],
      radarData: [
        {
          subject: "평가연동책무성",
          score: completedModules["TAB_7_3_ACCOUNTABILITY"]?.avgScore || 0,
          fullMark: 5,
        },
        {
          subject: "공정결과관리",
          score: completedModules["TAB_7_3_ACCOUNTABILITY"]
            ? Math.max(1, Math.min(5, Number((completedModules["TAB_7_3_ACCOUNTABILITY"].avgScore * 0.92).toFixed(1))))
            : 0,
          fullMark: 5,
        },
        {
          subject: "위원회헌장명확성",
          score: completedModules["APP_8_1_COMMITTEE"]?.avgScore || 0,
          fullMark: 5,
        },
        {
          subject: "노사합동대표성",
          score: completedModules["APP_8_1_COMMITTEE"]
            ? Math.max(1, Math.min(5, Number((completedModules["APP_8_1_COMMITTEE"].avgScore * 1.04).toFixed(1))))
            : 0,
          fullMark: 5,
        },
      ],
      insight:
        "안전 실천이 단순한 권고를 넘어 인사평가 및 실질적 인센티브와 연계(A)되고, 안전보건위원회가 형식적 보고기구를 탈피하여 실질적 예산 의결 기구로 기능해야 합니다.",
    },
  ];

  // 필터링된 영역 목록
  const displayedDomains =
    selectedDomain === "all"
      ? domainSections
      : domainSections.filter((d) => d.id === selectedDomain);

  return (
    <div className="space-y-8 pb-16">
      {/* 상단 브리핑 헤더 */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wide">
              Roughton et al. (2019) 부록 정밀진단 허브
            </span>
            <span className="text-xs text-slate-500 font-medium">8대 모듈 종합 리포트 & 영역별 방사형 분석</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
            부록 체크리스트 8대 진단 종합 리포트
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            계층별 직무책임 4대 진단, 문화 기초진단, 위험 지각 16대 진단, 책무성 시스템, 위원회 헌장을
            <strong>모바일/웹 맞춤형 설문 모달</strong>로 진행하고 각 영역별 방사형 그래프로 한눈에 비교·분석합니다.
          </p>
        </div>

        {feedbackMsg && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm animate-pulse">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}
      </div>

      {/* 8대 모듈 종합 성숙도 요약 대시보드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 1. 진행 현황 & 평균 평점 */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase">
              종합 진단 진행률
            </span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">{totalCompletedCount}</span>
              <span className="text-lg text-slate-300 font-semibold">/ 8개 모듈 완료</span>
            </div>
            <div className="w-full bg-white/10 h-2.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-blue-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.round((totalCompletedCount / 8) * 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">완료 모듈 평균 평점</span>
              <span className="text-xl font-black text-blue-300">
                {avgOverallScore > 0 ? `${avgOverallScore} / 5.0` : "- / 5.0"}
              </span>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-lg bg-white/10 text-slate-200">
              {totalCompletedCount === 8 ? "전체 진단 완결" : `${8 - totalCompletedCount}개 모듈 미완료`}
            </span>
          </div>
        </div>

        {/* 2. 8대 모듈 통합 레이더 비교 차트 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileBarChart className="w-4 h-4 text-blue-600" />
              부록 8대 전사 통합 성숙도 레이더
            </h3>
            <span className="text-[10px] text-slate-400">5.0 만점 기준</span>
          </div>
          <div className="h-44 w-full">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={overviewRadarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#cbd5e1" tick={{ fill: "#94a3b8", fontSize: 9 }} />
                  <Radar
                    name="전사 성숙도"
                    dataKey="score"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={totalCompletedCount > 0 ? 0.4 : 0.15}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "11px", color: "#fff" }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                차트 생성 중...
              </div>
            )}
          </div>
        </div>

        {/* 3. 취약 지점 및 권고사항 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              부록 진단 핵심 개선 포인트
            </h3>
            <ul className="text-xs text-slate-600 space-y-2 mt-3 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span><strong>경영진 책임(App 7.2):</strong> 현장 리스닝 라운딩 및 실시간 안전 자원 배정 확인</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span><strong>위험 지각(Ch 9.12):</strong> 과거 무사고 편향 및 "빨리 끝내기" 심리 차단 점검</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>책무성(Table 7.3):</strong> 안전 행동에 대한 즉각적 공정 결과관리 구축</span>
              </li>
            </ul>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            ✓ 아래 3대 영역별 방사형 그래프를 통해 계층 및 분야별 세부 취약점을 진단하세요.
          </div>
        </div>
      </div>

      {/* 4. 영역별 탭 필터 (View Switcher) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              부록 3대 영역별 정밀 방사형(Radar) 심층 리포트
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              교재 원문에 근거하여 직무책임, 위험심리, 거버넌스 3개 영역으로 그룹화된 개별 방사형 다이어그램을 분석합니다.
            </p>
          </div>

          {/* 탭 버튼들 */}
          <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedDomain("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDomain === "all"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              전체 3대 영역 비교
            </button>
            <button
              onClick={() => setSelectedDomain("roles")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDomain === "roles"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              1. 계층별 직무책임 (4)
            </button>
            <button
              onClick={() => setSelectedDomain("culture_risk")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDomain === "culture_risk"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              2. 문화기초 & 위험지각 (2)
            </button>
            <button
              onClick={() => setSelectedDomain("governance")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDomain === "governance"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              3. 책무성 & 위원회 (2)
            </button>
          </div>
        </div>

        {/* 5. 영역별 방사형 그래프 & 해당 모듈 카드 렌더링 */}
        <div className="space-y-8">
          {displayedDomains.map((domain) => {
            const domainGroups = groups.filter((g) => domain.moduleIds.includes(g.group_id));
            const completedCount = domainGroups.filter((g) => completedModules[g.group_id]).length;
            const domainScores = domainGroups
              .map((g) => completedModules[g.group_id]?.avgScore)
              .filter((s): s is number => typeof s === "number");
            const domainAvg =
              domainScores.length > 0
                ? Math.round((domainScores.reduce((a, b) => a + b, 0) / domainScores.length) * 10) / 10
                : 0;

            return (
              <div
                key={domain.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6"
              >
                {/* 영역 헤더 */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${domain.badgeClass}`}>
                        {domain.title.split(".")[0]} 영역
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        진행률: <strong>{completedCount} / {domain.moduleIds.length}개 완료</strong>
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mt-1">
                      {domain.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {domain.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">영역 평균 평점</span>
                      <span className="text-xl font-black text-slate-900">
                        {domainAvg > 0 ? `${domainAvg} / 5.0` : "- / 5.0"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 중앙: 방사형 레이더 그래프 + 영역 해석 인사이트 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* 방사형 차트 컨테이너 */}
                  <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center">
                    <div className="w-full flex justify-between items-center mb-1 px-1">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <FileBarChart className="w-3.5 h-3.5" style={{ color: domain.color }} />
                        {domain.title.split(".")[1]?.trim() || domain.title} 방사형 차트
                      </span>
                      <span className="text-[10px] text-slate-400">5.0 만점 기준</span>
                    </div>

                    <div className="h-48 w-full flex items-center justify-center">
                      {isMounted ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={domain.radarData}>
                            <PolarGrid stroke="#cbd5e1" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 10, fontWeight: 600 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#94a3b8" tick={{ fill: "#64748b", fontSize: 9 }} />
                            <Radar
                              name="영역 평점"
                              dataKey="score"
                              stroke={domain.color}
                              fill={domain.fillColor}
                              fillOpacity={completedCount > 0 ? 0.4 : 0.12}
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

                    <span className="text-[10px] text-slate-400 mt-1">
                      {completedCount > 0
                        ? `진단 완료된 ${completedCount}개 세부 평가점수가 반영되었습니다.`
                        : "해당 영역 모듈을 진단하시면 방사형 다이어그램이 활성화됩니다."}
                    </span>
                  </div>

                  {/* 우측: 영역 이론 인사이트 및 시사점 */}
                  <div className="lg:col-span-7 space-y-3.5">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            Roughton et al. (2019) 학술적 시사점 & 진단 가이드
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {domain.insight}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        아래 {domainGroups.length}개 모듈의 설문을 완료하여 영역별 균형도를 강화하세요.
                      </span>
                    </div>
                  </div>
                </div>

                {/* 해당 영역의 개별 체크리스트 모듈 카드 그리드 */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    {domain.title} 소속 개별 진단 모듈 ({domainGroups.length}개)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {domainGroups.map((group) => {
                      const res = completedModules[group.group_id];
                      const isCompleted = Boolean(res);
                      const score = res ? res.avgScore : 0;
                      const level = res ? res.level : "미완료 (진단 대기)";
                      const itemCount = group.items?.length || 0;

                      return (
                        <div
                          key={group.group_id}
                          className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                            isCompleted
                              ? "bg-white border-emerald-200 shadow-sm hover:border-emerald-400"
                              : "bg-white border-slate-200 shadow-xs hover:border-blue-300"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                                {group.source_chapter}
                              </span>

                              {isCompleted ? (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  진단 완료
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                  미완료
                                </span>
                              )}
                            </div>

                            <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                              {group.title}
                            </h3>

                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {group.description}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                            <div className="flex justify-between items-baseline">
                              <span className="text-[11px] text-slate-500">
                                문항수: <strong>{itemCount}개</strong>
                              </span>
                              <span className="text-sm font-black text-slate-900">
                                {isCompleted ? (
                                  <span className="text-blue-600">{score} / 5.0</span>
                                ) : (
                                  <span className="text-slate-400">- / 5.0</span>
                                )}
                              </span>
                            </div>

                            {isCompleted && (
                              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-[11px] font-semibold text-emerald-800 truncate">
                                {level.split(":")[0]}
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => handleOpenSurvey(group)}
                              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                                isCompleted
                                  ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                              }`}
                            >
                              <span>{isCompleted ? "다시 진단하기 (모달)" : "설문 진단 시작 (모달)"}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 맞춤형 설문 마법사 모달 */}
      <ChecklistSurveyModal
        isOpen={modalOpen}
        group={activeSurveyGroup}
        onClose={() => setModalOpen(false)}
        onComplete={handleSurveyComplete}
        initialAnswers={activeSurveyGroup ? completedModules[activeSurveyGroup.group_id]?.answers : undefined}
      />
    </div>
  );
}