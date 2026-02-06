// ============================================================
// 既存ケアガイド診断ロジック（logic.ts からの移植）
// + Plan/Task モデルへのブリッジ層
// ============================================================

import type {
  DiagnosisAnswers,
  AssessmentResult,
  RelifePlanSummary,
  AreaName,
  InvolvementLevel,
  TodoItem,
  ContactWindow,
  CandidateService,
  RiskItem,
  FamilyPoint,
  NextStepGuide,
  PreparednessAnswers,
  PreparednessResult,
  PreparednessRisk,
} from "@/types/legacy";
import type {
  Plan,
  Task,
  ServiceEligibility,
  ServiceCategory,
  MergeAction,
} from "@/types";
import { CANDIDATES_DATA, PREPAREDNESS_CARDS } from "./legacy-constants";

// ============================================================
// 既存診断ロジック（calculateResult）
// ============================================================

export const calculateResult = (answers: DiagnosisAnswers): AssessmentResult => {
  // A. Internal Flags
  const is65plus = ["65〜74歳", "75歳以上"].includes(answers.q2_age);
  const is40to64 = answers.q2_age === "40〜64歳";
  const specificDiseaseYes = answers.q2b_specific_disease?.includes("はい") ?? false;
  const specificDiseaseUnknown = answers.q2b_specific_disease === "わからない";
  const ltcEligible = is65plus || (is40to64 && specificDiseaseYes);
  const ltcEligibilityUnknown = (is40to64 && specificDiseaseUnknown) || answers.q2_age === "わからない";

  const hasDisability = ["障害福祉だけ申請中／利用中", "両方"].includes(answers.q7_public_service);
  const hasLTC = ["介護保険だけ申請中／利用中", "両方"].includes(answers.q7_public_service);
  const needDailySupport = ["見守りが必要", "介助が必要"].includes(answers.q5_support_level);
  const needConstantSupport = answers.q5_support_level === "介助が必要";
  const cognitiveIssues = answers.q3_status.includes("認知") || answers.q6_traits.some((t) => t.includes("段取り") || t.includes("記憶") || t.includes("対人"));
  const mentalIssues = answers.q4_trouble.includes("生活が回らない") && answers.q6_traits.some((t) => t.includes("対人") || t.includes("感情"));
  const unstableMedical = ["入院中", "退院予定（30日以内）"].includes(answers.q3_status) || answers.q10_finance.includes("医療費");
  const employmentRisk = answers.q8_work_status.includes("継続中") || answers.q8_work_status.includes("休職");
  const financialRisk = answers.q10_finance.includes("収入") || answers.q10_finance.includes("医療費") || answers.q10_finance.includes("未完");
  const highUrgency = true;

  // B. Primary Route
  let primaryRoute: "障害福祉" | "介護保険" | "未確定" = "未確定";
  if (hasLTC) {
    primaryRoute = "介護保険";
  } else if (ltcEligible && needDailySupport) {
    primaryRoute = "介護保険";
  } else if (hasDisability) {
    primaryRoute = "障害福祉";
  } else if (!ltcEligible && !ltcEligibilityUnknown && (needDailySupport || cognitiveIssues || employmentRisk || mentalIssues)) {
    primaryRoute = "障害福祉";
  }

  let secondaryRoute: "障害福祉" | "介護保険" | null = null;
  if (primaryRoute === "介護保険" && !hasDisability && (cognitiveIssues || employmentRisk || mentalIssues)) {
    secondaryRoute = "障害福祉";
  }
  if (primaryRoute === "障害福祉" && !hasLTC && ltcEligible && needDailySupport) {
    secondaryRoute = "介護保険";
  }

  const flags = {
    is65plus, is40to64, ltcEligible, ltcEligibilityUnknown,
    hasDisability, hasLTC, needDailySupport, needConstantSupport,
    cognitiveIssues, mentalIssues, unstableMedical, employmentRisk,
    financialRisk, highUrgency, midUrgency: false,
    primaryRoute, secondaryRoute,
  };

  return {
    shortSummary: generateShortSummary(answers, flags),
    planSummary: generatePlanSummary(),
    areaInvolvement: calculateInvolvement(answers, flags),
    nextSteps: generateNextSteps(answers, flags),
    topTodos: [],
    contactWindows: generateContactWindows(answers, flags),
    candidates: generateCandidates(answers, flags),
    twoWeekTasks: generateTwoWeekTasks(answers, flags),
    risks: generateRisks(answers, flags),
    familyPoints: generateFamilyPoints(answers, flags),
  };
};

