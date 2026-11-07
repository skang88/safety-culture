// frontend/src/lib/types/models.ts

export interface UserDoc {
  user_id: string;
  email: string;
  password: string;
  name: string;
  company_name: string;
  has_completed_assessment: boolean;
  active_session_id?: string | null;
  created_at: Date;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  company_name: string;
  has_completed_assessment: boolean;
  active_session_id?: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

export interface KPIMetric {
  id: string;
  name: string;
  type: "inherent" | "collaborative";
  lifecycle_stage: "planning" | "prevention" | "preparedness" | "response" | "recovery";
  department: string;
  partner_organization?: string;
  target_value: number;
  current_value: number;
  unit: string;
  weight: number;
  progress_rate?: number;
  statutory_basis: string;
  chapter_reference: string;
  description?: string;
}

export interface KPISummary {
  total_metrics: number;
  inherent_metrics_count: number;
  collaborative_metrics_count: number;
  overall_progress: number;
  inherent_average_progress: number;
  collaborative_average_progress: number;
  stage_distribution: Record<string, number>;
  stage_progress: Record<string, number>;
  metrics: KPIMetric[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  subtext?: string;
  chapter: string;
  page?: string;
  status: "compliant" | "partial" | "non_compliant";
  note?: string;
}

export interface ChecklistGroup {
  group_id: string;
  title: string;
  source_reference: string;
  category: string;
  target_role: string;
  items: ChecklistItem[];
  compliance_rate: number;
}
