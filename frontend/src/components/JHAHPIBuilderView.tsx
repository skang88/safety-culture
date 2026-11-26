"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldAlert,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  FileText,
  Layers,
  Info
} from "lucide-react";
import TextbookSourceBadge from "./TextbookSourceBadge";

interface JHARow {
  id: string;
  stepTask: string;
  hazards: string;
  controls: string;
  riskRating: string;
}

interface JHARecord {
  id: string;
  createdAt: string;
  jobTitle: string;
  departmentShift: string;
  analysisType: "JHA" | "JSA";
  hierarchyType: "Parent JHA" | "Child JHA";
  srkMode: "skill" | "rule" | "knowledge";
  rows: JHARow[];
  precursors: string[];
}

const SRK_MODES = {
  skill: {
    title: "숙련 기반 (Skill-Based)",
    mechanism: "숙련된 무의식적 물리 행동·자동화 상태",
    errorForm: "실행 오류(Execution errors), 행동 슬립(Slips), 일시적 주의 상실(Lapses)",
    strategy: "인터록·물리적 방호가드 설치, 작업 공간 가시성 확보, 정기 현장 관찰",
  },
  rule: {
    title: "규칙 기반 (Rule-Based)",
    mechanism: "사전 설정된 절차와 'If-Then' 의사결정 적용",
    errorForm: "절차서·규칙 오해석, 잘못된 규칙 적용, 절차 미준수 및 지름길(Shortcut)",
    strategy: "SOP 명확화, 상황별 분기 흐름도(Flowchart) 제공, 모호한 규정 정비",
  },
  knowledge: {
    title: "지식 기반 (Knowledge-Based)",
    mechanism: "생소한 비일상 상황 직면 · 기존 규칙 부재",
    errorForm: "부정확한 심성 모형(Mental model), 인지 과부하 및 오판",
    strategy: "작업 착수 전 정밀 JHA 사전 작성, 작업 전 브리핑 및 동료 검토(Peer Review)",
  },
};

const HPI_PRECURSORS: {
  category: string;
  badge: string;
  nature: string;
  items: string[];
}[] = [
  {
    category: "과업 요구조건 (Task Demands)",
    badge: "TABLE 12.10 · 과업 설계 결함",
    nature: "잠재적 조건(Latent) 비중 높음",
    items: [
      "촉박한 시간 압박 (서두름·마감 독촉)",
      "과도한 작업 부하 (단기 기억 과부하)",
      "동시다발적 복수 작업 수행",
      "비가역적 행동 (되돌릴 수 없는 조작)",
      "모호한 표준·역할·책임 경계",
    ],
  },
  {
    category: "개인 역량 (Individual Capabilities)",
    badge: "TABLE 12.10 · 인적·숙련 요건",
    nature: "능동/잠재 상호작용",
    items: [
      "과업 미숙 및 최초 작업 수행",
      "지식 부족 및 왜곡된 심성 모형",
      "익숙하지 않은 신기술·신공법 적용",
      "질병·피로·수면 부족 (야간조 누적)",
      "직관에만 의존하고 3방향 소통 부재",
    ],
  },
  {
    category: "작업 환경 (Work Environment)",
    badge: "TABLE 12.11 · 현장 물리·조직 조건",
    nature: "잠재적 조건(Latent) 핵심",
    items: [
      "주의 산만 및 빈번한 작업 중단(방해)",
      "혼란스러운 계기판·제어기 표시",
      "계측기 고장 및 임의 우회(Work-around)",
      "예기치 못한 설비 이상 징후",
      "작업자 간 소통 충돌·갈등",
    ],
  },
  {
    category: "인간 본성 (Human Nature)",
    badge: "TABLE 12.11 · 인지·심리 요건",
    nature: "능동적 오류(Active) 유발 방아쇠",
    items: [
      "정신적·신체적 스트레스 누적",
      "굳어진 관성적 습관 패턴",
      "근거 없는 예단·가정(Assumptions)",
      "안주(Complacency) 및 과도한 자신감",
      "정신적 지름길(Mental shortcuts) & 제한된 기억 용량",
    ],
  },
];

const STORAGE_KEY = "safepulse_jha_records";

