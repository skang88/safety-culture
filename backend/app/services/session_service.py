import uuid
import datetime
from typing import Dict, Any, Optional
from backend.app.core.db import get_database, mongo_db
from backend.app.models.schemas import (
    CompanyProfile, AssessmentSessionResponse, AssessmentSubmission, 
    AssessmentAnswer, AssessmentResult
)
from backend.app.data.seed_data import DEFAULT_ASSESSMENT_ITEMS
from backend.app.services.raa_service import calculate_assessment_result

# 인메모리 폴백 스토어
_SESSIONS: Dict[str, Dict[str, Any]] = {}

INDUSTRY_METADATA = {
    "manufacturing": {
        "label": "제조업 (Manufacturing)",
        "benchmark_score": 75.3,
        "key_hazards": ["끼임·협착(Conveyor/Press)", "기계 정비 중 오가동(LOTO)", "화물 운반 지게차 충돌"],
        "statutory_focus": "산안법 제38조(안전조치: 기계·기구) 및 제36조(위험성평가 고시)",
        "special_advice": "생산 압박 속에서 작업 속도를 위해 인터록을 해제하거나 편법(지름길)을 쓰는 관행을 근절하고 관리감독자의 솔선수범이 필수적입니다."
    },
    "construction": {
        "label": "건설업 (Construction)",
        "benchmark_score": 71.4,
        "key_hazards": ["고소작업 추락(Fall from height)", "가설구조물 붕괴", "중장비 협착 및 낙하물 타격"],
        "statutory_focus": "중처법 제4조(안전보건관리체계) 및 산안법 제64조(도급인 의무)",
        "special_advice": "다단계 하도급 및 일용직 근로자의 잦은 교체 환경이므로, 매일 작업 시작 전 TBM과 현장 작업중지권(Stop-Work Authority)의 실질적 행사가 생명을 좌우합니다."
    },
    "chemical": {
        "label": "화학·석유화학 (Chemical & Energy)",
        "benchmark_score": 81.2,
        "key_hazards": ["유독물질 누출", "화재·폭발(Fire & Explosion)", "밀폐공간 질식(Confined Space)"],
        "statutory_focus": "산안법 제44조(공정안전보고서 PSM) 및 중처법 위험물 관리",
        "special_advice": "공정안전관리(PSM) 절차 준수와 더불어 아차사고(Near-miss)와 미세 누출 징후에 대한 자발적 보고를 장려하는 심리적 안전감이 핵심입니다."
    },
    "logistics": {
        "label": "운송·물류 (Logistics & Transport)",
        "benchmark_score": 73.0,
        "key_hazards": ["물류창고 지게차·보행자 충돌", "중량물 취급 근골격계 질환", "야간·교대근무 졸음 및 과로"],
        "statutory_focus": "산안법 제39조(보건조치) 및 배송·상하차 근로자 보호 지침",
        "special_advice": "정시 배송 압박과 과로 리스크를 완화하고, 상하차 현장의 스마트 동선 분리 및 관리자의 정서적 라포 형성이 필요합니다."
    },
    "public_safety": {
        "label": "공공·소방·방재 (Public Safety & Emergency)",
        "benchmark_score": 78.5,
        "key_hazards": ["재난 현장 급박 위험 및 붕괴", "외상 후 스트레스(PTSD)", "현장 지휘체계 혼선"],
        "statutory_focus": "재난 및 안전관리 기본법, 소방공무원 보건안전 및 복지 기본법",
        "special_advice": "상명하복 위계 문화 속에서도 위험 상황 시 하급자가 상관에게 직언할 수 있는 2-Way 커뮤니케이션(Ch 7 표 7.1 #8)이 필수적입니다."
    },
    "service_other": {
        "label": "서비스 및 기타 산업 (Services & Others)",
        "benchmark_score": 74.0,
        "key_hazards": ["전도·미끄러짐", "감정 노동 스트레스", "화재 및 피난 통로 장애"],
        "statutory_focus": "산업안전보건법 일반 예방 기준 및 고객응대근로자 보호조치",
        "special_advice": "사고 빈도가 낮다고 방심하는 '무손실=무위험' 멘탈 모델을 탈피하고 일상적 안전 의식을 내재화해야 합니다."
    }
}

