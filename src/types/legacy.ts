// ============================================================
// 既存ケアガイド診断システムの型定義（legacy types）
// ============================================================

// --- 質問定義 ---

export interface Question {
  id: string;
  text: string;
  type: "single" | "multiple";
  options: string[];
  maxSelect?: number;
  hint?: string;
}

export interface QuestionTemplate {
  blockA: { title: string; text: string };
  blockB: { title: string; text: string };
  blockC: { title: string; text: string };
}

// --- 診断回答 ---

export interface DiagnosisAnswers {
  q1_target: string;
  q2_age: string;
  q2b_specific_disease?: string;
  q3_status: string;
  q4_trouble: string[];
  q5_support_level: string;
  q6_traits: string[];
  q7_public_service: string;
  q8_work_status: string;
  q9_support_structure: string;
  q10_finance: string;
}

// --- 診断結果 ---

export type AreaName =
  | "障害福祉サービス"
  | "介護保険サービス"
  | "医療保険サービス"
  | "自治体独自のサービス"
  | "経済的支援制度"
  | "民間サービス";

export type InvolvementLevel = "high" | "medium" | "low";

export interface RelifePlanSummary {
  life: string;
  housing: string;
  work: string;
  money: string;
}

export interface NextStepGuide {
  step1: { title: string; desc: string; button: string };
  step2: { title: string; desc: string; button: string };
  step3: { title: string; desc: string; button: string };
}

export interface TodoItem {
  id: string;
  text: string;
  assignedTo: string;
  condition?: string;
}

export interface ContactWindow {
  name: string;
  description: string;
  templateKey: string;
  role: string;
  checkPoints: string[];
}

export interface CandidateService {
  id: string;
  name: string;
  area: AreaName;
  summary: string;
  tags: string[];
  condition: string;
  nextAction: string;
  actionTemplate?: string;
  details: {
    reason: string;
    check: string[];
    documents: string[];
    attention: string;
  };
}

export interface RiskItem {
  title: string;
  reason: string;
  prevention: string;
}

export interface FamilyPoint {
  title: string;
  draft: string;
  material: string;
}

export interface AssessmentResult {
  shortSummary: string;
  planSummary: RelifePlanSummary;
  areaInvolvement: Record<AreaName, InvolvementLevel>;
  nextSteps: NextStepGuide;
  topTodos: TodoItem[];
  contactWindows: ContactWindow[];
  candidates: CandidateService[];
  twoWeekTasks: TodoItem[];
  risks: RiskItem[];
  familyPoints: FamilyPoint[];
}

// --- 将来備え診断 ---

export interface PreparednessAnswers {
  p_target: string;
  parent_age: string;
  parent_living: string;
  parent_lastSeen: string;
  q_info_doctor: string;
  q_info_meds: string;
  q_info_cards_location: string;
  q_info_support_contact: string;
  q_safe_fall_prevention: string;
  q_safe_heatshock_prevention: string;
  q_safe_outing_prevention: string;
  q_safe_found_quickly: string;
  q_cap_weekday_available: string;
  q_cap_helpers_exist: string;
  q_cap_roles_defined: string;
  q_cap_conflict_risk: string;
  q_money_policy: string;
  q_money_bills_and_accounts: string;
  q_money_advance_rule: string;
  q_money_docs_place: string;
  q_axis_priority: string;
}

export interface PreparednessRisk {
  id: string;
  title: string;
  severity: number;
  description: {
    summary: string;
    detailBullets: string[];
  };
  discussionPoints: string[];
  recommendedCards: string[];
  resultCtaHint: string;
}

export interface PreparednessCard {
  cardId: string;
  title: string;
  badge: string;
  why: string;
  checkPoints: string[];
}

export interface PreparednessResult {
  summary: string;
  risks: PreparednessRisk[];
  cards: PreparednessCard[];
  finalNextAction: string;
}
