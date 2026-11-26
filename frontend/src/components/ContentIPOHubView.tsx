"use client";

import React, { useEffect, useState } from "react";
import {
  Network,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Search,
  ShieldAlert,
  ExternalLink,
  BookOpen
} from "lucide-react";
import TextbookSourceBadge from "./TextbookSourceBadge";

interface RSSFeedItem {
  id: string;
  name: string;
  url: string;
  category: string;
}

interface CuratedContentItem {
  id: string;
  createdAt: string;
  title: string;
  curationRole: string;
  persona: string;
  outputChannel: string;
  isTribalKnowledge: boolean;
  sourceUrl: string;
  citationText: string;
  summaryNote: string;
  gateChecks: string[];
  properReferencePassed: boolean;
  rejectionReason?: string;
}

const AUTHORITATIVE_RSS_FEEDS: RSSFeedItem[] = [
  { id: "osha-fr", name: "OSHA Federal Register", url: "https://www.osha.gov/laws-regs/federalregisters.xml", category: "법령·연방관보" },
  { id: "osha-interp", name: "OSHA Interpretations", url: "https://www.osha.gov/pls/oshaweb/interpretation.xml", category: "유권해석" },
  { id: "osha-dir", name: "OSHA Directives", url: "https://www.osha.gov/pls/oshaweb/directive.xml", category: "감독지침" },
  { id: "osha-news", name: "OSHA News Release", url: "https://www.osha.gov/news/newsreleases.xml", category: "보도자료" },
  { id: "osha-qt", name: "OSHA QuickTakes", url: "https://www.osha.gov/as/opa/quicktakes/quicktakes.xml", category: "정기속보" },
  { id: "niosh-hhe", name: "NIOSH Health Hazard Evaluation Program", url: "https://www2c.cdc.gov/podcasts/createrss.asp?t=r&c=502", category: "보건유해평가" },
  { id: "sh-mag", name: "Safety+Health Magazine", url: "http://www.safetyandhealthmagazine.com/rss", category: "안전전문지" },
  { id: "ohs-online", name: "OH&S News / Wire / Webinars / Whitepapers", url: "https://ohsonline.com/rss-feeds/", category: "산업안전보건" },
  { id: "ccohs", name: "CCOHS Canadian enviroOSH Legislation", url: "http://www.ccohs.ca/rss/legislation/legislation.rss", category: "캐나다법령" },
  { id: "epa-news", name: "Various EPA News Feeds", url: "https://www.epa.gov/newsroom/news-feeds", category: "환경·화학물질" },
  { id: "cdc-er", name: "CDC Emergency Preparedness and Response", url: "https://tools.cdc.gov/api/v2/resources/media/319155.rss", category: "비상대응" },
];

const CURATION_ROLES = [
  "1. 콘텐츠 공유 (Sharing content · 공식 채널 링크 전달)",
  "2. 직접 추천 (Direct referrals · 신뢰 출처 직접 확인)",
  "3. 큐레이션된 추천 (Curated referrals · 요약·논평·원문링크)",
  "4. 해설자 / 평론가 (Commentator · 동향 비평·권위 구축)",
];

const GATE_CRITERIA = [
  { id: "origin", label: "원출처 역추적 확인 (Crossfield 'Trust no one' 원칙)" },
  { id: "opposing", label: "단일 출처 배제 · 반대 관점 교차 검토 (Beach, 2017)" },
  { id: "plagiarism", label: "표절 방지 & 퍼블릭도메인·학술 인용 표기 준수 (Grammarly/참고문헌)" },
  { id: "crossover", label: "개인/조직 SNS 경계 침범(Crossover) 및 평판 훼손 위험 없음" },
];

const SEARCH_SHORTCUTS = [
  { label: "정확한 일치", example: '"Safety culture"' },
  { label: "특정 사이트", example: "site:www.osha.gov" },
  { label: "검색 결합", example: "Safety OR culture" },
  { label: "단어 정의", example: "Define: safety culture" },
  { label: "도메인 제외", example: "-inurl:wikipedia" },
];

const STORAGE_KEY = "safepulse_ipo_hub";

