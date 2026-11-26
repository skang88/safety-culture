"use client";

import React, { useEffect, useState } from "react";
import {
  Layers,
  ShieldAlert,
  Users,
  AlertTriangle,
  ShieldCheck,
  GraduationCap,
  Activity,
  ArrowRight,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";
import TextbookSourceBadge from "./TextbookSourceBadge";

interface SMSCoreDashboardViewProps {
  onNavigate: (tab: string) => void;
  session?: any;
  completedChecklistModules?: Record<string, any>;
}

interface CoreElementState {
  id: string;
  order: number;
  nameKo: string;
  nameEn: string;
  chapterRef: string;
  lawRef: string;
  kpiLabel: string;
  targetTab: string;
  targetTabLabel: string;
  score: number;
  statusNote: string;
}

export default function SMSCoreDashboardView({
  onNavigate,
  session,
  completedChecklistModules = {},
}: SMSCoreDashboardViewProps) {
  const [mounted, setMounted] = useState(false);
  const [riskRecords, setRiskRecords] = useState<any[]>([]);
  const [magerLogs, setMagerLogs] = useState<any[]>([]);
  const [mirrorData, setMirrorData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const rRaw = localStorage.getItem("safepulse_risk_records");
      if (rRaw) setRiskRecords(JSON.parse(rRaw));
    } catch {}
    try {
      const mRaw = localStorage.getItem("safepulse_mager_logs");
      if (mRaw) setMagerLogs(JSON.parse(mRaw));
    } catch {}
    try {
      const sRaw = localStorage.getItem("safepulse_sms_mirror");
      if (sRaw) setMirrorData(JSON.parse(sRaw));
    } catch {}
  }, []);

  // 기존 진단/체크리스트 및 Phase 1 신규 저장 데이터에서 6대 요소 성숙도(0~100) 산출
  const raa = session?.results?.raa_scores || session?.result?.raa_scores;
  const leadershipScore = raa
    ? Math.round(((raa.responsibility + raa.authority + raa.accountability) / 3) * 20)
    : completedChecklistModules["APP_7_2_LEADERSHIP"]
    ? Math.round(completedChecklistModules["APP_7_2_LEADERSHIP"].avgScore * 20)
    : mirrorData?.scores?.leadership !== undefined
    ? Math.round((mirrorData.scores.leadership / 3) * 100)
    : 0;

  const involvementScore = completedChecklistModules["APP_8_1_COMMITTEE"]
    ? Math.round(completedChecklistModules["APP_8_1_COMMITTEE"].avgScore * 20)
    : completedChecklistModules["APP_7_5_EMPLOYEE"]
    ? Math.round(completedChecklistModules["APP_7_5_EMPLOYEE"].avgScore * 20)
    : mirrorData?.scores?.involvement !== undefined
    ? Math.round((mirrorData.scores.involvement / 3) * 100)
    : 0;

  const hazardIdScore =
    riskRecords.length > 0
      ? Math.min(100, 60 + riskRecords.length * 10)
      : completedChecklistModules["CH_9_12_RISK_PERCEPTION"]
      ? Math.round(completedChecklistModules["CH_9_12_RISK_PERCEPTION"].avgScore * 20)
      : mirrorData?.scores?.hazard_id !== undefined
      ? Math.round((mirrorData.scores.hazard_id / 3) * 100)
      : 0;

  const acceptableRiskCount = riskRecords.filter((r) => r.residualAcceptable).length;
  const controlScore =
    riskRecords.length > 0
      ? Math.round((acceptableRiskCount / riskRecords.length) * 100)
      : mirrorData?.scores?.control !== undefined
      ? Math.round((mirrorData.scores.control / 3) * 100)
      : 0;

  const trainingScore =
    magerLogs.length > 0
      ? Math.min(100, 65 + magerLogs.length * 10)
      : mirrorData?.scores?.training !== undefined
      ? Math.round((mirrorData.scores.training / 3) * 100)
      : 0;

  const evalScore =
    mirrorData?.scores?.evaluation !== undefined
      ? Math.round((mirrorData.scores.evaluation / 3) * 100)
      : mirrorData
      ? Math.round((mirrorData.avgScale / 3) * 100)
      : 0;

  // Ch 5 & Ch 14 TABLE 14.1 Six Basic Core Principles (원문 6대 요소 임의 병합/생략 금지)
  const coreElements: CoreElementState[] = [
    {
      id: "leadership",
      order: 1,
      nameKo: "경영 리더십",
      nameEn: "Management leadership",
      chapterRef: "Ch 5 · Ch 7 (FIG. 7.1) · Ch 14 (TABLE 14.1)",
      lawRef: "산안법 제14조·제15조 / 중처법 제4조",
      kpiLabel: "RAA 권한 위임 및 자원 배정 적격률",
      targetTab: "assessment",
      targetTabLabel: "RAA·리더십 진단",
      score: leadershipScore,
      statusNote: leadershipScore > 0 ? "진단 데이터 연동됨" : "진단 대기 중",
    },
    {
      id: "involvement",
      order: 2,
      nameKo: "근로자 참여",
      nameEn: "Employee involvement",
      chapterRef: "Ch 5 · Ch 8 (FIG. 8.1/8.3) · Ch 14 (TABLE 14.1)",
      lawRef: "산안법 제24조 / 중처법 시행령 제4조제8호",
      kpiLabel: "안전위원회·현장 의견청취 반영률",
      targetTab: "checklists",
      targetTabLabel: "부록 8대 정밀진단",
      score: involvementScore,
      statusNote: involvementScore > 0 ? "체크리스트/거울평가 반영" : "진단 대기 중",
    },
    {
      id: "hazard_id",
      order: 3,
      nameKo: "위험 및 유해성 식별과 평가",
      nameEn: "Risk and hazard identification and assessment",
      chapterRef: "Ch 5 · Ch 9 (FIG. 9.2) · Ch 10 (FIG. 10.2)",
      lawRef: "산안법 제36조 / 중처법 시행령 제4조제3호",
      kpiLabel: "8단계 위험성평가 완료 및 지각 갭 관리율",
      targetTab: "risk_workflow",
      targetTabLabel: "위험관리 8단계 실행",
      score: hazardIdScore,
      statusNote: riskRecords.length > 0 ? `평가 ${riskRecords.length}건 기록됨` : "8단계 평가 미등록",
    },
    {
      id: "control",
      order: 4,
      nameKo: "유해위험요인 예방 및 통제",
      nameEn: "Hazard prevention and control",
      chapterRef: "Ch 5 · Ch 10 (FIG. 10.1 잔여위험) · Ch 14 (TABLE 14.1)",
      lawRef: "산안법 제36조·제52조 / 안전보건규칙",
      kpiLabel: "통제 위계 상위 대책 적용 및 잔여위험 허용률",
      targetTab: "risk_workflow",
      targetTabLabel: "통제 위계·잔여위험 관리",
      score: controlScore,
      statusNote:
        riskRecords.length > 0
          ? `허용 기준 충족 ${acceptableRiskCount}/${riskRecords.length}건`
          : "통제 대책 미등록",
    },
    {
      id: "training",
      order: 5,
      nameKo: "정보 및 교육훈련",
      nameEn: "Information and training",
      chapterRef: "Ch 5 · Ch 13 (FIG. 13.1/13.2 Mager 트리)",
      lawRef: "산안법 제29조 / 중처법 시행령 제4조제5호",
      kpiLabel: "비훈련 원인 분리율 및 실습(Hands-on) 비중",
      targetTab: "mager_tree",
      targetTabLabel: "Mager 교육 판별기",
      score: trainingScore,
      statusNote: magerLogs.length > 0 ? `판별 사례 ${magerLogs.length}건 분석됨` : "판별 이력 없음",
    },
    {
      id: "evaluation",
      order: 6,
      nameKo: "프로그램 실효성 평가",
      nameEn: "Evaluation of program effectiveness",
      chapterRef: "Ch 5 (FIG. 5.4) · Ch 14 (FIG. 14.1·14.3·App 14.1)",
      lawRef: "산안법 제14조·제36조 / 중처법 시행령 제4조",
      kpiLabel: "OSHA SHARP 0~3점 평정 및 결함 종결률",
      targetTab: "sms_mirror",
      targetTabLabel: "거울 자체평가(0~3점)",
      score: evalScore,
      statusNote: mirrorData ? `최근 평균 ${mirrorData.avgScale}/3.0점` : "거울 평가 미실시",
    },
  ];

  const avgMaturity = Math.round(
    coreElements.reduce((acc, el) => acc + el.score, 0) / coreElements.length
  );

  const radarData = coreElements.map((el) => ({
    subject: `${el.order}. ${el.nameKo}`,
    score: el.score,
    fullMark: 100,
  }));

  const iconList = [Layers, Users, AlertTriangle, ShieldCheck, GraduationCap, Activity];

  return (
    <div className="space-y-6 pb-16">
      <TextbookSourceBadge
        chapter="Ch 5 (FIG. 5.3·5.4) & Ch 14 (TABLE 14.1·FIG. 14.2)"
        title="안전경영시스템(SMS) 6대 핵심 원칙 통합 구조"
        kpi="6대 핵심 요소 균형 성숙도 지수"
        law="산안법 제14·15·24·29·36조 / 중처법 시행령 제4조"
      />

      {/* 상단 요약 배너 */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5" />
              Ch 5 KEYSTONE & Ch 14 TABLE 14.1 원문 6대 요소 그대로 구현
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              SMS 6대 핵심 요소 통합 진단 대시보드
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              교재 제5장(FIG. 5.3)과 제14장(TABLE 14.1, FIG. 14.2)에 정의된 6가지 핵심 원칙을 임의로 축소하거나
              병합하지 않고 독립 모듈로 추적합니다. 각 카드를 통해 위험관리 8단계(Ch 10), Mager 교육 판별(Ch 13),
              거울 자체평가(Ch 14) 데이터를 실시간 통합합니다.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 min-w-[210px] text-center">
            <div className="text-xs font-semibold text-blue-200">SMS 6대 요소 통합 지수</div>
            <div className="text-4xl font-black text-white mt-1">{avgMaturity}점</div>
            <div className="text-[11px] text-slate-300 mt-1">
              완료 활성 요소 {coreElements.filter((e) => e.score > 0).length} / 6
            </div>
          </div>
        </div>
      </div>

      {/* 레이더 차트 + 요약 안내 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-sm font-extrabold text-slate-900 mb-1">
            6대 핵심 원칙 균형 레이더 (FIG. 14.2)
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            어느 한 요소라도 쐐기돌(Keystone, FIG. 5.1~5.2)이 약화되면 전체 SMS 아치가 붕괴됩니다.
          </p>
          <div className="h-[290px] w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#334155", fontSize: 11, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <Radar
                    name="성숙도(%)"
                    dataKey="score"
                    stroke="#2563eb"
                    fill="#3b82f6"
                    fillOpacity={0.35}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 6대 요소 카드 그리드 */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {coreElements.map((el, idx) => {
            const Icon = iconList[idx];
            const isActive = el.score > 0;
            return (
              <div
                key={el.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase">
                          원칙 {el.order} · {el.nameEn}
                        </span>
                        <h3 className="text-sm font-extrabold text-slate-900">{el.nameKo}</h3>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-black px-2 py-0.5 rounded-lg ${
                        el.score >= 70
                          ? "bg-emerald-50 text-emerald-700"
                          : el.score > 0
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {el.score}점
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-[11px] text-slate-600">
                    <div>
                      <span className="font-bold text-slate-700">출처:</span> {el.chapterRef}
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">법령:</span> {el.lawRef}
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">KPI:</span> {el.kpiLabel}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    {isActive ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    {el.statusNote}
                  </span>
                  <button
                    onClick={() => onNavigate(el.targetTab)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    {el.targetTabLabel} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
