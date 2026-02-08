// ============================================================
// 診断ロジック（最小診断 → プラン生成 / 詳細診断 → プラン精緻化）
// ============================================================

import type {
  OnsetType,
  Situation,
  Phase,
  MinimalDiagnosis,
  DetailedDiagnosis,
  DetailedDiagnosisInput,
  Plan,
  Task,
  FlowStep,
  ServiceEligibility,
  ServiceCategory,
  MergeAction,
} from "@/types";
import {
  SITUATION_TO_PHASE,
  PHASE_SUMMARIES,
  FIRST_CONTACTS,
  FLOW_STEPS,
  PHASE_TASKS,
} from "./constants";

// --- UUID生成 ---
function generateId(): string {
  return crypto.randomUUID();
}

// --- 最小診断の実行 ---
export function runMinimalDiagnosis(
  onsetType: OnsetType,
  situation: Situation
): MinimalDiagnosis {
  const phase = SITUATION_TO_PHASE[situation];
  return {
    id: generateId(),
    onsetType,
    situation,
    phase,
    createdAt: new Date().toISOString(),
  };
}

// --- 最小診断からプラン生成 ---
export function generateMinimalPlan(diagnosis: MinimalDiagnosis): Plan {
  const now = new Date().toISOString();
  const phase = diagnosis.phase;

  // フローステップ生成（現在地をマーク）
  const flowSteps = buildFlowSteps(diagnosis.onsetType, phase);

  // フローに含まれる全てのフェーズのタスクを生成
  const allPhases = getAllPhasesFromFlow(diagnosis.onsetType);
  const tasks = allPhases.flatMap((p) => buildTasksForPhase(p, now));

  return {
    planId: generateId(),
    version: "minimal",
    minimalDiagnosisId: diagnosis.id,
    phase,
    phaseLabelJa: getPhaseLabelJa(phase),
    conclusionSummary: PHASE_SUMMARIES[phase],
    firstContact: FIRST_CONTACTS[phase],
    tasks,
    archivedTasks: [],
    flowSteps,
    createdAt: now,
    updatedAt: now,
  };
}

// --- フローから全フェーズを取得 ---
function getAllPhasesFromFlow(onsetType: OnsetType): Phase[] {
  if (onsetType === "sudden") {
    return ["acute", "rehab", "discharge_prep", "post_discharge"];
  } else {
    return ["discovery", "medical_visit", "prevention", "home_care"];
  }
}

// --- StepID → Phase マッピング ---
export function getPhaseFromStepId(stepId: string): Phase | null {
  const stepToPhase: Record<string, Phase> = {
    s1: "acute",
    s2: "rehab",
    s3: "discharge_prep",
    s4: "post_discharge",
    s5: "post_discharge",
    g1: "discovery",
    g2: "medical_visit",
    g3: "prevention",
    g4: "home_care",
    g5: "home_care",
  };
  return stepToPhase[stepId] || null;
}

// --- フローステップ構築 ---
function buildFlowSteps(onsetType: OnsetType, currentPhase: Phase): FlowStep[] {
  const steps = FLOW_STEPS[onsetType];
  const phaseToStepMapping: Record<string, string[]> = {
    acute: ["s1"],
    rehab: ["s2"],
    discharge_prep: ["s3"],
    post_discharge: ["s4", "s5"],
    discovery: ["g1"],
    medical_visit: ["g2"],
    prevention: ["g3"],
    home_care: ["g4"],
  };

  const currentStepIds = phaseToStepMapping[currentPhase] || [];

  return steps.map((step) => ({
    ...step,
    isCurrent: currentStepIds.includes(step.stepId),
  }));
}

// --- タスク構築 ---
function buildTasksForPhase(phase: Phase, now: string): Task[] {
  const templates = PHASE_TASKS[phase];
  return templates.map((tmpl, index) => ({
    taskId: generateId(),
    title: tmpl.title,
    description: tmpl.description,
    status: "todo" as const,
    source: "minimal" as const,
    priority: tmpl.priority,
    deadline: tmpl.deadline,
    parentTaskId: null,
    phase: phase, // タスクが属するフェーズを設定
    relatedServiceCategory: tmpl.relatedServiceCategory,
    moshimoNaviCategory: tmpl.moshimoNaviCategory, // A〜Eカテゴリを反映
    createdAt: now,
    updatedAt: now,
  }));
}

// --- フェーズラベル ---
function getPhaseLabelJa(phase: Phase): string {
  const labels: Record<Phase, string> = {
    acute: "急性期病院（入院0〜2週間）",
    rehab: "リハビリ病院（2週間〜3ヶ月）",
    discharge_prep: "退院準備（退院2〜4週前）",
    post_discharge: "退院後（在宅/施設）",
    discovery: "病気の発見・気づき",
    medical_visit: "受診・検査",
    prevention: "介護予防・申請準備",
    home_care: "在宅介護",
  };
  return labels[phase];
}

