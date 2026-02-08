"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppState } from "@/lib/store";
import { useLiff } from "@/lib/liff";
import { getPhaseFromStepId } from "@/lib/diagnosis";
import { DEADLINE_LABELS, SERVICE_CATEGORY_LABELS, ONSET_TYPE_LABELS } from "@/types";
import type { Task, ServiceEligibility, FlowStep, Phase } from "@/types";

type TabId = "flow" | "services";

export default function PlanPage() {
  const { plan, minimalDiagnosis, assessmentResult, toggleTaskStatus } = useAppState();
  const { shareMessage, isInClient } = useLiff();
  const [activeTab, setActiveTab] = useState<TabId>("flow");
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

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

  const currentStep = plan.flowSteps.find((s) => s.isCurrent);
  const activeStepId = selectedStepId || currentStep?.stepId || plan.flowSteps[0]?.stepId;

  // Get phase for the active step
  const activePhase = getPhaseFromStepId(activeStepId) || plan.phase;

  // Calculate task counts - filter by active phase
  const topLevelTasks = plan.tasks.filter((t) => t.parentTaskId === null && t.phase === activePhase);
  const completedCount = topLevelTasks.filter((t) => t.status === "done").length;
  const totalCount = topLevelTasks.length;
  const getChildTasks = (parentId: string) =>
    plan.tasks.filter((t) => t.parentTaskId === parentId);

  // Extract time period from flow step description (text before first 。)
  const getTimePeriod = (step: FlowStep) => {
    const period = step.description.split("。")[0];
    return period || "";
  };

  // Calculate per-step progress (tasks filtered by phase)
  const getStepProgress = (step: FlowStep) => {
    const stepPhase = getPhaseFromStepId(step.stepId);
    if (!stepPhase) return { completed: 0, total: 0, percent: 0 };

    const stepTasks = plan.tasks.filter((t) => t.parentTaskId === null && t.phase === stepPhase);
    const stepCompleted = stepTasks.filter((t) => t.status === "done").length;
    const stepTotal = stepTasks.length;
    const percent = stepTotal > 0 ? Math.round((stepCompleted / stepTotal) * 100) : 0;

    return { completed: stepCompleted, total: stepTotal, percent };
  };

  return (
    <main className="min-h-screen bg-bg">
      <div className="max-w-6xl mx-auto px-4 py-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-text-muted hover:text-text transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-text-dark">リライフプラン</h1>
              <p className="text-xs text-text-muted mt-0.5">
                {plan.conclusionSummary}
              </p>
            </div>
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

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 border-b border-border/50">
          <button
            onClick={() => setActiveTab("flow")}
            className={`px-5 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === "flow"
                ? "border-primary text-text-dark"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            対応フロー
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`px-5 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === "services"
                ? "border-primary text-text-dark"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            {plan.version === "detailed" ? "制度・サービス" : "資料庫"}
          </button>
        </div>

        {/* Tab content: 対応フロー */}
        {activeTab === "flow" && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left column: Flow */}
            <div className="lg:w-[380px] flex-shrink-0 space-y-4">
              {/* Onset type label */}
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-text-dark">介護の流れ</h2>
                <span className="text-xs font-medium text-text-muted bg-surface px-3 py-1 rounded-full">
                  {ONSET_TYPE_LABELS[minimalDiagnosis.onsetType]}
                </span>
              </div>

              {/* Flow step cards */}
              <div className="space-y-3">
                {plan.flowSteps.map((step) => {
                  const progress = getStepProgress(step);
                  const isActive = step.stepId === activeStepId;
                  const isPast = step.order < (currentStep?.order ?? 0);
                  const isFuture = step.order > (currentStep?.order ?? 999);

                  return (
                    <button
                      key={step.stepId}
                      onClick={() => setSelectedStepId(step.stepId)}
                      className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-200 ${
                        isActive
                          ? "border-primary bg-white shadow-sm"
                          : step.isCurrent
                            ? "border-accent/40 bg-white"
                            : "border-border/30 bg-white hover:border-border/60"
                      } ${isFuture ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {step.isCurrent && (
                            <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                          )}
                          {isPast && (
                            <svg className="w-4 h-4 text-primary-light flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          <span className={`text-sm font-bold ${step.isCurrent ? "text-text-dark" : isPast ? "text-primary-light" : "text-text-muted"}`}>
                            {step.label}
                          </span>
                        </div>
                        <span className="text-[11px] text-text-muted whitespace-nowrap ml-2">
                          {getTimePeriod(step)}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-surface rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              step.isCurrent ? "bg-primary" : isPast ? "bg-primary-light" : "bg-border"
                            }`}
                            style={{ width: `${step.isCurrent ? progress.percent : isPast ? 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-text-muted font-medium w-8 text-right">
                          {step.isCurrent ? `${progress.percent}%` : isPast ? "済" : "0%"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* First contact card */}
              <div className="bg-accent-light/20 rounded-xl p-4 border border-accent-light/30">
                <p className="text-[11px] font-bold text-accent-dark tracking-wide mb-1">最初に連絡すべき窓口</p>
                <p className="text-sm font-semibold text-text-dark">{plan.firstContact}</p>
              </div>
            </div>

            {/* Right column: Tasks */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-text-dark">やるべきことと参考資料</h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    現在のフェーズで優先すべきタスクと参考資料
                  </p>
                </div>
                <span className="text-xs text-text-muted font-medium bg-surface px-3 py-1 rounded-full">
                  {completedCount}/{totalCount} 完了
                </span>
              </div>

              {/* Task list */}
              <div className="space-y-3">
                {topLevelTasks.map((task) => (
                  <TaskCard
                    key={task.taskId}
                    task={task}
                    childTasks={getChildTasks(task.taskId)}
                    isExpanded={expandedTaskId === task.taskId}
                    phaseLabelJa={plan.phaseLabelJa}
                    onToggleExpand={() =>
                      setExpandedTaskId(expandedTaskId === task.taskId ? null : task.taskId)
                    }
                    onToggleStatus={toggleTaskStatus}
                  />
                ))}
              </div>

              {/* CTAs */}
              <div className="mt-8 space-y-3">
                {plan.version === "minimal" && (
                  <Link
                    href="/diagnosis/detailed"
                    className="block w-full text-center py-4 text-base font-bold text-primary-dark bg-accent rounded-2xl hover:bg-accent-dark hover:text-white transition-all shadow-sm"
                  >
                    プランを精密化する（詳細診断）
                  </Link>
                )}
                <Link
                  href="/chat"
                  className="block w-full text-center py-3 text-sm font-medium text-primary border-2 border-primary rounded-2xl hover:bg-primary hover:text-white transition-all"
                >
                  AIに次の一手を確認する
                </Link>
                {/* LINEシェアボタン（LIFF内のみ表示） */}
                {isInClient && (
                  <button
                    onClick={() => {
                      const summary = [
                        `【ケアガイド】リライフプラン`,
                        plan.conclusionSummary,
                        ``,
                        `進捗: ${completedCount}/${totalCount}件完了`,
                        `最初に連絡: ${plan.firstContact}`,
                        ``,
                        `詳しくはケアガイドで確認できます。`,
                      ].join("\n");
                      shareMessage(summary);
                    }}
                    className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium text-[#06C755] border-2 border-[#06C755] rounded-2xl hover:bg-[#06C755] hover:text-white transition-all"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                    </svg>
                    家族にLINEで共有する
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab content: 制度・サービス */}
        {activeTab === "services" && (
          <div className="max-w-2xl space-y-6">
            {/* Service eligibilities */}
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

            {/* Next steps guide */}
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

            {/* Risks */}
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

            {/* Family meeting points */}
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

            {/* Empty state for simple version */}
            {plan.version === "minimal" && !assessmentResult && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-surface rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-sm text-text-muted mb-1">詳細診断を受けると制度・サービス情報が表示されます</p>
                <Link
                  href="/diagnosis/detailed"
                  className="inline-block mt-3 px-6 py-2.5 text-sm font-bold text-primary-dark bg-accent rounded-xl hover:bg-accent-dark hover:text-white transition-all"
                >
                  詳細診断を受ける
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

/* --- Task Card Component --- */
function TaskCard({
  task,
  childTasks,
  isExpanded,
  phaseLabelJa,
  onToggleExpand,
  onToggleStatus,
}: {
  task: Task;
  childTasks: Task[];
  isExpanded: boolean;
  phaseLabelJa: string;
  onToggleExpand: () => void;
  onToggleStatus: (taskId: string) => void;
}) {
  const hasChildren = childTasks.length > 0;
  const isDone = task.status === "done";

  return (
    <div className="space-y-2">
      <div
        className={`relative bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
          isDone ? "border-border/20 opacity-70" : "border-border/40 shadow-sm"
        }`}
      >
        <div className="flex items-start gap-3 p-4">
          {/* Checkbox */}
          <button
            onClick={() => {
              if (!hasChildren) onToggleStatus(task.taskId);
            }}
            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              isDone
                ? "bg-primary border-primary"
                : hasChildren
                  ? "border-border bg-surface/50 cursor-default"
                  : "border-border hover:border-primary-light"
            }`}
          >
            {isDone && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          {/* Content */}
          <button onClick={onToggleExpand} className="flex-1 text-left min-w-0">
            <p className={`text-sm font-semibold leading-snug ${isDone ? "text-text-muted line-through" : "text-text-dark"}`}>
              {task.title}
            </p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[11px] text-text-muted">{phaseLabelJa}</span>
              <span className="flex items-center gap-1 text-[11px] text-text-muted">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {DEADLINE_LABELS[task.deadline]}
              </span>
            </div>
          </button>

          {/* Priority badge */}
          {task.priority === "high" && !isDone && (
            <span className="flex-shrink-0 text-[10px] font-bold bg-point/10 text-point px-2.5 py-1 rounded-full">
              優先
            </span>
          )}

          {/* Merge badge */}
          {task.mergedFrom && (
            <span className="flex-shrink-0 text-[10px] font-medium text-primary-light">
              {task.mergedFrom.action === "enrich" && "追記"}
              {task.mergedFrom.action === "replace" && "更新"}
              {task.mergedFrom.action === "split" && "分解"}
            </span>
          )}
        </div>

        {/* Right priority indicator */}
        {task.priority === "high" && !isDone && (
          <div className="absolute top-0 right-0 w-1 h-full bg-point rounded-r-xl" />
        )}

        {/* Expanded detail */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-0 border-t border-border/20 animate-fade-in">
            <div className="mt-3 space-y-3">
              <p className="text-xs text-text leading-relaxed whitespace-pre-line">{task.description}</p>
              {task.documents && task.documents.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-text-dark mb-1">必要書類</p>
                  <div className="flex flex-wrap gap-2">
                    {task.documents.map((doc) => (
                      <span key={doc} className="text-[11px] text-text-muted bg-surface px-2.5 py-1 rounded-lg">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {task.contactOffice && (
                <div className="flex items-center gap-2 text-xs">
                  <svg className="w-3.5 h-3.5 text-primary-light flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-text">{task.contactOffice}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Child tasks */}
      {hasChildren && (
        <div className="pl-8 space-y-2">
          {childTasks.map((child) => {
            const childDone = child.status === "done";
            return (
              <div
                key={child.taskId}
                className={`bg-white rounded-lg border p-3 transition-all ${
                  childDone ? "border-border/20 opacity-70" : "border-border/40"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onToggleStatus(child.taskId)}
                    className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      childDone
                        ? "bg-primary border-primary"
                        : "border-border hover:border-primary-light"
                    }`}
                  >
                    {childDone && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className={`text-xs font-medium ${childDone ? "text-text-muted line-through" : "text-text-dark"}`}>
                      {child.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-text-muted">
                        {DEADLINE_LABELS[child.deadline]}
                      </span>
                      {child.priority === "high" && !childDone && (
                        <span className="text-[10px] font-bold text-point">優先</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
        <p className="text-[10px] text-primary-light mt-2 font-medium">→ 対応タスクあり</p>
      )}
    </div>
  );
}
