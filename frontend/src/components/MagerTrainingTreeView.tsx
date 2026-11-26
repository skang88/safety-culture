"use client";

import React, { useEffect, useState } from "react";
import {
  AlertOctagon,
  CheckCircle2,
  GitBranch,
  GraduationCap,
  Trash2,
  Wrench,
} from "lucide-react";
import TextbookSourceBadge from "./TextbookSourceBadge";

interface MagerLog {
  id: string;
  issueTitle: string;
  hasKnowledgeDeficit: boolean;
  performedOften: boolean;
  nonTrainingCause: string;
  prescriptionType: "formal_training" | "practice" | "feedback" | "non_training";
  prescriptionTitle: string;
  recommendedTechniques: string[];
  createdAt: string;
}

// Ch 13 FIG. 13.1 Successful training techniques
const TRAINING_TECHNIQUES = [
  { method: "타인 교육 · 즉각적 학습 활용 · 시연용 그림 활용", retention: "90%", recommended: true },
  { method: "현장 실습 (Practice by doing on-the-job)", retention: "75%", recommended: true },
  { method: "토의 그룹 · 근로자 참여 · 1:1 토의", retention: "50%", recommended: true },
  { method: "시연 (Demonstration)", retention: "30%", recommended: false },
  { method: "시청각 (Audio visual)", retention: "20%", recommended: false },
  { method: "읽기 (Reading) / 강의 (Lecture)", retention: "10% / 5%", recommended: false },
];

