// frontend/src/lib/services/raaService.ts
import seedData from "../data/seedData.json";
import {
  AssessmentItem,
  AssessmentSubmission,
  AssessmentResult,
  PillarScore,
  RAAScores,
  LeadershipScores,
  DimensionScores,
} from "../types/assessment";

const DEFAULT_ASSESSMENT_ITEMS = seedData.assessmentItems as AssessmentItem[];

interface PillarMeta {
  id: string;
  name: string;
  short_name: string;
  chapters: string;
  recommended_tab: string;
  recommended_label: string;
  consulting_guide: string;
}

export const TEXTBOOK_PILLARS: PillarMeta[] = [
  {
    id: "D1_CULTURE_BASE",
    name: "1. 문화 기반 & 멘탈 모델",
    short_name: "문화기반·네트워크",
    chapters: "Ch 1·2·3",
    recommended_tab: "ona",
    recommended_label: "ONA 네트워크 분석 (Ch 3) & 기초진단",
    consulting_guide:
      "무손실=무위험 오류(Ch 1), Schein 3수준 사일로 해체(Ch 2), 비공식 오피니언 리더·3단계 영향력 확산망(Ch 3)을 결합해 문화 기반을 재설계합니다.",
  },
  {
    id: "D2_LEADERSHIP_RAA",
    name: "2. 비전·전략 & 리더십·RAA",
    short_name: "비전·리더십·RAA",
    chapters: "Ch 4·7",
    recommended_tab: "checklists",
    recommended_label: "부록 8대 정밀진단 (App 7.2~7.5 · Tab 7.3)",
    consulting_guide:
      "비전·미션 정렬 및 경계 확장(Ch 4)과 계층별 직무책임(App 7.2~7.5), RAA 권한 위임·공정 결과관리(Ch 7)를 연계 처방합니다.",
  },
  {
    id: "D3_INVOLVEMENT",
    name: "3. 직원 참여 & 심리적 안전감",
    short_name: "직원참여·안전감",
    chapters: "Ch 8",
    recommended_tab: "checklists",
    recommended_label: "안전위원회 헌장 정밀진단 (App 8.1)",
    consulting_guide:
      "안전 발언권(Voice) 보장과 안전위원회 헌장(App 8.1) 실질화를 통해 수동적 순응에서 능동적 주인의식으로 전환합니다.",
  },
  {
    id: "D4_RISK_PROCESS",
    name: "4. 위험 지각 & 위험관리 프로세스",
    short_name: "위험지각·8단계관리",
    chapters: "Ch 9·10·11",
    recommended_tab: "risk_workflow",
    recommended_label: "위험관리 8단계 폐쇄 루프 (Ch 9·10)",
    consulting_guide:
      "위험지각 편향 교정(Ch 9.12), 신호등 매트릭스(Tab 9.7), 8단계 폐쇄 루프(Fig 10.2) 및 잔여위험 5단계 환류(Fig 10.1), 현장 JHA(Ch 11)를 적용합니다.",
  },
  {
    id: "D5_CONTROL_TRAINING",
    name: "5. 위험통제·프로세스 & 역량/교육",
    short_name: "통제계층·Mager교육",
    chapters: "Ch 5·6·12·13",
    recommended_tab: "mager_tree",
    recommended_label: "Mager 교육/비교육 의사결정 트리 (Ch 13)",
    consulting_guide:
      "상위 통제 계층 우선 적용(Ch 12), DMAIC 프로세스 개선(Ch 6), 재교육 함정을 피하는 Mager 의사결정 트리(Ch 13)로 원인을 처방합니다.",
  },
  {
    id: "D6_EVAL_SUSTAIN",
    name: "6. SMS 자체평가·데이터 & 지속가능성",
    short_name: "SMS평가·지속가능성",
    chapters: "Ch 14·15·16",
    recommended_tab: "sms_mirror",
    recommended_label: "SMS Mirror 0~3점 자체평가 (Ch 14)",
    consulting_guide:
      "사실 기반 OSHA SHARP 0~3점 평가 및 SMART 액션플랜(Ch 14), 선행지표 데이터(Ch 15), 변화관리 지속가능성(Ch 16)을 통합 추적합니다.",
  },
];

