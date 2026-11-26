"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Wrench,
  Plus,
  Trash2,
  Info,
  ClipboardCheck
} from "lucide-react";
import TextbookSourceBadge from "./TextbookSourceBadge";

type RoleKey = "senior" | "middle" | "supervisor" | "safety_pro";

interface ABSSLog {
  id: string;
  date: string;
  role: RoleKey;
  shift: string;
  activityType: string;
  method: "method1" | "method2" | "method3" | "method4";
  topic: string;
  redTagHandoff: string;
  askedObstacleQuestion: boolean;
  obstacleReported: string;
}

interface FollowUpWorkOrder {
  id: string;
  createdAt: string;
  reporter: string;
  shift: string;
  hazardSummary: string;
  status: "접수" | "조치중" | "제기자 최종 확인 종결";
  signOffName: string;
  signOffConfirmed: boolean;
}

const ROLE_MATRICES: Record<
  RoleKey,
  {
    label: string;
    badge: string;
    cadences: { freq: string; task: string; target: string }[];
  }
> = {
  senior: {
    label: "최고 리더십",
    badge: "Senior Leadership",
    cadences: [
      { freq: "분기별 1회+", task: "현장 순회 워크스루 투어 동행", target: "전 사업장" },
      { freq: "월간 1회+", task: "일일 작업 전 브리핑 직접 참석 & 근로자 5명 1:1 면담", target: "5명/월" },
      { freq: "반기별 1회+", task: "오픈도어 정책, 라운드테이블 및 불시 현장 방문", target: "전 계층" },
    ],
  },
  middle: {
    label: "중간 관리자",
    badge: "Middle Management",
    cadences: [
      { freq: "월간 지정시간", task: "현장 안전 활동 직접 투입 (체크리스트·개선 지원)", target: "관할 부서" },
      { freq: "월간 1회+", task: "일일 브리핑 참석 & 작업장 바닥 5명 1:1 면담", target: "5명/월" },
      { freq: "분기별 1회", task: "기계·설비별 체크리스트 유효성 검토 및 워크스루 투어", target: "핵심 설비" },
    ],
  },
  supervisor: {
    label: "현장 감독자 (린치핀)",
    badge: "Supervisor · Linchpin",
    cadences: [
      { freq: "매일 작업 전", task: "일일 작업 전 안전브리핑(Preshift Review) 직접 주재", target: "1회/교대" },
      { freq: "매일 2~3회", task: "작업장 바닥 1:1 현장 대면 접촉 & 스팟 관찰 (사무실 호출 금지)", target: "2~3회/일" },
      { freq: "매일 / 매주 월요일", task: "15대 설비 일일 체크리스트 승인 · 주간 안전보고서 제출", target: "1회/주" },
    ],
  },
  safety_pro: {
    label: "안전 전문가",
    badge: "Site Safety Pro",
    cadences: [
      { freq: "상시 지원", task: "감독자 브리핑 시각 자료 개발 지원 및 기술 코칭", target: "전 감독자" },
      { freq: "주간 무작위", task: "무작위 5건 1:1 면담 & 설비 체크리스트 이행 무작위 검증", target: "5건/주" },
      { freq: "상시 / 사후", task: "사고조사(사후 편향 배제), Grab N Go Kit & 선행지표 분석", target: "100% 관리" },
    ],
  },
};

const COMMUNICATION_METHODS = [
  {
    id: "method1",
    label: "Method 1: 대면 토의만 (시각 자료 없음)",
    retention: "시각 자료 부재 — 현장 위험 인식 제한적",
    isOptimal: false,
  },
  {
    id: "method2",
    label: "Method 2: 텍스트 설명문 배포만 (토의 없음)",
    retention: "텍스트 단독 이해·잔존율 약 70% 수준 (Bladon, 2017)",
    isOptimal: false,
  },
  {
    id: "method3",
    label: "Method 3: 사진/이미지 단독 게시 (대면 토의 없음)",
    retention: "주입식·일방 전달 — 현장 맥락 적용 어려움",
    isOptimal: false,
  },
  {
    id: "method4",
    label: "Method 4: 대면 토의 + 사진·텍스트 설명문 동시 제공 (표준)",
    retention: "이해·잔존율 95%, 실행력 +323%, 3일 후 기억 보존율 65% (DOE 실증)",
    isOptimal: true,
  },
] as const;

const STORAGE_KEY = "safepulse_abss_logs";

