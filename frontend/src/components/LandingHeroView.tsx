"use client";

import React from "react";
import {
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Factory,
  HardHat,
  Flame,
  Truck,
  ShieldCheck,
  Building2,
  TrendingUp,
  FileBarChart,
  Lock
} from "lucide-react";

interface LandingHeroViewProps {
  onStartRegister: () => void;
  onStartLogin: () => void;
}

export default function LandingHeroView({ onStartRegister, onStartLogin }: LandingHeroViewProps) {
  const industries = [
    { name: "제조업", score: "75.3점", hazard: "끼임·협착 / LOTO", icon: Factory },
    { name: "건설업", score: "71.4점", hazard: "고소작업 추락 / 붕괴", icon: HardHat },
    { name: "화학·에너지", score: "81.2점", hazard: "누출 / 화재폭발 / PSM", icon: Flame },
    { name: "운송·물류", score: "73.0점", hazard: "지게차 충돌 / 과로", icon: Truck },
    { name: "공공·소방", score: "78.5점", hazard: "재난대응 / 수평소통", icon: ShieldCheck },
    { name: "서비스·기타", score: "74.0점", hazard: "전도 / 일상안전", icon: Building2 },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* 1. 메인 히어로 섹션 */}
      <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden text-center max-w-5xl mx-auto">
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            Roughton, Crutchfield & Waite (2019) Safety Culture Model
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            우리 회사의 안전문화는 <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              얼마나 건강하게 정착
            </span>
            되어 있습니까?
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            가짜 통계나 형식적 서류를 넘어, <strong>책임-권한-책무성(RAA) 삼원조</strong>와
            <strong>업종별 맞춤형 위험 지각</strong>을 스스로 점검하고 공정한 결과관리 처방전을 받아보세요.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onStartRegister}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <span>10분 무료 자가진단 시작하기</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onStartLogin}
              className="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl transition-all border border-white/20 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>기존 계정으로 로그인</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 pt-2">
            ✓ 신용카드 불필요 · 30초 간편 가입 · 즉시 맞춤형 진단 리포트 도출
          </p>
        </div>
      </div>

      {/* 2. 3단계 초간편 진단 프로세스 */}
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">How It Works</span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">간편한 3단계 자가진단 프로세스</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 font-black text-sm flex items-center justify-center">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900">간편 등록 & 업종 선택</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              회사명과 담당자 정보만 최소한으로 입력하고, 제조업/건설업/화학/소방 등 6대 산업 분야 중 소속 업종을 선택합니다.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 font-black text-sm flex items-center justify-center">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900">모바일 반응형 10분 진단</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              상단 진행률 바를 확인하며 대형 터치 카드로 1~5점 척도를 체크합니다. 바쁜 현장을 위해 언제든 중간 임시저장이 지원됩니다.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 font-black text-sm flex items-center justify-center">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900">맞춤형 리포트 & 로드맵 수령</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              동종 업계 벤치마크 대비 우리 회사의 성숙도 점수, RAA 레이더 차트, 3단계 개선 처방전을 즉시 PDF로 출력합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 3. 6대 업종별 벤치마크 미리보기 */}
      <div className="max-w-5xl mx-auto bg-slate-100/70 rounded-3xl p-8 border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">업종별 안전문화 벤치마크 기준선</h3>
            <p className="text-xs text-slate-500">진단 완료 시 우리 회사 점수와 업계 평균이 정밀 비교됩니다.</p>
          </div>
          <button
            onClick={onStartRegister}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            우리 회사 점수 측정하기 <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {industries.map((ind, idx) => {
            const Icon = ind.icon;
            return (
              <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                <Icon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <span className="text-xs font-bold text-slate-800 block">{ind.name}</span>
                <span className="text-sm font-extrabold text-blue-600 block mt-0.5">{ind.score}</span>
                <span className="text-[10px] text-slate-400 block mt-1 line-clamp-1">{ind.hazard}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
