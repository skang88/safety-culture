"use client";

import React from "react";
import {
  Printer,
  RotateCcw,
  TrendingUp,
  Award,
  Calendar,
  CheckSquare,
  Factory,
  Compass,
  ArrowRight,
  Layers,
  BookOpen,
  ClipboardCheck
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import TextbookSourceBadge from "./TextbookSourceBadge";
import type { PillarScore } from "@/lib/types/assessment";

interface CompanyReportViewProps {
  session: any;
  onRestartAssessment: () => void;
  onNavigate?: (tab: string) => void;
  completedChecklistModules?: Record<string, any>;
}

const FALLBACK_PILLARS: PillarScore[] = [
  {
    id: "D1_CULTURE_BASE",
    name: "1. 문화 기반 & 멘탈 모델",
    short_name: "문화기반·네트워크",
    chapters: "Ch 1·2·3",
    score: 3.7,
    score_100: 74,
    status: "보통",
    recommended_tab: "ona",
    recommended_label: "ONA 네트워크 분석 (Ch 3)",
    consulting_guide:
      "무손실=무위험 오류(Ch 1), Schein 3수준 사일로 해체(Ch 2), 비공식 오피니언 리더·3단계 영향력 확산망(Ch 3)을 결합해 문화 기반을 재설계합니다.",
  },
  {
    id: "D2_LEADERSHIP_RAA",
    name: "2. 비전·전략 & 리더십·RAA",
    short_name: "비전·리더십·RAA",
    chapters: "Ch 4·7",
    score: 3.6,
    score_100: 72,
    status: "보통",
    recommended_tab: "checklists",
    recommended_label: "부록 8대 정밀진단 (App 7.2~7.5)",
    consulting_guide:
      "비전·미션 정렬 및 경계 확장(Ch 4)과 계층별 직무책임(App 7.2~7.5), RAA 권한 위임·공정 결과관리(Ch 7)를 연계 처방합니다.",
  },
  {
    id: "D3_INVOLVEMENT",
    name: "3. 직원 참여 & 심리적 안전감",
    short_name: "직원참여·안전감",
    chapters: "Ch 8",
    score: 3.4,
    score_100: 68,
    status: "보통",
    recommended_tab: "checklists",
    recommended_label: "안전위원회 헌장 정밀진단 (App 8.1)",
    consulting_guide:
      "안전 발언권(Voice) 보장과 안전위원회 헌장(App 8.1) 실질화를 통해 수동적 순응에서 능동적 주인의식으로 전환합니다.",
  },
  {
    id: "D4_RISK_PROCESS",
    name: "4. 위험 지각 & 위험관리 프로세스",
    short_name: "위험지각·8단계관리",
    chapters: "Ch 9·10·11",
    score: 3.1,
    score_100: 62,
    status: "취약",
    recommended_tab: "risk_workflow",
    recommended_label: "위험관리 8단계 폐쇄 루프 (Ch 9·10)",
    consulting_guide:
      "위험지각 편향 교정(Ch 9.12), 신호등 매트릭스(Tab 9.7), 8단계 폐쇄 루프(Fig 10.2) 및 잔여위험 5단계 환류(Fig 10.1), 현장 JHA(Ch 11)를 적용합니다.",
  },
  {
    id: "D5_CONTROL_TRAINING",
    name: "5. 위험통제·프로세스 & 역량/교육",
    short_name: "통제계층·Mager교육",
    chapters: "Ch 5·6·12·13",
    score: 3.2,
    score_100: 64,
    status: "취약",
    recommended_tab: "mager_tree",
    recommended_label: "Mager 교육 의사결정 트리 (Ch 13)",
    consulting_guide:
      "상위 통제 계층 우선 적용(Ch 12), DMAIC 프로세스 개선(Ch 6), 재교육 함정을 피하는 Mager 의사결정 트리(Ch 13)로 원인을 처방합니다.",
  },
  {
    id: "D6_EVAL_SUSTAIN",
    name: "6. SMS 자체평가·데이터 & 지속가능성",
    short_name: "SMS평가·지속가능성",
    chapters: "Ch 14·15·16",
    score: 3.5,
    score_100: 70,
    status: "보통",
    recommended_tab: "sms_mirror",
    recommended_label: "SMS Mirror 0~3점 자체평가 (Ch 14)",
    consulting_guide:
      "사실 기반 OSHA SHARP 0~3점 평가 및 SMART 액션플랜(Ch 14), 선행지표 데이터(Ch 15), 변화관리 지속가능성(Ch 16)을 통합 추적합니다.",
  },
];

const FALLBACK_RESULT = {
  respondent_count: 1,
  overall_index: 68.3,
  pillar_scores: FALLBACK_PILLARS,
  raa_scores: {
    responsibility: 4.2,
    authority: 3.3,
    accountability: 3.9,
    balance_index: 78.5,
    diagnosis_status: "권한 결여형 (Authority Deficit)",
    status_description:
      "현장의 이행 의무는 크나, 실질적 위험 개선 권한(작업중지권 등)의 위임이 부족합니다.",
  },
  leadership_scores: {
    average_score: 3.65,
    strongest_attribute: "RAA 책임 (Ch 7 - 4.2점)",
    weakest_attribute: "RAA 권한 위임 (Ch 7 - 3.3점)",
    item_scores: {
      "비전·정렬 (Ch 4)": 3.8,
      "RAA 책임 (Ch 7)": 4.2,
      "RAA 권한 (Ch 7)": 3.3,
      "RAA 책무성 (Ch 7)": 3.9,
      "윤리·소통 (Ch 7)": 4.0,
      "심리안전감 (Ch 8)": 3.4,
      "DMAIC 개선 (Ch 6)": 3.2,
      "지속가능성 (Ch 16)": 3.5,
    },
  },
  dimension_scores: {
    perception_of_safety: 3.85,
    psychological_safety: 3.4,
    manager_vs_leader: { "관리자 성향(규정·통제)": 60.0, "리더십 성향(비전·영감)": 40.0 },
  },
  key_findings: [
    "Ch 1~16 6대 영역 종합 지수는 68.3점이며, '4. 위험 지각 & 위험관리 프로세스(62점)'와 '5. 위험통제·프로세스 & 역량/교육(64점)'이 가장 취약합니다.",
    "2번 영역 하위 Ch 7 RAA 삼원조 기준 책임(4.2점) 대비 권한 위임(3.3점)이 취약하여 '권한 결여형' 패턴이 감지되었습니다.",
    "교재 Ch 9·10 잔여위험 환류 루프 및 Ch 13 Mager 교육/비교육 원인 분리 적용이 시급합니다.",
  ],
  consequence_recommendations: [
    "[Ch 9·10·11 우선 처방] 위험 지침 카드 및 8단계 폐쇄 루프를 가동해 잔여위험 허용 불가 시 5단계 대안 재설계로 환류하십시오.",
    "[Ch 5·6·12·13 연계 처방] 재교육 함정(US DOE 2009)을 피하고 Mager 의사결정 트리로 환경·장애물·보상 결함을 먼저 제거하십시오.",
    "[Ch 14 추적 처방] Appendix 14.1 0~3점 사실 기반 자체평가를 통해 0~1점 결함을 SMART 액션플랜으로 전환하십시오.",
  ],
};

export default function CompanyReportView({
  session,
  onRestartAssessment,
  onNavigate,
  completedChecklistModules = {},
}: CompanyReportViewProps) {
  const company = session?.company || {
    company_name: "우수안전산업",
    industry: "manufacturing",
    company_size: "medium",
  };

  const benchmark = session?.industry_benchmark || {
    label: "제조업 (Manufacturing)",
    benchmark_score: 75.3,
    key_hazards: ["끼임·협착", "오가동 LOTO", "지게차 충돌"],
    statutory_focus: "산안법 제38조 및 제36조 위험성평가",
    special_advice:
      "생산 압박 속에서 지름길(Shortcuts) 사용을 엄금하고 현장 권한 위임이 필요합니다.",
  };

  const result = session?.assessment_result || session?.result || FALLBACK_RESULT;
  const pillars: PillarScore[] =
    Array.isArray(result.pillar_scores) && result.pillar_scores.length > 0
      ? result.pillar_scores
      : FALLBACK_PILLARS;

  // 종합 안전지수 산출 (6대 영역 균등 평균 우선, 레거시 데이터만 기존 공식 폴백)
  const companyScore =
    Array.isArray(result.pillar_scores) && typeof result.overall_index === "number"
      ? Math.round(result.overall_index)
      : Math.round(
          result.raa_scores.balance_index * 0.4 +
            (result.leadership_scores.average_score / 5.0) * 100 * 0.6
        );

  const sortedWeakPillars = [...pillars].sort((a, b) => a.score - b.score);
  const priorityPillars = sortedWeakPillars.slice(0, 3);
  const completedChecklistCount = Object.keys(completedChecklistModules).length;

  // Ch 1~16 6대 영역 통합 레이더 데이터 (100점 만점)
  const pillarRadarData = pillars.map((p) => ({
    subject: p.short_name,
    score: p.score_100,
    fullMark: 100,
  }));

  // 2번 영역 하위 RAA 삼원조 레이더 차트 데이터
  const raaRadarData = [
    { subject: "책임 (Responsibility)", score: result.raa_scores.responsibility, fullMark: 5 },
    { subject: "권한 (Authority)", score: result.raa_scores.authority, fullMark: 5 },
    { subject: "책무성 (Accountability)", score: result.raa_scores.accountability, fullMark: 5 },
  ];

  // 세부 항목 막대 차트 데이터
  const leadershipBarData = Object.entries(result.leadership_scores.item_scores).map(
    ([k, v]) => ({
      name: k.split(" ")[0],
      fullName: k,
      score: v,
    })
  );

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8">
      <TextbookSourceBadge
        chapter="Ch 1~16 전 영역 6대 축 종합 진단 (RAA는 2번 영역 하위 지표)"
        title="조직 안전문화 종합 진단 & 컨설팅 처방 리포트"
        law="산안법 제14·24·36조 / 중처법 시행령 제4조"
      />

      {/* 1. 상단 인쇄 및 리포트 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 mb-2">
            <img
              src="/logos/donga-univ-logo.png"
              alt="동아대학교 로고"
              className="w-5 h-5 rounded-full bg-white p-0.5 border border-slate-200 object-contain"
            />
            <img
              src="/logos/disaster-mgmt-logo.jpeg"
              alt="동아대학교 재난관리학과 로고"
              className="w-5 h-5 rounded-full bg-white p-0.5 border border-slate-200 object-contain"
            />
            <span className="text-[11px] font-bold text-slate-700">
              동아대학교 재난관리학과 · SafePulse 360 공식 진단 리포트
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wide">
              Ch 1~16 Comprehensive Report
            </span>
            <span className="text-xs text-slate-500 font-medium">
              부록 정밀진단 {completedChecklistCount}/8 완료 연계
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            [{company.company_name}] 안전문화 전 영역 종합 진단 보고서
          </h1>
          <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
            <span>
              산업 분야: <strong>{benchmark.label}</strong>
            </span>
            <span>·</span>
            <span>
              기업 규모: <strong>{company.company_size}</strong>
            </span>
            <span>·</span>
            <span>
              평가자: <strong>{company.evaluator_name || "안전관리책임자"}</strong>
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 print:hidden shrink-0">
          {onNavigate && (
            <button
              onClick={() => onNavigate("consulting")}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow transition-colors"
            >
              <span>실행 컨설팅 로드맵으로 이어가기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onRestartAssessment}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 다시 진단하기
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition-colors"
          >
            <Printer className="w-4 h-4" /> 리포트 출력 / PDF
          </button>
        </div>
      </div>

      {/* 2. 종합 성숙도 및 6대 영역 종합 지수 카드 */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white rounded-3xl p-7 sm:p-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-3">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              Ch 1~16 6대 안전문화 축 종합 성숙도 결과
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {companyScore >= 80
                ? "Level 4: 주도적 협력 단계"
                : companyScore >= 65
                ? "Level 3: 체계적 관리 단계"
                : "Level 2: 사후 반응 단계"}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              <strong>{company.company_name}</strong>의 교재 전 장(Ch 1~16) 6대 영역 종합 안전문화 지수는{" "}
              <strong className="text-blue-300">{companyScore}점</strong>입니다. 최우선 보완 영역은{" "}
              <strong className="text-amber-300">
                {priorityPillars[0].name} ({priorityPillars[0].chapters}, {priorityPillars[0].score_100}점)
              </strong>
              이며, 아래 교재 가이드 심층 워크플로우로 즉시 개선 처방을 실행할 수 있습니다.
            </p>

            {/* 산업 벤치마크 비교 바 */}
            <div className="pt-2 space-y-2">
              <div className="flex justify-between text-xs text-slate-300 font-semibold">
                <span>
                  {company.company_name} 점수: <strong className="text-blue-400">{companyScore}점</strong>
                </span>
                <span>
                  {benchmark.label} 업계 평균:{" "}
                  <strong className="text-amber-300">{benchmark.benchmark_score}점</strong>
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                <div
                  className="bg-blue-400 h-2.5 rounded-full"
                  style={{ width: `${Math.min(100, companyScore)}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-400">
                {companyScore >= benchmark.benchmark_score
                  ? `동종 ${benchmark.label} 업계 평균 대비 +${(
                      companyScore - benchmark.benchmark_score
                    ).toFixed(1)}점 우수한 성과를 보이고 있습니다.`
                  : `동종 ${benchmark.label} 업계 평균 대비 ${(
                      benchmark.benchmark_score - companyScore
                    ).toFixed(1)}점 보완이 요구됩니다.`}
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 text-center shrink-0">
            <span className="text-xs font-medium text-slate-300 block">Ch 1~16 종합 안전문화 지수</span>
            <span className="text-5xl font-black text-blue-400 mt-2 block tracking-tight">
              {companyScore}
            </span>
            <span className="text-xs text-slate-300 mt-1 block">6대 영역 균등 평균 (100점)</span>
            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-300">
              세부 RAA 균형도(Ch 7): <strong className="text-white">{result.raa_scores.balance_index}점</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 메인 차트: Ch 1~16 6대 영역 통합 레이더 & 영역별 점수/등급 요약 카드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Ch 1~16 6대 안전문화 축 통합 레이더
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                RAA는 2번 영역(리더십·거버넌스)의 하위 축으로 포함됩니다 (100점 환산).
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={pillarRadarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#334155", fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" tick={{ fontSize: 10 }} />
                <Radar
                  name="영역 점수"
                  dataKey="score"
                  stroke="#4f46e5"
                  fill="#6366f1"
                  fillOpacity={0.4}
                />
                <Tooltip formatter={(val: any) => [`${val}점`, "영역 환산 점수"]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">6대 영역별 점수 · 등급 · 취약 진단</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              점수 기준: 우수(4.0+ / 80점↑) · 보통(3.3~3.9) · 취약(3.3 미만 / 66점↓)
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            {pillars.map((p) => {
              const badgeColor =
                p.status === "우수"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : p.status === "취약"
                  ? "bg-rose-100 text-rose-800 border-rose-200"
                  : "bg-amber-100 text-amber-800 border-amber-200";
              const barColor =
                p.status === "우수"
                  ? "bg-emerald-500"
                  : p.status === "취약"
                  ? "bg-rose-500"
                  : "bg-blue-500";

              return (
                <div key={p.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-slate-900 truncate">{p.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 shrink-0">
                        {p.chapters}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-extrabold text-slate-800">
                        {p.score_100}점 <span className="text-[10px] text-slate-400">({p.score}/5)</span>
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${Math.min(100, p.score_100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. 교재 가이드 기반 심층 진단 & 컨설팅 처방 보드 (취약 상위 3개 영역) */}
      <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-indigo-950 flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600" />
              교재 가이드 기반 심층 진단 & 컨설팅 처방 보드 (취약 우선순위 TOP 3)
            </h3>
            <p className="text-xs text-indigo-800/80 mt-0.5">
              빠른 진단(26문항)에서 도출된 하위 영역을 클릭하면 해당 장(Ch)의 교재 정밀 워크플로우로 즉시 이동합니다.
            </p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white text-indigo-700 border border-indigo-200 w-fit">
            2-Tier 심층 연계
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {priorityPillars.map((pillar, idx) => (
            <div
              key={pillar.id}
              className="bg-white rounded-xl p-4 border border-indigo-100 shadow-sm flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    우선순위 #{idx + 1} · {pillar.chapters}
                  </span>
                  <span className="text-xs font-black text-slate-800">{pillar.score_100}점</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{pillar.name}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{pillar.consulting_guide}</p>
              </div>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate(pillar.recommended_tab)}
                  className="w-full inline-flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors print:hidden"
                >
                  <span className="truncate">{pillar.recommended_label}</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. 산업 분야 특화 위험 및 법적 중점 의무 박스 */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2 mb-3">
          <Factory className="w-4 h-4 text-blue-600" />
          {benchmark.label} 특화 중점 관리 요인 및 법적 의무 (조문 단위 매핑)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-blue-100">
            <span className="font-bold text-slate-700 block mb-1">업종 핵심 유해위험요인:</span>
            <ul className="space-y-1 text-slate-600">
              {benchmark.key_hazards.map((h: string, idx: number) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-blue-100">
            <span className="font-bold text-slate-700 block mb-1">법적 조문 근거 (산안법·중처법):</span>
            <p className="text-slate-600 leading-relaxed">{benchmark.statutory_focus}</p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-blue-100">
            <span className="font-bold text-slate-700 block mb-1">교재 기반 현장 처방전:</span>
            <p className="text-slate-600 leading-relaxed">{benchmark.special_advice}</p>
          </div>
        </div>
      </div>

      {/* 6. 2번 영역 심층 분석: Ch 7 RAA 삼원조 & 거버넌스 세부 지표 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">
            2번 영역 심층 분석: Ch 7 RAA 삼원조 & 리더십·거버넌스 세부 지표
          </h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* RAA 삼원조 레이더 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900">RAA 삼원조 균형 레이더 (Ch 7 세부 지표)</h4>
                <p className="text-xs text-slate-500">
                  책임({result.raa_scores.responsibility}) · 권한({result.raa_scores.authority}) · 책무성(
                  {result.raa_scores.accountability})
                </p>
              </div>
              <span className="px-2 py-1 rounded bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                {result.raa_scores.diagnosis_status}
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={raaRadarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#334155", fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#cbd5e1" />
                  <Radar name="진단 점수" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.45} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2 leading-relaxed">
              {result.raa_scores.status_description}
            </p>
          </div>

          {/* 핵심 거버넌스·문화 세부 항목 막대 차트 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h4 className="text-base font-bold text-slate-900">주요 실행 역량 세부 비교 (Ch 4~16 핵심 항목)</h4>
                <p className="text-xs text-slate-500">
                  평균 평점: <strong>{result.leadership_scores.average_score}점</strong> (5점 만점)
                </p>
              </div>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadershipBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip
                    formatter={(val: any) => [`${val}점`, "평점"]}
                    labelFormatter={(label, payload) => {
                      const row = payload && payload[0]?.payload;
                      return row?.fullName || label;
                    }}
                  />
                  <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2">
              <span>
                최우수: <strong className="text-emerald-700">{result.leadership_scores.strongest_attribute}</strong>
              </span>
              <span>
                개선시급: <strong className="text-rose-700">{result.leadership_scores.weakest_attribute}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. 핵심 발견점 및 교재 전 영역 컨설팅 처방 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            전 영역 핵심 발견점 (Key Findings)
          </h3>
          <ul className="space-y-2 text-xs text-slate-700">
            {result.key_findings.map((finding: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-600 font-bold shrink-0">#{idx + 1}</span>
                <span className="leading-relaxed">{finding}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            교재 가이드 기반 컨설팅 처방
          </h3>
          <ul className="space-y-2 text-xs text-slate-700">
            {result.consequence_recommendations.map((rec: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 8. 단계별 안전문화 개선 실행 로드맵 및 컨설팅 이동 CTA */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              [{company.company_name}] 3단계 안전문화 혁신 로드맵
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Roughton et al. (2019) Ch 1~16 전 영역 기반 단계별 실행 및 컨설팅 연계 과제
            </p>
          </div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate("consulting")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold print:hidden w-fit"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>실행 컨설팅 로드맵으로 이어가기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
              1단계: 30일 즉시 실행 (Ch 7·8·9)
            </span>
            <h4 className="text-xs font-bold text-slate-900">현장 권한 위임 및 위험 지침 가동</h4>
            <ul className="text-[11px] text-slate-600 space-y-1 leading-relaxed">
              <li>· 긴급 위험 시 작업중지권(Stop-Work) 및 무문책 제보 보장</li>
              <li>· Ch 9 위험 지침 카드 및 신호등 매트릭스 현장 배치</li>
              <li>· 안전위원회 헌장(App 8.1) 및 현장 발언권(Voice) 정비</li>
            </ul>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold">
              2단계: 90일 체계 정착 (Ch 3·10·13)
            </span>
            <h4 className="text-xs font-bold text-slate-900">8단계 위험루프 및 Mager 교육 개편</h4>
            <ul className="text-[11px] text-slate-600 space-y-1 leading-relaxed">
              <li>· ONA 3단계 영향력 기반 현장 안전 챔피언 선발</li>
              <li>· 8단계 위험관리 & 잔여위험 5단계 환류 루프 상시 가동</li>
              <li>· Mager 의사결정 트리로 재교육 함정 제거 및 맞춤 처방</li>
            </ul>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              3단계: 180일 문화 내재화 (Ch 14·15·16)
            </span>
            <h4 className="text-xs font-bold text-slate-900">SMS Mirror 평가 & 지속가능 통합</h4>
            <ul className="text-[11px] text-slate-600 space-y-1 leading-relaxed">
              <li>· Appendix 14.1 0~3점 사실 기반 평가 & SMART 액션플랜</li>
              <li>· 선행지표 기반 생애주기 KPI(고유 70% / 협업 30%) 추적</li>
              <li>· 변화관리 지속가능성(Ch 16) 및 전사 의사결정 통합</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
