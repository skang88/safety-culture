# 🛡️ SafePulse 360
### 조직 안전문화 & 리더십 다면진단 · 실행 워크플로우 · 컨설팅 풀스택 플랫폼

> **기반 교재**: James E. Roughton, Nathan Crutchfield & Michael Waite (2019), *Safety Culture* (Elsevier) **Chapters 1 ~ 16 전 장 완결 반영**  
> **핵심 설계 원칙 (`GEMINI.md` 2-Track)**:  
> 1. **원문 충실성 & 출처 명시**: 교재의 순서도(Flowchart)·기능 차트(Function Chart)·부록 서식을 그대로 플랫폼 워크플로우/대시보드에 구현하고, 모든 화면 상단에 교재 장·그림/표·법령 출처 배지(`TextbookSourceBadge`)를 표기합니다.  
> 2. **연구자 통제권 & 2-Tier 진단 구조**: 1단계(Ch 1~16 6대 축 26문항 빠른 진단)에서 취약 영역을 식별하고, 2단계(부록 8대 정밀진단 + Phase 1~3 교재 가이드 워크플로우 + 실행 컨설팅)로 즉시 연계합니다.

---

## 📂 프로젝트 2-Track 구조

| 트랙 | 경로 | 주요 산출물 |
| :--- | :--- | :--- |
| **Track A. 학술 서브노트** | `subnote/` | Ch 1~16 원문 정리, 영·한 1:1 대조 리더(`chapter1~16_bilingual.html`), 학술 서브노트(`chapter1~16-subnote.md`), 통일된 반응형 HTML 뷰어(`chapter1~16_subnote.html`), 통합 포털 메인(`subnote/index.html`) |
| **Track B. 안전관리 플랫폼** | `frontend/` | **SafePulse 360** — Ch 1~16 6대 축 빠른 진단, 부록 8대 정밀진단 허브, **Phase 1~3 교재 차트 워크플로우**, ONA 네트워크 분석, 생애주기·법령 연계 KPI, 10대 증적 통합 컨설팅 |

---

## 🌟 Track B: SafePulse 360 주요 기능 모듈 (`frontend/`)

### 0. 회사별 온보딩 · 2-Tier 6대 축 빠른 진단 & 종합 진단 보고서 (Ch 1 ~ 16)
* **회사 등록 및 업종 벤치마크 (`OnboardingModal`)**: `제조업`, `건설업`, `화학·석유화학`, `운송·물류`, `공공·소방·방재`, `서비스·기타` 등 업종별 벤치마크 점수 및 핵심 유해위험요인·법령 조문 자동 매핑
* **1단계: Ch 1~16 6대 안전문화 축 빠른 진단 (`AssessmentWizardView.tsx`)**:
  * **전 장 균형 26문항**: ① 문화 기반·멘탈 모델·네트워크(Ch 1·2·3), ② 비전·전략 & 리더십·RAA(Ch 4·7), ③ 직원 참여·심리적 안전감(Ch 8), ④ 위험 지각·8단계 위험관리·JHA(Ch 9·10·11), ⑤ 통제 계층·DMAIC·Mager 교육(Ch 5·6·12·13), ⑥ SMS 자체평가·데이터·지속가능성(Ch 14·15·16)
  * **6대 영역 스텝 네비게이션 & 임시저장**: 상단 Sticky Bar에서 영역별 응답률 확인·점프 및 중간 임시저장 지원
  * **교재 심층 가이드 바로가기**: 빠른 진단과 별도로 부록 8대 정밀진단·위험관리 8단계·Mager 교육 트리·SMS Mirror 평가로 즉시 이동
* **2단계: 종합 진단 보고서 & 심층 처방 보드 (`CompanyReportView.tsx`)**:
  * **Ch 1~16 6대 축 통합 레이더 차트** 및 영역별 등급(`우수 / 보통 / 취약`) 요약 카드
  * **취약 상위 3개 영역 심층 처방 보드**: 점수 하위 영역별 교재 가이드 처방과 해당 심층 워크플로우 원클릭 이동 버튼 제공
  * **Ch 7 RAA 삼원조 심층 분석**: `책임(Responsibility) · 권한(Authority) · 책무성(Accountability)` 불균형(`권한 결여형`, `책임 전가형`, `책무성 실종형`)을 2번 영역 하위 세부 축으로 분석
  * 실행 컨설팅 로드맵 연동 및 리포트 인쇄 / PDF 저장 지원

