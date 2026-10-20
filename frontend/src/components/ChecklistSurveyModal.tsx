"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Save,
  ShieldCheck,
  Send,
  HelpCircle,
  Sparkles
} from "lucide-react";
import { submitChecklistStatus } from "@/lib/api";

interface ChecklistSurveyModalProps {
  isOpen: boolean;
  group: any;
  onClose: () => void;
  onComplete: (groupId: string, result: any) => void;
  initialAnswers?: Record<string, number>;
}

export default function ChecklistSurveyModal({
  isOpen,
  group,
  onClose,
  onComplete,
  initialAnswers = {},
}: ChecklistSurveyModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [saveToast, setSaveToast] = useState("");

  const items = group?.items || [];
  const total = items.length;

  // 그룹 변경이나 모달 열림 시 인덱스 및 답변 초기화
  useEffect(() => {
    if (group && isOpen && total > 0) {
      setCurrentIndex(0);
      const seed: Record<string, number> = {};
      items.forEach((it: any) => {
        // 사용자가 이미 직접 진단한 기록이 있을 때만 복원하고, 신규 진단 시 기본값 0(미선택)
        if (initialAnswers && typeof initialAnswers[it.id] === "number" && initialAnswers[it.id] > 0) {
          seed[it.id] = initialAnswers[it.id];
        } else {
          seed[it.id] = 0; // 신규 진단 시 디폴트 선택 없음 (완전 백지 상태에서 시작)
        }
      });
      setAnswers(seed);
    }
  }, [group?.group_id, isOpen]);

  // 방어 코드: 모달이 닫혀있거나 group 또는 items가 없으면 안전하게 null 리턴
  if (!isOpen || !group || total === 0) {
    return null;
  }

  // 안전 인덱스 계산 (인덱스 범위 초과 방어)
  const safeIndex = Math.min(Math.max(0, currentIndex), Math.max(0, total - 1));
  const currentItem = items[safeIndex] || items[0];

  if (!currentItem) {
    return null;
  }

  const selectedScore = (currentItem.id && answers[currentItem.id]) || 0;

  // 전체 진행률 계산
  const answeredCount = Object.values(answers).filter((v) => v > 0).length;
  const progressPct = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  const scoreOptions = [
    { score: 1, label: "전혀 미흡", desc: "규정/절차가 전무하거나 실천되지 않음", color: "hover:border-rose-400 active:bg-rose-50" },
    { score: 2, label: "미흡", desc: "일부 문서만 존재하며 현장 실행 결여", color: "hover:border-amber-400 active:bg-amber-50" },
    { score: 3, label: "보통 / 부분 이행", desc: "기본 요건 충족하나 체계적 피드백 부족", color: "hover:border-blue-400 active:bg-blue-50" },
    { score: 4, label: "우수", desc: "정기 모니터링 및 역할 책임이 명확함", color: "hover:border-indigo-400 active:bg-indigo-50" },
    { score: 5, label: "탁월 (완전 준수)", desc: "업계 최우수 관리 관행(BMP) 및 자발적 실천", color: "hover:border-emerald-500 active:bg-emerald-50" },
  ];

  const handleSelectScore = (score: number) => {
    if (!currentItem?.id) return;
    setAnswers((prev) => ({ ...prev, [currentItem.id]: score }));
    // 다음 문항으로 자동 전환
    if (safeIndex < total - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 180);
    }
  };

  const handleSaveDraft = () => {
    if (group?.group_id) {
      localStorage.setItem(`safepulse_chk_draft_${group.group_id}`, JSON.stringify(answers));
      setSaveToast("임시 저장되었습니다.");
      setTimeout(() => setSaveToast(""), 2000);
    }
  };

  const handleFinish = async () => {
    // 미선택 문항이 남아있는지 검사
    const unselectedIdx = items.findIndex((it: any) => !answers[it.id] || answers[it.id] === 0);
    if (unselectedIdx !== -1) {
      alert(`아직 선택하지 않은 문항이 있습니다. (${unselectedIdx + 1}번 문항으로 이동합니다)`);
      setCurrentIndex(unselectedIdx);
      return;
    }

    setSubmitting(true);
    let totalScore = 0;
    const itemStatuses: Record<string, string> = {};

    items.forEach((it: any) => {
      const score = answers[it.id] || 3;
      totalScore += score;
      if (score >= 4) itemStatuses[it.id] = "compliant";
      else if (score >= 3) itemStatuses[it.id] = "partial";
      else itemStatuses[it.id] = "non_compliant";
    });

    const avgScore = Math.round((totalScore / total) * 10) / 10;
    const complianceRate = Math.round((avgScore / 5.0) * 1000) / 10;

    let level = "Level 3: 시스템 구축 단계";
    if (avgScore >= 4.5) level = "Level 5: 예측적·지속개선 단계";
    else if (avgScore >= 3.8) level = "Level 4: 능동적 참여 단계";
    else if (avgScore >= 2.5) level = "Level 2: 반응적 대응 단계";
    else level = "Level 1: 병리적·형식주의 단계";

    const result = {
      groupId: group.group_id,
      title: group.title,
      avgScore,
      complianceRate,
      level,
      answeredCount: total,
      completedAt: new Date().toISOString(),
      itemStatuses,
      answers,
    };

    try {
      await submitChecklistStatus({
        group_id: group.group_id,
        evaluator_name: "자가진단관",
        department: "전사",
        item_statuses: itemStatuses,
      });
    } catch (e) {
      console.warn("Status submit fallback:", e);
    }

    setSubmitting(false);
    onComplete(group.group_id, result);
    onClose();
  };

  const itemText = currentItem?.text || currentItem?.title || "점검 항목";
  const itemCriterion = currentItem?.criterion || currentItem?.evidence_criteria;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] relative my-auto">
        {/* 모달 상단 헤더 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
              {group.source_chapter || "부록 진단"}
            </span>
            <span className="text-xs font-bold text-slate-700 truncate max-w-[220px] sm:max-w-xs">
              {group.title}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 진행률 상단 바 */}
        <div className="pt-3 pb-2">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-bold text-slate-600">
              진행 현황: <strong className="text-blue-600">문항 {safeIndex + 1}</strong> / {total}
            </span>
            <span className="font-extrabold text-blue-600">{progressPct}% 완료</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* 문항 본문 (스크롤 지원) */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                {safeIndex + 1}
              </span>
              <span className="text-[11px] font-bold text-slate-500 uppercase">
                {currentItem.id} 점검 항목
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
              {itemText}
            </h3>

            {itemCriterion && (
              <div className="mt-3 p-2.5 rounded-xl bg-blue-50/80 border border-blue-100 text-xs text-blue-900 leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-blue-950 font-bold mb-0.5">판단 및 검증 기준:</strong>
                  <span>{itemCriterion}</span>
                </div>
              </div>
            )}
          </div>

          {/* 1~5점 척도 대형 터치 카드 리스트 */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-600 px-1">
              현재 우리 조직의 실행 수준을 선택해 주세요:
            </p>

            <div className="grid grid-cols-1 gap-2">
              {scoreOptions.map((opt) => {
                const isSelected = selectedScore === opt.score;
                return (
                  <button
                    key={opt.score}
                    type="button"
                    onClick={() => handleSelectScore(opt.score)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20"
                        : `border-slate-200 bg-white ${opt.color}`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {opt.score}
                      </div>
                      <div>
                        <span
                          className={`text-xs font-bold block ${
                            isSelected ? "text-blue-900" : "text-slate-800"
                          }`}
                        >
                          {opt.label}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {opt.desc}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 모달 하단 버튼 툴바 */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safeIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> 이전
            </button>

            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-1"
            >
              <Save className="w-3.5 h-3.5" /> 임시저장
            </button>
            {saveToast && (
              <span className="text-[11px] font-bold text-emerald-600 animate-pulse">
                {saveToast}
              </span>
            )}
          </div>

          <div>
            {safeIndex < total - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(total - 1, prev + 1))}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <span>다음 문항</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleFinish}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? "분석 제출 중..." : "진단 완료 및 분석"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