// --- 内部関数群 ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateShortSummary = (a: DiagnosisAnswers, f: any): string => {
  let mainDomain = "生活と手続き";
  if (a.q4_trouble.includes("お金が不安")) mainDomain = "お金";
  else if (a.q4_trouble.includes("仕事・学校が続かない")) mainDomain = "仕事";
  else if (a.q4_trouble.includes("生活が回らない")) mainDomain = "生活";
  else if (a.q4_trouble.includes("住まいが限界")) mainDomain = "住まい";

  let windowName = "市役所（福祉の総合窓口）";
  if (f.primaryRoute === "障害福祉") windowName = "市役所（障害福祉担当）";
  if (f.primaryRoute === "介護保険") windowName = "地域包括支援センター";

  return `いまの焦点は「${mainDomain}」です。まずは「${windowName}」へ相談予約を取り、そこから支援を組み立てます。`;
};

const generatePlanSummary = (): RelifePlanSummary => ({
  life: "日々の段取り・服薬・通院・家事など、つまずく場面を「支援で補う」設計にします。",
  housing: "安全・見守り・移動の不安を減らし、家の中で事故が起きにくい形に整えます。",
  work: '続け方（配慮・役割・ペース）を具体化し、職場で"回る形"に寄せます。',
  money: "申請が必要な支援を洗い出し、家計の不安を減らす順番を作ります。",
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateNextSteps = (a: DiagnosisAnswers, f: any): NextStepGuide => {
  const usingLTC = !!f.hasLTC;
  const usingDisability = !!f.hasDisability;
  const ltcUnknown = !!f.ltcEligibilityUnknown;

  let windowName = "市役所（福祉の総合窓口）";
  let step1Focus = "入口の確定";
  const step1Button = "窓口別 質問セットを見る";

  if (usingLTC) { windowName = "地域包括支援センター"; step1Focus = "利用中サービスの見直し・追加"; }
  else if (usingDisability) { windowName = "市役所（障害福祉担当）"; step1Focus = "利用中サービスの見直し・組み替え"; }
  else if (ltcUnknown) { windowName = "市役所（福祉の総合窓口）"; step1Focus = "介護保険か障害福祉か、入口の確定"; }
  else if (f.primaryRoute === "介護保険") { windowName = "地域包括支援センター"; step1Focus = "申請の入口確定（介護保険）"; }
  else if (f.primaryRoute === "障害福祉") { windowName = "市役所（障害福祉担当）"; step1Focus = "申請の入口確定（障害福祉）"; }

  let step1Desc = `最初に「${windowName}」へ電話し、相談予約を取ります。窓口を確定しないと候補が増えるだけで進みません。`;
  if (usingLTC) {
    step1Desc = `すでに介護保険を申請中／利用中の場合、最初の焦点は「新規申請」ではありません。「${windowName}」へ相談予約を入れ、サービスの"見直し"ができるかを確認します。`;
  } else if (usingDisability) {
    step1Desc = `すでに障害福祉を申請中／利用中の場合、「${windowName}」へ相談予約を入れ、支援計画やサービスの"見直し"ができるかを確認します。`;
  } else if (ltcUnknown) {
    step1Desc = `40〜64歳の場合、介護保険は「特定疾病」に当てはまるときのみ対象になります。まず「${windowName}」で入口を確定する相談予約を取ります。`;
  }

  let step2Title = "Step 2：必要情報をそろえる（該当可能性を絞る）";
  let step2Desc = "診断書・手帳・現在の困りごとメモなど、窓口で話すために必要な情報を揃えます。";
  const step2Button = "必要情報チェックを見る";

  if (usingLTC || usingDisability) {
    step2Title = "Step 2：現状を棚卸しする（何が足りていないか特定）";
    step2Desc = '「いま困っていること」「すでに使っている支援」「うまくいっていない点」を短くメモ化します。';
  }

  return {
    step1: { title: `Step 1：相談予約（${step1Focus}）`, desc: step1Desc, button: step1Button },
    step2: { title: step2Title, desc: step2Desc, button: step2Button },
    step3: {
      title: 'Step 3：6分野を組み合わせて"リライフプラン"を作る',
      desc: "一つの制度で完結させず、障害・介護保険・医療・自治体独自・経済的支援・民間をパズルのように組み合わせ、生活が回る形に寄せます。",
      button: "組み合わせ案（候補カード）を見る",
    },
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const calculateInvolvement = (a: DiagnosisAnswers, f: any): Record<AreaName, InvolvementLevel> => {
  const map: Record<AreaName, InvolvementLevel> = {
    障害福祉サービス: "low", 介護保険サービス: "low", 医療保険サービス: "low",
    自治体独自のサービス: "medium", 経済的支援制度: "medium", 民間サービス: "medium",
  };

  if (f.hasDisability || f.primaryRoute === "障害福祉" || (!f.is65plus && f.needDailySupport)) map["障害福祉サービス"] = "high";
  else if (f.cognitiveIssues || f.employmentRisk) map["障害福祉サービス"] = "medium";
  if (f.hasLTC || f.primaryRoute === "介護保険") map["介護保険サービス"] = "high";
  else if (f.is65plus && a.q4_trouble.length > 0) map["介護保険サービス"] = "medium";
  if (f.unstableMedical || a.q3_status.includes("入院") || a.q3_status.includes("退院")) map["医療保険サービス"] = "high";
  else if (a.q3_status.includes("在宅") || a.q3_status.includes("通院")) map["医療保険サービス"] = "medium";
  if (f.needDailySupport || f.financialRisk || a.q5_support_level !== "ほぼ自立") map["自治体独自のサービス"] = "high";
  if (f.financialRisk || a.q4_trouble.includes("お金が不安")) map["経済的支援制度"] = "high";
  if (f.highUrgency || a.q7_public_service.includes("まだ")) map["民間サービス"] = "high";

  return map;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateContactWindows = (a: DiagnosisAnswers, f: any): ContactWindow[] => {
  const windows: ContactWindow[] = [];
  const add = (name: string, desc: string, key: string, role: string, checks: string[]) => {
    windows.push({ name, description: desc, templateKey: key, role, checkPoints: checks });
  };

  if (f.primaryRoute === "障害福祉") {
    if (f.hasDisability) {
      add("担当の相談支援専門員（計画相談）", "障害福祉を利用中の場合の相談窓口", "障害福祉サービス", "支援の組み直し", ["今の計画/契約の確認", "追加したい困りごとの整理", "次回モニタリングの段取り"]);
    } else {
      add("市役所（障害福祉担当）", "障害福祉サービスの申請・相談窓口", "障害福祉サービス", "入口の確定", ["申請書類", "流れと期間"]);
    }
  } else if (f.primaryRoute === "介護保険") {
    if (f.hasLTC) {
      add("担当ケアマネジャー（介護保険）", "介護保険を利用中の場合の相談窓口", "介護保険サービス", "支援の組み直し", ["今のケアプラン確認", "追加したい困りごとの整理", "サービス追加の可否/手順"]);
    } else {
      add("地域包括支援センター", "介護の総合相談、申請受付", "介護保険サービス", "介護・生活相談", ["要介護認定", "使えるサービス"]);
    }
  } else {
    add("市役所（福祉の総合窓口）", "福祉全般の相談", "自治体", "制度の案内", ["担当課確認", "独自サービス"]);
  }
  return windows;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateCandidates = (a: DiagnosisAnswers, f: any): CandidateService[] => {
  const all = CANDIDATES_DATA.map((c) => {
    let tKey = c.area === "医療保険サービス" ? "病院" : c.area === "経済的支援制度" ? "年金" : c.area === "自治体独自のサービス" ? "自治体" : c.area;
    if (c.area === "民間サービス") tKey = "自治体";
    if (c.id === "f3") tKey = "自治体";
    return { ...c, actionTemplate: tKey };
  });

  const areaOrder: Record<AreaName, number> = {
    障害福祉サービス: f.primaryRoute === "障害福祉" ? 1 : 2,
    介護保険サービス: f.primaryRoute === "介護保険" ? 1 : 2,
    医療保険サービス: 3, 経済的支援制度: 4, 自治体独自のサービス: 5, 民間サービス: 6,
  };

  const sorted = [...all].sort((a, b) => areaOrder[a.area] - areaOrder[b.area]);
  let filtered = sorted;

  if (f.hasLTC) filtered = filtered.filter((c) => c.id !== "c1");
  if (f.hasDisability) filtered = filtered.filter((c) => c.id !== "w0");

  const showLtcArea = f.hasLTC || f.primaryRoute === "介護保険" || f.secondaryRoute === "介護保険";
  if (!showLtcArea) filtered = filtered.filter((c) => c.area !== "介護保険サービス");

  return filtered;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateTwoWeekTasks = (a: DiagnosisAnswers, f: any): TodoItem[] => {
  const tasks: TodoItem[] = [
    { id: "tk1", text: "キーパーソン（連絡窓口）を1人決める", assignedTo: "家族", condition: "平日日中に連絡が取れる人" },
    { id: "tk2", text: "現在の困りごとをメモに書き出す（10個以内）", assignedTo: "家族", condition: '「いつ・何に」困るか具体的に' },
    { id: "tk3", text: "市役所/地域包括の場所と電話番号を調べる", assignedTo: "家族", condition: "ネットまたは広報誌で確認" },
    { id: "tk4", text: "相談窓口へ電話し、相談予約を入れる", assignedTo: "連絡窓口", condition: '「困りごとを整理したい」と伝える' },
    { id: "tk5", text: "診断書・保険証・手帳など書類をまとめる", assignedTo: "家族", condition: "コピーをとっておく" },
  ];
  if (f.financialRisk) tasks.push({ id: "tk6", text: "年金・手当の必要書類（初診日等）を調べる", assignedTo: "家族" });
  return tasks;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateRisks = (a: DiagnosisAnswers, f: any): RiskItem[] => [
  { title: "手続きの空白期間", reason: "申請から開始まで1〜2ヶ月かかる", prevention: "予約を急ぎ、暫定の支え（自費等）を用意する" },
  { title: "役割の押し付け合い", reason: '「誰かがやるだろう」で止まる', prevention: "キーパーソン（連絡担当）を1人だけ決める" },
  { title: "情報の分散", reason: "病院・役所・職場で話が食い違う", prevention: '「困りごとメモ」をコピーして全員に同じものを渡す' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateFamilyPoints = (a: DiagnosisAnswers, f: any): FamilyPoint[] => {
  const points: FamilyPoint[] = [
    { title: "誰が窓口になる？（連絡担当）", draft: "平日日中に動ける◯◯さんが担当", material: "各家族の仕事の状況と連絡可能時間" },
    { title: "家計の不足をどこまで補うか", draft: "まずは制度を洗い出し、不足分は貯蓄/援助で補填", material: "月々の赤字額の見込み" },
    { title: '仕事は"維持"か"調整"か', draft: '今は「続けること」を最優先に調整する', material: "本人の疲労度と職場の理解度" },
  ];
  if (f.primaryRoute === "介護保険") {
    points.push({ title: "住まいは当面維持か、転居か", draft: "半年は在宅で粘り、その間に施設も調べる", material: "夜間の介護負担の限界ライン" });
  }
  return points;
};

// ============================================================
// 将来備え診断ロジック
// ============================================================

const normalizeAnswer = (val: string): string => {
  if (val === "できている" || val === "決まっている" || val === "合意できている" || val === "決めている") return "done";
  if (val === "一部できている" || val === "なんとなく決まっている" || val === "なんとなく共有している" || val === "なんとなく考えている") return "partial";
  if (val === "できていない" || val === "決まっていない" || val === "話していない" || val === "意見が割れている") return "not_done";
  if (val && (val.includes("分からない") || val === "わからない")) return "unknown";
  if (val === "いる") return "yes";
  if (val === "いない") return "no";
  if (val === "はい（可能性が高い）") return "conflict_yes";
  if (val === "いいえ（話し合えそう）") return "conflict_no";
  return "unknown";
};

const quadWeight = (val: string) => { const v = normalizeAnswer(val); return v === "done" ? 0 : v === "partial" ? 1 : v === "not_done" ? 2 : 1; };
const binWeight = (val: string) => { const v = normalizeAnswer(val); return v === "yes" ? 0 : v === "no" ? 2 : 1; };
const conflictWeight = (val: string) => { const v = normalizeAnswer(val); return v === "conflict_no" ? 0 : v === "conflict_yes" ? 2 : 1; };

export const calculatePreparednessResult = (answers: PreparednessAnswers): PreparednessResult => {
  const risks: { risk: PreparednessRisk; score: number; cardIds: string[] }[] = [];

  // 1) Info Risk
  {
    const keys = [answers.q_info_doctor, answers.q_info_meds, answers.q_info_cards_location, answers.q_info_support_contact];
    const score = keys.reduce((s, k) => s + quadWeight(k), 0);
    if (score > 0) {
      risks.push({ score, cardIds: ["card_info"], risk: { id: "risk_info", title: "緊急時に必要な情報が共有されていないリスク", severity: 4, description: { summary: "医療・服薬・書類の情報が曖昧だと、急変時の初動が遅れ、家族の混乱が一気に増えます。", detailBullets: ["入院判断に必要な情報の欠如", "必要書類の捜索による遅延", "相談先不明による孤立"] }, discussionPoints: ["通院先・服薬情報の集約", "重要書類の場所共有", "相談先のリストアップ"], recommendedCards: ["card_info"], resultCtaHint: "情報の棚卸しだけで、万が一の不安は大きく軽減されます。" } });
    }
  }

  // 2) Safety Risk
  {
    const keys = [answers.q_safe_fall_prevention, answers.q_safe_heatshock_prevention, answers.q_safe_outing_prevention, answers.q_safe_found_quickly];
    const score = keys.reduce((s, k) => s + quadWeight(k), 0);
    if (score > 0) {
      risks.push({ score, cardIds: ["card_safety_measures", "card_limit_line"], risk: { id: "risk_safety", title: "安全対策が不十分で一気に生活が崩れるリスク", severity: 5, description: { summary: "転倒やヒートショックは、一度で生活を激変させます。対策の遅れは『手遅れ』に直結します。", detailBullets: ["転倒・骨折による自立喪失", "浴室等の寒暖差リスク", "緊急時の発見遅れ"] }, discussionPoints: ["住環境の具体的改善", "生存確認の仕組み化", "支援導入の検討ライン"], recommendedCards: ["card_safety_measures", "card_limit_line"], resultCtaHint: "安全対策は「いつ支援を入れるか」まで決めると迷いが減ります。" } });
    }
  }

  // 3) Capacity Risk
  {
    const score = binWeight(answers.q_cap_weekday_available) + binWeight(answers.q_cap_helpers_exist) + quadWeight(answers.q_cap_roles_defined);
    if (score > 0) {
      risks.push({ score, cardIds: ["card_family_capacity"], risk: { id: "risk_capacity", title: "支える家族の負担が一人に集中するリスク", severity: 5, description: { summary: "役割が曖昧だと、特定の一人に手続きや付き添いの負荷が偏り、介護離職や共倒れを招きます。", detailBullets: ["平日窓口対応の集中", "兄弟間での不公平感の蓄積", "一人の限界を超えた抱え込み"] }, discussionPoints: ["平日窓口役の明確化", "分担可能な作業の切り出し", "外部支援の活用判断"], recommendedCards: ["card_family_capacity"], resultCtaHint: "頑張るのではなく、回る仕組みを設計することが重要です。" } });
    }
  }

  // 4) Money Risk
  {
    const keys = [answers.q_money_policy, answers.q_money_bills_and_accounts, answers.q_money_advance_rule, answers.q_money_docs_place];
    const score = keys.reduce((s, k) => s + quadWeight(k), 0);
    if (score > 0) {
      risks.push({ score, cardIds: ["card_money"], risk: { id: "risk_money", title: "お金の段取りがなく家族が揉めるリスク", severity: 4, description: { summary: "費用方針や立替ルールがないと、急な支払い時に揉めたり、家計が圧迫されやすくなります。", detailBullets: ["立替金の清算トラブル", "支払い不能（口座凍結）への懸念", "不透明な財産管理による疑念"] }, discussionPoints: ["費用負担の基本方針", "立替・管理の運用ルール", "口座・重要書類の所在把握"], recommendedCards: ["card_money"], resultCtaHint: "お金は「誰が・どこから出すか」を先に決めるのが鉄則です。" } });
    }
  }

  // 5) Conflict Risk
  {
    const score = conflictWeight(answers.q_cap_conflict_risk);
    if (score > 0) {
      risks.push({ score, cardIds: ["card_decision_axis", "card_family_capacity"], risk: { id: "risk_conflict", title: "意見が割れて判断が止まる・揉めるリスク", severity: 4, description: { summary: "家族内で意見が割れると、決断が必要な場面で何も決まらず、本人が一番不利益を被ります。", detailBullets: ["介護方針の不一致による対立", "情報の独占による不信感", "過去の感情のもつれの再燃"] }, discussionPoints: ["迷った時の最優先軸の決定", "情報共有の透明化", "第三者の介入タイミング"], recommendedCards: ["card_decision_axis", "card_family_capacity"], resultCtaHint: "揉めそうな場合は、合意の取り方を先に決めておきましょう。" } });
    }
  }

  const selectedCandidates = risks.sort((a, b) => b.risk.severity - a.risk.severity || b.score - a.score).slice(0, 3);
  const topRisks = selectedCandidates.map((c) => c.risk);
  const cardIdSet = new Set<string>(["card_decision_axis", "card_limit_line"]);
  selectedCandidates.forEach((c) => c.cardIds.forEach((id) => cardIdSet.add(id)));
  const recommendedCards = PREPAREDNESS_CARDS.filter((c) => cardIdSet.has(c.cardId));

  let targetLabel = "親御様";
  if (answers.p_target === "配偶者・パートナーについて") targetLabel = "パートナー様";
  else if (answers.p_target === "自分自身について") targetLabel = "ご自身";
  else if (answers.p_target === "その他") targetLabel = "対象の方";

  const summary = `${answers.parent_age}の${targetLabel}の状況を整理しました。\n現在は「${answers.q_axis_priority}」を最優先に考えたいというご意向に基づき、備えを強化すべきポイントを提示します。`;
  const finalNextAction = topRisks[0]?.resultCtaHint || "まずはご家族と、今の状況について話す時間を取ってみましょう。";

  return { summary, risks: topRisks, cards: recommendedCards, finalNextAction };
};

// ============================================================
// ブリッジ層：AssessmentResult → Plan のアップグレード
// ============================================================

const AREA_TO_CATEGORY: Record<AreaName, ServiceCategory> = {
  障害福祉サービス: "disability",
  介護保険サービス: "care_insurance",
  医療保険サービス: "medical",
  自治体独自のサービス: "municipal",
  経済的支援制度: "financial",
  民間サービス: "private",
};

export function bridgeAssessmentToPlanUpgrade(
  plan: Plan,
  result: AssessmentResult,
  answers: DiagnosisAnswers
): Plan {
  const now = new Date().toISOString();
  const updatedTasks = [...plan.tasks];
  const archivedTasks = [...plan.archivedTasks];

  // 1. 2週間タスクを既存タスクにマージ（enrich / add）
  for (const todo of result.twoWeekTasks) {
    const matchingTask = updatedTasks.find((t) =>
      t.title.includes("家族") || t.title.includes("情報共有") || t.title.includes("窓口") || t.title.includes("連絡")
    );
    if (matchingTask && !matchingTask.mergedFrom) {
      // enrich: 既存タスクに2週間タスクの情報を追記
      matchingTask.description += `\n\n【2週間タスク】${todo.text}（担当: ${todo.assignedTo}${todo.condition ? `、条件: ${todo.condition}` : ""}）`;
      matchingTask.mergedFrom = { action: "enrich", sourceTaskId: matchingTask.taskId, mergedAt: now };
      matchingTask.updatedAt = now;
    } else {
      // 新規タスクとして追加（既存にマッチしない場合）
      const alreadyExists = updatedTasks.some((t) => t.title === todo.text);
      if (!alreadyExists) {
        updatedTasks.push({
          taskId: `legacy-${todo.id}`,
          title: todo.text,
          description: `担当: ${todo.assignedTo}${todo.condition ? `\n条件: ${todo.condition}` : ""}`,
          status: "todo",
          source: "detailed",
          priority: "normal",
          deadline: "within_2weeks",
          parentTaskId: null,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  }

  // 2. 候補サービスから制度適用可能性を生成
  const serviceEligibilities: ServiceEligibility[] = [];
  const areaGroups = new Map<AreaName, CandidateService[]>();
  for (const candidate of result.candidates) {
    const group = areaGroups.get(candidate.area) || [];
    group.push(candidate);
    areaGroups.set(candidate.area, group);
  }

  for (const [area, candidates] of areaGroups) {
    const involvement = result.areaInvolvement[area];
    const category = AREA_TO_CATEGORY[area];
    const linkedTask = updatedTasks.find((t) => t.relatedServiceCategory === category && !t.archivedAt);

    serviceEligibilities.push({
      category,
      serviceName: area,
      isLikelyEligible: involvement === "high",
      linkedTaskId: linkedTask?.taskId,
      description: candidates.map((c) => `${c.name}: ${c.summary}`).join("\n"),
    });
  }

  // 3. 窓口情報を先頭タスクに追記
  if (result.contactWindows.length > 0 && updatedTasks.length > 0) {
    const firstHighPriority = updatedTasks.find((t) => t.priority === "high" && !t.mergedFrom);
    if (firstHighPriority) {
      const contactInfo = result.contactWindows.map((w) => `${w.name}（${w.role}）`).join("、");
      firstHighPriority.contactOffice = contactInfo;
      firstHighPriority.updatedAt = now;
    }
  }

  return {
    ...plan,
    version: "detailed",
    conclusionSummary: result.shortSummary,
    tasks: updatedTasks,
    archivedTasks,
    serviceEligibilities,
    updatedAt: now,
  };
}