// --- 詳細診断の実行 ---
export function runDetailedDiagnosis(
  minimalDiagnosisId: string,
  input: DetailedDiagnosisInput,
  completedSteps: number
): DetailedDiagnosis {
  return {
    id: generateId(),
    minimalDiagnosisId,
    completedSteps,
    ...input,
    createdAt: new Date().toISOString(),
  };
}

// --- 詳細診断によるプランアップグレード ---
export function upgradePlanWithDetailedDiagnosis(
  plan: Plan,
  detailed: DetailedDiagnosis
): Plan {
  const now = new Date().toISOString();
  const updatedTasks = [...plan.tasks];
  const archivedTasks = [...plan.archivedTasks];

  // タスクマージ実行
  const mergeOperations = determineMergeOperations(plan, detailed);
  for (const op of mergeOperations) {
    applyMergeOperation(updatedTasks, archivedTasks, op, now);
  }

  // 制度適用可能性の生成
  const serviceEligibilities = generateServiceEligibilities(plan, detailed, updatedTasks);

  return {
    ...plan,
    version: "detailed",
    detailedDiagnosisId: detailed.id,
    tasks: updatedTasks,
    archivedTasks,
    serviceEligibilities,
    updatedAt: now,
  };
}

// ============================================================
// タスクマージエンジン
// ============================================================

interface MergeOperation {
  action: MergeAction;
  targetTaskId: string;
  enrichData?: Partial<Task>;
  replacementTask?: Omit<Task, "taskId" | "createdAt" | "updatedAt">;
  splitTasks?: Omit<Task, "taskId" | "createdAt" | "updatedAt">[];
}