function classifyPillarStatus(score: number): "우수" | "보통" | "취약" {
  if (score >= 4.0) return "우수";
  if (score >= 3.3) return "보통";
  return "취약";
}

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
  const defaultPillarScores: PillarScore[] = [
    { ...TEXTBOOK_PILLARS[0], score: 3.7, score_100: 74, status: "보통" },
    { ...TEXTBOOK_PILLARS[1], score: 3.6, score_100: 72, status: "보통" },
    { ...TEXTBOOK_PILLARS[2], score: 3.4, score_100: 68, status: "보통" },
    { ...TEXTBOOK_PILLARS[3], score: 3.1, score_100: 62, status: "취약" },
    { ...TEXTBOOK_PILLARS[4], score: 3.2, score_100: 64, status: "취약" },
    { ...TEXTBOOK_PILLARS[5], score: 3.5, score_100: 70, status: "보통" },
  ];

  const overallIndex =
    Math.round(
      (defaultPillarScores.reduce((acc, p) => acc + p.score_100, 0) / defaultPillarScores.length) * 10
    ) / 10;

  return {
    respondent_count: 12,
    overall_index: overallIndex,
    pillar_scores: defaultPillarScores,
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
        "비전·미션 정렬 (Ch 4)": 3.8,
        "RAA 책임 (Ch 7)": 4.1,
        "RAA 권한 위임 (Ch 7)": 3.2,
        "RAA 책무성·결과 (Ch 7)": 3.9,
        "윤리적 나침반 (Ch 7)": 4.0,
        "심리적 안전감 (Ch 8)": 3.4,
        "DMAIC 프로세스 (Ch 6)": 3.3,
        "지속가능 통합 (Ch 16)": 3.5,
      },
      average_score: 3.65,
      strongest_attribute: "RAA 책임 (Ch 7 - 4.1점)",
      weakest_attribute: "RAA 권한 위임 (Ch 7 - 3.2점)",
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
      "Ch 1~16 6대 영역 종합 안전문화 지수는 68.3점으로, '4. 위험 지각 & 위험관리 프로세스(62점)'와 '5. 위험통제 & 역량/교육(64점)' 보완이 최우선입니다.",
      "세부 RAA 삼원조(Ch 7) 기준 책임(4.1점) 대비 권한 위임(3.2점)이 취약한 '권한 결여형' 패턴이 나타납니다.",
      "Ch 9·10 잔여위험 환류 루프와 Ch 13 Mager 교육/비교육 원인 분리 처방을 현장에 정착시킬 필요가 있습니다.",
    ],
    consequence_recommendations: [
      "Ch 9·10 위험관리: 5단계 잔여위험 평가 시 허용 불가 위험은 통제 대안 재설계 루프로 즉시 환류하고 위험 지침 카드를 배포하십시오.",
      "Ch 12·13 통제·교육: 직무 결함 시 무조건 재교육(재교육 함정)하기 전에 Mager 의사결정 트리로 환경·장애물 요인을 먼저 제거하십시오.",
      "Ch 14 SMS 자체평가: Appendix 14.1 0~3점 사실 기반 평가 후 0~1점 결함은 SMART 액션플랜으로 전환해 추적 관리하십시오.",
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
      if (!itemScores[ans.item_id]) {
        itemScores[ans.item_id] = [];
      }
      itemScores[ans.item_id].push(ans.score);
    }
  }

  const avgItemScores: Record<string, number> = {};
  for (const item of DEFAULT_ASSESSMENT_ITEMS) {
    const scores = itemScores[item.id];
    avgItemScores[item.id] =
      scores && scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 3.5;
  }

  // 레거시 문항 ID가 들어온 경우도 보조로 반영
  for (const [itemId, scores] of Object.entries(itemScores)) {
    if (avgItemScores[itemId] === undefined && scores.length > 0) {
      avgItemScores[itemId] = scores.reduce((a, b) => a + b, 0) / scores.length;
    }
  }

  // 6대 영역(Ch 1~16) 점수 산출 (26문항 전부 반영)
  const pillarScores: PillarScore[] = TEXTBOOK_PILLARS.map((pillar) => {
    const pillarItems = DEFAULT_ASSESSMENT_ITEMS.filter((i) => i.pillar_id === pillar.id);
    const mean =
      pillarItems.length > 0
        ? pillarItems.reduce((sum, i) => sum + (avgItemScores[i.id] ?? 3.5), 0) / pillarItems.length
        : 3.5;
    const rounded = Math.round(mean * 100) / 100;
    const score100 = Math.round((rounded / 5.0) * 1000) / 10;
    return {
      ...pillar,
      score: rounded,
      score_100: score100,
      status: classifyPillarStatus(rounded),
    };
  });

  const overallIndex =
    Math.round((pillarScores.reduce((acc, p) => acc + p.score_100, 0) / pillarScores.length) * 10) / 10;

  // Ch 7 RAA 세부 지표 산출 (신규 3문항 우선, 레거시 문항이 응답된 경우 함께 반영)
  const collectScore = (ids: string[], fallback: number): number => {
    const answered = ids.flatMap((id) => itemScores[id] || []);
    if (answered.length > 0) {
      return answered.reduce((a, b) => a + b, 0) / answered.length;
    }
    return avgItemScores[ids[0]] ?? fallback;
  };

  const respAvg = collectScore(["RAA_RESP_1", "RAA_RESP_2", "RAA_RESP_3"], 3.8);
  const authAvg = collectScore(["RAA_AUTH_1", "RAA_AUTH_2", "RAA_AUTH_3"], 3.2);
  const acctAvg = collectScore(["RAA_ACCT_1", "RAA_ACCT_2", "RAA_ACCT_3"], 3.8);

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

  // 리더십·거버넌스 세부 지표 (기존 차트 호환 유지 + Ch 1~16 반영)
  const leadDict: Record<string, number> = {
    "비전·정렬 (Ch 4)": Math.round((avgItemScores["LEAD_ALIGN_1"] ?? avgItemScores["LEAD_EXP_1"] ?? 3.5) * 100) / 100,
    "RAA 책임 (Ch 7)": raaScores.responsibility,
    "RAA 권한 (Ch 7)": raaScores.authority,
    "RAA 책무성 (Ch 7)": raaScores.accountability,
    "윤리·소통 (Ch 7)": Math.round((avgItemScores["LEAD_ETHICS_2"] ?? avgItemScores["LEAD_EXP_2"] ?? 3.5) * 100) / 100,
    "심리안전감 (Ch 8)": Math.round((avgItemScores["INV_PS_1"] ?? avgItemScores["PS_1"] ?? 3.5) * 100) / 100,
    "DMAIC 개선 (Ch 6)": Math.round((avgItemScores["CTRL_PROC_2"] ?? avgItemScores["PROC_1"] ?? 3.5) * 100) / 100,
    "지속가능성 (Ch 16)": Math.round((avgItemScores["EVAL_SUST_4"] ?? avgItemScores["LEAD_EXP_7"] ?? 3.5) * 100) / 100,
  };

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

  const percAvg = collectScore(["CULT_MENTAL_1", "CULT_BRAND_2", "PERC_1", "PERC_2"], 3.6);
  const psAvg = collectScore(["INV_PS_1", "INV_SUGG_3", "PS_1", "PS_2"], 3.5);

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

  // 취약 영역 기준 동적 발견점 및 컨설팅 처방 생성
  const sortedPillars = [...pillarScores].sort((a, b) => a.score - b.score);
  const weakestPillar = sortedPillars[0];
  const secondWeakestPillar = sortedPillars[1];
  const strongestPillar = sortedPillars[sortedPillars.length - 1];

  const keyFindings = [
    `Ch 1~16 6대 영역 종합 지수는 ${overallIndex}점(100점 만점)이며, 최우수 영역은 '${strongestPillar.name}(${strongestPillar.score_100}점)'입니다.`,
    `가장 취약한 영역은 '${weakestPillar.name}(${weakestPillar.chapters}, ${weakestPillar.score_100}점)' 및 '${secondWeakestPillar.name}(${secondWeakestPillar.chapters}, ${secondWeakestPillar.score_100}점)'으로 심층 진단·개선이 우선 요구됩니다.`,
    `2번 영역 하위 Ch 7 RAA 삼원조 균형 지수는 ${balanceIndex}점('${status}')이며, 현장의 안전 발언권(Ch 8) 점수는 5점 만점 중 ${dimensionScores.psychological_safety}점입니다.`,
  ];

  const consequenceRecs = [
    `[${weakestPillar.chapters} 우선 처방] ${weakestPillar.consulting_guide}`,
    `[${secondWeakestPillar.chapters} 연계 처방] ${secondWeakestPillar.consulting_guide}`,
    `[Ch 7 결과관리 & Ch 14 추적] 처벌 위주 사후 통제를 지양하고 긍정적 결과관리(Positive Consequences)와 SMART 액션플랜으로 결함 완료까지 추적하십시오.`,
  ];

  return {
    respondent_count: submissions.length,
    overall_index: overallIndex,
    pillar_scores: pillarScores,
    raa_scores: raaScores,
    leadership_scores: leadershipScores,
    dimension_scores: dimensionScores,
    key_findings: keyFindings,
    consequence_recommendations: consequenceRecs,
  };
}
