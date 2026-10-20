// frontend/src/lib/api.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// -------------------------------------------------------------
// 인증 토큰 관리 및 사용자 인증 API
// -------------------------------------------------------------

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("safepulse_token");
}

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("safepulse_token", token);
  }
}

export function clearAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("safepulse_token");
    localStorage.removeItem("safepulse_user");
    localStorage.removeItem("safepulse_session_id");
  }
}

export function getStoredUser(): any | null {
  if (typeof window === "undefined") return null;
  const u = localStorage.getItem("safepulse_user");
  return u ? JSON.parse(u) : null;
}

export function setStoredUser(user: any) {
  if (typeof window !== "undefined") {
    localStorage.setItem("safepulse_user", JSON.stringify(user));
  }
}

export async function registerUser(data: { email: string; password: string; name: string; company_name: string }) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "회원가입에 실패했습니다." }));
    throw new Error(err.detail || "회원가입에 실패했습니다.");
  }
  const result = await res.json();
  setAuthToken(result.access_token);
  setStoredUser(result.user);
  return result;
}

export async function loginUser(data: { email: string; password: string }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "로그인에 실패했습니다." }));
    throw new Error(err.detail || "로그인에 실패했습니다.");
  }
  const result = await res.json();
  setAuthToken(result.access_token);
  setStoredUser(result.user);
  return result;
}

export async function fetchCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      clearAuthToken();
      return null;
    }
    const user = await res.json();
    setStoredUser(user);
    return user;
  } catch (err) {
    console.warn("fetchCurrentUser error:", err);
    return getStoredUser();
  }
}

export async function fetchAssessmentItems() {
  try {
    const res = await fetch(`${API_BASE}/assessment/items`);
    if (!res.ok) throw new Error("Failed to fetch assessment items");
    return await res.json();
  } catch (err) {
    console.warn("Using local fallback items:", err);
    return getFallbackItems();
  }
}

export async function fetchAssessmentResults() {
  try {
    const res = await fetch(`${API_BASE}/assessment/results`);
    if (!res.ok) throw new Error("Failed to fetch assessment results");
    return await res.json();
  } catch (err) {
    console.warn("Using local fallback results:", err);
    return getFallbackResults();
  }
}