export default function ContentIPOHubView() {
  const [subscribedFeeds, setSubscribedFeeds] = useState<string[]>([
    "osha-qt",
    "niosh-hhe",
    "cdc-er",
  ]);
  const [contents, setContents] = useState<CuratedContentItem[]>([]);

  // 폼 상태
  const [title, setTitle] = useState("");
  const [curationRole, setCurationRole] = useState(CURATION_ROLES[2]);
  const [persona, setPersona] = useState("3교대 현장 작업자 · 119구조대");
  const [outputChannel, setOutputChannel] = useState("조직 내부 (TBM·공지)");
  const [isTribalKnowledge, setIsTribalKnowledge] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("");
  const [citationText, setCitationText] = useState("");
  const [summaryNote, setSummaryNote] = useState("");
  const [gateChecks, setGateChecks] = useState<string[]>(GATE_CRITERIA.map((g) => g.id));

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.subscribedFeeds)) setSubscribedFeeds(parsed.subscribedFeeds);
        if (Array.isArray(parsed.contents)) {
          setContents(parsed.contents);
          return;
        }
      }
      const sample: CuratedContentItem[] = [
        {
          id: "IPO-1601",
          createdAt: new Date().toISOString().slice(0, 10),
          title: "OSHA 열사병·실외 고열작업 보호 지침 요약 및 교대조 TBM 카드",
          curationRole: CURATION_ROLES[2],
          persona: "3교대 현장 작업자 · 119구조대",
          outputChannel: "동료 협업 채널 (Slack)",
          isTribalKnowledge: true,
          sourceUrl: "https://www.osha.gov/news/newsreleases.xml",
          citationText: "OSHA (2024). Heat Illness Prevention Directives. Retrieved from osha.gov",
          summaryNote: "하계 현장 출동·작업 시 수분·그늘·휴식 3대 수칙과 베테랑 대원의 노하우를 1페이지로 재포장",
          gateChecks: GATE_CRITERIA.map((g) => g.id),
          properReferencePassed: true,
        },
      ];
      setContents(sample);
    } catch {
      // ignore storage errors
    }
  }, []);

  const persistHub = (nextFeeds: string[], nextContents: CuratedContentItem[]) => {
    setSubscribedFeeds(nextFeeds);
    setContents(nextContents);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ subscribedFeeds: nextFeeds, contents: nextContents })
      );
    } catch {
      // ignore
    }
  };

  const toggleFeed = (id: string) => {
    const next = subscribedFeeds.includes(id)
      ? subscribedFeeds.filter((x) => x !== id)
      : [...subscribedFeeds, id];
    persistHub(next, contents);
  };

  const toggleGate = (id: string) => {
    setGateChecks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const hasWikipediaCitation =
    sourceUrl.toLowerCase().includes("wikipedia") ||
    citationText.toLowerCase().includes("wikipedia") ||
    sourceUrl.includes("위키피디아") ||
    citationText.includes("위키피디아");

  const hasBasicCitation = sourceUrl.trim().length > 0 && citationText.trim().length > 0;
  const properReferencePreview =
    !hasWikipediaCitation && hasBasicCitation && gateChecks.length === GATE_CRITERIA.length;

  const handleAddContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let rejectionReason = "";
    if (hasWikipediaCitation) {
      rejectionReason = "5.1절 Note 위반: 위키피디아는 원출처·학술 인용 불가 (문헌 컬렉션 반려)";
    } else if (!hasBasicCitation) {
      rejectionReason = "원출처 URL 또는 참고문헌(BibTeX/APA) 표기 누락";
    } else if (gateChecks.length < GATE_CRITERIA.length) {
      rejectionReason = "FIG. 16.1 출처·교차검증 게이트 4항목 미충족";
    }

    const item: CuratedContentItem = {
      id: `IPO-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      title: title.trim(),
      curationRole,
      persona,
      outputChannel,
      isTribalKnowledge,
      sourceUrl: sourceUrl.trim() || "(미입력)",
      citationText: citationText.trim() || "(참고문헌 미입력)",
      summaryNote: summaryNote.trim(),
      gateChecks,
      properReferencePassed: !rejectionReason,
      rejectionReason: rejectionReason || undefined,
    };

    persistHub(subscribedFeeds, [item, ...contents]);
    setTitle("");
    setSourceUrl("");
    setCitationText("");
    setSummaryNote("");
  };

  const handleDeleteContent = (id: string) => {
    persistHub(
      subscribedFeeds,
      contents.filter((c) => c.id !== id)
    );
  };

  const passedCount = contents.filter((c) => c.properReferencePassed).length;
  const passRate = contents.length > 0 ? Math.round((passedCount / contents.length) * 100) : 0;

  return (
    <div className="space-y-8 pb-20">
      <TextbookSourceBadge
        chapter="Ch 16 (FIG. 16.1·16.2 · TABLE 16.1~16.3 · 4대 큐레이션 역할)"
        title="안전 콘텐츠 IPO (RSS) 허브 & Proper Reference 출처 검증 게이트"
        kpi="공인 RSS 출처 등록률 · Proper Reference 통과율 · 교대조 전파 적시율"
        law="산안법 제29·164조 / 중처법 시행령 제4·13조"
      />

      {/* 상단 지표 요약 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500">구독 중인 공인 RSS 피드</span>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {subscribedFeeds.length} / {AUTHORITATIVE_RSS_FEEDS.length}
          </p>
          <span className="text-[11px] text-slate-400">TABLE 16.3 비상업·공인 출처</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500">등록 안전 콘텐츠</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{contents.length}건</p>
          <span className="text-[11px] text-slate-400">IPO 파이프라인 처리 건수</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Proper Reference 통과율</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{passRate}%</p>
          <span className="text-[11px] text-slate-400">FIG. 16.1 인용 검증 게이트</span>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500">부족 지식(Tribal) 공식화</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">
            {contents.filter((c) => c.isTribalKnowledge).length}건
          </p>
          <span className="text-[11px] text-slate-400">5.1절 SME 현장 노하우 자산화</span>
        </div>
      </div>

      {/* 1. FIG. 16.2 Feedly IPO 파이프라인 & TABLE 16.3 공인 RSS 카탈로그 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-600" />
            1. Feedly IPO 파이프라인 (FIG. 16.2) &amp; 공인 안전 RSS 피드 (TABLE 16.3)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Input(공인 RSS) → Process(Feedly 보드 분류) → Proper Reference 검증 게이트(FIG. 16.1) → Output(내부 TBM·Slack·외부 채널)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
            <span className="font-extrabold text-blue-900 block">1. Input (투입 채널)</span>
            <span className="text-[11px] text-blue-800">OSHA · NIOSH · EPA · CDC 비상업 공인 RSS 피드 구독</span>
          </div>
          <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200">
            <span className="font-extrabold text-indigo-900 block">2. Process (Feedly 처리)</span>
            <span className="text-[11px] text-indigo-800">주제별 보드(Boards)·필터링으로 헤드라인 누락 차단</span>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
            <span className="font-extrabold text-amber-900 block">3. Proper Reference?</span>
            <span className="text-[11px] text-amber-900">No → 컬렉션 반려 / Yes → JabRef DB·인용 적용</span>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="font-extrabold text-emerald-900 block">4. Output (전파 채널)</span>
            <span className="text-[11px] text-emerald-800">내부 리더십·현장 TBM, 동료 Slack, 외부 LinkedIn</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {AUTHORITATIVE_RSS_FEEDS.map((feed) => {
            const active = subscribedFeeds.includes(feed.id);
            return (
              <div
                key={feed.id}
                onClick={() => toggleFeed(feed.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-2 ${
                  active
                    ? "bg-indigo-50/70 border-indigo-300"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                      {feed.category}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 mt-1 truncate">{feed.name}</p>
                  <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    {feed.url}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2 py-1 rounded-lg shrink-0 ${
                    active ? "bg-indigo-600 text-white" : "bg-white border border-slate-300 text-slate-600"
                  }`}
                >
                  {active ? "구독중" : "+ 추가"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. FIG. 16.1 Proper Reference? 출처 검증 게이트 & 콘텐츠 제작기 */}
      <form
        onSubmit={handleAddContent}
        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5"
      >
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            2. FIG. 16.1 Proper Reference? 검증 게이트 &amp; 4대 큐레이션 콘텐츠 제작기
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            위키피디아 인용은 자동 반려되며(5.1절 Note), 4대 게이트 검증을 통과해야 JabRef 인용 완료(YES) 상태로 등록됩니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">콘텐츠 제목 *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: NIOSH 유해위험평가 사례 기반 지게차 동선 분리 가이드"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">4대 큐레이션 역할 (3.3절)</label>
            <select
              value={curationRole}
              onChange={(e) => setCurationRole(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
            >
              {CURATION_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">대상 페르소나 (Ervin, 2013)</label>
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
            >
              <option value="3교대 현장 작업자 · 119구조대">3교대 현장 작업자 · 119구조대</option>
              <option value="현장 감독자 (Supervisor)">현장 감독자 (Supervisor)</option>
              <option value="최고경영진 · 안전위원회">최고경영진 · 안전위원회</option>
              <option value="신규 채용자 · 도급 협력사">신규 채용자 · 도급 협력사</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Output 전달 채널 (FIG. 16.2)</label>
            <select
              value={outputChannel}
              onChange={(e) => setOutputChannel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
            >
              <option value="조직 내부 (TBM·공지)">조직 내부 (Leadership &amp; Employees)</option>
              <option value="동료 협업 채널 (Slack)">동료 협업 네트워크 (Slack)</option>
              <option value="외부 전문 채널 (LinkedIn·YouTube)">외부 전문 채널 (LinkedIn · YouTube)</option>
            </select>
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-xs font-bold text-indigo-900 bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-200 cursor-pointer w-full">
              <input
                type="checkbox"
                checked={isTribalKnowledge}
                onChange={(e) => setIsTribalKnowledge(e.target.checked)}
                className="rounded border-indigo-300 text-indigo-600"
              />
              <span>부족 지식(Tribal Knowledge) 공식화</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">원출처 URL (위키피디아 금지)</label>
            <input
              type="text"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://www.osha.gov/... 또는 학술 DOI 링크"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              참고문헌 / 인용 표기 (APA · MLA · BibTeX · JabRef)
            </label>
            <input
              type="text"
              value={citationText}
              onChange={(e) => setCitationText(e.target.value)}
              placeholder="예: Roughton, Crutchfield, & Waite (2019), Safety Culture, Elsevier"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">재포장 요약 &amp; 현장 논평</label>
          <textarea
            rows={2}
            value={summaryNote}
            onChange={(e) => setSummaryNote(e.target.value)}
            placeholder="대상 페르소나 수준에 맞게 간결·설득력 있게 재포장(Re-package)한 핵심 내용을 입력하세요."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
          />
        </div>

        {/* 위키피디아 자동 반려 경고 */}
        {hasWikipediaCitation && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <span>
              [5.1절 Note 자동 차단] 위키피디아는 누구나 편집 가능한 미검증 공간이므로 학술 인용 및 참고문헌으로 사용할 수 없습니다.
              등록 시 Proper Reference = NO(반려)로 분류됩니다.
            </span>
          </div>
        )}

        {/* 4대 Proper Reference 검증 게이트 체크리스트 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-800">
              FIG. 16.1 Proper Reference? 검증 게이트
            </span>
            <span
              className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                properReferencePreview
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {properReferencePreview ? "YES → JabRef 등록 가능" : "NO → 문헌 컬렉션 반려 예정"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {GATE_CRITERIA.map((g) => {
              const checked = gateChecks.includes(g.id);
              return (
                <label
                  key={g.id}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer ${
                    checked
                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-950 font-semibold"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleGate(g.id)}
                    className="rounded border-slate-300 text-emerald-600"
                  />
                  <span>{g.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm"
          >
            <Plus className="w-4 h-4" /> 검증 게이트 적용 및 콘텐츠 등록
          </button>
        </div>
      </form>

      {/* 3. TABLE 16.1 검색 단축어 & 큐레이션 콘텐츠 보드 */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
          <Search className="w-4 h-4 text-indigo-600" />
          TABLE 16.1 구글 정밀 검색 단축어 빠른 참조 (Teachable Moments · SEO 보완)
        </div>
        <div className="flex flex-wrap gap-2">
          {SEARCH_SHORTCUTS.map((s) => (
            <span
              key={s.label}
              className="text-[11px] bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700"
            >
              <strong>{s.label}:</strong> <code className="text-indigo-700 font-mono">{s.example}</code>
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-base font-extrabold text-slate-900">
          큐레이션 콘텐츠 &amp; Proper Reference 검증 이력 ({contents.length}건)
        </h3>
        <div className="space-y-3">
          {contents.map((c) => (
            <div
              key={c.id}
              className={`p-4 rounded-xl border space-y-2 ${
                c.properReferencePassed
                  ? "bg-slate-50 border-slate-200"
                  : "bg-rose-50/60 border-rose-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {c.properReferencePassed ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3 h-3" /> Proper Reference: YES (JabRef 완료)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      <AlertTriangle className="w-3 h-3" /> Proper Reference: NO (반려)
                    </span>
                  )}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {c.outputChannel}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    {c.persona}
                  </span>
                  {c.isTribalKnowledge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      Tribal Knowledge 공식화
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteContent(c.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 self-end sm:self-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs font-extrabold text-slate-900">{c.title}</p>
              {c.summaryNote && <p className="text-xs text-slate-600">{c.summaryNote}</p>}
              <p className="text-[11px] text-slate-500">
                <strong>인용:</strong> {c.citationText} · <strong>URL:</strong> {c.sourceUrl}
              </p>
              {c.rejectionReason && (
                <p className="text-[11px] font-bold text-rose-700">반려 사유: {c.rejectionReason}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
