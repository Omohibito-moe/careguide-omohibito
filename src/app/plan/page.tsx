"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppState } from "@/lib/store";
import { DEADLINE_LABELS, SERVICE_CATEGORY_LABELS } from "@/types";
import type { Task, ServiceEligibility } from "@/types";

export default function PlanPage() {
  const router = useRouter();
  const { plan, minimalDiagnosis, assessmentResult, toggleTaskStatus } = useAppState();
  const [showFlow, setShowFlow] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // プランがなければ診断へリダイレクト
  if (!plan || !minimalDiagnosis) {
    return (
      <main className="min-h-screen bg-white px-4 py-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-600">まだ診断が完了していません</p>
          <Link
            href="/diagnosis"
            className="inline-block px-6 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
          >
            診断を始める
          </Link>
        </div>
      </main>
    );
  }

  const completedCount = plan.tasks.filter((t) => t.status === "done").length;
  const totalCount = plan.tasks.filter((t) => !t.parentTaskId || t.parentTaskId === null).length;

  // 親タスクとその子タスクをグループ化
  const topLevelTasks = plan.tasks.filter((t) => t.parentTaskId === null);
  const getChildTasks = (parentId: string) =>
    plan.tasks.filter((t) => t.parentTaskId === parentId);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">リライフプラン</h1>
          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${
              plan.version === "detailed"
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {plan.version === "detailed" ? "詳細版" : "簡易版"}
          </span>
        </div>

        {/* Block 1: 現在地フェーズ */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📍</span>
              <h2 className="text-lg font-bold text-gray-900">いまの現在地</h2>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-lg font-semibold text-blue-800">{plan.phaseLabelJa}</p>
            </div>
            <p className="text-gray-700">{plan.conclusionSummary}</p>
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
              <p className="text-sm text-amber-800">
                <span className="font-semibold">最初に連絡すべき窓口：</span>
                {plan.firstContact}
              </p>
            </div>
          </div>
        </section>

        {/* Block 2: 次の一手（タスク一覧） */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✅</span>
                <h2 className="text-lg font-bold text-gray-900">次の一手</h2>
              </div>
              <span className="text-sm text-gray-500">
                {completedCount}/{totalCount} 完了
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                }}
              />
            </div>

            {/* Task list */}
            <div className="space-y-2">
              {topLevelTasks.map((task) => (
                <TaskItem
                  key={task.taskId}
                  task={task}
                  childTasks={getChildTasks(task.taskId)}
                  isExpanded={expandedTaskId === task.taskId}
                  onToggleExpand={() =>
                    setExpandedTaskId(
                      expandedTaskId === task.taskId ? null : task.taskId
                    )
                  }
                  onToggleStatus={toggleTaskStatus}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Block 3: 全体フロー */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <button
            onClick={() => setShowFlow(!showFlow)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">🗺️</span>
              <h2 className="text-lg font-bold text-gray-900">全体の流れ</h2>
            </div>
            <span className="text-gray-400 text-xl">{showFlow ? "▼" : "▶"}</span>
          </button>
          {showFlow && (
            <div className="mt-4 space-y-0">
              {plan.flowSteps.map((step, index) => (
                <div key={step.stepId} className="flex items-start gap-3">
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        step.isCurrent
                          ? "bg-blue-600 border-blue-600"
                          : "bg-white border-gray-300"
                      }`}
                    />
                    {index < plan.flowSteps.length - 1 && (
                      <div className="w-0.5 h-12 bg-gray-200" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-6">
                    <p
                      className={`font-semibold ${
                        step.isCurrent ? "text-blue-700" : "text-gray-700"
                      }`}
                    >
                      {step.label}
                      {step.isCurrent && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          いまここ
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Block 4: 制度カテゴリ（詳細版のみ） */}
        {plan.version === "detailed" && plan.serviceEligibilities && (
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📋</span>
                <h2 className="text-lg font-bold text-gray-900">
                  関連する制度・サービス
                </h2>
              </div>
              <div className="space-y-3">
                {plan.serviceEligibilities.map((se) => (
                  <ServiceEligibilityCard key={se.category} eligibility={se} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Block 5: 次の一手 3ステップ（詳細診断後のみ） */}
        {assessmentResult && (
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧭</span>
                <h2 className="text-lg font-bold text-gray-900">進め方ガイド（3ステップ）</h2>
              </div>
              {[assessmentResult.nextSteps.step1, assessmentResult.nextSteps.step2, assessmentResult.nextSteps.step3].map((step, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <h3 className="font-semibold text-gray-800 text-sm">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Block 6: リスク警告（詳細診断後のみ） */}
        {assessmentResult && assessmentResult.risks.length > 0 && (
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">&#x26A0;&#xFE0F;</span>
                <h2 className="text-lg font-bold text-gray-900">注意すべきリスク</h2>
              </div>
              {assessmentResult.risks.map((risk) => (
                <div key={risk.title} className="bg-amber-50 rounded-xl p-4 border border-amber-200 space-y-1">
                  <h3 className="font-semibold text-amber-800 text-sm">{risk.title}</h3>
                  <p className="text-xs text-amber-700">理由: {risk.reason}</p>
                  <p className="text-xs text-amber-900">対策: {risk.prevention}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Block 7: 家族会議ポイント（詳細診断後のみ） */}
        {assessmentResult && assessmentResult.familyPoints.length > 0 && (
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">&#x1F4AC;</span>
                <h2 className="text-lg font-bold text-gray-900">家族会議のポイント</h2>
              </div>
              {assessmentResult.familyPoints.map((fp) => (
                <div key={fp.title} className="bg-purple-50 rounded-xl p-4 border border-purple-200 space-y-1">
                  <h3 className="font-semibold text-purple-800 text-sm">{fp.title}</h3>
                  <p className="text-xs text-purple-700">たたき台: {fp.draft}</p>
                  <p className="text-xs text-purple-600">用意するもの: {fp.material}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTAs */}
        <div className="space-y-3 pb-8">
          {plan.version === "minimal" && (
            <Link
              href="/diagnosis/detailed"
              className="block w-full text-center py-4 text-base font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-200"
            >
              プランを精密化する（詳細診断）
            </Link>
          )}
          <Link
            href="/consult"
            className="block w-full text-center py-3 text-base text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
          >
            AIに次の一手を確認する
          </Link>
        </div>
      </div>
    </main>
  );
}

// --- Task Item Component ---
function TaskItem({
  task,
  childTasks,
  isExpanded,
  onToggleExpand,
  onToggleStatus,
}: {
  task: Task;
  childTasks: Task[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleStatus: (taskId: string) => void;
}) {
  const hasChildren = childTasks.length > 0;

  return (
    <div className="space-y-1">
      <div
        className={`rounded-xl border p-3 transition-all ${
          task.status === "done"
            ? "bg-gray-50 border-gray-200"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={() => {
              if (!hasChildren) onToggleStatus(task.taskId);
            }}
            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              task.status === "done"
                ? "bg-blue-600 border-blue-600"
                : hasChildren
                  ? "border-gray-300 bg-gray-100 cursor-default"
                  : "border-gray-300 hover:border-blue-400"
            }`}
          >
            {task.status === "done" && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <button
              onClick={onToggleExpand}
              className="text-left w-full"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`font-medium ${
                    task.status === "done" ? "text-gray-400 line-through" : "text-gray-900"
                  }`}
                >
                  {task.title}
                </span>
                {task.priority === "high" && task.status !== "done" && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                    優先
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400">
                  {DEADLINE_LABELS[task.deadline]}
                </span>
                {task.mergedFrom && (
                  <span className="text-xs text-green-600">
                    {task.mergedFrom.action === "enrich" && "追記済み"}
                    {task.mergedFrom.action === "replace" && "更新済み"}
                    {task.mergedFrom.action === "split" && "分解済み"}
                  </span>
                )}
              </div>
            </button>

            {/* Expanded detail */}
            {isExpanded && (
              <div className="mt-3 space-y-2 text-sm text-gray-600 border-t pt-3">
                <p className="whitespace-pre-line">{task.description}</p>
                {task.documents && task.documents.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-700">必要書類：</p>
                    <ul className="list-disc list-inside text-gray-500">
                      {task.documents.map((doc) => (
                        <li key={doc}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {task.contactOffice && (
                  <p>
                    <span className="font-medium text-gray-700">窓口：</span>
                    {task.contactOffice}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Child tasks */}
      {hasChildren && (
        <div className="pl-6 space-y-1">
          {childTasks.map((child) => (
            <div
              key={child.taskId}
              className={`rounded-lg border p-3 transition-all ${
                child.status === "done"
                  ? "bg-gray-50 border-gray-200"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onToggleStatus(child.taskId)}
                  className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    child.status === "done"
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {child.status === "done" && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <div className="flex-1">
                  <span
                    className={`text-sm font-medium ${
                      child.status === "done" ? "text-gray-400 line-through" : "text-gray-800"
                    }`}
                  >
                    {child.title}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">
                      {DEADLINE_LABELS[child.deadline]}
                    </span>
                    {child.priority === "high" && child.status !== "done" && (
                      <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                        優先
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Service Eligibility Card ---
function ServiceEligibilityCard({
  eligibility,
}: {
  eligibility: ServiceEligibility;
}) {
  return (
    <div
      className={`rounded-xl border-2 p-4 ${
        eligibility.isLikelyEligible
          ? "border-red-300 bg-red-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold text-gray-900">
          {SERVICE_CATEGORY_LABELS[eligibility.category]}
        </span>
        {eligibility.isLikelyEligible && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
            あなたに関係あり
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600">{eligibility.description}</p>
      {eligibility.linkedTaskId && (
        <p className="text-xs text-blue-600 mt-2">
          → 対応タスクあり
        </p>
      )}
    </div>
  );
}