export async function submitAssessmentAnswers(data: any) {
  try {
    const res = await fetch(`${API_BASE}/assessment/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.warn("Fallback submit:", err);
    return { message: "로컬 모드에서 응답이 성공적으로 반영되었습니다." };
  }
}

export async function fetchONAGraph() {
  try {
    const res = await fetch(`${API_BASE}/ona/graph`);
    if (!res.ok) throw new Error("Failed to fetch ONA graph");
    return await res.json();
  } catch (err) {
    console.warn("Using fallback ONA data:", err);
    return getFallbackONAData();
  }
}

export async function fetchKPISummary() {
  try {
    const res = await fetch(`${API_BASE}/kpi/summary`);
    if (!res.ok) throw new Error("Failed to fetch KPI summary");
    return await res.json();
  } catch (err) {
    console.warn("Using fallback KPI data:", err);
    return getFallbackKPIData();
  }
}

export async function fetchConsultingReport() {
  try {
    const res = await fetch(`${API_BASE}/consulting/report`);
    if (!res.ok) throw new Error("Failed to fetch consulting report");
    return await res.json();
  } catch (err) {
    console.warn("Using fallback consulting report:", err);
    return getFallbackConsultingReport();
  }
}

export async function fetchChecklistGroups(category?: string, targetRole?: string) {
  try {
    const params = new URLSearchParams();
    if (category && category !== "all") params.append("category", category);
    if (targetRole && targetRole !== "all") params.append("target_role", targetRole);

    const res = await fetch(`${API_BASE}/checklists/groups?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch checklists");
    return await res.json();
  } catch (err) {
    console.warn("Using fallback checklists:", err);
    return getFallbackChecklistGroups();
  }
}

export async function submitChecklistStatus(submission: any) {
  try {
    const res = await fetch(`${API_BASE}/checklists/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    });
    if (!res.ok) throw new Error("Failed to submit checklist");
    return await res.json();
  } catch (err) {
    console.warn("Fallback submit checklist:", err);
    return null;
  }
}

export async function fetchChecklistStats() {
  try {
    const res = await fetch(`${API_BASE}/checklists/stats`);
    if (!res.ok) throw new Error("Failed to fetch checklist stats");
    return await res.json();
  } catch (err) {
    return {
      total_groups: 8,
      total_items: 57,
      overall_compliance_rate: 81.5,
      compliant_count: 42,
      partial_count: 12,
      non_compliant_count: 3
    };
  }
}

// -------------------------------------------------------------
// 회사 온보딩 & Step-by-Step 진단 세션 API
// -------------------------------------------------------------

export async function startCompanySession(company: any) {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/session/start`, {
      method: "POST",
      headers,
      body: JSON.stringify({ company }),
    });
    if (!res.ok) throw new Error("Failed to start session");
    const data = await res.json();
    if (typeof window !== "undefined") {
      localStorage.setItem("safepulse_session_id", data.session_id);
      localStorage.setItem("safepulse_company", JSON.stringify(data.company));
    }
    return data;
  } catch (err) {
    console.warn("Fallback start session:", err);
    const mockSessionId = `sess_local_${Date.now()}`;
    const mockData = {
      session_id: mockSessionId,
      company,
      current_step: 0,
      answers: {},
      is_completed: false,
      progress_percentage: 0.0,
      total_questions: 18,
      answered_count: 0
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("safepulse_session_id", mockSessionId);
      localStorage.setItem("safepulse_company", JSON.stringify(company));
    }
    return mockData;
  }
}

export async function fetchSession(sessionId: string) {
  try {
    const res = await fetch(`${API_BASE}/session/${sessionId}`);
    if (!res.ok) throw new Error("Failed to fetch session");
    return await res.json();
  } catch (err) {
    console.warn("Fallback fetch session:", err);
    return null;
  }
}

export async function saveSessionProgress(sessionId: string, currentStep: number, answers: Record<string, number>, isCompleted: boolean = false) {
  try {
    const res = await fetch(`${API_BASE}/session/${sessionId}/save`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        current_step: currentStep,
        answers,
        is_completed: isCompleted,
      }),
    });
    if (!res.ok) throw new Error("Failed to save progress");
    return await res.json();
  } catch (err) {
    console.warn("Fallback save progress:", err);
    return {
      session_id: sessionId,
      current_step: currentStep,
      answers,
      is_completed: isCompleted,
      progress_percentage: Math.round((Object.keys(answers).length / 18) * 100),
      total_questions: 18,
      answered_count: Object.keys(answers).length
    };
  }
}



// -------------------------------------------------------------
// Fallback Data (네트워크 연결 실패 시에도 원활한 렌더링 보장)
// -------------------------------------------------------------

