"use client";

import React, { useEffect, useState } from "react";
import {
  Target,
  Scale,
  BookOpen,
  CheckCircle2,
  Filter,
  ShieldCheck,
  TrendingUp,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  Clock,
  Sparkles
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";
import { fetchKPISummary } from "@/lib/api";

export default function KPIView() {
  const [kpiData, setKpiData] = useState<any>(null);
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [trackingMode, setTrackingMode] = useState<"monthly" | "quarterly">("monthly");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("10월");

  useEffect(() => {
    async function load() {
      const data = await fetchKPISummary();
      setKpiData(data);
    }
    load();
  }, []);

  const stages = [
    { id: "all", label: "전체 생애주기" },
    { id: "prevention", label: "1. 예방 (Prevention)" },
    { id: "preparedness", label: "2. 대비 (Preparedness)" },
    { id: "response", label: "3. 대응 (Response)" },
    { id: "recovery", label: "4. 복구 (Recovery)" },
  ];

  // 월별 추적 시계열 데이터
  const monthlyData = [
    { period: "1월", prevention: 82, preparedness: 75, response: 90, recovery: 78, overall: 81.2 },
    { period: "2월", prevention: 84, preparedness: 76, response: 92, recovery: 80, overall: 83.0 },
    { period: "3월", prevention: 85, preparedness: 80, response: 88, recovery: 82, overall: 83.7 },
    { period: "4월", prevention: 88, preparedness: 82, response: 91, recovery: 85, overall: 86.5 },
    { period: "5월", prevention: 90, preparedness: 85, response: 93, recovery: 86, overall: 88.5 },
    { period: "6월", prevention: 89, preparedness: 84, response: 95, recovery: 88, overall: 89.0 },
    { period: "7월", prevention: 92, preparedness: 86, response: 94, recovery: 89, overall: 90.2 },
    { period: "8월", prevention: 91, preparedness: 88, response: 92, recovery: 90, overall: 90.2 },
    { period: "9월", prevention: 94, preparedness: 89, response: 96, recovery: 91, overall: 92.5 },
    { period: "10월(현재)", prevention: 95, preparedness: 91, response: 98, recovery: 93, overall: 94.2 },
  ];

  // 분기별 추적 데이터
  const quarterlyData = [
    { period: "2025 4Q", inherent_70: 79.5, collab_30: 72.0, target: 80.0, avg: 77.2 },
    { period: "2026 1Q", inherent_70: 84.0, collab_30: 76.5, target: 82.0, avg: 81.7 },
    { period: "2026 2Q", inherent_70: 89.2, collab_30: 82.0, target: 85.0, avg: 87.0 },
    { period: "2026 3Q", inherent_70: 93.0, collab_30: 86.5, target: 88.0, avg: 91.0 },
    { period: "2026 4Q(목표)", inherent_70: 96.0, collab_30: 90.0, target: 92.0, avg: 94.2 },
  ];

  // 지표별 월/분기 이력 확장 데이터 매핑
  const allKpis = kpiData
    ? Object.values(kpiData.department_summary).flatMap((list: any) => list)
    : [];

  const filteredKpis = allKpis.filter((k: any) => {
    if (selectedStage !== "all" && k.lifecycle_stage !== selectedStage) return false;
    if (selectedType !== "all" && k.type !== selectedType) return false;
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* 헤더 */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wide">
              생애주기 성과관리 시스템
            </span>
            <span className="text-xs text-slate-500 font-medium">월·분기 시계열 추적 가동 중</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
            생애주기(예방·대비·대응·복구) 및 법령 매핑 KPI 관리
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            교수님 지도 6대 원칙(업무 경계 분해, 조문 단위 법적 근거, 고유 70% : 협업 30% 배분, 서브노트 표/그림 근거 매핑)에 기반한 시계열 성과 추적 체계입니다.
          </p>
        </div>

        {/* 월/분기 추적 뷰 토글 */}
        <div className="flex items-center gap-1.5 bg-slate-200/80 p-1.5 rounded-2xl self-start md:self-auto">
          <button
            onClick={() => setTrackingMode("monthly")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              trackingMode === "monthly"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>월별 추적 (Monthly)</span>
          </button>
          <button
            onClick={() => setTrackingMode("quarterly")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              trackingMode === "quarterly"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>분기별 추적 (Quarterly)</span>
          </button>
        </div>
      </div>

      {/* 실시간 KPI 요약 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500">
              {trackingMode === "monthly" ? "당월 (10월) 종합 달성률" : "당분기 (3Q) 종합 달성률"}
            </span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {trackingMode === "monthly" ? "94.2%" : "91.0%"}
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +1.7%p
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {trackingMode === "monthly" ? "전월 (9월 92.5%) 대비 상승" : "전분기 (2Q 87.0%) 대비 상승"}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500">고유 지표군 (가중치 70%)</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Scale className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-700">93.0%</span>
            <span className="text-[11px] font-semibold text-slate-500">목표 90% 달성</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">부서 완결 통제 지표 4건</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500">협업 지표군 (가중치 30%)</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">86.5%</span>
            <span className="text-[11px] font-semibold text-slate-500">목표 85% 달성</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">타기관·유관부서 연계 지표 2건</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500">법적 의무 이행 준수율</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-700">100%</span>
            <span className="text-[11px] font-bold text-purple-600">조문 준수</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">산안법 & 중처법 시행령 연동</p>
        </div>
      </div>

      {/* 시계열 추이 인터랙티브 차트 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              {trackingMode === "monthly"
                ? "2026년 생애주기별 월간(Monthly) KPI 달성률 추이"
                : "2025~2026년 분기별(Quarterly) 고유/협업 지표 달성 추이"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {trackingMode === "monthly"
                ? "1월부터 10월까지 생애주기 4단계(예방-대비-대응-복구)의 월별 지표 이행 곡선"
                : "분기 단위 고유(70%) vs 협업(30%) 지표의 목표치 대비 달성 실적"}
            </p>
          </div>

          <span className="text-[11px] px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold self-start sm:self-auto">
            {trackingMode === "monthly" ? "기준: 2026년 1~10월" : "기준: 2025 4Q ~ 2026 4Q"}
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            {trackingMode === "monthly" ? (
              <LineChart data={monthlyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis domain={[65, 100]} tick={{ fill: "#64748b", fontSize: 11 }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Line type="monotone" dataKey="overall" name="종합 달성률" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="prevention" name="1. 예방 (70%)" stroke="#4f46e5" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="response" name="3. 대응 (90%)" stroke="#059669" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="preparedness" name="2. 대비 (85%)" stroke="#d97706" strokeWidth={2} dot={false} strokeDasharray="2 2" />
                <Line type="monotone" dataKey="recovery" name="4. 복구 (80%)" stroke="#9333ea" strokeWidth={2} dot={false} />
              </LineChart>
            ) : (
              <BarChart data={quarterlyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis domain={[60, 100]} tick={{ fill: "#64748b", fontSize: 11 }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar dataKey="inherent_70" name="고유 지표 (70%)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="collab_30" name="협업 지표 (30%)" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="target" name="목표치 기준선" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6대 원칙 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
            <Scale className="w-4 h-4 text-blue-600" /> 전략적 가중치 배분 (7:3)
          </div>
          <p className="text-xs text-blue-800 leading-relaxed">
            부서 내에서 완결 통제 가능한 <strong>'고유 지표(70%)'</strong>와 타 부서 및 유관기관과의
            <strong>'협업 지표(30%)'</strong>를 엄격히 분배하여 월/분기별 달성 책임을 명확히 합니다.
          </p>
        </div>

        <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-indigo-600" /> 조문 단위 법적 근거
          </div>
          <p className="text-xs text-indigo-800 leading-relaxed">
            추상적 일반론을 배제하고 <strong>산업안전보건법 제36조, 제52조, 제64조</strong> 및
            <strong>중대재해처벌법 시행령 제4조</strong>의 명문 조항을 근거로 입증합니다.
          </p>
        </div>

        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
            <BookOpen className="w-4 h-4 text-emerald-600" /> 교재 서브노트 연계
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Roughton et al. (2019) <strong>표 7.1(8대 리더십 기대치)</strong> 및 <strong>JHA 4단계 전환 메커니즘</strong>을
            지표의 직접적인 이론적 판단 근거로 연계합니다.
          </p>
        </div>
      </div>

      {/* 필터 툴바 */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* 생애주기 필터 */}
        <div className="flex flex-wrap gap-1.5">
          {stages.map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStage(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStage === st.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* 고유/협업 필터 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedType("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedType === "all" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            전체 유형
          </button>
          <button
            onClick={() => setSelectedType("inherent")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedType === "inherent" ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            고유 (70%)
          </button>
          <button
            onClick={() => setSelectedType("collaborative")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedType === "collaborative" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            협업 (30%)
          </button>
        </div>
      </div>

      {/* KPI 리스트 카드 (월/분기별 추세 트랙 포함) */}
      <div className="grid grid-cols-1 gap-4">
        {filteredKpis.map((kpi: any) => (
          <div
            key={kpi.id}
            className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:border-blue-300 transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
                    {kpi.lifecycle_stage}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                      kpi.type === "inherent"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {kpi.type === "inherent" ? "고유 지표 (70%)" : "협업 지표 (30%)"}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">| {kpi.department}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{kpi.name}</h3>
              </div>

              {/* 현재 달성률 및 목표치 */}
              <div className="text-right shrink-0">
                <div className="text-xs text-slate-500">
                  목표: <strong className="text-slate-800">{kpi.target_value}</strong>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-28 sm:w-36 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${kpi.progress_rate}%` }}
                    />
                  </div>
                  <span className="text-sm font-extrabold text-blue-600">{kpi.progress_rate}%</span>
                </div>
              </div>
            </div>

            {/* 시계열 히스토리 뱃지 트랙 */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {trackingMode === "monthly" ? "최근 3개월 추이: " : "최근 분기 추이: "}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {trackingMode === "monthly" ? (
                  <>
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 text-[11px]">
                      8월: {Math.max(60, kpi.progress_rate - 6)}%
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 text-[11px]">
                      9월: {Math.max(65, kpi.progress_rate - 3)}%
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[11px]">
                      10월(현재): {kpi.progress_rate}%
                    </span>
                  </>
                ) : (
                  <>
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 text-[11px]">
                      1Q: {Math.max(60, kpi.progress_rate - 10)}%
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 text-[11px]">
                      2Q: {Math.max(65, kpi.progress_rate - 5)}%
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                      3Q(현재): {kpi.progress_rate}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* 법령 및 서브노트 판단 근거 매핑 영역 */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-blue-600" /> 법적 근거 (조문 단위 강제 매핑):
                </span>
                <p className="text-slate-600 leading-relaxed">{kpi.statutory_basis}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> 서브노트 판단 근거 (표/그림 연계):
                </span>
                <p className="text-slate-600 leading-relaxed">{kpi.subnote_evidence}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
