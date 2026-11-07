// frontend/src/lib/data/industryMetadata.ts

export interface IndustryInfo {
  label: string;
  benchmark_score: number;
  key_hazards: string[];
  statutory_focus: string;
  special_advice: string;
}

export const INDUSTRY_METADATA: Record<string, IndustryInfo> = {
  manufacturing: {
    label: "제조업 (Manufacturing)",
    benchmark_score: 75.3,
    key_hazards: ["끼임·협착(Conveyor/Press)", "기계 정비 중 오가동(LOTO)", "화물 운반 지게차 충돌"],
    statutory_focus: "산안법 제38조(안전조치: 기계·기구) 및 제36조(위험성평가 고시)",
    special_advice: "생산 압박 속에서 작업 속도를 위해 인터록을 해제하거나 편법(지름길)을 쓰는 관행을 근절하고 관리감독자의 솔선수범이 필수적입니다.",
  },
  construction: {
    label: "건설업 (Construction)",
    benchmark_score: 71.4,
    key_hazards: ["고소작업 추락(Fall from height)", "가설구조물 붕괴", "중장비 협착 및 낙하물 타격"],
    statutory_focus: "중처법 제4조(안전보건관리체계) 및 산안법 제64조(도급인 의무)",
    special_advice: "다단계 하도급 및 일용직 근로자의 잦은 교체 환경이므로, 매일 작업 시작 전 TBM과 현장 작업중지권(Stop-Work Authority)의 실질적 행사가 생명을 좌우합니다.",
  },
  chemical: {
    label: "화학·석유화학 (Chemical & Energy)",
    benchmark_score: 81.2,
    key_hazards: ["유독물질 누출", "화재·폭발(Fire & Explosion)", "밀폐공간 질식(Confined Space)"],
    statutory_focus: "산안법 제44조(공정안전보고서 PSM) 및 중처법 위험물 관리",
    special_advice: "공정안전관리(PSM) 절차 준수와 더불어 아차사고(Near-miss)와 미세 누출 징후에 대한 자발적 보고를 장려하는 심리적 안전감이 핵심입니다.",
  },
  logistics: {
    label: "운송·물류 (Logistics & Transport)",
    benchmark_score: 73.0,
    key_hazards: ["물류창고 지게차·보행자 충돌", "중량물 취급 근골격계 질환", "야간·교대근무 졸음 및 과로"],
    statutory_focus: "산안법 제39조(보건조치) 및 배송·상하차 근로자 보호 지침",
    special_advice: "정시 배송 압박과 과로 리스크를 완화하고, 상하차 현장의 스마트 동선 분리 및 관리자의 정서적 라포 형성이 필요합니다.",
  },
  public_safety: {
    label: "공공·소방·방재 (Public Safety & Emergency)",
    benchmark_score: 78.5,
    key_hazards: ["재난 현장 급박 위험 및 붕괴", "외상 후 스트레스(PTSD)", "현장 지휘체계 혼선"],
    statutory_focus: "재난 및 안전관리 기본법, 소방공무원 보건안전 및 복지 기본법",
    special_advice: "상명하복 위계 문화 속에서도 위험 상황 시 하급자가 상관에게 직언할 수 있는 2-Way 커뮤니케이션(Ch 7 표 7.1 #8)이 필수적입니다.",
  },
  service_other: {
    label: "서비스 및 기타 산업 (Services & Others)",
    benchmark_score: 74.0,
    key_hazards: ["전도·미끄러짐", "감정 노동 스트레스", "화재 및 피난 통로 장애"],
    statutory_focus: "산업안전보건법 일반 예방 기준 및 고객응대근로자 보호조치",
    special_advice: "사고 빈도가 낮다고 방심하는 '무손실=무위험' 멘탈 모델을 탈피하고 일상적 안전 의식을 내재화해야 합니다.",
  },
};