function getFallbackItems() {
  return [
    {
      id: "RAA_RESP_1",
      dimension: "RAA_RESPONSIBILITY",
      category: "RAA 삼원조 (책임)",
      question: "우리 조직의 리더십은 안전 사고나 문제 발생 시 하위 직원을 탓하지 않고 최고위층이 궁극적 결과를 책임진다.",
      description: "Ch 7 에드가 샤인 명제 및 RAA 트라이어드",
    },
    {
      id: "RAA_RESP_2",
      dimension: "RAA_RESPONSIBILITY",
      category: "RAA 삼원조 (책임)",
      question: "경영진은 안전을 비용이나 생산의 종속 변수가 아닌, 타협할 수 없는 핵심 가치이자 리더의 고유 책임으로 인식한다.",
      description: "Ch 7 비전 제시 및 안전 최우선 가치 내재화",
    },
    {
      id: "RAA_AUTH_1",
      dimension: "RAA_AUTHORITY",
      category: "RAA 삼원조 (권한)",
      question: "현장 관리감독자 및 작업자는 급박한 위험이 발생했을 때 작업을 즉시 중지할 수 있는 실질적 권한(Stop-Work Authority)을 행사할 수 있다.",
      description: "Ch 7 권한의 하향 위임 (Flows from top to bottom)",
    },
    {
      id: "RAA_AUTH_2",
      dimension: "RAA_AUTHORITY",
      category: "RAA 삼원조 (권한)",
      question: "안전 개선에 필요한 예산 집행과 위험 요인 개선 조치에 대해 부서장 및 팀 단위에 적절한 결정 권한이 위임되어 있다.",
      description: "Ch 7 위임(Delegation)의 중요성",
    },
    {
      id: "RAA_ACCT_1",
      dimension: "RAA_ACCOUNTABILITY",
      category: "RAA 삼원조 (책무성)",
      question: "모든 직원은 자신에게 부여된 안전 수칙과 직무를 성실히 이행하며, 그 이행 결과에 대해 명확히 피드백하고 해명할 의무를 진다.",
      description: "Ch 7 부하 직원의 책무성 및 이행 의무",
    },
    {
      id: "RAA_ACCT_2",
      dimension: "RAA_ACCOUNTABILITY",
      category: "RAA 삼원조 (책무성)",
      question: "안전 성과에 대해 칭찬과 인정 같은 긍정적 결과(Positive Consequences)와 미준수에 대한 공정한 시정 조치가 명확히 작동한다.",
      description: "Ch 7 성과에 대한 결과/피드백(Consequences for Performance) 설정",
    },
    {
      id: "LEAD_EXP_1",
      dimension: "LEADERSHIP_1",
      category: "8대 리더십 기대치",
      question: "[비전과 변화] 리더는 안전문화의 명확한 미래 지향점을 제시하고 구성원들이 변화에 동참하도록 주도한다.",
      description: "Table 7.1 번호 1: Have a vision and lead change",
    },
    {
      id: "LEAD_EXP_2",
      dimension: "LEADERSHIP_2",
      category: "8대 리더십 기대치",
      question: "[윤리적 나침반] 리더는 어떠한 생산 압박이나 위기 상황에서도 안전과 타협하지 않고 조직의 도덕적 나침반 역할을 한다.",
      description: "Table 7.1 번호 2: Be your organization's moral and ethical compass",
    },
    {
      id: "LEAD_EXP_6",
      dimension: "LEADERSHIP_6",
      category: "8대 리더십 기대치",
      question: "[위임과 리스크 감수] 리더는 현장에 실질적 권한을 위임하고, 업무 추진 중 발생할 수 있는 합당한 리스크를 대신 감당해 준다.",
      description: "Table 7.1 번호 6: Empower subordinates and underwrite the risk",
    },
    {
      id: "LEAD_EXP_8",
      dimension: "LEADERSHIP_8",
      category: "8대 리더십 기대치",
      question: "[전방위 투명한 소통] 리더는 상하좌우로 투명하게 소통하며, 불리한 정보나 현장 맥락을 가감 없이 전사적으로 공유한다.",
      description: "Table 7.1 번호 8: Communicate up, down, laterally",
    },
    {
      id: "PERC_1",
      dimension: "MENTAL_MODEL",
      category: "안전 지각 및 멘탈 모델",
      question: "우리 조직은 '사고나 손실이 없었다고 해서 위험도 없다(No Loss No Risk)'고 방심하지 않고 상존하는 잠재 위험을 선제적으로 평가한다.",
      description: "Ch 1 '무손실=무위험' 멘탈 모델 탈피",
    },
    {
      id: "PS_1",
      dimension: "PSYCHOLOGICAL_SAFETY",
      category: "직원 참여 및 심리적 안전감",
      question: "위험 상황을 솔직하게 보고하거나 안전상의 이견을 제시해도 비난받거나 불이익을 당하지 않는다는 심리적 안전감을 느낀다.",
      description: "Ch 8 발언권(Voice) 및 심리적 안전감",
    }
  ];
}

