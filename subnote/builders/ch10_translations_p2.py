# -*- coding: utf-8 -*-
"""
Chapter 10 Translations Part 2: B11 to B21 (100% Unabridged Full Verbatim Translation)
"""

translations = {
    "B11": """![Table 10.1](image-101.png)
**표 10.1 위험성 평가의 8단계 (Eight Steps to Risk Assessment)**

| 단계 | 실행 조치 | 상세 설명 |
| :---: | :--- | :--- |
| **1** | **위험성 평가의 목표 설정 (Define the objective of the risk assessment)** | 위험성 평가의 전반적인 궁극적 목표는 위험의 우선순위를 명확히 설정하고 그것이 조직에 미칠 수 있는 잠재적 영향을 규명하는 것이다. |
| **2** | **평가 대상 조직 또는 시스템의 정의 및 기술 (Define and describe the organization or system under review)** | 유해위험요인과 그에 연계된 위험을 유발하는 상호작용 메커니즘을 상세히 기술하기 위해 조직/시스템 구성 요소(인간, 도구/장비/자재, 환경, 그리고 방침/절차/관리체계)에 대한 심층적 분석을 수행한다. |
| **3** | **조직/시스템 내 유해위험요인의 식별 (Identify hazards in the organization/system)** | 유해위험요인을 정확하게 식별하고 분석한다. 조직과 시스템에 대한 포괄적이고 면밀한 검토를 통해 "우리는 무엇을 하며, 그것을 구체적으로 어떻게 수행하는가?"라는 질문에 답한다. |
| **4** | **유해위험요인과 관련된 위험의 평가 및 분석 (Assess and analyze the risk associated with the hazards)** | 특정 유해위험요인과 연계된 위험의 범위를 서술하기 위해 정량적 및 정성적 측정 지표를 모두 사용한다. 손실 유발 사건이 발생할 확률과 잠재적 심각성에 대한 면밀한 추정치를 도출한다. |
| **5** | **잠재적 영향도에 따른 유해위험요인 및 연계 위험의 우선순위 설정 (Prioritize hazards and associated risks by potential impact)** | 위험성 평가는 모든 유해위험요인과 위험의 영향을 종합하고, 무엇이 조직에서 수용 가능한 수준인지에 대해 정의된 명확한 기준과 비교 평가한다. |
| **6** | **위험 관리를 위한 실행 계획 수립 (Develop action plans for management of risk)** | 우선순위가 확립된 후, 가장 높은 우선순위나 가장 심각한 수준의 핵심 위험부터 시작하여 각 위험별 맞춤형 실행 계획을 정밀하게 검토하고 수립한다. |
| **7** | **관리 기법의 현장 실행 평가 및 잔여 위험 검토 (Evaluate implementation of management methods and any residual risk)** | 위험을 관리하기 위해 적용된 제반 기법들의 실질적 유효성을 평가한다. 총 위험(total risk) 대 잔여 위험(residual risk)의 유형에 대한 구체적 예시는 그림 10.1을 참조하라 (Principles of System Safety, 2000). |
| **8** | **해당되는 조직/시스템 프로세스의 지속적 수정 및 피드백 (Modify organization/system processes as applicable)** | 위험 관리 프로세스는 조직, 시스템, 임무 또는 작업 활동의 전체 생애주기(life cycle) 전반에 걸쳐 영구적으로 지속되어야 한다 (Acquisition Risk Management Probability Definitions, 2017). |""",

    "B12": """![Fig 10.1](image-102.png)
**그림 10.1 위험의 유형—총 위험(Total Risk) 대 잔여 위험(Residual Risk).**""",

    "B13": """![Fig 10.2](image-103.png)
**그림 10.2 성공적인 위험성 평가를 완수하기 위한 8단계 프로세스.**""",

    "B14": """## 허용 가능한 위험 (ACCEPTABLE RISK)
위험(Risk)은 눈에 보이게 만져지는 물리적 형태를 띠지 않을 수도 있지만, 조직이 착수하는 모든 행동, 모든 시도, 그리고 모든 기능 속에는 언제나 상존하고 있다. 단순히 계단을 걸어 내려가는 것, 바닥의 물건을 집어 올리는 것, 자동차에 휘발유를 주유하는 일상적 행위에 이르기까지 모든 곳에 위험은 항상 존재한다. 또한, 암벽 등반, 험준한 산악에서 즐기는 스노보드 활강, 포뮬러 원(F1) 레이싱과 같은 다양한 익스트림 스포츠는 자발적인 위험 감수(voluntary taking of risk)를 허용하도록 설계되어 있으며, 간혹 비극적인 참사가 일어날 수 있다는 사실이 널리 알려져 있음에도 불구하고 많은 이들이 이를 적극적으로 추구한다. 이러한 인간의 본성은 안전한 현장 운영 설계에 커다란 난제를 초래하는데, 근로자들이 일상생활에서 체득한 위험 수용의 성향과 관념을 일터 내부로 고스란히 가지고 들어오기 때문이다.

위험 관리의 의사결정을 위해 전 세계적으로 널리 활용되는 확립된 개념으로 "합리적으로 실행 가능한 한 낮게(ALARP, As Low As Reasonably Practicable)"라는 원칙이 있다. 검토 대상이 되는 작업 공정이나 설비의 위험이 평가되고 나면, 현장에 배치된 안전 통제 장치들이 과연 얼마나 유효한지에 대한 엄밀한 판단을 내려야만 한다. 허용 가능한 위험(Acceptable Risk)이란 "유해위험요인과 관련된 사건이나 노출이 발생할 확률과, 그로 인해 발생할 수 있는 피해나 손상의 심각성이 검토 중인 구체적인 상황 속에서 합리적으로 실행 가능한 한 낮으며 용인될 수 있는(tolerable) 수준에 도달한 위험"으로 정의된다 (On Acceptable Risk, 2002).

위험의 수용 여부를 결정하는 일은 어떤 위험을 수용해야 할지, 혹은 언제 어떻게 전문적인 지원을 요청해야 하는지에 대한 체계적인 교육 훈련이나 전문 역량을 갖추지 못한 개별 작업자 개인의 판단에 결코 맡겨져서는 안 된다. 이들이 무심코 부적절한 위험을 감수하고 받아들일 경우, 조직 전체에 돌이킬 수 없는 치명적인 파멸을 가져올 수 있기 때문이다.""",

    "B15": """## 위험의 관리 (MANAGEMENT OF RISK)
체계적인 안전 프로세스는 위험 관리의 다양한 측면에 대해 구조화된 전사적 접근 방식을 제공할 수 있으며, 조직이 직면한 위험의 본질과 구체적 유형에 대한 심층적인 지식을 배양할 수 있다. 또한 안전 프로세스는 조직이 어떠한 위험을 허용 가능한 것으로 간주할 것인지를 결정하는 메커니즘을 근본적으로 개선할 수 있는 귀중한 기회를 제공한다. 예를 들어 경찰, 소방, 군대, 광업, 심해 잠수, 항공기 조종 등 특수 고위험 직무는 극도로 높은 위험 환경 속에서 운영되지만, 반드시 완수해야 하는 임무에 대해 위험을 사회적으로 수용 가능한 수준으로 대폭 낮추도록 특수하게 고안된 다양한 표준 절차, 프로토콜, 그리고 다중 안전 통제 장치를 엄격히 구비하고 있다.

상당수의 기업 조직들은 위험에 대한 고유한 이해 수준을 갖추고 이미 나름의 위험성 평가 절차를 운영하는 별도의 전담 '위험관리부서(Risk Management Department)'를 두고 있다. 그러나 이러한 위험관리부서의 주된 핵심 임무는 통상 상업용 손해보험 가입, 위험 금융(risk financing), 그리고 사후 보험금 청구 및 배상 관리(claims management)에만 편협하게 국한되어 있는 경우가 많다. 조직이 노출된 다양한 범위의 위험 익스포저(risk exposures)와 총체적인 잠재 손실을 깊이 있게 식별해내기 위해서는 한층 정밀하고 공식적인 체계적 절차가 도입되어야 한다.

저자들의 풍부한 현장 경험에 비추어 볼 때, 현장의 수많은 안전 전문가들은 자신의 조직 내에 있는 위험관리부서와 유기적인 소통이나 접점을 거의 갖지 못하고 있다. 안전보건 프로그램은 주로 생산/운영 부서나 인사(HR) 부서 산하에 배치되어 있는 반면, 위험관리부서는 보험료 납부, 배상 청구, 그리고 자체 보험 적립금 운용 등에 필요한 재무적 관리 필요성으로 인해 주로 재무/회계 부서 산하에 편제되어 있기 때문이다. 그 결과, 안전 부서와 위험관리 부서는 위험을 통제하는 접근 방식과 위험에 대한 기본 정의의 차이로 인해 상호 협력하기보다는 대립적인 갈등 관계(adversaries)를 형성하기 쉽다.

다음은 현재 귀 조직 내에서 위험이 구체적으로 어디에서, 어떠한 방식으로 관리되고 있는지를 진단하고 파악하는 데 매우 유용한 핵심 점검 질문 리스트이다:
* 조직이 전사적 위험 관리(ERM, Enterprise Risk Management) 접근법(A structured approach to Enterprise Risk Management (ERM) & the requirements of ISO 31000, 2010; ISO 31000, Risk Management—Principles and Guidelines, 2009) 또는 기타 위험 관리 프레임워크를 공식적으로 따르고 있는지 확인하라.
* 현재 작동 중인 위험 관리 프로세스의 본질과 범위를 추적하여, 해당 프로세스가 규정상 달성하도록 위임받은 핵심 과업이 무엇인지를 정확히 이해하라.
* 가능한 모든 수단을 활용하여 전사 위험 관리 프로세스를 실질적으로 주관하고 있는 담당 부서 및 책임자와 긴밀한 업무 협력 관계(rapport)를 구축하라.
* 현재 전사적으로 운영되는 위험 관리 프로세스 내에 구체적인 '안전보건 기준(safety criteria)'이 공식적으로 반영되어 있는지 확인하라.
* 위험관리부서가 조직의 전사 위험을 어떠한 방법으로 평가하고 있으며, 구체적으로 어떤 측정 지표(metrics)를 활용하고 있는지에 대한 명확한 이해를 확립하라.
* 위험관리부서가 보유하고 있는 가용 자원 중 안전보건경영시스템을 보완하고 시너지를 낼 수 있는 리소스가 무엇인지 파악하라.
* 위험 관리의 판단 기준들이 조직 내에서 어떻게 전달 및 소통되고 있는지 이해하고, 안전보건경영시스템이 이와 유사한 공식 소통 채널을 상호 공유 및 활용할 수 있는지 검토하라.
* 위험, 유해위험요인, 손실 유발 사건, 그리고 기타 안전보건 관련 현안과 우려 사항에 관한 양방향 정보를 상호 투명하게 공유할 수 있는 통합 프레임워크를 구축하라.""",

    "B16": """## 위험 스펙트럼 (THE “RISK SPECTRUM”)
최고 수준의 거시적 위험 접근법(high-level risk approach)은 위험의 본질과 다차원적 유형에 대한 훨씬 명확하고 균형 잡힌 시각을 제공한다. 위험이 조직에 미치는 파괴적인 영향 사이에는 칼로 자르듯 명확히 구분되는 단일 경계선이 존재하지 않는다. 특정 위험이 조직에 미치는 다층적 파급 효과를 총체적으로 평가하기 위해 "위험 스펙트럼(spectrum of risk)" 모델이 유용하게 활용될 수 있다. 다음과 같은 위험 스펙트럼 분류 체계는 위험의 체계적인 평가와 전략적 관리 프로세스를 지원하는 데 강력한 도구로 활용될 수 있다:

* **레벨 1, 조직의 브랜드에 영향을 미치는 위험 (Level 1, Risk impacting the organization’s brand)**: 가장 최상위의 파멸적 위험 단계로서, 조직의 '브랜드(brand)'와 대외적 이미지를 근본적으로 훼손하거나 완전히 파괴할 수 있는 위험이다. 이러한 위험은 고객들을 대거 이탈시키고, 기업 가치를 폭락시키며, 규제 기관의 가혹한 개입과 제재를 불러오고, 천문학적인 법적 책임과 소송, 그리고 조직을 겨냥한 언론의 집중적인 부정적 비판 보도를 양산하는 진정한 "조직 살인마(organizational killers)"이다. 조직이 보유한 회복 탄력성(resilience)의 수준에 따라, 브랜드에 대한 사회적 신뢰의 완전한 상실을 딛고 살아남지 못해 영구 파산할 가능성이 매우 높다.
* **레벨 2, 운영에 영향을 미치는 위험 (Level 2, Risk impacting the operations)**: 제품이나 서비스를 생산·제공하는 개별 사업장이나 공장 설비에 직접적인 타격을 입히는 위험 유형이다. 운영상의 손실이 반드시 공장 전체의 전면적 파괴를 의미하지는 않더라도, 특정 사업장이 본래의 생산 목표나 서비스 제공 계획을 정상적으로 달성하는 능력을 심각하게 저하시킬 수 있다. 이 단계에서는 조직의 전사적 브랜드 자체가 치명적으로 훼손되지 않을 수 있으며, 만약 적절한 보험 보상과 고객 수요를 충족시킬 수 있는 대체 생산 및 서비스 수단이 확보되어 있다면 조직은 생존할 수 있다. 즉, 운영 역량을 다른 대체 공장으로 신속히 이전하여 시장 점유율을 성공적으로 회복할 수 있다면 조직은 살아남을 것이다. 그렇지 않다면, 보험금이나 유보 자금을 동원하여 대체 시설을 긴급 매입하거나 신속히 재건하여 조직을 지탱해야 하며, 이마저 실패한다면 조직은 결국 도태되어 생존하지 못할 것이다.  
  원자재 및 서비스의 투입(inflows)과 산출(outflows) 사이의 복잡한 상호관계를 한눈에 시각화하기 위해 '위험 지도(risk map)'를 개발할 수 있으며, 이는 전사 조직의 운영을 일거에 중단시킬 수 있는 제품이나 원자재의 "병목 지점(bottlenecks)"이 어디에 존재하는지 정밀하게 식별하는 데 결정적인 도움을 준다. 위험 지도는 가용 자원이 어디로부터 유입되는지에 대한 상류(upstream) 가치사슬을 조망하게 해주며, 비즈니스 연속성 및 재해 복구 계획(business recovery plan)을 수립하는 핵심 토대를 제공한다 (그림 10.3 참조).""",

    "B17": """![Fig 10.3](image-104.png)
**그림 10.3 단순화된 위험 지도(Simplified risk map). 위험 지도는 고객에게 전달되는 제품이나 서비스의 흐름을 전면 중단시킬 수 있는 "병목 지점(bottlenecks)"이나 손실 유발 취약 구역을 정밀하게 식별해낸다.**

* **레벨 3, 비조직 주체 또는 제3자에게 영향을 미치는 위험 (Level 3, Risk impacting on nonorganization entities or third parties)**: 이러한 성격의 위험은 조직 내부의 물리적 시설이나 공정 설비에 직접적인 손상을 가하지 않을 수 있으며, 공장의 생산 라인 자체는 정상적으로 계속 돌아갈 수 있다. 그러나 조직의 중대한 과실, 부실한 제품 설계, 치명적인 차량 교통사고, 유해물질의 환경 누출이나 유출 사고 등을 통해 외부에 위해를 가했을 경우, 천문학적인 배상 책임을 묻는 대규모 손해배상 소송(liability lawsuits)이 제기될 수 있다. 이로 인한 재정적 타격은 상상을 초월할 정도로 막대할 수 있으며, 조직이 향후 정상적인 경영 활동을 지속할 수 있는 기반 능력을 회복 불가능할 정도로 잠식할 수 있다. 따라서 위험 관리는 공장 담장 내부의 운영 경계를 뛰어넘어, 조직이 발을 딛고 영위하는 전체 비즈니스 생태계 환경을 거시적으로 평가해야만 한다.
* **레벨 4, 근로자에게 영향을 미치는 위험 (Level 4, Risk impacting employees)**: 근로자의 산업재해 및 직업병 예방은 대부분의 안전보건 프로세스가 가장 집중하는 최우선적인 핵심 영역이다. 안전한 작업 환경을 구축하는 것은 강력한 안전문화를 지속하는 데 절대적으로 중요하지만, 극단적인 대형 참사를 제외한 일반적인 근로자 부상은 공장 운영 전체를 장기간 중단시키지는 않으며 대개 주(State) 산재보상보험 규정에 따른 의료 치료 및 보상 프로세스로 처리된다. 즉, 제한적인 생산성 손실만을 수반한 채 현장 운영은 정상적으로 계속 유지되는 것이 일반적이다. 그러나 중대재해(serious injuries)나 사망 사고(fatalities)가 발생하는 경우는 완전히 다른 국면이 전개된다. 근로자의 사고 발생 빈도가 지속적으로 높게 유지되거나 비극적인 중대 참사가 발생할 경우, 위험천만한 작업 환경이라는 악명 높은 평판이 낙인찍히면서 언론의 집중적인 부정적 비판 보도, 정부 규제 기관의 강도 높은 조사, 지역사회의 격렬한 저항, 그리고 노동조합의 강력한 항의와 파업 등이 연쇄적으로 촉발되어 결국 최상위 조직 브랜드(Level 1)까지 파멸적인 타격을 입게 된다.
* **레벨 5, 법적 규제 이슈로 인한 위험 (Level 5, Risk from regulatory issues)**: 대부분의 경우, 정부 규제 기관의 감독관 방문이나 법적 위반 시정명령, 과태료 처분 등은 공장 운영을 전면 중단시키지 않으며, 금전적인 과태료 및 벌금 부과를 제외하고는 직접적인 시설 손실을 야기하지 않는다. 감독관의 불시 점검이 진행되는 중에도 공장의 생산은 계속된다. 그러나 극단적인 경우로서 조직이 법적 컴플라이언스 준수 요건을 지속적으로 이행하지 못하고 만성적으로 방치하여, 근로자와 고객 및 지역사회에 대한 법적 책무를 중대하게 태만히 한 악의적 범죄 행위로 간주될 경우에는 조직 존립 자체를 흔드는 극심한 사법적 타격과 영업 정지 처분으로 이어질 수 있다.

이러한 위험의 수준들은 결코 고정불변의 엄격한 위계 서열(rigid hierarchy)이 아니며, 특정한 손실 유발 사건의 규모와 심각도에 따라 그 우선순위와 영향의 크기가 얼마든지 동적으로 뒤바뀔 수 있다. 이 스펙트럼 분류의 핵심 목표는 위험의 다차원적 파급 범위를 명확히 규명함으로써, 최고 경영진에게 위험성 평가의 필요성을 훨씬 구체적이고 체감할 수 있는 현실적 과제로 인식시키는 데 있다. 최악의 도미노 시나리오(worst-case scenario)를 예로 들면, 화학 공장의 대형 폭발 및 화재 참사라는 치명적인 잠재 위험(레벨 2: 운영 타격)은 현장 근로자의 대규모 인명 사상(레벨 4: 근로자 피해)을 유발하고, 인근 지역사회를 초토화시켜 막대한 제3자 손해배상 소송을 부르고(레벨 3: 제3자 배상), 대규모 유독가스 환경 오염(레벨 3: 환경 피해)을 촉발하며, 정부의 전면적인 특별 감사와 사법 처벌(레벨 5: 규제 이슈)로 번져나간다. 이 모든 파괴적인 위험 수준들의 결합은 결국 기업 브랜드의 회복 불가능한 파멸과 전면적 영업 정지, 그리고 천문학적인 법적 도산(레벨 1: 브랜드 파괴)이라는 파국적인 결과로 귀결된다 (그림 10.4 참조).""",

    "B18": """![Fig 10.4](image-105.png)
**그림 10.4 위험 관리 전략 및 위험성 평가 체계의 전사적 개요 예시.**

안전보건경영시스템은 반드시 조직의 전사적 위험 관리 프로그램 속에 빈틈없이 융합되어야 한다. 포괄적이고 체계적인 안전보건경영시스템의 적극적 활용은 조직을 다양한 잠재 위협으로부터 더욱 철저하게 보호하기 위한 위험성 평가 및 정밀 분석 프로세스의 강력한 가교(conduit) 역할을 수행한다.

제11장 '활동 기준 안전 시스템(ABSS, Activity-Based Safety System)의 구축'에서는 위험 지각(risk perception)과 위험 관리에 대한 이러한 핵심 통찰들을 기반으로, 안전문화를 획기적으로 강화하고 성숙시킬 수 있도록 조직의 다층적 수준에서 안전경영시스템에 실질적인 영향력을 발휘하는 구체적인 방안을 심도 있게 논의할 것이다.

ABSS는 운영상의 잠재 위험을 획기적으로 낮추고 안전한 작업 환경을 실현하기 위해 리더십 팀이 조직의 안전 비전, 안전 목표, 그리고 구체적 실천 과제를 정기적으로 강력하게 소통하고 강조해야 할 당위성을 역설한다. 그러나 많은 경우 이는 상명하달식의 일방적인 하향식 소통(top-down, one-way communication)에 그치는 경우가 많았다. 반면 ABSS는 조직 전반에 걸쳐 진정한 양방향 소통(two-way communication)의 잠재력을 극대화하고 실무에 성공적으로 구현하는 데 필요한 견고한 구조와 프레임워크를 제공한다.

우리는 향후 장에서 ABSS가 성공적으로 구축되었을 때, 리더십과 현장 근로자 모두가 현실에 상존하는 실제적 위험 또는 주관적으로 지각된 위험(real or perceived risks), 그리고 제반 안전 관련 현안들을 투명하게 논의하고 상호 소통할 수 있는 공식적인 통로를 어떻게 확보하게 되는지 구체적으로 논의할 것이다. 이처럼 구조화된 열린 대화(structured dialog)의 증대된 잠재력은 위험에 기초하여 다양한 안전 활동의 우선순위를 지혜롭게 설정하고 이를 현장에 탁월하게 구현할 수 있는 가장 강력한 실행 방안을 제시해 줄 것이다.""",

    "B19": """## 요약 (SUMMARY)
위험 관리와 위험성 평가의 확립된 원칙들은 현대 안전보건경영시스템의 가장 핵심적이고 중추적인 근간을 이룬다. 과거의 사후 손실 기반 안전 프로세스(loss-based safety process)로부터 선제적 위험 기반 안전보건경영시스템(risk-based safety management system)으로의 패러다임 전환은, 안전에 대해 조직 구성원들이 품고 있는 기존의 인식과 지각 체계에 대한 근본적인 의식 개혁을 요구한다.

위험 관리는 유해위험요인을 정밀하게 식별하고, 그러한 유해위험요인 속에 내재된 위험을 과학적으로 평가하며, 위험의 회피(avoidance), 통제(control), 전가(transfer) 또는 수용(acceptance)을 위한 최적의 처리 방법과 대책을 선정하는 데 필수적인 명확한 판단 기준을 확립해 준다. 그러나 조직 내부에서 '위험'을 논의할 때 조직 내의 각 부서마다 위험을 바라보고 정의하는 시각이 극명하게 다르기 때문에 심각한 소통의 혼선과 갈등이 발생할 수 있다.

최근에 조직 내에서 아무런 대형 사고나 인명 손실이 발생하지 않았을 경우, 위험에 대한 심각하게 왜곡된 지각(distorted perception of risk)이 형성될 수 있다. 현장에는 극도로 위험한 고강도 위험요인들이 버젓이 상존하고 있음에도 불구하고 작업 환경이 완벽하게 안전하다는 치명적인 착각과 미신이 조직 내에 싹틀 수 있는 것이다.

본 장에서는 위험 관리의 굳건한 토대를 다지기 위해 활용될 수 있는 3단계 접근법(three-part approach)을 소개하였다. 이 3단계 프로세스는 개념상으로는 단순하게 표현될 수 있지만, 작업 현장 깊숙이 은폐되어 있는 잠재적 유해위험요인과 그에 연계된 위험 수준을 전면적으로 발굴해내기 위해서는 매우 깊이 있고 체계적인 학술적·실무적 접근 방식을 필수적으로 요구한다. 이 세 가지 단계는 위험 식별(risk identification), 위험성 평가(risk assessment), 그리고 위험 통제(risk control)로 구성된다.

수많은 기업 조직들이 위험에 대해 나름의 이해를 갖추고 위험 평가 절차를 운영하는 별도의 전담 위험관리부서를 두고 있다. 그러나 통상 이들 부서의 주된 핵심 과업은 보험 가입과 금융적 리스크 관리에만 협소하게 국한되어 있어, 실제 현장의 실질적인 위험 노출 요인과 잠재적 파멸 손실을 체계적으로 식별해내는 현장 중심의 프로세스는 결여되어 있는 경우가 많다.

진정한 의미의 위험 관리는 조직의 핵심 가치 체계(value system)의 분리될 수 없는 핵심 일환으로 깊이 내재화되고 확고하게 뿌리내린 강력한 안전보건경영시스템에 굳건히 기반을 두어야만 비로소 성공할 수 있다.""",

    "B20": """## 장 복습 문제 (CHAPTER REVIEW QUESTIONS)
1. 위험(risk)의 개념을 학술적·실무적으로 명확히 정의하라.
2. 조직 내의 각 전문 부서별로 위험에 대한 정의가 서로 어떻게 다를 수 있는지 설명하라.
3. 조직이 위험 관리를 성공적으로 수행하는 데 가로막는 주요 장애요인들을 설명하라.
4. 위험성 평가(risk assessment)를 성공적으로 완수하기 위한 핵심 8단계를 상세히 설명하라.
5. 허용 가능한 위험(acceptable risk)의 개념과 그것이 조직의 의사결정에 미치는 잠재적 영향을 설명하라.
6. 위험 스펙트럼(risk spectrum)의 5개 다차원적 수준을 구체적 사례와 함께 설명하라.""",

    "B21": """## 참고문헌 (BIBLIOGRAPHY)
* A structured approach to Enterprise Risk Management (ERM) & the requirements of ISO 31000. (2010). AIRMIC. Retrieved from http://bit.ly/2Hju03v.
* Accident. (2018). Merriam-Webster, Incorporated. Retrieved from http://bit.ly/XTAklU.
* Acquisition Risk Management Probability Definitions. (2017). Risk Management Toolkit. Retrieved from http://bit.ly/VAZN7L.
* Bernstein, P. L. (1996). Against the gods: The remarkable story of risk. New York: Wiley.
* Blast at BP Texas Refinery. (2005). ProPublica, Journalism in the Public Interest in ‘05 Foreshadowed Gulf Disaster, March. Retrieved from http://1.usa.gov/13tv7Y8.
* Buffett, W. (2018). In the business world, the rearview mirror is always clearer than the windshield. In Brainy quote. Retrieved from http://bit.ly/2kDzgpE.
* Concepts and Principles. Human Performance Improvement Handbook. (2009). Vol. 1 US Department of Energy.
* Deep Water, The Gulf Oil Disaster and the Future of Offshore Drilling. (2011). National Commission on the BP Deepwater Horizon Oil Spill and Offshore Drilling January. Retrieved from http://1.usa.gov/XeVOw8.
* Ethan, G., & Little, D. (2011). Risk—assessing and mitigating to deliver sustainable safety performance. Professional Safety, (July).
* Guidelines for Hazard Identification, Risk Assessment and Risk Control (HIRARC). (2008). Department of Occupational Safety and Health Ministry of Human Resources Malaysia, Based on Information as Presented on and Adapted for Use. Retrieved from http://bit.ly/bBXZYW.
* Havern, C. B. (2012). The short life and tragic end of RMS Titanic. Coast Guard Journal of Safety & Security at Sea: Proceedings of the Marine Safety & Security Council, 69(2). Retrieved from http://bit.ly/2J56rhe.
* ISO 31000, Risk Management—Principles and Guidelines. (2009). International Organization or Standardization. Retrieved from http://bit.ly/Uobg8J.
* Lowrance, W. W. (1976). Of acceptable risk: Science and the determination of safety.
* Managing for Health and Safety (HSG65). (2013). Health and Safety Executive, Crown Publishing. Permission to Reprint, Based on Information as Presented and Adapted for Use. Retrieved from http://bit.ly/YKDzRk.
* Occupational Health and Safety Systems. (2012). The American Industrial Hygiene Association, ANSI/AIHA Z10.
* Offal, the waste or by-product of a process. (2018). Merriam-Webster. Retrieved from http://bit.ly/2MuhK4c.
* On Acceptable Risk. (2002). In EHS Today. January, Retrieved from http://bit.ly/Z36Yma.
* Principles of System Safety. (2000). The Federal Aviation Administration (FAA), Office of System Safety, FAA System, Adapted for use (chapter 3) December. Retrieved from http://bit.ly/2kfwY2Z.
* Quadrant of Risk: Hazard, Operational, Financial, and Strategic. (2017). ERM Strategies, LLC. Retrieved from http://bit.ly/YE0Spv.
* Ropeik, D., & Gray, G. M. (2002). Risk: A practical guide for deciding what’s really safe and what’s really dangerous in the world around you. Boston, MA: Houghton Mifflin Company."""
}
