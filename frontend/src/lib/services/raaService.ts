// frontend/src/lib/services/raaService.ts
import seedData from "../data/seedData.json";
import {
  AssessmentItem,
  AssessmentSubmission,
  AssessmentResult,
  RAAScores,
  LeadershipScores,
  DimensionScores,
} from "../types/assessment";

const DEFAULT_ASSESSMENT_ITEMS = seedData.assessmentItems as AssessmentItem[];

function diagnoseRaaPattern(resp: number, auth: number, acct: number): [string, string] {
  if (auth < resp - 0.5 && auth < acct - 0.5) {
    return [
      "권한 결여형 (Authority Deficit)",
      "현장 실무진에게 법적·절차적 책임과 이행 의무는 과중하게 부과되나, 이를 해결할 실질적 의사결정 권한과 예산이 위임되지 않아 무력감과 피로도가 누적되는 상태입니다.",
    ];
  } else if (resp < acct - 0.5) {
    return [
      "책임 전가형 (Blame Culture)",
      "사고나 문제 발생 시 최고위층이 궁극적 책임을 지기보다는 현장 작업자의 휴먼 에러(인적 오류)나 부주의로 책임을 전가하는 취약한 안전문화 패턴입니다.",
    ];
  } else if (acct < auth - 0.5 || acct < resp - 0.5) {
    return [
      "책무성 실종형 (Accountability Vacuum)",
      "권한은 부여되어 있으나 명확한 안전 성과 결과관리(Consequence Management)와 이행 점검 피드백이 없어 안전 수칙 준수가 느슨해지는 상태입니다.",
    ];
  } else {
    return [
      "삼원조 균형형 (High-Performing Triad)",
      "책임, 권한, 책무성이 조화롭게 맞물려 리더십의 솔선수범과 현장의 자율적 안전 실천이 선순환을 이루고 있는 바람직한 상태입니다.",
    ];
  }
}

export function generateBenchmarkResult(): AssessmentResult {
  return {
    respondent_count: 12,
    raa_scores: {
      responsibility: 4.1,
      authority: 3.2,
      accountability: 3.9,
      balance_index: 76.5,
      diagnosis_status: "권한 결여형 (Authority Deficit)",
      status_description:
        "현장 실무진에게 직무 이행 의무는 크나, 실질적인 위험 개선 권한(작업중지권 등)의 위임이 부족하여 권한-책임 불균형이 감지됩니다.",
    },
    leadership_scores: {
      item_scores: {
        "기대치 1 (비전/변화)": 4.0,
        "기대치 2 (윤리 나침반)": 4.2,
        "기대치 3 (학습/적응)": 3.6,
        "기대치 4 (위험/기회 균형)": 3.8,
        "기대치 5 (고성과 팀)": 3.5,
        "기대치 6 (권한위임/리스크)": 2.9,
        "기대치 7 (차세대 리더육성)": 3.3,
        "기대치 8 (전방위 소통)": 3.4,
      },
      average_score: 3.59,
      strongest_attribute: "기대치 2 (윤리 나침반 - 4.2점)",
      weakest_attribute: "기대치 6 (권한위임/리스크 감수 - 2.9점)",
    },
    dimension_scores: {
      perception_of_safety: 3.85,
      psychological_safety: 3.35,
      manager_vs_leader: {
        "관리자 성향(규정·통제)": 62.0,
        "리더십 성향(비전·영감)": 38.0,
      },
    },
    key_findings: [
      "책임(4.1점) 및 책무성(3.9점) 대비 권한 위임(3.2점)이 취약하여 '권한 결여형' 병리 현상이 나타남.",
      "미 육군 FM 6-22 8대 기대치 중 리더십의 '권한 위임 및 리스크 감수(2.9점)'가 최하위로 측정됨.",
      "Ch 7 기준 관리자적 통제(62%)가 리더십 비전 제시(38%)보다 우세하여 단기 순응주의에 갇힐 위험이 있음.",
    ],
    consequence_recommendations: [
      "Ch 7 권한 위임(Delegation)의 제도화: 현장 조장 및 감독자에게 '즉시 위험개선 전결권' 부여",
      "Ch 7 긍정적 결과관리: 안전 지적 위주의 패널티 문화를 개선하고 '선제적 위험제보 인정 프로그램' 도입",
      "Ch 8 안전 발언권(Voice) 보장: 무문책 작업중지제 운영으로 심리적 안전감 제고",
    ],
  };
}

