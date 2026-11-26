"use client";

import React, { useEffect, useState } from "react";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Search,
  ShieldCheck,
  Database,
  Info
} from "lucide-react";
import TextbookSourceBadge from "./TextbookSourceBadge";

interface CurationDoc {
  id: string;
  createdAt: string;
  title: string;
  department: string;
  track: "Google search" | "Research/Scholar" | "Automated/Feedly·Alerts" | "내부 SOP/기록";
  storageBranch: "Electronic" | "Hardcopy";
  retentionPeriod: string;
  whyPurpose: string;
  alignedNomenclature: boolean;
  fiveSOrganized: boolean;
  qualityChecks: string[];
}

const QUALITY_DIMENSIONS = [
  { id: "discoverability", label: "1. 발견 가능성 및 접근성 (Discoverability & Accessibility)", question: "구성원이 찾아내고 접근할 수 있는가?" },
  { id: "completeness", label: "2. 완전성 (Completeness)", question: "필요한 모든 정보가 빠짐없이 포함되어 있는가?" },
  { id: "interpretation", label: "3. 해석 가능성 (Interpretation)", question: "의미가 모호하지 않고 명확히 이해되는가?" },
  { id: "accuracy", label: "4. 정확성 (Accuracy)", question: "사실에 부합하고 기술적 오류가 없는가?" },
  { id: "consistency", label: "5. 일관성 (Consistency)", question: "타 부서 SOP 및 기존 사규와 모순되지 않는가?" },
  { id: "provenance", label: "6. 출처 및 평판 (Provenance & Reputation)", question: "적법하고 신뢰할 수 있는 원출처로 역추적 가능한가?" },
  { id: "timeliness", label: "7. 적시성 (Timeliness)", question: "구식 정보가 아닌 최신 법령·현장 기준인가?" },
];

const RETENTION_OPTIONS = [
  "산안법 회의록 2년 (제164조)",
  "산안법 일반 서류 3년 (제164조)",
  "중처법 이행 서면 5년 (시행령 제13조)",
  "장기 RDM 10년 (Ch 15 질문 9)",
  "영구 보존 (중대 위험·설계 기준)",
];

const STORAGE_KEY = "safepulse_curation_docs";

