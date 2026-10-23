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
  Sparkles,
  Edit3,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  X,
  Check,
  AlertCircle
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
import {
  fetchKPISummary,
  saveKPIMetric,
  updateKPIValue,
  deleteKPIMetric,
  resetKPIMetrics
} from "@/lib/api";

export default function KPIView() {
  const [kpiData, setKpiData] = useState<any>(null);
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedChapter, setSelectedChapter] = useState<string>("all");
  const [trackingMode, setTrackingMode] = useState<"monthly" | "quarterly">("monthly");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 모달 상태
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editingKpi, setEditingKpi] = useState<any>(null);
  const [isAddMode, setIsAddMode] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 인라인 빠른 수정 모드 대상 ID
  const [quickEditId, setQuickEditId] = useState<string | null>(null);
  const [quickCurrentValue, setQuickCurrentValue] = useState<number>(0);
  const [quickProgressRate, setQuickProgressRate] = useState<number>(0);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchKPISummary();
      setKpiData(data);
    } catch (e) {
      console.error("KPI 데이터 로드 실패", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const stages = [
    { id: "all", label: "전체 생애주기" },
    { id: "planning", label: "1. 기획 (Planning)" },
    { id: "prevention", label: "2. 예방 (Prevention)" },
    { id: "preparedness", label: "3. 대비 (Preparedness)" },
    { id: "response", label: "4. 대응 (Response)" },
    { id: "recovery", label: "5. 개선·복구 (Recovery)" },
  ];

  const chapters = [
    { id: "all", label: "전체 챕터 (Ch 1~10)" },
    { id: "Ch 1", label: "Ch 1. 지각 & 브랜딩" },
    { id: "Ch 2", label: "Ch 2. 3수준 문화 & 사일로" },
    { id: "Ch 3", label: "Ch 3. ONA & 3도 영향력" },
    { id: "Ch 4", label: "Ch 4. 비전 & 미션 정렬" },
    { id: "Ch 5", label: "Ch 5. SMS 6대 빌딩블록" },
    { id: "Ch 6", label: "Ch 6. DMAIC & 프로세스" },
    { id: "Ch 7", label: "Ch 7. RAA & 8대 리더십" },
    { id: "Ch 8", label: "Ch 8. Just Ask & 직원참여" },
    { id: "Ch 9", label: "Ch 9. 리스크 지각 & 편향" },
    { id: "Ch 10", label: "Ch 10. 위험관리 8단계" },
  ];

  const allKpis = kpiData
    ? Object.values(kpiData.department_summary || {}).flatMap((list: any) => list)
    : [];

  const filteredKpis = allKpis.filter((k: any) => {
    if (selectedStage !== "all" && k.lifecycle_stage !== selectedStage) return false;
    if (selectedType !== "all" && k.type !== selectedType) return false;
    if (selectedChapter !== "all" && k.chapter_source !== selectedChapter) return false;
    return true;
  });

  // 동적 통계 계산
  const currentOverall = kpiData?.overall_progress ?? 92.0;
  const currentInherentAvg = kpiData?.inherent_avg_progress ?? 93.0;
  const currentCollabAvg = kpiData?.collaborative_avg_progress ?? 86.5;
  const stageProgressMap = kpiData?.stage_progress || {
    prevention: 87.5,
    preparedness: 97.5,
    response: 92.0,
    recovery: 88.0
  };

  // 월별 추적 시계열 데이터 (현재 월에 실제 종합 및 생애주기 값 동적 반영)
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
    {
      period: "10월(현재)",
      prevention: stageProgressMap.prevention || 92,
      preparedness: stageProgressMap.preparedness || 95,
      response: stageProgressMap.response || 92,
      recovery: stageProgressMap.recovery || 88,
      overall: currentOverall
    },
  ];

  // 분기별 추적 데이터 (현재 분기에 실제 고유/협업 달성률 동적 반영)
  const quarterlyData = [
    { period: "2025 4Q", inherent_70: 79.5, collab_30: 72.0, target: 80.0, avg: 77.2 },
    { period: "2026 1Q", inherent_70: 84.0, collab_30: 76.5, target: 82.0, avg: 81.7 },
    { period: "2026 2Q", inherent_70: 89.2, collab_30: 82.0, target: 85.0, avg: 87.0 },
    {
      period: "2026 3Q(현재)",
      inherent_70: currentInherentAvg,
      collab_30: currentCollabAvg,
      target: 88.0,
      avg: currentOverall
    },
    { period: "2026 4Q(목표)", inherent_70: 96.0, collab_30: 90.0, target: 92.0, avg: 94.2 },
  ];

  // 인라인 빠른 수정 시작
  const startQuickEdit = (kpi: any) => {
    setQuickEditId(kpi.id);
    setQuickCurrentValue(Number(kpi.current_value || 0));
    setQuickProgressRate(Number(kpi.progress_rate || 0));
  };

  // 인라인 빠른 저장
  const handleQuickSave = async (kpiId: string) => {
    setIsSubmitting(true);
    try {
      await updateKPIValue(kpiId, {
        current_value: Number(quickCurrentValue),
        progress_rate: Number(quickProgressRate)
      });
      setQuickEditId(null);
      await loadData();
      showToast("KPI 수치가 즉시 업데이트되었습니다.");
    } catch (e) {
      console.error(e);
      showToast("수치 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달 오픈 (상세 수정)
  const openEditModal = (kpi: any) => {
    setIsAddMode(false);
    setEditingKpi({
      ...kpi,
      current_value: Number(kpi.current_value || 0),
      progress_rate: Number(kpi.progress_rate || 0),
      note: kpi.note || ""
    });
    setEditModalOpen(true);
  };

  // 모달 오픈 (신규 지표 추가)
  const openAddModal = () => {
    setIsAddMode(true);
    setEditingKpi({
      id: `KPI_CUSTOM_${Date.now()}`,
      name: "",
      chapter_source: "Ch 1",
      table_figure_ref: "Fig 1.1",
      lifecycle_stage: "prevention",
      type: "inherent",
      weight: 0.7,
      department: "안전보건팀",
      target_value: "100%",
      unit: "%",
      statutory_basis: "산업안전보건법 제36조(위험성평가의 실시)",
      subnote_evidence: "Ch 1 4절 지각의 격차 및 리스크 기반 접근법",
      current_value: 80.0,
      progress_rate: 80.0,
      note: ""
    });
    setEditModalOpen(true);
  };

  // 모달 저장 처리
  const handleModalSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKpi.name.trim()) {
      alert("지표명을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await saveKPIMetric({
        ...editingKpi,
        weight: editingKpi.type === "inherent" ? 0.7 : 0.3,
        current_value: Number(editingKpi.current_value),
        progress_rate: Number(editingKpi.progress_rate)
      });
      setEditModalOpen(false);
      await loadData();
      showToast(isAddMode ? "새로운 KPI 지표가 등록되었습니다." : "KPI 지표 수치 및 정보가 저장되었습니다.");
    } catch (err) {
      console.error(err);
      showToast("저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 지표 삭제
  const handleDeleteKpi = async (id: string, name: string) => {
    if (!confirm(`'${name}' 지표를 삭제하시겠습니까?`)) return;
    try {
      await deleteKPIMetric(id);
      await loadData();
      showToast("KPI 지표가 삭제되었습니다.");
    } catch (e) {
      console.error(e);
      showToast("삭제 실패");
    }
  };

  // 기본값 초기화
  const handleResetToDefault = async () => {
    if (!confirm("모든 KPI 지표를 교재 및 법령 기반 표준 샘플 데이터로 복원하시겠습니까?")) return;
    try {
      await resetKPIMetrics();
      await loadData();
      showToast("표준 KPI 데이터로 복원되었습니다.");
    } catch (e) {
      console.error(e);
      showToast("초기화 실패");
    }
  };

  return (
    <div className="space-y-8 pb-20 relative">
      {/* 토스트 알림 */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold animate-fade-in border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 상단 헤더 */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              실시간 수치 입력·수정형 KPI 시스템
            </span>
            <span className="text-xs text-slate-500 font-medium">6대 원칙 법령 매핑</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
            생애주기(예방·대비·대응·복구) 및 법령 매핑 KPI 관리
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            교수님 지도 6대 원칙(업무 경계 분해, 조문 단위 법적 근거, 고유 70% : 협업 30% 배분, 서브노트 근거 매핑)을 준수하며,
            현장 실적 수치를 직접 입력하고 목표 달성률을 실시간으로 추적·시뮬레이션할 수 있습니다.
          </p>
        </div>

        {/* 액션 버튼 그룹 */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>신규 KPI 등록</span>
          </button>
          <button
            onClick={handleResetToDefault}
            title="초기 표준 데이터로 리셋"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">샘플 복원</span>
          </button>
          {/* 월/분기 추적 뷰 토글 */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setTrackingMode("monthly")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                trackingMode === "monthly" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>월별</span>
            </button>
            <button
              onClick={() => setTrackingMode("quarterly")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                trackingMode === "quarterly" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>분기별</span>
            </button>
          </div>
        </div>
      </div>

      {/* 실시간 KPI 요약 카드 (사용자가 수치를 변경하면 실시간 반영됨) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500">
              {trackingMode === "monthly" ? "당월 (10월) 종합 달성률" : "당분기 (3Q) 종합 달성률"}
            </span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{currentOverall}%</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> 실시간 계산
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">고유(70%) + 협업(30%) 가중 합산</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500">고유 지표군 (가중치 70%)</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Scale className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-700">{currentInherentAvg}%</span>
            <span className="text-[11px] font-semibold text-slate-500">
              {kpiData?.inherent_count || 0}개 지표
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">부서 완결형 자체 통제 지표</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500">협업 지표군 (가중치 30%)</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{currentCollabAvg}%</span>
            <span className="text-[11px] font-semibold text-slate-500">
              {kpiData?.collaborative_count || 0}개 지표
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">타기관·협력사 연계 협업 지표</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-300 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500">법적 의무 이행 준수율</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-700">100%</span>
            <span className="text-[11px] font-bold text-purple-600">조문 매핑</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">산안법 & 중대재해처벌법 연동</p>
        </div>
      </div>

      {/* 시계열 추이 인터랙티브 차트 (입력 수치에 따라 10월/3Q 곡선 동적 반영) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              {trackingMode === "monthly"
                ? "2026년 생애주기별 월간(Monthly) KPI 달성률 시계열 추이"
                : "2025~2026년 분기별(Quarterly) 고유/협업 지표 달성 추이"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {trackingMode === "monthly"
                ? "1월부터 10월까지 생애주기 4단계(예방-대비-대응-복구)의 월별 지표 이행 곡선 (10월 수치 실시간 연동)"
                : "분기 단위 고유(70%) vs 협업(30%) 지표의 목표치 대비 달성 실적"}
            </p>
          </div>

          <span className="text-[11px] px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold self-start sm:self-auto border border-blue-200">
            {trackingMode === "monthly" ? "당월 실적 연동 반영 중" : "당분기 실적 연동 반영 중"}
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
                <Line type="monotone" dataKey="preparedness" name="2. 대비 (85%)" stroke="#d97706" strokeWidth={2} dot={false} strokeDasharray="2 2" />
                <Line type="monotone" dataKey="response" name="3. 대응 (90%)" stroke="#059669" strokeWidth={2} dot={false} />
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

      {/* 필터 툴바 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        {/* 상단: 생애주기 필터 & 고유/협업 필터 */}
        <div className="flex flex-wrap items-center justify-between gap-4">
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

          <div className="flex items-center gap-1.5">
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

        {/* 하단: 10대 챕터(Ch 1 ~ Ch 10) 필터 뱃지 바 */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1 border border-indigo-200">
            <BookOpen className="w-3 h-3" /> 챕터별 필터
          </span>
          {chapters.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setSelectedChapter(ch.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                selectedChapter === ch.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI 리스트 카드 목록 (수치 입력/수정 지원) */}
      <div className="grid grid-cols-1 gap-4">
        {filteredKpis.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
            해당 조건에 일치하는 KPI 지표가 없습니다.
          </div>
        ) : (
          filteredKpis.map((kpi: any) => {
            const isQuickEditing = quickEditId === kpi.id;

            return (
              <div
                key={kpi.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:border-blue-300 transition-all space-y-4"
              >
                {/* 상단 헤더: 태그 + 제목 + 수정/삭제 버튼 */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {kpi.chapter_source && (
                        <span className="text-[11px] font-black px-2.5 py-0.5 rounded-md bg-indigo-600 text-white shadow-2xs">
                          {kpi.chapter_source}
                        </span>
                      )}
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
                      {kpi.table_figure_ref && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                          {kpi.table_figure_ref}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 font-medium">| {kpi.department}</span>
                      {kpi.updated_at && (
                        <span className="text-[11px] text-slate-400">
                          (최근 갱신: {kpi.updated_at})
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">{kpi.name}</h3>
                  </div>

                  {/* 우측 조작 버튼 */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      onClick={() => openEditModal(kpi)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-xs font-semibold transition-all border border-slate-200"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>수치 수정</span>
                    </button>
                    <button
                      onClick={() => handleDeleteKpi(kpi.id, kpi.name)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                      title="지표 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 수치 표시 및 인라인 빠른 수정 영역 */}
                <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                    {/* 목표치 */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
                      <span className="text-[11px] font-bold text-slate-400 block">목표 기준치 (Target)</span>
                      <span className="text-sm font-bold text-slate-800 mt-0.5 block truncate">
                        {kpi.target_value}
                      </span>
                    </div>

                    {/* 현재 실적 수치 */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
                      <span className="text-[11px] font-bold text-slate-400 block">
                        현재 실적값 ({kpi.unit || "단위"})
                      </span>
                      {isQuickEditing ? (
                        <input
                          type="number"
                          step="any"
                          value={quickCurrentValue}
                          onChange={(e) => setQuickCurrentValue(parseFloat(e.target.value) || 0)}
                          className="w-full mt-1 px-2 py-1 text-sm font-bold border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50/30"
                        />
                      ) : (
                        <span className="text-sm font-extrabold text-blue-700 mt-0.5 block">
                          {kpi.current_value !== undefined ? kpi.current_value : "-"} {kpi.unit}
                        </span>
                      )}
                    </div>

                    {/* 달성률 & 프로그레스 바 */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
                      <div className="flex justify-between items-center text-[11px] font-bold text-slate-400">
                        <span>목표 달성률</span>
                        <span className="text-blue-600 font-extrabold text-sm">
                          {isQuickEditing ? `${quickProgressRate}%` : `${kpi.progress_rate}%`}
                        </span>
                      </div>
                      {isQuickEditing ? (
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="120"
                            value={quickProgressRate}
                            onChange={(e) => setQuickProgressRate(Number(e.target.value))}
                            className="w-full accent-blue-600 cursor-pointer"
                          />
                          <input
                            type="number"
                            value={quickProgressRate}
                            onChange={(e) => setQuickProgressRate(Number(e.target.value))}
                            className="w-16 px-1.5 py-0.5 text-xs font-bold border border-slate-300 rounded text-center"
                          />
                        </div>
                      ) : (
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-1.5">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${
                              kpi.progress_rate >= 90
                                ? "bg-emerald-500"
                                : kpi.progress_rate >= 70
                                ? "bg-blue-600"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, kpi.progress_rate))}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 인라인 빠른 수정 토글 & 저장 바 */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    {isQuickEditing ? (
                      <div className="flex items-center gap-2 w-full justify-end">
                        <button
                          onClick={() => setQuickEditId(null)}
                          className="px-3 py-1 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 font-medium"
                        >
                          취소
                        </button>
                        <button
                          onClick={() => handleQuickSave(kpi.id)}
                          disabled={isSubmitting}
                          className="flex items-center gap-1.5 px-4 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isSubmitting ? "저장 중..." : "수치 저장"}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[11px] text-slate-500">
                          {kpi.note ? `실적 비고: ${kpi.note}` : "등록된 추가 비고 메모가 없습니다."}
                        </span>
                        <button
                          onClick={() => startQuickEdit(kpi)}
                          className="text-[11px] text-blue-600 hover:text-blue-800 font-bold underline underline-offset-2 flex items-center gap-1"
                        >
                          빠른 수치 슬라이더 조정
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 시계열 히스토리 뱃지 트랙 */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      {trackingMode === "monthly" ? "최근 3개월 추이: " : "최근 분기 추이: "}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {trackingMode === "monthly" ? (
                      <>
                        <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px]">
                          8월: {Math.max(60, Math.round(kpi.progress_rate - 6))}%
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px]">
                          9월: {Math.max(65, Math.round(kpi.progress_rate - 3))}%
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-bold text-[11px]">
                          10월(현재 실적): {kpi.progress_rate}%
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px]">
                          1Q: {Math.max(60, Math.round(kpi.progress_rate - 10))}%
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-[11px]">
                          2Q: {Math.max(65, Math.round(kpi.progress_rate - 5))}%
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                          3Q(현재 실적): {kpi.progress_rate}%
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* 법령 및 서브노트 판단 근거 매핑 영역 */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                    <span className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-blue-600" /> 법적 근거 (조문 단위 강제 매핑):
                    </span>
                    <p className="text-slate-600 leading-relaxed">{kpi.statutory_basis}</p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                    <span className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> 서브노트 판단 근거 (표/그림 연계):
                    </span>
                    <p className="text-slate-600 leading-relaxed">{kpi.subnote_evidence}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 수치 입력 및 지표 편집/추가 모달 */}
      {editModalOpen && editingKpi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Edit3 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {isAddMode ? "새로운 현장 맞춤형 KPI 지표 등록" : "KPI 실적 수치 및 상세 정보 수정"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    실제 실적 수치를 입력하면 종합 달성률과 시계열 차트에 즉시 반영됩니다.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSave} className="space-y-4 pt-4 text-xs">
              {/* 지표명 */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">지표명 *</label>
                <input
                  type="text"
                  required
                  value={editingKpi.name}
                  onChange={(e) => setEditingKpi({ ...editingKpi, name: e.target.value })}
                  placeholder="예: 작업위험성평가(JHA) 참여율 및 유해위험요인 발굴 건수"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-xs font-semibold"
                />
              </div>

              {/* 챕터 출처 & 연계 도표 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">교재 연계 챕터 (Ch 1 ~ Ch 10)</label>
                  <select
                    value={editingKpi.chapter_source || "Ch 1"}
                    onChange={(e) => setEditingKpi({ ...editingKpi, chapter_source: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 text-xs font-semibold bg-white"
                  >
                    <option value="Ch 1">Chapter 1 (안전 지각 & 브랜딩)</option>
                    <option value="Ch 2">Chapter 2 (조직문화 3수준 & 사일로)</option>
                    <option value="Ch 3">Chapter 3 (ONA 네트워크 & 3-Hop)</option>
                    <option value="Ch 4">Chapter 4 (비전·미션 정렬 & 경계확장)</option>
                    <option value="Ch 5">Chapter 5 (SMS 6대 빌딩블록)</option>
                    <option value="Ch 6">Chapter 6 (DMAIC & 형식주의 탈피)</option>
                    <option value="Ch 7">Chapter 7 (RAA 삼원조 & 8대 리더십)</option>
                    <option value="Ch 8">Chapter 8 (Just Ask & 직원 참여)</option>
                    <option value="Ch 9">Chapter 9 (위험 지각 & 정상화 편향)</option>
                    <option value="Ch 10">Chapter 10 (위험관리 8단계 & 잔여위험)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">연계 도표/그림 번호</label>
                  <input
                    type="text"
                    value={editingKpi.table_figure_ref || ""}
                    onChange={(e) => setEditingKpi({ ...editingKpi, table_figure_ref: e.target.value })}
                    placeholder="예: Fig 1.1, Table 7.1, Fig 10.2 등"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 text-xs"
                  />
                </div>
              </div>

              {/* 생애주기 단계 & 지표 유형 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">생애주기 단계</label>
                  <select
                    value={editingKpi.lifecycle_stage}
                    onChange={(e) => setEditingKpi({ ...editingKpi, lifecycle_stage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-xs font-semibold bg-white"
                  >
                    <option value="planning">1. 기획 (Planning)</option>
                    <option value="prevention">2. 예방 (Prevention)</option>
                    <option value="preparedness">3. 대비 (Preparedness)</option>
                    <option value="response">4. 대응 (Response)</option>
                    <option value="recovery">5. 개선·복구 (Recovery)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">지표 유형 (전략적 가중치 배분)</label>
                  <select
                    value={editingKpi.type}
                    onChange={(e) => setEditingKpi({ ...editingKpi, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-xs font-semibold bg-white"
                  >
                    <option value="inherent">고유 지표 (70% - 부서 자체 완결)</option>
                    <option value="collaborative">협업 지표 (30% - 타부서/유관기관 연계)</option>
                  </select>
                </div>
              </div>

              {/* 담당부서 & 단위 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">담당 부서 (팀/과 단위)</label>
                  <input
                    type="text"
                    value={editingKpi.department}
                    onChange={(e) => setEditingKpi({ ...editingKpi, department: e.target.value })}
                    placeholder="예: 생산본부 생산1팀, 설비정비팀, EHS안전부"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">측정 단위</label>
                  <input
                    type="text"
                    value={editingKpi.unit}
                    onChange={(e) => setEditingKpi({ ...editingKpi, unit: e.target.value })}
                    placeholder="예: %, 건, 회, 개소"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-xs"
                  />
                </div>
              </div>

              {/* 목표치 & 현재 실적값 & 달성률 */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-3">
                <span className="font-bold text-blue-900 block flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-blue-600" /> 수치 입력 및 달성률 설정
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">목표 기준치</label>
                    <input
                      type="text"
                      value={editingKpi.target_value}
                      onChange={(e) => setEditingKpi({ ...editingKpi, target_value: e.target.value })}
                      placeholder="예: 100% 또는 15건"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">현재 실적값 (숫자)</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={editingKpi.current_value}
                      onChange={(e) => setEditingKpi({ ...editingKpi, current_value: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-blue-400 bg-white font-black text-blue-700 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">목표 달성률 (%)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="200"
                        step="0.1"
                        required
                        value={editingKpi.progress_rate}
                        onChange={(e) => setEditingKpi({ ...editingKpi, progress_rate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-blue-400 bg-white font-black text-blue-700 text-xs focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-slate-600 font-bold">%</span>
                    </div>
                  </div>
                </div>

                {/* 슬라이더로 빠른 달성률 조절 */}
                <div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 mb-1">
                    <span>슬라이더로 조절:</span>
                    <span className="font-bold text-blue-700">{editingKpi.progress_rate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    value={editingKpi.progress_rate}
                    onChange={(e) => setEditingKpi({ ...editingKpi, progress_rate: Number(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* 법적 근거 (6대 원칙 조문 매핑) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  법적 근거 (산안법·중처법 조문 단위 강제 매핑)
                </label>
                <input
                  type="text"
                  value={editingKpi.statutory_basis}
                  onChange={(e) => setEditingKpi({ ...editingKpi, statutory_basis: e.target.value })}
                  placeholder="예: 산업안전보건법 제36조(위험성평가의 실시) 및 노동부 고시 제2023-19호"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-xs"
                />
              </div>

              {/* 교재 서브노트 판단 근거 */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  교재 서브노트 판단 근거 (표/그림 강제 매핑)
                </label>
                <input
                  type="text"
                  value={editingKpi.subnote_evidence}
                  onChange={(e) => setEditingKpi({ ...editingKpi, subnote_evidence: e.target.value })}
                  placeholder="예: Ch 7 표 7.1 번호 6: 부하에게 권한 위임 및 리스크 감수"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-xs"
                />
              </div>

              {/* 실적 비고 / 조치 메모 */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">현장 조치 및 실적 비고</label>
                <textarea
                  rows={2}
                  value={editingKpi.note}
                  onChange={(e) => setEditingKpi({ ...editingKpi, note: e.target.value })}
                  placeholder="예: 10월 당월 정기점검 완료 및 아차사고 3건 시정조치 완료"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-xs"
                />
              </div>

              {/* 모달 버튼 */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  닫기
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? "저장 중..." : isAddMode ? "신규 등록" : "수정 완료"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
