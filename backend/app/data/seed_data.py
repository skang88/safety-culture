"""
Elsevier (2019) 『Safety Culture』 원문 및 서브노트 기반 시드 데이터
"""

# --------------------------------------------------------------------------
# 1. 안전문화 & 리더십 진단 문항 (Chapter 7 RAA, Table 7.1 리더십 8대 기대치 등)
# --------------------------------------------------------------------------
DEFAULT_ASSESSMENT_ITEMS = [
    # [RAA - Responsibility (책임: 리더십의 최종 결과 책임 및 부하 전가 불가)]
    {
        "id": "RAA_RESP_1",
        "dimension": "RAA_RESPONSIBILITY",
        "category": "RAA 삼원조 (책임)",
        "question": "우리 조직의 리더십은 안전 사고나 문제 발생 시 하위 직원을 탓하지 않고 최고위층이 궁극적 결과를 책임진다.",
        "description": "Ch 7 에드가 샤인 명제 및 RAA 트라이어드: Leadership is responsible for results and cannot blame subordinate.",
        "target_role": "all"
    },
    {
        "id": "RAA_RESP_2",
        "dimension": "RAA_RESPONSIBILITY",
        "category": "RAA 삼원조 (책임)",
        "question": "경영진은 안전을 비용이나 생산의 종속 변수가 아닌, 타협할 수 없는 핵심 가치이자 리더의 고유 책임으로 인식한다.",
        "description": "Ch 7 관리자와 리더의 역할 차이: 비전 제시 및 안전 최우선 가치 내재화.",
        "target_role": "all"
    },
    {
        "id": "RAA_RESP_3",
        "dimension": "RAA_RESPONSIBILITY",
        "category": "RAA 삼원조 (책임)",
        "question": "안전 전문가는 단순한 기술자에 머무르지 않고, 시스템 전반의 위험을 경영진에게 직언할 수 있는 신뢰받는 리더로 인정받는다.",
        "description": "Ch 7 안전 전문가의 4단계 역할 전환 메커니즘 (기술자 -> 훈련자 -> 품질관리자 -> 신뢰받는 리더).",
        "target_role": "all"
    },

    # [RAA - Authority (권한: 상급자가 하급자에게 합법적으로 위임 가능한 재량)]
    {
        "id": "RAA_AUTH_1",
        "dimension": "RAA_AUTHORITY",
        "category": "RAA 삼원조 (권한)",
        "question": "현장 관리감독자 및 작업자는 급박한 위험이 발생했을 때 작업을 즉시 중지할 수 있는 실질적 권한(Stop-Work Authority)을 행사할 수 있다.",
        "description": "Ch 7 권한의 하향 위임: Flows from top to bottom.",
        "target_role": "all"
    },
    {
        "id": "RAA_AUTH_2",
        "dimension": "RAA_AUTHORITY",
        "category": "RAA 삼원조 (권한)",
        "question": "안전 개선에 필요한 예산 집행과 위험 요인 개선 조치에 대해 부서장 및 팀 단위에 적절한 결정 권한이 위임되어 있다.",
        "description": "Ch 7 Delegation in Safety: 안전 프로세스에서 위임의 필요성.",
        "target_role": "all"
    },
    {
        "id": "RAA_AUTH_3",
        "dimension": "RAA_AUTHORITY",
        "category": "RAA 삼원조 (권한)",
        "question": "현장의 안전 규정 준수를 위해 부서별 직무기술서(Job Description) 상에 안전 권한 범위가 명확히 명시되어 있다.",
        "description": "Ch 7 서면 직무기술서의 중요성: 권한의 경계 설정.",
        "target_role": "all"
    },

    # [RAA - Accountability (책무성: 합의된 직무 수행 및 해명 의무)]
    {
        "id": "RAA_ACCT_1",
        "dimension": "RAA_ACCOUNTABILITY",
        "category": "RAA 삼원조 (책무성)",
        "question": "모든 직원은 자신에게 부여된 안전 수칙과 직무를 성실히 이행하며, 그 이행 결과에 대해 명확히 피드백하고 해명할 의무를 진다.",
        "description": "Ch 7 부하 직원의 책무성: Subordinate agrees to carry out assigned duties.",
        "target_role": "all"
    },
    {
        "id": "RAA_ACCT_2",
        "dimension": "RAA_ACCOUNTABILITY",
        "category": "RAA 삼원조 (책무성)",
        "question": "안전 성과에 대해 칭찬과 인정 같은 긍정적 결과(Positive Consequences)와 미준수에 대한 공정한 시정 조치가 명확히 작동한다.",
        "description": "Ch 7 성과에 대한 결과/피드백(Consequences for Performance) 설정.",
        "target_role": "all"
    },
    {
        "id": "RAA_ACCT_3",
        "dimension": "RAA_ACCOUNTABILITY",
        "category": "RAA 삼원조 (책무성)",
        "question": "위험 요인을 방치하거나 은폐하지 않고, 발견 즉시 보고하고 추적 관리하는 책무성 체계가 확립되어 있다.",
        "description": "Ch 7 책무성과 책임이 안전문화 유지에 미치는 영향.",
        "target_role": "all"
    },

    # [미 육군 FM 6-22 기반 8대 리더십 기대치 (Table 7.1)]
    {
        "id": "LEAD_EXP_1",
        "dimension": "LEADERSHIP_1",
        "category": "8대 리더십 기대치",
        "question": "[비전과 변화] 리더는 안전문화의 명확한 미래 지향점을 제시하고 구성원들이 변화에 동참하도록 주도한다.",
        "description": "Table 7.1 번호 1: Have a vision and lead change.",
        "target_role": "all"
    },
    {
        "id": "LEAD_EXP_2",
        "dimension": "LEADERSHIP_2",
        "category": "8대 리더십 기대치",
        "question": "[윤리적 나침반] 리더는 어떠한 생산 압박이나 위기 상황에서도 안전과 타협하지 않고 조직의 도덕적 나침반 역할을 한다.",
        "description": "Table 7.1 번호 2: Be your organization's moral and ethical compass.",
        "target_role": "all"
    },
    {
        "id": "LEAD_EXP_3",
        "dimension": "LEADERSHIP_3",
        "category": "8대 리더십 기대치",
        "question": "[학습과 적응] 리더는 실패와 아차사고(Near-miss)로부터 배우며 새로운 환경과 위험에 기민하게 적응한다.",
        "description": "Table 7.1 번호 3: Learn, think, and adapt.",
        "target_role": "all"
    },
    {
        "id": "LEAD_EXP_4",
        "dimension": "LEADERSHIP_4",
        "category": "8대 리더십 기대치",
        "question": "[위험과 기회 균형] 리더는 냉철하게 리스크를 평가하되 지나치게 위축되지 않고 조직의 주도권을 유지하도록 균형을 잡는다.",
        "description": "Table 7.1 번호 4: Balance risk and opportunity to retain the initiative.",
        "target_role": "all"
    },
    {
        "id": "LEAD_EXP_5",
        "dimension": "LEADERSHIP_5",
        "category": "8대 리더십 기대치",
        "question": "[고성과 팀 구축] 리더는 부서 간 장벽을 허물고 협력하여 민첩하고 효과적인 안전 고성과 팀을 구축한다.",
        "description": "Table 7.1 번호 5: Build agile, effective, high-performing teams.",
        "target_role": "all"
    },
    {
        "id": "LEAD_EXP_6",
        "dimension": "LEADERSHIP_6",
        "category": "8대 리더십 기대치",
        "question": "[위임과 리스크 감수] 리더는 현장에 실질적 권한을 위임하고, 업무 추진 중 발생할 수 있는 합당한 리스크를 대신 감당해 준다.",
        "description": "Table 7.1 번호 6: Empower subordinates and underwrite the risk.",
        "target_role": "all"
    },
    {
        "id": "LEAD_EXP_7",
        "dimension": "LEADERSHIP_7",
        "category": "8대 리더십 기대치",
        "question": "[차세대 리더 육성] 리더는 현장 작업자와 중간관리자 중에서 대담하고 적응력 있으며 시야가 넓은 안전 리더를 발굴·육성한다.",
        "description": "Table 7.1 번호 7: Develop bold, adaptive, and broadened leaders.",
        "target_role": "all"
    },
    {
        "id": "LEAD_EXP_8",
        "dimension": "LEADERSHIP_8",
        "category": "8대 리더십 기대치",
        "question": "[전방위 투명한 소통] 리더는 상하좌우로 투명하게 소통하며, 불리한 정보나 현장 맥락을 가감 없이 전사적으로 공유한다.",
        "description": "Table 7.1 번호 8: Communicate up, down, and laterally; tell the whole story.",
        "target_role": "all"
    },

    # [Chapter 1 & 9 - 안전 및 위험 지각 (Perception & Mental Model)]
    {
        "id": "PERC_1",
        "dimension": "MENTAL_MODEL",
        "category": "안전 지각 및 멘탈 모델",
        "question": "우리 조직은 '사고나 손실이 없었다고 해서 위험도 없다(No Loss No Risk)'고 방심하지 않고 상존하는 잠재 위험을 선제적으로 평가한다.",
        "description": "Ch 1 Observation 1: '무손실=무위험' 멘탈 모델의 오류 탈피 및 리스크 기반 접근법.",
        "target_role": "all"
    },
    {
        "id": "PERC_2",
        "dimension": "MENTAL_MODEL",
        "category": "안전 지각 및 멘탈 모델",
        "question": "안전은 단순한 '규제와 통제의 걸림돌'이 아니라 조직의 성공과 지속 가능성을 지탱하는 긍정적인 '조력자(Advocate)'로 지각된다.",
        "description": "Ch 1 1.2 안전의 '브랜드(Brand)' 가치와 인식 전환의 필요성.",
        "target_role": "all"
    },

    # [Chapter 8 - 직원 참여 및 심리적 안전감 (Employee Involvement & Psychological Safety)]
    {
        "id": "PS_1",
        "dimension": "PSYCHOLOGICAL_SAFETY",
        "category": "직원 참여 및 심리적 안전감",
        "question": "위험 상황을 솔직하게 보고하거나 안전상의 이견을 제시해도 비난받거나 불이익을 당하지 않는다는 심리적 안전감을 느낀다.",
        "description": "Ch 8 안전경영시스템에서 직원 참여 유도 및 안전 발언권(Voice).",
        "target_role": "all"
    },
    {
        "id": "PS_2",
        "dimension": "PSYCHOLOGICAL_SAFETY",
        "category": "직원 참여 및 심리적 안전감",
        "question": "안전위원회나 현장 개선 제안 제도에 적극적으로 참여하며, 제안된 안전 의견이 실제 경영 피드백으로 신속히 반영된다.",
        "description": "Ch 8 현장 참여 메커니즘과 권한 부여.",
        "target_role": "all"
    },

    # [Chapter 2 - 조직문화 3수준 및 사일로 극복 (Culture Levels & Silo)]
    {
        "id": "CULT_1",
        "dimension": "CULTURE_LEVEL",
        "category": "조직문화 3수준 및 사일로 극복",
        "question": "우리 회사는 부서 간 장벽(사일로)을 넘어 안전 정보와 노하우를 투명하게 공유하며 협업 안전 문화를 실천한다.",
        "description": "Ch 2 에드가 샤인의 3수준 문화 모델 및 사일로(Silo) 경영의 폐해 극복.",
        "target_role": "all"
    },

    # [Chapter 4 - 비전·미션 정렬 및 경계 확장 (Vision-Mission & Boundary Spanning)]
    {
        "id": "ALIGN_1",
        "dimension": "VISION_MISSION",
        "category": "비전·미션 정렬 및 경계 확장",
        "question": "경영진의 안전 비전과 현장의 안전 실천 목표(미션)가 모순 없이 하나로 정렬되어 있으며, 안전부서는 타 부서와 유기적으로 소통한다.",
        "description": "Ch 4 미션과 비전의 정합성 및 전사적 경계 확장(Boundary Spanning).",
        "target_role": "all"
    },

    # [Chapter 5 & 6 - SMS 6대 빌딩블록 및 DMAIC 프로세스 (SMS Framework & Process)]
    {
        "id": "PROC_1",
        "dimension": "SAFETY_PROCESS",
        "category": "SMS 프레임워크 및 프로세스 개선",
        "question": "안전경영시스템(SMS)이 보여주기식 서류(페이퍼워크)에 치우치지 않고, DMAIC 방법론에 따라 현장 위험 요인을 지속적으로 개선한다.",
        "description": "Ch 5 SMS 6대 핵심 빌딩블록 및 Ch 6 DMAIC 프로세스·형식주의(Cons) 탈피.",
        "target_role": "all"
    },

    # [Chapter 10 - 기본 위험관리 원칙 및 잔여위험 통제 (Risk Management Principles)]
    {
        "id": "RISK_1",
        "dimension": "RISK_MANAGEMENT",
        "category": "기본 위험관리 및 잔여위험 통제",
        "question": "안전 대책 수립 후에도 완전히 제거되지 않고 잔존하는 '잔여 위험(Residual Risk)'을 체계적으로 식별하고 상시 모니터링한다.",
        "description": "Ch 10 8단계 위험관리 생애주기 프로세스(Fig 10.2) 및 잔여 위험 통제(Fig 10.3).",
        "target_role": "all"
    }
]

