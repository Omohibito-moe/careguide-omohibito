"use client";

import Link from "next/link";
import { useAppState } from "@/lib/store";
import { ONSET_TYPE_LABELS, PHASE_LABELS } from "@/types";

export default function ConsultPage() {
  const { plan, minimalDiagnosis } = useAppState();

  if (!plan || !minimalDiagnosis) {
    return (
      <main className="min-h-screen bg-white px-4 py-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-600">まず診断を完了してください</p>
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

  const completedTasks = plan.tasks.filter((t) => t.status === "done").length;
  const totalTasks = plan.tasks.length;
  const pendingHighPriority = plan.tasks.filter(
    (t) => t.status === "todo" && t.priority === "high"
  );

  // ケース要約を生成
  const caseSummary = [
    `発生タイプ: ${ONSET_TYPE_LABELS[minimalDiagnosis.onsetType]}`,
    `現在地: ${PHASE_LABELS[minimalDiagnosis.phase]}`,
    `タスク進捗: ${completedTasks}/${totalTasks}件完了`,
    pendingHighPriority.length > 0
      ? `未完了の優先タスク: ${pendingHighPriority.map((t) => t.title).join("、")}`
      : "優先タスクはすべて完了",
  ].join("\n");

  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Link href="/plan" className="text-sm text-blue-600 hover:underline">
            ← プランに戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            AIに次の一手を確認する
          </h1>
          <p className="text-sm text-gray-500">
            あなたの状況をまとめました。LINEで相談できます。
          </p>
        </div>

        {/* Case Summary */}
        <section className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
          <h2 className="text-base font-semibold text-gray-800 mb-3">
            あなたのケース要約
          </h2>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-500">発生タイプ</span>
              <span className="font-medium">
                {ONSET_TYPE_LABELS[minimalDiagnosis.onsetType]}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">現在地</span>
              <span className="font-medium">
                {PHASE_LABELS[minimalDiagnosis.phase]}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">タスク進捗</span>
              <span className="font-medium">
                {completedTasks}/{totalTasks} 件完了
              </span>
            </div>
            {pendingHighPriority.length > 0 && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-gray-500 mb-1">未完了の優先タスク：</p>
                <ul className="list-disc list-inside text-gray-700">
                  {pendingHighPriority.map((t) => (
                    <li key={t.taskId}>{t.title}</li>
                  ))}
                </ul>
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
            className="block w-full text-center py-4 text-base font-semibold text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors shadow-lg"
          >
            LINEで相談する
          </a>
          <p className="text-xs text-gray-400 text-center">
            LINEでの相談は無料です。AIが要約・追加質問・次の一手を返答します。
          </p>
        </div>

        {/* Expected response format */}
        <section className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">
            LINE相談での返答フォーマット
          </h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>1. あなたの状況の要約</p>
            <p>2. 追加質問（最大2問）</p>
            <p>3. 次の一手（3つ）</p>
          </div>
        </section>
      </div>
    </main>
  );
}