function getFallbackResults() {
  return {
    respondent_count: 12,
    raa_scores: {
      responsibility: 4.1,
      authority: 3.2,
      accountability: 3.9,
      balance_index: 76.5,
      diagnosis_status: "권한 결여형 (Authority Deficit)",
      status_description: "현장 실무진에게 직무 이행 의무(책무성)는 과중하나, 실질적인 위험 개선 권한(작업중지권 등)의 위임이 부족하여 권한-책임 불균형이 감지됩니다."
    },
    leadership_scores: {
      item_scores: {
        "기대치 1 (비전/변화)": 4.0,
        "기대치 2 (윤리 나침반)": 4.2,
        "기대치 3 (학습/적응)": 3.6,
        "기대치 4 (위험/기회 균형)": 3.8,
        "기대치 5 (고성과 팀)": 3.5,
        "기대치 6 (권한위임/리스크)": 2.9,
        "기대치 7 (차세대 리더육성)": 3.3,
        "기대치 8 (전방위 소통)": 3.4
      },
      average_score: 3.59,
      strongest_attribute: "기대치 2 (윤리 나침반 - 4.2점)",
      weakest_attribute: "기대치 6 (권한위임/리스크 감수 - 2.9점)"
    },
    dimension_scores: {
      perception_of_safety: 3.85,
      psychological_safety: 3.35,
      manager_vs_leader: { "관리자 성향(규정·통제)": 62.0, "리더십 성향(비전·영감)": 38.0 }
    },
    key_findings: [
      "책임(4.1점) 및 책무성(3.9점) 대비 권한 위임(3.2점)이 취약하여 '권한 결여형' 병리 현상이 나타남.",
      "미 육군 FM 6-22 8대 기대치 중 리더십의 '권한 위임 및 리스크 감수(2.9점)'가 최하위로 측정됨.",
      "Ch 7 기준 관리자적 통제(62%)가 리더십 비전 제시(38%)보다 우세하여 단기 순응주의에 갇힐 위험이 있음."
    ],
    consequence_recommendations: [
      "Ch 7 권한 위임(Delegation)의 제도화: 현장 조장 및 감독자에게 '즉시 위험개선 전결권' 부여",
      "Ch 7 긍정적 결과관리: 안전 지적 위주의 패널티 문화를 개선하고 '선제적 위험제보 인정 프로그램' 도입",
      "Ch 8 안전 발언권(Voice) 보장: 무문책 작업중지제 운영으로 심리적 안전감 제고"
    ]
  };
}

function getFallbackONAData() {
  return {
    nodes: [
      { id: "U1", name: "김대표", department: "경영진", role: "executive", degree_centrality: 0.18, betweenness_centrality: 0.05, influence_score_3deg: 4.5, is_opinion_leader: false, is_isolated: false },
      { id: "U2", name: "박안전", department: "EHS안전부", role: "manager", degree_centrality: 0.65, betweenness_centrality: 0.52, influence_score_3deg: 9.8, is_opinion_leader: true, is_isolated: false },
      { id: "U3", name: "이생산", department: "생산본부", role: "manager", degree_centrality: 0.45, betweenness_centrality: 0.35, influence_score_3deg: 7.2, is_opinion_leader: false, is_isolated: false },
      { id: "U4", name: "최정비", department: "설비정비팀", role: "manager", degree_centrality: 0.32, betweenness_centrality: 0.12, influence_score_3deg: 5.0, is_opinion_leader: false, is_isolated: false },
      { id: "U5", name: "정품질", department: "품질보증팀", role: "manager", degree_centrality: 0.28, betweenness_centrality: 0.10, influence_score_3deg: 4.2, is_opinion_leader: false, is_isolated: false },
      { id: "U6", name: "강조장", department: "생산1팀(가공)", role: "worker", degree_centrality: 0.55, betweenness_centrality: 0.42, influence_score_3deg: 8.5, is_opinion_leader: true, is_isolated: false },
      { id: "U7", name: "조반장", department: "생산2팀(조립)", role: "worker", degree_centrality: 0.36, betweenness_centrality: 0.18, influence_score_3deg: 5.5, is_opinion_leader: false, is_isolated: false },
      { id: "U8", name: "윤엔지니어", department: "설비정비팀", role: "worker", degree_centrality: 0.30, betweenness_centrality: 0.08, influence_score_3deg: 4.5, is_opinion_leader: false, is_isolated: false },
      { id: "U9", name: "장작업자", department: "생산1팀(가공)", role: "worker", degree_centrality: 0.22, betweenness_centrality: 0.02, influence_score_3deg: 3.2, is_opinion_leader: false, is_isolated: false },
      { id: "U10", name: "임검사원", department: "품질보증팀", role: "worker", degree_centrality: 0.18, betweenness_centrality: 0.04, influence_score_3deg: 2.8, is_opinion_leader: false, is_isolated: false },
      { id: "U11", name: "한신임", department: "생산2팀(조립)", role: "worker", degree_centrality: 0.12, betweenness_centrality: 0.01, influence_score_3deg: 1.8, is_opinion_leader: false, is_isolated: true },
      { id: "U12", name: "오협력", department: "사내협력사", role: "worker", degree_centrality: 0.10, betweenness_centrality: 0.00, influence_score_3deg: 1.5, is_opinion_leader: false, is_isolated: true }
    ],
    edges: [
      { source: "U2", target: "U1", relation_type: "advice", frequency: 3 },
      { source: "U2", target: "U3", relation_type: "collaboration", frequency: 3 },
      { source: "U2", target: "U4", relation_type: "collaboration", frequency: 2 },
      { source: "U3", target: "U6", relation_type: "advice", frequency: 3 },
      { source: "U3", target: "U7", relation_type: "advice", frequency: 2 },
      { source: "U6", target: "U9", relation_type: "advice", frequency: 3 },
      { source: "U7", target: "U11", relation_type: "advice", frequency: 3 },
      { source: "U4", target: "U8", relation_type: "collaboration", frequency: 3 },
      { source: "U8", target: "U6", relation_type: "hazard_report", frequency: 2 },
      { source: "U6", target: "U2", relation_type: "hazard_report", frequency: 3 },
      { source: "U9", target: "U6", relation_type: "hazard_report", frequency: 3 },
      { source: "U5", target: "U10", relation_type: "advice", frequency: 2 },
      { source: "U10", target: "U2", relation_type: "hazard_report", frequency: 1 },
      { source: "U7", target: "U12", relation_type: "collaboration", frequency: 1 }
    ],
    network_density: 0.185,
    isolated_nodes_count: 2,
    key_bridges: ["박안전(EHS안전부)", "강조장(생산1팀)", "이생산(생산본부)"],
    opinion_leaders: ["박안전(EHS안전부)", "강조장(생산1팀)"]
  };
}

