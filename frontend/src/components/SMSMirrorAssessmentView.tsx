"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, ClipboardList, ShieldAlert, Sparkles } from "lucide-react";
import TextbookSourceBadge from "./TextbookSourceBadge";

// Ch 14 FIG. 14.3 기본 SMS 평가 5단계 루프
const ASSESSMENT_LOOP = [
  "1. 사전 조율 (5개년 데이터·지각설문)",
  "2. 시작 회의 & 현장 투어 (인공물 확인)",
  "3. 문서 검토 & 다계층 인터뷰 (6인 소그룹)",
  "4. 0~3점 평정 & 증거 문서화 (일일 브리핑)",
  "5. SMART 액션플랜 & 전사 결과 공개",
];

// Ch 14 TABLE 14.1 Six Basic Core Principles
const CORE_CRITERIA = [
  { key: "leadership", label: "1. 경영 리더십 (Management leadership)", law: "산안법 제14·15조" },
  { key: "involvement", label: "2. 근로자 참여 (Employee involvement)", law: "산안법 제24조" },
  { key: "hazard_id", label: "3. 위험·유해성 식별과 평가 (Hazard ID & Assessment)", law: "산안법 제36조" },
  { key: "control", label: "4. 유해위험요인 예방 및 통제 (Hazard prevention & control)", law: "산안법 제36·52조" },
  { key: "training", label: "5. 정보 및 교육훈련 (Information & training)", law: "산안법 제29조" },
  { key: "evaluation", label: "6. 프로그램 실효성 평가 (Evaluation of effectiveness)", law: "중처법 시행령 제4조" },
];

// Ch 14 Appendix 14.1 OSHA SHARP 0~3점 평정 척도 원문 정의
const SHARP_SCALE = [
  { value: 0, label: "0점 (전무함)", cue: "긍정 큐(Confirming cue) 전무 — No / Mostly no" },
  { value: 1, label: "1점 (일부 존재)", cue: "일부 존재하나 중대한 근본적 개선 필요 — Some" },
  { value: 2, label: "2점 (대체로 양호)", cue: "대체로 정착, 경미한 보완 필요 — Yes / Mostly yes" },
  { value: 3, label: "3점 (완전함)", cue: "단 하나의 부정 큐도 없는 무결점 정착 — All" },
];

