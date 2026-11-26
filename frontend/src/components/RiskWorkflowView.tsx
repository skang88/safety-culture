"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import TextbookSourceBadge from "./TextbookSourceBadge";

interface RiskRecord {
  id: string;
  taskName: string;
  unitName: string;
  peopleFactor: string;
  equipmentFactor: string;
  environmentFactor: string;
  policyFactor: string;
  hazard: string;
  initProb: number;
  initSev: number;
  initScore: number;
  initLevel: "Green" | "Yellow" | "Red";
  controlTier: string;
  controlPlan: string;
  resProb: number;
  resSev: number;
  resScore: number;
  resLevel: "Green" | "Yellow" | "Red";
  residualAcceptable: boolean;
  approver: string;
  guidanceCardSummary: string;
  monitoringCycle: string;
  createdAt: string;
}

// Ch 10 TABLE 10.1 & FIG. 10.2 8단계 원문 순서 그대로
const EIGHT_STEPS = [
  { step: 1, label: "목표 정의", en: "Define the objective" },
  { step: 2, label: "시스템 기술", en: "Describe system (4축)" },
  { step: 3, label: "재해 식별", en: "Identify hazards" },
  { step: 4, label: "위험 평가", en: "Assess & analyze risk" },
  { step: 5, label: "우선순위·통제", en: "Prioritize & Hierarchy" },
  { step: 6, label: "실행 계획", en: "Develop action plans" },
  { step: 7, label: "잔여위험 검증", en: "Residual risk & Card" },
  { step: 8, label: "지속 모니터링", en: "Modify & Monitor" },
];

// Ch 9 TABLE 9.7 3색 신호등 판정 (1~25점 매트릭스 매핑)
function evaluateRiskColor(prob: number, sev: number): {
  score: number;
  level: "Green" | "Yellow" | "Red";
  actionText: string;
  badgeClass: string;
} {
  const score = prob * sev;
  if (score >= 12 || sev === 5) {
    return {
      score,
      level: "Red",
      actionText: "고위험(Red) — 즉시 작업 중단 및 제거·대체·공학적 통제 필수 (감독관 승인 없이 착수 불가)",
      badgeClass: "bg-red-100 text-red-800 border-red-300",
    };
  }
  if (score >= 5) {
    return {
      score,
      level: "Yellow",
      actionText: "주의(Yellow) — 관리감독자 협의(Consult with supervisor) 및 감소대책 적용 필요",
      badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
    };
  }
  return {
    score,
    level: "Green",
    actionText: "저위험(Green) — 수용 가능 영역(ALARP), 기존 표준절차(SOP) 유지 및 관찰",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
  };
}

const CONTROL_HIERARCHY = [
  { id: "elimination", label: "1순위: 제거 (Elimination)", isUpper: true, desc: "유해위험요인 자체를 물리적으로 완전히 제거" },
  { id: "substitution", label: "2순위: 대체 (Substitution)", isUpper: true, desc: "위험도가 낮은 물질·장비·공법으로 대체" },
  { id: "engineering", label: "3순위: 공학적 통제 (Engineering)", isUpper: true, desc: "방호장치, 인터록, 국소배기, 안전난간 설치" },
  { id: "administrative", label: "4순위: 관리적 통제 (Administrative)", isUpper: false, desc: "작업절차서(SOP), 교대 순환, 3방향 소통, 교육" },
  { id: "ppe", label: "5순위: 개인보호구 (PPE)", isUpper: false, desc: "안전모, 방열복, 절단방지장갑 등 최후 방어선" },
];

