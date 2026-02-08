// ============================================================
// ケアガイド（もしもナビ統合版）- データモデル定義
// ============================================================

// --- 診断関連 ---

export type OnsetType = "sudden" | "gradual";

export type SuddenSituation =
  | "acute_hospital"
  | "rehab_hospital"
  | "home_after_discharge"
  | "facility_after_discharge"
  | "no_hospitalization";

export type GradualSituation =
  | "not_visited"
  | "visited_no_insurance"
  | "home_care_with_insurance";

export type Situation = SuddenSituation | GradualSituation;

export type Phase =
  | "acute"
  | "rehab"
  | "discharge_prep"
  | "post_discharge"
  | "discovery"
  | "medical_visit"
  | "prevention"
  | "home_care";

export interface MinimalDiagnosis {
  id: string;
  onsetType: OnsetType;
  situation: Situation;
  phase: Phase;
  createdAt: string;
}

// 詳細診断
export type CareLevel =
  | "not_applied"
  | "applying"
  | "support_1"
  | "support_2"
  | "care_1"
  | "care_2"
  | "care_3"
  | "care_4"
  | "care_5";

export type MedicalDependency = "none" | "outpatient" | "medical_procedures";
export type DementiaLevel = "none" | "mild" | "moderate" | "severe";
export type EmploymentStatus = "fulltime" | "parttime" | "unemployed" | "self_employed";
export type LivingArrangement = "alone" | "spouse_only" | "with_children" | "other_family";
export type HousingType = "owned_house" | "owned_apartment" | "rental" | "cohabitation";
export type FinancialConcern = "none" | "slight" | "significant";
export type PostDischargePreference = "home" | "facility" | "undecided";
export type DisabilityCard = "none" | "yes" | "unknown";
export type ContactedOffice = "yes" | "no" | "unknown";

export interface DetailedDiagnosisInput {
  careLevel?: CareLevel;
  medicalDependency?: MedicalDependency;
  dementiaLevel?: DementiaLevel;
  employmentStatus?: EmploymentStatus;
  livingArrangement?: LivingArrangement;
  housingType?: HousingType;
  financialConcern?: FinancialConcern;
  postDischargePreference?: PostDischargePreference;
  disabilityCard?: DisabilityCard;
  contactedOffice?: ContactedOffice;
}

export interface DetailedDiagnosis extends DetailedDiagnosisInput {
  id: string;
  minimalDiagnosisId: string;
  completedSteps: number; // 1, 2, or 3
  createdAt: string;
}

// --- タスク関連 ---

export type TaskStatus = "todo" | "done";
export type TaskSource = "minimal" | "detailed" | "manual";
export type TaskPriority = "high" | "normal";
export type MergeAction = "enrich" | "replace" | "split";

export type TaskDeadline =
  | "immediate"
  | "within_24h"
  | "within_48h"
  | "within_72h"
  | "within_1week"
  | "within_2weeks"
  | "within_1month"
  | "ongoing";

// もしもナビA〜Eカテゴリ
export type MoshimoNaviCategory =
  | "A_medical"     // A: 医師・看護師の話を聞く
  | "B_family"      // B: 家族で話し合う
  | "C_home"        // C: 自宅の場合 介護体制構築
  | "D_facility"    // D: 施設の場合 施設探し
  | "E_work";       // E: 仕事・職場との調整

export interface TaskMergeHistory {
  action: MergeAction;
  sourceTaskId: string;
  mergedAt: string;
}

export interface Task {
  taskId: string;
  title: string;
  description: string;
  status: TaskStatus;
  source: TaskSource;
  priority: TaskPriority;
  deadline: TaskDeadline;
  parentTaskId: string | null;
  phase: Phase; // タスクが属するフェーズ
  // もしもナビA〜Eカテゴリ（スライド画像の構造に対応）
  moshimoNaviCategory?: MoshimoNaviCategory;
  documents?: string[];
  contactOffice?: string;
  templateLinks?: string[];
  relatedServiceCategory?: ServiceCategory;
  archivedAt?: string;
  mergedFrom?: TaskMergeHistory;
  createdAt: string;
  updatedAt: string;
}

// --- プラン関連 ---

export type PlanVersion = "minimal" | "detailed";

export type ServiceCategory =
  | "care_insurance"
  | "medical"
  | "municipal"
  | "private"
  | "financial"
  | "disability";

export interface ServiceEligibility {
  category: ServiceCategory;
  serviceName: string;
  isLikelyEligible: boolean;
  linkedTaskId?: string;
  description: string;
}

export interface FlowStep {
  stepId: string;
  label: string;
  description: string;
  isCurrent: boolean;
  order: number;
}

export interface Plan {
  planId: string;
  version: PlanVersion;
  minimalDiagnosisId: string;
  detailedDiagnosisId?: string;
  phase: Phase;
  phaseLabelJa: string;
  conclusionSummary: string;
  firstContact: string;
  tasks: Task[];
  archivedTasks: Task[];
  flowSteps: FlowStep[];
  serviceEligibilities?: ServiceEligibility[];
  createdAt: string;
  updatedAt: string;
}

// --- UI用ラベルマッピング ---

export const ONSET_TYPE_LABELS: Record<OnsetType, string> = {
  sudden: "突然の発症",
  gradual: "ゆるやかな変化",
};

export const PHASE_LABELS: Record<Phase, string> = {
  acute: "急性期病院（入院0〜2週間）",
  rehab: "リハビリ病院（2週間〜3ヶ月）",
  discharge_prep: "退院準備（退院2〜4週前）",
  post_discharge: "退院後（在宅/施設）",
  discovery: "病気の発見・気づき",
  medical_visit: "受診・検査",
  prevention: "介護予防・申請準備",
  home_care: "在宅介護",
};

export const DEADLINE_LABELS: Record<TaskDeadline, string> = {
  immediate: "即時",
  within_24h: "24時間以内",
  within_48h: "48時間以内",
  within_72h: "72時間以内",
  within_1week: "1週間以内",
  within_2weeks: "2週間以内",
  within_1month: "1ヶ月以内",
  ongoing: "継続",
};

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  care_insurance: "介護保険",
  medical: "医療",
  municipal: "自治体独自",
  private: "民間サービス",
  financial: "経済的支援",
  disability: "障害福祉",
};

export const MOSHIMO_NAVI_CATEGORY_LABELS: Record<MoshimoNaviCategory, string> = {
  A_medical: "A: 医師・看護師の話を聞く",
  B_family: "B: 家族で話し合う",
  C_home: "C: 自宅の場合 介護体制構築",
  D_facility: "D: 施設の場合 施設探し",
  E_work: "E: 仕事・職場との調整",
};
