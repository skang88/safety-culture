"use client";

import React, { useEffect, useState } from "react";
import {
  Award,
  Calendar,
  CheckSquare,
  Printer,
  Sparkles,
  AlertCircle,
  Compass,
  ArrowRight,
  Layers
} from "lucide-react";
import { fetchConsultingReport } from "@/lib/api";
import TextbookSourceBadge from "./TextbookSourceBadge";
import type { PillarScore } from "@/lib/types/assessment";

interface ConsultingViewProps {
  session?: any;
  completedChecklistModules?: Record<string, any>;
  onNavigate?: (tab: string) => void;
}

interface DeepEvidenceStats {
  riskCount: number;
  magerCount: number;
  mirrorAvg: string | null;
  mirrorDefects: number;
  abssCount: number;
  jhaCount: number;
  dmaicCount: number;
  curationCount: number;
  ipoCount: number;
}

export default function ConsultingView({
  session,
  completedChecklistModules = {},
  onNavigate,
}: ConsultingViewProps) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [evidence, setEvidence] = useState<DeepEvidenceStats>({
    riskCount: 0,
    magerCount: 0,
    mirrorAvg: null,
    mirrorDefects: 0,
    abssCount: 0,
    jhaCount: 0,
    dmaicCount: 0,
    curationCount: 0,
    ipoCount: 0,
  });

  useEffect(() => {
    async function load() {
      const data = await fetchConsultingReport();
      setReport(data);
      setLoading(false);
    }
    load();

    // Phase 1, 2, 3 심층 워크플로우 localStorage 증적 안전 집계
    try {
      const rawRisk = localStorage.getItem("safepulse_risk_records");
      const rawMager = localStorage.getItem("safepulse_mager_logs");
      const rawMirror = localStorage.getItem("safepulse_sms_mirror");
      const rawAbss = localStorage.getItem("safepulse_abss_logs");
      const rawJha = localStorage.getItem("safepulse_jha_records");
      const rawDmaic = localStorage.getItem("safepulse_dmaic_items");
      const rawCuration = localStorage.getItem("safepulse_curation_docs");
      const rawIpo = localStorage.getItem("safepulse_ipo_hub");

      const riskRecords = rawRisk ? JSON.parse(rawRisk) : [];
      const magerLogs = rawMager ? JSON.parse(rawMager) : [];
      const mirrorData = rawMirror ? JSON.parse(rawMirror) : null;
      const abssData = rawAbss ? JSON.parse(rawAbss) : null;
      const jhaRecords = rawJha ? JSON.parse(rawJha) : [];
      const dmaicItems = rawDmaic ? JSON.parse(rawDmaic) : [];
      const curationDocs = rawCuration ? JSON.parse(rawCuration) : [];
      const ipoData = rawIpo ? JSON.parse(rawIpo) : null;

      let mirrorAvg: string | null = null;
      let mirrorDefects = 0;
      if (mirrorData && Array.isArray(mirrorData.scores) && mirrorData.scores.length > 0) {
        const vals = mirrorData.scores
          .map((s: any) => Number(s.score))
          .filter((n: number) => !Number.isNaN(n));
        if (vals.length > 0) {
          mirrorAvg = (vals.reduce((a: number, b: number) => a + b, 0) / vals.length).toFixed(2);
          mirrorDefects = vals.filter((n: number) => n <= 1).length;
        }
      } else if (mirrorData && typeof mirrorData === "object" && !Array.isArray(mirrorData)) {
        const vals = Object.values(mirrorData)
          .map((item: any) => (typeof item === "number" ? item : Number(item?.score)))
          .filter((n: number) => !Number.isNaN(n));
        if (vals.length > 0) {
          mirrorAvg = (vals.reduce((a: number, b: number) => a + b, 0) / vals.length).toFixed(2);
          mirrorDefects = vals.filter((n: number) => n <= 1).length;
        }
      }

      const abssCount = Array.isArray(abssData)
        ? abssData.length
        : Array.isArray(abssData?.logs)
        ? abssData.logs.length
        : 0;

      const ipoCount = Array.isArray(ipoData?.contents) ? ipoData.contents.length : 0;

      setEvidence({
        riskCount: Array.isArray(riskRecords) ? riskRecords.length : 0,
        magerCount: Array.isArray(magerLogs) ? magerLogs.length : 0,
        mirrorAvg,
        mirrorDefects,
        abssCount,
        jhaCount: Array.isArray(jhaRecords) ? jhaRecords.length : 0,
        dmaicCount: Array.isArray(dmaicItems) ? dmaicItems.length : 0,
        curationCount: Array.isArray(curationDocs) ? curationDocs.length : 0,
        ipoCount,
      });
    } catch {
      // localStorage 접근/파싱 실패 시 기본 0 유지
    }
  }, []);

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const liveResult = session?.assessment_result || session?.result || null;
  const livePillars: PillarScore[] =
    liveResult && Array.isArray(liveResult.pillar_scores) ? liveResult.pillar_scores : [];
  const weakestPillars = [...livePillars].sort((a, b) => a.score - b.score).slice(0, 3);
  const displayOrgName = session?.company?.company_name || report.organization_name;
  const displayIndex =
    liveResult && typeof liveResult.overall_index === "number"
      ? liveResult.overall_index
      : report.overall_safety_index;
  const completedChecklists = Object.keys(completedChecklistModules).length;

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      <TextbookSourceBadge
        chapter="Ch 1~16 통합 컨설팅 · Ch 7 (공정 결과관리) · Ch 14 (SMART 액션플랜)"
        title="맞춤형 안전문화 진단보고서 & 30-90-180일 처방 로드맵"
        law="중처법 시행령 제4조"
      />

      {/* 액션 버튼 및 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Comprehensive Consulting Report
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            {displayOrgName} 맞춤형 안전문화 진단보고서 & 컨설팅
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Roughton, Crutchfield & Waite (2019) Safety Culture Chapters 1-16 통합 평가 및 심층 가이드 기반
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition-colors print:hidden w-fit"
        >
          <Printer className="w-4 h-4" /> 진단 보고서 출력 / PDF 저장
        </button>
      </div>

      {/* 컨설팅 진단 증적 통합 현황 */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            컨설팅 진단 증적 통합 현황 (빠른 진단 + 심층 워크플로우 실시간 연동)
          </h2>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate("assessment")}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-500 inline-flex items-center gap-1 print:hidden"
            >
              <span>빠른 진단 바로가기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            type="button"
            onClick={() => onNavigate?.("company_report")}
            className="text-left p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors"
          >
            <span className="text-[11px] font-bold text-slate-500 block">Ch 1~16 6대 축</span>
            <span className="text-lg font-black text-indigo-700 mt-0.5 block">
              {livePillars.length > 0 ? `${displayIndex}점` : "벤치마크"}
            </span>
            <span className="text-[10px] text-slate-400">
              {livePillars.length > 0 ? "실측 진단 완료" : "기본 참조치"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.("checklists")}
            className="text-left p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors"
          >
            <span className="text-[11px] font-bold text-slate-500 block">부록 8대 정밀진단</span>
            <span className="text-lg font-black text-blue-700 mt-0.5 block">{completedChecklists} / 8</span>
            <span className="text-[10px] text-slate-400">완료된 부록 모듈</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.("risk_workflow")}
            className="text-left p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-300 transition-colors"
          >
            <span className="text-[11px] font-bold text-slate-500 block">위험관리 8단계</span>
            <span className="text-lg font-black text-amber-600 mt-0.5 block">{evidence.riskCount}건</span>
            <span className="text-[10px] text-slate-400">Ch 9·10 등록 이력</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.("mager_tree")}
            className="text-left p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-colors"
          >
            <span className="text-[11px] font-bold text-slate-500 block">Mager 의사결정</span>
            <span className="text-lg font-black text-emerald-600 mt-0.5 block">{evidence.magerCount}건</span>
            <span className="text-[10px] text-slate-400">Ch 13 원인 분리</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.("sms_mirror")}
            className="text-left p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-300 transition-colors"
          >
            <span className="text-[11px] font-bold text-slate-500 block">SMS Mirror 평가</span>
            <span className="text-lg font-black text-sky-700 mt-0.5 block">
              {evidence.mirrorAvg ? `${evidence.mirrorAvg} / 3` : "미측정"}
            </span>
            <span className="text-[10px] text-slate-400">
              {evidence.mirrorAvg ? `0~1점 결함 ${evidence.mirrorDefects}건` : "Ch 14 자체평가"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.("abss_tracker")}
            className="text-left p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-colors"
          >
            <span className="text-[11px] font-bold text-slate-500 block">ABSS 교대 활동</span>
            <span className="text-lg font-black text-emerald-700 mt-0.5 block">{evidence.abssCount}건</span>
            <span className="text-[10px] text-slate-400">Ch 11 브리핑·1:1</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.("jha_hpi")}
            className="text-left p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-300 transition-colors"
          >
            <span className="text-[11px] font-bold text-slate-500 block">JHA &amp; HPI 오류전조</span>
            <span className="text-lg font-black text-amber-700 mt-0.5 block">{evidence.jhaCount}건</span>
            <span className="text-[10px] text-slate-400">Ch 12 4열 워크시트</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.("pdca_dmaic")}
            className="text-left p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors"
          >
            <span className="text-[11px] font-bold text-slate-500 block">PDCA / DMAIC 보드</span>
            <span className="text-lg font-black text-indigo-700 mt-0.5 block">{evidence.dmaicCount}건</span>
            <span className="text-[10px] text-slate-400">Ch 6 시정조치 과제</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.("knowledge_curation")}
            className="text-left p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-300 transition-colors"
          >
            <span className="text-[11px] font-bold text-slate-500 block">안전지식 7대 품질</span>
            <span className="text-lg font-black text-sky-700 mt-0.5 block">{evidence.curationCount}건</span>
            <span className="text-[10px] text-slate-400">Ch 15 보존·품질검증</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.("content_ipo")}
            className="text-left p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors"
          >
            <span className="text-[11px] font-bold text-slate-500 block">콘텐츠 IPO·출처</span>
            <span className="text-lg font-black text-indigo-700 mt-0.5 block">{evidence.ipoCount}건</span>
            <span className="text-[10px] text-slate-400">Ch 16 인용 게이트</span>
          </button>
        </div>
      </div>

      {/* 종합 성숙도 평가 진단 카드 */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-7 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              안전문화 성숙도 평가 결과 (Ch 1~16 통합)
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-2">
              {report.overall_maturity_level}
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {livePillars.length > 0 ? (
                <>
                  <strong>{displayOrgName}</strong>의 6대 안전문화 축 종합 지수는{" "}
                  <strong className="text-blue-300">{displayIndex}점</strong>이며, 취약 영역(
                  {weakestPillars.map((p) => `${p.short_name} ${p.score_100}점`).join(", ")})을 중심으로 교재 심층 가이드 처방이 연결되어 있습니다.
                </>
              ) : (
                <>
                  조직의 RAA 삼원조 균형 지수는 <strong>{report.raa_diagnosis.balance_index}점</strong>이며,
                  권한 결여형 극복과 함께 Ch 9·10 위험관리 루프, Ch 13 Mager 교육 원인 분리, Ch 14 SMS 자체평가 내재화가 핵심 전략 과제입니다.
                </>
              )}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center shrink-0 min-w-[160px]">
            <span className="text-xs font-medium text-slate-300 block">종합 안전문화 지수</span>
            <span className="text-4xl font-black text-blue-400 mt-1 block">{displayIndex}</span>
            <span className="text-[11px] text-slate-300">100점 만점 환산</span>
          </div>
        </div>
      </div>

      {/* 실측 취약 영역 우선 컨설팅 처방 (Ch 1~16) */}
      {weakestPillars.length > 0 && (
        <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-indigo-950 flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-600" />
                취약 영역 우선 컨설팅 처방 (Ch 1~16 실측 결과 연동)
              </h2>
              <p className="text-xs text-indigo-800/80 mt-0.5">
                회사 맞춤진단(Wizard)에서 점수가 낮게 나타난 상위 3개 영역에 대한 교재 기반 실행 처방입니다.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {weakestPillars.map((p, idx) => (
              <div
                key={p.id}
                className="bg-white rounded-xl p-4 border border-indigo-100 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      취약 #{idx + 1} · {p.chapters}
                    </span>
                    <span className="text-xs font-black text-slate-900">{p.score_100}점</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{p.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{p.consulting_guide}</p>
                </div>

                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate(p.recommended_tab)}
                    className="w-full inline-flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors print:hidden"
                  >
                    <span className="truncate">{p.recommended_label}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
              {report.consequence_framework["긍정적 결과관리 (Positive Reinforcement)"].map(
                (item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* 시정 피드백 체계 */}
          <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-rose-600" /> 시정 및 교정적 피드백 (Constructive Consequences)
            </h3>
            <ul className="space-y-2 text-xs text-rose-900">
              {report.consequence_framework["시정 및 교정적 피드백 (Constructive Consequences)"].map(
                (item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckSquare className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                )
              )}
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
                <span className="text-[11px] font-semibold text-slate-500">{m.target_chapter}</span>
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