export default function RiskWorkflowView() {
  const [step, setStep] = useState(1);
  const [records, setRecords] = useState<RiskRecord[]>([]);

  // Form states for the 8 steps
  const [taskName, setTaskName] = useState("밀폐공간(맨홀·지하탱크) 인명구조 및 유해가스 점검");
  const [unitName, setUnitName] = useState("의령소방서 119구조대 1팀");
  const [peopleFactor, setPeopleFactor] = useState("교대 구조대원 4인 1조, 진입조·대기조·감시자 역할 분담");
  const [equipmentFactor, setEquipmentFactor] = useState("복합가스측정기, 공기호흡기(SCBA), 삼각대·인양기");
  const [environmentFactor, setEnvironmentFactor] = useState("산소결핍(<18%) 및 황화수소·일산화탄소 체류 가능 밀폐공간");
  const [policyFactor, setPolicyFactor] = useState("밀폐공간 출입허가 절차 및 LOTO·3방향 복명복창 규범");
  const [hazard, setHazard] = useState("유독가스 질식 및 내부 감전/추락 복합 재해");

  const [initProb, setInitProb] = useState(4);
  const [initSev, setInitSev] = useState(5);

  const [controlTier, setControlTier] = useState("engineering");
  const [controlPlan, setControlPlan] = useState(
    "강제 급배기 송풍기 가동(공학적 통제) + 연속 복합가스 농도 측정 + 감시인 상주 및 3방향 무전 교신"
  );

  const [resProb, setResProb] = useState(1);
  const [resSev, setResSev] = useState(3);
  const [approver, setApprover] = useState("119구조대장 / 안전보건관리감독자");
  const [guidanceCardSummary, setGuidanceCardSummary] = useState(
    "Stop-Look-Listen: 진입 전 산소 19.5~23.5% 확인 및 강제환기 15분 필수, 이상 시 즉시 대피"
  );
  const [monitoringCycle, setMonitoringCycle] = useState("매 출동·훈련 시 사전 점검 및 월 1회 JHA 갱신");
  const [savedToast, setSavedToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("safepulse_risk_records");
      if (raw) setRecords(JSON.parse(raw));
    } catch {}
  }, []);

  const initEval = evaluateRiskColor(initProb, initSev);
  const resEval = evaluateRiskColor(resProb, resSev);
  const isResidualAcceptable = resEval.level !== "Red";

  const applyPreset = (preset: "rescue" | "knife") => {
    if (preset === "rescue") {
      setTaskName("밀폐공간(맨홀·지하탱크) 인명구조 및 유해가스 점검");
      setUnitName("의령소방서 119구조대 1팀");
      setHazard("유독가스 질식 및 내부 감전/추락 복합 재해");
      setInitProb(4);
      setInitSev(5);
      setControlTier("engineering");
      setControlPlan("강제 급배기 송풍기 가동 + 연속 복합가스 측정 + 삼각대 안전로프 체결");
      setResProb(1);
      setResSev(3);
    } else {
      setTaskName("포장재 절단 작업 및 유틸리티 나이프 취급 (Ch 12 연계)");
      setUnitName("물류·포장 현장 작업조");
      setHazard("고정식 칼날 노출로 인한 손가락·손목 열상");
      setInitProb(4);
      setInitSev(4);
      setControlTier("substitution");
      setControlPlan("전면 금지 대신 작업별 자동 수축형 안전칼(Self-retractable) 대체 + ANSI Cut 등급 장갑 지급");
      setResProb(1);
      setResSev(2);
    }
    setStep(1);
  };

  const handleSaveRecord = () => {
    const newRecord: RiskRecord = {
      id: `RSK-${Date.now()}`,
      taskName,
      unitName,
      peopleFactor,
      equipmentFactor,
      environmentFactor,
      policyFactor,
      hazard,
      initProb,
      initSev,
      initScore: initEval.score,
      initLevel: initEval.level,
      controlTier,
      controlPlan,
      resProb,
      resSev,
      resScore: resEval.score,
      resLevel: resEval.level,
      residualAcceptable: isResidualAcceptable,
      approver,
      guidanceCardSummary,
      monitoringCycle,
      createdAt: new Date().toLocaleDateString("ko-KR"),
    };
    const updated = [newRecord, ...records];
    setRecords(updated);
    localStorage.setItem("safepulse_risk_records", JSON.stringify(updated));
    setSavedToast("8단계 위험성평가 및 위험 지침 카드가 저장되었습니다.");
    setTimeout(() => setSavedToast(null), 3000);
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    localStorage.setItem("safepulse_risk_records", JSON.stringify(updated));
  };

  const upperTierCount = records.filter((r) =>
    ["elimination", "substitution", "engineering"].includes(r.controlTier)
  ).length;
  const upperTierRate = records.length > 0 ? Math.round((upperTierCount / records.length) * 100) : 0;
  const acceptableRate =
    records.length > 0
      ? Math.round((records.filter((r) => r.residualAcceptable).length / records.length) * 100)
      : 0;

  return (
    <div className="space-y-6 pb-16">
      <TextbookSourceBadge
        chapter="Ch 10 (FIG. 10.1·10.2·TABLE 10.1) & Ch 9 (FIG. 9.2·9.3·TABLE 9.7)"
        title="위험성평가 8단계 순환 워크플로우 & 3색 신호등 매트릭스"
        kpi={`상위 통제 위계 적용률 ${upperTierRate}% · 잔여위험 허용률 ${acceptableRate}%`}
        law="산안법 제36조 / 중처법 시행령 제4조제3호"
      />

      {savedToast && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {savedToast}
        </div>
      )}

      {/* 상단 프리셋 & 8단계 진행바 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-extrabold text-slate-900">
              위험관리 8단계 워크플로우 (FIG. 10.2 폐루프)
            </h1>
            <p className="text-xs text-slate-500">
              원문 Step 1~8 순서와 잔여위험(FIG. 10.1) 피드백 분기를 그대로 따릅니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => applyPreset("rescue")}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200"
            >
              🚒 119구조대 밀폐공간 프리셋
            </button>
            <button
              onClick={() => applyPreset("knife")}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200"
            >
              🔪 칼날 안전 식스시그마 프리셋
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {EIGHT_STEPS.map((s) => {
            const active = step === s.step;
            const done = step > s.step;
            return (
              <button
                key={s.step}
                onClick={() => setStep(s.step)}
                className={`text-left p-2.5 rounded-xl border transition-all ${
                  active
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : done
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="text-[10px] font-bold opacity-80">STEP {s.step}</div>
                <div className="text-xs font-extrabold truncate">{s.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 단계별 본문 카드 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">
              Step 1. 목표 정의 및 평가 대상 직무 선정 (TABLE 10.1 Step 1)
            </h2>
            <p className="text-xs text-slate-600">
              위험성평가의 궁극적 목표는 조직에 미치는 잠재적 심각도를 기준으로 위험의 우선순위를 확립하는 것입니다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">대상 과·팀·작업조</label>
                <input
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">평가 대상 작업/공정명</label>
                <input
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">
              Step 2. 조직·시스템 4대 축 기술 (TABLE 10.1 Step 2)
            </h2>
            <p className="text-xs text-slate-600">
              인적 요소(People), 장비/자재(Equipment), 작업 환경(Environment), 정책/절차(Policies) 4축을 규명합니다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">① 인적 요소 (People)</label>
                <input value={peopleFactor} onChange={(e) => setPeopleFactor(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">② 도구·장비·자재 (Equipment)</label>
                <input value={equipmentFactor} onChange={(e) => setEquipmentFactor(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">③ 작업 환경 (Environment)</label>
                <input value={environmentFactor} onChange={(e) => setEnvironmentFactor(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">④ 정책·절차·관리체계 (Policies)</label>
                <input value={policyFactor} onChange={(e) => setPolicyFactor(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm" />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">
              Step 3. 재해(Hazard)와 위험(Risk) 분리 식별 (TABLE 10.1 Step 3 · 5.3절)
            </h2>
            <p className="text-xs text-slate-600">
              재해(Hazard: 위해의 물리적 근원)와 위험(Risk: 노출 시 발생 가능성과 심각도)을 혼동하지 않고 명확히 기술합니다.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">식별된 핵심 재해 요인 (Hazard)</label>
              <textarea
                rows={3}
                value={hazard}
                onChange={(e) => setHazard(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">
              Step 4. 초기 총위험(Total Risk) 매트릭스 평가 (FIG. 9.2 · TABLE 9.7)
            </h2>
            <p className="text-xs text-slate-600">
              발생 가능성(1~5)과 심각도(1~5)를 클릭하여 초기 총위험과 3색 신호등(Green/Yellow/Red)을 판정합니다.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-7 overflow-x-auto">
                <table className="w-full border-collapse text-center text-xs">
                  <thead>
                    <tr>
                      <th className="p-2 border border-slate-200 bg-slate-50">가능성 \ 심각도</th>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <th key={s} className="p-2 border border-slate-200 bg-slate-50 font-bold">
                          심각도 {s}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[5, 4, 3, 2, 1].map((p) => (
                      <tr key={p}>
                        <td className="p-2 border border-slate-200 bg-slate-50 font-bold">가능성 {p}</td>
                        {[1, 2, 3, 4, 5].map((s) => {
                          const cell = evaluateRiskColor(p, s);
                          const selected = initProb === p && initSev === s;
                          const bg =
                            cell.level === "Red"
                              ? "bg-red-100 hover:bg-red-200 text-red-900"
                              : cell.level === "Yellow"
                              ? "bg-amber-100 hover:bg-amber-200 text-amber-900"
                              : "bg-emerald-100 hover:bg-emerald-200 text-emerald-900";
                          return (
                            <td key={s} className="p-1 border border-slate-200">
                              <button
                                onClick={() => {
                                  setInitProb(p);
                                  setInitSev(s);
                                }}
                                className={`w-full py-2 rounded-lg font-extrabold transition ${bg} ${
                                  selected ? "ring-2 ring-slate-900 scale-105" : ""
                                }`}
                              >
                                {cell.score}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="lg:col-span-5 space-y-3">
                <div className={`p-4 rounded-2xl border ${initEval.badgeClass}`}>
                  <div className="text-xs font-bold uppercase">초기 총위험 판정 (TABLE 9.7)</div>
                  <div className="text-2xl font-black mt-1">
                    {initEval.score}점 ({initEval.level})
                  </div>
                  <p className="text-xs mt-2 leading-relaxed">{initEval.actionText}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">
              Step 5. 우선순위화 및 통제 위계(Hierarchy of Controls) 선정 (TABLE 10.1 Step 5)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CONTROL_HIERARCHY.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setControlTier(tier.id)}
                  className={`text-left p-3.5 rounded-xl border transition-all ${
                    controlTier === tier.id
                      ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">{tier.label}</span>
                    {tier.isUpper && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        근원적 통제
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{tier.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">
              Step 6. 위험관리 실행 계획 및 책임자 지정 (TABLE 10.1 Step 6)
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">구체적 감소대책 실행 계획</label>
                <textarea
                  rows={3}
                  value={controlPlan}
                  onChange={(e) => setControlPlan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">승인 및 실행 책임자</label>
                <input
                  value={approver}
                  onChange={(e) => setApprover(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">
              Step 7. 잔여위험(Residual Risk) 검증 및 위험 지침 카드 (FIG. 10.1 · Ch 9)
            </h2>
            <p className="text-xs text-slate-600">
              통제 대책 적용 후 남는 잔여위험을 재평가합니다. 여전히 Red(수용 불가)일 경우 Step 4·5로 피드백해 추가 공학적 대책을 수립해야 합니다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="text-xs font-bold text-slate-700">통제 후 잔여위험 재평가</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">잔여 가능성 (1~5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={resProb}
                      onChange={(e) => setResProb(Math.min(5, Math.max(1, Number(e.target.value) || 1)))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">잔여 심각도 (1~5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={resSev}
                      onChange={(e) => setResSev(Math.min(5, Math.max(1, Number(e.target.value) || 1)))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                    />
                  </div>
                </div>
                <div className={`p-3 rounded-xl border ${resEval.badgeClass}`}>
                  <div className="text-xs font-extrabold">
                    잔여위험: {resEval.score}점 ({resEval.level})
                  </div>
                  <div className="text-[11px] mt-1">
                    {isResidualAcceptable
                      ? "수용 가능 수준(ALARP) 충족 — Step 8 모니터링 진행 가능"
                      : "수용 불가(Unacceptable) — Step 5로 돌아가 상위 통제 위계 추가 필요"}
                  </div>
                </div>
                {!isResidualAcceptable && (
                  <button
                    onClick={() => setStep(5)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Step 5(통제 위계)로 피드백 루프 이동
                  </button>
                )}
              </div>

              <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/50 space-y-2">
                <div className="text-xs font-extrabold text-blue-900">
                  현장 위험 지침 카드 (Risk Guidance Card · Ch 9 TABLE 9.1)
                </div>
                <textarea
                  rows={4}
                  value={guidanceCardSummary}
                  onChange={(e) => setGuidanceCardSummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-blue-200 bg-white text-xs"
                />
                <p className="text-[11px] text-slate-600">
                  Stop, Look, and Listen — 작업 착수 전 대원들이 즉시 확인하는 핵심 안전 수칙입니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 8 && (
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">
              Step 8. 조직 프로세스 수정 및 생애주기 모니터링 저장 (TABLE 10.1 Step 8)
            </h2>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">사후 모니터링 및 SOP 갱신 주기</label>
              <input
                value={monitoringCycle}
                onChange={(e) => setMonitoringCycle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div><span className="font-bold">대상/과업:</span> [{unitName}] {taskName}</div>
              <div><span className="font-bold">핵심 재해:</span> {hazard}</div>
              <div><span className="font-bold">위험 감소:</span> 초기 {initEval.score}점({initEval.level}) → 잔여 {resEval.score}점({resEval.level})</div>
              <div><span className="font-bold">통제 대책:</span> {controlPlan}</div>
            </div>

            <button
              onClick={handleSaveRecord}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              8단계 위험성평가 최종 저장 (SMS 대시보드 연동)
            </button>
          </div>
        )}

        {/* 이전/다음 단계 버튼 */}
        <div className="pt-4 border-t border-slate-100 flex justify-between">
          <button
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> 이전 단계
          </button>
          <button
            disabled={step === 8}
            onClick={() => setStep((s) => Math.min(8, s + 1))}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold disabled:opacity-40"
          >
            다음 단계 <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 저장된 위험성평가 이력 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900">
            저장된 위험성평가 및 위험 지침 카드 이력 ({records.length}건)
          </h2>
          <span className="text-xs text-slate-500">
            상위 통제 위계 적용률 {upperTierRate}% · 잔여위험 허용률 {acceptableRate}%
          </span>
        </div>

        {records.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            Step 8까지 완료 후 저장하면 여기에 이력이 누적되고 SMS 6대 핵심 요소 점수에 반영됩니다.
          </p>
        ) : (
          <div className="space-y-2.5">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-900">{rec.taskName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {rec.unitName}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    초기 {rec.initScore}점({rec.initLevel}) → 잔여 {rec.resScore}점({rec.resLevel}) | 지침 카드: {rec.guidanceCardSummary}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteRecord(rec.id)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 self-end sm:self-center"
                >
                  <Trash2 className="w-3.5 h-3.5" /> 삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
