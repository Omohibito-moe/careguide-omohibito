"use client";

import Link from "next/link";
import { useAppState } from "@/lib/store";
import { ONSET_TYPE_LABELS, PHASE_LABELS } from "@/types";

export default function ConsultPage() {
  const { plan, minimalDiagnosis } = useAppState();

  if (!plan || !minimalDiagnosis) {
    return (
      <main className="min-h-screen bg-bg px-4 py-8 flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in-up">
          <div className="w-16 h-16 mx-auto bg-surface rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-text">まず診断を完了してください</p>
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

  const completedTasks = plan.tasks.filter((t) => t.status === "done").length;
  const totalTasks = plan.tasks.length;
  const pendingHighPriority = plan.tasks.filter(
    (t) => t.status === "todo" && t.priority === "high"
  );

  const caseSummary = [
    `発生タイプ: ${ONSET_TYPE_LABELS[minimalDiagnosis.onsetType]}`,
    `現在地: ${PHASE_LABELS[minimalDiagnosis.phase]}`,
    `タスク進捗: ${completedTasks}/${totalTasks}件完了`,
    pendingHighPriority.length > 0
      ? `未完了の優先タスク: ${pendingHighPriority.map((t) => t.title).join("、")}`
      : "優先タスクはすべて完了",
  ].join("\n");

  return (
    <main className="min-h-screen bg-bg px-4 py-6">
      <div className="max-w-lg mx-auto space-y-5 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/plan" className="text-text-muted hover:text-text transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text-dark">
              AIに次の一手を確認する
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              あなたの状況をまとめました。LINEで相談できます。
            </p>
          </div>
        </div>

        {/* Case Summary */}
        <section className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border/30">
          <div className="bg-primary px-5 py-3">
            <h2 className="text-sm font-bold text-white/80 tracking-wide">あなたのケース要約</h2>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <span className="text-xs text-text-muted">発生タイプ</span>
              <span className="text-sm font-medium text-text-dark">
                {ONSET_TYPE_LABELS[minimalDiagnosis.onsetType]}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <span className="text-xs text-text-muted">現在地</span>
              <span className="text-sm font-medium text-text-dark">
                {PHASE_LABELS[minimalDiagnosis.phase]}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <span className="text-xs text-text-muted">タスク進捗</span>
              <span className="text-sm font-medium text-text-dark">
                {completedTasks}/{totalTasks} 件完了
              </span>
            </div>
            {pendingHighPriority.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-text-muted mb-2">未完了の優先タスク</p>
                <div className="space-y-1">
                  {pendingHighPriority.map((t) => (
                    <div key={t.taskId} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-point flex-shrink-0" />
                      <span className="text-xs text-text-dark">{t.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* LINE CTA */}
        <div className="space-y-4">
          <a
            href={`https://line.me/R/oaMessage/@careguide/?${encodeURIComponent(caseSummary)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 text-base font-bold text-white bg-[#06C755] rounded-2xl hover:bg-[#05b04c] transition-all shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
            LINEで相談する
          </a>
          <p className="text-[11px] text-text-muted text-center">
            LINEでの相談は無料です。AIが要約・追加質問・次の一手を返答します。
          </p>
        </div>

        {/* Expected response format */}
        <section className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
          <h3 className="text-sm font-bold text-text-dark mb-3">
            LINE相談での返答フォーマット
          </h3>
          <div className="space-y-2">
            {[
              { num: 1, text: "あなたの状況の要約" },
              { num: 2, text: "追加質問（最大2問）" },
              { num: 3, text: "次の一手（3つ）" },
            ].map((item) => (
              <div key={item.num} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">{item.num}</span>
                </div>
                <p className="text-sm text-text">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