function getFallbackKPIData() {
  return {
    total_metrics: 6,
    inherent_count: 4,
    collaborative_count: 2,
    stage_breakdown: { prevention: 2, preparedness: 2, response: 1, recovery: 1 },
    department_summary: {
      "생산본부 (과/팀 단위)": [
        {
          id: "KPI_PREV_1",
          name: "작업위험성평가(JHA) 참여율 및 유해위험요인 발굴 건수",
          lifecycle_stage: "prevention",
          type: "inherent",
          weight: 0.7,
          department: "생산본부 (과/팀 단위)",
          target_value: "100% 참여 / 월 15건 이상",
          unit: "건 / %",
          statutory_basis: "산업안전보건법 제36조(위험성평가의 실시) 및 노동부 고시 제2023-19호",
          subnote_evidence: "Ch 7 3.3절 JHA 4단계 전환 메커니즘 및 Ch 1 ANSI Z10 리스크 기반 접근법",
          current_value: 85.0,
          progress_rate: 85.0
        }
      ],
      "전사 현장부서": [
        {
          id: "KPI_RESP_1",
          name: "작업중지권(Stop-Work) 발동 시 경영진 무문책 보장 및 즉시 개선 조치율",
          lifecycle_stage: "response",
          type: "inherent",
          weight: 0.7,
          department: "전사 현장부서",
          target_value: "24시간 이내 100% 피드백",
          unit: "%",
          statutory_basis: "산업안전보건법 제52조(근로자의 작업중지) 및 중대재해처벌법 제4조",
          subnote_evidence: "Ch 7 표 7.1 번호 6: 부하에게 권한 위임 및 리스크 감수",
          current_value: 92.0,
          progress_rate: 92.0
        }
      ]
    }
  };
}