async def create_session(company: CompanyProfile, user_id: Optional[str] = None) -> AssessmentSessionResponse:
    session_id = f"sess_{uuid.uuid4().hex[:12]}"
    
    session_data = {
        "session_id": session_id,
        "user_id": user_id,
        "company": company.model_dump(),
        "current_step": 0,
        "answers": {},
        "is_completed": False,
        "created_at": datetime.datetime.utcnow(),
        "updated_at": datetime.datetime.utcnow()
    }

    db = get_database()
    if mongo_db.is_connected and db is not None:
        await db.sessions.insert_one(session_data)
        if user_id:
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {"active_session_id": session_id}}
            )
    else:
        _SESSIONS[session_id] = session_data

    return _build_session_response(session_data)

async def get_session(session_id: str) -> Optional[AssessmentSessionResponse]:
    db = get_database()
    session_data = None

    if mongo_db.is_connected and db is not None:
        session_data = await db.sessions.find_one({"session_id": session_id})
    else:
        session_data = _SESSIONS.get(session_id)

    if not session_data:
        return None

    return _build_session_response(session_data)

async def get_latest_session_for_user(user_id: str) -> Optional[AssessmentSessionResponse]:
    db = get_database()
    session_data = None

    if mongo_db.is_connected and db is not None:
        session_data = await db.sessions.find_one({"user_id": user_id}, sort=[("updated_at", -1)])
    else:
        for s in _SESSIONS.values():
            if s.get("user_id") == user_id:
                session_data = s
                break

    if not session_data:
        return None

    return _build_session_response(session_data)

async def save_session_progress(session_id: str, current_step: int, answers: Dict[str, int], is_completed: bool = False) -> AssessmentSessionResponse:
    db = get_database()
    now = datetime.datetime.utcnow()

    if mongo_db.is_connected and db is not None:
        await db.sessions.update_one(
            {"session_id": session_id},
            {
                "$set": {
                    "current_step": current_step,
                    "answers": answers,
                    "is_completed": is_completed,
                    "updated_at": now
                }
            },
            upsert=True
        )
        session_data = await db.sessions.find_one({"session_id": session_id})
        
        # 유저 상태도 완료로 업데이트
        if is_completed and session_data and session_data.get("user_id"):
            await db.users.update_one(
                {"user_id": session_data["user_id"]},
                {"$set": {"has_completed_assessment": True}}
            )
    else:
        if session_id not in _SESSIONS:
            _SESSIONS[session_id] = {
                "session_id": session_id,
                "company": CompanyProfile().model_dump(),
                "current_step": current_step,
                "answers": {},
                "is_completed": False
            }
        _SESSIONS[session_id]["current_step"] = current_step
        _SESSIONS[session_id]["answers"] = answers
        _SESSIONS[session_id]["is_completed"] = is_completed
        session_data = _SESSIONS[session_id]

    return _build_session_response(session_data)

def _build_session_response(data: Dict[str, Any]) -> AssessmentSessionResponse:
    total_q = len(DEFAULT_ASSESSMENT_ITEMS)
    answers = data.get("answers", {})
    answered_cnt = len(answers)
    prog_pct = round((answered_cnt / total_q) * 100.0, 1) if total_q > 0 else 0.0

    company_prof = CompanyProfile(**data["company"])
    ind_key = company_prof.industry if company_prof.industry in INDUSTRY_METADATA else "manufacturing"
    bench_info = INDUSTRY_METADATA.get(ind_key, INDUSTRY_METADATA["manufacturing"])

    result_obj: Optional[AssessmentResult] = None
    if data.get("is_completed") or answered_cnt >= 5:
        # 실제 사용자가 입력한 응답으로만 진단 결과 산출
        submission = AssessmentSubmission(
            respondent_id=data["session_id"],
            respondent_name=company_prof.evaluator_name or "평가자",
            department=f"{company_prof.company_name} 안전보건팀",
            role=company_prof.evaluator_role or "manager",
            answers=[AssessmentAnswer(item_id=k, score=v) for k, v in answers.items()]
        )
        result_obj = calculate_assessment_result([submission])
        
        # 회사 및 산업 특성 반영 리포트 보강
        result_obj.key_findings.insert(0, f"[{company_prof.company_name}]의 {bench_info['label']} 맞춤형 안전문화 진단 결과입니다.")
        result_obj.consequence_recommendations.insert(0, f"{bench_info['label']} 중점 과제: {bench_info['special_advice']}")

    return AssessmentSessionResponse(
        session_id=data["session_id"],
        company=company_prof,
        current_step=data.get("current_step", 0),
        answers=answers,
        is_completed=data.get("is_completed", False),
        progress_percentage=prog_pct,
        total_questions=total_q,
        answered_count=answered_cnt,
        result=result_obj,
        industry_benchmark=bench_info
    )