### 1. 부록 체크리스트 8대 정밀진단 허브 (`ChecklistHubView.tsx`)
* **8대 모듈(Ch 2·7·8·9)**: 최고경영진 직무책임(`App 7.2`), 사업장 총괄 책임(`App 7.3`), 현장 감독관 직무책임(`App 7.4`), 현장 작업자 직무책임(`App 7.5`), 안전문화 기초진단(`App 2.2`), 위험지각 16대 진단(`Ch 9.12`), 책무성 RAA 시스템(`Tab 7.3`), 안전위원회 헌장 진단(`App 8.1`)
* 3대 영역별(계층별 직무책임, 문화기초·위험지각, 책무성·위원회) 방사형 차트 비교 및 모바일 친화적 설문 모달(`ChecklistSurveyModal.tsx`)
* MongoDB 멱등 초기화(`$setOnInsert` `bulkWrite` + 중복 `group_id` 정리) 및 프론트엔드 중복 제거 방어 로직 적용(`checklistService.ts`)

### 2. Phase 1 — 핵심 진단·강화 코어 (Ch 5 · 9 · 10 · 13 · 14)
* **공통 출처·법령 배지 (`TextbookSourceBadge.tsx`)**: 모든 신규·기존 화면 상단에 교재 장·절·그림/표 출처, 연계 KPI, 한국 법령 조문 및 연구자 추가 항목 여부 구분 표기
* **SMS 6대 핵심 요소 통합 대시보드 (`SMSCoreDashboardView.tsx`, Ch 5·14)**: `FIG. 5.3·5.4` & `TABLE 14.1·FIG. 14.2`의 SMS 6대 요소를 누락·병합 없이 레이더 차트로 시각화하고 진단/체크리스트/위험·교육·평가 로컬 데이터를 실시간 통합
* **위험관리 8단계 폐쇄 루프 (`RiskWorkflowView.tsx`, Ch 9·10)**: `FIG. 10.1·10.2·TABLE 10.1` 8단계 워크플로우, `Ch 9 (FIG. 9.2·9.3·TABLE 9.7)` 5×5 매트릭스 & 신호등(Green·Yellow·Red) 등급 평가, 통제 계층 적용, 허용 불가 잔여위험 5단계 환류 루프 및 위험 지침 카드(`localStorage` 영속화)
* **Mager 교육/비교육 의사결정 트리 (`MagerTrainingTreeView.tsx`, Ch 13)**: `FIG. 13.1·13.2` Mager 안전성과 의사결정 트리 분기, `US DOE (2009)` 재교육 함정 경고 및 비훈련(환경·장애물·보상) 대안 처방 기록
* **SMS Mirror 자체평가 & SMART 액션플랜 (`SMSMirrorAssessmentView.tsx`, Ch 14)**: `FIG. 14.1·14.3·TABLE 14.1·Appendix 14.1` OSHA SHARP 0~3점 평가 척도, 사실 기반 증적(관찰·면담·문서) 입력 및 0~1점 결함 대상 SMART 액션플랜 생성

### 3. Phase 2 — 현장 실행 워크플로우 (Ch 6 · 11 · 12)
* **ABSS 교대 활동 트래커 (`ABSSActivityTrackerView.tsx`, Ch 11)**:
  * `FIG. 11.4` 4계층(최고 리더십·중간 관리자·현장 감독자 린치핀·안전 전문가) 표준 주기 매트릭스
  * `Appendix 11.5` 작업 전 브리핑 & 교대 인수인계(Red-Tag 설비 인계 포함), `TABLE 11.1` DOE 소통 방식(Method 1~4, 주입식 대본 경고 및 Method 4 권장), 4.2절 필수 장애 요인 질문
  * `5.4절` 다기능 후속조치팀 작업의뢰서 및 **최초 위험 제기 근로자 본인 확인 서명(Sign-off) 필수 종결제**
* **JHA 4열 빌더 & HPI 오류전조 진단 (`JHAHPIBuilderView.tsx`, Ch 12)**:
  * `FIG. 12.3` JHA(돌발·급성) vs JSA(만성·누적), `4.2절` Parent-Child JHA 구조, `10.2절` 라스무센 SRK(숙련/규칙/지식 기반) 오류 메커니즘·통제 전략 매핑
  * `Appendix 12.1·12.2` JHA 4열 표준 워크시트(작업 단계 · 잠재 위험 · 계층적 통제 · `RA→NR` 위험도) 동적 편집기 및 타이어 교체 예시 로더
  * `TABLE 12.10·12.11` HPI 4대 인간 오류 전조 요건(과업 요구조건·개인 역량·작업 환경·인간 본성) 진단, 능동 오류 vs 잠재 조건 경보 및 HPI 3대 도구(`FIG. 12.6~12.8`) 자동 처방
* **PDCA / DMAIC 개선 & 시정조치 보드 (`PDCADMAICBoardView.tsx`, Ch 6)**:
  * `FIG. 6.2·6.3·6.4` 데밍 PDCA ↔ 식스시그마 DMAIC 5단계(`Define → Measure → Analyze → Improve → Control`) 파이프라인
  * `FIG. 6.1 Check in the Box` & `5절 Cons`(통조림식·서류 폭탄·수동적 안주) 배제를 위한 **현장 실질 개선 검증 게이트** 적용
  * `FIG. 6.8` 4M 특성요인도(`Man/Machine/Material/Method`) 분포 막대 차트 및 `FIG. 6.5·6.6` 파레토 80/20 고위험 태깅

