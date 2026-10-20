"use client";

import React, { useState, useEffect } from "react";
import { Building2, Factory, HardHat, Flame, Truck, ShieldAlert, Sparkles, ArrowRight } from "lucide-react";
import { startCompanySession } from "@/lib/api";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionStarted: (sessionData: any) => void;
  defaultCompanyName?: string;
  defaultEvaluatorName?: string;
}

export default function OnboardingModal({
  isOpen,
  onClose,
  onSessionStarted,
  defaultCompanyName = "",
  defaultEvaluatorName = "",
}: OnboardingModalProps) {
  const [companyName, setCompanyName] = useState(defaultCompanyName);
  const [industry, setIndustry] = useState("manufacturing");
  const [companySize, setCompanySize] = useState("medium");
  const [evaluatorName, setEvaluatorName] = useState(defaultEvaluatorName);
  const [evaluatorRole, setEvaluatorRole] = useState("manager");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (defaultCompanyName) setCompanyName(defaultCompanyName);
    if (defaultEvaluatorName) setEvaluatorName(defaultEvaluatorName);
  }, [defaultCompanyName, defaultEvaluatorName]);

  if (!isOpen) return null;

  const industries = [
    { id: "manufacturing", name: "제조업", desc: "기계·설비 끼임/LOTO 중점", icon: Factory },
    { id: "construction", name: "건설업", desc: "고소작업 추락/가설물 붕괴 중점", icon: HardHat },
    { id: "chemical", name: "화학·에너지", desc: "유독물 누출/화재폭발/PSM 중점", icon: Flame },
    { id: "logistics", name: "운송·물류", desc: "지게차 충돌/중량물 과로 중점", icon: Truck },
    { id: "public_safety", name: "공공·소방", desc: "비상지휘/현장출동/PTSD 중점", icon: ShieldAlert },
    { id: "service_other", name: "서비스·기타", desc: "전도·낙상/감정노동/일상안전", icon: Building2 },
  ];

  const sizes = [
    { id: "small", label: "50인 미만 (중소)" },
    { id: "medium", label: "50~299인 (중견)" },
    { id: "large", label: "300인 이상 (대기업)" },
    { id: "public", label: "공공기관 / 지자체" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      alert("회사명을 입력해 주세요.");
      return;
    }

    setLoading(true);
    const company = {
      company_name: companyName.trim(),
      industry,
      company_size: companySize,
      evaluator_name: evaluatorName.trim() || "안전관리책임자",
      evaluator_role: evaluatorRole,
    };

    const sessionData = await startCompanySession(company);
    setLoading(false);
    onSessionStarted(sessionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
        <div className="text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            우리 회사 맞춤형 안전문화 진단
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            회사 정보와 산업 분야를 선택하시면 <strong>해당 업종의 위험 특성 및 벤치마크</strong>에 맞춘
            진단 프로세스와 처방전이 자동으로 구성됩니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* 회사명 입력 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              회사명 / 사업장명 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="예: (주)한국정밀제조 평택사업장"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 산업 분야 선택 (그리드 카드) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              산업 분야 (업종) 선택 <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {industries.map((ind) => {
                const Icon = ind.icon;
                const isSelected = industry === ind.id;
                return (
                  <button
                    key={ind.id}
                    type="button"
                    onClick={() => setIndustry(ind.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${isSelected ? "text-blue-600" : "text-slate-500"}`} />
                    <div>
                      <span className={`text-xs font-bold block ${isSelected ? "text-blue-900" : "text-slate-800"}`}>
                        {ind.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1">
                        {ind.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 기업 규모 선택 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">기업 규모</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {sizes.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCompanySize(s.id)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                    companySize === s.id
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 평가자 정보 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">평가자 성명/직함</label>
              <input
                type="text"
                placeholder="예: 김안전 부장"
                value={evaluatorName}
                onChange={(e) => setEvaluatorName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">직급 구분</label>
              <select
                value={evaluatorRole}
                onChange={(e) => setEvaluatorRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="executive">경영진 / 임원 (Executive)</option>
                <option value="manager">중간관리자 / 팀장 (Manager)</option>
                <option value="worker">현장 관리감독자 / 작업자 (Worker)</option>
              </select>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>{loading ? "설정 구성 중..." : "맞춤형 진단 시작하기"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
