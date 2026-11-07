"""Chapter 9 Translations Part 3 (Blocks B28 to B41)"""

translations = {
    "B28": """## 위험 지침 카드: 잠재적 해결책 (THE RISK GUIDANCE CARD, A POTENTIAL SOLUTION)

안전보건경영시스템이 구축되어 있다면 유해·위험요인 통제 프로그램이 이미 실행되어 일반적인 안전 기준들을 다루고 있을 것이다.
안전 프로세스를 실질적으로 강화하기 위해, 모든 직원에게 배포되는 작은 휴대용 카드인 **위험 지침 카드(Risk Guidance Card)**는 직원들이 일상적으로 품을 수 있는 주관적이고 왜곡된 위험 지각을 객관적으로 보정하는 데 결정적인 도움을 준다.
이 카드는 복잡한 문서 작업 없이도 현장 작업자가 1분 이내에 스스로 위험 수준을 평가하고 작업 진행 여부를 결정할 수 있도록 설계된다.""",

    "B29": """![Table 9.4](image-32.png)
**표 9.4 발생 가능성과 심각성의 식별 기준 (Identifying Probability and Severity)**

| 구분 | 발생 가능성 (Probability / Likelihood) | 심각성 (Severity / Consequence) |
| :---: | :--- | :--- |
| **낮음 (1점)** | **희박함 (Unlikely):** 발생할 가능성이 극히 드묾, 부상 가능성이 낮음 | **경미함 (Marginal):** 경미한 상처, 단순 구급처치 불필요 또는 자가 치료 가능 |
| **보통 (2점)** | **가능성 있음 (Likely):** 과거에 유사 사건이나 부상이 발생한 이력이 있음 | **중대함 (Critical):** 의료기관 치료가 필요한 부상, 설비 파손 발생 |
| **높음 (3점)** | **매우 높음 (Very likely):** 피해 발생이 확실시됨, 명백한 위험 상태 방치 | **치명적 (Severe):** 영구 장애, 사망, 시설의 전면 가동 중단 초래 |""",

    "B30": """![Fig 9.3](image-33.png)
그림 9.3 발생 가능성과 심각성에 기초한 모델 위험성평가 도구 (3×3 매트릭스).""",

    "B31": """## 위험 지침 카드의 활용 (USING THE RISK GUIDANCE CARD)

그 목적은 유해·위험요인과 그 위험 수준으로부터 발생할 수 있는 부정적인 결과에 관한 잠재적 피해를 명시적으로 규명하는 것이다.
현장 근로자가 쉽게 이해하고 적용할 수 있도록 발생 가능성과 결과 심각성에 대해 간결하고 직관적인 정의를 사용한다. 카드의 뒷면에는 작업중지권(Stop-Work Authority)의 발동 요령과 비상 연락망이 함께 인쇄되어야 한다.""",

    "B32": """## 위험 점수화 체계 (RISK SCORING)

발생 가능성(Probability)과 결과 심각성(Severity)은 각각 1점에서 3점까지 점수가 매겨진다. 매트릭스 상에서 두 점수가 교차하는 지점이 바로 **"위험 등급(Risk Rating)"**이다. (표 9.7 참조).
예를 들어, 직원이 위험 지침 카드를 사용하여 작업을 평가했을 때 발생 가능성이 2점이고 심각성이 3점이라면, 위험 등급은 즉각적인 작업 중지가 요구되는 적색(Red) 경고 단계에 도달한다.""",

    "B33": """![Table 9.5](image-34.png)
**표 9.5 발생 가능성 평가 척도 (Probability Rating, Roughton, 2012):**
* **희박함 (Unlikely):** 드물게 발생하는 사건이지만 부상이나 손실의 가능성이 존재함.
* **가능성 있음 (Likely):** 합리적 개연성—의학적 치료가 필요한 부상으로 이어질 강력한 가능성이 있음.
* **매우 높음 (Very likely):** 높은 개연성—통제 조치가 즉시 적용되지 않으면 사고 발생이 불가피함.""",

    "B34": """![Table 9.6](image-35.png)
**표 9.6 결과 심각성 평가 척도 (Severity Rating, 육군 시스템 안전 관리 지침, 2013):**
* **경미 (Marginal):** 경미한 부상, 단순 응급처치 수준.
* **중대 (Critical):** 전문 의학적 치료가 필요한 중상, 상당한 설비 피해.
* **치명적 (Severe):** 사망, 영구적 전신 장애, 시설의 파멸적 붕괴.""",

    "B35": """![Table 9.7](image-36.png)
**표 9.7 위험 등급 및 행동 조치 기준 (Risk Ratings & Actions):**

| 위험 등급 | 색상 구분 | 행동 조치 지침 (Action Required) |
| :---: | :---: | :--- |
| **1등급 (Low)** | **녹색 (Green)** | **"낮은 위험"** — 정상 작업 진행, 기존 표준 작업 절차 준수. |
| **2등급 (Medium)** | **황색 (Yellow)** | **"주의/상담 필요"** — 관리감독자와 즉시 상의하고, 위험을 논의하여 추가적인 위험 저감 해결책을 도출한 후 작업 진행. |
| **3등급 (High)** | **적색 (Red)** | **"작업 중지 (STOP WORK)"** — 자가 진단 평가에 근거하여 작업을 즉시 중지하라! 상위 관리자에게 즉시 보고하고 위험 해결책이 검증될 때까지 절대 작업 재개 금지. |

(미 해군 운용위험관리 ORM 지침 등 인용)""",

    "B36": """![Fig 9.4](image-37.png)
그림 9.4 위험성평가 분석 및 에스컬레이션 프로세스 예시.
만약 현장 감독자와 근로자 사이에 특정 위험의 통제 여부에 대해 합의에 도달하지 못할 경우, 해당 우려 사항은 차상위 리더십(공장장, 안전 임원 등)으로 즉시 상정(에스컬레이션)된다.
이 논의에는 해당 근로자, 직속 관리감독자, 차상위 관리자 및 안전 전문가가 모두 참여하며, 위험이 합리적으로 통제 가능한 수준으로 낮아질 때까지 논의와 작업 중지가 유지된다.""",

    "B37": """## 전사적 위험관리 책임 (OVERALL RISK MANAGEMENT RESPONSIBILITIES)

효과적인 위험관리는 리더십 팀의 구체적인 책임과 권한 수준을 다음과 같이 명시하고 규정한다:
* 무엇이 조직에서 허용 불가능한 위험(unacceptable risk)인지를 명확히 정의하고, 전사적인 공통 이해를 보장한다.
* 작업장 내 유해·위험요인을 최소화하고 통제하기 위해 필요한 인적·물적 자원을 충분히 배정한다.
* 현장 근로자의 위험 제안과 작업중지권 행사를 강력히 지지하고 보호한다.
* 위험성평가 결과를 설비 개선 및 투자 계획과 유기적으로 연계한다.""",

    "B38": """## 리더십의 위험관리 책임 (LEADERSHIP’S RISK RESPONSIBILITIES)

리더십의 구체적 책임은 다음을 포함한다:
* 손실 유발 사건의 잠재력을 식별하기 위해 위험성평가 및 관리 개념을 일관되게 적용한다.
* 근로자들이 배정된 적절한 위험 통제 절차를 철저히 따르도록 보장한다.
* 생산 압박 속에서도 안전 우선 원칙을 일관되게 고수한다.
* 위험 감소를 위한 개선 조치들의 이행 현황을 끝까지 추적 관리한다.""",

    "B39": """## 교훈 4 (LESSON LEARNED 4)

관리감독자들과의 사고 조사 세션 중에, 초기 사고 조사 보고서는 부상당한 작업자에게 표준 작업 절차(SOP)를 재교육하라는 판에 박힌 권고사항만을 담고 있었다.
논의 대상이 된 서면 절차서 사본을 직접 검토해 본 결과, 해당 절차서는 무려 8년 전에 작성된 구버전이었으며 현장의 신규 기계 설비나 변경된 공정 조건을 전혀 반영하지 못하고 있었다!
작업자를 탓하기 전에 시스템과 절차서 자체가 현실적인 위험을 제대로 통제하고 있는지 먼저 의심하고 검증해야 한다는 뼈아픈 교훈을 남겼다.""",

    "B40": """## 직원의 위험관리 책임 (EMPLOYEE’S RISK RESPONSIBILITIES)

직원의 구체적인 책임과 역할은 다음을 포함한다:
* 유해·위험요인 및 위험 통제 조치가 존재하는 이유를 명확히 이해하고, 통제 수칙을 철저히 준수하고 유지한다.
* 작업 환경 내의 특정 유해·위험요인과 변화하는 조건에 대해 상시적인 위험 경각심(constant awareness)을 유지한다.
* 위험 지침 카드(Risk Guidance Card)를 활용하여 작업 전 위험 자가 진단을 충실히 수행한다.
* 안전하지 않다고 판단되거나 위험 등급이 높을 경우 작업을 중지하고 즉시 관리자에게 보고한다.
* 위험을 줄이기 위한 개선 제안에 적극 참여한다.""",

    "B41": """## 요약, 복습 문제 및 참고문헌 (SUMMARY, REVIEW QUESTIONS & BIBLIOGRAPHY)

**요약 (Summary):**
깊이 있는 안전문화를 유지하려면 위험에 대한 이해와 그 통제가 조직 전체에 깊이 스며들어야 한다. 유해·위험요인을 식별하기 위해 단순 점검과 표면적 관찰에만 의존하는 안전보건경영시스템은 잠재적 위험성과 연계되지 않는 한 부상과 손실의 잠재력을 온전히 파악할 수 없다.
모든 유해·위험 조건과 관련 위험을 다룰 때 과거의 경험에 근거하여 현재를 안일하게 판단하려는 인간의 본능적 편향이 존재한다. 과거에 사고가 나지 않았다고 해서 미래에도 안전할 것이라는 착각을 깨부수어야 한다.
질문하는 태도(Questioning Attitude)와 포켓용 위험 지침 카드(Risk Guidance Card)는 현장 풀뿌리 수준에서 작업자가 주도적으로 위험을 측정하고 작업중지권을 발동할 수 있는 가장 강력한 실천 도구이다.

**장 복습 문제 (Review Questions):**
1. 유해·위험요인(Hazard)과 위험(Risk)의 학술적 정의를 비교하고 대조하라.
2. 왜 작업자들은 현장에서 불필요한 위험을 감수하는가? 심리적 원인을 설명하라.
3. '질문하는 태도(Questioning Attitude)'의 핵심 단계(Stop, Look, Listen)를 설명하라.
4. 포드 핀토와 다카타 에어백 사건이 위험 결정에 주는 교훈은 무엇인가?
5. 위험 지침 카드의 3×3 매트릭스와 색상별(녹색, 황색, 적색) 행동 지침을 요약하라.
6. 위험 지각에서 엔터테인먼트 미디어가 미치는 부정적 영향과 물리적 현실(낙하 충격 연구)을 비교하라.

**참고문헌 (Bibliography):**
A risk matrix for risk managers. (2008). Risk Management Institute.
ANSI/AIHA/ASSE Z10-2012. Occupational Health and Safety Management Systems.
Clifford Atiyeh. (2015). Massive Takata Airbag Recall: What You Need to Know. Car and Driver.
Fewtrell, L., & Bartram, J. (2001). Water Quality: Guidelines, Standards and Health. IWA Publishing.
Hammer, W., & Price, D. (2001). Occupational Safety Management and Engineering (5th ed.). Prentice Hall.
Mishap Prevention Program. (2011). U.S. Air Force Instruction 91-202.
Mullai, A. (2006). A Risk Analysis Framework for Maritime Transport. Lund University.
Occupational Health & Safety Management Systems. (2012). ANSI/AIHA Z10.
Roughton, J. (2012). Developing a Risk Perception Card for Industry. Safety Professional Journal.
System Safety Management Guide. (2013). Department of the Army Pamphlet 385-16.
The top automotive engineering failures: The Ford Pinto fuel tanks. (2011). Popular Mechanics."""
}