export default function JHAHPIBuilderView() {
  const [records, setRecords] = useState<JHARecord[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [departmentShift, setDepartmentShift] = useState("설비정비팀 · 비일상 정비");
  const [analysisType, setAnalysisType] = useState<"JHA" | "JSA">("JHA");
  const [hierarchyType, setHierarchyType] = useState<"Parent JHA" | "Child JHA">("Parent JHA");
  const [srkMode, setSrkMode] = useState<"skill" | "rule" | "knowledge">("rule");
  const [rows, setRows] = useState<JHARow[]>([
    {
      id: "row-1",
      stepTask: "1단계: 작업 구역 정차 및 LOTO 에너지 격리",
      hazards: "잔류 유압·전기에 의한 불시 가동 및 협착 위험",
      controls: "주전원 차단 후 개인 잠금장치·적색 태그 부착 및 잔류에너지 영점 확인",
      riskRating: "RA(16 Red) → NR(4 Green)",
    },
  ]);
  const [selectedPrecursors, setSelectedPrecursors] = useState<string[]>([
    "촉박한 시간 압박 (서두름·마감 독촉)",
    "근거 없는 예단·가정(Assumptions)",
  ]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setRecords(parsed);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const persistRecords = (next: JHARecord[]) => {
    setRecords(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const handleLoadSample = () => {
    setJobTitle("현장 설비 타이어·휠 교체 및 고중량 리프팅 정비 (Appendix 12.2)");
    setDepartmentShift("119구조대 장비관리반 / 야간 교대조");
    setAnalysisType("JHA");
    setHierarchyType("Child JHA");
    setSrkMode("rule");
    setRows([
      {
        id: `r-${Date.now()}-1`,
        stepTask: "1. 평탄 지면 정차, 비상등 점등 및 휠 쐐기(Chock) 설치",
        hazards: "경사면 차량 미끄러짐·전도로 인한 협착",
        controls: "공학적 고정 쐐기 대각선 바퀴 양면 설치 + 주차 브레이크 확인",
        riskRating: "RA(15 Red) → NR(3 Green)",
      },
      {
        id: `r-${Date.now()}-2`,
        stepTask: "2. 유압 잭(Jack) 인양 및 잭 스탠드 지지",
        hazards: "유압 잭 편심 이탈 및 하중 낙하 충격",
        controls: "제조사 지정 리프트 포인트 확인 + 보조 잭 스탠드 이중 지지(제거/공학)",
        riskRating: "RA(20 Red) → NR(4 Green)",
      },
      {
        id: `r-${Date.now()}-3`,
        stepTask: "3. 휠 볼트 탈거 및 절단·끼임 방지 장갑 착용 체결",
        hazards: "충격 렌치 반동 및 날카로운 볼트 나사선 손 절단",
        controls: "ANSI Cut Level 적정 장갑(App 12.8) 착용 + 토크렌치 교차 체결",
        riskRating: "RA(12 Yellow) → NR(3 Green)",
      },
    ]);
  };

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        id: `row-${Date.now()}`,
        stepTask: "",
        hazards: "",
        controls: "",
        riskRating: "RA(12 Yellow) → NR(4 Green)",
      },
    ]);
  };

  const handleUpdateRow = (id: string, field: keyof JHARow, value: string) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((r) => r.id !== id));
  };

  const togglePrecursor = (item: string) => {
    setSelectedPrecursors((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim()) return;

    const newRec: JHARecord = {
      id: `JHA-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      jobTitle: jobTitle.trim(),
      departmentShift: departmentShift.trim(),
      analysisType,
      hierarchyType,
      srkMode,
      rows,
      precursors: selectedPrecursors,
    };
    persistRecords([newRec, ...records]);
    setJobTitle("");
  };

  const handleDeleteRecord = (id: string) => {
    persistRecords(records.filter((r) => r.id !== id));
  };

  const srkInfo = SRK_MODES[srkMode];
  const hasSystemLatent = selectedPrecursors.some(
    (p) =>
      HPI_PRECURSORS[0].items.includes(p) || HPI_PRECURSORS[2].items.includes(p)
  );
  const hasIndividualActive = selectedPrecursors.some(
    (p) =>
      HPI_PRECURSORS[1].items.includes(p) || HPI_PRECURSORS[3].items.includes(p)
  );

  return (
    <div className="space-y-8 pb-20">
      <TextbookSourceBadge
        chapter="Ch 12 (FIG. 12.1~12.8 · TABLE 12.1~12.11 · Appendix 12.1~12.2)"
        title="JHA 4열 빌더 (Parent-Child) & HPI 인간 오류전조 진단"
        kpi="16대 고위험 직무 JHA 완료율 · 오류전조 발굴 건수 · STAR/작업정지 이행률"
        law="산안법 제16·36·52조 / 중처법 시행령 제4조제3·7호"
      />

      <form onSubmit={handleSaveRecord} className="space-y-6">
        {/* 1. 직무 메타 설정: JHA vs JSA, Parent-Child, Rasmussen SRK */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                1. 직무 분류 · Parent-Child 구조 · 라스무센 SRK 인지 유형
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                단순 직무(Simple Jobs) 착시를 버리고 돌발(JHA)/만성(JSA) 및 모체(Parent)/파생(Child)을 구분합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 w-fit"
            >
              Appendix 12.2 타이어 교체 예시 불러오기
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">분석 직무명 (TABLE 12.9 고위험 직무) *</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="예: 고압 유압라인 교체 및 야간 비일상 정비 작업"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">대상 부서 · 교대조 (비일상/야간조 포함)</label>
              <input
                type="text"
                value={departmentShift}
                onChange={(e) => setDepartmentShift(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* JHA vs JSA */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-extrabold text-slate-800 block">분석 유형 (FIG. 12.3)</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAnalysisType("JHA")}
                  className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold border ${
                    analysisType === "JHA"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-700 border-slate-200"
                  }`}
                >
                  JHA (돌발·급성)
                </button>
                <button
                  type="button"
                  onClick={() => setAnalysisType("JSA")}
                  className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold border ${
                    analysisType === "JSA"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-700 border-slate-200"
                  }`}
                >
                  JSA (만성·누적)
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                {analysisType === "JHA"
                  ? "특정 시점 작업 단계의 급성 사고(협착·추락·절단) 통제"
                  : "장기 누적 노출(근골격계 부담·화학물질·소음) 통제"}
              </p>
            </div>

            {/* Parent vs Child */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-extrabold text-slate-800 block">테마 계층 (4.2절)</span>
              <div className="flex gap-2">
                {(["Parent JHA", "Child JHA"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setHierarchyType(mode)}
                    className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold border ${
                      hierarchyType === mode
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                {hierarchyType === "Parent JHA"
                  ? "공통 작업 기준선(모체) 정의 — 문서 중복 방지"
                  : "현장 위치·자재·야간조 변형 위험 파생(Child) 보완"}
              </p>
            </div>

            {/* Rasmussen SRK */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-extrabold text-slate-800 block">Rasmussen SRK 수행 유형 (10.2절)</span>
              <select
                value={srkMode}
                onChange={(e) => setSrkMode(e.target.value as "skill" | "rule" | "knowledge")}
                className="w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-bold"
              >
                <option value="skill">숙련 기반 (Skill-Based)</option>
                <option value="rule">규칙 기반 (Rule-Based)</option>
                <option value="knowledge">지식 기반 (Knowledge-Based)</option>
              </select>
              <p className="text-[11px] text-indigo-800 font-semibold">{srkInfo.strategy}</p>
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>{srkInfo.title} 오류 메커니즘:</strong> {srkInfo.errorForm} → <strong>통제 전략:</strong>{" "}
              {srkInfo.strategy}
            </span>
          </div>
        </div>

        {/* 2. JHA 4열 워크시트 빌더 (Appendix 12.1~12.2) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                2. JHA 4열 표준 워크시트 (Appendix 12.1·12.2 / TABLE 12.8)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                서류상 작업(Work-as-Imagined)과 실제 작업(Work-as-Done) 괴리를 없애도록 현장 작업자와 함께 작성합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold w-fit"
            >
              <Plus className="w-3.5 h-3.5" /> 작업 단계 행 추가
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[780px]">
              <thead>
                <tr className="bg-slate-100 text-[11px] font-extrabold text-slate-700 border-y border-slate-200">
                  <th className="p-2.5 w-1/4">1열: 작업 단계 / 세부 과업 (Step/Task)</th>
                  <th className="p-2.5 w-1/4">2열: 잠재 유해위험요인 (Hazards)</th>
                  <th className="p-2.5 w-1/3">3열: 계층적 예방·통제 대책 (Controls)</th>
                  <th className="p-2.5 w-1/6">4열: 위험도 (RA → NR)</th>
                  <th className="p-2.5 w-10">삭제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((row) => (
                  <tr key={row.id} className="align-top">
                    <td className="p-2">
                      <textarea
                        rows={2}
                        value={row.stepTask}
                        onChange={(e) => handleUpdateRow(row.id, "stepTask", e.target.value)}
                        placeholder="작업 단계·과업 입력"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <textarea
                        rows={2}
                        value={row.hazards}
                        onChange={(e) => handleUpdateRow(row.id, "hazards", e.target.value)}
                        placeholder="잠재 위험요인·오류 유발 조건"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <textarea
                        rows={2}
                        value={row.controls}
                        onChange={(e) => handleUpdateRow(row.id, "controls", e.target.value)}
                        placeholder="제거→대체→공학→행정→PPE 순 대책"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={row.riskRating}
                        onChange={(e) => handleUpdateRow(row.id, "riskRating", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="행 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. HPI 4대 인간 오류 전조 요건 진단 (TABLE 12.10~12.11) & HPI 3대 도구 처방 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              3. HPI 4대 인간 오류 전조 요건 진단 (TABLE 12.10·12.11) & HPI 3대 도구 처방 (FIG. 12.6~12.8)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              &quot;인간은 누구나 실수한다(People are fallible)&quot; — 오류 발생 전에 시스템 내 잠재적 조건과 전조 요건을 먼저 제거합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HPI_PRECURSORS.map((group) => (
              <div key={group.category} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-extrabold text-slate-900">{group.category}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {group.badge}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {group.items.map((item) => {
                    const checked = selectedPrecursors.includes(item);
                    return (
                      <label
                        key={item}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          checked
                            ? "bg-amber-50 border-amber-300 text-amber-950 font-semibold"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePrecursor(item)}
                          className="rounded border-slate-300 text-amber-600"
                        />
                        <span>{item}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* 능동 오류 vs 잠재 조건 분리 요약 & HPI 3대 도구 자동 매칭 */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                선택된 오류 전조 요건 {selectedPrecursors.length}건 분석 (10.3절 능동적 오류 vs 잠재적 조건)
              </span>
              <div className="flex flex-wrap gap-2">
                {hasSystemLatent && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-200 border border-rose-400/30">
                    잠재적 조건(Latent Condition) 경보 — 시스템·환경 재설계 필수
                  </span>
                )}
                {hasIndividualActive && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30">
                    능동적 오류(Active Error) 전조 — 현장 검증·일시정지(Pause) 권고
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-white/10 rounded-xl p-3.5 border border-white/15 space-y-1">
                <span className="text-[11px] font-extrabold text-blue-300 block">
                  개인용 HPI 도구 (FIG. 12.6)
                </span>
                <p className="text-slate-200 leading-relaxed">
                  · 자기 점검 <strong>STAR</strong> (Stop-Think-Act-Review)<br />
                  · 근거 없는 가정 검증 & 질문하는 태도<br />
                  · 불확실 시 즉시 작업 일시정지(Pause)
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-3.5 border border-white/15 space-y-1">
                <span className="text-[11px] font-extrabold text-emerald-300 block">
                  작업팀 HPI 도구 (FIG. 12.7)
                </span>
                <p className="text-slate-200 leading-relaxed">
                  · 작업 전 사전 브리핑(Prejob) & 인수인계 검증<br />
                  · 3방향 소통(3-Way Comm.) & 위험 시각 플래깅<br />
                  · 작업 후 사후 검토(Postjob Review)
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-3.5 border border-white/15 space-y-1">
                <span className="text-[11px] font-extrabold text-amber-300 block">
                  경영·리더십 HPI 도구 (FIG. 12.8)
                </span>
                <p className="text-slate-200 leading-relaxed">
                  · 휴면 잠재 조건 중심 시스템 RCA 조사<br />
                  · 변경관리(MOC) & 무문책 아차사고 보고<br />
                  · 공정·설비 조건 개선 예산 우선 집행
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" /> JHA 4열 + HPI 진단 기록 저장
            </button>
          </div>
        </div>
      </form>

      {/* 저장된 JHA + HPI 목록 */}
      {records.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900">저장된 JHA & HPI 진단서 ({records.length}건)</h3>
          <div className="space-y-2.5">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {rec.analysisType}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      {rec.hierarchyType}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {SRK_MODES[rec.srkMode].title}
                    </span>
                    <span className="text-[10px] text-slate-500">{rec.createdAt}</span>
                  </div>
                  <p className="text-xs font-extrabold text-slate-900">{rec.jobTitle}</p>
                  <p className="text-[11px] text-slate-600">
                    {rec.departmentShift} · 작업 단계 {rec.rows.length}개 · HPI 오류 전조 {rec.precursors.length}건 식별
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteRecord(rec.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 self-end sm:self-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