# --------------------------------------------------------------------------
# 2. 조직 네트워크 분석(ONA) 샘플 노드 및 엣지 (Chapter 3)
# --------------------------------------------------------------------------
DEFAULT_ONA_NODES = [
    {"id": "U1", "name": "김대표", "department": "경영진", "role": "executive"},
    {"id": "U2", "name": "박안전", "department": "EHS안전부", "role": "manager"},
    {"id": "U3", "name": "이생산", "department": "생산본부", "role": "manager"},
    {"id": "U4", "name": "최정비", "department": "설비정비팀", "role": "manager"},
    {"id": "U5", "name": "정품질", "department": "품질보증팀", "role": "manager"},
    {"id": "U6", "name": "강조장", "department": "생산1팀(가공)", "role": "worker"},
    {"id": "U7", "name": "조반장", "department": "생산2팀(조립)", "role": "worker"},
    {"id": "U8", "name": "윤엔지니어", "department": "설비정비팀", "role": "worker"},
    {"id": "U9", "name": "장작업자", "department": "생산1팀(가공)", "role": "worker"},
    {"id": "U10", "name": "임검사원", "department": "품질보증팀", "role": "worker"},
    {"id": "U11", "name": "한신임", "department": "생산2팀(조립)", "role": "worker"},
    {"id": "U12", "name": "오협력", "department": "사내협력사", "role": "worker"},
]

