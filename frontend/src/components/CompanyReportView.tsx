"use client";

import React from "react";
import {
  Printer,
  RotateCcw,
  Building2,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Award,
  Calendar,
  CheckSquare,
  Sparkles,
  Scale,
  Factory
} from "lucide-react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

interface CompanyReportViewProps {
  session: any;
  onRestartAssessment: () => void;
}

export default function CompanyReportView({ session, onRestartAssessment }: CompanyReportViewProps) {
  const company = session?.company || {
    company_name: "우수안전산업",
    industry: "manufacturing",
    company_size: "medium"
  };

  const benchmark = session?.industry_benchmark || {
    label: "제조업 (Manufacturing)",
    benchmark_score: 75.3,
    key_hazards: ["끼임·협착", "오가동 LOTO", "지게차 충돌"],
    statutory_focus: "산안법 제38조 및 제36조 위험성평가",
    special_advice: "생산 압박 속에서 지름길(Shortcuts) 사용을 엄금하고 현장 권한 위임이 필요합니다."
  };

  const result = session?.result || {
    respondent_count: 1,
    raa_scores: {
      responsibility: 4.2,
      authority: 3.3,
      accountability: 3.9,
      balance_index: 78.5,
      diagnosis_status: "권한 결여형 (Authority Deficit)",
      status_description: "현장의 이행 의무는 크나, 실질적 위험 개선 권한(작업중지권 등)의 위임이 부족합니다."
    },
    leadership_scores: {
      average_score: 3.65,
      strongest_attribute: "기대치 2 (도덕적·윤리적 나침반)",
      weakest_attribute: "기대치 6 (권한 위임 및 리스크 감수)",
      item_scores: {
        "기대치 1 (비전/변화)": 3.8,
        "기대치 2 (윤리 나침반)": 4.3,
        "기대치 3 (학습/적응)": 3.7,
        "기대치 4 (위험/기회 균형)": 3.9,
        "기대치 5 (고성과 팀)": 3.6,
        "기대치 6 (권한위임/리스크)": 2.9,
        "기대치 7 (차세대 리더육성)": 3.4,
        "기대치 8 (전방위 소통)": 3.6
      }
    },
    dimension_scores: {
      perception_of_safety: 3.9,
      psychological_safety: 3.4,
      manager_vs_leader: { "관리자 성향(규정·통제)": 60.0, "리더십 성향(비전·영감)": 40.0 }
    },
    key_findings: [
      `[${company.company_name}]의 ${benchmark.label} 맞춤형 안전문화 진단 결과입니다.`,
      "책임(4.2점) 및 책무성(3.9점) 대비 권한 위임(3.3점)이 취약하여 '권한 결여형' 병리 현상이 감지됨.",
      "미 육군 FM 6-22 8대 기대치 중 '권한 위임 및 리스크 감수(2.9점)'가 가장 취약하여 권한 부여 제도화가 시급함."
    ],
    consequence_recommendations: [
      `${benchmark.label} 중점 과제: ${benchmark.special_advice}`,
      "Ch 7 권한 위임: 현장 조장 및 감독자에게 즉시 작업중지권 및 유해요인 개선 전결권 부여",
      "Ch 7 긍정적 결과관리: 선제적 유해위험요인 발굴 직원에 대한 CEO 포상 및 마일리지 제도 신설"
    ]
  };

  // 종합 안전지수 산출 (RAA 균형도 + 리더십 평점 환산)
  const companyScore = Math.round(
    result.raa_scores.balance_index * 0.4 + (result.leadership_scores.average_score / 5.0) * 100 * 0.6
  );

  // RAA Radar 차트 데이터
  const raaRadarData = [
    { subject: "책임 (Responsibility)", score: result.raa_scores.responsibility, fullMark: 5 },
    { subject: "권한 (Authority)", score: result.raa_scores.authority, fullMark: 5 },
    { subject: "책무성 (Accountability)", score: result.raa_scores.accountability, fullMark: 5 },
  ];

  // 리더십 8대 기대치 차트 데이터
  const leadershipBarData = Object.entries(result.leadership_scores.item_scores).map(([k, v]) => ({
    name: k.replace("기대치 ", "#"),
    fullName: k,
    score: v,
  }));

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8">
      {/* 1. 상단 인쇄 및 리포트 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wide">
              Official Assessment Report
            </span>
            <span className="text-xs text-slate-500 font-medium">조직 안전문화 진단 보고서</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            [{company.company_name}] 안전문화 리더십 진단 보고서
          </h1>
          <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
            <span>산업 분야: <strong>{benchmark.label}</strong></span>
            <span>·</span>
            <span>기업 규모: <strong>{company.company_size}</strong></span>
            <span>·</span>
            <span>평가자: <strong>{company.evaluator_name || "안전관리책임자"}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 print:hidden shrink-0">
          <button
            onClick={onRestartAssessment}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 다시 진단하기
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow transition-colors"
          >
            <Printer className="w-4 h-4" /> 리포트 출력 / PDF
          </button>
        </div>
      </div>

      {/* 2. 종합 성숙도 및 산업 벤치마크 비교 카드 */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white rounded-3xl p-7 sm:p-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-3">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              안전문화 성숙도 종합 진단 결과
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {companyScore >= 80 ? "Level 4: 주도적 협력 단계" : companyScore >= 65 ? "Level 3: 체계적 관리 단계" : "Level 2: 사후 반응 단계"}
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              <strong>{company.company_name}</strong>의 RAA 삼원조 균형 지수는 <strong>{result.raa_scores.balance_index}점</strong>이며,
              <strong>{result.raa_scores.diagnosis_status}</strong> 상태로 분석되었습니다.
              권한 위임(Delegation)을 제도화하고 현장의 심리적 안전감을 강화하는 것이 최우선 과제입니다.
            </p>

            {/* 산업 벤치마크 비교 바 */}
            <div className="pt-2 space-y-2">
              <div className="flex justify-between text-xs text-slate-300 font-semibold">
                <span>{company.company_name} 점수: <strong className="text-blue-400">{companyScore}점</strong></span>
                <span>{benchmark.label} 업계 평균: <strong className="text-amber-300">{benchmark.benchmark_score}점</strong></span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                <div
                  className="bg-blue-400 h-2.5 rounded-full"
                  style={{ width: `${Math.min(100, companyScore)}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-400">
                {companyScore >= benchmark.benchmark_score
                  ? `동종 ${benchmark.label} 업계 평균 대비 +${(companyScore - benchmark.benchmark_score).toFixed(1)}점 우수한 성과를 보이고 있습니다.`
                  : `동종 ${benchmark.label} 업계 평균 대비 ${(benchmark.benchmark_score - companyScore).toFixed(1)}점 보완이 요구됩니다.`}
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 text-center shrink-0">
            <span className="text-xs font-medium text-slate-300 block">종합 안전문화 지수</span>
            <span className="text-5xl font-black text-blue-400 mt-2 block tracking-tight">
              {companyScore}
            </span>
            <span className="text-xs text-slate-300 mt-1 block">100점 만점 기준</span>
            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-300">
              RAA 균형도: <strong className="text-white">{result.raa_scores.balance_index}점</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 산업 분야 특화 위험 및 법적 중점 의무 박스 */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2 mb-3">
          <Factory className="w-4 h-4 text-blue-600" />
          {benchmark.label} 특화 중점 관리 요인 및 법적 의무 (조문 단위 매핑)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-blue-100">
            <span className="font-bold text-slate-700 block mb-1">업종 핵심 유해위험요인:</span>
            <ul className="space-y-1 text-slate-600">
              {benchmark.key_hazards.map((h: string, idx: number) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-blue-100">
            <span className="font-bold text-slate-700 block mb-1">법적 조문 근거 (산안법·중처법):</span>
            <p className="text-slate-600 leading-relaxed">{benchmark.statutory_focus}</p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-blue-100">
            <span className="font-bold text-slate-700 block mb-1">교재 기반 현장 처방전:</span>
            <p className="text-slate-600 leading-relaxed">{benchmark.special_advice}</p>
          </div>
        </div>
      </div>

      {/* 4. RAA 삼원조 레이더 & 리더십 8대 기대치 성과 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RAA 삼원조 레이더 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">RAA 삼원조 균형 레이더 (Ch 7)</h3>
              <p className="text-xs text-slate-500">
                책임({result.raa_scores.responsibility}) · 권한({result.raa_scores.authority}) · 책무성({result.raa_scores.accountability})
              </p>
            </div>
            <span className="px-2 py-1 rounded bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
              {result.raa_scores.diagnosis_status}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={raaRadarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#334155", fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#cbd5e1" />
                <Radar name="진단 점수" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.45} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2 leading-relaxed">
            {result.raa_scores.status_description}
          </p>
        </div>

        {/* 8대 리더십 기대치 성과 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">FM 6-22 8대 리더십 기대치 성과</h3>
              <p className="text-xs text-slate-500">
                평균 평점: <strong>{result.leadership_scores.average_score}점</strong> (5점 만점)
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadershipBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  formatter={(val: any) => [`${val}점`, "평점"]}
                  labelFormatter={(label) => {
                    const found = leadershipBarData.find((d) => d.name === label);
                    return found?.fullName || label;
                  }}
                />
                <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2">
            <span>최우수: <strong className="text-emerald-700">{result.leadership_scores.strongest_attribute}</strong></span>
            <span>개선시급: <strong className="text-rose-700">{result.leadership_scores.weakest_attribute}</strong></span>
          </div>
        </div>
      </div>

      {/* 5. 핵심 발견점 및 결과관리(Consequence Management) 권고사항 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            핵심 발견점 (Key Findings)
          </h3>
          <ul className="space-y-2 text-xs text-slate-700">
            {result.key_findings.map((finding: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-600 font-bold shrink-0">#{idx + 1}</span>
                <span className="leading-relaxed">{finding}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            Chapter 7 결과관리(Consequence) 처방
          </h3>
          <ul className="space-y-2 text-xs text-slate-700">
            {result.consequence_recommendations.map((rec: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 6. 단계별 안전문화 개선 실행 로드맵 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            [{company.company_name}] 3단계 안전문화 혁신 로드맵
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Roughton et al. (2019) Chapter 4(방향 설정) 및 Chapter 6(프로세스 구축) 기반 단계별 실천 과제
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
              1단계: 30일 즉시 실행
            </span>
            <h4 className="text-xs font-bold text-slate-900">현장 작업중지권 및 전결권 부여</h4>
            <ul className="text-[11px] text-slate-600 space-y-1 leading-relaxed">
              <li>· 긴급 위험 시 작업중지권(Stop-Work) 발동 공식 보장</li>
              <li>· 경영진 현장 리스닝 라운딩 주 1회 정례화</li>
              <li>· 무문책 위험 제보 채널 개설</li>
            </ul>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold">
              2단계: 90일 체계 정착
            </span>
            <h4 className="text-xs font-bold text-slate-900">오피니언 리더 챔피언 위촉 및 KPI</h4>
            <ul className="text-[11px] text-slate-600 space-y-1 leading-relaxed">
              <li>· ONA 3단계 영향력 기반 현장 안전 챔피언 선발</li>
              <li>· 생애주기별 고유(70%)/협업(30%) KPI 모니터링</li>
              <li>· JHA를 현장 작업자 주도형 개선으로 고도화</li>
            </ul>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              3단계: 180일 문화 내재화
            </span>
            <h4 className="text-xs font-bold text-slate-900">공정 결과관리 및 SMS 완전 통합</h4>
            <ul className="text-[11px] text-slate-600 space-y-1 leading-relaxed">
              <li>· 선제적 위험제보 인정 및 성과급 가점제 운영</li>
              <li>· ISO 45001 / ANSI Z10 프로세스의 전사 비즈니스 통합</li>
              <li>· 정기 안전문화 진단을 통한 RAA 밸런스 추세 관리</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
