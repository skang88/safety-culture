#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Full Integrated Subnote HTML Generator
Safety Culture (Chapters 1~10) 통합 서브노트 빌더
"""

import os
import re
import json

CHAPTER_METAS = [
    {
        "ch": 1,
        "part": "PART I. Laying the Foundation",
        "part_ko": "기초 다지기",
        "title_en": "Defining the Perception of Safety",
        "title_ko": "안전 지각의 정의",
        "desc": "발현적 속성(Emergent Property), 안전의 브랜드 가치, 몬탄테·래드포드 모델 및 아이젠하워 제2분면 시간 관리",
        "icon": "🌱",
        "color": "#38bdf8"
    },
    {
        "ch": 2,
        "part": "PART I. Laying the Foundation",
        "part_ko": "기초 다지기",
        "title_en": "Analyzing the Organizational Culture",
        "title_ko": "조직문화 분석",
        "desc": "샤인의 조직문화 3계층 모델(인공물, 표방가치, 기본가정), 하위문화의 충돌, 체르노빌 교훈 및 문화 진단 기법",
        "icon": "🏛️",
        "color": "#06b6d4"
    },
    {
        "ch": 3,
        "part": "PART I. Laying the Foundation",
        "part_ko": "기초 다지기",
        "title_en": "Analyzing and Using Your Network",
        "title_ko": "사회 연결망 분석과 안전 밈",
        "desc": "공식 조직도 vs 비공식 사회 연결망, 리처드 도킨스의 밈(Meme) 이론과 안전 밈 전파, 중심성 및 브로커리지",
        "icon": "🌐",
        "color": "#10b981"
    },
    {
        "ch": 4,
        "part": "PART I. Laying the Foundation",
        "part_ko": "기초 다지기",
        "title_en": "Establishing the Direction for the Safety Culture",
        "title_ko": "안전문화 방향 설정과 비전",
        "desc": "항로 설정(Charting the Course), 비전·미션·가치 체계, SMART 원칙에 기반한 전략적 안전 기획 프로세스",
        "icon": "🗺️",
        "color": "#f59e0b"
    },
    {
        "ch": 5,
        "part": "PART II. Building the Safety Culture & SMS",
        "part_ko": "안전경영시스템 구축",
        "title_en": "Overview of Basic Safety Management Systems",
        "title_ko": "기본 안전경영시스템의 개요",
        "desc": "안전경영시스템(SMS)의 6대 공통 요소, 데밍의 PDCA 선순환 사이클, 시스템을 지탱하는 쐐기돌로서의 경영 리더십",
        "icon": "🔗",
        "color": "#a855f7"
    },
    {
        "ch": 6,
        "part": "PART II. Building the Safety Culture & SMS",
        "part_ko": "안전경영시스템 구축",
        "title_en": "Creating the Safety Process",
        "title_ko": "안전 프로세스 구축",
        "desc": "체계적 안전 프로세스 구축 5단계, 체크박스 채우기식 형식주의 탈피, 테일러 과학적 관리법과 현대 시스템 안전",
        "icon": "🔄",
        "color": "#ec4899"
    },
    {
        "ch": 7,
        "part": "PART II. Building the Safety Culture & SMS",
        "part_ko": "안전경영시스템 구축",
        "title_en": "Evaluating Leadership and the Safety Culture",
        "title_ko": "리더십과 안전문화 평가",
        "desc": "샤인의 문화-리더십 동전 양면성, RAA(책무성·권한·책임) 매트릭스, 안전 전문가의 JHA 4단계 전환 및 현장 순회",
        "icon": "🧭",
        "color": "#38bdf8"
    },
    {
        "ch": 8,
        "part": "PART II. Building the Safety Culture & SMS",
        "part_ko": "안전경영시스템 구축",
        "title_en": "Getting Employee Involvement in the SMS",
        "title_ko": "안전경영시스템 직원 참여 유도",
        "desc": "침묵 현상(Safety Silence) 극복, 심리적 안전감 구축, 제임스의 80/20 경청 법칙 및 핑크의 '우리 vs 그들' 프레임워크",
        "icon": "👥",
        "color": "#10b981"
    },
    {
        "ch": 9,
        "part": "PART III. How to Handle the Perception of Risk",
        "part_ko": "위험 지각의 제어와 관리",
        "title_en": "Defining Risk Perception",
        "title_ko": "위험 지각의 정의",
        "desc": "불필요한 위험 감수의 근본 원인(무형성, 과거 편향, 일 끝내기 밈), 비판적 질문 태도, 3대 참사 사례 및 황금률",
        "icon": "⚠️",
        "color": "#ef4444"
    },
    {
        "ch": 10,
        "part": "PART III. How to Handle the Perception of Risk",
        "part_ko": "위험 지각의 제어와 관리",
        "title_en": "Understanding Basic Risk Management Principles",
        "title_ko": "기본 위험관리 원칙의 이해",
        "desc": "버핏의 백미러 비유와 사후 지표 탈피, 'No Loss No Risk' 신화 분쇄, 4T 대응 전략, 위험관리 8단계 및 총·잔여 위험",
        "icon": "🛡️",
        "color": "#f97316"
    }
]

# Comprehensive Knowledge Base for All 10 Chapters
GLOBAL_KB = {
    1: {
        "emergent": """[발현적 속성(Emergent Property) 핵심 해설]
• 정의: 하위 구성 요소들이 상호 제약적 관계(Constraining relations) 속에서 결합할 때 상위 시스템 차원에서 새롭게 나타나는 예측 불가능한 고유 속성입니다 (Emergent Property, 2018).
• 안전문화 연계: 안전은 특정 안전 부서만의 개별 프로그램이 아닙니다. 조직의 6대 영역(환경, 구조, 과업, 기술, 인간-사회, 목표)이 유기적으로 맞물려 작동할 때 비로소 조직 전체에서 '안전한 환경' 또는 '불안전한 환경'이 최종 발현됩니다.""",
        "montante": """[윌리엄 몬탄테의 안전 정의 및 비판]
• 정의: "안전이란 리스크와 그로부터 파생된 잠재적 위험(Hazards)을 제어하기 위한 지속적인 판단 과정(Judgment process)이다."
• 'Safety First' 구호 비판: 안전을 비즈니스 프로세스(생산, 품질, 일정 등)와 분리하여 독립된 최우선 가치처럼 외치는 것은 공허한 구호에 불과합니다. 안전은 비즈니스의 모든 프로세스 속에 완전히 내재화(Embedded)되어 함께 숨쉬어야 합니다.""",
        "radford": """[래드포드 갈등 기제 모델]
• 3대 대립 양상:
  1. 가치와 신념의 불일치: 경영진은 '규정 준수와 비용'을 중시하고, 현장은 '실제 생존과 편의'를 중시합니다.
  2. 동적 조직 vs 정적 프로세스: 요동치며 변화하는 비즈니스 현실과 고정된 규칙 지향의 안전 프로그램이 지속적으로 충돌합니다.
  3. 불신과 소통 단절: 안전 부서가 '감시자/처벌자'로 인식되어 현장의 솔직한 위험 보고가 차단됩니다.""",
        "eisenhower": """[아이젠하워 제2분면과 안전문화]
• 제2분면(중요하지만 긴급하지 않은 영역): 계획 수립, 시스템 설계, 위험 예방, 교육 훈련, 안전문화 진단 등이 해당합니다.
• 현장의 문제: 대다수 안전 프로그램이 제1분면(긴급하고 중요한 사고 수습)이나 제3분면(긴급하지만 중요치 않은 형식적 서류 작업)에 매몰되어 있습니다.
• 해법: 리더십은 의도적으로 자원을 제2분면에 집중 투자하여 사고가 발생하기 전에 근원적인 시스템을 정비해야 합니다.""",
        "onboarding": """[온보딩(Onboarding) vs 오리엔테이션]
• 오리엔테이션(Orientation): 신규 입사자에게 규정, 복리후생, 서류 제출 등을 일방적으로 전달하는 단발성 행사(Event)입니다.
• 온보딩(Onboarding): 조직의 안전 가치, 규범, 위험 지각 방식, 암묵지 등을 전수하여 조직의 안전문화 구성원으로 완전히 동화시키는 장기적 육성 프로세스(Journey)입니다.""",
        "friction": """[조직 마찰과 윤활 (Organizational Friction & Lubrication)]
