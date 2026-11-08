"""Chapter 11 Translations Part 4 (Blocks B91 to B120)"""

translations = {
    "B91": """### 4. 사건 트리 근본 원인 분석 및 기여 요인 (Incident Tree Root Cause Analysis & Contributing Factors)

사고의 표면적 원인에 머물지 않고 근본 원인에 도달하기 위해 논리적 인과관계를 구조화하는 **사건 트리(Incident Tree)** 분석 기법을 적용한다.""",

    "B92": """### 표 11.2 사건 트리 분석 절차 (TABLE 11.2 Procedure for Completing Incident Tree Method)
손실 사건을 최상단에 배치하고 직접 원인, 간접 원인, 시스템적 근본 원인으로 가지를 뻗어 나가며 원인을 규명하는 5단계 표준 절차서.""",

    "B93": """![Table 11.2 Procedure for Completing Incident Tree Method](image-125.png)
사건 트리 작성 절차 가이드라인 시트.""",

    "B94": """### 표 11.3 사고 기여 요인 분석 분류표 (TABLE 11.3 Analysis of Contributing Factors)
인적 요인, 설비적 요인, 환경적 요인, 관리적 시스템 요인 등 사고 발생에 기여한 다차원적 변수들의 표준 분류 매트릭스.""",

    "B95": """![Table 11.3 Analysis of Contributing Factors](image-126.png)
사고 기여 요인 점검표.""",

    "B96": """### 표 11.4 사고를 유발하거나 기여한 행동 목록 (TABLE 11.4 What Action(S) Caused or Contributed to the Incident)
위험한 편법 사용, 방호장치 임의 해제, 개인보호구 미착용, 부적절한 도구 사용 등 불안전한 행동에 대한 세부 체크리스트.""",

    "B97": """![Table 11.4 Actions Contributing to Incident](image-127.png)
불안전한 행동 식별 양식.""",

    "B98": """### 표 11.5 부상 정보—재해 발생 형태 표준 분류 (TABLE 11.5 Injury Information—Incident Type)
유해·위험요인 인식 및 위험 지침 카드와 직접 연계된 재해 발생 형태(기인물 및 접촉 방식)의 표준 분류 기준표.""",

    "B99": """![Table 11.5 Injury Information Incident Type](image-128.png)

**주요 재해 발생 형태 분류 기준 (Key Incident Type Classifications):**
* **낙하·비래 (Struck by):** 날아오거나 떨어지는 물체에 맞음 (예: 비산하는 금속 파편, 낙하하는 공구).
* **충돌·격돌 (Struck against):** 작업자가 움직이다가 고정된 물체에 부딪힘 (예: 돌출된 H빔에 머리를 부딪힘).
* **접촉 (Contact by):** 움직이는 위험 물질에 접촉함 (예: 비산된 화학물질이나 증기 접촉).
* **유해물 접촉 (Contact with):** 고정된 날카롭거나 뜨거운 물체에 접촉함 (예: 뜨거운 배관 화상, 배전반 감전).
* **협착·끼임 (Caught on):** 움직이는 기계 돌출부에 옷이나 장갑이 걸림.
* **협착·말림 (Caught in):** 회전 롤러, 컨베이어 기어 사이에 신체가 말려 들어감.
* **끼임·압착 (Caught between):** 닫히는 문이나 두 개의 고정/이동 물체 사이에 신체가 압착됨.
* **추락 (Fall to lower level):** 비계, 사다리, 개구부 등 높은 곳에서 아래로 떨어짐.
* **넘어짐 (Fall on same level):** 바닥의 물기, 기름, 장애물로 인해 미끄러지거나 걸려 넘어짐.
* **과도한 신체 부담 (Overexertion):** 무거운 물건을 무리하게 들거나 비틀어 발생한 근골격계 부상.""",

    "B100": """### 5. 시정 조치 및 품질 검토 (Corrective Actions and Quality Review)

* **조치 수립 기준:** 시정 조치는 '작업자 주의 환기'와 같은 모호한 문구가 아니라, **통제의 위계(Hierarchy of Controls)**에 따라 제거, 대체, 공학적 개선을 최우선으로 수립되어야 한다.
* **기한과 책임자 명시:** 모든 조치에는 완결 기한(Target Date)과 실행 책임자(PIC)가 명확히 지정되어야 한다.
* **유효성 사후 평가:** 조치 실행 30일 후 실제로 위험이 제거되었는지 현장 품질 검토를 필수적으로 수행한다.""",

    "B101": """## 부록 11.9 부상 관리 프로세스 북클릿 ("Grab N Go Kit" 종합 서식) (APPENDIX 11.9 INJURY MANAGEMENT PROCESS BOOKLET)

본 부록은 작업장 내 부상 사고 발생 시 관리감독자가 즉시 들고 출동하여 원스톱으로 대응할 수 있는 'Grab N Go Kit'의 표준 서식 17종(0페이지~16페이지)을 제공한다.""",

    "B102": """### 부상 대응 키트 서식 및 직급별 검토 책임 매트릭스 (Overview of Grab N Go Kit Forms)

| 페이지 번호 | 서식 및 절차서 명칭 | 부상 직원 | 감독자 | 리더십 팀 | 안전 전문가 | 의료진 |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| **0** | 초기 부상 예방 및 대응 체크리스트 (표지) | - | **X** | **X** | **X** | - |
| **1** | 근로자 부상 보고 확인서 | **X** | **X** | - | - | - |
| **2** | 근로자 초기 진술서 (최초 보고서) | **X** | **X** | - | - | - |
| **3** | 관리감독자 초기 사건 진술서 | - | **X** | **X** | **X** | - |
| **4** | 주치의 및 병원 의료진 협조 서한 | - | **X** | - | - | **X** |
| **5** | 기본 직무 기술서 (신체 요구도 포함) | - | **X** | - | - | **X** |
| **6** | 전환 업무(경업무) 평가서 및 의사 소견서 | - | **X** | - | - | **X** |
| **7** | 병원 이송 및 교통편 절차 안내서 | - | **X** | - | - | - |
| **8** | 초기 부상 경보 보고서 (Incident Alert) | - | **X** | **X** | **X** | - |
| **9** | 전환 업무(임시 복귀) 프로그램 통지서 | **X** | **X** | - | - | - |
| **10** | 전환 업무 프로그램 후속 추적 양식 | **X** | **X** | - | **X** | - |
| **11** | 사건 타임라인 (사건 발생 순서) 기록지 | - | **X** | - | **X** | - |
| **12** | 사업장 구급처치 일지 (First Aid Log) | - | **X** | - | **X** | - |
| **13** | 목격자 진술서 | - | **X** | - | **X** | - |
| **14** | 직원 면담 기록 양식 | - | **X** | - | **X** | - |
| **15** | 인체공학적 위험 인식 체크리스트 | **X** | **X** | - | **X** | - |
| **16** | 사고 보고 브리핑 프레젠테이션 양식 | - | **X** | **X** | **X** | - |""",

    "B103": """### [서식 0페이지] 초기 부상 대응 체크리스트 (Initial Injury Management Checklist)
부상 발생 즉시 취해야 할 10단계 응급 조치 순서도 (응급처치, 119 후송, 현장 보존, 사진 촬영, 최초 경보 발령 등).""",

    "B104": """### [서식 1페이지] 근로자 부상 보고 확인서 (Sample Employee Acknowledgment)
부상 근로자가 회사에 부상 사실을 지체 없이 정직하게 보고했음을 상호 확인하고 서명하는 공식 서약 양식.""",

    "B105": """### [서식 2페이지] 근로자 초기 진술서 (Sample Employee Statement of First Report)
부상 근로자 본인이 육하원칙에 따라 사고 당시의 상황, 통증 부위, 사용 중이던 공구와 보호구를 직접 기술하는 서식.""",

    "B106": """### [서식 3페이지] 관리감독자 초기 진술서 (Sample Supervisor Initial Statement)
현장 감독자가 부상 통보를 받은 즉시 현장 상태를 조사하여 기재하는 1차 감독자 보고서.""",

    "B107": """### [서식 4페이지] 의료진 협조 서한 (Sample Medical Care Provider Letter)
치료 의사에게 회사의 경업무(Transitional Duty) 프로그램을 소개하고, 불필요한 휴업 대신 가능한 신체 활동 범위를 지정해 줄 것을 요청하는 공식 공문.""",

    "B108": """### [서식 5페이지] 직무 신체 요구도 기술서 (Sample Basic Job Description)
해당 직무가 요구하는 들어 올리기 무게, 서 있는 시간, 무릎 꿇기 빈도 등을 의료진이 판단할 수 있도록 정리한 직무 명세표.""",

    "B109": """### [서식 6페이지] 전환 업무 평가서 (Sample Transitional Duty Evaluation)
주치의가 부상 근로자의 신체적 제한 사항(예: 5kg 이상 인양 금지, 앉아서만 작업 등)을 구체적으로 체크하는 의료 소견서 양식.""",

    "B110": """### [서식 7페이지] 병원 이송 및 교통편 규정 (Sample Travel Policy & Transportation Procedure)
부상자 발생 시 지정 병원 이송 절차 및 회사 차량 지원 수칙 안내문.""",

    "B111": """### [서식 8페이지] 초기 부상 경보 보고서 (Sample Preliminary Injury Alert)
사고 발생 2시간 이내에 전사 경영진과 관련 부서에 긴급 배포되는 1페이지짜리 핵심 사고 속보 양식.""",

    "B112": """### [서식 9페이지] 전환 업무 배치 통지서 (Sample Transitional Duty Program Notification)
부상 근로자에게 주치의 소견에 맞추어 임시로 배정된 안전한 전환 업무의 내용과 근무 조건을 공식 통지하는 서식.""",

    "B113": """### [서식 10페이지] 전환 업무 후속 추적 양식 (Sample Transitional Duty Program Follow Up)
전환 업무 수행 중 통증 변화와 회복 상태를 주간 단위로 추적 기록하는 관리 시트.""",

    "B114": """### [서식 11페이지] 사건 타임라인 기록지 (Sample Sequence of Events Timeline)
사고 당일 시간대별 작업 상황과 인과관계를 분 단위로 정리하는 정밀 타임라인 서식.""",

    "B115": """### [서식 12페이지] 구급처치 일지 (Sample First Aid Log)
경미한 찰과상 등 사내에서 처치된 모든 구급 처치 이력을 누락 없이 기록하는 표준 대장.""",

    "B116": """### [서식 13페이지] 목격자 진술서 (Sample Witness Statement of Facts)
사고 현장을 직접 목격한 동료 작업자가 자신이 보고 들은 사실만을 객관적으로 기술하는 법적 진술 서식.""",

    "B117": """### [서식 14페이지] 직원 면담 기록지 (Sample Employee Interview Form)
조사관이 부상자 및 관련자와 심층 면담을 진행하며 질문과 답변을 체계적으로 기록하는 인터뷰 양식.""",

    "B118": """### [서식 15페이지] 인체공학적 위험 인식 체크리스트 (Sample Ergonomics Awareness Checklist)
부적절한 자세, 반복 작업, 과도한 힘, 접촉 스트레스 등 근골격계 유해요인을 자가 진단하는 인체공학 점검표.""",

    "B119": """### [서식 16페이지] 사고 보고 브리핑 프레젠테이션 양식 (Sample Injury Reporting Presentation)
경영진과 안전보건위원회에 사고 조사 결과와 재발 방지 대책을 3분 이내에 보고할 수 있도록 정리된 표준 슬라이드 양식.""",

    "B120": """## 참고문헌 (BIBLIOGRAPHY)

* A step-by-step guide: Incident investigations. (n.d.). Occupational Safety and Health Administration (OSHA).
* Accident analysis report. (n.d.). Ohio Bureau of Workers’ Compensation Division of Safety & Hygiene.
* Activity-based costing for safety management. (2012). Journal of Safety Research.
* ANSI/AIHA/ASSE Z10-2012. Occupational Health and Safety Management Systems.
* Blue's Clues Educational Repetition Theory. (1996). Nickelodeon Research & Development.
* Deming, W. E. (2000). Out of the Crisis. MIT Press.
* Drucker, P. F. (1954). The Practice of Management. Harper & Brothers.
* Ergonomics: How to design for workplace comfort and safety. (2015). NIOSH.
* High Reliability Organizing in Practice. (2014). U.S. Department of Veterans Affairs.
* Incident investigation guidelines for process safety. (2003). Center for Chemical Process Safety (CCPS/AIChE).
* Job Safety Analysis: A Guide for Voluntary Compliance and Beyond. (2016). Elsevier / Butterworth-Heinemann.
* Lean Six Sigma for Safety: Eliminating Waste and Reducing Variation. (2011). Quality Progress.
* Managing Soft Tissue Injuries in the Workplace. (2017). American College of Occupational and Environmental Medicine (ACOEM).
* Montgomery, D. C. (2017). Design and Analysis of Experiments (9th ed.). John Wiley & Sons.
* Preshift Briefings and TBM Implementation Manual. (2015). Associated General Contractors of America (AGC).
* Root Cause Analysis: Improving Performance for Patient Safety. (2015). Joint Commission Resources.
* Roughton, J. E., & Crutchfield, N. (2013). Safety Culture: An Innovative Leadership Approach. Butterworth-Heinemann.
* Return to Work Strategies for Musculoskeletal Disorders. (2016). International Labour Organization (ILO).
* Tool Box Topics and Safety Coaching. (2014). National Safety Council (NSC)."""
}