export default function KnowledgeCurationView() {
  const [docs, setDocs] = useState<CurationDoc[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "VERIFIED" | "NEEDS_WORK">("ALL");

  // 폼 상태
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("안전/119구조대");
  const [track, setTrack] = useState<CurationDoc["track"]>("Research/Scholar");
  const [storageBranch, setStorageBranch] = useState<"Electronic" | "Hardcopy">("Electronic");
  const [retentionPeriod, setRetentionPeriod] = useState(RETENTION_OPTIONS[2]);
  const [whyPurpose, setWhyPurpose] = useState("");
  const [alignedNomenclature, setAlignedNomenclature] = useState(true);
  const [fiveSOrganized, setFiveSOrganized] = useState(true);
  const [qualityChecks, setQualityChecks] = useState<string[]>(
    QUALITY_DIMENSIONS.map((q) => q.id)
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setDocs(parsed);
          return;
        }
      }
      const sample: CurationDoc[] = [
        {
          id: "DOC-1501",
          createdAt: new Date().toISOString().slice(0, 10),
          title: "밀폐공간 산소농도 측정 및 구조 작업 표준 절차서 (SOP-CS-04)",
          department: "안전/119구조대",
          track: "내부 SOP/기록",
          storageBranch: "Electronic",
          retentionPeriod: "중처법 이행 서면 5년 (시행령 제13조)",
          whyPurpose: "3교대 현장 대원이 출동·작업 전 30초 내 최신 기준을 확인하고 유해가스 질식사고를 예방하기 위함",
          alignedNomenclature: true,
          fiveSOrganized: true,
          qualityChecks: QUALITY_DIMENSIONS.map((q) => q.id),
        },
        {
          id: "DOC-1502",
          createdAt: new Date().toISOString().slice(0, 10),
          title: "신규 채용자 온보딩 안전 수칙 요약본 (인사·운영 명명법 정렬 필요)",
          department: "인사부서(HR)",
          track: "Google search",
          storageBranch: "Hardcopy",
          retentionPeriod: "산안법 일반 서류 3년 (제164조)",
          whyPurpose: "신규 인력 투입 전 기초 보호구·작업중지권 인식 내재화",
          alignedNomenclature: false,
          fiveSOrganized: true,
          qualityChecks: ["discoverability", "completeness", "interpretation", "accuracy", "timeliness"],
        },
      ];
      setDocs(sample);
    } catch {
      // ignore storage errors
    }
  }, []);

  const persistDocs = (next: CurationDoc[]) => {
    setDocs(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const toggleQuality = (id: string) => {
    setQualityChecks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newDoc: CurationDoc = {
      id: `DOC-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      title: title.trim(),
      department,
      track,
      storageBranch,
      retentionPeriod,
      whyPurpose: whyPurpose.trim() || "현장 의사결정 및 위험 예방 지원 (Sinek Why)",
      alignedNomenclature,
      fiveSOrganized,
      qualityChecks,
    };

    persistDocs([newDoc, ...docs]);
    setTitle("");
    setWhyPurpose("");
  };

  const handleDelete = (id: string) => {
    persistDocs(docs.filter((d) => d.id !== id));
  };

  const verifiedCount = docs.filter((d) => d.qualityChecks.length === 7).length;
  const alignedCount = docs.filter((d) => d.alignedNomenclature).length;
  const verifiedRate = docs.length > 0 ? Math.round((verifiedCount / docs.length) * 100) : 0;

  const filteredDocs = docs.filter((d) => {
    const matchesSearch =
      !searchQuery.trim() ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.whyPurpose.toLowerCase().includes(searchQuery.toLowerCase());
    const isVerified = d.qualityChecks.length === 7;
    if (statusFilter === "VERIFIED") return matchesSearch && isVerified;
    if (statusFilter === "NEEDS_WORK") return matchesSearch && !isVerified;
    return matchesSearch;
  });

  return (
    <div className="space-y-8 pb-20">
      <TextbookSourceBadge
        chapter="Ch 15 (FIG. 15.1~15.4 · Curry & O'Riáin 7대 품질차원 · RDM 2단계)"
        title="SMS 안전지식 큐레이션 · 7대 품질 & 법정 보존연한 검증기"
        kpi="법정 기록 보존 준수율 · 7대 품질 사전 검증률 · 부서 간 SOP 명명법 정합률"
        law="산안법 제164조(2~3년) / 중처법 시행령 제13조(5년)"
      />

      {/* 상단 핵심 지표 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500">조직 기억 저장 문서</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{docs.length}건</p>
          <span className="text-[11px] text-slate-400">찾을 수 있어야 존재한다 (3.1절)</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500">7대 품질 완전 검증률</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{verifiedRate}%</p>
          <span className="text-[11px] text-slate-400">Curry & O&apos;Riáin 7/7 통과 기준</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500">부서 간 명명법 정렬</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">
            {alignedCount} / {docs.length}
          </p>
          <span className="text-[11px] text-slate-400">OBSERVATION 1 사일로 충돌 해소</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500">법정 보존연한 지정</span>
          <p className="text-2xl font-black text-blue-600 mt-1">100%</p>
          <span className="text-[11px] text-slate-400">산안법 제164조·중처법 제13조</span>
        </div>
      </div>

      {/* 1. FIG. 15.4 문헌 연구·큐레이션 순서도 요약 배너 */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              FIG. 15.4 문헌 연구 & 데이터 큐레이션 폐쇄 순환 루프 (RDM 2단계 연계)
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              소방 호스(FIG. 15.1) 수준의 정보 과잉 속에서 3대 수집 경로 → 저장 방식(Electronic 분기) → 7대 품질 검증 → 추가 연구 순환을 가동합니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/10 rounded-xl p-3.5 border border-white/15">
            <span className="text-[10px] font-bold text-blue-300 block">Step 1 · 3대 수집 트랙</span>
            <p className="font-bold mt-1">Google / Scholar / Feedly</p>
            <p className="text-[11px] text-slate-300 mt-0.5">일반·학술·자동화 알림 병렬 수집</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3.5 border border-white/15">
            <span className="text-[10px] font-bold text-indigo-300 block">Step 2 · 저장 방식 분기</span>
            <p className="font-bold mt-1">Electronic? (Yes / No)</p>
            <p className="text-[11px] text-slate-300 mt-0.5">전자 문헌 저장소 vs 인쇄물 구조</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3.5 border border-white/15">
            <span className="text-[10px] font-bold text-emerald-300 block">Step 3 · Verify & RDM</span>
            <p className="font-bold mt-1">7대 품질 & 보존연한</p>
            <p className="text-[11px] text-slate-300 mt-0.5">2·3·5·10년·영구 & 5S 정돈</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3.5 border border-white/15">
            <span className="text-[10px] font-bold text-amber-300 block">Step 4 · 추가 연구 환류</span>
            <p className="font-bold mt-1">Sinek Why 공유 & 갱신</p>
            <p className="text-[11px] text-slate-300 mt-0.5">누락·충돌 식별 시 재탐색 순환</p>
          </div>
        </div>
      </div>

      {/* 2. 안전문서 등록 + Curry & O'Riáin 7대 품질 검증기 */}
      <form
        onSubmit={handleAddDoc}
        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5"
      >
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            신규 안전지식 · 문서 큐레이션 등록 & 7대 품질 검증기
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            코비(Covey) 제2사분면 &apos;중요하지만 긴급하지 않은&apos; 기록 관리를 일상 루틴으로 정착시킵니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">문서 · 안전지식 제목 *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 고소작업대 전도 방지 기준 및 체크리스트 개정판"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sinek &quot;Start with Why&quot; 공유 목적 (6.2절)
            </label>
            <input
              type="text"
              value={whyPurpose}
              onChange={(e) => setWhyPurpose(e.target.value)}
              placeholder="예: 야간 교대 대원이 1분 내 핵심 위험 통제 기준을 확인하도록 지원"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">보유 부서 (OBSERVATION 1)</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
            >
              <option value="안전/119구조대">안전 / 119구조대</option>
              <option value="운영부서">운영부서 (Operations)</option>
              <option value="인사부서(HR)">인사부서 (HR)</option>
              <option value="품질관리부서(QC)">품질관리부서 (QC)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">FIG. 15.4 수집 트랙</label>
            <select
              value={track}
              onChange={(e) => setTrack(e.target.value as CurationDoc["track"])}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
            >
              <option value="Google search">Google search resources</option>
              <option value="Research/Scholar">Research resources (Scholar·Semantic)</option>
              <option value="Automated/Feedly·Alerts">Automated (Feedly · Alerts)</option>
              <option value="내부 SOP/기록">내부 SOP · 현장 법정 기록</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Electronic 저장 분기</label>
            <select
              value={storageBranch}
              onChange={(e) => setStorageBranch(e.target.value as "Electronic" | "Hardcopy")}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
            >
              <option value="Electronic">Yes · 전자 문헌 저장소</option>
              <option value="Hardcopy">No · 인쇄물 보관 구조</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">법정 보존연한 (RDM 질문 9)</label>
            <select
              value={retentionPeriod}
              onChange={(e) => setRetentionPeriod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
            >
              {RETENTION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Curry & O'Riáin 7대 품질 차원 체크리스트 */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-800">
              Curry &amp; O&apos;Riáin (2010) 7대 데이터 품질 차원 검증 ({qualityChecks.length} / 7 충족)
            </span>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                qualityChecks.length === 7
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {qualityChecks.length === 7 ? "7/7 완전 검증 통과" : "미검증 — 배포 전 보완 필요"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {QUALITY_DIMENSIONS.map((dim) => {
              const checked = qualityChecks.includes(dim.id);
              return (
                <label
                  key={dim.id}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                    checked
                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleQuality(dim.id)}
                    className="mt-0.5 rounded border-slate-300 text-emerald-600"
                  />
                  <div>
                    <span className="font-bold block">{dim.label}</span>
                    <span className="text-[11px] text-slate-500">{dim.question}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* 사일로 정렬 & 5S 체크 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={alignedNomenclature}
                onChange={(e) => setAlignedNomenclature(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600"
              />
              <span>타 부서(HR·운영·QC) 명명법·안전 기준 정렬 확인</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={fiveSOrganized}
                onChange={(e) => setFiveSOrganized(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600"
              />
              <span>5S 정돈 완료 (디지털 숨겨진 혼잡 제거)</span>
            </label>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" /> 검증 결과 저장 및 라이브러리 등록
          </button>
        </div>
      </form>

      {/* 3. 검색 가능한 안전지식 라이브러리 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              안전지식 라이브러리 (&quot;찾을 수 없다면 존재하지 않는 것이다!&quot;)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              교대조·지휘관·감독자가 키워드로 즉시 검색해 검증된 문서를 찾습니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="문서명·부서·목적 검색..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs w-52"
              />
            </div>
            {(["ALL", "VERIFIED", "NEEDS_WORK"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                  statusFilter === f
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                {f === "ALL" ? "전체" : f === "VERIFIED" ? "7/7 통과" : "보완 필요"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredDocs.map((doc) => {
            const passed = doc.qualityChecks.length === 7;
            return (
              <div
                key={doc.id}
                className={`p-4 rounded-xl border space-y-2 ${
                  passed ? "bg-slate-50 border-slate-200" : "bg-amber-50/50 border-amber-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {passed ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> 7/7 품질 통과
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        <AlertTriangle className="w-3 h-3" /> {doc.qualityChecks.length}/7 보완 필요
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {doc.department}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      {doc.storageBranch === "Electronic" ? "전자 저장소" : "인쇄물 구조"}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      {doc.retentionPeriod}
                    </span>
                    {!doc.alignedNomenclature && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                        부서 간 명명법 미정렬
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(doc.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 self-end sm:self-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs font-extrabold text-slate-900">{doc.title}</p>
                <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>목적(Why): {doc.whyPurpose} · 수집: {doc.track} ({doc.createdAt})</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