export default function ABSSActivityTrackerView() {
  const [selectedRole, setSelectedRole] = useState<RoleKey>("supervisor");
  const [logs, setLogs] = useState<ABSSLog[]>([]);
  const [workOrders, setWorkOrders] = useState<FollowUpWorkOrder[]>([]);

  // 폼 상태
  const [shift, setShift] = useState("주간조 (08:00~17:00)");
  const [activityType, setActivityType] = useState("일일 작업 전 브리핑 (Appendix 11.5)");
  const [method, setMethod] = useState<ABSSLog["method"]>("method4");
  const [topic, setTopic] = useState("");
  const [redTagHandoff, setRedTagHandoff] = useState("");
  const [askedObstacleQuestion, setAskedObstacleQuestion] = useState(true);
  const [obstacleReported, setObstacleReported] = useState("");
  const [reporterName, setReporterName] = useState("현장 작업자");

  // 수동 작업의뢰서 추가
  const [manualHazard, setManualHazard] = useState("");
  const [manualReporter, setManualReporter] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setLogs(parsed);
        } else {
          setLogs(Array.isArray(parsed.logs) ? parsed.logs : []);
          setWorkOrders(Array.isArray(parsed.workOrders) ? parsed.workOrders : []);
        }
      } else {
        // 초기 샘플 1건
        const sampleWorkOrders: FollowUpWorkOrder[] = [
          {
            id: "WO-1101",
            createdAt: new Date().toISOString().slice(0, 10),
            reporter: "강조장 (생산1팀)",
            shift: "교대 인수인계",
            hazardSummary: "프레스 2호기 광전자식 방호장치 하단 브라켓 볼트 이완 (적색 태그 부착)",
            status: "조치중",
            signOffName: "",
            signOffConfirmed: false,
          },
        ];
        setWorkOrders(sampleWorkOrders);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const persistAll = (nextLogs: ABSSLog[], nextOrders: FollowUpWorkOrder[]) => {
    setLogs(nextLogs);
    setWorkOrders(nextOrders);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ logs: nextLogs, workOrders: nextOrders }));
    } catch {
      // ignore storage errors
    }
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const newLog: ABSSLog = {
      id: `ABSS-${Date.now()}`,
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
      role: selectedRole,
      shift,
      activityType,
      method,
      topic: topic.trim(),
      redTagHandoff: redTagHandoff.trim(),
      askedObstacleQuestion,
      obstacleReported: obstacleReported.trim(),
    };

    let nextOrders = [...workOrders];
    if (obstacleReported.trim()) {
      nextOrders = [
        {
          id: `WO-${Date.now().toString().slice(-4)}`,
          createdAt: new Date().toISOString().slice(0, 10),
          reporter: reporterName.trim() || "브리핑 제기자",
          shift,
          hazardSummary: obstacleReported.trim(),
          status: "접수",
          signOffName: "",
          signOffConfirmed: false,
        },
        ...nextOrders,
      ];
    }

    persistAll([newLog, ...logs], nextOrders);
    setTopic("");
    setRedTagHandoff("");
    setObstacleReported("");
  };

  const handleAddManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualHazard.trim()) return;
    const order: FollowUpWorkOrder = {
      id: `WO-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().slice(0, 10),
      reporter: manualReporter.trim() || "현장 근로자",
      shift,
      hazardSummary: manualHazard.trim(),
      status: "접수",
      signOffName: "",
      signOffConfirmed: false,
    };
    persistAll(logs, [order, ...workOrders]);
    setManualHazard("");
    setManualReporter("");
  };

  const handleUpdateOrder = (id: string, patch: Partial<FollowUpWorkOrder>) => {
    const nextOrders = workOrders.map((o) => (o.id === id ? { ...o, ...patch } : o));
    persistAll(logs, nextOrders);
  };

  const handleDeleteLog = (id: string) => {
    persistAll(
      logs.filter((l) => l.id !== id),
      workOrders
    );
  };

  const handleDeleteOrder = (id: string) => {
    persistAll(
      logs,
      workOrders.filter((o) => o.id !== id)
    );
  };

  const activeMethodMeta = COMMUNICATION_METHODS.find((m) => m.id === method)!;
  const method4Ratio =
    logs.length > 0
      ? Math.round((logs.filter((l) => l.method === "method4").length / logs.length) * 100)
      : 0;
  const closedOrdersCount = workOrders.filter((o) => o.status === "제기자 최종 확인 종결").length;

  return (
    <div className="space-y-8 pb-20">
      <TextbookSourceBadge
        chapter="Ch 11 (FIG. 11.1·11.2·11.4 · TABLE 11.1 · Appendix 11.3~11.7)"
        title="ABSS 활동 기반 안전시스템 일/주/월 교대 활동 트래커"
        kpi="일일 브리핑(TBM) 실시율 · 1:1 면담 달성률 · 후속조치 당사자 종결률"
        law="산안법 제16·29·36조 / 중처법 시행령 제4조"
      />

      {/* 상단 핵심 선행지표 KPI 요약 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500">누적 ABSS 실행 활동</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{logs.length}건</p>
          <span className="text-[11px] text-slate-400">일일·1:1·순회·체크리스트 합산</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Method 4 (시각+대면) 비율</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">{method4Ratio}%</p>
          <span className="text-[11px] text-slate-400">TABLE 11.1 DOE 검증 최적 방식</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500">후속조치팀 작업의뢰서</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{workOrders.length}건</p>
          <span className="text-[11px] text-slate-400">장애 요인 직접 접수 큐</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500">제기자 최종 서명 종결</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {closedOrdersCount} / {workOrders.length}
          </p>
          <span className="text-[11px] text-slate-400">당사자 Sign-off 필수 종결제</span>
        </div>
      </div>

      {/* 1. 계층별 ABSS 활동 주기 매트릭스 (FIG. 11.4) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              계층별 ABSS 표준 활동 주기 매트릭스 (FIG. 11.4)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              정해진 시간·날짜·장소에서 예외 없이(No Exceptions) 수행하는 직급별 선행 활동 기준입니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(ROLE_MATRICES) as RoleKey[]).map((key) => {
              const count = logs.filter((l) => l.role === key).length;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedRole(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    selectedRole === key
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {ROLE_MATRICES[key].label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ROLE_MATRICES[selectedRole].cadences.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-800 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {item.freq}
                </span>
                <span className="text-[11px] font-bold text-slate-500">목표: {item.target}</span>
              </div>
              <p className="text-xs font-bold text-slate-800 leading-relaxed pt-1">{item.task}</p>
            </div>
          ))}
        </div>

        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            <strong>1:1 면담 철칙 (5.1절):</strong> 절대로 관리자의 사무실로 직원을 부르지 말고(위압감 유발),
            반드시 직원이 일하는 작업 현장 바닥(Work environment)으로 찾아가 휴대폰을 끈 채 경청하십시오.
          </span>
        </div>
      </div>

      {/* 2. 작업 전 브리핑(Appendix 11.5) & 교대 인수인계 기록 폼 */}
      <form
        onSubmit={handleAddLog}
        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5"
      >
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            작업 전 브리핑 (Appendix 11.5) · 교대 인수인계 실행 기록
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            본사 일괄 배포 주입식 대본(Canned scripts)을 배제하고, 시각 자료와 대면 토의를 결합해 기록합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">교대조 / 인수인계 구분</label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
            >
              <option value="주간조 (08:00~17:00)">주간조 (08:00~17:00)</option>
              <option value="야간조 (17:00~02:00)">야간조 (17:00~02:00)</option>
              <option value="교대 인수인계 (Shift Handoff)">교대 인수인계 (Shift Handoff)</option>
              <option value="비상/119 교대 출동대">비상/119 교대 출동대</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ABSS 활동 유형</label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
            >
              <option value="일일 작업 전 브리핑 (Appendix 11.5)">일일 작업 전 브리핑 (Appendix 11.5)</option>
              <option value="1:1 현장 대면 면담 (작업장 바닥 원칙)">1:1 현장 대면 면담 (작업장 바닥 원칙)</option>
              <option value="현장 순회 워크스루 투어 (MBWA)">현장 순회 워크스루 투어 (MBWA)</option>
              <option value="기계·설비별 15대 체크리스트 승인 (App 11.7)">
                기계·설비별 15대 체크리스트 승인 (App 11.7)
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">소통 방식 (TABLE 11.1 DOE 검증)</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as ABSSLog["method"])}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
            >
              {COMMUNICATION_METHODS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TABLE 11.1 경고 / 권장 배너 */}
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
            activeMethodMeta.isOptimal
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-amber-50 border-amber-300 text-amber-950"
          }`}
        >
          {activeMethodMeta.isOptimal ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div>
            <strong className="block">{activeMethodMeta.label}</strong>
            <span className="text-[11px]">{activeMethodMeta.retention}</span>
            {!activeMethodMeta.isOptimal && (
              <span className="block text-[11px] font-bold mt-1 text-amber-800">
                경고 (3.1절·TABLE 11.1): 주입식 대본이나 일방 전달(Method 1~3)은 기억 잔존율이 낮습니다. 실제 현장 사진·텍스트 시각 자료와 대면 토의를 결합한 Method 4를 권장합니다.
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              논의 위험 주제 (아차사고·유사재해·작업조건) *
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="예: 절단 라인 LOTO 에너지 격리 지점 사진 확인 및 장갑 착용 검토"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              교대 인계 사항 / Red-Tagged (적색 태그) 설비 내역
            </label>
            <input
              type="text"
              value={redTagHandoff}
              onChange={(e) => setRedTagHandoff(e.target.value)}
              placeholder="예: 호이스트 3번 리미트 스위치 이상으로 가동 중지·적색 태그 유지"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>
        </div>

        {/* 4.2절 필수 종료 질문 */}
        <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 space-y-3">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={askedObstacleQuestion}
              onChange={(e) => setAskedObstacleQuestion(e.target.checked)}
              className="mt-0.5 rounded border-indigo-400 text-indigo-600"
            />
            <span className="text-xs font-extrabold text-indigo-950 leading-relaxed">
              [4.2절 필수 질문 확인] &quot;오늘 이 자리에서, 여러분 중 누구라도 안전하게 일하는 것을 방해하는 장애 요인이 있습니까?&quot;
            </span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <input
                type="text"
                value={obstacleReported}
                onChange={(e) => setObstacleReported(e.target.value)}
                placeholder="제기된 장애 요인이 있으면 입력 (입력 시 다기능 후속조치팀 작업의뢰서로 자동 등록)"
                className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs"
              />
            </div>
            <div>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="제기자 성명/조"
                className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> ABSS 활동 기록 저장
          </button>
        </div>
      </form>

      {/* 최근 ABSS 활동 기록 리스트 */}
      {logs.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900">최근 ABSS 실행 이력 ({logs.length}건)</h3>
          <div className="space-y-2">
            {logs.slice(0, 6).map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {log.date}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {ROLE_MATRICES[log.role].label}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      {log.shift}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        log.method === "method4"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {log.method.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900">{log.topic}</p>
                  {log.redTagHandoff && (
                    <p className="text-[11px] text-rose-700 font-semibold">Red-Tag 인계: {log.redTagHandoff}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteLog(log.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 self-end sm:self-center"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. 다기능 후속조치팀 (5.4절) 작업의뢰서 & 제기 근로자 최종 서명 종결제 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-emerald-600" />
              다기능 후속조치팀 (Follow-Up Team) 작업의뢰서 & 당사자 최종 서명 종결제 (5.4절)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              유지보수·감독자·근로자 합동으로 해결하며, 최초 위험 제기자 본인이 현장을 확인·서명(Sign-off)해야만 종결됩니다.
            </p>
          </div>
        </div>

        <form onSubmit={handleAddManualOrder} className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <input
            type="text"
            value={manualHazard}
            onChange={(e) => setManualHazard(e.target.value)}
            placeholder="현장 위험 작업의뢰서 신규 등록..."
            className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
          />
          <input
            type="text"
            value={manualReporter}
            onChange={(e) => setManualReporter(e.target.value)}
            placeholder="최초 제기자 성명"
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
          >
            작업의뢰서 등록
          </button>
        </form>

        <div className="space-y-3">
          {workOrders.map((wo) => {
            const canClose = wo.signOffConfirmed && wo.signOffName.trim().length > 0;
            return (
              <div
                key={wo.id}
                className={`p-4 rounded-xl border space-y-3 ${
                  wo.status === "제기자 최종 확인 종결"
                    ? "bg-emerald-50/50 border-emerald-200"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-slate-500">{wo.id}</span>
                    <span
                      className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        wo.status === "제기자 최종 확인 종결"
                          ? "bg-emerald-100 text-emerald-800"
                          : wo.status === "조치중"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {wo.status}
                    </span>
                    <span className="text-xs text-slate-500">
                      제기자: <strong>{wo.reporter}</strong> · {wo.createdAt}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteOrder(wo.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 self-end"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs font-bold text-slate-900">{wo.hazardSummary}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-slate-100 items-center">
                  <input
                    type="text"
                    value={wo.signOffName}
                    onChange={(e) => handleUpdateOrder(wo.id, { signOffName: e.target.value })}
                    placeholder="제기 근로자 최종 확인 서명(성명)"
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                  <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wo.signOffConfirmed}
                      onChange={(e) => handleUpdateOrder(wo.id, { signOffConfirmed: e.target.checked })}
                      className="rounded border-slate-300 text-emerald-600"
                    />
                    <span>제기 당사자 현장 개선 동의(Sign-off)</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    <button
                      type="button"
                      onClick={() => handleUpdateOrder(wo.id, { status: "조치중" })}
                      className="px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-[11px] font-bold hover:bg-amber-100"
                    >
                      조치중 전환
                    </button>
                    <button
                      type="button"
                      disabled={!canClose}
                      onClick={() => handleUpdateOrder(wo.id, { status: "제기자 최종 확인 종결" })}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 ${
                        canClose
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                      title={canClose ? "종결 가능" : "제기 근로자 서명과 확인 체크 후 종결 가능"}
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" /> 최종 종결
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
