from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

# -------------------------------------------------------------
# 0. 회원가입 및 사용자 인증 모델 (Auth Models)
# -------------------------------------------------------------

class UserRegister(BaseModel):
    email: str
    password: str
    name: str
    company_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    company_name: str
    has_completed_assessment: bool = False
    active_session_id: Optional[str] = None

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# -------------------------------------------------------------
# 1. 진단 설문 모델 (Assessment Models)
# -------------------------------------------------------------


class AssessmentItem(BaseModel):
    id: str
    dimension: str  # RAA_RESPONSIBILITY, RAA_AUTHORITY, RAA_ACCOUNTABILITY, LEADERSHIP_1~8, MENTAL_MODEL, PSYCHOLOGICAL_SAFETY
    category: str   # RAA Triad, 8대 리더십 기대치, 안전 지각, 직원 참여 등
    question: str
    description: Optional[str] = None
    target_role: Optional[str] = "all"  # executive, manager, worker, all

class AssessmentAnswer(BaseModel):
    item_id: str
    score: int = Field(..., ge=1, le=5)  # 1(전혀 그렇지 않다) ~ 5(매우 그렇다)

class AssessmentSubmission(BaseModel):
    respondent_id: str
    respondent_name: str
    department: str
    role: str  # executive, manager, worker
    answers: List[AssessmentAnswer]

class RAAScores(BaseModel):
    responsibility: float
    authority: float
    accountability: float
    balance_index: float  # 0~100 (100에 가까울수록 삼각 균형 완벽)
    diagnosis_status: str  # e.g., "균형 양호", "권한 없는 책임 과중형", "책무성 결여형" 등
    status_description: str

class LeadershipScores(BaseModel):
    item_scores: Dict[str, float]  # 기대치 1~8별 평균
    average_score: float
    strongest_attribute: str
    weakest_attribute: str

class DimensionScores(BaseModel):
    perception_of_safety: float  # Ch 1 & 9
    psychological_safety: float  # Ch 8
    manager_vs_leader: Dict[str, float]  # 관리자 성향 vs 리더 성향

class AssessmentResult(BaseModel):
    respondent_count: int
    raa_scores: RAAScores
    leadership_scores: LeadershipScores
    dimension_scores: DimensionScores
    key_findings: List[str]
    consequence_recommendations: List[str]  # Ch 7 결과관리 방안

# -------------------------------------------------------------
# 회사 프로필 및 산업별 진단 세션 모델 (Company & Onboarding)
# -------------------------------------------------------------

class CompanyProfile(BaseModel):
    company_name: str = "우수안전산업"
    industry: str = "manufacturing"  # manufacturing, construction, chemical, logistics, public_safety, service_other
    company_size: str = "medium"     # small, medium, large, public
    headcount: Optional[int] = 150
    evaluator_name: Optional[str] = "안전보건관리책임자"
    evaluator_role: Optional[str] = "manager"  # executive, manager, worker

class AssessmentSessionCreate(BaseModel):
    company: CompanyProfile

class AssessmentSessionUpdate(BaseModel):
    current_step: int
    answers: Dict[str, int]
    is_completed: bool = False

class AssessmentSessionResponse(BaseModel):
    session_id: str
    company: CompanyProfile
    current_step: int
    answers: Dict[str, int]
    is_completed: bool
    progress_percentage: float
    total_questions: int
    answered_count: int
    result: Optional[AssessmentResult] = None
    industry_benchmark: Optional[Dict[str, Any]] = None


# -------------------------------------------------------------
# 2. 조직 네트워크 분석 모델 (ONA Models - Ch 3)
# -------------------------------------------------------------

class ONANode(BaseModel):
    id: str
    name: str
    department: str
    role: str
    degree_centrality: float = 0.0
    betweenness_centrality: float = 0.0
    influence_score_3deg: float = 0.0  # 3단계 영향력 법칙 점수
    is_opinion_leader: bool = False
    is_isolated: bool = False

class ONAEdge(BaseModel):
    source: str
    target: str
    relation_type: str  # advice(안전 조언), hazard_report(위험 제보), collaboration(협업)
    frequency: int = 1  # 1(가끔) ~ 3(매우 자주)