DEFAULT_ONA_EDGES = [
    # 박안전(U2)은 중심 안전 관리자
    {"source": "U2", "target": "U1", "relation_type": "advice", "frequency": 3},
    {"source": "U2", "target": "U3", "relation_type": "collaboration", "frequency": 3},
    {"source": "U2", "target": "U4", "relation_type": "collaboration", "frequency": 2},
    {"source": "U3", "target": "U6", "relation_type": "advice", "frequency": 3},
    {"source": "U3", "target": "U7", "relation_type": "advice", "frequency": 2},
    {"source": "U6", "target": "U9", "relation_type": "advice", "frequency": 3},
    {"source": "U7", "target": "U11", "relation_type": "advice", "frequency": 3},
    {"source": "U4", "target": "U8", "relation_type": "collaboration", "frequency": 3},
    {"source": "U8", "target": "U6", "relation_type": "hazard_report", "frequency": 2},
    # 비공식 안전 오피니언 리더: 강조장(U6)은 U9, U8, U2와 다각적 소통
    {"source": "U6", "target": "U2", "relation_type": "hazard_report", "frequency": 3},
    {"source": "U9", "target": "U6", "relation_type": "hazard_report", "frequency": 3},
    {"source": "U5", "target": "U10", "relation_type": "advice", "frequency": 2},
    {"source": "U10", "target": "U2", "relation_type": "hazard_report", "frequency": 1},
    # 협력사 및 신임 고립 취약점
    {"source": "U7", "target": "U12", "relation_type": "collaboration", "frequency": 1},
]

