// ============================================================
// 診断ロジック用の定数定義
// ============================================================

import type {
  OnsetType,
  Situation,
  Phase,
  Task,
  TaskDeadline,
  TaskPriority,
  FlowStep,
  ServiceCategory,
} from "@/types";

// --- Q1 選択肢 ---
export const ONSET_OPTIONS: { value: OnsetType; label: string; description: string }[] = [
  {
    value: "sudden",
    label: "突然の発症",
    description: "脳卒中・心筋梗塞・骨折/転倒など",
  },
  {
    value: "gradual",
    label: "ゆるやかな変化",
    description: "認知症・パーキンソン病・老化による衰えなど",
  },
];

// --- Q2 選択肢（型別） ---
export const SITUATION_OPTIONS: Record<
  OnsetType,
  { value: Situation; label: string }[]
> = {
  sudden: [
    { value: "acute_hospital", label: "急性期病院に入院中" },
    { value: "rehab_hospital", label: "リハビリ病院に入院中" },
    { value: "home_after_discharge", label: "退院し自宅で療養中" },
    { value: "facility_after_discharge", label: "退院し施設で療養中" },
    { value: "no_hospitalization", label: "最初から入院していない" },
  ],
  gradual: [
    { value: "not_visited", label: "異変を感じるが受診していない" },
    { value: "visited_no_insurance", label: "受診しているが介護保険を申請していない" },
    { value: "home_care_with_insurance", label: "介護保険を使用して在宅介護中" },
  ],
};

// --- Situation → Phase マッピング ---
export const SITUATION_TO_PHASE: Record<Situation, Phase> = {
  acute_hospital: "acute",
  rehab_hospital: "rehab",
  home_after_discharge: "post_discharge",
  facility_after_discharge: "post_discharge",
  no_hospitalization: "discharge_prep",
  not_visited: "discovery",
  visited_no_insurance: "medical_visit",
  home_care_with_insurance: "home_care",
};

// --- フロー定義（突然の発症 / ゆるやかな変化） ---
export const FLOW_STEPS: Record<OnsetType, FlowStep[]> = {
  sudden: [
    {
      stepId: "s1",
      label: "急性期病院",
      description: "入院0〜72時間〜2週間。救急搬送・初期治療・手術",
      isCurrent: false,
      order: 1,
    },
    {
      stepId: "s2",
      label: "リハビリ病院",
      description: "2週間〜3ヶ月。回復期リハビリ・機能回復訓練",
      isCurrent: false,
      order: 2,
    },
    {
      stepId: "s3",
      label: "退院準備",
      description: "退院2〜4週前。カンファレンス・在宅/施設の方針決定",
      isCurrent: false,
      order: 3,
    },
    {
      stepId: "s4",
      label: "退院",
      description: "退院当日。住環境整備・福祉用具設置",
      isCurrent: false,
      order: 4,
    },
    {
      stepId: "s5",
      label: "在宅介護 / 施設入所",
      description: "退院後0〜1ヶ月。介護サービス開始・生活リズム確立",
      isCurrent: false,
      order: 5,
    },
    {
      stepId: "s6",
      label: "継続フォロー",
      description: "以降。定期見直し・ケアプラン更新",
      isCurrent: false,
      order: 6,
    },
  ],
  gradual: [
    {
      stepId: "g1",
      label: "気づき・発見",
      description: "異変の自覚。物忘れ・体力低下・日常の変化",
      isCurrent: false,
      order: 1,
    },
    {
      stepId: "g2",
      label: "受診・検査",
      description: "かかりつけ医 or 専門医を受診。診断を受ける",
      isCurrent: false,
      order: 2,
    },
    {
      stepId: "g3",
      label: "介護予防・申請準備",
      description: "介護保険申請・地域包括支援センターへ相談",
      isCurrent: false,
      order: 3,
    },
    {
      stepId: "g4",
      label: "在宅介護",
      description: "ケアプランに基づくサービス利用開始",
      isCurrent: false,
      order: 4,
    },
    {
      stepId: "g5",
      label: "継続・見直し",
      description: "定期的なケアプラン見直し・状態変化への対応",
      isCurrent: false,
      order: 5,
    },
  ],
};

