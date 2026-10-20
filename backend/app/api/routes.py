from fastapi import APIRouter, HTTPException, Query, Header
from typing import List, Dict, Any, Optional
from backend.app.models.schemas import (
    AssessmentItem, AssessmentSubmission, AssessmentResult,
    ONAGraphData, KPIMetric, KPISummary, KPIValueUpdate, ConsultingReport,
    ChecklistGroup, ChecklistSubmission,
    CompanyProfile, AssessmentSessionCreate, AssessmentSessionUpdate, AssessmentSessionResponse,
    UserRegister, UserLogin, UserResponse, AuthResponse
)
from backend.app.data.seed_data import DEFAULT_ASSESSMENT_ITEMS
from backend.app.services.raa_service import calculate_assessment_result
from backend.app.services.ona_service import analyze_ona_network
from backend.app.services.kpi_service import (
    get_kpi_summary, add_or_update_kpi, update_kpi_value, delete_kpi, reset_kpis
)
from backend.app.services.consulting_service import generate_consulting_report
from backend.app.services.checklist_service import (
    get_checklist_groups, update_checklist_status, get_checklist_overview_stats
)
from backend.app.services.session_service import (
    create_session, get_session, save_session_progress, get_latest_session_for_user
)
from backend.app.services.auth_service import (
    register_user, login_user, get_current_user
)

router = APIRouter()

# -------------------------------------------------------------
# 0. 간편 회원가입 및 로그인 API
# -------------------------------------------------------------

@router.post("/auth/register", response_model=AuthResponse)
async def auth_register(data: UserRegister):
    try:
        return await register_user(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/auth/login", response_model=AuthResponse)
async def auth_login(data: UserLogin):
    try:
        return await login_user(data)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/auth/me", response_model=UserResponse)
async def auth_me(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="인증 토큰이 필요합니다.")
    token = authorization.split(" ")[1]
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="유효하지 않거나 만료된 토큰입니다.")
    return user


# 메모리 상 제출 목록 보관
_SUBMISSIONS: List[AssessmentSubmission] = []

@router.get("/assessment/items", response_model=List[AssessmentItem])
def get_assessment_items():
    return [AssessmentItem(**item) for item in DEFAULT_ASSESSMENT_ITEMS]

@router.post("/assessment/submit", response_model=Dict[str, str])
def submit_assessment(submission: AssessmentSubmission):
    _SUBMISSIONS.append(submission)
    return {"message": "진단 응답이 성공적으로 제출되었습니다.", "submission_id": submission.respondent_id}

@router.get("/assessment/results", response_model=AssessmentResult)
def get_assessment_results():
    return calculate_assessment_result(_SUBMISSIONS)

@router.get("/ona/graph", response_model=ONAGraphData)
def get_ona_graph():
    return analyze_ona_network()

@router.get("/kpi/summary", response_model=KPISummary)
async def get_kpis():
    return await get_kpi_summary()

@router.post("/kpi/metric", response_model=KPIMetric)
async def save_kpi(metric: KPIMetric):
    return await add_or_update_kpi(metric)

@router.put("/kpi/metric/{metric_id}", response_model=KPIMetric)
async def update_kpi(metric_id: str, metric: KPIMetric):
    metric.id = metric_id
    return await add_or_update_kpi(metric)

@router.patch("/kpi/metric/{metric_id}/value", response_model=KPIMetric)
async def update_kpi_metric_value(metric_id: str, update_data: KPIValueUpdate):
    try:
        return await update_kpi_value(metric_id, update_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/kpi/metric/{metric_id}", response_model=Dict[str, Any])
async def remove_kpi(metric_id: str):
    success = await delete_kpi(metric_id)
    if not success:
        raise HTTPException(status_code=404, detail="해당 KPI 지표를 찾을 수 없습니다.")
    return {"message": "KPI 지표가 성공적으로 삭제되었습니다.", "id": metric_id}

@router.post("/kpi/reset", response_model=KPISummary)
async def reset_kpi_metrics():
    return await reset_kpis()

@router.get("/consulting/report", response_model=ConsultingReport)
def get_consulting_report(org_name: str = "안전문화 혁신 추진단"):
    return generate_consulting_report(org_name)

# -------------------------------------------------------------
# 교재 부록 & 점검 프로세스 체크리스트 API
# -------------------------------------------------------------

@router.get("/checklists/groups", response_model=List[ChecklistGroup])
def list_checklist_groups(category: Optional[str] = None, target_role: Optional[str] = None):
    return get_checklist_groups(category=category, target_role=target_role)

@router.post("/checklists/submit", response_model=ChecklistGroup)
def submit_checklist(submission: ChecklistSubmission):
    try:
        return update_checklist_status(submission)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/checklists/stats", response_model=Dict[str, Any])
def get_checklist_stats():
    return get_checklist_overview_stats()

# -------------------------------------------------------------
# 회사 온보딩 & Step-by-Step 진단 세션 API
# -------------------------------------------------------------

@router.post("/session/start", response_model=AssessmentSessionResponse)
async def start_session(data: AssessmentSessionCreate, authorization: Optional[str] = Header(None)):
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        user = await get_current_user(token)
        if user:
            user_id = user.id
    return await create_session(data.company, user_id=user_id)

@router.get("/session/user/latest", response_model=Optional[AssessmentSessionResponse])
async def get_user_latest_session(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="인증 토큰이 필요합니다.")
    token = authorization.split(" ")[1]
    user = await get_current_user(token)
    if not user:
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰입니다.")
    return await get_latest_session_for_user(user.id)

@router.get("/session/{session_id}", response_model=AssessmentSessionResponse)
async def retrieve_session(session_id: str):
    sess = await get_session(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다.")
    return sess

@router.put("/session/{session_id}/save", response_model=AssessmentSessionResponse)
async def save_progress(session_id: str, data: AssessmentSessionUpdate):
    return await save_session_progress(
        session_id=session_id,
        current_step=data.current_step,
        answers=data.answers,
        is_completed=data.is_completed
    )