• 마찰: 부서 간 이기주의, 책임 전가, 불신, 모호한 역할 분담 등은 안전 프로세스의 실행력을 급격히 떨어뜨리는 내부 마찰력입니다.
• 윤활: 투명한 정보 공유, 공감과 경청, 심리적 안전감, 리더의 솔선수범이 조직 내 마찰을 줄이고 안전 실행을 원활하게 만듭니다."""
    },
    2: {
        "schein_culture": """[에드가 샤인의 조직문화 3계층 모델 (Edgar Schein's 3 Levels)]
1. 인공물(Artifacts): 눈에 보이는 건축물, 복장, 안전 표어, 게시판, 절차서 등 (관찰하기 쉬우나 본질 파악은 어려움)
2. 표방된 가치(Espoused Values): 조직이 공식적으로 표방하는 사명, 핵심가치, 경영 철학, 안전 방침
3. 기저의 기본 가정(Basic Underlying Assumptions): 구성원들이 무의식적으로 당연시하는 무언의 신념, 세계관, 인간관 (문화의 진정한 실체)
• 핵심 시사점: 표방된 가치와 기저의 가정이 불일치할 때 조직문화의 위선과 안전 사고가 발생합니다.""",
        "subculture": """[하위문화(Subculture)와 대립적 하위문화]
• 직종별, 직급별, 사업장별로 고유한 하위문화가 자연스럽게 형성됩니다 (예: 생산팀 문화, 정비팀 문화, 관리팀 문화).
• 대립적 하위문화(Counter-culture): 경영진의 공식 방침에 냉소적이거나 저항하는 비공식 문화가 형성되면, 공식 안전 지침은 무력화되고 비공식 위험 감수가 만연해집니다.""",
        "culture_history": """[안전문화의 역사적 배경과 교훈]
• 1986년 체르노빌 원전 참사 이후 국제원자력기구(IAEA)가 INSAG-1 보고서에서 '안전문화(Safety Culture)'라는 개념을 공식 도입했습니다.
• 단순한 기술적 결함이나 개인의 운전 미숙이 아니라, 조직 전체의 제도적 방심, 위험 경시, 투명하지 않은 보고 문화가 대참사의 근본 원인이었음을 규명했습니다.""",
        "culture_diagnosis": """[조직문화 진단 및 측정 방법론]
• 다차원적 진단: 단순 설문조사(양적 지표)에만 의존하지 않고, 심층 인터뷰, 포커스 그룹 인터뷰(FGI), 현장 참여 관찰(질적 지표)을 병행해야 합니다.
• 구성원의 지각(Perception): 실제로 규정이 무엇인지보다 구성원들이 경영진의 안전 의지를 어떻게 '지각'하고 있는지가 핵심 진단 대상입니다."""
    },
    3: {
        "social_network": """[공식 조직도 vs 비공식 사회 연결망(Informal Social Network)]
• 공식 조직도(Formal Org Chart): 법적 책임, 직위, 공식적 보고 라인을 보여줄 뿐 실제 정보와 영향력이 흐르는 경로를 반영하지 못합니다.
• 비공식 연결망: 현장 직원들이 실제로 조언을 구하고, 비밀을 공유하며, 위험을 대처할 때 의존하는 살아있는 인간관계망입니다. 안전 전문가는 이 비공식 네트워크의 핵심 연결자(Hub)를 찾아 안전 전파자로 삼아야 합니다.""",
        "safety_meme": """[리처드 도킨스의 밈(Meme) 이론과 안전 밈]
• 밈(Meme): 생물학적 유전자(Gene)처럼 사람들의 뇌와 행동을 통해 모방되고 복제되는 문화적 전달 단위입니다.
• 안전 밈: "기계 멈추지 말고 손으로 털어내면 일찍 끝난다", "헬멧은 감사 때만 쓴다" 같은 불안전 밈은 무섭게 전파됩니다.
• 전략: 긍정적이고 강력한 '안전 밈(Safe Meme)'을 개발하여 비공식 네트워크를 통해 바이럴하게 확산시켜야 합니다.""",
        "brokerage": """[네트워크 중심성과 구조적 공백(Brokerage)]
• 연결 중심성(Degree Centrality): 많은 동료와 직접 연결된 인물로 즉각적인 정보 확산의 거점입니다.
• 매개 중심성(Betweenness Centrality/Broker): 서로 단절된 두 부서나 집단을 이어주는 교량 역할을 하는 인물로, 부서 간 안전 장벽(Silo)을 허무는 데 결정적인 역할을 합니다.""",
        "network_kpi": """[사회연결망 기반 안전 소통 KPI]
• 부서 간 안전 소통 빈도, 타 부서 안전 모범사례 공유율, 비공식 안전 리더의 참여도 등 관계적 데이터를 측정하여 네트워크 건전성을 평가합니다."""
    },
    4: {
        "vision_mission": """[안전 비전, 미션, 핵심가치의 차이와 정렬]
• 비전(Vision): 우리가 도달하고자 하는 안전문화의 궁극적인 미래 청사진 ("사고 없는 건강한 일터")
• 미션(Mission): 비전을 달성하기 위해 우리가 매일 실천해야 할 핵심 과업과 존재 이유
• 핵심 가치(Values): 의사결정과 행동의 절대적 기준 ("타협하지 않는 생명 존중")
• 정렬(Alignment): 경영진의 사업 목표와 안전 비전이 하나로 일치되어 구성원에게 전달되어야 합니다.""",
        "planning_process": """[안전 기획 프로세스 (Charting the Course)]
1. 현주소 파악(Assessment): 현재의 위험과 조직문화 수준을 객관적으로 측정
2. 목표 설정(Goal Setting): 조직의 비전과 정합성을 갖춘 명확한 목표 수립
3. 전략 및 로드맵 수립: 단기·중기·장기 핵심 추진 과제 도출
4. 자원 배분: 예산, 인력, 장비의 실질적 지원 확약
5. 실행 및 피드백: 모니터링 체계와 지속적 보정 루프 가동""",
        "smart_goals": """[SMART 원칙에 입각한 안전 목표 설정]
• Specific (구체적): "안전 강화"가 아니라 "작업위험성평가 100% 개정"
• Measurable (측정 가능): 선행 지표 중심의 수치화된 측정치 설정
• Achievable (달성 가능): 현장 여건과 역량을 고려한 현실적 목표
• Relevant (관련성): 전사 경영 목표 및 중대재해 예방과 직결된 과제
• Time-bound (기한 명시): 달성 목표 시점의 명확한 지정""",
        "rollout_pitfall": """['롤아웃(Roll out)' 용어의 함정과 참여형 전략]
• 일방적 투하(Roll out): 본사가 프로그램을 만들어 현장에 일방적으로 굴려 보내는 방식은 현장의 저항과 피로감을 초래합니다.
• 참여형 개발: 기획 초기 단계부터 현장 작업자들을 워킹그룹에 참여시켜 "우리가 직접 만든 안전 시스템"이라는 오너십(Ownership)을 형성해야 합니다."""
    },
    5: {
        "sms_overview": """[안전경영시스템(SMS)의 6대 공통 핵심 요소]
1. 경영 리더십 및 구성원 참여 (Leadership & Employee Involvement)
2. 위험 식별 및 위험성평가 (Hazard Identification & Assessment)
3. 위험 예방 및 제어 (Hazard Prevention & Control)
4. 교육 및 훈련 (Education & Training)
5. 프로그램 평가 및 지속적 개선 (Program Evaluation & Improvement)
6. 다계층 소통 및 협력 (Multilevel Communication & Coordination)""",
        "pdca_safety": """[데밍(Deming)의 PDCA 선순환 사이클]
• Plan (계획): 위험 요인을 식별하고 방침과 목표를 수립
• Do (실행): 프로세스를 운영하고 교육 및 통제 조치 실행
• Check (점검): 모니터링, 성과 측정, 감사 및 조사
• Act (개선): 경영 검토를 통해 미비점을 시정하고 시스템 고도화
• 고착화 방지: PDCA는 한 번 돌고 끝나는 원이 아니라 나선형으로 상승하는 지속 개선 엔진입니다.""",
        "management_leadership": """[시스템을 지탱하는 쐐기돌(Keystone)로서의 경영 리더십]
• 리더십 없는 안전 시스템은 내용물 없는 껍데기(Paper Program)에 불과합니다.
• 리더는 자원 배분, 인사 고과 연계, 솔선수범을 통해 시스템에 생명력을 불어넣는 최종 책임자입니다.""",
        "sms_standards": """[글로벌 안전경영 표준 비교 (OSHA vs ANSI Z10 vs ISO 45001)]
• OSHA Voluntary Guidelines: 중소기업 맞춤형 자율 안전보건 관리 지침
• ANSI/ASSP Z10: 미국 국가표준으로 위험관리와 시스템적 접근법 강조
• ISO 45001: 최고경영자의 리더십, 조직 상황(Context) 분석, 근로자 참여를 강제화한 국제 표준"""
    },
    6: {
        "safety_process": """[체계적 안전 프로세스 구축 5단계]
1. 프로세스 식별 및 매핑: 작업 생애주기별 위험과 흐름을 가시화
2. 표준운영절차(SOP) 수립: 현장 실무자가 실제로 지킬 수 있는 기준 마련
3. 자원 및 도구 지원: 안전하게 일할 수 있는 적정 장비와 시간 제공
4. 실행 및 모니터링: 현장 순회와 동료 관찰을 통한 이행 점검
5. 편차 분석 및 피드백: 원인 규명과 절차서 지속적 개정""",
        "checkbox_pitfall": """[체크박스 채우기식 형식주의(Check-in-the-Box)의 폐해]
• 형식주의: 종이 체크리스트에 기계적으로 체크만 하고 실제 설비와 작업 행동은 살피지 않는 관료적 관행입니다.
• 위험성: 서류상으로는 100% 완벽하지만 실제 현장에서는 참사가 배양되는 '감각 마비'를 초래합니다.
• 극복: 체크리스트를 간소화하고, "왜 안전한가?"를 묻는 대화형 점검으로 전환해야 합니다.""",
        "taylor_analytical": """[테일러 과학적 관리법과 현대 시스템 안전의 차이]
• 프레더릭 테일러의 과학적 관리법: 인간을 기계 부품처럼 표준 동작에 종속시키고 관리자가 일방 통제하는 모델입니다.
• 현대 시스템 안전: 작업자는 실수의 원인이 아니라 시스템의 적응력을 발휘하는 유연한 해결사입니다. 작업자를 통제 대상이 아닌 안전 설계 파트너로 대우해야 합니다.""",
        "feedback_loop": """[피드백 루프와 폐루프(Closed Loop) 관리]
• 위험 보고서나 아차사고 제안이 접수되었을 때, 신속하게 개선 결과를 피드백해주지 않으면 직원은 다시는 보고하지 않습니다.
• 보고 -> 접수 -> 대책 수립 -> 현장 조치 -> 보고자 피드백으로 이어지는 폐루프가 완벽히 작동해야 합니다."""
    },
    7: {
        "schein": """[에드가 샤인(Edgar Schein, 2016)의 핵심 명제]
"문화와 리더십은 동전의 양면이다. 리더가 집단과 조직을 만들 때 먼저 문화를 창조하고, 일단 문화가 형성되면 그 문화가 리더십의 기준을 규정하여 누가 리더가 될 것인지 결정한다."
• 도입부 그림은 리더십과 문화의 동전 양면성 위에 '책무성(Accountability)', '권한(Authority)', '책임(Responsibility)'의 삼원조(Triad)가 유기적으로 순환 맞물려 있음을 상징합니다.""",
        "jha": """[안전 전문가의 JHA 4단계 정체성 전환 과정]
1. 1단계 [기술자/Technician]: 작업위험성평가(JHA)를 직접 정밀하게 분석하고 작성하는 실무 단계
2. 2단계 [훈련자/Trainer]: 현장 관리자 및 직원들에게 JHA 작성법을 교육하고 전파하는 단계
3. 3단계 [품질관리자/Quality Control]: 각 부서가 작성한 JHA의 기술적 타당성과 품질을 점검·승인하는 단계
4. 4단계 [전략적 조언자/Strategic Advisor]: 리더십 팀과 함께 전사 위험 트렌드를 분석하고 조직 차원의 안전문화 방향을 조율하는 최고 컨설턴트 단계""",
        "raa": """[RAA 매트릭스: 리더십 책무성의 3각 기둥]
1. 책무성 (Accountability): 최종 성패에 대한 전적인 책임 (위임 불가능, 무한 책임)
2. 권한 (Authority): 업무를 지시하고 자원을 집행하며 결정을 내릴 수 있는 공식적 권한
3. 책임 (Responsibility): 주어진 특정 과업을 성실하게 수행해야 할 실무적 의무 (위임 가능)
• 불균형의 비극: 권한 없이 책임만 주어지면 좌절과 번아웃이 오고, 책무성 없이 권한만 주어지면 독선과 위험 방치가 발생합니다.""",
        "transformational": """[변혁적 리더십 vs 거래적 리더십]
• 거래적 리더십: 규칙 준수에 대한 보상과 위반에 대한 처벌을 기본 동인으로 삼음 (최소 준수 유도)
• 변혁적 리더십: 이상적 영향력, 영감적 동기부여, 지적 자극, 개별적 배려를 통해 구성원 스스로 안전의 가치를 내면화하게 만듦""",
        "walking_tour": """[리더의 현장 순회(Safety Walk & Talk) 실천 원칙]
• 감사관의 태도를 버리고 질문하고 경청하는 학습자의 태도로 현장에 접근해야 합니다.
• "오늘 일하면서 가장 위험하거나 불편했던 점은 무엇인가요?", "제가 도와줄 수 있는 장애물은 무엇인가요?"를 묻고 메모합니다."""
    },
    8: {
        "involvement": """[직원 참여의 필요성과 4대 조치]
1. 필요성: 경영진이 현장에서 이루어지고 있다고 믿는 작업 방식과 실제 작업자가 수행하는 작업 방식 간에는 현격한 차이가 존재합니다. 현장 직원은 실제 위험에 가장 가까이 노출되어 비공식적 위험 회피 요령을 알고 있는 대체 불가능한 문제 해결사입니다.
2. 직원 참여 유도 4대 기본 조치:
   - 안전 노력에 직원을 직접 동참시키기
   - 경험 많은 직원을 위험성평가·사고조사의 '문제 해결사'로 초빙하기
   - 작업위험성평가(JHA) 검토 및 완성 과정에 직원을 참여시키기
   - 직원이 아이디어와 개선 제안을 자유롭게 제시하도록 격려하기""",
        "listening": """[James의 80/20 경청 법칙]
• 안전 대화 시 리더는 발언을 20%로 줄이고, 현장 직원의 목소리를 80% 경청해야 합니다.
• 지시와 훈계가 아니라 열린 질문(Open-ended questions)을 던지고 침묵을 견디며 작업자의 진솔한 의견을 이끌어내야 합니다.""",
        "pink_we_they": """[Daniel Pink의 언어 프레임워크 ('우리 vs 그들')]
• 직원이 회사를 이야기할 때 "그들이 정한 규칙", "그들이 시킨 일"이라고 표현하면 방관자 문화입니다.
• "우리가 함께 지키는 안전", "우리의 현장"이라는 '우리(We)' 언어가 사용될 때 진정한 참여와 오너십이 형성됩니다.""",
        "silence": """[위험 침묵(Safety Silence) 극복과 심리적 안전감]
• 침묵 원인: "말해봤자 바뀌지 않는다(무력감)", "괜히 말했다가 찍힌다(두려움)"
• Amy Edmondson의 심리적 안전감: 위험을 보고하거나 실수를 인정해도 처벌받거나 조롱당하지 않는다는 상호 신뢰 환경을 구축해야 침묵이 깨집니다.""",
        "safety_circle": """[현장 안전 분임조(Safety Circle)의 권한 위임]
• 관리자가 모든 안전 문제를 해결할 수 없습니다. 현장 라인별 소규모 분임조에게 권한을 위임하여 스스로 위험을 발굴하고 개선안을 실행하게 해야 합니다."""
    },
    9: {
        "unnecessary_risk": """[불필요한 위험을 감수하는 근본 원인]
1. 위험의 무형성(Intangible): 위험은 눈에 뻔히 보이지 않고 작업 일상 속에 은폐되어 있습니다.
2. 과거 편향(Past Experience Bias): 인간은 현재의 물리적 위험 잠재력이 아니라 '과거에 다치지 않았던 결과'에 기대어 안전을 착각합니다.
3. '일 끝내기 밈(Getting the Job Done Meme)': 기계를 멈추지 않고 손을 넣어 일찍 끝낸 경험이 운 좋게 무사고로 끝나면, 이 위험 행동이 강화되어 동료들에게 급속히 확산됩니다.
4. 위험 찬양 문화와 집단 동조: 위험을 비즈니스의 일부나 용기의 상징으로 미화하고, 집단 소속감을 위해 타인의 위험 행동을 방조합니다.""",
        "questioning_attitude": """[비판적 질문 태도 (Questioning Attitude)]
• 안전의 핵심은 '당연한 것은 없다'는 건강한 의심입니다.
• "지금 내가 하려는 작업의 최악의 시나리오는 무엇인가?", "내가 알지 못하는 잠재적 에너지가 잔류해 있지 않은가?", "절차서와 다른 예외 상황이 발생하면 어떻게 멈출 것인가?"를 끊임없이 스스로와 동료에게 질문해야 합니다.""",
        "case_studies": """[위험 지각 실패의 3대 글로벌 참사 교훈]
1. 석면(Asbestos): 수십 년의 잠복기로 인해 즉각적인 증상이 없자 위험을 무시하고 경제적 이익을 앞세우다 수십만 명의 직업병 희생자 발생
2. 챌린저호 폭발(1986): 저온에서 O-링 탄성 저하 위험을 알면서도 "과거 발사에서도 문제없었다"는 정규화된 편향(Normalization of Deviance)에 빠져 발사 강행
3. 보팔 참사(1984): 비용 절감을 위해 안전장치를 꺼두고 경보 시스템을 방치하여 치명적인 유독가스가 누출, 수천 명 사망""",
        "golden_rule": """[위험 지각의 황금률 (Golden Rule)]
"위험이 완전히 통제되었다는 객관적 증거가 확인될 때까지, 그 어떤 위험도 안전하다고 지각하지 말라."
(Never assume a condition is safe until verifiable controls are in place.)"""
    },
    10: {
        "rearview": """[워런 버핏의 백미러 비유와 사후 지표의 한계]
• 워런 버핏은 "비즈니스 세계에서 백미러는 앞유리보다 훨씬 더 선명하다"고 말했습니다.
• 대다수 안전 프로그램이 이미 벌어진 과거 사고 데이터(사후 지표/Lagging Indicators)와 보험 청구 순위에만 매몰되어 있습니다.
• 이는 앞을 보지 않고 백미러만 보며 전속력으로 운전하는 것과 같으며, 잠재 위험의 불확실성을 선제적으로 예측하는 선행 지표(Leading Indicators)와 정성적 위험관리로 전환해야 합니다.""",
        "no_loss_myth": """['No Loss No Risk' 신화의 치명적 함정]
• 작업이 사고 없이 여러 번 완료되면 "손실이 없었으니 위험도 없다"는 착각에 빠집니다.
• 시스템 설계, 장비, 교육에 '잠재적 오류(Latent Errors)'가 켜켜이 누적되어 있어도, 단지 운(Luck)이 좋았을 뿐인데 안전하다고 착각하는 것입니다.
• 손실 여부와 상관없이 시스템에 내재된 위험 잠재력 자체를 평가해야 합니다.""",
        "four_t_strategy": """[4T 위험 대응 전략 (Risk Response Framework)]
1. Terminate (종결/제거): 위험 요인 자체를 완전히 없앰 (예: 유해 화학물질 사용 중단)
2. Treat (처리/완화): 엔지니어링 통제, 방호 덮개, 작업 절차 개선 등을 통해 위험 강도 완화
3. Transfer (이전/전가): 보험 가입, 전문 계약업체 위탁 등을 통해 재정적·운영적 위험 이전
4. Tolerate (수용/감수): 완화 후 남은 잔여 위험이 허용 기준 이하일 때 지속 모니터링하며 수용""",
        "eight_steps": """[위험관리 8단계 체계 (ISO 31000 기반)]
1. 범위 및 목표 설정 (Establish Context)
2. 위험 식별 (Hazard Identification)
3. 위험 분석 (Risk Analysis - 빈도와 강도 추정)
4. 위험 평가 (Risk Evaluation - 허용 기준 비교)
5. 위험 처리 (Risk Treatment - 4T 전략 적용)
6. 잔여 위험 평가 (Residual Risk Assessment)
7. 모니터링 및 검토 (Monitoring & Review)
8. 소통 및 협의 (Communication & Consultation)""",
        "offal_case": """[사료공장 내장 청소(Offal Pit) 밀폐공간 참사 교훈]
• 밀폐된 구덩이에 들어간 작업자가 황화수소 가스에 질식하자, 아무런 보호구 없이 동료 2명이 연이어 구하러 들어갔다가 3명 전원 사망한 비극.
• 위험 지각의 왜곡, '동료를 구해야 한다'는 감정적 반응, 밀폐공간 사전 산소·가스 측정 부재, 비상구조 절차 미비가 결합된 전형적 다중 사망 사고로, 사전 위험성평가의 절대적 중요성을 입증합니다.""",
        "total_vs_residual": """[총 위험(Total Risk) vs 잔여 위험(Residual Risk)]
• 총 위험: 어떠한 예방 조치나 통제 수단도 적용하지 않았을 때의 원초적 위험 수준
• 잔여 위험: 1차, 2차 통제 조치를 모두 적용하고 난 뒤에도 여전히 남아있는 최종 위험 수준
• 핵심: 잔여 위험이 조직의 허용 기준치(ALARP, As Low As Reasonably Practicable) 이하로 낮아졌는지 반드시 검증해야 작업을 승인할 수 있습니다."""
    }
}

CHAPTER_QUICK_CHIPS = {
    "all": [
        {"q": "에드가 샤인의 문화와 리더십 동전 양면성 이론이란?", "text": "🪙 문화-리더십 양면성"},
        {"q": "발현적 속성(Emergent Property)과 안전의 정의는?", "text": "🌱 발현적 속성 정의"},
        {"q": "공식 조직도 vs 비공식 사회 연결망과 안전 밈은?", "text": "🌐 비공식 연결망과 밈"},
        {"q": "SMART 원칙에 입각한 안전문화 비전과 기획 수립은?", "text": "🗺️ SMART 안전 기획"},
        {"q": "안전경영시스템(SMS)의 6대 핵심 요소와 PDCA 사이클은?", "text": "🔗 SMS와 PDCA 사이클"},
        {"q": "체크박스 채우기식 형식주의의 한계와 안전 프로세스는?", "text": "🔄 프로세스 vs 형식주의"},
        {"q": "RAA 매트릭스(책무성, 권한, 책임)의 핵심 구조는?", "text": "🧭 RAA 매트릭스"},
        {"q": "직원의 위험 침묵(Safety Silence) 극복과 심리적 안전감은?", "text": "👥 침묵 극복과 심리적 안전"},
        {"q": "불필요한 위험을 감수하는 원인과 3대 글로벌 참사는?", "text": "⚠️ 위험 감수 원인과 참사"},
        {"q": "워런 버핏의 백미러 비유와 4T 위험 대응 전략은?", "text": "🛡️ 백미러 비유와 4T 전략"}
    ],
    1: [
        {"q": "발현적 속성(Emergent Property)이란 무엇인가요?", "text": "🌱 발현적 속성 정의"},
        {"q": "몬탄테의 안전 정의와 'Safety First' 비판 이유는?", "text": "🔬 몬탄테의 안전 정의"},
        {"q": "래드포드 모델에서 리더십과 안전 부서의 갈등 원인은?", "text": "🔀 래드포드 갈등 기제"},
        {"q": "아이젠하워 제2분면과 안전문화 구축의 연관성은?", "text": "⏱️ 2분면 시간 관리"},
        {"q": "오리엔테이션과 온보딩의 본질적 차이는?", "text": "🚀 온보딩 vs 오리엔테이션"},
        {"q": "조직 마찰과 윤활의 개념은?", "text": "⚙️ 조직 마찰과 윤활"}
    ],
    2: [
        {"q": "에드가 샤인의 조직문화 3계층 모델은 무엇인가요?", "text": "🏛️ 샤인의 3계층 모델"},
        {"q": "하위문화(Subculture)와 대립적 하위문화의 위험성은?", "text": "👥 하위문화의 충돌"},
        {"q": "체르노빌 참사가 안전문화 개념에 미친 영향은?", "text": "☢️ 체르노빌 교훈"},
        {"q": "조직문화를 객관적으로 진단하고 측정하는 방법은?", "text": "📊 문화 진단 방법론"}
    ],
    3: [
        {"q": "공식 조직도와 비공식 사회 연결망의 차이는?", "text": "🌐 비공식 연결망 위력"},
        {"q": "리처드 도킨스의 밈(Meme) 이론과 안전 밈 확산은?", "text": "🧬 안전 밈(Meme) 이론"},
        {"q": "네트워크 중심성과 구조적 공백(Brokerage)의 역할은?", "text": "🌉 브로커리지와 중심성"},
        {"q": "사회연결망 기반 안전 소통 KPI는 어떻게 설계하나요?", "text": "📈 연결망 소통 KPI"}
    ],
    4: [
        {"q": "안전 비전, 미션, 핵심가치의 차이와 정렬 방법은?", "text": "🎯 비전·미션·가치 정렬"},
        {"q": "안전 기획 프로세스(Charting the Course)의 5단계는?", "text": "🗺️ 항로 설정 5단계"},
        {"q": "SMART 원칙에 기반한 안전 목표 설정이란?", "text": "📐 SMART 안전 목표"},
        {"q": "'롤아웃(Roll out)' 용어의 거부감과 참여형 전략은?", "text": "💡 롤아웃의 함정"}
    ],
    5: [
        {"q": "안전경영시스템(SMS)의 6대 공통 핵심 요소는?", "text": "🔗 SMS 6대 핵심 요소"},
        {"q": "데밍의 PDCA 사이클과 안전 선순환은?", "text": "🔄 PDCA 사이클"},
        {"q": "시스템을 지탱하는 쐐기돌로서의 경영 리더십은?", "text": "👑 쐐기돌 리더십"},
        {"q": "OSHA, ANSI Z10, ISO 45001 글로벌 표준의 차이는?", "text": "🌐 글로벌 표준 비교"}
    ],
    6: [
        {"q": "체계적 안전 프로세스 구축 5단계는?", "text": "🔄 안전 프로세스 5단계"},
        {"q": "체크박스 채우기식 형식주의(Check-in-the-Box)의 폐해는?", "text": "📋 형식주의 폐해"},
        {"q": "테일러 과학적 관리법과 현대 시스템 안전의 차이는?", "text": "⚙️ 테일러 vs 시스템 안전"},
        {"q": "안전 피드백 루프와 폐루프 관리란?", "text": "🔁 폐루프 피드백"}
    ],
    7: [
        {"q": "문화와 리더십의 동전 양면성(Schein)이란?", "text": "🪙 문화-리더십 양면성"},
        {"q": "안전 전문가의 JHA 4단계 정체성 전환 과정은?", "text": "🧭 JHA 4단계 전환"},
        {"q": "RAA 매트릭스(책무성, 권한, 책임)의 구조는?", "text": "📐 RAA 매트릭스"},
        {"q": "변혁적 리더십과 거래적 리더십의 차이는?", "text": "✨ 변혁적 리더십"},
        {"q": "리더의 현장 순회(Safety Walk & Talk) 실천 원칙은?", "text": "🚶‍♂️ 현장 순회 대화법"}
    ],
    8: [
        {"q": "현장 직원 참여의 필요성과 4대 조치는?", "text": "👥 직원 참여 4대 조치"},
        {"q": "James의 80/20 경청 법칙이란?", "text": "👂 80/20 경청 법칙"},
        {"q": "Daniel Pink의 '우리 vs 그들' 언어 프레임워크는?", "text": "💬 우리 vs 그들 언어"},
        {"q": "위험 침묵(Safety Silence) 극복과 심리적 안전감은?", "text": "🤫 위험 침묵 극복"},
        {"q": "현장 안전 분임조(Safety Circle)와 권한 위임은?", "text": "⭕ 안전 분임조"}
    ],
    9: [
        {"q": "불필요한 위험을 감수하는 근본 원인은?", "text": "⚠️ 위험 감수 원인"},
        {"q": "비판적 질문 태도(Questioning Attitude)란?", "text": "❓ 비판적 질문 태도"},
        {"q": "석면, 챌린저호, 보팔 참사의 위험 지각 실패 교훈은?", "text": "💥 3대 글로벌 참사"},
        {"q": "위험 지각의 황금률(Golden Rule)은 무엇인가요?", "text": "⭐ 위험 지각 황금률"}
    ],
    10: [
        {"q": "워런 버핏의 백미러 비유와 사후 지표의 한계는?", "text": "🪞 버핏의 백미러 비유"},
        {"q": "'No Loss No Risk' 신화의 위험성은?", "text": "⚡ 무사고 신화의 함정"},
        {"q": "4T 위험 대응 전략(Terminate, Treat, Transfer, Tolerate)은?", "text": "🛡️ 4T 대응 전략"},
        {"q": "위험관리 8단계 체계의 구체적 절차는?", "text": "📊 위험관리 8단계"},
        {"q": "사료공장 내장 청소(Offal Pit) 참사의 교훈은?", "text": "🏭 사료공장 참사 교훈"},
        {"q": "총 위험(Total Risk)과 잔여 위험(Residual Risk)의 차이는?", "text": "⚖️ 총 위험 vs 잔여 위험"}
    ]
}

def extract_prompts(ch_num, html_text):
    prompts = {}
    m = re.search(r'const\s+PROMPTS_DATA\s*=\s*(\{.*?\n\};)', html_text, re.S)
    if m:
        block = m.group(1)
        for p_match in re.finditer(r'(p\d+)\s*:\s*`([^`]*)`', block, re.S):
            pid, text = p_match.groups()
            prompts[f"ch{ch_num}_{pid}"] = text
    return prompts

def extract_raw_kb(ch_num, html_text):
    kb = {}
    m = re.search(r'const\s+CHAPTER\d+_KB\s*=\s*(\{.*?\n\};)', html_text, re.S)
    if m:
        block = m.group(1)
        for k_match in re.finditer(r'[\"\']?([a-zA-Z0-9_]+)[\"\']?\s*:\s*[`\"](.*?)[\`\"](?=,\s*[\"\']?[a-zA-Z0-9_]+|\s*\})', block, re.S):
            k, text = k_match.groups()
            kb[k] = text.replace('\\n', '\n')
    return kb

def build_unified_html():
    all_prompts = {}
    chapters_content = []
    sidebar_groups = []

    for meta in CHAPTER_METAS:
        ch = meta["ch"]
        fname = f"subnote/chapter{ch}_subnote.html"
        with open(fname, "r", encoding="utf-8") as f:
            html = f.read()

        # Prompts
        prompts = extract_prompts(ch, html)
        all_prompts.update(prompts)

        # Extract main
        main_m = re.search(r"<main[^>]*>(.*?)</main>", html, re.S)
        if not main_m:
            raise ValueError(f"No <main> in chapter {ch}")
        raw_content = main_m.group(1).strip()

        # Extract sidebar
        sb_m = re.search(r"<aside class=[\"']left-sidebar[\"'][^>]*>(.*?)</aside>", html, re.S)
        sb_items = []
        if sb_m:
            for a_m in re.finditer(r"<a\s+([^>]*?)href=[\"']#?([^\"'#]+)[\"']([^>]*)>(.*?)</a>", sb_m.group(1), re.S):
                pre_attrs, href, post_attrs, text = a_m.groups()
                text_clean = re.sub(r"\s+", " ", text).strip()
                if not href.endswith(".html"):
                    sb_items.append((href, text_clean))

        # Namespacing content IDs (ensure we only match standalone id=, not data-prompt-id=)
        def id_repl(match):
            old_id = match.group(1)
            return f'id="ch{ch}-{old_id}"'
        content = re.sub(r'(?<=\s)id=[\"\']([a-zA-Z0-9_-]+)[\"\']', id_repl, raw_content)

        # Namespacing intra-page hash hrefs
        def href_repl(match):
            old_href = match.group(1)
            return f'href="#ch{ch}-{old_href}"'
        content = re.sub(r'href=[\"\']#([a-zA-Z0-9_-]+)[\"\']', href_repl, content)

        # Cross-chapter links
        content = re.sub(r'href=[\"\']chapter(\d+)_subnote\.html[^\"]*[\"\']', r'href="#chapter-\1"', content)

        # Prompt attributes
        content = re.sub(r'data-prompt-id=[\"\']([a-zA-Z0-9_-]+)[\"\']', f'data-prompt-id="ch{ch}_\\1"', content)
        content = re.sub(r'data-target=[\"\']([a-zA-Z0-9_-]+)[\"\']', f'data-target="ch{ch}_\\1"', content)

        prefixed_sb = [(f"ch{ch}-{href}", text) for href, text in sb_items]

        # Assemble chapter wrapper
        prev_ch = ch - 1 if ch > 1 else None
        next_ch = ch + 1 if ch < 10 else None

        footer_nav_html = f'''
        <div class="chapter-footer-nav">
          <div class="chapter-nav-btns">
            {"<a href='#chapter-" + str(prev_ch) + "' class='ch-nav-btn prev'>◀ 이전 챕터 " + str(prev_ch) + "</a>" if prev_ch else "<span></span>"}
            <a href="#top" class="ch-nav-btn top">⬆️ 문서 맨 위로</a>
            {"<a href='#chapter-" + str(next_ch) + "' class='ch-nav-btn next'>다음 챕터 " + str(next_ch) + " ▶</a>" if next_ch else "<span></span>"}
          </div>
        </div>
        '''

        chapter_html = f'''
        <article class="chapter-container" id="chapter-{ch}" data-chapter="{ch}">
          <div class="chapter-hero-banner" style="border-top: 4px solid {meta['color']};">
            <div class="chapter-badge-row">
              <span class="chapter-badge-lg" style="background: {meta['color']}; color: #0b1120;">CHAPTER {ch:02d}</span>
              <span class="chapter-part-tag">{meta['part']} · {meta['part_ko']}</span>
            </div>
            <h2 class="chapter-hero-title">{meta['icon']} {meta['title_ko']}</h2>
            <div class="chapter-hero-subtitle">{meta['title_en']}</div>
            <p class="chapter-hero-desc">{meta['desc']}</p>
            <div class="chapter-meta-bar">
              <span>📖 총 {len(prefixed_sb)}개 소절</span>
              <span>·</span>
              <span>출처: Safety Culture (Elsevier, 2019) Chapter {ch}</span>
            </div>
          </div>

          <div class="chapter-body-content">
            {content}
          </div>

          {footer_nav_html}
        </article>
        '''
        chapters_content.append(chapter_html)

        # Sidebar navigation group for this chapter
        sections_li_html = "\n".join([
            f'<li><a href="#{href}" class="nav-link" data-chapter="{ch}">{text}</a></li>'
            for href, text in prefixed_sb
        ])

        sidebar_group_html = f'''
        <div class="nav-chapter-group {'active-group' if ch == 1 else ''}" data-chapter="{ch}">
          <button class="nav-chapter-header" type="button" aria-expanded="{'true' if ch == 1 else 'false'}">
            <div class="nav-ch-title-box">
              <span class="nav-ch-badge" style="background: {meta['color']}; color: #0b1120;">Ch.{ch:02d}</span>
              <span class="nav-ch-title">{meta['icon']} {meta['title_ko']}</span>
            </div>
            <div class="nav-ch-meta">
              <span class="nav-ch-count">{len(prefixed_sb)}절</span>
              <span class="nav-ch-arrow">▾</span>
            </div>
          </button>
          <ul class="nav-chapter-sections" {'style="display: block;"' if ch == 1 else 'style="display: none;"'}>
            {sections_li_html}
          </ul>
        </div>
        '''
        sidebar_groups.append(sidebar_group_html)

    # Convert GLOBAL_KB and all_prompts to JSON
    global_kb_json = json.dumps(GLOBAL_KB, ensure_ascii=False, indent=2)
    quick_chips_json = json.dumps(CHAPTER_QUICK_CHIPS, ensure_ascii=False, indent=2)
    prompts_data_json = json.dumps(all_prompts, ensure_ascii=False, indent=2)

    # Overview Banner at top of main content
    overview_banner_html = '''
    <section class="overview-hero" id="doc-overview">
      <div class="overview-badge-row">
        <span class="hero-tag">Complete Edition · 전 10개 챕터 완결본</span>
        <span class="hero-academic-tag">Elsevier Academic Subnote Suite</span>
      </div>
      <h1 class="overview-title">Safety Culture: An Innovative Leadership Approach</h1>
      <p class="overview-lead">
        안전문화: 혁신적 리더십 접근법 (James Roughton, Nathan Crutchfield &amp; Michael Waite, Elsevier, 2019)
      </p>
      <div class="overview-author-note">
        본 문서는 원서 1장부터 10장까지의 전체 서브노트를 하나로 통합한 마스터 학술 연구·실무 플랫폼입니다. 
        원문의 26개~31개에 달하는 정밀 절차, 표와 그림, 4대 참사 사례 연구, JHA 4단계 전환 모델, RAA 매트릭스, 
        비판적 AI 학습 프롬프트 및 대화형 AI 튜터 지식엔진을 100% 완전 탑재하였습니다.
      </div>

      <!-- Parts Architecture Grid -->
      <div class="parts-grid">
        <div class="part-card part-1">
          <div class="part-badge">PART I (Ch.01 ~ 04)</div>
          <h3>Laying the Foundation</h3>
          <p class="part-desc">안전 지각의 발현적 속성, 조직문화 3계층, 비공식 사회 연결망 및 안전 밈, 비전과 SMART 기획</p>
          <div class="part-links">
            <a href="#chapter-1">Ch.1 안전 지각</a>
            <a href="#chapter-2">Ch.2 조직문화</a>
            <a href="#chapter-3">Ch.3 사회연결망</a>
            <a href="#chapter-4">Ch.4 방향 설정</a>
          </div>
        </div>

        <div class="part-card part-2">
          <div class="part-badge">PART II (Ch.05 ~ 08)</div>
          <h3>Building Safety Culture &amp; SMS</h3>
          <p class="part-desc">안전경영시스템(SMS) 6대 요소, 지속적 프로세스 구축, 리더십-문화 동전 양면성 및 현장 직원 참여</p>
          <div class="part-links">
            <a href="#chapter-5">Ch.5 SMS 개요</a>
            <a href="#chapter-6">Ch.6 프로세스 구축</a>
            <a href="#chapter-7">Ch.7 리더십 평가</a>
            <a href="#chapter-8">Ch.8 직원 참여</a>
          </div>
        </div>

        <div class="part-card part-3">
          <div class="part-badge">PART III (Ch.09 ~ 10)</div>
          <h3>Handling Perception of Risk</h3>
          <p class="part-desc">위험 지각의 실패 원인과 3대 참사, 워런 버핏의 백미러 비유 탈피, No Loss 신화 분쇄 및 4T 전략</p>
          <div class="part-links">
            <a href="#chapter-9">Ch.9 위험 지각</a>
            <a href="#chapter-10">Ch.10 위험관리 원칙</a>
          </div>
        </div>
      </div>

      <!-- Quick Chapter Pills -->
      <div class="quick-chapter-pills-row">
        <span class="pills-label">⚡ 챕터 바로가기:</span>
        <div class="pills-container">
          <a href="#chapter-1" class="ch-pill">Ch.01 안전 지각</a>
          <a href="#chapter-2" class="ch-pill">Ch.02 조직문화</a>
          <a href="#chapter-3" class="ch-pill">Ch.03 연결망·밈</a>
          <a href="#chapter-4" class="ch-pill">Ch.04 비전·기획</a>
          <a href="#chapter-5" class="ch-pill">Ch.05 SMS 개요</a>
          <a href="#chapter-6" class="ch-pill">Ch.06 프로세스</a>
          <a href="#chapter-7" class="ch-pill">Ch.07 리더십</a>
          <a href="#chapter-8" class="ch-pill">Ch.08 직원 참여</a>
          <a href="#chapter-9" class="ch-pill">Ch.09 위험 지각</a>
          <a href="#chapter-10" class="ch-pill">Ch.10 위험관리</a>
        </div>
      </div>
    </section>
    '''

    all_chapters_html = "\n".join(chapters_content)
    sidebar_all_html = "\n".join(sidebar_groups)

    full_html = f'''<!doctype html>
<html lang="ko" data-theme="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Safety Culture 통합 서브노트 (Chapters 1~10) — 학술 연구 &amp; 대화형 AI 플랫폼</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=IBM+Plex+Sans+KR:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <script>
      mermaid.initialize({{
        startOnLoad: true,
        theme: 'dark',
        securityLevel: 'loose',
        fontFamily: 'IBM Plex Sans KR, sans-serif'
      }});
    </script>
    <style>
:root {{
  --bg-main: #0b1120;
  --bg-card: #151f32;
  --bg-card-sub: #1e293b;
  --bg-input: #26334d;
  --text-main: #f8fafc;
  --text-sub: #cbd5e1;
  --text-muted: #94a3b8;
  --accent-blue: #38bdf8;
  --accent-cyan: #06b6d4;
  --accent-red: #ef4444;
  --accent-gold: #f59e0b;
  --accent-green: #10b981;
  --accent-purple: #a855f7;
  --accent-orange: #f97316;
  --border-color: #334155;
  --sidebar-w: 330px;
  --ai-panel-w: 390px;
  --header-h: 68px;
  --shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}}

[data-theme="light"] {{
  --bg-main: #f1f5f9;
  --bg-card: #ffffff;
  --bg-card-sub: #f8fafc;
  --bg-input: #e2e8f0;
  --text-main: #0f172a;
  --text-sub: #334155;
  --text-muted: #64748b;
  --accent-blue: #0284c7;
  --accent-cyan: #0891b2;
  --accent-red: #dc2626;
  --accent-gold: #d97706;
  --accent-green: #059669;
  --accent-purple: #7e22ce;
  --accent-orange: #ea580c;
  --border-color: #cbd5e1;
  --shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
  --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}}

* {{ box-sizing: border-box; margin: 0; padding: 0; }}
html {{ scroll-behavior: smooth; }}
body {{
  font-family: 'IBM Plex Sans KR', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: var(--bg-main);
  color: var(--text-main);
  line-height: 1.7;
  overflow-x: hidden;
}}

/* Top Reading Progress Bar */
#reading-progress-bar {{
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-blue), var(--accent-cyan), var(--accent-gold));
  width: 0%;
  z-index: 2000;
  transition: width 0.1s ease;
}}

/* Header */
header.app-header {{
  height: var(--header-h);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: var(--shadow-sm);
}}

.brand-area {{
  display: flex;
  align-items: center;
  gap: 12px;
}}

.brand-badge {{
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  color: #fff;
  font-weight: 800;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 6px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  white-space: nowrap;
}}

.brand-title {{
  font-family: 'Black Han Sans', sans-serif;
  font-size: 19px;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
}}
.brand-title span.sub {{
  font-family: 'IBM Plex Sans KR', sans-serif;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-muted);
}}

.header-center {{
  flex: 1;
  max-width: 320px;
  margin: 0 16px;
}}

.quick-chapter-select {{
  width: 100%;
  background: var(--bg-card-sub);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  outline: none;
}}
.quick-chapter-select:focus {{
  border-color: var(--accent-blue);
}}

.header-actions {{
  display: flex;
  align-items: center;
  gap: 8px;
}}

.action-btn {{
  background: var(--bg-card-sub);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;
}}
.action-btn:hover {{
  border-color: var(--accent-blue);
  color: var(--accent-blue);
}}
.action-btn.primary {{
  background: var(--accent-blue);
  color: #0b1120;
  border-color: var(--accent-blue);
}}
.action-btn.primary:hover {{
  background: #0284c7;
  color: #fff;
}}

/* App Wrapper: 3-column layout */
.app-wrapper {{
  display: flex;
  min-height: calc(100vh - var(--header-h));
}}

/* Left Sidebar Navigation */
.left-sidebar {{
  width: var(--sidebar-w);
  min-width: var(--sidebar-w);
  background: var(--bg-card);
  border-right: 1px solid var(--border-color);
  height: calc(100vh - var(--header-h));
  position: sticky;
  top: var(--header-h);
  overflow-y: auto;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}}

.sidebar-header-box {{
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}}

.sidebar-title {{
  font-size: 14px;
  font-weight: 800;
  color: var(--text-main);
  display: flex;
  align-items: center;
  justify-content: space-between;
}}
.sidebar-badge {{
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 10px;
  background: var(--bg-card-sub);
  color: var(--accent-blue);
  border: 1px solid var(--border-color);
}}

.sidebar-tools-row {{
  display: flex;
  gap: 6px;
}}
.sidebar-tool-btn {{
  flex: 1;
  background: var(--bg-card-sub);
  color: var(--text-sub);
  border: 1px solid var(--border-color);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}}
.sidebar-tool-btn:hover {{
  color: var(--accent-blue);
  border-color: var(--accent-blue);
}}

.nav-search {{
  width: 100%;
  padding: 8px 12px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-main);
  font-size: 12.5px;
}}
.nav-search:focus {{
  outline: none;
  border-color: var(--accent-blue);
}}

/* Nav Chapter Accordion */
.nav-chapters-tree {{
  display: flex;
  flex-direction: column;
  gap: 8px;
}}

.nav-chapter-group {{
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card-sub);
  overflow: hidden;
  transition: border-color 0.2s ease;
}}
.nav-chapter-group.active-group {{
  border-color: rgba(56, 189, 248, 0.4);
}}

.nav-chapter-header {{
  width: 100%;
  padding: 9px 12px;
  background: transparent;
  border: none;
  color: var(--text-main);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  text-align: left;
  font-size: 13px;
  font-weight: 700;
}}
.nav-chapter-header:hover {{
  background: rgba(255, 255, 255, 0.03);
}}

.nav-ch-title-box {{
  display: flex;
  align-items: center;
  gap: 8px;
}}
.nav-ch-badge {{
  font-size: 10px;
  font-weight: 800;
  padding: 2px 5px;
  border-radius: 4px;
  letter-spacing: 0.3px;
}}
.nav-ch-title {{
  font-size: 12.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 170px;
}}

.nav-ch-meta {{
  display: flex;
  align-items: center;
  gap: 6px;
}}
.nav-ch-count {{
  font-size: 10.5px;
  color: var(--text-muted);
}}
.nav-ch-arrow {{
  font-size: 12px;
  color: var(--text-muted);
  transition: transform 0.2s ease;
}}
.nav-chapter-group.expanded .nav-ch-arrow {{
  transform: rotate(180deg);
}}

.nav-chapter-sections {{
  list-style: none;
  padding: 6px 8px 10px 10px;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-height: 380px;
  overflow-y: auto;
}}

.nav-link {{
  display: block;
  padding: 5px 8px;
  color: var(--text-sub);
  text-decoration: none;
  font-size: 11.5px;
  border-radius: 5px;
  transition: all 0.15s ease;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}}
.nav-link:hover {{
  background: var(--bg-input);
  color: var(--accent-blue);
}}
.nav-link.active {{
  background: rgba(56, 189, 248, 0.15);
  color: var(--accent-blue);
  font-weight: 700;
}}

/* Center Content */
.main-content {{
  flex: 1;
  min-width: 0;
  max-width: 1180px;
  margin: 0 auto;
  padding: 32px 36px 80px;
}}

/* Overview Hero Banner */
.overview-hero {{
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 36px;
  margin-bottom: 48px;
  box-shadow: var(--shadow);
  border-top: 4px solid var(--accent-blue);
}}

.overview-badge-row {{
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}}
.hero-academic-tag {{
  background: rgba(168, 85, 247, 0.15);
  color: var(--accent-purple);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 700;
}}

.overview-title {{
  font-size: 32px;
  font-weight: 800;
  line-height: 1.25;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}}
[data-theme="light"] .overview-title {{
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}}

.overview-lead {{
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-blue);
  margin-bottom: 16px;
}}

.overview-author-note {{
  font-size: 14px;
  color: var(--text-sub);
  line-height: 1.7;
  padding: 16px 20px;
  background: var(--bg-card-sub);
  border-radius: 10px;
  border-left: 4px solid var(--accent-cyan);
  margin-bottom: 24px;
}}

.parts-grid {{
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}}
.part-card {{
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}}
.part-badge {{
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--accent-gold);
  margin-bottom: 6px;
}}
.part-card h3 {{
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 8px;
}}
.part-desc {{
  font-size: 12.5px;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 14px;
  flex: 1;
}}
.part-links {{
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}}
.part-links a {{
  font-size: 11.5px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  background: var(--bg-card-sub);
  color: var(--text-sub);
  text-decoration: none;
  border: 1px solid var(--border-color);
}}
.part-links a:hover {{
  color: var(--accent-blue);
  border-color: var(--accent-blue);
}}

.quick-chapter-pills-row {{
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
  flex-wrap: wrap;
}}
.pills-label {{
  font-size: 13px;
  font-weight: 700;
  color: var(--text-muted);
  white-space: nowrap;
}}
.pills-container {{
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}}
.ch-pill {{
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--bg-card-sub);
  color: var(--text-main);
  text-decoration: none;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}}
.ch-pill:hover {{
  background: var(--accent-blue);
  color: #0b1120;
  border-color: var(--accent-blue);
}}

/* Chapter Container & Hero */
.chapter-container {{
  margin-bottom: 64px;
  scroll-margin-top: calc(var(--header-h) + 20px);
}}

.chapter-hero-banner {{
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: var(--shadow-sm);
}}

.chapter-badge-row {{
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}}
.chapter-badge-lg {{
  font-size: 12px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: 0.5px;
}}
.chapter-part-tag {{
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-muted);
}}

.chapter-hero-title {{
  font-size: 26px;
  font-weight: 800;
  margin-bottom: 4px;
  color: var(--text-main);
}}
.chapter-hero-subtitle {{
  font-size: 15px;
  font-weight: 500;
  color: var(--accent-blue);
  margin-bottom: 12px;
}}
.chapter-hero-desc {{
  font-size: 14.5px;
  color: var(--text-sub);
  line-height: 1.6;
  margin-bottom: 16px;
}}
.chapter-meta-bar {{
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--text-muted);
  border-top: 1px solid var(--border-color);
  padding-top: 12px;
}}

/* Chapter Footer Nav */
.chapter-footer-nav {{
  margin-top: 40px;
  padding: 20px;
  background: var(--bg-card-sub);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}}
.chapter-nav-btns {{
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}}
.ch-nav-btn {{
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  background: var(--bg-card);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}}
.ch-nav-btn:hover {{
  border-color: var(--accent-blue);
  color: var(--accent-blue);
}}
.ch-nav-btn.top {{
  background: transparent;
  color: var(--text-muted);
}}
.ch-nav-btn.top:hover {{
  color: var(--text-main);
}}

/* Typography & Subnote Styles within Chapters */
.content-title {{
  display: none; /* Replaced by Chapter Hero */
}}
.content-meta {{
  display: none; /* Replaced by Chapter Hero */
}}

section.section-box {{
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: var(--shadow-sm);
  scroll-margin-top: calc(var(--header-h) + 20px);
}}
section.section-box:hover {{
  border-color: rgba(56, 189, 248, 0.4);
}}

h2.sec-heading, .section-title {{
  font-size: 21px;
  font-weight: 800;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-main);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
}}
.section-header {{
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 16px;
  margin-bottom: 20px;
}}
.section-badge {{
  font-size: 12px;
  font-weight: 700;
  color: var(--accent-blue);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  display: block;
  margin-bottom: 4px;
}}
.section-subtitle {{
  font-size: 13.5px;
  color: var(--text-muted);
  margin-top: 4px;
}}

h3.sub-heading, h3.sub-title {{
  font-size: 17px;
  font-weight: 700;
  margin: 22px 0 10px;
  color: var(--accent-blue);
  display: flex;
  align-items: center;
  gap: 6px;
}}
h4.sub-sub-title {{
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main);
  margin: 16px 0 8px;
}}

p {{
  margin-bottom: 14px;
  font-size: 14.5px;
  color: var(--text-sub);
  line-height: 1.75;
}}

ul, ol {{
  margin-left: 20px;
  margin-bottom: 16px;
  color: var(--text-sub);
  font-size: 14.5px;
}}
li {{ margin-bottom: 6px; }}

blockquote {{
  background: var(--bg-card-sub);
  border-left: 4px solid var(--accent-gold);
  border-radius: 8px;
  padding: 16px 20px;
  margin: 20px 0;
  font-style: italic;
  font-size: 14.5px;
  color: var(--text-sub);
}}

/* Card Grids */
.card-grid {{
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin: 18px 0;
}}
.sub-card {{
  background: var(--bg-card-sub);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 18px;
}}
.sub-card h4 {{
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 8px;
}}
.sub-card p {{
  font-size: 13.5px;
  margin-bottom: 0;
}}

/* Callouts */
.callout {{
  border-radius: 10px;
  padding: 18px 20px;
  margin: 20px 0;
  border-left: 4px solid;
  font-size: 14px;
}}
.callout.info {{
  background: rgba(56, 189, 248, 0.08);
  border-left-color: var(--accent-blue);
}}
.callout.warning, .caution-box {{
  background: rgba(239, 68, 68, 0.08);
  border-left-color: var(--accent-red);
}}
.callout.success {{
  background: rgba(16, 185, 129, 0.08);
  border-left-color: var(--accent-green);
}}
.callout.important {{
  background: rgba(168, 85, 247, 0.08);
  border-left-color: var(--accent-purple);
}}
.callout.note {{
  background: rgba(6, 182, 212, 0.08);
  border-left-color: var(--accent-cyan);
}}
.callout.tip, .callout.gold {{
  background: rgba(245, 158, 11, 0.08);
  border-left-color: var(--accent-gold);
}}

.callout-title {{
  font-weight: 700;
  font-size: 14.5px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}}
.callout.info .callout-title {{ color: var(--accent-blue); }}
.callout.warning .callout-title, .caution-box .callout-title {{ color: var(--accent-red); }}
.callout.success .callout-title {{ color: var(--accent-green); }}
.callout.important .callout-title {{ color: var(--accent-purple); }}
.callout.note .callout-title {{ color: var(--accent-cyan); }}
.callout.tip .callout-title, .callout.gold .callout-title {{ color: var(--accent-gold); }}

/* Tables */
.table-container, .table-wrapper {{
  overflow-x: auto;
  margin: 22px 0;
  border: 1px solid var(--border-color);
  border-radius: 10px;
}}
table {{
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
  text-align: left;
}}
thead {{
  background: var(--bg-card-sub);
}}
th, td {{
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  line-height: 1.5;
}}
th {{
  font-weight: 700;
  color: var(--text-main);
  white-space: nowrap;
}}
tr:last-child td {{
  border-bottom: none;
}}
tbody tr:hover {{
  background: rgba(255, 255, 255, 0.02);
}}

/* Step Flow */
.step-flow {{
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 18px 0;
}}
.step-item {{
  background: var(--bg-card-sub);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 14px 18px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
}}
.step-badge {{
  background: var(--accent-blue);
  color: #0b1120;
  font-weight: 800;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  white-space: nowrap;
}}
.step-desc {{
  font-size: 14px;
  color: var(--text-sub);
}}

/* Figures & Images */
.figure-container {{
  margin: 24px 0;
  padding: 16px;
  background: var(--bg-card-sub);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  text-align: center;
}}
.figure-container img, img {{
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
  display: block;
  margin: 0 auto;
}}
.figure-caption {{
  margin-top: 12px;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-main);
}}
.figure-subcaption {{
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}}

/* Mermaid Blocks */
.mermaid-box {{
  background: var(--bg-card-sub);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
  overflow-x: auto;
}}
pre.mermaid, div.mermaid {{
  background: transparent !important;
  display: flex;
  justify-content: center;
}}

/* Prompt Cards */
.prompt-grid {{
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 18px;
  margin-top: 18px;
}}
.prompt-card {{
  background: var(--bg-card-sub);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  transition: all 0.2s ease;
}}
.prompt-card:hover {{
  border-color: var(--accent-gold);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}}
.prompt-tag {{
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(245, 158, 11, 0.2);
  color: var(--accent-gold);
  width: fit-content;
}}
.prompt-title {{
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
}}
.prompt-snippet {{
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  background: var(--bg-main);
  padding: 10px;
  border-radius: 6px;
  color: var(--text-sub);
  max-height: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre-wrap;
  border: 1px dashed var(--border-color);
}}
.prompt-actions {{
  display: flex;
  gap: 8px;
}}
.prompt-btn {{
  flex: 1;
  padding: 7px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border-color);
  background: var(--bg-input);
  color: var(--text-main);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
}}
.prompt-btn:hover {{
  background: var(--border-color);
  color: var(--accent-gold);
}}
.prompt-btn.send-to-ai {{
  background: rgba(56, 189, 248, 0.15);
  border-color: var(--accent-blue);
  color: var(--accent-blue);
}}
.prompt-btn.send-to-ai:hover {{
  background: var(--accent-blue);
  color: #0b1120;
}}

/* Collapsible Review Details */
details.review-item {{
  background: var(--bg-card-sub);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}}
details.review-item summary {{
  padding: 14px 18px;
  font-weight: 700;
  font-size: 14.5px;
  cursor: pointer;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 8px;
  outline: none;
}}
details.review-item summary:hover {{
  background: rgba(255, 255, 255, 0.02);
  color: var(--accent-blue);
}}
.review-answer {{
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-main);
  font-size: 14px;
  color: var(--text-sub);
}}

/* Quotes & Epigraphs */
.hero-quote-box, .epigraph-box {{
  background: var(--bg-card-sub);
  border-left: 4px solid var(--accent-gold);
  border-radius: 8px;
  padding: 16px 20px;
  margin: 20px 0;
}}
.hero-quote-text {{
  font-style: italic;
  font-size: 14.5px;
  color: var(--text-sub);
  line-height: 1.6;
}}
.hero-quote-author, .epigraph-author {{
  display: block;
  font-style: normal;
  font-weight: 700;
  color: var(--accent-gold);
  margin-top: 8px;
  font-size: 13px;
}}

/* Right AI Panel */
.right-ai-panel {{
  width: var(--ai-panel-w);
  min-width: var(--ai-panel-w);
  background: var(--bg-card);
  border-left: 1px solid var(--border-color);
  height: calc(100vh - var(--header-h));
  position: sticky;
  top: var(--header-h);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, width 0.3s ease;
}}
.right-ai-panel.collapsed {{
  display: none;
}}

.ai-panel-header {{
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}}
.ai-panel-header h3 {{
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}}
.ai-status-tag {{
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(16, 185, 129, 0.15);
  color: var(--accent-green);
}}

.ai-controls-bar {{
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--bg-card-sub);
}}
.ai-select-row {{
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-muted);
}}
.ai-select {{
  background: var(--bg-input);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 12px;
  outline: none;
}}

.ai-quick-questions {{
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 125px;
  overflow-y: auto;
  background: var(--bg-card);
}}
.quick-chip {{
  background: var(--bg-card-sub);
  color: var(--text-sub);
  border: 1px solid var(--border-color);
  padding: 4px 9px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}}
.quick-chip:hover {{
  border-color: var(--accent-blue);
  color: var(--accent-blue);
  background: rgba(56, 189, 248, 0.1);
}}

.ai-chat-messages {{
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}}

.ai-msg {{
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 90%;
  font-size: 13.5px;
  line-height: 1.6;
}}
.ai-msg.user {{
  align-self: flex-end;
  background: var(--accent-blue);
  color: #0b1120;
  padding: 10px 14px;
  border-radius: 14px 14px 2px 14px;
  font-weight: 500;
}}
.ai-msg.bot {{
  align-self: flex-start;
  background: var(--bg-card-sub);
  color: var(--text-main);
  padding: 12px 16px;
  border-radius: 14px 14px 14px 2px;
  border: 1px solid var(--border-color);
  white-space: pre-wrap;
}}
.ai-msg-sender {{
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 2px;
}}

.ai-input-box {{
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-card);
  display: flex;
  gap: 8px;
}}
.ai-textarea {{
  flex: 1;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 12px;
  color: var(--text-main);
  font-size: 13px;
  resize: none;
  height: 42px;
  font-family: inherit;
}}
.ai-textarea:focus {{
  outline: none;
  border-color: var(--accent-blue);
}}
.ai-send-btn {{
  background: var(--accent-blue);
  color: #0b1120;
  border: none;
  border-radius: 8px;
  padding: 0 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease;
}}
.ai-send-btn:hover {{
  background: #0284c7;
  color: #fff;
}}

/* Modals */
.modal-overlay {{
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}}
.modal-overlay.active {{ display: flex; }}
.modal-card {{
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 24px;
  width: 90%;
  max-width: 480px;
  box-shadow: var(--shadow);
}}
.modal-header {{
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}}
.modal-title {{
  font-size: 16px;
  font-weight: 700;
}}
.modal-body p {{
  font-size: 13px;
  margin-bottom: 12px;
}}
.modal-input {{
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  font-size: 13px;
  margin-bottom: 12px;
}}
.modal-footer {{
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}}
.modal-btn {{
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border-color);
  background: var(--bg-card-sub);
  color: var(--text-main);
}}
.modal-btn.primary {{
  background: var(--accent-blue);
  color: #0b1120;
  border-color: var(--accent-blue);
}}

/* Toast */
.toast-container {{
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 4000;
  display: flex;
  flex-direction: column;
  gap: 8px;
}}
.toast-msg {{
  background: var(--bg-card);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  box-shadow: var(--shadow);
  border-left: 4px solid var(--accent-blue);
  animation: slideIn 0.3s ease;
}}
@keyframes slideIn {{
  from {{ transform: translateY(20px); opacity: 0; }}
  to {{ transform: translateY(0); opacity: 1; }}
}}

/* Responsive */
@media (max-width: 1280px) {{
  :root {{
    --sidebar-w: 290px;
    --ai-panel-w: 340px;
  }}
}}
@media (max-width: 1080px) {{
  .right-ai-panel {{
    display: none;
    position: fixed;
    right: 0;
    top: var(--header-h);
    height: calc(100vh - var(--header-h));
    z-index: 1500;
    box-shadow: var(--shadow);
  }}
  .right-ai-panel.mobile-active {{
    display: flex;
  }}
  .parts-grid {{
    grid-template-columns: 1fr;
  }}
}}
@media (max-width: 800px) {{
  .left-sidebar {{
    display: none;
    position: fixed;
    left: 0;
    top: var(--header-h);
    z-index: 1500;
    box-shadow: var(--shadow);
  }}
  .left-sidebar.mobile-active {{
    display: flex;
  }}
  .main-content {{
    padding: 20px 16px;
  }}
  .header-center {{
    display: none;
  }}
}}

/* Print Styles */
@media print {{
  header.app-header, .left-sidebar, .right-ai-panel, #reading-progress-bar, .chapter-footer-nav, .quick-chapter-pills-row {{
    display: none !important;
  }}
  .app-wrapper {{
    display: block !important;
  }}
  .main-content {{
    max-width: 100% !important;
    padding: 0 !important;
  }}
  .chapter-container {{
    page-break-before: always;
  }}
  section.section-box {{
    box-shadow: none !important;
    border: 1px solid #ccc !important;
    page-break-inside: avoid;
  }}
}}
    </style>
</head>
<body id="top">

  <!-- Progress Bar -->
  <div id="reading-progress-bar"></div>

  <!-- Header -->
  <header class="app-header">
    <div class="brand-area">
      <div class="brand-badge">Ch.01 ~ 10 Complete</div>
      <div class="brand-title">
        안전문화 총괄 서브노트 <span class="sub">Safety Culture Academic Suite</span>
      </div>
    </div>

    <div class="header-center">
      <select class="quick-chapter-select" id="quick-chapter-select">
        <option value="">⚡ 챕터 빠른 이동 (Ch.01 ~ 10)...</option>
        <option value="#chapter-1">Ch.01 안전 지각의 정의</option>
        <option value="#chapter-2">Ch.02 조직문화 분석</option>
        <option value="#chapter-3">Ch.03 사회 연결망과 밈</option>
        <option value="#chapter-4">Ch.04 안전문화 방향 설정</option>
        <option value="#chapter-5">Ch.05 기본 SMS 개요</option>
        <option value="#chapter-6">Ch.06 안전 프로세스 구축</option>
        <option value="#chapter-7">Ch.07 리더십과 문화 평가</option>
        <option value="#chapter-8">Ch.08 SMS 직원 참여 유도</option>
        <option value="#chapter-9">Ch.09 위험 지각의 정의</option>
        <option value="#chapter-10">Ch.10 기본 위험관리 원칙</option>
      </select>
    </div>

    <div class="header-actions">
      <button class="action-btn" id="theme-toggle-btn" title="다크/라이트 테마 전환">🌓 테마</button>
      <button class="action-btn" id="print-btn" title="인쇄 및 PDF 저장">🖨️ 인쇄/PDF</button>
      <button class="action-btn" id="api-key-btn" title="Gemini/OpenAI API 설정">🔑 API 설정</button>
      <button class="action-btn primary" id="toggle-ai-btn" title="AI 학습 튜터 열기/닫기">💬 AI 튜터</button>
    </div>
  </header>

  <!-- App Wrapper -->
  <div class="app-wrapper">
    <!-- Left Sidebar Navigation -->
    <aside class="left-sidebar" id="left-sidebar">
      <div class="sidebar-header-box">
        <div class="sidebar-title">
          <span>📚 전체 목차</span>
          <span class="sidebar-badge">10개 챕터 · 198개 절</span>
        </div>
        <div class="sidebar-tools-row">
          <button type="button" class="sidebar-tool-btn" id="btn-expand-all">전체 펼치기</button>
          <button type="button" class="sidebar-tool-btn" id="btn-collapse-all">전체 접기</button>
        </div>
        <input type="text" class="nav-search" id="nav-search-input" placeholder="전체 198개 소절 검색...">
      </div>

      <div class="nav-chapters-tree" id="nav-chapters-tree">
        {sidebar_all_html}
      </div>
    </aside>

    <!-- Center Main Content -->
    <main class="main-content" id="main-content">
      {overview_banner_html}
      {all_chapters_html}
    </main>

    <!-- Right AI Panel -->
    <aside class="right-ai-panel" id="right-ai-panel">
      <div class="ai-panel-header">
        <h3>🤖 안전문화 AI 튜터</h3>
        <span class="ai-status-tag" id="ai-status-tag">내장 지식엔진</span>
      </div>

      <div class="ai-controls-bar">
        <div class="ai-select-row">
          <span>학습 챕터:</span>
          <select class="ai-select" id="ai-chapter-select">
            <option value="all">전체 챕터 (All Chapters)</option>
            <option value="1">Chapter 01: 안전 지각의 정의</option>
            <option value="2">Chapter 02: 조직문화 분석</option>
            <option value="3">Chapter 03: 사회 연결망과 밈</option>
            <option value="4">Chapter 04: 안전문화 방향 설정</option>
            <option value="5">Chapter 05: 기본 SMS 개요</option>
            <option value="6">Chapter 06: 안전 프로세스 구축</option>
            <option value="7">Chapter 07: 리더십과 문화 평가</option>
            <option value="8">Chapter 08: SMS 직원 참여 유도</option>
            <option value="9">Chapter 09: 위험 지각의 정의</option>
            <option value="10">Chapter 10: 기본 위험관리 원칙</option>
          </select>
        </div>

        <div class="ai-select-row">
          <span>AI 엔진:</span>
          <select class="ai-select" id="ai-engine-select">
            <option value="builtin">내장 지식 엔진 (Built-in)</option>
            <option value="gemini">Google Gemini API</option>
            <option value="openai">OpenAI API</option>
          </select>
        </div>
      </div>

      <!-- Quick Question Chips -->
      <div class="ai-quick-questions" id="ai-quick-questions">
        <!-- Injected via JavaScript based on selected chapter -->
      </div>

      <!-- Chat Messages Area -->
      <div class="ai-chat-messages" id="ai-chat-messages">
        <div class="ai-msg bot">
          <span class="ai-msg-sender">AI 학습 튜터</span>
          안녕하세요! 안전문화(Safety Culture) 제1장~제10장 통합 학습 튜터입니다. 💡

198개 소절에 걸친 학술 이론(샤인의 3계층, 발현적 속성, 사회연결망, SMS 6대 요소, RAA 매트릭스, 4T 위험관리 등)에 대해 궁금한 점을 질문해 주세요.
위 칩 버튼을 클릭하거나, 본문의 [AI에게 전송] 버튼을 눌러 심화 연구 토론을 시작할 수 있습니다.
        </div>
      </div>

      <!-- Chat Input Box -->
      <div class="ai-input-box">
        <textarea class="ai-textarea" id="ai-user-input" placeholder="학술 질문이나 개념을 입력하세요... (Shift+Enter 줄바꿈)"></textarea>
        <button class="ai-send-btn" id="ai-send-btn">전송</button>
      </div>
    </aside>
  </div>

  <!-- API Key Modal -->
  <div class="modal-overlay" id="api-modal-overlay">
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">🔑 AI API 설정</h3>
        <button type="button" class="modal-btn" id="modal-close-btn">✕</button>
      </div>
      <div class="modal-body">
        <p>Google Gemini 또는 OpenAI API Key를 등록하면 실시간 초거대 AI 모델과 심층 토론이 가능합니다. 키는 브라우저 로컬 저장소(localStorage)에만 안전하게 보관됩니다.</p>
        <label style="font-size:12px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:4px;">Google Gemini API Key</label>
        <input type="password" class="modal-input" id="gemini-key-input" placeholder="AIzaSy...">

        <label style="font-size:12px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:4px;">OpenAI API Key</label>
        <input type="password" class="modal-input" id="openai-key-input" placeholder="sk-...">
      </div>
      <div class="modal-footer">
        <button type="button" class="modal-btn" id="modal-cancel-btn">취소</button>
        <button type="button" class="modal-btn primary" id="modal-save-btn">저장하기</button>
      </div>
    </div>
  </div>

  <!-- Toast Container -->
  <div class="toast-container" id="toast-container"></div>

  <!-- Client-side Scripts -->
  <script>
    // Embedded Data
    const GLOBAL_KB = {global_kb_json};
    const QUICK_CHIPS = {quick_chips_json};
    const PROMPTS_DATA = {prompts_data_json};

    // DOM Elements
    const body = document.body;
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const printBtn = document.getElementById('print-btn');
    const apiKeyBtn = document.getElementById('api-key-btn');
    const toggleAiBtn = document.getElementById('toggle-ai-btn');
    const rightAiPanel = document.getElementById('right-ai-panel');
    const quickChapterSelect = document.getElementById('quick-chapter-select');
    const readingProgressBar = document.getElementById('reading-progress-bar');
    const navSearchInput = document.getElementById('nav-search-input');
    const btnExpandAll = document.getElementById('btn-expand-all');
    const btnCollapseAll = document.getElementById('btn-collapse-all');
    const aiChapterSelect = document.getElementById('ai-chapter-select');
    const aiEngineSelect = document.getElementById('ai-engine-select');
    const aiQuickQuestions = document.getElementById('ai-quick-questions');
    const aiChatMessages = document.getElementById('ai-chat-messages');
    const aiUserInput = document.getElementById('ai-user-input');
    const aiSendBtn = document.getElementById('ai-send-btn');
    const aiStatusTag = document.getElementById('ai-status-tag');
    const apiModalOverlay = document.getElementById('api-modal-overlay');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const modalSaveBtn = document.getElementById('modal-save-btn');
    const geminiKeyInput = document.getElementById('gemini-key-input');
    const openaiKeyInput = document.getElementById('openai-key-input');

    // Toast Function
    function showToast(message) {{
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = 'toast-msg';
      toast.innerText = message;
      container.appendChild(toast);
      setTimeout(() => {{
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s ease';
        setTimeout(() => toast.remove(), 400);
      }}, 3000);
    }}

    // Reading Progress & Scrollspy
    window.addEventListener('scroll', () => {{
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      readingProgressBar.style.width = scrolled + '%';
    }});

    // Theme Toggle
    themeToggleBtn.addEventListener('click', () => {{
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('sc_theme', newTheme);
      showToast(`테마가 ${{newTheme === 'dark' ? '다크 모드' : '라이트 모드'}}로 전환되었습니다.`);
    }});
    const savedTheme = localStorage.getItem('sc_theme');
    if (savedTheme) {{
      document.documentElement.setAttribute('data-theme', savedTheme);
    }}

    // Print Button
    printBtn.addEventListener('click', () => {{
      window.print();
    }});

    // Quick Chapter Jump Dropdown
    quickChapterSelect.addEventListener('change', (e) => {{
      const targetId = e.target.value;
      if (targetId) {{
        const el = document.querySelector(targetId);
        if (el) {{
          el.scrollIntoView({{ behavior: 'smooth' }});
        }}
      }}
    }});

    // Toggle AI Panel
    toggleAiBtn.addEventListener('click', () => {{
      rightAiPanel.classList.toggle('collapsed');
      rightAiPanel.classList.toggle('mobile-active');
    }});

    // API Modal
    apiKeyBtn.addEventListener('click', () => {{
      geminiKeyInput.value = localStorage.getItem('gemini_api_key') || '';
      openaiKeyInput.value = localStorage.getItem('openai_api_key') || '';
      apiModalOverlay.classList.add('active');
    }});
    const closeModal = () => apiModalOverlay.classList.remove('active');
    modalCloseBtn.addEventListener('click', closeModal);
    modalCancelBtn.addEventListener('click', closeModal);
    apiModalOverlay.addEventListener('click', (e) => {{
      if (e.target === apiModalOverlay) closeModal();
    }});
    modalSaveBtn.addEventListener('click', () => {{
      localStorage.setItem('gemini_api_key', geminiKeyInput.value.trim());
      localStorage.setItem('openai_api_key', openaiKeyInput.value.trim());
      closeModal();
      showToast('API 키가 성공적으로 저장되었습니다! 🔑');
      updateAiStatus();
    }});

    function updateAiStatus() {{
      const engine = aiEngineSelect.value;
      if (engine === 'gemini') {{
        const hasKey = !!localStorage.getItem('gemini_api_key');
        aiStatusTag.innerText = hasKey ? 'Gemini API 연동됨' : 'Gemini 키 필요';
        aiStatusTag.style.color = hasKey ? 'var(--accent-green)' : 'var(--accent-red)';
      }} else if (engine === 'openai') {{
        const hasKey = !!localStorage.getItem('openai_api_key');
        aiStatusTag.innerText = hasKey ? 'OpenAI API 연동됨' : 'OpenAI 키 필요';
        aiStatusTag.style.color = hasKey ? 'var(--accent-green)' : 'var(--accent-red)';
      }} else {{
        aiStatusTag.innerText = '내장 지식엔진';
        aiStatusTag.style.color = 'var(--accent-blue)';
      }}
    }}
    aiEngineSelect.addEventListener('change', updateAiStatus);

    // Sidebar Accordion Logic
    document.querySelectorAll('.nav-chapter-header').forEach(header => {{
      header.addEventListener('click', () => {{
        const group = header.closest('.nav-chapter-group');
        const sections = group.querySelector('.nav-chapter-sections');
        const isExpanded = header.getAttribute('aria-expanded') === 'true';

        header.setAttribute('aria-expanded', !isExpanded);
        group.classList.toggle('expanded', !isExpanded);
        sections.style.display = isExpanded ? 'none' : 'block';
      }});
    }});

    btnExpandAll.addEventListener('click', () => {{
      document.querySelectorAll('.nav-chapter-group').forEach(group => {{
        group.classList.add('expanded');
        group.querySelector('.nav-chapter-header').setAttribute('aria-expanded', 'true');
        group.querySelector('.nav-chapter-sections').style.display = 'block';
      }});
    }});

    btnCollapseAll.addEventListener('click', () => {{
      document.querySelectorAll('.nav-chapter-group').forEach(group => {{
        group.classList.remove('expanded');
        group.querySelector('.nav-chapter-header').setAttribute('aria-expanded', 'false');
        group.querySelector('.nav-chapter-sections').style.display = 'none';
      }});
    }});

    // Search filter across all 198 sections
    navSearchInput.addEventListener('input', (e) => {{
      const query = e.target.value.toLowerCase().trim();
      document.querySelectorAll('.nav-chapter-group').forEach(group => {{
        let hasMatch = false;
        const links = group.querySelectorAll('.nav-link');
        links.forEach(link => {{
          const text = link.innerText.toLowerCase();
          if (!query || text.includes(query)) {{
            link.style.display = 'block';
            hasMatch = true;
          }} else {{
            link.style.display = 'none';
          }}
        }});

        if (query) {{
          if (hasMatch) {{
            group.style.display = 'block';
            group.classList.add('expanded');
            group.querySelector('.nav-chapter-header').setAttribute('aria-expanded', 'true');
            group.querySelector('.nav-chapter-sections').style.display = 'block';
          }} else {{
            group.style.display = 'none';
          }}
        }} else {{
          group.style.display = 'block';
        }}
      }});
    }});

    // Prompt Buttons Handlers
    document.addEventListener('click', (e) => {{
      // Copy Prompt
      const copyBtn = e.target.closest('.copy-prompt-btn');
      if (copyBtn) {{
        const pid = copyBtn.getAttribute('data-prompt-id');
        const text = PROMPTS_DATA[pid];
        if (text) {{
          navigator.clipboard.writeText(text).then(() => {{
            showToast('프롬프트가 클립보드에 복사되었습니다! 📋');
          }}).catch(err => {{
            showToast('복사에 실패했습니다. 수동으로 복사해주세요.');
          }});
        }}
        return;
      }}

      // Send Prompt to AI
      const sendBtn = e.target.closest('.send-prompt-btn');
      if (sendBtn) {{
        const pid = sendBtn.getAttribute('data-prompt-id');
        const text = PROMPTS_DATA[pid];
        if (text) {{
          aiUserInput.value = text;
          if (rightAiPanel.classList.contains('collapsed')) {{
            rightAiPanel.classList.remove('collapsed');
          }}
          rightAiPanel.classList.add('mobile-active');
          aiUserInput.focus();
          showToast('프롬프트가 AI 튜터 입력창에 입력되었습니다! 💬');
        }}
        return;
      }}
    }});

    // Quick Chips rendering
    function renderQuickChips(chapterKey) {{
      aiQuickQuestions.innerHTML = '';
      const chips = QUICK_CHIPS[chapterKey] || QUICK_CHIPS['all'];
      chips.forEach(item => {{
        const chip = document.createElement('div');
        chip.className = 'quick-chip';
        chip.innerText = item.text;
        chip.setAttribute('data-q', item.q);
        chip.addEventListener('click', () => {{
          aiUserInput.value = item.q;
          handleSendMessage();
        }});
        aiQuickQuestions.appendChild(chip);
      }});
    }}
    renderQuickChips('all');

    aiChapterSelect.addEventListener('change', (e) => {{
      const val = e.target.value;
      const key = val === 'all' ? 'all' : parseInt(val, 10);
      renderQuickChips(key);
      showToast(`AI 튜터 학습 범위: ${{val === 'all' ? '전체 챕터' : `Chapter ${{val}}`}} 설정`);
    }});

    // AI Chat Messages Handling
    function appendMessage(sender, text, isUser = false) {{
      const msgDiv = document.createElement('div');
      msgDiv.className = `ai-msg ${{isUser ? 'user' : 'bot'}}`;
      if (!isUser) {{
        const senderSpan = document.createElement('span');
        senderSpan.className = 'ai-msg-sender';
        senderSpan.innerText = sender;
        msgDiv.appendChild(senderSpan);
      }}
      const textNode = document.createElement('div');
      textNode.innerText = text;
      msgDiv.appendChild(textNode);
      aiChatMessages.appendChild(msgDiv);
      aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    }}

    async function handleSendMessage() {{
      const text = aiUserInput.value.trim();
      if (!text) return;
      aiUserInput.value = '';
      appendMessage('나', text, true);

      const engine = aiEngineSelect.value;
      const chVal = aiChapterSelect.value;

      if (engine === 'builtin') {{
        // Built-in Knowledge Search
        setTimeout(() => {{
          let reply = null;
          const query = text.toLowerCase();

          // Search in current chapter or all chapters
          const chaptersToSearch = (chVal === 'all') 
            ? Object.keys(GLOBAL_KB) 
            : [parseInt(chVal, 10)];

          for (const ch of chaptersToSearch) {{
            const kb = GLOBAL_KB[ch];
            if (!kb) continue;
            for (const [k, ans] of Object.entries(kb)) {{
              const kClean = k.toLowerCase().replace(/_/g, ' ');
              const ansClean = ans.toLowerCase();
              if (query.includes(kClean) || ansClean.includes(query) || (kClean.length > 3 && query.includes(kClean.substring(0, 4)))) {{
                reply = `[Chapter ${{ch}} 핵심 지식 연계 답변]\n\n${{ans}}`;
                break;
              }}
            }}
            if (reply) break;
          }}

          if (!reply) {{
            // General safety response
            reply = `[내장 지식엔진 탐색 결과]\n입력하신 "${{text}}"에 대한 직접적인 키워드 매칭 항목을 찾지 못했습니다.\n\n💡 추천 키워드:\n• Ch.1: 발현적 속성, 몬탄테, 래드포드, 2분면\n• Ch.2: 샤인의 3계층, 하위문화, 체르노빌\n• Ch.3: 비공식 연결망, 안전 밈, 브로커리지\n• Ch.4: 비전, 미션, SMART 목표, 롤아웃\n• Ch.5: SMS 6대 요소, PDCA, 쐐기돌 리더십\n• Ch.6: 안전 프로세스, 형식주의, 피드백 루프\n• Ch.7: 리더십-문화 동전 양면성, RAA 매트릭스, JHA 4단계\n• Ch.8: 직원 참여, 80/20 경청, 침묵 극복, 심리적 안전감\n• Ch.9: 위험 지각, 비판적 질문 태도, 3대 참사, 황금률\n• Ch.10: 백미러 비유, No Loss 신화, 4T 전략, 위험관리 8단계\n\n더 정밀하고 복합적인 추론이 필요하시면 상단 🔑 설정에서 Gemini/OpenAI API 키를 등록 후 사용해 보세요!`;
          }}
          appendMessage('안전문화 내장 AI', reply, false);
        }}, 350);
      }} else if (engine === 'gemini') {{
        const apiKey = localStorage.getItem('gemini_api_key');
        if (!apiKey) {{
          appendMessage('시스템', 'Google Gemini API Key가 설정되지 않았습니다. 상단 [🔑 API 설정] 버튼을 눌러 등록해주세요.', false);
          return;
        }}
        appendMessage('Google Gemini', '생각하는 중... 💭', false);
        const loadingMsg = aiChatMessages.lastChild;

        try {{
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${{apiKey}}`, {{
            method: 'POST',
            headers: {{ 'Content-Type': 'application/json' }},
            body: JSON.stringify({{
              contents: [{{
                parts: [{{
                  text: `당신은 안전문화(Safety Culture: An Innovative Leadership Approach, Roughton et al., 2019) 전공 박사급 튜터입니다. 질문에 대해 원서의 이론(샤인, 데밍, RAA, 4T 등)에 기반하여 학술적이면서도 명쾌하게 한국어로 설명해주세요.\n\n질문: ${{text}}`
                }}]
              }}]
            }})
          }});
          const data = await response.json();
          const ans = data?.candidates?.[0]?.content?.parts?.[0]?.text || '응답을 생성하지 못했습니다.';
          loadingMsg.remove();
          appendMessage('Google Gemini', ans, false);
        }} catch (err) {{
          loadingMsg.remove();
          appendMessage('오류', `API 호출 중 문제가 발생했습니다: ${{err.message}}`, false);
        }}
      }} else if (engine === 'openai') {{
        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {{
          appendMessage('시스템', 'OpenAI API Key가 설정되지 않았습니다. 상단 [🔑 API 설정] 버튼을 눌러 등록해주세요.', false);
          return;
        }}
        appendMessage('OpenAI GPT', '생각하는 중... 💭', false);
        const loadingMsg = aiChatMessages.lastChild;

        try {{
          const response = await fetch('https://api.openai.com/v1/chat/completions', {{
            method: 'POST',
            headers: {{
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${{apiKey}}`
            }},
            body: JSON.stringify({{
              model: 'gpt-4o-mini',
              messages: [
                {{
                  role: 'system',
                  content: '당신은 안전문화(Safety Culture, Roughton et al., 2019) 전문 박사급 학술 튜터입니다. 원문의 핵심 이론과 개념에 기반하여 명쾌하게 한국어로 답변하세요.'
                }},
                {{
                  role: 'user',
                  content: text
                }}
              ]
            }})
          }});
          const data = await response.json();
          const ans = data?.choices?.[0]?.message?.content || '응답을 생성하지 못했습니다.';
          loadingMsg.remove();
          appendMessage('OpenAI GPT', ans, false);
        }} catch (err) {{
          loadingMsg.remove();
          appendMessage('오류', `API 호출 중 문제가 발생했습니다: ${{err.message}}`, false);
        }}
      }}
    }}

    aiSendBtn.addEventListener('click', handleSendMessage);
    aiUserInput.addEventListener('keydown', (e) => {{
      if (e.key === 'Enter' && !e.shiftKey) {{
        e.preventDefault();
        handleSendMessage();
      }}
    }});

    // IntersectionObserver to highlight active sidebar link
    const observerOptions = {{
      root: null,
      rootMargin: '-80px 0px -70% 0px',
      threshold: 0
    }};
    const observer = new IntersectionObserver((entries) => {{
      entries.forEach(entry => {{
        if (entry.isIntersecting) {{
          const id = entry.target.id;
          document.querySelectorAll('.nav-link').forEach(link => {{
            if (link.getAttribute('href') === '#' + id) {{
              link.classList.add('active');
              // Auto-open parent chapter accordion if closed
              const parentGroup = link.closest('.nav-chapter-group');
              if (parentGroup && !parentGroup.classList.contains('expanded')) {{
                parentGroup.classList.add('expanded');
                parentGroup.querySelector('.nav-chapter-header').setAttribute('aria-expanded', 'true');
                parentGroup.querySelector('.nav-chapter-sections').style.display = 'block';
              }}
            }} else {{
              link.classList.remove('active');
            }}
          }});
        }}
      }});
    }}, observerOptions);

    document.querySelectorAll('section.section-box, article.chapter-container').forEach(el => {{
      observer.observe(el);
    }});
  </script>
</body>
</html>
'''

    # Save to integrated_subnote.html and total_subnote.html
    out1 = "subnote/integrated_subnote.html"
    out2 = "subnote/total_subnote.html"

    with open(out1, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"Generated {out1} ({os.path.getsize(out1)} bytes)")

    with open(out2, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"Generated {out2} ({os.path.getsize(out2)} bytes)")

if __name__ == "__main__":
    print("Starting full integrated subnote build...")
    build_unified_html()
    print("Done!")