function getFallbackConsultingReport() {
  return {
    organization_name: "안전문화 혁신 추진단",
    overall_maturity_level: "Level 3: 체계적 관리 단계 (Calculative & Systematic Culture)",
    overall_safety_index: 78.4,
    raa_diagnosis: {
      responsibility: 4.1,
      authority: 3.2,
      accountability: 3.9,
      balance_index: 76.5,
      diagnosis_status: "권한 결여형 (Authority Deficit)",
      status_description: "현장 실무진에게 직무 이행 의무는 크나, 실질적인 위험 개선 권한의 위임이 부족하여 권한-책임 불균형이 감지됩니다."
    },
    leadership_diagnosis: {
      average_score: 3.59,
      strongest_attribute: "기대치 2 (윤리 나침반 - 4.2점)",
      weakest_attribute: "기대치 6 (권한위임/리스크 감수 - 2.9점)"
    },
    ona_insights: {
      network_density: 0.185,
      opinion_leaders: ["박안전(EHS안전부)", "강조장(생산1팀)"],
      key_bridges: ["박안전(EHS안전부)", "강조장(생산1팀)", "이생산(생산본부)"],
      isolated_count: 2
    },
    kpi_performance: {
      total_kpis: 6,
      inherent_ratio: "70%",
      collaborative_ratio: "30%",
      average_progress: "90.0%"
    },
    roadmap: [
      {
        phase: "1단계: 즉시 실행 (30-Day Quick Wins)",
        title: "RAA 불균형 해소 및 위험제보 심리적 안전감 확보",
        action_items: [
          "현장 관리감독자에게 작업중지권(Stop-Work) 및 즉시 개선 예산 집행권 전결 위임 (Ch 7 표 7.1 #6)",
          "경영진의 현장 '리스닝 라운딩(Listening Round)' 주 1회 정례화로 신뢰(Trust) 구축",
          "Ch 8 안전 발언권(Voice) 보장: 무문책 위험 제보 채널 개설"
        ],
        target_chapter: "Chapter 7 (RAA Triad) & Chapter 8 (Employee Involvement)"
      },
      {
        phase: "2단계: 체계 정착 (90-Day Systematization)",
        title: "비공식 오피니언 리더 네트워크 활성화 및 법령 매핑 KPI 가동",
        action_items: [
          "ONA 분석에서 도출된 핵심 오피니언 리더를 '안전 챔피언'으로 위촉하고 3단계 영향력 전파망 가동 (Ch 3)",
          "생애주기(예방-대비-대응-복구)별 고유/협업(7:3) KPI 모니터링 시스템 본격 적용",
          "작업위험성평가(JHA) 참여도를 단순 작성률에서 '현장 직원의 주도적 개선율'로 고도화 (Ch 7 3.3절)"
        ],
        target_chapter: "Chapter 3 (ONA Network) & Chapter 6 (Safety Process)"
      },
      {
        phase: "3단계: 문화 내재화 (180-Day Cultural Embeddedness)",
        title: "공정하고 긍정적인 결과관리(Positive Consequences) 체계 확립",
        action_items: [
          "안전 우수 부서 및 모범 실천 직원에 대한 가시적 보상 및 인사 평가 가점제 도입 (Ch 7 결과관리)",
          "안전경영시스템(SMS: ANSI Z10 / ISO 45001)과 전사 비즈니스 핵심 프로세스의 완전 통합 (Ch 5)",
          "주기적 안전문화 진단을 통한 RAA 밸런스 지수 추세 추적 및 부서별 피드백 컨설팅"
        ],
        target_chapter: "Chapter 5 (SMS Overview) & Chapter 7 (Consequence Framework)"
      }
    ],
    consequence_framework: {
      "긍정적 결과관리 (Positive Reinforcement)": [
        "잠재위험(Near-miss) 선제적 발굴 및 작업중지권 정당 발동 시 전사 공유 및 CEO 포상",
        "동료 안전 코칭 및 JHA 품질 우수 조장에 대한 인센티브 및 역량 마일리지 부여",
        "부서별 협업 지표(Collaborative KPI) 달성 시 합동 안전 성과급 지급"
      ],
      "시정 및 교정적 피드백 (Constructive Consequences)": [
        "단순 휴먼 에러(인적 오류)에 대한 무조건적 징계 금지 -> 시스템 결함 원인 분석(RCA) 의무화",
        "고의적 안전수칙 위반이나 위험 은폐에 대한 단계별 재교육 및 직무 적격성 재심사",
        "권한을 행사하지 않고 방치한 관리자에 대한 리더십 코칭 프로그램 필수 이수"
      ]
    }
  };
}