export default function SMSMirrorAssessmentView() {
  const [activeLoopStep, setActiveLoopStep] = useState(4);
  const [scores, setScores] = useState<Record<string, number>>({
    leadership: 2,
    involvement: 2,
    hazard_id: 2,
    control: 1,
    training: 2,
    evaluation: 1,
  });
  const [evidences, setEvidences] = useState<Record<string, string>>({
    leadership: "이사회 안전계획 보고 이행, 단 교대조별 예산 집행 권한 명확화 필요",
    involvement: "산업안전보건위 분기 회의 운영, 현장 6인 소그룹 인터뷰 100% 완료",
    hazard_id: "고위험 작업 JHA 보유, 신규 장비 도입 시 변경관리(MOC) 일부 누락",
    control: "방호장치 점검 기록은 양호하나 현장 1개 구역 인터록 우회(인공물 괴리) 발견",
    training: "법정 교육 이수율 100%, 단 실습(Hands-on) 및 3방향 복창 훈련 보완 필요",
    evaluation: "월별 1개 요소 점검 캘린더 착수 단계, 전사 결과 공개 프로세스 정립 필요",
  });
  const [smartPlans, setSmartPlans] = useState<Record<string, string>>({});
  const [savedToast, setSavedToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("safepulse_sms_mirror");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.scores) setScores(parsed.scores);
        if (parsed.evidences) setEvidences(parsed.evidences);
        if (parsed.smartPlans) setSmartPlans(parsed.smartPlans);
      }
    } catch {}
  }, []);

  const avgScale =
    Math.round(
      (Object.values(scores).reduce((acc, v) => acc + v, 0) / CORE_CRITERIA.length) * 10
    ) / 10;

  const defects = CORE_CRITERIA.filter((c) => (scores[c.key] ?? 0) <= 1);

  const handleSave = () => {
    const payload = {
      scores,
      evidences,
      smartPlans,
      avgScale,
      defectCount: defects.length,
      updatedAt: new Date().toLocaleDateString("ko-KR"),
    };
    localStorage.setItem("safepulse_sms_mirror", JSON.stringify(payload));
    setSavedToast("거울 자체평가(0~3점) 및 SMART 시정조치가 저장되어 SMS 대시보드에 반영되었습니다.");
    setTimeout(() => setSavedToast(null), 3000);
  };

  return (
    <div className="space-y-6 pb-16">
      <TextbookSourceBadge
        chapter="Ch 14 (FIG. 14.1·14.3 · TABLE 14.1 · Appendix 14.1)"
        title="SMS 거울 자체평가(0~3점 OSHA SHARP 척도) & 결함 수리 루프"
        kpi={`평균 평점 ${avgScale}/3.0점 · 0~1점 결함(Defect) ${defects.length}건`}
        law="산안법 제14·36조 / 중처법 시행령 제4조"
      />

      {savedToast && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {savedToast}
        </div>
      )}

      {/* 거울 비유 & '시스템 탓하기' 방지 철학 배너 */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-bold">
            FIG. 14.1 거울 비유 &amp; Blaming the System 극복
          </span>
          <span className="text-lg font-black text-emerald-400">현재 평균 {avgScale} / 3.0점</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          진지한 SMS 평가는 왜곡 없는 거울을 들여다보는 것과 같습니다. 성과가 기대에 못 미칠 때 시스템을 통째로
          갈아엎는 &lsquo;시스템 탓하기(Blaming the system)&rsquo;를 버리고, 6대 핵심 요소 내부의 구체적 결함(Defect, 0~1점)을
          객관적 증거(Fact)와 함께 포착해 SMART 액션플랜으로 수리하십시오.
        </p>

        {/* FIG. 14.3 평가 5단계 루프 */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
          {ASSESSMENT_LOOP.map((label, idx) => (
            <button
              key={label}
              onClick={() => setActiveLoopStep(idx + 1)}
              className={`text-left px-3 py-2 rounded-xl text-[11px] font-bold border transition ${
                activeLoopStep === idx + 1
                  ? "bg-blue-600 text-white border-blue-500"
                  : "bg-white/10 text-slate-200 border-white/10 hover:bg-white/15"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 0~3점 OSHA SHARP 평정표 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base font-extrabold text-slate-900">
            SMS 6대 핵심 요소 0~3점 평정 &amp; 사실 기반 증거 기록 (Appendix 14.1)
          </h2>
          <span className="text-[11px] text-slate-500">
            점수 하락 반발을 막기 위해 반드시 객관적 관찰 사실·인공물·인터뷰 증거를 기재합니다 (Lesson Learned 4).
          </span>
        </div>

        <div className="space-y-4">
          {CORE_CRITERIA.map((item) => {
            const current = scores[item.key] ?? 0;
            const isDefect = current <= 1;
            return (
              <div
                key={item.key}
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDefect ? "border-red-200 bg-red-50/40" : "border-slate-200 bg-slate-50/50"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900">{item.label}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                        {item.law}
                      </span>
                      {isDefect && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> 결함(Defect) 조치 필요
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {SHARP_SCALE.map((sc) => (
                      <button
                        key={sc.value}
                        onClick={() => setScores((prev) => ({ ...prev, [item.key]: sc.value }))}
                        title={sc.cue}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                          current === sc.value
                            ? sc.value <= 1
                              ? "bg-red-600 text-white border-red-600"
                              : sc.value === 2
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        {sc.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    현장 관찰 사실 / 인공물 대조 / 인터뷰 증거 (Fact-based Evidence)
                  </label>
                  <input
                    value={evidences[item.key] || ""}
                    onChange={(e) => setEvidences((prev) => ({ ...prev, [item.key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                  />
                </div>

                {isDefect && (
                  <div>
                    <label className="block text-[11px] font-bold text-red-700 mb-1">
                      SMART 시정 액션 플랜 (구체적 조치·담당·완료기한)
                    </label>
                    <input
                      placeholder="예: [Specific] 인터록 센서 전수 점검 / [Measurable] 완료율 100% / [Time-bound] 2026-12-15까지"
                      value={smartPlans[item.key] || ""}
                      onChange={(e) => setSmartPlans((prev) => ({ ...prev, [item.key]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-red-300 bg-white text-xs"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-blue-600" />
            평가 종료 후 14일 이내 요약본·참여자·강점/결함·SMART 액션플랜을 전 직원에게 공개하십시오 (11.3절).
          </div>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            거울 자체평가 저장 및 SMS 대시보드 반영
          </button>
        </div>
      </div>
    </div>
  );
}
