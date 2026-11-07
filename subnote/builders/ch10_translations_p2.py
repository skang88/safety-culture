"""Chapter 10 Translations Part 2 (Blocks B11 to B21)"""

translations = {
    "B11": """![Table 10.1](image-101.png)
**표 10.1 위험성평가의 8단계 프로세스 (TABLE 10.1 Eight Steps to Risk Assessment)**

| 단계 (Step) | 실행 조치 (Action) | 상세 설명 (Description) |
| :---: | :--- | :--- |
| **1단계** | **위험성평가의 목표 정의 (Define the objective)** | 위험성평가의 총체적 목표는 위험의 우선순위를 정하고 그것이 조직에 미치는 잠재적 영향을 규명하는 것이다. |
| **2단계** | **검토 대상 조직 또는 시스템 정의 및 기술 (Define and describe the system)** | 유해·위험요인과 관련 위험을 창출하는 상호작용 방식(인간, 공구/장비/자재, 작업 환경, 방침/절차/관리적 요소)을 면밀히 설명하는 심층 검토를 수행한다. |
| **3단계** | **조직/시스템 내 유해·위험요인 식별 (Identify hazards)** | 모든 유해·위험요인을 찾아내고 분석한다. 포괄적인 시스템 검토를 통해 "우리가 무엇을 하며 어떻게 일하는가"를 낱낱이 파악한다. |
| **4단계** | **유해·위험요인과 결합된 위험의 측정 및 분석 (Assess and analyze the risk)** | 정량적 및 정성적 지표를 모두 활용하여 특정 위험의 범위를 기술한다. 손실 유발 사건의 발생 확률과 잠재적 결과 심각성에 대한 추정치를 도출한다. |
| **5단계** | **잠재적 영향도에 따른 위험의 우선순위 결정 (Prioritize hazards and risks)** | 모든 위험의 영향을 종합하고 무엇이 허용 가능한 기준인지 정의된 척도와 비교하여 우선순위를 확립한다. |
| **6단계** | **위험관리를 위한 실행 계획 수립 (Develop action plans)** | 우선순위가 결정된 후, 최우선 순위 또는 가장 심각한 위험부터 시작하여 각 위험별 저감 실행 계획을 수립한다. |
| **7단계** | **관리 방법의 실행 및 잔여 위험 평가 (Evaluate implementation and residual risk)** | 위험을 관리하기 위해 적용된 통제 방법의 효과성을 평가하고, 남아 있는 **잔여 위험(Residual Risk)**을 측정한다. (그림 10.1 참조). |
| **8단계** | **필요에 따라 조직/시스템 프로세스 수정 및 지속적 갱신 (Modify processes as applicable)** | 위험관리 프로세스는 조직, 시스템, 임무 또는 활동의 전체 생애주기(Life Cycle)에 걸쳐 영구히 지속되고 갱신된다. |

(출처: Principles of System Safety, 2000; Acquisition Risk Management, 2017)""",

    "B12": """![Fig 10.1](image-102.png)
**그림 10.1 위험의 유형—총 위험 vs 잔여 위험 (Total Risk vs. Residual Risk).**
초기 상태의 '총 위험(Total Risk)'에 공학적·관리적 통제 조치를 적용한 후에도 여전히 남아 있는 위험을 '잔여 위험(Residual Risk)'이라 부른다. 안전관리의 목표는 이 잔여 위험을 합리적으로 실행 가능한 최저 수준(ALARP)까지 낮추는 것이다.""",

    "B13": """![Fig 10.2](image-103.png)
**그림 10.2 성공적인 위험성평가를 완수하기 위한 8단계 순환 흐름도 (Eight Steps Flowchart).**
목표 정의에서 출발하여 시스템 분석, 위험 식별 및 분석, 우선순위화, 실행 계획 수립, 잔여 위험 평가, 그리고 시스템 갱신으로 이어지는 닫힌 루프(Closed-loop) 개선 사이클을 보여준다.""",

    "B14": """## 허용 가능한 위험과 ALARP 원칙 (ACCEPTABLE RISK)

위험은 눈에 보이게 만져지는 물리적 형태는 아닐지라도, 조직이 수행하는 모든 활동, 과업 및 기능 속에 언제나 엄연히 존재한다. 단순히 계단을 내려가는 것부터, 무거운 물건을 들어 올리는 것, 차량에 휘발유를 주유하는 것에 이르기까지 모든 곳에 위험이 도사리고 있다.
또한 암벽 등반이나 스노보드처럼 인간이 자발적으로 위험을 감수하는 스포츠 활동도 존재한다.

그러나 직업적 작업 환경에서 위험의 감수는 결코 개인의 자발적 취향에 맡겨질 수 없다.
이때 적용되는 핵심 기준이 바로 **"합리적으로 실행 가능한 한 낮게(ALARP, As Low As Reasonably Practicable)"** 원칙이다.
* **허용 불가능 영역 (Unacceptable Region):** 위험이 너무 높아 어떠한 비즈니스 이익이 있더라도 절대 용납될 수 없는 영역 (즉시 작업 중지 및 근본적 통제 필수).
* **ALARP / 토러러블 영역 (Tolerable Region):** 위험 저감에 소요되는 비용과 노력 대비 안전상의 이익을 비교 형량하여, 위험을 더 낮추는 데 드는 비용이 지나치게 불균형적으로 크지 않는 한 위험을 가능한 한 최저로 낮추어야 하는 영역.
* **광범위한 수용 가능 영역 (Broadly Acceptable Region):** 위험 수준이 매우 미미하여 추가적인 통제 없이도 일상적으로 수용 가능한 영역.""",

    "B15": """## 위험의 관리 (MANAGEMENT OF RISK)

안전 프로세스는 위험관리의 다양한 측면에 체계적인 조직적 접근법을 제공하며, 조직의 위험 특성과 유형에 대한 지식을 획기적으로 증진시킬 수 있다.
안전 프로세스는 또한 무엇이 '허용 가능한 위험'인지 조직이 결정하는 기준을 발전시킬 수 있는 훌륭한 기회를 제공한다.
예를 들어 경찰, 소방, 군사, 광산, 심해 잠수, 항공기 조종 등 특수 직업군은 본질적으로 극도의 고위험 환경에서 작동하지만, 위험을 철저히 통제된 수준으로 낮추기 위해 고도로 훈련된 세부 절차와 프로토콜 및 다중 방어 시스템을 구축하고 있다.
이처럼 위험관리의 목적은 모든 위험을 0으로 만드는 이상주의가 아니라, 위험을 체계적으로 통제하여 비즈니스의 사명과 인간의 안전을 동시에 달성하는 데 있다.""",

    "B16": """## "위험 스펙트럼" (THE “RISK SPECTRUM”)

거시적 관점의 위험 접근법은 위험의 본질과 유형에 대해 훨씬 더 깊은 통찰을 제공한다. 위험이 조직에 미치는 영향을 무 자르듯 가르는 단 하나의 경계선은 존재하지 않는다.
조직에 미치는 파급효과에 따라 위험은 연속적인 **"위험 스펙트럼(Risk Spectrum)"**으로 평가될 수 있다:

* **1수준: 조직 내부 운영 및 직원에게만 국한되는 위험 (Level 1, Risk impacting internal operations):** 공장 내부의 작업자 부상이나 특정 라인의 일시적 설비 고장 등.
* **2수준: 생산 및 서비스의 심각한 중단을 초래하는 위험 (Level 2, Bottlenecks stopping flow to customers):** 공급망 마비, 대형 화재로 인한 공장 전면 가동 중단 등.
* **3수준: 외부 제3자, 지역사회 및 환경에 파멸적 피해를 미치는 위험 (Level 3, Risk impacting third parties or environment):** 유해 화학물질 누출, 대형 환경 재난, 대규모 소비자 피해 등.
* **4수준: 기업의 생존 자체를 위협하는 전략적·법적 위험 (Level 4, Catastrophic strategic & survival risk):** 중대재해처벌법 형사 처벌, 영업정지, 브랜드 파멸 등.""",

    "B17": """![Fig 10.3](image-104.png)
**그림 10.3 간이 위험 맵 (Simplified Risk Map) 및 위험의 4대 사분면 (Four Quadrants of Risk).**
위험 맵은 고객에게 제품이나 서비스가 전달되는 흐름을 가로막는 '병목 지점(Bottlenecks)'이나 치명적 손실 사건이 발생하는 취약 지점을 명확히 식별한다.

전사적 리스크 관리(ERM)에서 위험은 다음 4대 사분면으로 분류된다:
1. **유해·위험요인 리스크 (Hazard Risk):** 화재, 폭발, 화학물질 누출, 직업병, 산업재해 등 순수 손실만을 초래하는 전통적 안전보건 위험.
2. **운영 리스크 (Operational Risk):** 생산 공정 결함, 공급망 마비, IT 시스템 장애, 인적 오류 등 일상 운영의 실패에서 기인하는 위험.
3. **재무 리스크 (Financial Risk):** 금리 변동, 환율 급변, 유동성 위기, 신용 위험 등 재무적 손실 위험.
4. **전략 리스크 (Strategic Risk):** 시장 경쟁 환경 변화, 신제품 실패, 규제 입법 변화, 기업 브랜드 및 평판 훼손 등 기업의 장기 생존과 관련된 거시적 위험.

안전 전문가와 리스크 관리자는 안전보건의 '유해·위험요인 리스크'가 어떻게 운영 리스크 및 전략 리스크로 전이되는지 그 상호 연결성을 입체적으로 통찰해야 한다.""",

    "B18": """![Fig 10.4](image-105.png)
**그림 10.4 위험관리 전략 및 평가 개요 예시 (Risk Management Strategy and Assessment).**

안전보건경영시스템은 반드시 조직의 전사적 리스크 관리(ERM) 프로그램에 긴밀히 통합되어야 한다. 포괄적인 안전경영시스템의 구축은 조직을 위험으로부터 더욱 강력하게 보호하기 위한 체계적인 위험 평가 및 분석 프로세스의 핵심 도관(Conduit) 역할을 수행한다.

제11장 "활동 기반 안전 시스템 개발"에서는 리스크 통제를 실무 활동 지표로 구체화하는 방안을 다룰 것이다.""",

    "B19": """## 요약 (SUMMARY)

위험관리와 위험성평가의 원칙은 안전보건경영시스템의 핵심 중추이다.
사후 손실 기반의 안전 프로세스에서 사전 위험 기반의 안전보건경영시스템으로 전환하려면 조직 내 위험에 대한 지각과 인식의 근본적인 전환이 요구된다.
1. 과거의 무사고가 미래의 안전을 보장하지 않는다. "손실이 없으면 위험도 없다"는 치명적 신화를 깨뜨려야 한다.
2. 유해·위험요인(Hazard)은 잠재적 피해의 원천이며, 위험(Risk)은 그 유해·위험요인이 실제 부정적 결과로 이어질 확률과 심각성의 결합이다.
3. 위험성평가의 8단계 프로세스를 통해 조직의 총 위험을 체계적으로 식별하고, 통제 조치를 적용한 후 남는 잔여 위험을 합리적으로 실행 가능한 최저 수준(ALARP)으로 관리해야 한다.
4. 안전보건 위험을 단순한 기술적 영역에 가두지 않고, 전사적 리스크 관리(ERM)의 4대 사분면(유해·위험, 운영, 재무, 전략)과 통합하여 경영진의 전략적 의사결정에 직결시켜야 한다.""",

    "B20": """## 장 복습 문제 (CHAPTER REVIEW QUESTIONS)

1. 위험(Risk)을 학술적으로 정의하고 ISO 31000과 ANSI Z10의 정의 차이를 설명하라.
2. 조직 내 다양한 부서(마케팅, 재무, 안전 등) 간에 '위험'에 대한 정의가 어떻게 다르며 왜 마찰이 발생하는지 설명하라.
3. 위험관리를 가로막는 주요 조직적 장애물(조직 정치, 자존심, 용어 혼용 등)을 열거하고 극복 방안을 논하라.
4. 위험성평가의 8단계 프로세스를 순서대로 설명하라.
5. '허용 가능한 위험(Acceptable Risk)'과 ALARP(합리적으로 실행 가능한 최저 수준) 원칙의 개념을 설명하라.
6. 총 위험(Total Risk)과 잔여 위험(Residual Risk)의 차이점을 설명하라.
7. 위험의 4대 사분면(Hazard, Operational, Financial, Strategic Risk)을 설명하고 안전 위험이 전략 리스크로 전이되는 사례를 제시하라.""",

    "B21": """## 참고문헌 (BIBLIOGRAPHY)

* A structured approach to Enterprise Risk Management (ERM) & the requirements of ISO 31000. (2010). AIRMIC.
* Accident. (2018). Merriam-Webster Dictionary.
* Acquisition Risk Management Probability Definitions. (2017). Department of Defense.
* ANSI/AIHA/ASSE Z10-2012. Occupational Health and Safety Management Systems.
* Bernstein, P. L. (1996). Against the Gods: The Remarkable Story of Risk. John Wiley & Sons.
* Buffett, W. (2018). Berkshire Hathaway Annual Report & Shareholder Letters.
* Ethan, D., & Little, R. (2011). Hazard Identification and Risk Assessment in the Workplace. Industrial Safety Journal.
* ISO 31000:2009 / 2018. Risk Management — Principles and Guidelines. International Organization for Standardization.
* Lowrance, W. W. (1976). Of Acceptable Risk: Science and the Determination of Safety. William Kaufmann, Inc.
* Principles of System Safety. (2000). System Safety Society.
* Quadrant of Risk: Hazard, Operational, Financial, and Strategic. (2017). Risk and Insurance Management Society (RIMS).
* Ropeik, D., & Gray, G. (2002). RISK: A Practical Guide for Deciding What's Really Safe and What's Really Dangerous in the World Around You. Houghton Mifflin."""
}