function getFallbackChecklistGroups() {
  return [
    {
      group_id: "APP_7_2_LEADERSHIP",
      title: "최고경영진 / 리더십 팀 안전 책임 점검 (Appendix 7.2)",
      source_reference: "Ch 7 Appendix 7.2 Sample Responsibilities for the Leadership Team",
      category: "계층별 직무 안전 책임",
      target_role: "executive",
      compliance_rate: 87.5,
      items: [
        {
          id: "A72_1",
          text: "모든 조직 기준, 최우수 관리 관행(BMP), 법적 규제 요구사항을 철저히 준수하도록 안전 정책을 공식 수립·공표하였는가?",
          criterion: "전사 안전경영방침 공식 제정 및 전사 게시 여부",
          status: "compliant"
        },
        {
          id: "A72_2",
          text: "모든 직원에게 안전한 작업 환경과 근로 조건을 제공하기 위한 실질적 설비 투자와 작업 환경 개선을 실행하는가?",
          criterion: "안전보건 예산의 안정적 편성 및 적기 집행 실적",
          status: "compliant"
        },
        {
          id: "A72_3",
          text: "안전과 생산 우선순위 사이에 갈등이 발생할 경우, 타협 없이 '안전 우선'으로 의사결정하는가?",
          criterion: "일정 지연 상황에서도 위험 작업중지 지지 및 생산 우선주의 억제",
          status: "partial"
        },
        {
          id: "A72_4",
          text: "안전 프로세스의 각 영역에 명확하고 이해하기 쉬운 책임을 부여하고, 이에 부합하는 충분한 자원과 권한을 하향 위임하였는가?",
          criterion: "직무기술서(Job Description) 상 안전 책임 및 전결권 명시",
          status: "partial"
        }
      ]
    },
    {
      group_id: "APP_7_4_SUPERVISOR",
      title: "현장 감독관 / 관리감독자 안전 책임 점검 (Appendix 7.4)",
      source_reference: "Ch 7 Appendix 7.4 Sample Responsibilities for Supervision",
      category: "계층별 직무 안전 책임",
      target_role: "supervisor",
      compliance_rate: 85.0,
      items: [
        {
          id: "A74_1",
          text: "적용되는 안전 작업 절차와 규칙을 언행일치(Practice what you preach)로 모범 준수하는가?",
          criterion: "감독관 본인의 안전규정 위반 제로(0) 및 솔선수범 행동",
          status: "compliant"
        },
        {
          id: "A74_3",
          text: "작업 시작 전 체크리스트를 활용하여 물리적 현장 안전 점검 및 TBM을 매일 실시하는가?",
          criterion: "일일 점검 체크리스트 기록 및 이상 발견 시 즉각 조치",
          status: "compliant"
        },
        {
          id: "A74_5",
          text: "급박한 위험이 발견되었을 때 주저 없이 작업을 중지시킬 수 있는 작업중지권(Stop-Work)을 행사하는가?",
          criterion: "Ch 7 표 7.1 #6: Empower subordinates and underwrite risk",
          status: "partial"
        }
      ]
    },
    {
      group_id: "CH_9_12_RISK_PERCEPTION",
      title: "조직 위험 지각 진단 16대 전략 체크리스트 (Chapter 9.12)",
      source_reference: "Ch 9 Section 12 Identifying Risk Perception 16 Questions",
      category: "위험 지각 및 인지 편향",
      target_role: "all",
      compliance_rate: 75.0,
      items: [
        {
          id: "C912_1",
          text: "현재 사용 중인 안전 서식과 지침들을 이끄는 조직의 표방 가치가 현장의 일하는 방식과 일치하는가?",
          criterion: "샤인(Schein)의 신봉가치와 현장 기본가정의 일치도",
          status: "compliant"
        },
        {
          id: "C912_4",
          text: "과거 24개월 동안 도입된 신규 프로그램들이 단명할 '이달의 유행(Flavor of the month)'으로 조롱받지 않는가?",
          criterion: "변화 피로도(Change Fatigue) 및 제도 지속성",
          status: "partial"
        },
        {
          id: "C912_5",
          text: "신규 안전 도구를 도입할 때 현장의 업무 부담을 가중시키지 않고 구식 서식을 과감히 통폐합·폐지하였는가?",
          criterion: "Ch 9.14 단순성의 원칙 및 낡은 껍데기 서식 폐지",
          status: "partial"
        }
      ]
    }
  ];
}

