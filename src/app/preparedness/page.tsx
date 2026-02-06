"use client";

import { useState } from "react";
import Link from "next/link";
import type { PreparednessAnswers } from "@/types/legacy";
import { PREPAREDNESS_QUESTIONS } from "@/lib/legacy-constants";
import { calculatePreparednessResult } from "@/lib/legacy-logic";
import { useAppState } from "@/lib/store";

export default function PreparednessPage() {
  const { preparednessResult, setPreparednessResult } = useAppState();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(!!preparednessResult);

  const question = PREPAREDNESS_QUESTIONS[currentQ];
  const isLastQuestion = currentQ === PREPAREDNESS_QUESTIONS.length - 1;
  const isAnswered = !!answers[question?.id];

  const handleSelect = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    const prepAnswers: PreparednessAnswers = {
      p_target: answers["p_target"] || "",
      parent_age: answers["parent_age"] || "",
      parent_living: answers["parent_living"] || "",
      parent_lastSeen: answers["parent_lastSeen"] || "",
      q_info_doctor: answers["q_info_doctor"] || "",
      q_info_meds: answers["q_info_meds"] || "",
      q_info_cards_location: answers["q_info_cards_location"] || "",
      q_info_support_contact: answers["q_info_support_contact"] || "",
      q_safe_fall_prevention: answers["q_safe_fall_prevention"] || "",
      q_safe_heatshock_prevention: answers["q_safe_heatshock_prevention"] || "",
      q_safe_outing_prevention: answers["q_safe_outing_prevention"] || "",
      q_safe_found_quickly: answers["q_safe_found_quickly"] || "",
      q_cap_weekday_available: answers["q_cap_weekday_available"] || "",
      q_cap_helpers_exist: answers["q_cap_helpers_exist"] || "",
      q_cap_roles_defined: answers["q_cap_roles_defined"] || "",
      q_cap_conflict_risk: answers["q_cap_conflict_risk"] || "",
      q_money_policy: answers["q_money_policy"] || "",
      q_money_bills_and_accounts: answers["q_money_bills_and_accounts"] || "",
      q_money_advance_rule: answers["q_money_advance_rule"] || "",
      q_money_docs_place: answers["q_money_docs_place"] || "",
      q_axis_priority: answers["q_axis_priority"] || "",
    };

    const result = calculatePreparednessResult(prepAnswers);
    setPreparednessResult(result);
    setShowResult(true);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQ((prev) => prev + 1);
    }
  };

  // 結果表示
  if (showResult && preparednessResult) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="space-y-2">
            <Link href="/" className="text-sm text-blue-600 hover:underline">
              &larr; トップに戻る
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">備えの診断結果</h1>
          </div>

          {/* Summary */}
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <p className="text-gray-700 whitespace-pre-line">{preparednessResult.summary}</p>
          </section>

          {/* Risks */}
          {preparednessResult.risks.length > 0 && (
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">注意すべきリスク</h2>
              {preparednessResult.risks.map((risk) => (
                <div key={risk.id} className="bg-amber-50 rounded-xl p-4 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      risk.severity >= 5 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      深刻度 {risk.severity}/5
                    </span>
                    <h3 className="font-semibold text-gray-800 text-sm">{risk.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{risk.description.summary}</p>
                  <ul className="text-xs text-gray-500 list-disc list-inside">
                    {risk.description.detailBullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                  <div className="pt-2">
                    <p className="text-xs font-medium text-gray-700">話し合うべきポイント:</p>
                    <ul className="text-xs text-gray-500 list-disc list-inside">
                      {risk.discussionPoints.map((dp) => (
                        <li key={dp}>{dp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Cards */}
          {preparednessResult.cards.length > 0 && (
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
              <h2 className="text-lg font-bold text-gray-900">チェックカード</h2>
              {preparednessResult.cards.map((card) => (
                <div key={card.cardId} className="bg-blue-50 rounded-xl p-4 border border-blue-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      card.badge === "必須" ? "bg-red-100 text-red-700" : card.badge === "重要" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {card.badge}
                    </span>
                    <h3 className="font-semibold text-gray-800 text-sm">{card.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{card.why}</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    {card.checkPoints.map((cp) => (
                      <li key={cp} className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded border border-gray-300 flex-shrink-0" />
                        {cp}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {/* Next Action */}
          <section className="bg-green-50 rounded-2xl p-5 border border-green-200">
            <h3 className="font-semibold text-green-800 text-sm mb-2">次にやること</h3>
            <p className="text-sm text-green-700">{preparednessResult.finalNextAction}</p>
          </section>

          {/* Restart */}
          <button
            onClick={() => { setShowResult(false); setCurrentQ(0); setAnswers({}); }}
            className="w-full py-3 text-sm text-gray-500 hover:text-gray-700"
          >
            もう一度診断する
          </button>
        </div>
      </main>
    );
  }

  // 質問画面
  if (!question) return null;

  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="space-y-2">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            &larr; トップに戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">将来に備える診断</h1>
          <p className="text-sm text-gray-500">家族の「もしも」に備えるためのチェックです</p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{currentQ + 1} / {PREPAREDNESS_QUESTIONS.length}</span>
            <span>{Math.round(((currentQ + 1) / PREPAREDNESS_QUESTIONS.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQ + 1) / PREPAREDNESS_QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">{question.text}</h2>
          {question.hint && (
            <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">{question.hint}</p>
          )}
          <div className="space-y-2">
            {question.options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(question.id, option)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all text-sm ${
                  answers[question.id] === option
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    answers[question.id] === option ? "border-blue-600" : "border-gray-300"
                  }`}>
                    {answers[question.id] === option && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                  </div>
                  <span className="text-gray-800">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        {isAnswered && (
          <div className="pt-4">
            <button
              onClick={handleNext}
              className="w-full py-4 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
            >
              {isLastQuestion ? "結果を見る" : "次の質問へ"}
            </button>
          </div>
        )}

        {currentQ > 0 && (
          <button
            onClick={() => setCurrentQ((prev) => prev - 1)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; 前の質問に戻る
          </button>
        )}
      </div>
    </main>
  );
}