export function calculateAssessmentResult(submissions: AssessmentSubmission[]): AssessmentResult {
  if (!submissions || submissions.length === 0) {
    return generateBenchmarkResult();
  }

  const itemScores: Record<string, number[]> = {};
  for (const item of DEFAULT_ASSESSMENT_ITEMS) {
    itemScores[item.id] = [];
  }

  for (const sub of submissions) {
    for (const ans of sub.answers) {
      if (itemScores[ans.item_id]) {
        itemScores[ans.item_id].push(ans.score);
      }
    }
  }

  const avgItemScores: Record<string, number> = {};
  for (const item of DEFAULT_ASSESSMENT_ITEMS) {
    const scores = itemScores[item.id];
    avgItemScores[item.id] =
      scores && scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 3.5;
  }

  const respItems = ["RAA_RESP_1", "RAA_RESP_2", "RAA_RESP_3"];
  const authItems = ["RAA_AUTH_1", "RAA_AUTH_2", "RAA_AUTH_3"];
  const acctItems = ["RAA_ACCT_1", "RAA_ACCT_2", "RAA_ACCT_3"];

  const respAvg = respItems.reduce((acc, i) => acc + (avgItemScores[i] ?? 3.8), 0) / respItems.length;
  const authAvg = authItems.reduce((acc, i) => acc + (avgItemScores[i] ?? 3.1), 0) / authItems.length;
  const acctAvg = acctItems.reduce((acc, i) => acc + (avgItemScores[i] ?? 4.0), 0) / acctItems.length;

  const meanVal = (respAvg + authAvg + acctAvg) / 3.0;
  const variance =
    (Math.pow(respAvg - meanVal, 2) + Math.pow(authAvg - meanVal, 2) + Math.pow(acctAvg - meanVal, 2)) / 3.0;
  const stdDev = Math.sqrt(variance);
  const balanceIndex = Math.max(10.0, Math.min(100.0, Math.round((100.0 - stdDev * 50.0) * 10) / 10));

  const [status, desc] = diagnoseRaaPattern(respAvg, authAvg, acctAvg);

  const raaScores: RAAScores = {
    responsibility: Math.round(respAvg * 100) / 100,
    authority: Math.round(authAvg * 100) / 100,
    accountability: Math.round(acctAvg * 100) / 100,
    balance_index: balanceIndex,
    diagnosis_status: status,
    status_description: desc,
  };

  const leadDict: Record<string, number> = {};
  for (let i = 1; i <= 8; i++) {
    const key = `LEAD_EXP_${i}`;
    leadDict[`기대치 ${i}`] = Math.round((avgItemScores[key] ?? 3.7) * 100) / 100;
  }

  const leadValues = Object.values(leadDict);
  const avgLead = leadValues.reduce((a, b) => a + b, 0) / leadValues.length;
  const sortedLead = Object.entries(leadDict).sort((a, b) => b[1] - a[1]);
  const strongest = `${sortedLead[0][0]} (${sortedLead[0][1]}점)`;
  const weakest = `${sortedLead[sortedLead.length - 1][0]} (${sortedLead[sortedLead.length - 1][1]}점)`;

  const leadershipScores: LeadershipScores = {
    item_scores: leadDict,
    average_score: Math.round(avgLead * 100) / 100,
    strongest_attribute: strongest,
    weakest_attribute: weakest,
  };

  const percAvg = ((avgItemScores["PERC_1"] ?? 3.8) + (avgItemScores["PERC_2"] ?? 3.6)) / 2.0;
  const psAvg = ((avgItemScores["PS_1"] ?? 3.4) + (avgItemScores["PS_2"] ?? 3.6)) / 2.0;

  const managerRatio = Math.round(Math.min(80.0, Math.max(20.0, 50.0 + (authAvg - respAvg) * 15.0)) * 10) / 10;
  const leaderRatio = Math.round((100.0 - managerRatio) * 10) / 10;

  const dimensionScores: DimensionScores = {
    perception_of_safety: Math.round(percAvg * 100) / 100,
    psychological_safety: Math.round(psAvg * 100) / 100,
    manager_vs_leader: {
      "관리자 성향(규정·통제)": managerRatio,
      "리더십 성향(비전·영감)": leaderRatio,
    },
  };

  const keyFindings = [
    `조직의 RAA 삼원조 균형 지수는 ${balanceIndex}점으로, '${status}' 패턴을 보입니다.`,
    `8대 리더십 기대치 중 최우수 항목은 '${strongest}'이며, 가장 개선이 시급한 영역은 '${weakest}'입니다.`,
    `심리적 안전감(Psychological Safety) 점수는 5점 만점 중 ${Math.round(psAvg * 100) / 100}점으로 현장의 자유로운 발언 문화 조성이 필요합니다.`,
  ];

  const consequenceRecs = [
    "처벌 중심의 사후 관리에서 탈피하여 안전 행동(JHA 참여, 선제적 위험보고)에 대한 즉각적 인정과 긍정적 결과(Positive Consequences) 체계 신설",
    "현장 관리감독자에게 실질적 안전 작업중지권(Stop-Work Authority) 및 위험 제거 예산 집행 권한 하향 위임(Delegation)",
    "경영진의 솔선수범 현장 안전 라운딩을 통한 상호 신뢰(Trust) 회복 및 다계층 소통 정례화",
  ];

  return {
    respondent_count: submissions.length,
    raa_scores: raaScores,
    leadership_scores: leadershipScores,
    dimension_scores: dimensionScores,
    key_findings: keyFindings,
    consequence_recommendations: consequenceRecs,
  };
}