export default function MagerTrainingTreeView() {
  const [issueTitle, setIssueTitle] = useState("출동 현장 고압선·기계 설비 LOTO 미실시 및 구두 소통 오류");
  const [hasKnowledgeDeficit, setHasKnowledgeDeficit] = useState<boolean>(false);
  const [performedOften, setPerformedOften] = useState<boolean>(true);
  const [nonTrainingCause, setNonTrainingCause] = useState<string>(
    "시간 압박·인력 부족 및 잠금장치(LOTO) 현장 비치 미흡 (비훈련적 시스템 결함)"
  );
  const [logs, setLogs] = useState<MagerLog[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("safepulse_mager_logs");
      if (raw) setLogs(JSON.parse(raw));
    } catch {}
  }, []);

  // Ch 13 FIG. 13.2 Mager's decision tree 분기 판정 로직
  const getDecisionOutcome = () => {
    if (!hasKnowledgeDeficit) {
      return {
        prescriptionType: "non_training" as const,
        title: "비훈련적 대안(Non-Training Options) 처방 — 재훈련 금지",
        badgeClass: "bg-amber-50 border-amber-300 text-amber-900",
        detail:
          "근로자가 이미 수행 방법을 알고 있으나 실행하지 못한 경우입니다. 사고 조사 양식을 채우기 위해 '근로자 재훈련'을 기본 해법으로 남용하는 것은 시간 낭비이자 근로자에 대한 모독입니다 (US DOE, 2009; Ch 13 p. 333). 작업 환경, 도구 비치, 시간 압박, 지휘체계를 개선하십시오.",
        techniques: ["장비·잠금장치(LOTO) 현장 접근성 개선", "시간 압박·인력 배치 조정", "3방향 복명복창 소통 절차 정착"],
      };
    }

    if (performedOften) {
      return {
        prescriptionType: "feedback" as const,
        title: "피드백 제공 (Provide Feedback) 처방",
        badgeClass: "bg-blue-50 border-blue-300 text-blue-900",
        detail:
          "지식·기술 격차가 일부 있으나 과업이 자주 수행되는 경우, 일방적 강의식 재교육보다 현장 감독관의 즉각적 코칭과 3방향 피드백(Three-way communication)을 결합하십시오.",
        techniques: ["작업 전 TBM 코칭 및 피드백", "타인 교육·시연용 그림 활용 (90%)", "1:1 현장 토의 (50%)"],
      };
    }

    return {
      prescriptionType: "formal_training" as const,
      title: "정규 훈련 및 현장 실습 (Conduct Formal Training & Practice) 처방",
      badgeClass: "bg-emerald-50 border-emerald-300 text-emerald-900",
      detail:
        "드물게 수행되거나 신규 도입된 비친숙 과업(Knowledge-based/Rule-based)에서 지식·기술 결핍이 확인되었습니다. 강의(5%) 중심의 의무 이러닝을 지양하고, FIG. 13.1의 실습(75%)·시연(30%)·타인 교육(90%)을 혼합 설계하십시오.",
      techniques: [
        "현장 실습 (Practice by doing on-the-job, 75%)",
        "타인 교육 및 즉각 활용 (Instructing others, 90%)",
        "Susan Harwood 4대 기준(정확·신뢰·명확·실용) 검증",
      ],
    };
  };

  const outcome = getDecisionOutcome();

  const handleSaveLog = () => {
    const entry: MagerLog = {
      id: `MGR-${Date.now()}`,
      issueTitle,
      hasKnowledgeDeficit,
      performedOften,
      nonTrainingCause: hasKnowledgeDeficit ? "해당 없음 (지식·기술 결핍)" : nonTrainingCause,
      prescriptionType: outcome.prescriptionType,
      prescriptionTitle: outcome.title,
      recommendedTechniques: outcome.techniques,
      createdAt: new Date().toLocaleDateString("ko-KR"),
    };
    const updated = [entry, ...logs];
    setLogs(updated);
    localStorage.setItem("safepulse_mager_logs", JSON.stringify(updated));
    setToast("Mager 의사결정 트리 판별 이력이 저장되었습니다.");
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteLog = (id: string) => {
    const updated = logs.filter((l) => l.id !== id);
    setLogs(updated);
    localStorage.setItem("safepulse_mager_logs", JSON.stringify(updated));
  };

  const nonTrainingRate =
    logs.length > 0
      ? Math.round((logs.filter((l) => l.prescriptionType === "non_training").length / logs.length) * 100)
      : 0;

  return (
    <div className="space-y-6 pb-16">
      <TextbookSourceBadge
        chapter="Ch 13 (FIG. 13.1·13.2 Mager 의사결정 트리 & US DOE 2009)"
        title="교육 필요성 판별 및 '재훈련 만능주의(Retraining Trap)' 차단기"
        kpi={`비훈련 원인 분리율 ${nonTrainingRate}% · 실습 중심 기법 연계`}
        law="산안법 제29조 / 중처법 시행령 제4조제5호"
      />

      {toast && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측: Mager 의사결정 트리 인터랙티브 분기 */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-extrabold text-slate-900">
              Mager 안전 성과 개선 의사결정 트리 (FIG. 13.2)
            </h1>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              1. 관찰된 안전 성과 불일치 (Safety Performance Discrepancy)
            </label>
            <input
              value={issueTitle}
              onChange={(e) => setIssueTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          {/* 분기 1: 지식·능력·기술 결핍 여부 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-extrabold text-slate-900">
              2. 핵심 분기: 근로자의 지식·능력·기술(Knowledge, Ability, or Skill) 결핍인가?
            </div>
            <p className="text-[11px] text-slate-600">
              &ldquo;총을 머리에 겨누었을 때(Life depends on it) 이 작업을 안전하게 수행할 수 있는가?&rdquo;를 자문하십시오.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setHasKnowledgeDeficit(true)}
                className={`p-3 rounded-xl border text-xs font-bold transition ${
                  hasKnowledgeDeficit
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-300"
                }`}
              >
                YES (방법을 모르거나 미숙련)
              </button>
              <button
                onClick={() => setHasKnowledgeDeficit(false)}
                className={`p-3 rounded-xl border text-xs font-bold transition ${
                  !hasKnowledgeDeficit
                    ? "bg-amber-600 text-white border-amber-600"
                    : "bg-white text-slate-700 border-slate-300"
                }`}
              >
                NO (알고 있으나 실행 안 됨)
              </button>
            </div>
          </div>

          {/* 분기 2 */}
          {hasKnowledgeDeficit ? (
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
              <div className="text-xs font-extrabold text-blue-900">
                3. 과업 수행 빈도 분기: 해당 작업이 현장에서 자주 수행되는가? (Task accomplished often?)
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPerformedOften(true)}
                  className={`p-3 rounded-xl border text-xs font-bold transition ${
                    performedOften
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-700 border-slate-300"
                  }`}
                >
                  YES (자주 수행 — 피드백 우선)
                </button>
                <button
                  onClick={() => setPerformedOften(false)}
                  className={`p-3 rounded-xl border text-xs font-bold transition ${
                    !performedOften
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-700 border-slate-300"
                  }`}
                >
                  NO (비친숙·간헐적 — 정규훈련/실습)
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
              <div className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                <Wrench className="w-4 h-4" /> 3. 비훈련적 원인 (Non-Training Options) 특정
              </div>
              <select
                value={nonTrainingCause}
                onChange={(e) => setNonTrainingCause(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs font-semibold"
              >
                <option>시간 압박·인력 부족 및 잠금장치(LOTO) 현장 비치 미흡 (비훈련적 시스템 결함)</option>
                <option>물리적 작업환경·설비 인체공학적 결함으로 안전 절차 준수 곤란</option>
                <option>관리감독자 기대치 불명확 및 피드백 부재</option>
                <option>조직 규범(Peer pressure)이 속도 위주 편법을 보상함</option>
              </select>
            </div>
          )}

          {/* 판정 결과 카드 */}
          <div className={`p-5 rounded-2xl border space-y-2 ${outcome.badgeClass}`}>
            <div className="flex items-center gap-2 text-sm font-extrabold">
              {outcome.prescriptionType === "non_training" ? (
                <AlertOctagon className="w-5 h-5" />
              ) : (
                <GraduationCap className="w-5 h-5" />
              )}
              {outcome.title}
            </div>
            <p className="text-xs leading-relaxed">{outcome.detail}</p>
            <ul className="list-disc pl-5 text-xs font-semibold space-y-1 pt-1">
              {outcome.techniques.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleSaveLog}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
          >
            판별 결과 저장 (SMS 5번 요소 KPI 반영)
          </button>
        </div>

        {/* 우측: FIG. 13.1 효과적 훈련 기법 위계 & 저장 이력 */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h2 className="text-sm font-extrabold text-slate-900">
              효과적인 훈련 기법 위계 (FIG. 13.1 · Roughton & Lyons, 1999)
            </h2>
            <p className="text-xs text-slate-500">
              전통적 강의(5%)와 단순 시청각·클릭형 이러닝은 유지율이 낮으며, 현장 실습(75%)과 타인 교육(90%) 결합이 필수입니다.
            </p>
            <div className="space-y-2">
              {TRAINING_TECHNIQUES.map((t) => (
                <div
                  key={t.method}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    t.recommended
                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-900 font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  <span>{t.method}</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-extrabold">
                    {t.retention}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h2 className="text-sm font-extrabold text-slate-900">판별 이력 ({logs.length}건)</h2>
            {logs.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">저장된 교육 판별 이력이 없습니다.</p>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-extrabold text-slate-900">{log.issueTitle}</span>
                      <button onClick={() => handleDeleteLog(log.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-[11px] font-semibold text-blue-700">{log.prescriptionTitle}</div>
                    <div className="text-[11px] text-slate-500">원인: {log.nonTrainingCause}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