function determineMergeOperations(
  plan: Plan,
  detailed: DetailedDiagnosis
): MergeOperation[] {
  const ops: MergeOperation[] = [];

  // 介護保険申請タスクの精緻化
  const careInsuranceTask = plan.tasks.find(
    (t) => t.title.includes("介護保険") && t.title.includes("申請")
  );
  if (careInsuranceTask && detailed.careLevel) {
    if (detailed.careLevel === "not_applied") {
      ops.push({
        action: "enrich",
        targetTaskId: careInsuranceTask.taskId,
        enrichData: {
          documents: ["介護保険要介護認定申請書", "健康保険被保険者証", "主治医意見書（医師に依頼）"],
          contactOffice: "市区町村の介護保険窓口 or 地域包括支援センター",
          description:
            careInsuranceTask.description +
            "\n\n【詳細】主治医意見書は市区町村から主治医に依頼されます。申請後、認定調査員が訪問調査を行い、約30日で認定結果が届きます。",
        },
      });
    } else if (detailed.careLevel === "applying") {
      ops.push({
        action: "replace",
        targetTaskId: careInsuranceTask.taskId,
        replacementTask: {
          title: "介護保険の認定結果を確認し、ケアマネージャーを選ぶ",
          description:
            "申請中とのこと。認定結果が届いたら、要介護度に応じてケアマネージャーを選び、ケアプランの作成を依頼しましょう。",
          status: "todo",
          source: "detailed",
          priority: "high",
          deadline: "within_2weeks",
          parentTaskId: null,
          relatedServiceCategory: "care_insurance",
          contactOffice: "地域包括支援センター（ケアマネ紹介）",
        },
      });
    }
  }

  // 医療依存度が高い場合のタスク分解
  if (detailed.medicalDependency === "medical_procedures") {
    const postDischargeTask = plan.tasks.find(
      (t) =>
        t.title.includes("退院後") ||
        t.title.includes("生活場所") ||
        t.title.includes("在宅") ||
        t.title.includes("環境")
    );
    if (postDischargeTask) {
      ops.push({
        action: "split",
        targetTaskId: postDischargeTask.taskId,
        splitTasks: [
          {
            title: "訪問看護ステーションを手配する",
            description:
              "医療処置が必要なため、訪問看護が不可欠です。ケアマネージャーまたは病院のMSWに訪問看護ステーションの紹介を依頼しましょう。",
            status: "todo",
            source: "detailed",
            priority: "high",
            deadline: "within_1week",
            parentTaskId: postDischargeTask.taskId,
            relatedServiceCategory: "medical",
            contactOffice: "病院の医療ソーシャルワーカー or ケアマネージャー",
          },
          {
            title: "在宅医（訪問診療医）を探す",
            description:
              "定期的な医師の訪問が必要です。病院から在宅医への紹介状をもらい、訪問診療の契約を行いましょう。",
            status: "todo",
            source: "detailed",
            priority: "high",
            deadline: "within_2weeks",
            parentTaskId: postDischargeTask.taskId,
            relatedServiceCategory: "medical",
          },
          {
            title: "医療機器・物品の手配を確認する",
            description:
              "吸引器、経管栄養のポンプ、酸素濃縮器など、必要な医療機器を確認し、レンタルまたは購入の手配を進めましょう。",
            status: "todo",
            source: "detailed",
            priority: "normal",
            deadline: "within_2weeks",
            parentTaskId: postDischargeTask.taskId,
            relatedServiceCategory: "medical",
          },
        ],
      });
    }
  }

  // 認知症がある場合の追記
  if (detailed.dementiaLevel && detailed.dementiaLevel !== "none") {
    const familyTask = plan.tasks.find(
      (t) => t.title.includes("家族") || t.title.includes("情報共有")
    );
    if (familyTask) {
      const dementiaNote =
        detailed.dementiaLevel === "mild"
          ? "\n\n【認知症対応】軽度の認知症があるため、本人の意思確認を早めに行いましょう。成年後見制度の検討も視野に入れてください。"
          : detailed.dementiaLevel === "moderate"
            ? "\n\n【認知症対応】中等度の認知症があります。徘徊防止、火の元管理、服薬管理の体制を整えましょう。グループホームも選択肢になります。"
            : "\n\n【認知症対応】重度の認知症があります。常時見守りが必要なため、施設入所（特養/グループホーム）の検討を急ぎましょう。成年後見制度の申立ても必要です。";

      ops.push({
        action: "enrich",
        targetTaskId: familyTask.taskId,
        enrichData: {
          description: familyTask.description + dementiaNote,
        },
      });
    }
  }

  // 経済的不安がある場合の追記
  if (detailed.financialConcern === "significant") {
    const financialTask = plan.tasks.find(
      (t) => t.title.includes("経済") || t.title.includes("費用") || t.title.includes("高額")
    );
    if (financialTask) {
      ops.push({
        action: "enrich",
        targetTaskId: financialTask.taskId,
        enrichData: {
          description:
            financialTask.description +
            "\n\n【経済的支援の追加情報】生活保護の申請、社会福祉協議会の生活福祉資金貸付、介護保険料の減免制度、障害者控除（要介護認定者向け）なども検討しましょう。",
          documents: [
            "高額介護サービス費支給申請書",
            "特定入所者介護サービス費（補足給付）申請書",
          ],
          contactOffice: "市区町村の福祉課 or 社会福祉協議会",
        },
      });
    }
  }

  // 障害者手帳がある場合
  if (detailed.disabilityCard === "yes") {
    const anyTask = plan.tasks[0]; // 先頭タスクに追記
    if (anyTask) {
      ops.push({
        action: "enrich",
        targetTaskId: anyTask.taskId,
        enrichData: {
          description:
            anyTask.description +
            "\n\n【障害者手帳あり】障害福祉サービスも利用可能です。介護保険との併用について、市区町村の障害福祉課に確認しましょう。",
        },
      });
    }
  }

  // 就労中の場合の追記
  if (
    detailed.employmentStatus === "fulltime" ||
    detailed.employmentStatus === "parttime"
  ) {
    // 全タスクの中で最も優先度の高いものに追記
    const highPriorityTask = plan.tasks.find((t) => t.priority === "high");
    if (highPriorityTask) {
      ops.push({
        action: "enrich",
        targetTaskId: highPriorityTask.taskId,
        enrichData: {
          description:
            highPriorityTask.description +
            "\n\n【仕事との両立】介護休業制度（93日間）や介護休暇（年5日）を利用できます。会社の人事部門に相談しましょう。介護休業給付金（賃金の67%）もハローワークで申請できます。",
        },
      });
    }
  }

  return ops;
}

