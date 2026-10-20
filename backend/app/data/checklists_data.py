"""
Elsevier (2019) 『Safety Culture』 원문 및 서브노트 부록(Appendix) & 점검 프로세스 데이터
"""

CHECKLIST_GROUPS_SEED = [
    # --------------------------------------------------------------------------
    # 1. Appendix 7.2 최고경영진/리더십 팀의 안전 책임 샘플
    # --------------------------------------------------------------------------
    {
        "group_id": "APP_7_2_LEADERSHIP",
        "title": "최고경영진 / 리더십 팀 안전 책임 점검 (Appendix 7.2)",
        "source_reference": "Ch 7 Appendix 7.2 Sample Responsibilities for the Leadership Team",
        "category": "계층별 직무 안전 책임",
        "target_role": "executive",
        "items": [
            {
                "id": "A72_1",
                "text": "모든 조직 기준, 최우수 관리 관행(BMP), 법적 규제 요구사항을 철저히 준수하도록 안전 정책을 공식 수립·공표하였는가?",
                "criterion": "전사 안전경영방침 공식 제정 및 전사 게시 여부",
                "status": "compliant"
            },
            {
                "id": "A72_2",
                "text": "모든 직원에게 안전한 작업 환경과 근로 조건을 제공하기 위한 실질적 설비 투자와 작업 환경 개선을 실행하는가?",
                "criterion": "안전보건 예산의 안정적 편성 및 적기 집행 실적",
                "status": "compliant"
            },
            {
                "id": "A72_3",
                "text": "안전과 생산 우선순위 사이에 갈등이 발생할 경우, 타협 없이 '안전 우선'으로 의사결정하는가?",
                "criterion": "일정 지연 상황에서도 위험 작업중지 지지 및 생산 우선주의 억제",
                "status": "partial"
            },
            {
                "id": "A72_4",
                "text": "안전 프로세스의 각 영역에 명확하고 이해하기 쉬운 책임을 부여하고, 이에 부합하는 충분한 자원과 권한을 하향 위임하였는가?",
                "criterion": "직무기술서(Job Description) 상 안전 책임 및 전결권 명시",
                "status": "partial"
            },
            {
                "id": "A72_5",
                "text": "관리자와 직원이 부여된 책임을 다하고 있는지 확인하고, 성과에 대해 칭찬·인정 등 긍정적 결과를 공정하게 제공하는가?",
                "criterion": "Ch 7 Consequence Management: 선제적 안전 활동 포상 제도 운용",
                "status": "partial"
            },
            {
                "id": "A72_6",
                "text": "안전 규칙과 작업 절차를 최고경영진이 솔선수범 준수하여 조직 헌신의 본보기를 보이는가?",
                "criterion": "현장 방문 시 필수 보호구(PPE) 완벽 착용 및 안전수칙 준수",
                "status": "compliant"
            },
            {
                "id": "A72_7",
                "text": "모든 협력업체, 공급업체, 방문객이 회사의 안전 정책을 동등하게 준수하도록 통합 안전 체계를 운영하는가?",
                "criterion": "산업안전보건법 제64조 도급인 안전보건 협의체 및 점검 운영",
                "status": "compliant"
            },
            {
                "id": "A72_8",
                "text": "직원들이 노출될 수 있는 잠재 위험을 철저히 이해하고 종합적 리스크 예방·통제 시스템(SMS)을 가동하는가?",
                "criterion": "ANSI Z10 / ISO 45001 체계 부합 및 리스크 평가 관리",
                "status": "compliant"
            },
            {
                "id": "A72_9",
                "text": "직원이 불이익에 대한 두려움 없이 위험을 보고할 수 있는 신뢰 시스템을 제공하고 24시간 내 신속히 피드백하는가?",
                "criterion": "무문책 위험제보 제도 운영 및 처리 현황 피드백",
                "status": "partial"
            },
            {
                "id": "A72_10",
                "text": "설비와 장비의 정상 가동과 고장 예방을 보장하는 예방보전(Preventive Maintenance) 프로그램을 안정적으로 운영하는가?",
                "criterion": "정기 보수 계획 수립 및 노후 설비 적기 교체",
                "status": "compliant"
            },
            {
                "id": "A72_11",
                "text": "손실 유발 사건 및 아차사고 보고서를 면밀히 검토하여 부하 탓을 하지 않고 시스템적 원인과 추세를 분석하는가?",
                "criterion": "Ch 7 RAA Triad: Leadership is responsible for results.",
                "status": "compliant"
            },
            {
                "id": "A72_12",
                "text": "비상사태 발생 시 신속히 대처할 수 있도록 주기적인 비상 대응 훈련 및 실전 시뮬레이션을 최고경영진 주관으로 실시하는가?",
                "criterion": "중대재해처벌법 시행령 제4조 제8호 비상대응 매뉴얼 훈련",
                "status": "compliant"
            }
        ]
    },

    # --------------------------------------------------------------------------
    # 2. Appendix 7.3 공장장/사업장 총괄 관리자의 안전 책임 샘플
    # --------------------------------------------------------------------------
    {
        "group_id": "APP_7_3_SITE_MANAGER",
        "title": "공장장 / 사업장 총괄 관리자 안전 책임 점검 (Appendix 7.3)",
        "source_reference": "Ch 7 Appendix 7.3 Sample Responsibilities Plant/Site Managers",
        "category": "계층별 직무 안전 책임",
        "target_role": "site_manager",
        "items": [
            {
                "id": "A73_1",
                "text": "안전 정책이 사업장의 근본 가치로 유지되도록 솔선수범하는 리더십과 명확한 방향을 제시하는가?",
                "criterion": "사업장 월례 안전조회 주재 및 안전 가치 지속 천명",
                "status": "compliant"
            },
            {
                "id": "A73_2",
                "text": "산하 현장 감독관들에게 안전 역할과 직원의 규정 준수를 엄격히 관리하도록 책무성을 부여하는가?",
                "criterion": "감독관 직무 평가 시 안전 지표 반영(최소 20% 이상)",
                "status": "partial"
            },
            {
                "id": "A73_3",
                "text": "높은 수준의 5S 정리정돈(Housekeeping)을 유지하고 표준작업서(SOP)가 현장에 철저히 정착되도록 관리하는가?",
                "criterion": "현장 통로 확보, 자재 적재 상태 및 일일 5S 점검",
                "status": "compliant"
            },
            {
                "id": "A73_4",
                "text": "정기 현장 안전 순회에 주 1회 이상 직접 참여하여 근로자들과 소통하고 긍정적 인정과 시정을 지시하는가?",
                "criterion": "공장장 현장 안전 순회 일지 및 조치 내역 기록",
                "status": "partial"
            },
            {
                "id": "A73_5",
                "text": "신규 설비, 장비, 자재, 공정이 도입될 때 잠재적 위험을 사전 검토(PtD 원칙)하는가?",
                "criterion": "Ch 5 Appendix 5.1 Prevention through Design 사전 안전성 평가",
                "status": "partial"
            },
            {
                "id": "A73_6",
                "text": "주요 작업에 대해 작업위험성평가(JHA)가 주기적으로 수행되어 현장 근로자의 지혜가 반영되도록 보장하는가?",
                "criterion": "Ch 7 JHA 4단계 전환: 기술자 -> 훈련자 -> 품질 -> 신뢰받는 리더",
                "status": "compliant"
            },
            {
                "id": "A73_7",
                "text": "위험 작업에 대해 구체적인 안전 작업 절차(SOP)와 작업허가제(PTW)를 엄격히 시행하는가?",
                "criterion": "밀폐공간, 화기, 고소작업 허가증 발급 및 감시인 배치",
                "status": "compliant"
            },
            {
                "id": "A73_8",
                "text": "적합한 개인보호구(PPE)를 지급하고 작업자의 올바른 착용 여부를 철저히 감독하는가?",
                "criterion": "보호구 지급 대장 및 보호구 착용 점검률 100% 달성",
                "status": "compliant"
            },
            {
                "id": "A73_9",
                "text": "모든 사고와 아차사고가 은폐 없이 즉시 보고되도록 보장하고, 포상 제도가 사고 은폐를 조장하지 않도록 관리하는가?",
                "criterion": "무사고 일수 포상 폐지 및 선제적 유해요인 발굴 포상 전환",
                "status": "compliant"
            },
            {
                "id": "A73_10",
                "text": "감독관이 정기 안전회의를 열어 사고 원인을 자유롭게 토론하고 대책을 수립하도록 지원하는가?",
                "criterion": "TBM(Tool Box Meeting) 활성화 및 자유로운 발언 보장",
                "status": "compliant"
            }
        ]
    },

    # --------------------------------------------------------------------------
    # 3. Appendix 7.4 현장 감독관(반장/조장/팀장)의 안전 책임 샘플
    # --------------------------------------------------------------------------
    {
        "group_id": "APP_7_4_SUPERVISOR",
        "title": "현장 감독관 / 관리감독자 안전 책임 점검 (Appendix 7.4)",
        "source_reference": "Ch 7 Appendix 7.4 Sample Responsibilities for Supervision",
        "category": "계층별 직무 안전 책임",
        "target_role": "supervisor",
        "items": [
            {
                "id": "A74_1",
                "text": "적용되는 안전 작업 절차와 규칙을 언행일치(Practice what you preach)로 모범 준수하는가?",
                "criterion": "감독관 본인의 안전규정 위반 제로(0) 및 솔선수범 행동",
                "status": "compliant"
            },
            {
                "id": "A74_2",
                "text": "직원의 안전한 행동과 작업 방식을 일상적으로 관찰하고 안전 행동에 대해 즉시 칭찬과 인정을 제공하는가?",
                "criterion": "긍정적 피드백 빈도 주 3회 이상 실천",
                "status": "partial"
            },
            {
                "id": "A74_3",
                "text": "작업 시작 전 체크리스트를 활용하여 물리적 현장 안전 점검 및 TBM을 매일 실시하는가?",
                "criterion": "일일 점검 체크리스트 기록 및 이상 발견 시 즉각 조치",
                "status": "compliant"
            },
            {
                "id": "A74_4",
                "text": "작업 속도를 높이기 위한 임의의 편법이나 지름길(Shortcuts) 사용을 엄격히 금지하는가?",
                "criterion": "안전장치 무력화, 인터록 해제 절대 엄금 및 작업 준수",
                "status": "compliant"
            },
            {
                "id": "A74_5",
                "text": "급박한 위험이 발견되었을 때 주저 없이 작업을 중지시킬 수 있는 작업중지권(Stop-Work)을 행사하는가?",
                "criterion": "Ch 7 표 7.1 #6: Empower subordinates and underwrite risk",
                "status": "partial"
            },
            {
                "id": "A74_6",
                "text": "신입 작업자 및 전환 배치 직원에 대한 현장 직무 교육(OJT)을 표준 절차에 따라 철저히 실시하는가?",
                "criterion": "Ch 1 온보딩(Onboarding) 30일 지침 및 맨투맨 멘토링",
                "status": "compliant"
            },
            {
                "id": "A74_7",
                "text": "현장 차원에서 해결할 수 없는 자원·예산 요구사항을 상위 리더십 팀에 즉시 보고하여 해결을 촉구하는가?",
                "criterion": "안전 건의 및 유해요인 상향 보고 조치 기록",
                "status": "compliant"
            }
        ]
    },

    # --------------------------------------------------------------------------
    # 4. Appendix 7.5 현장 작업자 직무 안전 책임 샘플
    # --------------------------------------------------------------------------
    {
        "group_id": "APP_7_5_EMPLOYEE",
        "title": "현장 작업자 직무 안전 책임 점검 (Appendix 7.5)",
        "source_reference": "Ch 7 Appendix 7.5 Sample List of Task Responsibilities Employees",
        "category": "계층별 직무 안전 책임",
        "target_role": "employee",
        "items": [
            {
                "id": "A75_1",
                "text": "모든 안전 수칙을 철저히 학습하고 임의의 편법이나 지름길(Shortcuts)을 사용하지 않는가?",
                "criterion": "표준 작업 절차(SOP) 준수율 100% 유지",
                "status": "compliant"
            },
            {
                "id": "A75_2",
                "text": "새로운 작업을 시작하기 전 작업 지시 사항과 위험 통제 방안을 완벽히 이해하고 작업에 임하는가?",
                "criterion": "TBM 미팅 참여 및 위험 요인 상호 확인",
                "status": "compliant"
            },
            {
                "id": "A75_3",
                "text": "취급하는 화학물질 및 유해물질의 물질안전보건자료(MSDS)와 대처법을 능동적으로 숙지하는가?",
                "criterion": "MSDS 교육 이수 및 비상 세척 시설 위치 숙지",
                "status": "compliant"
            },
            {
                "id": "A75_4",
                "text": "작업 안전성에 조금이라도 의문이 생길 경우 작업을 즉시 멈추고 관리감독자에게 확인하는가?",
                "criterion": "의문 시 작업 즉시 멈춤(Pause for Safety) 원칙 준수",
                "status": "partial"
            },
            {
                "id": "A75_5",
                "text": "모든 손실 유발 사건, 아차사고, 불안전한 설비 상태를 발견 즉시 감독관에게 보고하는가?",
                "criterion": "아차사고(Near-miss) 자발적 제보 실적",
                "status": "compliant"
            },
            {
                "id": "A75_6",
                "text": "작업에 요구되는 규정된 개인보호구(안전모, 안전화, 보안경 등)를 단 1초의 예외 없이 착용하는가?",
                "criterion": "개인보호구 착용 의무 준수",
                "status": "compliant"
            }
        ]
    },

    # --------------------------------------------------------------------------
    # 5. Appendix 2.2 조직 안전문화 기초 진단 체크리스트
    # --------------------------------------------------------------------------
    {
        "group_id": "APP_2_2_CULTURE_BASIC",
        "title": "조직 안전문화 기초 진단 12대 체크리스트 (Appendix 2.2)",
        "source_reference": "Ch 2 Appendix 2.2 Do You Know Your Safety Culture: A Basic Checklist",
        "category": "조직문화 정밀 진단",
        "target_role": "all",
        "items": [
            {
                "id": "A22_1",
                "text": "최고경영진은 안전을 위해 생산 라인을 멈출 수 있는 실질적 권한을 현장 작업자에게 공식 부여하는가?",
                "criterion": "비정상의 정상화(Challenger 참사 교훈) 방지 및 권한 이양",
                "status": "partial"
            },
            {
                "id": "A22_2",
                "text": "현장 직원이 아차사고나 실수를 솔직하게 보고했을 때 비난 대신 칭찬과 감사를 받는 분위기인가?",
                "criterion": "Ch 8 심리적 안전감(Psychological Safety) 형성 수준",
                "status": "partial"
            },
            {
                "id": "A22_3",
                "text": "안전 회의에서 형식적 서류 확인을 넘어 현장의 실질적인 유해위험요인 해결 방안이 치열하게 논의되는가?",
                "criterion": "페이퍼워크 탈피 및 실질적 위험 제거 토론",
                "status": "compliant"
            },
            {
                "id": "A22_4",
                "text": "안전 전문가는 현장 단속자(Safety Cop)가 아니라 문제를 함께 해결하는 전략적 파트너로 존중받는가?",
                "criterion": "Ch 1 Observation 1: 안전 부서와 생산 부서 간 마찰 해소",
                "status": "compliant"
            },
            {
                "id": "A22_5",
                "text": "조직 내에 '사고가 없었으니 위험도 없다'는 무손실=무위험(No Loss No Risk) 멘탈 모델이 만연해 있지 않은가?",
                "criterion": "Ch 1 잠재 위험 선제 발굴 및 사전 예방 노력",
                "status": "partial"
            },
            {
                "id": "A22_6",
                "text": "신규 프로젝트나 공정 변경 시 '이달의 유행(Flavors of the month)'으로 치부되지 않고 지속적으로 유지·관리되는가?",
                "criterion": "제도 도입의 지속성 및 경영진의 일관된 관심",
                "status": "partial"
            }
        ]
    },

    # --------------------------------------------------------------------------
    # 6. Chapter 9.12 조직의 위험 지각 진단 16대 체크리스트
    # --------------------------------------------------------------------------
    {
        "group_id": "CH_9_12_RISK_PERCEPTION",
        "title": "조직 위험 지각 진단 16대 전략 체크리스트 (Chapter 9.12)",
        "source_reference": "Ch 9 Section 12 Identifying Risk Perception 16 Questions",
        "category": "위험 지각 및 인지 편향",
        "target_role": "all",
        "items": [
            {
                "id": "C912_1",
                "text": "현재 사용 중인 안전 서식과 지침들을 이끄는 조직의 표방 가치(Espoused Values)가 현장의 일하는 방식과 일치하는가?",
                "criterion": "샤인(Schein)의 신봉가치와 현장 기본가정의 일치도",
                "status": "compliant"
            },
            {
                "id": "C912_2",
                "text": "우리 조직의 전반적인 위험 허용 수준(Risk Tolerance)이 지나치게 안이하거나 둔감해져 있지 않은가?",
                "criterion": "위험 감수 성향 및 아차사고 경시 풍조 점검",
                "status": "partial"
            },
            {
                "id": "C912_3",
                "text": "조직 구성원들이 '수용 불가능한 위험(Unacceptable Risk)'에 대해 동일한 수준의 명확한 판단 기준을 공유하고 있는가?",
                "criterion": "ANSI Z590.3 위험성평가 기준선의 전사 공유",
                "status": "compliant"
            },
            {
                "id": "C912_4",
                "text": "과거 24개월 동안 도입된 신규 프로그램들이 단명할 '이달의 유행(Flavor of the month)'으로 조롱받지 않는가?",
                "criterion": "변화 피로도(Change Fatigue) 및 제도 지속성",
                "status": "partial"
            },
            {
                "id": "C912_5",
                "text": "신규 안전 도구를 도입할 때 현장의 업무 부담을 가중시키지 않고 구식 서식을 과감히 통폐합·폐지하였는가?",
                "criterion": "Ch 9.14 단순성의 원칙 및 낡은 껍데기 서식 폐지",
                "status": "partial"
            },
            {
                "id": "C912_6",
                "text": "부서 간 사일로(Silo)를 허물기 위해 전 부서가 동일한 위험성평가 교육을 합동으로 이수하는가?",
                "criterion": "생산, 보전, 품질, 경영 전 계층의 동일 위험 정보 공유",
                "status": "compliant"
            },
            {
                "id": "C912_7",
                "text": "사내 비공식 네트워크 중 새로운 위험 도구의 성공적 안착을 이끌 핵심 오피니언 리더(Champion)를 확보하였는가?",
                "criterion": "Ch 3 3단계 영향력 전파자 발굴 및 사전 인게이지",
                "status": "compliant"
            },
            {
                "id": "C912_8",
                "text": "과거에는 늘 일상적으로 해왔던 관행이지만 오늘날 기준에서 더 이상 수용될 수 없는 위험(No longer acceptable risk)을 식별하고 있는가?",
                "criterion": "비정상의 정상화 극복 및 낡은 관행의 공식 폐기",
                "status": "partial"
            }
        ]
    },

    # --------------------------------------------------------------------------
    # 7. Table 7.3 효과적인 책무성 시스템의 6대 핵심 구성요소
    # --------------------------------------------------------------------------
    {
        "group_id": "TAB_7_3_ACCOUNTABILITY",
        "title": "효과적인 책무성(Accountability) 시스템 6대 점검 (Table 7.3)",
        "source_reference": "Ch 7 Table 7.3 Essential Components of an Effective Accountability System",
        "category": "책무성 & 결과관리",
        "target_role": "all",
        "items": [
            {
                "id": "T73_1",
                "text": "조직 내 모든 직무에 대해 구체적이고 측정 가능한 안전 역할과 책임이 문서화되어 있는가?",
                "criterion": "역할 명확성: 서면 직무기술서 상 안전 직무 명시",
                "status": "compliant"
            },
            {
                "id": "T73_2",
                "text": "직무를 수행하기에 충분한 권한(Authority)과 의사결정 재량, 자원이 정당하게 위임되어 있는가?",
                "criterion": "자원과 권한 위임: 책임만 있고 권한이 없는 결함 방지",
                "status": "partial"
            },
            {
                "id": "T73_3",
                "text": "안전 책무를 이행하는 데 필요한 지식, 역량, 기술을 갖출 수 있도록 정기적 교육을 제공하는가?",
                "criterion": "역량 지원: 안전 리더십 훈련 및 위험성평가 교육",
                "status": "compliant"
            },
            {
                "id": "T73_4",
                "text": "부여된 안전 책무의 이행 현황을 객관적 지표로 주기적으로 측정하고 평가하는 시스템이 있는가?",
                "criterion": "성과 측정: 선행 지표(Leading)와 후행 지표(Lagging)의 통합 모니터링",
                "status": "compliant"
            },
            {
                "id": "T73_5",
                "text": "안전 성과에 대해 시의적절하고 구체적이며 공정한 피드백이 제공되는가?",
                "criterion": "정기 피드백: 월간/분기별 안전 성과 브리핑",
                "status": "partial"
            },
            {
                "id": "T73_6",
                "text": "안전 성과 결과에 대해 긍정적 보상(Positive)과 공정한 시정 조치(Consequence)가 일관되게 작동하는가?",
                "criterion": "결과관리 체계: 칭찬/인정과 원인분석 기반 시정 조치",
                "status": "partial"
            }
        ]
    },

    # --------------------------------------------------------------------------
    # 8. Appendix 8.1 기본 안전위원회 팀 헌장 및 4대 전문 분과 점검표
    # --------------------------------------------------------------------------
    {
        "group_id": "APP_8_1_COMMITTEE",
        "title": "안전위원회 헌장 및 4대 전문 분과 운영 점검 (Appendix 8.1)",
        "source_reference": "Ch 8 Appendix 8.1 Basic Safety Committee Team Charter",
        "category": "직원 참여 & 위원회 거버넌스",
        "target_role": "all",
        "items": [
            {
                "id": "A81_1",
                "text": "안전위원회의 공식 목적, 사명, 권한 범위 및 의사결정 규칙이 명시된 팀 헌장(Charter)을 보유하고 있는가?",
                "criterion": "안전위원회 공식 운영 규정 및 노사 동수 참여 체계",
                "status": "compliant"
            },
            {
                "id": "A81_2",
                "text": "[교육·훈련 분과] 현장 작업자의 실제 요구에 기반한 맞춤형 안전 교육 프로그램을 기획·운영하는가?",
                "criterion": "실습 위주 교육 및 직무별 특화 커리큘럼",
                "status": "compliant"
            },
            {
                "id": "A81_3",
                "text": "[현장 순회·점검 분과] 노사 합동으로 정기 순회 점검을 조율하고 체크리스트를 표준화하여 개선을 추적하는가?",
                "criterion": "합동 순회 점검 일지 및 부적합 사항 개선 완료율",
                "status": "partial"
            },
            {
                "id": "A81_4",
                "text": "[제안·참여 분과] 직원의 안전 제안을 신속히 심사하고 채택된 제안에 대해 즉각적인 보상과 피드백을 제공하는가?",
                "criterion": "제안 채택률 및 제안자 실질적 포상 지급",
                "status": "partial"
            },
            {
                "id": "A81_5",
                "text": "[커뮤니케이션 분과] 위원회 회의 결과와 개선 조치 현황을 전사 게시판과 소통망에 투명하게 공개하는가?",
                "criterion": "Ch 3 다계층 소통: 회의록 공개 및 피드백 공유",
                "status": "compliant"
            }
        ]
    }
]
