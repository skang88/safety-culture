"use client";

import React, { useEffect, useState } from "react";
import { Shield, Check, Send, RotateCcw, AlertCircle } from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { fetchAssessmentItems, fetchAssessmentResults, submitAssessmentAnswers } from "@/lib/api";

export default function AssessmentView() {
  const [items, setItems] = useState<any[]>([]);
  const [results, setResults] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [respondentName, setRespondentName] = useState("현장 관리감독자");
  const [department, setDepartment] = useState("생산1팀(가공)");
  const [role, setRole] = useState("manager");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function init() {
      const itms = await fetchAssessmentItems();
      const res = await fetchAssessmentResults();
      setItems(itms);
      setResults(res);

      // 기본 점수 3점 초기화
      const initialAns: Record<string, number> = {};
      itms.forEach((it: any) => {
        initialAns[it.id] = 3;
      });
      setAnswers(initialAns);
    }
    init();
  }, []);

  const handleScoreChange = (itemId: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [itemId]: score }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg("");

    const payload = {
      respondent_id: `resp_${Date.now()}`,
      respondent_name: respondentName,
      department: department,
      role: role,
      answers: Object.entries(answers).map(([item_id, score]) => ({
        item_id,
        score,
      })),
    };

    await submitAssessmentAnswers(payload);
    const updatedRes = await fetchAssessmentResults();
    setResults(updatedRes);
    setSubmitting(false);
    setSuccessMsg("진단 설문이 성공적으로 제출 및 반영되었습니다!");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Radar 차트용 데이터 가공 (RAA 삼원조)
  const raaRadarData = results
    ? [
        { subject: "책임 (Responsibility)", score: results.raa_scores.responsibility, fullMark: 5 },
        { subject: "권한 (Authority)", score: results.raa_scores.authority, fullMark: 5 },
        { subject: "책무성 (Accountability)", score: results.raa_scores.accountability, fullMark: 5 },
      ]
    : [];

  // 리더십 8대 기대치 차트 데이터
  const leadershipBarData = results
    ? Object.entries(results.leadership_scores.item_scores).map(([k, v]) => ({
        name: k.replace("기대치 ", "#"),
        fullName: k,
        score: v,
      }))
    : [];

  return (
    <div className="space-y-8 pb-12">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          리더십 & RAA 삼원조 360° 다면진단
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Roughton et al. (2019) Chapter 7의 RAA 트라이어드와 미 육군 FM 6-22 8대 리더십 기대치를 기반으로
          조직의 책임, 권한, 책무성 균형도 및 리더십 역량을 정밀 평가합니다.
        </p>
      </div>

      {/* 진단 결과 시각화 차트 섹션 */}
      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* RAA 삼원조 레이더 차트 */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  RAA 삼원조(Triad) 균형 레이더
                </h2>
                <p className="text-xs text-slate-500">
                  균형 지수: <span className="font-bold text-blue-600">{results.raa_scores.balance_index}점</span> | 상태: {results.raa_scores.diagnosis_status}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-xs font-semibold">
                5점 만점 기준
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={raaRadarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#334155", fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#cbd5e1" />
                  <Radar name="진단 점수" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.45} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              📌 <strong>진단 요약:</strong> {results.raa_scores.status_description}
            </div>
          </div>

          {/* 8대 리더십 기대치 바 차트 */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  FM 6-22 리더십 8대 기대치 성과 (Table 7.1)
                </h2>
                <p className="text-xs text-slate-500">
                  평균 평점: <span className="font-bold text-indigo-600">{results.leadership_scores.average_score}점</span>
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
                  <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 flex justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span>최우수: <strong className="text-emerald-700">{results.leadership_scores.strongest_attribute}</strong></span>
              <span>개선시급: <strong className="text-rose-700">{results.leadership_scores.weakest_attribute}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* 진단 설문 입력 폼 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                조직 안전문화 & 리더십 자가 진단 평가 참여
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                각 문항에 대해 우리 조직의 실제 상태를 1(전혀 그렇지 않다) ~ 5(매우 그렇다)점으로 평가해 주세요.
              </p>
            </div>
            {successMsg && (
              <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" /> {successMsg}
              </span>
            )}
          </div>

          {/* 인적 사항 입력 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">응답자 성명/직함</label>
              <input
                type="text"
                value={respondentName}
                onChange={(e) => setRespondentName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">소속 부서/팀</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">직급 구분</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="executive">경영진 (Executive)</option>
                <option value="manager">중간관리자 / 팀장 (Manager)</option>
                <option value="worker">현장 작업자 / 조장 (Worker)</option>
              </select>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors bg-white flex flex-col md:flex-row justify-between md:items-center gap-4"
              >
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mt-1.5">{item.question}</h3>
                  {item.description && (
                    <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                  )}
                </div>

                {/* 1~5점 척도 선택 버튼 */}
                <div className="flex items-center gap-2 shrink-0">
                  {[1, 2, 3, 4, 5].map((score) => {
                    const isSelected = answers[item.id] === score;
                    return (
                      <button
                        type="button"
                        key={score}
                        onClick={() => handleScoreChange(item.id, score)}
                        className={`w-9 h-9 rounded-lg font-bold text-xs transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-md scale-105"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {score}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow"
            >
              <Send className="w-4 h-4" /> {submitting ? "제출 및 분석 중..." : "진단 결과 제출 및 분석"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