// --- マージ操作の適用 ---
function applyMergeOperation(
  tasks: Task[],
  archivedTasks: Task[],
  op: MergeOperation,
  now: string
): void {
  const targetIndex = tasks.findIndex((t) => t.taskId === op.targetTaskId);
  if (targetIndex === -1) return;

  switch (op.action) {
    case "enrich": {
      if (!op.enrichData) return;
      const target = tasks[targetIndex];
      tasks[targetIndex] = {
        ...target,
        ...op.enrichData,
        description: op.enrichData.description ?? target.description,
        documents: op.enrichData.documents ?? target.documents,
        contactOffice: op.enrichData.contactOffice ?? target.contactOffice,
        mergedFrom: {
          action: "enrich",
          sourceTaskId: target.taskId,
          mergedAt: now,
        },
        updatedAt: now,
      };
      break;
    }
    case "replace": {
      if (!op.replacementTask) return;
      const oldTask = { ...tasks[targetIndex], archivedAt: now };
      archivedTasks.push(oldTask);
      tasks[targetIndex] = {
        ...op.replacementTask,
        taskId: oldTask.taskId, // IDを引き継ぐ
        mergedFrom: {
          action: "replace",
          sourceTaskId: oldTask.taskId,
          mergedAt: now,
        },
        createdAt: now,
        updatedAt: now,
      };
      break;
    }
    case "split": {
      if (!op.splitTasks || op.splitTasks.length === 0) return;
      // 親タスクはそのまま残す（子の進捗で管理）
      const parentTask = tasks[targetIndex];
      tasks[targetIndex] = {
        ...parentTask,
        mergedFrom: {
          action: "split",
          sourceTaskId: parentTask.taskId,
          mergedAt: now,
        },
        updatedAt: now,
      };
      // 子タスクを追加
      const childTasks: Task[] = op.splitTasks.map((st, i) => ({
        ...st,
        taskId: `${parentTask.taskId}-${i + 1}`,
        parentTaskId: parentTask.taskId,
        createdAt: now,
        updatedAt: now,
      }));
      // 親タスクの直後に子タスクを挿入
      tasks.splice(targetIndex + 1, 0, ...childTasks);
      break;
    }
  }
}

// --- 制度適用可能性の生成 ---
function generateServiceEligibilities(
  plan: Plan,
  detailed: DetailedDiagnosis,
  tasks: Task[]
): ServiceEligibility[] {
  const eligibilities: ServiceEligibility[] = [];

  // 介護保険
  const careInsuranceLinkedTask = tasks.find(
    (t) => t.relatedServiceCategory === "care_insurance" && !t.archivedAt
  );
  eligibilities.push({
    category: "care_insurance",
    serviceName: "介護保険サービス",
    isLikelyEligible: true, // ほぼ全員に関連
    linkedTaskId: careInsuranceLinkedTask?.taskId,
    description: "要介護認定を受けることで、訪問介護・デイサービス・ショートステイ・福祉用具レンタル等が1〜3割負担で利用できます。",
  });

  // 医療
  const medicalLinkedTask = tasks.find(
    (t) => t.relatedServiceCategory === "medical" && !t.archivedAt
  );
  eligibilities.push({
    category: "medical",
    serviceName: "医療保険制度",
    isLikelyEligible: true,
    linkedTaskId: medicalLinkedTask?.taskId,
    description: "高額療養費制度、訪問看護（医療保険適用）、訪問リハビリなどが利用可能です。",
  });

  // 自治体
  eligibilities.push({
    category: "municipal",
    serviceName: "自治体独自サービス",
    isLikelyEligible: true,
    description: "配食サービス、紙おむつ支給、緊急通報システム、家族介護者支援など、自治体ごとに独自のサービスがあります。お住まいの自治体に確認しましょう。",
  });

  // 経済的支援
  const financialLinkedTask = tasks.find(
    (t) => t.relatedServiceCategory === "financial" && !t.archivedAt
  );
  const hasFinancialConcern =
    detailed.financialConcern === "slight" ||
    detailed.financialConcern === "significant";
  eligibilities.push({
    category: "financial",
    serviceName: "経済的支援制度",
    isLikelyEligible: hasFinancialConcern,
    linkedTaskId: financialLinkedTask?.taskId,
    description: "高額介護サービス費、介護休業給付金、障害者控除、生活福祉資金貸付などが利用可能な場合があります。",
  });

  // 民間サービス
  eligibilities.push({
    category: "private",
    serviceName: "民間介護サービス",
    isLikelyEligible: false, // デフォルトは非強調
    description: "家事代行、見守りサービス、配食サービス、介護タクシーなど、保険外の民間サービスも選択肢に入ります。",
  });

  // 障害福祉
  const hasDisability = detailed.disabilityCard === "yes";
  eligibilities.push({
    category: "disability",
    serviceName: "障害福祉サービス",
    isLikelyEligible: hasDisability,
    description: "障害者手帳をお持ちの場合、介護保険に加えて障害福祉サービスも利用できる場合があります。",
  });

  return eligibilities;
}

// --- 親タスクの自動完了チェック ---
export function updateParentTaskStatus(tasks: Task[]): Task[] {
  const parentIds = [...new Set(tasks.filter((t) => t.parentTaskId).map((t) => t.parentTaskId!))];

  return tasks.map((task) => {
    if (parentIds.includes(task.taskId)) {
      const children = tasks.filter((t) => t.parentTaskId === task.taskId);
      const allDone = children.length > 0 && children.every((c) => c.status === "done");
      if (allDone && task.status !== "done") {
        return { ...task, status: "done" as const, updatedAt: new Date().toISOString() };
      }
    }
    return task;
  });
}