// --- Phase → 結論サマリー ---
export const PHASE_SUMMARIES: Record<Phase, string> = {
  acute: "まずは治療に専念。並行して、今後の手続きの準備を始めましょう。",
  rehab: "退院後の生活に向けて、制度申請と住環境の準備を進めましょう。",
  discharge_prep: "退院まで時間があります。介護保険と退院後の体制を整えましょう。",
  post_discharge: "退院後の生活が始まっています。介護サービスの開始と調整を進めましょう。",
  discovery: "まずは受診して、状態を正確に把握することが最優先です。",
  medical_visit: "診断を受けた今、介護保険の申請と相談窓口への連絡を進めましょう。",
  prevention: "介護保険の申請準備と、利用できるサービスの確認を行いましょう。",
  home_care: "現在のケアプランを見直し、必要に応じてサービスを追加・変更しましょう。",
};

// --- Phase → 最初に連絡すべき窓口 ---
export const FIRST_CONTACTS: Record<Phase, string> = {
  acute: "病院の医療ソーシャルワーカー（MSW）",
  rehab: "リハビリ病院の相談室 or 医療ソーシャルワーカー",
  discharge_prep: "地域包括支援センター",
  post_discharge: "地域包括支援センター or 担当ケアマネージャー",
  discovery: "かかりつけ医（いなければ近くの内科）",
  medical_visit: "地域包括支援センター",
  prevention: "市区町村の介護保険窓口",
  home_care: "担当ケアマネージャー",
};

// --- タスクテンプレート ---
interface TaskTemplate {
  titleKey: string;
  title: string;
  description: string;
  priority: TaskPriority;
  deadline: TaskDeadline;
  relatedServiceCategory?: ServiceCategory;
  moshimoNaviCategory?: import("@/types").MoshimoNaviCategory; // A〜Eカテゴリ
}

