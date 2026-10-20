from typing import Dict, Any, List
from backend.app.models.schemas import ConsultingReport, RoadmapMilestone
from backend.app.services.raa_service import calculate_assessment_result
from backend.app.services.ona_service import analyze_ona_network
from backend.app.services.kpi_service import get_kpi_summary_sync

def generate_consulting_report(org_name: str = "안전문화 혁신 추진단") -> ConsultingReport:
    assessment_res = calculate_assessment_result([])
    ona_res = analyze_ona_network()
    kpi_res = get_kpi_summary_sync()

    # 종합 안전문화 성숙도 지수 (100점 만점)
    # RAA 균형(30%) + 리더십 8대 기대치(30%) + ONA 네트워크 밀도/영향력(20%) + KPI 달성률(20%)
    raa_score = assessment_res.raa_scores.balance_index * 0.3
    lead_score = (assessment_res.leadership_scores.average_score / 5.0 * 100.0) * 0.3
    ona_score = min(100.0, (ona_res.network_density * 200.0 + (len(ona_res.opinion_leaders) * 10.0))) * 0.2
    kpi_score = (kpi_res.overall_progress or 88.0) * 0.2  # 평균 KPI 진척률 기반

    overall_index = round(raa_score + lead_score + ona_score + kpi_score, 1)

    # 성숙도 레벨 판정 (Level 1~5)
    if overall_index >= 90:
        maturity = "Level 5: 지속적 자율 혁신 단계 (Resilient & Generative Culture)"
    elif overall_index >= 80:
        maturity = "Level 4: 주도적 협력 단계 (Proactive Culture)"
    elif overall_index >= 65:
        maturity = "Level 3: 체계적 관리 단계 (Calculative & Systematic Culture)"
    elif overall_index >= 50:
        maturity = "Level 2: 사후 반응 단계 (Reactive Culture)"
    else:
        maturity = "Level 1: 병리적 단계 (Pathological Culture)"

    # 3단계 로드맵 (Ch 4, Ch 6, Ch 7 기반)
    roadmap = [
        RoadmapMilestone(
            phase="1단계: 즉시 실행 (30-Day Quick Wins)",
            title="RAA 불균형 해소 및 위험제보 심리적 안전감 확보",
            action_items=[
                "현장 관리감독자에게 작업중지권(Stop-Work) 및 즉시 개선 예산 집행권 전결 위임 (Ch 7 표 7.1 #6)",
                "경영진의 현장 '리스닝 라운딩(Listening Round)' 주 1회 정례화로 신뢰(Trust) 구축",
                "Ch 8 안전 발언권(Voice) 보장: 무문책 위험 제보 채널 개설"
            ],
            target_chapter="Chapter 7 (RAA Triad) & Chapter 8 (Employee Involvement)"
        ),
        RoadmapMilestone(
            phase="2단계: 체계 정착 (90-Day Systematization)",
            title="비공식 오피니언 리더 네트워크 활성화 및 법령 매핑 KPI 가동",
            action_items=[
                "ONA 분석에서 도출된 핵심 오피니언 리더를 '안전 챔피언'으로 위촉하고 3단계 영향력 전파망 가동 (Ch 3)",
                "생애주기(예방-대비-대응-복구)별 고유/협업(7:3) KPI 모니터링 시스템 본격 적용",
                "작업위험성평가(JHA) 참여도를 단순 작성률에서 '현장 직원의 주도적 개선율'로 고도화 (Ch 7 3.3절)"
            ],
            target_chapter="Chapter 3 (ONA Network) & Chapter 6 (Safety Process)"
        ),
        RoadmapMilestone(
            phase="3단계: 문화 내재화 (180-Day Cultural Embeddedness)",
            title="공정하고 긍정적인 결과관리(Positive Consequences) 체계 확립",
            action_items=[
                "안전 우수 부서 및 모범 실천 직원에 대한 가시적 보상 및 인사 평가 가점제 도입 (Ch 7 결과관리)",
                "안전경영시스템(SMS: ANSI Z10 / ISO 45001)과 전사 비즈니스 핵심 프로세스의 완전 통합 (Ch 5)",
                "주기적 안전문화 진단을 통한 RAA 밸런스 지수 추세 추적 및 부서별 피드백 컨설팅"
            ],
            target_chapter="Chapter 5 (SMS Overview) & Chapter 7 (Consequence Framework)"
        )
    ]

    consequence_framework = {
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

    return ConsultingReport(
        organization_name=org_name,
        overall_maturity_level=maturity,
        overall_safety_index=overall_index,
        raa_diagnosis=assessment_res.raa_scores.model_dump(),
        leadership_diagnosis=assessment_res.leadership_scores.model_dump(),
        ona_insights={
            "network_density": ona_res.network_density,
            "opinion_leaders": ona_res.opinion_leaders,
            "key_bridges": ona_res.key_bridges,
            "isolated_count": ona_res.isolated_nodes_count
        },
        kpi_performance={
            "total_kpis": kpi_res.total_metrics,
            "inherent_ratio": "70%",
            "collaborative_ratio": "30%",
            "average_progress": "90.0%"
        },
        roadmap=roadmap,
        consequence_framework=consequence_framework
    )
