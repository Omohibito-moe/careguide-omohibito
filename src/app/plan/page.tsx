"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppState } from "@/lib/store";
import { DEADLINE_LABELS, SERVICE_CATEGORY_LABELS } from "@/types";
import type { Task, ServiceEligibility } from "@/types";

export default function PlanPage() {
  const { plan, minimalDiagnosis, assessmentResult, toggleTaskStatus } = useAppState();
  const [showFlow, setShowFlow] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  if (!plan || !minimalDiagnosis) {
    return (
      <main className="min-h-screen bg-bg px-4 py-8 flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in-up">
          <div className="w-16 h-16 mx-auto bg-surface rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-text">まだ診断が完了していません</p>
          <Link
            href="/diagnosis"
            className="inline-block px-8 py-3 text-sm font-bold text-primary-dark bg-accent rounded-xl hover:bg-accent-dark hover:text-white transition-all"
          >
            診断を始める
          </Link>
        </div>
      </main>
    );
  }

  const completedCount = plan.tasks.filter((t) => t.status === "done").length;
  const totalCount = plan.tasks.filter((t) => !t.parentTaskId || t.parentTaskId === null).length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const topLevelTasks = plan.tasks.filter((t) => t.parentTaskId === null);
  const getChildTasks = (parentId: string) =>
    plan.tasks.filter((t) => t.parentTaskId === parentId);

  return (
    <main className="min-h-screen bg-bg px-4 py-6">
      <div className="max-w-lg mx-auto space-y-5 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-text-muted hover:text-text transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-text-dark">リライフプラン</h1>
          </div>
          <span
            className={`text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase ${
              plan.version === "detailed"
                ? "bg-primary/10 text-primary"
                : "bg-accent/15 text-accent-dark"
            }`}
          >
            {plan.version === "detailed" ? "詳細版" : "簡易版"}
          </span>
        </div>

        {/* Block 1: 現在地フェーズ */}
        <section className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border/30">
          <div className="bg-primary px-5 py-4">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h2 className="text-sm font-bold text-white/80 tracking-wide">いまの現在地</h2>
            </div>
            <p className="text-lg font-bold text-white">{plan.phaseLabelJa}</p>
          </div>
          <div className="px-5 py-4 space-y-3">
            <p className="text-sm text-text leading-relaxed">{plan.conclusionSummary}</p>
            <div className="bg-accent-light/20 rounded-xl p-3 border border-accent-light/30">
              <p className="text-xs text-accent-dark">
                <span className="font-bold">最初に連絡すべき窓口</span>
              </p>
              <p className="text-sm font-semibold text-text-dark mt-0.5">{plan.firstContact}</p>
            </div>
          </div>
        </section>

        {/* Block 2: タスク一覧 */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-border/30">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <h2 className="text-base font-bold text-text-dark">次の一手</h2>
              </div>
              <span className="text-xs font-medium text-text-muted">
                {completedCount}/{totalCount} 完了
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-surface rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
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
                    setExpandedTaskId(expandedTaskId === task.taskId ? null : task.taskId)
                  }
                  onToggleStatus={toggleTaskStatus}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Block 3: 全体フロー */}
        <section className="bg-white rounded-2xl shadow-sm border border-border/30 overflow-hidden">
          <button
            onClick={() => setShowFlow(!showFlow)}
            className="w-full flex items-center justify-between px-5 py-4"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <h2 className="text-base font-bold text-text-dark">全体の流れ</h2>
            </div>
            <svg
              className={`w-4 h-4 text-text-muted transition-transform duration-200 ${showFlow ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showFlow && (
            <div className="px-5 pb-5 animate-fade-in">
              <div className="space-y-0">
                {plan.flowSteps.map((step, index) => (
                  <div key={step.stepId} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${
                          step.isCurrent
                            ? "bg-primary border-primary"
                            : "bg-white border-border"
                        }`}
                      />
                      {index < plan.flowSteps.length - 1 && (
                        <div className="w-0.5 h-10 bg-border/50" />
                      )}
                    </div>
                    <div className="pb-4 -mt-0.5">
                      <p className={`text-sm font-semibold ${step.isCurrent ? "text-primary" : "text-text"}`}>
                        {step.label}
                        {step.isCurrent && (
                          <span className="ml-2 text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            いまここ
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Block 4: 制度カテゴリ（詳細版のみ） */}
        {plan.version === "detailed" && plan.serviceEligibilities && (
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-border/30">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h2 className="text-base font-bold text-text-dark">関連する制度・サービス</h2>
              </div>
              <div className="space-y-3">
                {plan.serviceEligibilities.map((se) => (
                  <ServiceEligibilityCard key={se.category} eligibility={se} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Block 5: 進め方ガイド（詳細診断後のみ） */}
        {assessmentResult && (
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-border/30">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <h2 className="text-base font-bold text-text-dark">進め方ガイド</h2>
              </div>
              {[assessmentResult.nextSteps.step1, assessmentResult.nextSteps.step2, assessmentResult.nextSteps.step3].map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-text-dark">{step.title}</h3>
                    <p className="text-xs text-text-muted mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Block 6: リスク警告 */}
        {assessmentResult && assessmentResult.risks.length > 0 && (
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-border/30">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-point" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-base font-bold text-text-dark">注意すべきリスク</h2>
              </div>
              {assessmentResult.risks.map((risk) => (
                <div key={risk.title} className="bg-point-light/20 rounded-xl p-4 border border-point-light/40 space-y-1.5">
                  <h3 className="text-sm font-semibold text-text-dark">{risk.title}</h3>
                  <p className="text-xs text-text-muted">理由: {risk.reason}</p>
                  <p className="text-xs text-text font-medium">対策: {risk.prevention}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Block 7: 家族会議ポイント */}
        {assessmentResult && assessmentResult.familyPoints.length > 0 && (
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-border/30">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h2 className="text-base font-bold text-text-dark">家族会議のポイント</h2>
              </div>
              {assessmentResult.familyPoints.map((fp) => (
                <div key={fp.title} className="bg-primary/5 rounded-xl p-4 border border-primary/10 space-y-1.5">
                  <h3 className="text-sm font-semibold text-text-dark">{fp.title}</h3>
                  <p className="text-xs text-text-muted">たたき台: {fp.draft}</p>
                  <p className="text-xs text-text-muted">用意するもの: {fp.material}</p>
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
              className="block w-full text-center py-4 text-base font-bold text-primary-dark bg-accent rounded-2xl hover:bg-accent-dark hover:text-white transition-all shadow-sm"
            >
              プランを精密化する
            </Link>
          )}
          <Link
            href="/consult"
            className="block w-full text-center py-3 text-sm font-medium text-primary border-2 border-primary rounded-2xl hover:bg-primary hover:text-white transition-all"
          >
            AIに次の一手を確認する
          </Link>
        </div>
      </div>
    </main>
  );
}

/* --- Task Item Component --- */
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
        className={`rounded-xl border p-3.5 transition-all ${
          task.status === "done"
            ? "bg-bg border-border/30"
            : "bg-white border-border/50"
        }`}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={() => {
              if (!hasChildren) onToggleStatus(task.taskId);
            }}
            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              task.status === "done"
                ? "bg-primary border-primary"
                : hasChildren
                  ? "border-border bg-surface/50 cursor-default"
                  : "border-border hover:border-primary-light"
            }`}
          >
            {task.status === "done" && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <button onClick={onToggleExpand} className="text-left w-full">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-medium ${task.status === "done" ? "text-text-muted line-through" : "text-text-dark"}`}>
                  {task.title}
                </span>
                {task.priority === "high" && task.status !== "done" && (
                  <span className="text-[10px] font-bold bg-point-light/30 text-point px-2 py-0.5 rounded-full">
                    優先
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-text-muted">
                  {DEADLINE_LABELS[task.deadline]}
                </span>
                {task.mergedFrom && (
                  <span className="text-[10px] text-primary-light font-medium">
                    {task.mergedFrom.action === "enrich" && "追記済み"}
                    {task.mergedFrom.action === "replace" && "更新済み"}
                    {task.mergedFrom.action === "split" && "分解済み"}
                  </span>
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="mt-3 space-y-2 text-sm text-text border-t border-border/30 pt-3 animate-fade-in">
                <p className="whitespace-pre-line text-xs leading-relaxed">{task.description}</p>
                {task.documents && task.documents.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-text-dark">必要書類</p>
                    <ul className="text-xs text-text-muted list-disc list-inside mt-1">
                      {task.documents.map((doc) => (
                        <li key={doc}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {task.contactOffice && (
                  <p className="text-xs">
                    <span className="font-semibold text-text-dark">窓口: </span>
                    <span className="text-text-muted">{task.contactOffice}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {hasChildren && (
        <div className="pl-6 space-y-1">
          {childTasks.map((child) => (
            <div
              key={child.taskId}
              className={`rounded-lg border p-3 transition-all ${
                child.status === "done"
                  ? "bg-bg border-border/30"
                  : "bg-white border-border/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onToggleStatus(child.taskId)}
                  className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    child.status === "done"
                      ? "bg-primary border-primary"
                      : "border-border hover:border-primary-light"
                  }`}
                >
                  {child.status === "done" && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <div className="flex-1">
                  <span className={`text-xs font-medium ${child.status === "done" ? "text-text-muted line-through" : "text-text-dark"}`}>
                    {child.title}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-text-muted">
                      {DEADLINE_LABELS[child.deadline]}
                    </span>
                    {child.priority === "high" && child.status !== "done" && (
                      <span className="text-[10px] font-bold bg-point-light/30 text-point px-1.5 py-0.5 rounded-full">
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

/* --- Service Eligibility Card --- */
function ServiceEligibilityCard({
  eligibility,
}: {
  eligibility: ServiceEligibility;
}) {
  return (
    <div
      className={`rounded-xl border-2 p-4 transition-all ${
        eligibility.isLikelyEligible
          ? "border-accent/50 bg-accent-light/10"
          : "border-border/50 bg-white"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold text-text-dark">
          {SERVICE_CATEGORY_LABELS[eligibility.category]}
        </span>
        {eligibility.isLikelyEligible && (
          <span className="text-[10px] font-bold bg-accent/15 text-accent-dark px-2 py-0.5 rounded-full">
            あなたに関係あり
          </span>
        )}
      </div>
      <p className="text-xs text-text-muted">{eligibility.description}</p>
      {eligibility.linkedTaskId && (
        <p className="text-[10px] text-primary-light mt-2 font-medium">
          → 対応タスクあり
        </p>
      )}
    </div>
  );
}
