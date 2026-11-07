// frontend/src/lib/types/assessment.ts

export interface AssessmentItem {
  id: string;
  dimension: string;
  category: string;
  question: string;
  description?: string;
  target_role?: string;
}

export interface AssessmentAnswer {
  item_id: string;
  score: number;
}

export interface AssessmentSubmission {
  respondent_id: string;
  respondent_name: string;
  department: string;
  role: string;
  answers: AssessmentAnswer[];
}

export interface RAAScores {
  responsibility: number;
  authority: number;
  accountability: number;
  balance_index: number;
  diagnosis_status: string;
  status_description: string;
}

export interface LeadershipScores {
  item_scores: Record<string, number>;
  average_score: number;
  strongest_attribute: string;
  weakest_attribute: string;
}

export interface DimensionScores {
  perception_of_safety: number;
  psychological_safety: number;
  manager_vs_leader: Record<string, number>;
}

export interface AssessmentResult {
  respondent_count: number;
  raa_scores: RAAScores;
  leadership_scores: LeadershipScores;
  dimension_scores: DimensionScores;
  key_findings: string[];
  consequence_recommendations: string[];
}

export interface CompanyProfile {
  company_name: string;
  industry: string;
  company_size: string;
  headcount?: number;
  evaluator_name?: string;
  evaluator_role?: string;
}

export interface AssessmentSessionResponse {
  session_id: string;
  user_id?: string | null;
  company: CompanyProfile;
  current_step: number;
  total_steps: number;
  answers: Record<string, number>;
  progress_percent: number;
  is_completed: boolean;
  industry_benchmark: {
    label: string;
    benchmark_score: number;
    key_hazards: string[];
    statutory_focus: string;
    special_advice: string;
  };
  created_at: string;
  updated_at: string;
  assessment_result?: AssessmentResult | null;
}