### 4. Phase 3 — 지식 큐레이션 & 콘텐츠 전략 (Ch 15 · 16)
* **SMS 안전지식 큐레이션 & 7대 품질·보존연한 검증기 (`KnowledgeCurationView.tsx`, Ch 15)**:
  * `FIG. 15.4` 문헌 연구 폐쇄 순환 루프(3대 수집 트랙 & `Electronic?` 전자/인쇄 분기)
  * `Curry & O'Riáin (2010)` 7대 데이터 품질 차원(`7/7` 완전 검증 체크리스트), `OBSERVATION 1` 부서 간 명명법 정렬, 5S 정돈, `산안법 제164조`(2·3년) / `중처법 시행령 제13조`(5년) / 10년·영구 법정 보존연한 관리 및 검색형 지식 라이브러리
* **안전 콘텐츠 IPO (RSS) 허브 & 출처 검증 게이트 (`ContentIPOHubView.tsx`, Ch 16)**:
  * `FIG. 16.2` Feedly IPO 파이프라인(Input → Process → Output) & `TABLE 16.3` 공인 안전 RSS 피드(OSHA·NIOSH·EPA·CDC 등) 구독 관리
  * `FIG. 16.1` `Proper Reference?` 인용 검증 게이트, `5.1절 Note` **위키피디아 인용 자동 반려**, 4대 큐레이션 역할·페르소나·부족 지식(Tribal Knowledge) 공식화 및 `TABLE 16.1` 구글 정밀 검색 단축어 참조

### 5. 전사 대시보드 · ONA · 생애주기 KPI · 10대 증적 통합 컨설팅
* **전사 대시보드 (`DashboardView.tsx`)**: RAA·부록·KPI 종합 현황 요약
* **조직 네트워크 분석 (`ONAView.tsx`, Ch 3)**: D3.js 기반 3단계 영향력(`Three Degrees of Influence`) 그래프, 오피니언 리더·소통 브릿지·고립 노드 탐색
* **생애주기·법령 매핑 KPI 빌더 (`KPIView.tsx`)**: `예방-대비-대응-복구` 단계화, `산안법·중처법` 조문 단위 매핑, 고유(70%) / 협업(30%) 가중치 관리
* **실행 컨설팅 로드맵 (`ConsultingView.tsx`, Ch 7·14·전 영역)**: Ch 1~16 6대 축 실측 결과 + 부록 8대 정밀진단 + Phase 1·2·3 로컬 실행 증적 **10대 통합 현황 카드** 실시간 집계, 취약 영역 우선 처방, 공정 결과관리 프레임워크 및 30-90-180일 실행 로드맵 제공

---

## 🛠️ 기술 스택 (Tech Stack)

* **Architecture**: Next.js Fullstack Serverless on Vercel
* **Frontend**: Next.js 16 (App Router, React 19, Webpack build) + TypeScript + Tailwind CSS v4
  * **차트 및 시각화**: Recharts (Radar / Bar Charts), D3.js (Force-Directed Graph)
  * **아이콘**: Lucide React
* **Backend API**: Next.js Route Handlers (`src/app/api/...`)
  * **인증**: Jose (JWT), Bcrypt.js
* **Database & Client Persistence**: MongoDB Atlas (`sessions`, `users`, `checklists`, `kpis`, `ona`) + 브라우저 `localStorage` 워크플로우 영속 저장
* **Hosting**: Vercel

---

## 🚀 로컬 개발 및 실행

### 1. 환경변수 설정
`frontend/.env.local` 파일을 생성하고 아래 설정을 입력합니다:
```bash
# frontend/.env.local
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.cf30dla.mongodb.net/safepulse?retryWrites=true&w=majority&appName=Cluster0
DB_NAME=safepulse
JWT_SECRET=your_jwt_secret_key
```

### 2. 로컬 개발 서버 실행 및 프로덕션 빌드 검증
```bash
cd frontend
npm install
npm run dev      # http://localhost:3000
npm run build    # TypeScript 및 Next.js 프로덕션 빌드 검증
```

---

## ☁️ Vercel 프로덕션 배포

1. [Vercel](https://vercel.com)에서 GitHub 저장소 연동
2. **Root Directory**: `frontend` 설정
3. **Environment Variables** 등록:
   * `MONGODB_URI`: MongoDB Atlas 연결 문자열
   * `DB_NAME`: 데이터베이스명 (`safepulse`)
   * `JWT_SECRET`: JWT 서명 시크릿 키
4. 배포 완료 시 Vercel 도메인으로 즉시 무중단 서비스 가동