// Phase × タスクマッピング
export const PHASE_TASKS: Record<Phase, TaskTemplate[]> = {
  acute: [
    {
      titleKey: "confirm_condition",
      title: "主治医に病状と見通しを確認する",
      description:
        "入院直後は情報が少ないため、主治医に「今の状態」「今後の見通し」「退院の目安」を確認しましょう。メモを取って家族と共有するのが重要です。",
      priority: "high",
      deadline: "within_48h",
      moshimoNaviCategory: "A_medical",
    },
    {
      titleKey: "contact_msw",
      title: "医療ソーシャルワーカー（MSW）に面談を依頼する",
      description:
        "病院には医療ソーシャルワーカーがいます。退院後の生活設計、制度利用、費用の相談ができます。ナースステーションで「MSWに相談したい」と伝えてください。",
      priority: "high",
      deadline: "within_48h",
      moshimoNaviCategory: "A_medical",
    },
    {
      titleKey: "apply_care_insurance",
      title: "介護保険の申請をする",
      description:
        "市区町村の窓口で介護保険の申請を行います。入院中でも申請可能です。認定まで約30日かかるため、早めの申請が重要です。",
      priority: "high",
      deadline: "within_1week",
      relatedServiceCategory: "care_insurance",
      moshimoNaviCategory: "C_home",
    },
    {
      titleKey: "check_limit_amount",
      title: "高額療養費制度を確認する",
      description:
        "入院費が高額になる場合、高額療養費制度で自己負担額に上限が設けられます。加入している健康保険に「限度額適用認定証」を申請しましょう。",
      priority: "normal",
      deadline: "within_1week",
      relatedServiceCategory: "medical",
      moshimoNaviCategory: "A_medical",
    },
    {
      titleKey: "organize_family",
      title: "家族で情報共有の体制をつくる",
      description:
        "介護は1人で抱えるとパンクします。家族LINEグループ等で、病状・手続き・費用の情報を共有する仕組みをつくりましょう。",
      priority: "normal",
      deadline: "within_1week",
      moshimoNaviCategory: "B_family",
    },
    {
      titleKey: "family_meeting_acute",
      title: "緊急家族会議を開く（役割分担の決定）",
      description:
        "入院直後は決めるべきことが多いため、家族で集まり、誰が何を担当するか（病院対応、制度申請、費用管理、仕事調整など）を明確にしましょう。",
      priority: "high",
      deadline: "within_72h",
      moshimoNaviCategory: "B_family",
    },
    {
      titleKey: "notify_company",
      title: "会社に状況を報告する",
      description:
        "勤務先に状況を報告し、当面の休暇や勤務調整について相談しましょう。介護休業制度の有無も確認してください。",
      priority: "high",
      deadline: "within_24h",
      moshimoNaviCategory: "E_work",
    },
    {
      titleKey: "check_care_leave",
      title: "介護休業・休暇制度を確認する",
      description:
        "会社の就業規則で介護休業（最長93日）、介護休暇（年5日）、時短勤務などの制度を確認しましょう。人事部または労務担当に問い合わせてください。",
      priority: "normal",
      deadline: "within_1week",
      moshimoNaviCategory: "E_work",
    },
  ],
  rehab: [
    {
      titleKey: "apply_care_insurance",
      title: "介護保険の申請をする（未申請の場合）",
      description:
        "まだ介護保険を申請していなければ、すぐに申請しましょう。リハビリ病院の相談室が手続きを支援してくれます。",
      priority: "high",
      deadline: "within_48h",
      relatedServiceCategory: "care_insurance",
      moshimoNaviCategory: "C_home",
    },
    {
      titleKey: "plan_post_discharge",
      title: "退院後の生活場所を検討する",
      description:
        "在宅か施設か、退院後の方針を検討しましょう。リハビリの進捗、家族の介護力、住環境を考慮して判断します。",
      priority: "high",
      deadline: "within_2weeks",
      moshimoNaviCategory: "B_family",
    },
    {
      titleKey: "attend_conference",
      title: "退院前カンファレンスに参加する",
      description:
        "病院が退院前カンファレンスを開催します。主治医・看護師・リハビリスタッフ・MSWが参加。退院後に必要なケアを確認する重要な場です。",
      priority: "high",
      deadline: "within_1month",
      moshimoNaviCategory: "A_medical",
    },
    {
      titleKey: "find_care_manager",
      title: "ケアマネージャーを探す",
      description:
        "退院後に在宅介護をする場合、ケアマネージャー（介護支援専門員）が必要です。地域包括支援センターに相談するか、MSWに紹介を依頼しましょう。",
      priority: "normal",
      deadline: "within_2weeks",
      relatedServiceCategory: "care_insurance",
      moshimoNaviCategory: "C_home",
    },
    {
      titleKey: "check_home_environment",
      title: "自宅の環境を確認する（在宅の場合）",
      description:
        "手すり・段差・トイレ・浴室など、退院後の生活に支障がないか確認しましょう。介護保険で住宅改修費（上限20万円）が出ます。",
      priority: "normal",
      deadline: "within_1month",
      relatedServiceCategory: "care_insurance",
      moshimoNaviCategory: "C_home",
    },
    {
      titleKey: "family_cost_meeting",
      title: "介護費用の分担について家族で話し合う",
      description:
        "退院後の介護にかかる費用（サービス利用料、住宅改修費、福祉用具など）を試算し、誰がどう負担するかを家族で決めましょう。",
      priority: "normal",
      deadline: "within_2weeks",
      moshimoNaviCategory: "B_family",
    },
    {
      titleKey: "housing_modification",
      title: "住宅改修の検討と手配（在宅の場合）",
      description:
        "手すり設置、段差解消、トイレ・浴室の改修など、必要な住宅改修を検討しましょう。介護保険で上限20万円（自己負担1〜3割）の補助が出ます。",
      priority: "normal",
      deadline: "within_1month",
      relatedServiceCategory: "care_insurance",
      moshimoNaviCategory: "C_home",
    },
    {
      titleKey: "welfare_equipment",
      title: "福祉用具のレンタル・購入を手配する",
      description:
        "車椅子、介護ベッド、歩行器などの福祉用具をレンタルまたは購入します。ケアマネージャーと相談し、介護保険の適用を確認しましょう。",
      priority: "normal",
      deadline: "within_1month",
      relatedServiceCategory: "care_insurance",
      moshimoNaviCategory: "C_home",
    },
    {
      titleKey: "facility_visit",
      title: "施設を見学する（施設入所の場合）",
      description:
        "施設入所を検討する場合は、複数の施設を見学し、費用・サービス内容・立地を比較しましょう。MSWに施設リストをもらうと良いです。",
      priority: "normal",
      deadline: "within_1month",
      moshimoNaviCategory: "D_facility",
    },
    {
      titleKey: "apply_care_leave",
      title: "介護休業の申請をする",
      description:
        "退院後の生活立ち上げのため、介護休業（最長93日）の申請を会社に行いましょう。申請書類と医師の診断書が必要です。",
      priority: "normal",
      deadline: "within_2weeks",
      moshimoNaviCategory: "E_work",
    },
    {
      titleKey: "work_adjustment",
      title: "勤務時間の調整を会社と相談する",
      description:
        "時短勤務、フレックスタイム、在宅勤務など、介護と仕事の両立のための働き方を会社と相談しましょう。",
      priority: "normal",
      deadline: "within_1month",
      moshimoNaviCategory: "E_work",
    },
  ],
  discharge_prep: [
    {
      titleKey: "apply_care_insurance",
      title: "介護保険の申請をする",
      description:
        "まだ未申請の場合はすぐに申請しましょう。地域包括支援センターが手続きを支援してくれます。",
      priority: "high",
      deadline: "immediate",
      relatedServiceCategory: "care_insurance",
      moshimoNaviCategory: "C_home",
    },
    {
      titleKey: "contact_chiiki_houkatsu",
      title: "地域包括支援センターに連絡する",
      description:
        "介護に関する総合相談窓口です。ケアマネージャーの紹介、制度の案内、地域のサービス情報を得られます。",
      priority: "high",
      deadline: "within_24h",
      moshimoNaviCategory: "C_home",
    },
    {
      titleKey: "plan_post_discharge",
      title: "退院後の生活場所を決める",
      description:
        "在宅か施設か、方針を決めましょう。本人の意思、家族の介護力、経済状況を総合的に判断します。",
      priority: "high",
      deadline: "within_1week",
      moshimoNaviCategory: "B_family",
    },
    {
      titleKey: "organize_family",
      title: "家族会議を開く",
      description:
        "介護の方針・役割分担・費用負担について家族で話し合いましょう。全員が同じ情報を持つことが重要です。",
      priority: "normal",
      deadline: "within_1week",
      moshimoNaviCategory: "B_family",
    },
    {
      titleKey: "return_to_work_timing",
      title: "復職のタイミングを検討する",
      description:
        "介護休業終了後の復職時期や、継続的な勤務調整について会社と相談しましょう。在宅介護の立ち上げ状況を見ながら判断します。",
      priority: "normal",
      deadline: "within_2weeks",
      moshimoNaviCategory: "E_work",
    },
  ],
  post_discharge: [
    {
      titleKey: "start_care_service",
      title: "介護サービスの利用を開始する",
      description:
        "ケアマネージャーと相談し、ケアプランに基づいて介護サービス（訪問介護、デイサービス等）を開始しましょう。",
      priority: "high",
      deadline: "within_48h",
      relatedServiceCategory: "care_insurance",
      moshimoNaviCategory: "C_home",
    },
    {
      titleKey: "setup_home_care",
      title: "在宅介護の環境を整える",
      description:
        "福祉用具のレンタル・購入、住宅改修、生活動線の確認を行いましょう。ケアマネージャーが手配を支援します。",
      priority: "high",
      deadline: "within_1week",
      relatedServiceCategory: "care_insurance",
      moshimoNaviCategory: "C_home",
    },
    {
      titleKey: "find_care_manager",
      title: "ケアマネージャーと定期的に連絡をとる",
      description:
        "ケアプランが合っているか、サービスに不満はないか、定期的にケアマネージャーと確認しましょう。",
      priority: "normal",
      deadline: "within_2weeks",
      relatedServiceCategory: "care_insurance",
      moshimoNaviCategory: "C_home",
    },
    {
      titleKey: "check_financial_support",
      title: "経済的支援制度を確認する",
      description:
        "介護休業給付金、高額介護サービス費、自治体の助成制度など、利用できる経済的支援を確認しましょう。",
      priority: "normal",
      deadline: "within_1month",
      relatedServiceCategory: "financial",
      moshimoNaviCategory: "B_family",
    },
    {
      titleKey: "caregiver_self_care",
      title: "介護者自身のケアを考える",
      description:
        "介護者の疲弊は介護崩壊の最大原因です。レスパイトケア（ショートステイ等）やメンタルヘルスの相談先を確認しておきましょう。",
      priority: "normal",
      deadline: "within_1month",
      moshimoNaviCategory: "B_family",
    },
    {
      titleKey: "ongoing_work_adjustment",
      title: "継続的な勤務調整を行う",
      description:
        "在宅介護が始まった後も、状況に応じて勤務時間や働き方を調整しましょう。定期的に上司や人事と相談することが重要です。",
      priority: "normal",
      deadline: "ongoing",
      moshimoNaviCategory: "E_work",
    },
  ],
  discovery: [
    {
      titleKey: "visit_doctor",
      title: "かかりつけ医を受診する",
      description:
        "まずは受診して、状態を正確に把握することが最優先です。かかりつけ医がいなければ、近くの内科を受診しましょう。認知症が疑われる場合は「もの忘れ外来」も選択肢です。",
      priority: "high",
      deadline: "within_1week",
      relatedServiceCategory: "medical",
      moshimoNaviCategory: "A_medical",
    },
    {
      titleKey: "record_symptoms",
      title: "気になる症状を記録する",
      description:
        "いつから、どんな症状があるか、どのくらいの頻度か、をメモしましょう。受診時に医師に伝える重要な情報になります。",
      priority: "high",
      deadline: "within_48h",
      moshimoNaviCategory: "A_medical",
    },
    {
      titleKey: "contact_chiiki_houkatsu",
      title: "地域包括支援センターに相談する",
      description:
        "介護に関する無料の相談窓口です。まだ介護が必要かわからない段階でも相談できます。お住まいの地域の窓口を調べて連絡しましょう。",
      priority: "normal",
      deadline: "within_2weeks",
      moshimoNaviCategory: "C_home",
    },
    {
      titleKey: "family_share_gradual",
      title: "家族で状況を共有する",
      description:
        "異変に気づいたことを家族で共有し、今後どう対応するかを話し合いましょう。早期の情報共有が重要です。",
      priority: "normal",
      deadline: "within_1week",
      moshimoNaviCategory: "B_family",
    },
  ],
  medical_visit: [
    {
      titleKey: "apply_care_insurance",
      title: "介護保険の申請をする",
      description:
        "主治医の診断を受けた今がタイミングです。市区町村の窓口、または地域包括支援センターで申請しましょう。申請には主治医意見書が必要です（医師に直接依頼されます）。",
      priority: "high",
      deadline: "within_1week",
      relatedServiceCategory: "care_insurance",
      moshimoNaviCategory: "C_home",
    },
    {
      titleKey: "contact_chiiki_houkatsu",
      title: "地域包括支援センターに連絡する",
      description:
        "介護保険の申請支援、ケアマネージャーの紹介、地域の介護サービス情報を得られます。",
      priority: "high",
      deadline: "within_48h",
      moshimoNaviCategory: "C_home",
    },
    {
      titleKey: "understand_diagnosis",
      title: "診断内容と今後の見通しを主治医に確認する",
      description:
        "病名、進行の見通し、治療方針、日常生活への影響について確認しましょう。メモを取って家族と共有してください。",
      priority: "high",
      deadline: "within_48h",
      moshimoNaviCategory: "A_medical",
    },
    {
      titleKey: "organize_family",
      title: "家族に状況を共有する",
      description:
        "診断結果と今後の方針を家族に共有しましょう。早い段階で情報を共有することで、後の介護分担がスムーズになります。",
      priority: "normal",
      deadline: "within_1week",
      moshimoNaviCategory: "B_family",
    },
  ],
  prevention: [
    {
      titleKey: "apply_care_insurance",
      title: "介護保険の申請を完了する",
      description:
        "申請がまだの場合は、市区町村の窓口で申請しましょう。すでに申請中の場合は、認定結果を待ちながら次の準備を進めます。",
      priority: "high",
      deadline: "immediate",
      relatedServiceCategory: "care_insurance",
      moshimoNaviCategory: "C_home",
    },
    {
      titleKey: "find_care_manager",
      title: "ケアマネージャーを見つける",
      description:
        "介護保険の認定が出たら、ケアマネージャーを選びケアプランを作成します。地域包括支援センターで紹介を受けましょう。",
      priority: "high",
      deadline: "within_2weeks",
      relatedServiceCategory: "care_insurance",
      moshimoNaviCategory: "C_home",
    },
    {
      titleKey: "check_services",
      title: "利用できるサービスを確認する",
      description:
        "デイサービス、訪問介護、福祉用具レンタルなど、介護保険で使えるサービスを確認しましょう。ケアマネージャーが案内してくれます。",
      priority: "normal",
      deadline: "within_1month",
      relatedServiceCategory: "care_insurance",
      moshimoNaviCategory: "C_home",
    },
  ],
  home_care: [
    {
      titleKey: "review_care_plan",
      title: "ケアプランを見直す",
      description:
        "現在のケアプランが本人の状態に合っているか、ケアマネージャーと確認しましょう。状態の変化があれば、サービスの追加・変更が可能です。",
      priority: "high",
      deadline: "within_1week",
      relatedServiceCategory: "care_insurance",
      moshimoNaviCategory: "C_home",
    },
    {
      titleKey: "check_additional_services",
      title: "追加で利用できるサービスを確認する",
      description:
        "自治体独自のサービス（配食、見守り、紙おむつ支給等）や、民間サービスも含めて確認しましょう。",
      priority: "normal",
      deadline: "within_2weeks",
      relatedServiceCategory: "municipal",
      moshimoNaviCategory: "C_home",
    },
    {
      titleKey: "caregiver_self_care",
      title: "介護者の負担を確認する",
      description:
        "介護者が疲弊していないか確認しましょう。レスパイトケア（ショートステイ）の利用や、介護者向け相談窓口も検討してください。",
      priority: "normal",
      deadline: "within_2weeks",
      moshimoNaviCategory: "B_family",
    },
    {
      titleKey: "check_financial_support",
      title: "経済的支援制度を見直す",
      description:
        "高額介護サービス費、特定入所者介護サービス費、障害者控除、介護休業給付金など、利用できる支援を確認しましょう。",
      priority: "normal",
      deadline: "within_1month",
      relatedServiceCategory: "financial",
      moshimoNaviCategory: "B_family",
    },
  ],
};
