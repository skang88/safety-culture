"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldAlert,
  Save,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
  Info,
  Building2,
  RotateCcw
} from "lucide-react";
import { fetchAssessmentItems, saveSessionProgress, fetchSession } from "@/lib/api";

interface AssessmentWizardViewProps {
  session: any;
  onSessionUpdate: (updatedSession: any) => void;
  onComplete: () => void;
  onOpenOnboarding: () => void;
}

export default function AssessmentWizardView({
  session,
  onSessionUpdate,
  onComplete,
  onOpenOnboarding,
}: AssessmentWizardViewProps) {
  const [items, setItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [saveToast, setSaveToast] = useState("");

  useEffect(() => {
    async function load() {
      const itms = await fetchAssessmentItems();
      setItems(itms);

      // 세션에서 저장된 답변 복원
      if (session) {
        if (session.answers) {
          setAnswers(session.answers);
        }
        if (typeof session.current_step === "number" && session.current_step < itms.length) {
          setCurrentIndex(session.current_step);
        }
      }
    }
    load();
  }, [session?.session_id]);

  if (!session || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-white rounded-3xl border border-slate-200">
        <Building2 className="w-12 h-12 text-blue-600 mb-3" />
        <h3 className="text-lg font-bold text-slate-900">시작된 회사 진단 세션이 없습니다.</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          회사 정보와 산업 분야를 등록하여 우리 회사 맞춤형 안전문화 진단을 시작하세요.
        </p>
        <button
          onClick={onOpenOnboarding}
          className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow"
        >
          우리 회사 진단 시작하기
        </button>
      </div>
    );
  }

  const currentItem = items[currentIndex];
  const totalQuestions = items.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const handleScoreSelect = async (score: number) => {
    const updated = { ...answers, [currentItem.id]: score };
    setAnswers(updated);

    // 자동 진행 (마지막 문항이 아니면 0.25초 후 다음 문항으로 이동)
    if (currentIndex < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 250);
    }

    // 백그라운드 자동 임시저장
    if (session.session_id) {
      await saveSessionProgress(session.session_id, currentIndex, updated, false);
    }
  };

  const handleManualSave = async () => {
    setSaving(true);
    await saveSessionProgress(session.session_id, currentIndex, answers, false);
    setSaving(false);
    setSaveToast("진행 상황이 임시 저장되었습니다. 언제든 이어하실 수 있습니다.");
    setTimeout(() => setSaveToast(""), 3500);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleFinalSubmit = async () => {
    setSaving(true);
    const updatedSession = await saveSessionProgress(
      session.session_id,
      currentIndex,
      answers,
      true
    );
    setSaving(false);
    onSessionUpdate(updatedSession);
    onComplete();
  };

  const scoreLabels = [
    { score: 1, label: "전혀 그렇지 않다", sub: "전혀 실행되지 않음" },
    { score: 2, label: "그렇지 않은 편이다", sub: "부분적 또는 미흡" },
    { score: 3, label: "보통이다", sub: "기본 수준 준수" },
    { score: 4, label: "그런 편이다", sub: "대체로 잘 실행됨" },
    { score: 5, label: "매우 그렇다", sub: "조직 문화로 완벽 내재화" },
  ];

  return (
    <div className="max-w-3xl mx-auto pb-20 space-y-6">
      {/* 1. 상단 Sticky 진행 바 & 회사 정보 헤더 */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm sticky top-16 z-40 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* 회사 뱃지 */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-extrabold flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              {session.company.company_name}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
              | {session.company.industry.toUpperCase()}
            </span>
          </div>

          {/* 문항 진행 번호 및 임시저장 버튼 */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">
              문항 <span className="text-blue-600 text-sm font-extrabold">{currentIndex + 1}</span> / {totalQuestions}
            </span>

            <button
              onClick={handleManualSave}
              disabled={saving}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">{saving ? "저장 중..." : "중간 임시저장"}</span>
            </button>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-semibold text-slate-500">
            <span>진단 완료율 ({answeredCount}/{totalQuestions} 문항 완료)</span>
            <span className="text-blue-600 font-extrabold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* 임시저장 토스트 알림 */}
        {saveToast && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveToast}</span>
          </div>
        )}
      </div>

      {/* 2. 대형 질문 집중 카드 (Mobile-first Card) */}
      <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200 shadow-md space-y-6">
        {/* 질문 카테고리 태그 */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            {currentItem.category}
          </span>
          <span className="text-xs font-mono font-semibold text-slate-400">
            ID: {currentItem.id}
          </span>
        </div>

        {/* 핵심 질문 본문 */}
        <div className="space-y-2">
          <h2 className="text-lg sm:text-2xl font-bold text-slate-900 leading-snug tracking-tight">
            {currentItem.question}
          </h2>
          {currentItem.description && (
            <div className="flex items-start gap-2 bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-xs text-blue-900">
              <BookOpen className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>{currentItem.description}</span>
            </div>
          )}
        </div>

        {/* 모바일 최적화 터치 친화적 1~5점 척도 선택 카드 */}
        <div className="space-y-2.5 pt-2">
          {scoreLabels.map((item) => {
            const isSelected = answers[currentItem.id] === item.score;
            return (
              <button
                key={item.score}
                type="button"
                onClick={() => handleScoreSelect(item.score)}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between group active:scale-[0.99] ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-500/20"
                    : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-blue-600 text-white shadow"
                        : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                    }`}
                  >
                    {item.score}
                  </span>
                  <div>
                    <span
                      className={`text-sm font-bold block ${
                        isSelected ? "text-blue-950" : "text-slate-800"
                      }`}
                    >
                      {item.label}
                    </span>
                    <span className="text-xs text-slate-400 block mt-0.5">{item.sub}</span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? "border-blue-600 bg-blue-600" : "border-slate-300"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 하단 네비게이션 및 진단 완료 버튼 */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors ${
            currentIndex === 0
              ? "text-slate-300 cursor-not-allowed"
              : "text-slate-700 bg-white border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <ChevronLeft className="w-4 h-4" /> 이전
        </button>

        {currentIndex === totalQuestions - 1 ? (
          <button
            onClick={handleFinalSubmit}
            disabled={saving || answeredCount < 5}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm shadow-lg transition-all ${
              answeredCount >= 5
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white scale-105"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{saving ? "진단 분석 중..." : "진단 완료 및 종합 리포트 보기"}</span>
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow transition-colors"
          >
            <span>다음</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
