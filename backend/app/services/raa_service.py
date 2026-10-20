import math
from typing import List, Dict, Any
from backend.app.models.schemas import (
    AssessmentAnswer, AssessmentSubmission, RAAScores, 
    LeadershipScores, DimensionScores, AssessmentResult
)
from backend.app.data.seed_data import DEFAULT_ASSESSMENT_ITEMS

def calculate_assessment_result(submissions: List[AssessmentSubmission]) -> AssessmentResult:
    if not submissions:
        # 응답이 없을 경우 기본 시뮬레이션 데이터 제공
        return _generate_benchmark_result()

    # 전체 응답 합산
    item_map = {item["id"]: item for item in DEFAULT_ASSESSMENT_ITEMS}
    item_scores: Dict[str, List[int]] = {item["id"]: [] for item in DEFAULT_ASSESSMENT_ITEMS}

    for sub in submissions:
        for ans in sub.answers:
            if ans.item_id in item_scores:
                item_scores[ans.item_id].append(ans.score)

    avg_item_scores: Dict[str, float] = {}
    for item_id, scores in item_scores.items():
        avg_item_scores[item_id] = sum(scores) / len(scores) if scores else 3.5

    # 1. RAA 삼각점수 계산
    resp_scores = [avg_item_scores[i] for i in ["RAA_RESP_1", "RAA_RESP_2", "RAA_RESP_3"] if i in avg_item_scores]
    auth_scores = [avg_item_scores[i] for i in ["RAA_AUTH_1", "RAA_AUTH_2", "RAA_AUTH_3"] if i in avg_item_scores]
    acct_scores = [avg_item_scores[i] for i in ["RAA_ACCT_1", "RAA_ACCT_2", "RAA_ACCT_3"] if i in avg_item_scores]

    resp_avg = sum(resp_scores) / len(resp_scores) if resp_scores else 3.8
    auth_avg = sum(auth_scores) / len(auth_scores) if auth_scores else 3.1
    acct_avg = sum(acct_scores) / len(acct_scores) if acct_scores else 4.0

    # 균형 지수 (삼원조 간 편차 계산)
    mean_val = (resp_avg + auth_avg + acct_avg) / 3.0
    variance = ((resp_avg - mean_val)**2 + (auth_avg - mean_val)**2 + (acct_avg - mean_val)**2) / 3.0
    std_dev = math.sqrt(variance)
    # 편차가 0일 때 100점, 편차가 1.0일 때 50점 이하로 떨어지는 공식
    balance_index = max(10.0, min(100.0, round(100.0 - (std_dev * 50.0), 1)))

    # 진단 상태 판정
    status, desc = _diagnose_raa_pattern(resp_avg, auth_avg, acct_avg)

    raa = RAAScores(
        responsibility=round(resp_avg, 2),
        authority=round(auth_avg, 2),
        accountability=round(acct_avg, 2),
        balance_index=balance_index,
        diagnosis_status=status,
        status_description=desc
    )

    # 2. 리더십 8대 기대치 점수 계산
    lead_dict: Dict[str, float] = {}
    for i in range(1, 9):
        key = f"LEAD_EXP_{i}"
        lead_dict[f"기대치 {i}"] = round(avg_item_scores.get(key, 3.7), 2)

    avg_lead = sum(lead_dict.values()) / len(lead_dict)
    sorted_lead = sorted(lead_dict.items(), key=lambda x: x[1], reverse=True)
    strongest = f"{sorted_lead[0][0]} ({sorted_lead[0][1]}점)"
    weakest = f"{sorted_lead[-1][0]} ({sorted_lead[-1][1]}점)"

    leadership = LeadershipScores(
        item_scores=lead_dict,
        average_score=round(avg_lead, 2),
        strongest_attribute=strongest,
        weakest_attribute=weakest
    )

    # 3. 기타 차원 점수
    perc_avg = (avg_item_scores.get("PERC_1", 3.8) + avg_item_scores.get("PERC_2", 3.6)) / 2.0
    ps_avg = (avg_item_scores.get("PS_1", 3.4) + avg_item_scores.get("PS_2", 3.6)) / 2.0

    # Ch 7 관리자 vs 리더 역할 비중
    manager_ratio = round(min(80.0, max(20.0, 50.0 + (auth_avg - resp_avg) * 15.0)), 1)
    leader_ratio = round(100.0 - manager_ratio, 1)

    dimensions = DimensionScores(
        perception_of_safety=round(perc_avg, 2),
        psychological_safety=round(ps_avg, 2),
        manager_vs_leader={"관리자 성향(규정·통제)": manager_ratio, "리더십 성향(비전·영감)": leader_ratio}
    )

    # 핵심 발견 및 권고사항
    key_findings = [
        f"조직의 RAA 삼원조 균형 지수는 {balance_index}점으로, '{status}' 패턴을 보입니다.",
        f"8대 리더십 기대치 중 최우수 항목은 '{strongest}'이며, 가장 개선이 시급한 영역은 '{weakest}'입니다.",
        f"심리적 안전감(Psychological Safety) 점수는 5점 만점 중 {round(ps_avg, 2)}점으로 현장의 자유로운 발언 문화 조성이 필요합니다."
    ]

    consequence_recs = [
        "처벌 중심의 사후 관리에서 탈피하여 안전 행동(JHA 참여, 선제적 위험보고)에 대한 즉각적 인정과 긍정적 결과(Positive Consequences) 체계 신설",
        "현장 관리감독자에게 실질적 안전 작업중지권(Stop-Work Authority) 및 위험 제거 예산 집행 권한 하향 위임(Delegation)",
        "경영진의 솔선수범 현장 안전 라운딩을 통한 상호 신뢰(Trust) 회복 및 다계층 소통 정례화"
    ]

    return AssessmentResult(
        respondent_count=len(submissions),
        raa_scores=raa,
        leadership_scores=leadership,
        dimension_scores=dimensions,
        key_findings=key_findings,
        consequence_recommendations=consequence_recs
    )

