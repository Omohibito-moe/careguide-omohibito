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
      <main className="min-h-screen bg-bg px-4 py-6">
        <div className="max-w-lg mx-auto space-y-5 animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Link href="/" className="text-text-muted hover:text-text transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-text-dark">備えの診断結果</h1>
          </div>

          {/* Summary */}
          <section className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border/30">
            <div className="bg-primary px-5 py-4">
              <h2 className="text-sm font-bold text-white/80 tracking-wide">診断サマリー</h2>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-text leading-relaxed whitespace-pre-line">{preparednessResult.summary}</p>
            </div>
          </section>

          {/* Risks */}
          {preparednessResult.risks.length > 0 && (
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-border/30 space-y-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-point" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-base font-bold text-text-dark">注意すべきリスク</h2>
              </div>
              {preparednessResult.risks.map((risk) => (
                <div key={risk.id} className="bg-point-light/15 rounded-xl p-4 border border-point-light/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      risk.severity >= 5 ? "bg-point/15 text-point" : "bg-accent-light/30 text-accent-dark"
                    }`}>
                      深刻度 {risk.severity}/5
                    </span>
                    <h3 className="text-sm font-semibold text-text-dark">{risk.title}</h3>
                  </div>
                  <p className="text-xs text-text leading-relaxed">{risk.description.summary}</p>
                  <ul className="text-xs text-text-muted list-disc list-inside space-y-0.5">
                    {risk.description.detailBullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                  <div className="pt-1">
                    <p className="text-xs font-semibold text-text-dark">話し合うべきポイント</p>
                    <ul className="text-xs text-text-muted list-disc list-inside mt-1 space-y-0.5">
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
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-border/30 space-y-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h2 className="text-base font-bold text-text-dark">チェックカード</h2>
              </div>
              {preparednessResult.cards.map((card) => (
                <div key={card.cardId} className="bg-primary/5 rounded-xl p-4 border border-primary/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      card.badge === "必須" ? "bg-point/15 text-point" : card.badge === "重要" ? "bg-accent-light/30 text-accent-dark" : "bg-primary/10 text-primary"
                    }`}>
                      {card.badge}
                    </span>
                    <h3 className="text-sm font-semibold text-text-dark">{card.title}</h3>
                  </div>
                  <p className="text-xs text-text leading-relaxed">{card.why}</p>
                  <ul className="space-y-1.5">
                    {card.checkPoints.map((cp) => (
                      <li key={cp} className="flex items-center gap-2 text-xs text-text">
                        <div className="flex-shrink-0 w-4 h-4 rounded border-2 border-border" />
                        {cp}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {/* Next Action */}
          <section className="bg-accent-light/20 rounded-2xl p-5 border border-accent-light/30">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-accent-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <h3 className="text-sm font-bold text-accent-dark">次にやること</h3>
            </div>
            <p className="text-sm text-text leading-relaxed">{preparednessResult.finalNextAction}</p>
          </section>

          {/* Restart */}
          <button
            onClick={() => { setShowResult(false); setCurrentQ(0); setAnswers({}); }}
            className="w-full py-3 text-sm font-medium text-primary border-2 border-primary rounded-2xl hover:bg-primary hover:text-white transition-all"
          >
            もう一度診断する
          </button>
          <div className="h-4" />
        </div>
      </main>
    );
  }

  // 質問画面
  if (!question) return null;

  return (
    <main className="min-h-screen bg-bg px-4 py-6">
      <div className="max-w-lg mx-auto animate-fade-in-up">
        {/* Header with progress */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold tracking-widest text-primary-light uppercase">
            Progress {currentQ + 1} / {PREPAREDNESS_QUESTIONS.length}
          </p>
          <Link href="/" className="text-text-muted hover:text-text transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-surface rounded-full h-1.5 mb-8">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentQ + 1) / PREPAREDNESS_QUESTIONS.length) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-primary-dark rounded-t-2xl px-6 py-8 text-center">
          <span className="inline-block text-[10px] font-bold tracking-widest text-white/50 bg-white/10 rounded-full px-4 py-1.5 mb-4 uppercase">
            Question {String(currentQ + 1).padStart(2, "0")}
          </span>
          <h2 className="text-lg font-bold text-white leading-relaxed">
            {question.text}
          </h2>
        </div>

        {/* Options area */}
        <div className="bg-white rounded-b-2xl px-6 py-6 shadow-sm border border-t-0 border-border/30">
          {question.hint && (
            <div className="bg-accent-light/20 rounded-lg p-3 mb-4 border border-accent-light/30">
              <p className="text-xs text-accent-dark">{question.hint}</p>
            </div>
          )}

          <p className="text-xs text-text-muted text-center mb-5">
            最も当てはまるものをお選びください
          </p>

          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(question.id, option)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                  answers[question.id] === option
                    ? "border-accent bg-accent/5"
                    : "border-border/50 hover:border-border"
                }`}
              >
                <span className={`text-sm text-left flex-1 ${answers[question.id] === option ? "text-text-dark font-medium" : "text-text"}`}>
                  {option}
                </span>
                <div className={`flex-shrink-0 ml-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  answers[question.id] === option ? "border-accent" : "border-border"
                }`}>
                  {answers[question.id] === option && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        {isAnswered && (
          <div className="mt-6 animate-fade-in">
            <button
              onClick={handleNext}
              className="w-full py-4 text-base font-bold text-primary-dark bg-accent rounded-2xl hover:bg-accent-dark hover:text-white transition-all duration-200 shadow-sm"
            >
              {isLastQuestion ? "結果を見る" : "次へ進む"}
            </button>
          </div>
        )}

        {/* Back button */}
        {currentQ > 0 && (
          <button
            onClick={() => setCurrentQ((prev) => prev - 1)}
            className="mt-4 flex items-center gap-1 text-sm text-text-muted hover:text-text transition-colors mx-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            前の質問に戻る
          </button>
        )}
      </div>
    </main>
  );
}
