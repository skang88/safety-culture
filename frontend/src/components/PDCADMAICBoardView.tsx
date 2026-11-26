"use client";

import React, { useEffect, useState } from "react";
import {
  GitBranch,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  BarChart3
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import TextbookSourceBadge from "./TextbookSourceBadge";

type DMAICStage = "Define" | "Measure" | "Analyze" | "Improve" | "Control";
type RootCause4M = "Man" | "Machine" | "Material" | "Method";

interface DMAICItem {
  id: string;
  title: string;
  source: string;
  rootCause4M: RootCause4M;
  isParetoTop20: boolean;
  owner: string;
  dueDate: string;
  stage: DMAICStage;
  verifiedAntiFormalism: boolean;
}

const STAGES: { id: DMAICStage; label: string; pdca: string; desc: string }[] = [
  { id: "Define", label: "Define (정의)", pdca: "PDCA · Plan", desc: "문제·고위험 대상 정의" },
  { id: "Measure", label: "Measure (측정)", pdca: "PDCA · Check", desc: "노출 빈도·선행지표 측정" },
  { id: "Analyze", label: "Analyze (분석)", pdca: "4M · Pareto", desc: "4M 특성요인·80/20 분석" },
  { id: "Improve", label: "Improve (개선)", pdca: "PDCA · Do", desc: "공학적 방호·공정 재설계" },
  { id: "Control", label: "Control (통제)", pdca: "PDCA · Act", desc: "표준 정착·서류주의 배제" },
];

const FOUR_M_LABELS: Record<RootCause4M, string> = {
  Man: "사람 (Man)",
  Machine: "기계·설비 (Machine)",
  Material: "재료·물질 (Material)",
  Method: "방법·절차 (Method)",
};

const STORAGE_KEY = "safepulse_dmaic_items";

export default function PDCADMAICBoardView() {
  const [items, setItems] = useState<DMAICItem[]>([]);
  const [stageFilter, setStageFilter] = useState<DMAICStage | "ALL">("ALL");

  // 폼 상태
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("위험관리 8단계");
  const [rootCause4M, setRootCause4M] = useState<RootCause4M>("Machine");
  const [isParetoTop20, setIsParetoTop20] = useState(true);
  const [owner, setOwner] = useState("설비정비팀 / 안전관리자");
  const [dueDate, setDueDate] = useState("2026-12-15");
  const [stage, setStage] = useState<DMAICStage>("Define");
  const [gateWarning, setGateWarning] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(parsed);
          return;
        }
      }
      // 초기 샘플 데이터
      const sample: DMAICItem[] = [
        {
          id: "DMAIC-1",
          title: "프레스 하사점 광전자식 방호장치 연동 인터록 개선",
          source: "JHA·HPI",
          rootCause4M: "Machine",
          isParetoTop20: true,
          owner: "설비보전 반장",
          dueDate: "2026-12-10",
          stage: "Improve",
          verifiedAntiFormalism: false,
        },
        {
          id: "DMAIC-2",
          title: "심야 교대조 유해화학물질 소분 절차 Visual SOP 개정",
          source: "ABSS",
          rootCause4M: "Method",
          isParetoTop20: true,
          owner: "생산2팀 조장",
          dueDate: "2026-12-20",
          stage: "Analyze",
          verifiedAntiFormalism: false,
        },
      ];
      setItems(sample);
    } catch {
      // ignore storage errors
    }
  }, []);

  const persistItems = (next: DMAICItem[]) => {
    setItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newItem: DMAICItem = {
      id: `DMAIC-${Date.now()}`,
      title: title.trim(),
      source,
      rootCause4M,
      isParetoTop20,
      owner: owner.trim() || "담당자 미지정",
      dueDate,
      stage,
      verifiedAntiFormalism: false,
    };
    persistItems([newItem, ...items]);
    setTitle("");
    setGateWarning("");
  };

  const handleToggleAntiFormalism = (id: string) => {
    persistItems(
      items.map((it) =>
        it.id === id ? { ...it, verifiedAntiFormalism: !it.verifiedAntiFormalism } : it
      )
    );
    setGateWarning("");
  };

  const handleMoveStage = (id: string, delta: 1 | -1) => {
    const target = items.find((it) => it.id === id);
    if (!target) return;

    const currentIdx = STAGES.findIndex((s) => s.id === target.stage);
    const nextIdx = currentIdx + delta;
    if (nextIdx < 0 || nextIdx >= STAGES.length) return;

    const nextStage = STAGES[nextIdx].id;
    // Control 단계 진입 전 형식주의 탈피(Check in the Box & 3대 부작용 검증) 게이트
    if (nextStage === "Control" && !target.verifiedAntiFormalism) {
      setGateWarning(
        `[${target.title}] 항목을 Control(통제·완료) 단계로 넘기려면 먼저 '형식주의 탈피 검증(서류 체크박스·통조림식 아님)' 체크박스를 확인해야 합니다.`
      );
      return;
    }

    setGateWarning("");
    persistItems(items.map((it) => (it.id === id ? { ...it, stage: nextStage } : it)));
  };

  const handleDelete = (id: string) => {
    persistItems(items.filter((it) => it.id !== id));
  };

  const displayedItems =
    stageFilter === "ALL" ? items : items.filter((it) => it.stage === stageFilter);

  const fourMChartData = (Object.keys(FOUR_M_LABELS) as RootCause4M[]).map((key) => ({
    name: FOUR_M_LABELS[key],
    count: items.filter((it) => it.rootCause4M === key).length,
  }));

  const controlCount = items.filter((it) => it.stage === "Control").length;
  const paretoCount = items.filter((it) => it.isParetoTop20).length;

  return (
    <div className="space-y-8 pb-20">
      <TextbookSourceBadge
        chapter="Ch 6 (FIG. 6.1~6.8 · Appendix 6.1·6.5)"
        title="PDCA / DMAIC 안전 프로세스 지속적 개선 & 시정조치 보드"
        kpi="시정조치 기한 내 완료율 · 4M 근본원인 규명률 · 형식주의(Cons) 탈피 지수"
        law="산안법 제14·36조 / 중처법 시행령 제4조제3·9호"
      />

      {/* 1. PDCA ↔ DMAIC 매핑 파이프라인 (FIG. 6.2 · 6.3 · 6.4) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-indigo-600" />
              데밍 PDCA ↔ 식스시그마 DMAIC 5단계 파이프라인 (FIG. 6.2·6.3·6.4)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              각 단계를 클릭하면 해당 단계의 시정조치 과제만 필터링할 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setStageFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border w-fit ${
              stageFilter === "ALL"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-slate-50 text-slate-700 border-slate-200"
            }`}
          >
            전체 보기 ({items.length})
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {STAGES.map((st, idx) => {
            const count = items.filter((it) => it.stage === st.id).length;
            const active = stageFilter === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setStageFilter(st.id)}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  active
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                    : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      active ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-800"
                    }`}
                  >
                    {st.pdca}
                  </span>
                  <span className="text-base font-black">{count}</span>
                </div>
                <p className="text-xs font-extrabold mt-2">
                  {idx + 1}. {st.label}
                </p>
                <p className={`text-[11px] mt-0.5 ${active ? "text-indigo-100" : "text-slate-500"}`}>
                  {st.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* FIG. 6.1 Check in the Box & 5절 SMS 3대 부작용(Cons) 경고 */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>형식주의(FIG. 6.1 Check in the Box) & SMS 3대 부작용(5절 Cons) 방지 게이트:</strong>
            <span className="block text-[11px] mt-0.5">
              ① 통조림식(Canned) 외부 서류 복사, ② 감사 대비 서류 폭탄, ③ 인증·서류 완료를 안전 완성으로 착각하는 수동적 안주를 차단하기 위해,
              모든 과제는 <strong>&apos;현장 실질 위험 저감 검증&apos;</strong>을 통과해야 Control 단계로 종결됩니다.
            </span>
          </div>
        </div>
      </div>

      {/* 2. 신규 시정조치 생성 폼 (Appendix 6.5) + 4M 특성요인도 분포 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleAddItem}
          className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4"
        >
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            시정조치 실행 계획 등록 (Appendix 6.5 · 4M · 파레토 80/20)
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">개선 과제명 *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 컨베이어 끼임 위험점 인터록 가드 설치 (80/20 핵심 위험)"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">도출 출처 모듈</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
              >
                <option value="위험관리 8단계">위험관리 8단계 (Ch 9·10)</option>
                <option value="SMS Mirror">SMS Mirror 자체평가 (Ch 14)</option>
                <option value="ABSS">ABSS 교대 활동·후속조치팀 (Ch 11)</option>
                <option value="JHA·HPI">JHA 4열 & HPI 오류전조 (Ch 12)</option>
                <option value="현장 제안">현장 근로자 안전 제안 (Ch 8)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">4M 특성요인도 분류 (FIG. 6.8)</label>
              <select
                value={rootCause4M}
                onChange={(e) => setRootCause4M(e.target.value as RootCause4M)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
              >
                <option value="Man">Man (사람·숙련·인지)</option>
                <option value="Machine">Machine (기계·설비·방호)</option>
                <option value="Material">Material (재료·유해물질)</option>
                <option value="Method">Method (방법·표준·절차)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">담당자</label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">완료 목표일</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">초기 단계</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as DMAICStage)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
              >
                {STAGES.filter((s) => s.id !== "Control").map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <label className="flex items-center gap-2 text-xs font-bold text-rose-800 bg-rose-50 px-3 py-2 rounded-xl border border-rose-200 cursor-pointer">
              <input
                type="checkbox"
                checked={isParetoTop20}
                onChange={(e) => setIsParetoTop20(e.target.checked)}
                className="rounded border-rose-300 text-rose-600"
              />
              <span>파레토 80/20 핵심 20% 치명적 고위험 요인 (FIG. 6.5·6.6)</span>
            </label>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm"
            >
              DMAIC 과제 등록
            </button>
          </div>
        </form>

        {/* 4M 근본원인 분포 차트 + 요약 */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              4M 특성요인도 (Fishbone · FIG. 6.8) 분포
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              파레토 핵심 20% 과제: <strong>{paretoCount}건</strong> · Control 정착 완료:{" "}
              <strong>{controlCount}건</strong>
            </p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fourMChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#475569" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip formatter={(v: any) => [`${v}건`, "시정조치 건수"]} />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 형식주의 게이트 경고 */}
      {gateWarning && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{gateWarning}</span>
        </div>
      )}

      {/* 3. 시정조치 실행 보드 리스트 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900">
            DMAIC 시정조치 실행 보드 ({displayedItems.length}건)
          </h3>
          <span className="text-xs text-slate-500">
            필터: <strong>{stageFilter}</strong>
          </span>
        </div>

        <div className="space-y-3">
          {displayedItems.map((item) => {
            const idx = STAGES.findIndex((s) => s.id === item.stage);
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border space-y-3 ${
                  item.stage === "Control"
                    ? "bg-emerald-50/40 border-emerald-200"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      {STAGES[idx]?.label}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      {FOUR_M_LABELS[item.rootCause4M]}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {item.source}
                    </span>
                    {item.isParetoTop20 && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        Pareto 80/20 고위험
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>담당: <strong>{item.owner}</strong></span>
                    <span>목표: {item.dueDate}</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs font-extrabold text-slate-900">{item.title}</p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/70">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.verifiedAntiFormalism}
                      onChange={() => handleToggleAntiFormalism(item.id)}
                      className="rounded border-slate-300 text-emerald-600"
                    />
                    <span>
                      형식주의(FIG. 6.1 Check in the Box · 통조림식 서류) 아님 — 현장 실질 개선 검증 완료
                    </span>
                  </label>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveStage(item.id, -1)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border ${
                        idx === 0
                          ? "text-slate-300 border-slate-200 cursor-not-allowed"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> 이전 단계
                    </button>
                    <button
                      type="button"
                      disabled={idx === STAGES.length - 1}
                      onClick={() => handleMoveStage(item.id, 1)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold ${
                        idx === STAGES.length - 1
                          ? "bg-emerald-100 text-emerald-700 cursor-default"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white"
                      }`}
                    >
                      {idx === STAGES.length - 1 ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> 통제 정착 완료
                        </>
                      ) : (
                        <>
                          다음 단계 <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