def _diagnose_raa_pattern(resp: float, auth: float, acct: float):
    # 권한(Authority)이 책임(Responsibility)이나 책무성(Accountability)보다 현저히 낮은 경우
    if auth < resp - 0.5 and auth < acct - 0.5:
        return (
            "권한 결여형 (Authority Deficit)",
            "현장 실무진에게 법적·절차적 책임과 이행 의무는 과중하게 부과되나, 이를 해결할 실질적 의사결정 권한과 예산이 위임되지 않아 무력감과 피로도가 누적되는 상태입니다."
        )
    # 책임(Responsibility: 리더의 궁극적 결과 책임)이 낮은 경우
    elif resp < acct - 0.5:
        return (
            "책임 전가형 (Blame Culture)",
            "사고나 문제 발생 시 최고위층이 궁극적 책임을 지기보다는 현장 작업자의 휴먼 에러(인적 오류)나 부주의로 책임을 전가하는 취약한 안전문화 패턴입니다."
        )
    # 책무성(Accountability)이 현저히 낮은 경우
    elif acct < auth - 0.5 or acct < resp - 0.5:
        return (
            "책무성 실종형 (Accountability Vacuum)",
            "권한은 부여되어 있으나 명확한 안전 성과 결과관리(Consequence Management)와 이행 점검 피드백이 없어 안전 수칙 준수가 느슨해지는 상태입니다."
        )
    else:
        return (
            "삼원조 균형형 (High-Performing Triad)",
            "책임, 권한, 책무성이 조화롭게 맞물려 리더십의 솔선수범과 현장의 자율적 안전 실천이 선순환을 이루고 있는 바람직한 상태입니다."
        )

def _generate_benchmark_result() -> AssessmentResult:
    # 벤치마크 기본 시뮬레이션 데이터
    return AssessmentResult(
        respondent_count=12,
        raa_scores=RAAScores(
            responsibility=4.1,
            authority=3.2,
            accountability=3.9,
            balance_index=76.5,
            diagnosis_status="권한 결여형 (Authority Deficit)",
            status_description="현장 실무진에게 직무 이행 의무는 크나, 실질적인 위험 개선 권한(작업중지권 등)의 위임이 부족하여 권한-책임 불균형이 감지됩니다."
        ),
        leadership_scores=LeadershipScores(
            item_scores={
                "기대치 1 (비전/변화)": 4.0,
                "기대치 2 (윤리 나침반)": 4.2,
                "기대치 3 (학습/적응)": 3.6,
                "기대치 4 (위험/기회 균형)": 3.8,
                "기대치 5 (고성과 팀)": 3.5,
                "기대치 6 (권한위임/리스크)": 2.9,
                "기대치 7 (차세대 리더육성)": 3.3,
                "기대치 8 (전방위 소통)": 3.4
            },
            average_score=3.59,
            strongest_attribute="기대치 2 (윤리 나침반 - 4.2점)",
            weakest_attribute="기대치 6 (권한위임/리스크 감수 - 2.9점)"
        ),
        dimension_scores=DimensionScores(
            perception_of_safety=3.85,
            psychological_safety=3.35,
            manager_vs_leader={"관리자 성향(규정·통제)": 62.0, "리더십 성향(비전·영감)": 38.0}
        ),
        key_findings=[
            "책임(4.1점) 및 책무성(3.9점) 대비 권한 위임(3.2점)이 취약하여 '권한 결여형' 병리 현상이 나타남.",
            "미 육군 FM 6-22 8대 기대치 중 리더십의 '권한 위임 및 리스크 감수(2.9점)'가 최하위로 측정됨.",
            "Ch 7 기준 관리자적 통제(62%)가 리더십 비전 제시(38%)보다 우세하여 단기 순응주의에 갇힐 위험이 있음."
        ],
        consequence_recommendations=[
            "Ch 7 권한 위임(Delegation)의 제도화: 현장 조장 및 감독자에게 '즉시 위험개선 전결권' 부여",
            "Ch 7 긍정적 결과관리: 안전 지적 위주의 패널티 문화를 개선하고 '선제적 위험제보 인정 프로그램' 도입",
            "Ch 8 안전 발언권(Voice) 보장: 무문책 작업중지제 운영으로 심리적 안전감 제고"
        ]
    )
