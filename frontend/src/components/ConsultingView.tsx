"use client";

import React, { useEffect, useState } from "react";
import { FileText, Award, Calendar, CheckSquare, Printer, Sparkles, AlertCircle } from "lucide-react";
import { fetchConsultingReport } from "@/lib/api";

export default function ConsultingView() {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const data = await fetchConsultingReport();
      setReport(data);
    }
    load();
  }, []);

  if (!report) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* 액션 버튼 및 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Comprehensive Consulting Report
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            {report.organization_name} 맞춤형 안전문화 진단보고서
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Roughton, Crutchfield & Waite (2019) Safety Culture Chapters 1-9 통합 평가 기반
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition-colors print:hidden"
        >
          <Printer className="w-4 h-4" /> 진단 보고서 출력 / PDF 저장
        </button>
      </div>

      {/* 종합 성숙도 평가 진단 카드 */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-7 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              안전문화 성숙도 평가 결과
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-2">
              {report.overall_maturity_level}
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              조직의 RAA 삼원조 균형 지수는 <strong>{report.raa_diagnosis.balance_index}점</strong>이며,
              권한 결여형 병리 상태를 조기에 극복하고 리더의 비전 제시 역량을 강화하는 것이 핵심 전략 과제입니다.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center shrink-0 min-w-[160px]">
            <span className="text-xs font-medium text-slate-300 block">종합 안전문화 지수</span>
            <span className="text-4xl font-black text-blue-400 mt-1 block">
              {report.overall_safety_index}
            </span>
            <span className="text-[11px] text-slate-300">100점 만점 환산</span>
          </div>
        </div>
      </div>

      {/* Chapter 7 결과관리(Consequence Management) 프레임워크 */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Chapter 7 결과관리(Consequence Management) 체계 설계
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              책무성과 규정 준수를 고착화하기 위한 긍정적 보상(Positive)과 공정한 시정 피드백(Constructive)의 조화
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* 긍정적 결과관리 */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-600" /> 긍정적 결과관리 (Positive Reinforcement)
            </h3>
            <ul className="space-y-2 text-xs text-emerald-900">
              {report.consequence_framework["긍정적 결과관리 (Positive Reinforcement)"].map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 시정 피드백 체계 */}
          <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-rose-600" /> 시정 및 교정적 피드백 (Constructive Consequences)
            </h3>
            <ul className="space-y-2 text-xs text-rose-900">
              {report.consequence_framework["시정 및 교정적 피드백 (Constructive Consequences)"].map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckSquare className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 3단계 안전문화 혁신 로드맵 */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            단계별 안전문화 혁신 실행 로드맵 (Action Roadmap)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            단기 신속 성과 창출부터 전사 프로세스 정착 및 문화 내재화까지 3단계 실행 전략
          </p>
        </div>

        <div className="space-y-4 pt-2">
          {report.roadmap.map((m: any, idx: number) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3">
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-100 text-blue-800 inline-block w-fit">
                  {m.phase}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {m.target_chapter}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">{m.title}</h3>

              <div className="space-y-1.5">
                {m.action_items.map((act: string, aIdx: number) => (
                  <div key={aIdx} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="text-blue-600 font-bold shrink-0">·</span>
                    <span className="leading-relaxed">{act}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