# --------------------------------------------------------------------------
# 3. 생애주기 & 법령 연계 현장 KPI (Ch 1 ~ Ch 10 전 챕터 1:1 강제 매핑)
# --------------------------------------------------------------------------
DEFAULT_KPI_METRICS = [
    {
        "id": "KPI_CH01_PERC",
        "name": "안전 지각 갭(Perception Gap) 해소율 및 안전 온보딩 이수율",
        "chapter_source": "Ch 1",
        "table_figure_ref": "Fig 1.1 (소통 갭) & Table 1.5 (온보딩 차이)",
        "lifecycle_stage": "prevention",  # 예방
        "type": "inherent",               # 고유 지표 (70%)
        "weight": 0.7,
        "department": "인사교육팀 & 전사 현장부서",
        "target_value": "지각 갭 15% 미만 / 온보딩 100%",
        "unit": "%",
        "statutory_basis": "산업안전보건법 제29조(근로자에 대한 안전보건교육) 제1항",
        "subnote_evidence": "Ch 1 4절 지각의 격차(Fig 1.1) 및 19절 Table 1.5 안전 온보딩 실천",
        "current_value": 88.0,
        "progress_rate": 88.0
    },
    {
        "id": "KPI_CH02_SILO",
        "name": "사일로 극복 협업 안전점검 및 기본가정(Assumptions) 일치율",
        "chapter_source": "Ch 2",
        "table_figure_ref": "Fig 2.2 (샤인 3수준) & Fig 2.5 (사일로 장벽)",
        "lifecycle_stage": "prevention",  # 예방
        "type": "collaborative",          # 협업 지표 (30%)
        "weight": 0.3,
        "department": "생산본부 & EHS안전부 & 정비팀",
        "target_value": "분기 1회 부서교차 점검 (100%)",
        "unit": "%",
        "statutory_basis": "중대재해처벌법 제4조 제1호(안전보건 경영방침 수립) 및 산안법 제64조",
        "subnote_evidence": "Ch 2 에드가 샤인 3수준 문화(Fig 2.2) 및 10절 사일로 경영 극복(Fig 2.5)",
        "current_value": 82.0,
        "progress_rate": 82.0
    },
    {
        "id": "KPI_CH03_ONA",
        "name": "비공식 안전 오피니언 리더(Key Bridge) 발굴 및 3-Hop 영향력 전파율",
        "chapter_source": "Ch 3",
        "table_figure_ref": "Fig 3.1 (실제 네트워크) & Christakis 3도 이론",
        "lifecycle_stage": "preparedness", # 대비
        "type": "collaborative",           # 협업 지표 (30%)
        "weight": 0.3,
        "department": "EHS안전부 & 사내협력사",
        "target_value": "조직 내 브리지 노드 100% 매핑",
        "unit": "%",
        "statutory_basis": "산업안전보건법 제14조(관리감독자) 및 제16조(안전보건총괄책임자)",
        "subnote_evidence": "Ch 3 조직 네트워크 분석(ONA) 및 Christakis & Fowler 3단계 영향력 법칙",
        "current_value": 90.0,
        "progress_rate": 90.0
    },
    {
        "id": "KPI_CH04_ALIGN",
        "name": "전사 부서 간 안전 비전·미션 정렬도 및 경계확장(Boundary Spanning) 지수",
        "chapter_source": "Ch 4",
        "table_figure_ref": "Ch 4 7절 Boundary Spanning & SMART 모델",
        "lifecycle_stage": "planning",     # 기획
        "type": "inherent",                # 고유 지표 (70%)
        "weight": 0.7,
        "department": "경영기획실 & 전사 사업부",
        "target_value": "SMART 정렬 지수 90점 이상",
        "unit": "점",
        "statutory_basis": "중대재해처벌법 시행령 제4조 제1호(안전보건 목표와 경영방침의 설정)",
        "subnote_evidence": "Ch 4 4절 미션 vs 비전 비교 및 7절 전사적 경계 확장(Boundary Spanning) 모델",
        "current_value": 92.0,
        "progress_rate": 92.0
    },
    {
        "id": "KPI_CH05_SMS",
        "name": "SMS 6대 빌딩블록 균형도 및 RAA 역할·권한·책임 명문화율",
        "chapter_source": "Ch 5",
        "table_figure_ref": "Ch 5 3절 SMS 6대 빌딩블록 & ANSI Z10 구조",
        "lifecycle_stage": "planning",     # 기획
        "type": "inherent",                # 고유 지표 (70%)
        "weight": 0.7,
        "department": "EHS안전부 & 직무분석위원회",
        "target_value": "직무기술서(JD) RAA 반영률 100%",
        "unit": "%",
        "statutory_basis": "산업안전보건법 제15조(안전관리자) 및 중대재해처벌법 제4조 제2호",
        "subnote_evidence": "Ch 5 3절 SMS 핵심 6대 공통 요소 및 5절 명확한 RAA 직무기술서 체계",
        "current_value": 95.0,
        "progress_rate": 95.0
    },
    {
        "id": "KPI_CH06_DMAIC",
        "name": "DMAIC 공정 개선 이행률 및 실질 안전코칭 비율(형식주의 탈피)",
        "chapter_source": "Ch 6",
        "table_figure_ref": "Ch 6 4절 DMAIC 모델 & SMS Cons(부작용) 방어",
        "lifecycle_stage": "recovery",     # 복구/개선
        "type": "inherent",                # 고유 지표 (70%)
        "weight": 0.7,
        "department": "생산기술팀 & 공정품질팀",
        "target_value": "개선 조치 100% / 코칭 시간 60% 이상",
        "unit": "%",
        "statutory_basis": "산업안전보건법 제36조 제3항(위험성평가 결과에 따른 개선조치)",
        "subnote_evidence": "Ch 6 4절 DMAIC 모델 안전 적용 및 5절 페이퍼워크 과잉(Cons) 극복",
        "current_value": 86.0,
        "progress_rate": 86.0
    },
    {
        "id": "KPI_CH07_LEAD",
        "name": "Table 7.1 8대 리더십 실천율 및 현장 작업중지권(Stop-Work) 보장률",
        "chapter_source": "Ch 7",
        "table_figure_ref": "Table 7.1 (육군 8대 기대치) & RAA 삼원조 트라이어드",
        "lifecycle_stage": "response",     # 대응
        "type": "inherent",                # 고유 지표 (70%)
        "weight": 0.7,
        "department": "전사 관리감독자 & 현장작업팀",
        "target_value": "24시간 이내 100% 무문책 피드백",
        "unit": "%",
        "statutory_basis": "산업안전보건법 제52조(근로자의 작업중지) 및 중처법 제4조",
        "subnote_evidence": "Ch 7 Table 7.1 번호 6(권한위임 및 리스크감수) 및 RAA 삼각 균형",
        "current_value": 94.0,
        "progress_rate": 94.0
    },
    {
        "id": "KPI_CH08_VOICE",
        "name": "'Just Ask' 일상 대화율 및 현장 근로자 안전제안 채택·포상률",
        "chapter_source": "Ch 8",
        "table_figure_ref": "Ch 8 6절 Just Ask & 참여 5대 장벽 극복 로드맵",
        "lifecycle_stage": "response",     # 대응
        "type": "collaborative",           # 협업 지표 (30%)
        "weight": 0.3,
        "department": "노사협의체 & 현장 근로자대표",
        "target_value": "분기 제안 30건 이상 / 채택률 80%",
        "unit": "%",
        "statutory_basis": "산업안전보건법 제24조(산업안전보건위원회) 및 동법 시행령 제35조",
        "subnote_evidence": "Ch 8 6절 Just Ask 기법 및 참여 5대 심리적 장벽(무관심, 두려움) 타파",
        "current_value": 89.0,
        "progress_rate": 89.0
    },
    {
        "id": "KPI_CH09_BIAS",
        "name": "정상화 편향(Normalization of Deviance) 탈피율 및 아차사고 발굴 선행지수",
        "chapter_source": "Ch 9",
        "table_figure_ref": "위험 지각 4분면 매트릭스 & Lesson 1 (롤러 참사)",
        "lifecycle_stage": "preparedness", # 대비
        "type": "inherent",                # 고유 지표 (70%)
        "weight": 0.7,
        "department": "설비정비팀 & 안전보건팀",
        "target_value": "월 아차사고 20건 이상 선제 발굴",
        "unit": "건",
        "statutory_basis": "산업안전보건법 제36조(위험성평가) 및 산안법 제10조(보고의무)",
        "subnote_evidence": "Ch 9 위험 지각 4분면, 정상화 편향 극복 및 Lesson 1 인쇄기 롤러 참사 교훈",
        "current_value": 87.0,
        "progress_rate": 87.0
    },
    {
        "id": "KPI_CH10_RISK",
        "name": "8단계 위험성평가 적시 완료율 및 잔여 위험(Residual Risk) 상시 통제율",
        "chapter_source": "Ch 10",
        "table_figure_ref": "Fig 10.2 (8단계 프로세스) & Fig 10.3 (잔여위험)",
        "lifecycle_stage": "preparedness", # 대비
        "type": "inherent",                # 고유 지표 (70%)
        "weight": 0.7,
        "department": "전 생산공정 & 유해위험작업부서",
        "target_value": "정기평가 100% / 잔여위험 등급 허용범위(ALARP) 유지",
        "unit": "%",
        "statutory_basis": "고용노동부 고시 제2023-19호(사업장 위험성평가에 관한 지침) 및 산안법 제36조",
        "subnote_evidence": "Ch 10 Fig 10.2 위험관리 8단계 프로세스 및 Fig 10.3 잔여 위험(Residual Risk) 감소 모델",
        "current_value": 91.0,
        "progress_rate": 91.0
    }
]