class ONAGraphData(BaseModel):
    nodes: List[ONANode]
    edges: List[ONAEdge]
    network_density: float
    isolated_nodes_count: int
    key_bridges: List[str]  # 부서 간 소통 브릿지 역할을 하는 핵심 구성원
    opinion_leaders: List[str]  # 3단계 영향력이 높은 오피니언 리더

# -------------------------------------------------------------
# 3. 생애주기 & 법령 연계 KPI 모델 (KPI 6대 원칙 반영)
# -------------------------------------------------------------

class KPIMetric(BaseModel):
    id: str
    name: str
    chapter_source: Optional[str] = "Ch 1"  # Ch 1 ~ Ch 10
    table_figure_ref: Optional[str] = ""  # Fig 1.1, Table 7.1 등
    lifecycle_stage: str  # planning(기획), prevention(예방), preparedness(대비), response(대응), recovery(복구/개선)
    type: str  # inherent(고유 70%), collaborative(협업 30%)
    weight: float  # 0.7 or 0.3
    department: str
    target_value: str
    unit: str
    statutory_basis: str  # 법적 근거 (산안법, 중처법 조문)
    subnote_evidence: str  # 교재 서브노트 판단 근거 (표 7.1, 7.2 등)
    current_value: Optional[float] = 0.0
    progress_rate: Optional[float] = 0.0
    note: Optional[str] = ""
    updated_at: Optional[str] = None

class KPIValueUpdate(BaseModel):
    current_value: float
    progress_rate: Optional[float] = None
    target_value: Optional[str] = None
    note: Optional[str] = None

class KPISummary(BaseModel):
    total_metrics: int
    inherent_count: int
    collaborative_count: int
    stage_breakdown: Dict[str, int]
    department_summary: Dict[str, List[KPIMetric]]
    overall_progress: Optional[float] = 0.0
    inherent_avg_progress: Optional[float] = 0.0
    collaborative_avg_progress: Optional[float] = 0.0
    stage_progress: Optional[Dict[str, float]] = None

# -------------------------------------------------------------
# 4. 종합 컨설팅 및 결과 관리 모델 (Consulting & Roadmap)
# -------------------------------------------------------------

class RoadmapMilestone(BaseModel):
    phase: str  # 30-Day, 90-Day, 180-Day
    title: str
    action_items: List[str]
    target_chapter: str  # 연계 교재 챕터

class ConsultingReport(BaseModel):
    organization_name: str
    overall_maturity_level: str  # e.g., "Level 3: 체계적 관리 단계"
    overall_safety_index: float  # 100점 만점
    raa_diagnosis: Dict[str, Any]
    leadership_diagnosis: Dict[str, Any]
    ona_insights: Dict[str, Any]
    kpi_performance: Dict[str, Any]
    roadmap: List[RoadmapMilestone]
    consequence_framework: Dict[str, List[str]]  # 긍정적 보상 체계 vs 시정 피드백 체계

# -------------------------------------------------------------
# 5. 교재 부록 & 점검 프로세스 체크리스트 모델 (Checklist Models)
# -------------------------------------------------------------

class ChecklistItem(BaseModel):
    id: str
    text: str
    criterion: str  # 실무적 평가 기준 또는 교재 근거
    status: str = "compliant"  # compliant(준수), partial(부분준수), non_compliant(미준수)
    note: Optional[str] = ""

class ChecklistGroup(BaseModel):
    group_id: str
    title: str
    source_reference: str  # e.g., "Appendix 7.2 최고경영진 안전 책임 샘플"
    category: str          # 계층별 직무 책임, 문화 진단, 위험 지각, 위원회/프로세스
    target_role: str       # executive, site_manager, supervisor, employee, all
    items: List[ChecklistItem]
    compliance_rate: float = 0.0  # 0 ~ 100%

class ChecklistSubmission(BaseModel):
    group_id: str
    evaluator_name: str
    department: str
    item_statuses: Dict[str, str]  # item_id -> compliant / partial / non_compliant
    notes: Optional[Dict[str, str]] = {}

