"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { DiagnosisAnswers } from "@/types/legacy";
import { QUESTIONS } from "@/lib/legacy-constants";
import { calculateResult, bridgeAssessmentToPlanUpgrade } from "@/lib/legacy-logic";
import { useAppState } from "@/lib/store";

export default function DetailedDiagnosisPage() {
  const router = useRouter();
  const { minimalDiagnosis, plan, setPlan, setAssessmentResult } = useAppState();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  if (!minimalDiagnosis || !plan) {
    return (
      <main className="min-h-screen bg-bg px-4 py-8 flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-in-up">
          <div className="w-16 h-16 mx-auto bg-surface rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-text">まず最小診断を完了してください</p>
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

  const visibleQuestions = QUESTIONS.filter((q) => {
    if (q.id === "q2b_specific_disease") {
      return answers["q2_age"] === "40〜64歳";
    }
    return true;
  });

  const question = visibleQuestions[currentQ];
  const isLastQuestion = currentQ === visibleQuestions.length - 1;
  const currentAnswer = question ? answers[question.id] : undefined;
  const isAnswered = question?.type === "multiple"
    ? Array.isArray(currentAnswer) && currentAnswer.length > 0
    : !!currentAnswer;

  const handleSingleSelect = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleMultiSelect = (questionId: string, value: string, maxSelect?: number) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) || [];
      if (current.includes(value)) {
        return { ...prev, [questionId]: current.filter((v) => v !== value) };
      }
      if (maxSelect && current.length >= maxSelect) {
        return { ...prev, [questionId]: [...current.slice(1), value] };
      }
      return { ...prev, [questionId]: [...current, value] };
    });
  };

  const handleApply = () => {
    const diagAnswers: DiagnosisAnswers = {
      q1_target: (answers["q1_target"] as string) || "",
      q2_age: (answers["q2_age"] as string) || "",
      q2b_specific_disease: answers["q2b_specific_disease"] as string | undefined,
      q3_status: (answers["q3_status"] as string) || "",
      q4_trouble: (answers["q4_trouble"] as string[]) || [],
      q5_support_level: (answers["q5_support_level"] as string) || "",
      q6_traits: (answers["q6_traits"] as string[]) || [],
      q7_public_service: (answers["q7_public_service"] as string) || "",
      q8_work_status: (answers["q8_work_status"] as string) || "",
      q9_support_structure: (answers["q9_support_structure"] as string) || "",
      q10_finance: (answers["q10_finance"] as string) || "",
    };

    const result = calculateResult(diagAnswers);
    const upgradedPlan = bridgeAssessmentToPlanUpgrade(plan, result, diagAnswers);

    setAssessmentResult(result);
    setPlan(upgradedPlan);
    router.push("/plan");
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleApply();
    } else {
      setCurrentQ((prev) => prev + 1);
    }
  };

  if (!question) return null;

  return (
    <main className="min-h-screen bg-bg px-4 py-6">
      <div className="max-w-lg mx-auto animate-fade-in-up">
        {/* Header with progress */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold tracking-widest text-primary-light uppercase">
            Progress {currentQ + 1} / {visibleQuestions.length}
          </p>
          <Link href="/plan" className="text-text-muted hover:text-text transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-surface rounded-full h-1.5 mb-8">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentQ + 1) / visibleQuestions.length) * 100}%` }}
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
          {/* Hint */}
          {question.hint && (
            <div className="bg-accent-light/20 rounded-lg p-3 mb-4 border border-accent-light/30">
              <p className="text-xs text-accent-dark">{question.hint}</p>
            </div>
          )}

          <p className="text-xs text-text-muted text-center mb-5">
            {question.type === "multiple"
              ? `最大${question.maxSelect || "複数"}つまで選択できます`
              : "最も当てはまるものをお選びください"}
          </p>

          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = question.type === "multiple"
                ? (currentAnswer as string[] || []).includes(option)
                : currentAnswer === option;

              return (
                <button
                  key={option}
                  onClick={() =>
                    question.type === "multiple"
                      ? handleMultiSelect(question.id, option, question.maxSelect)
                      : handleSingleSelect(question.id, option)
                  }
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? "border-accent bg-accent/5"
                      : "border-border/50 hover:border-border"
                  }`}
                >
                  <span className={`text-sm text-left flex-1 ${isSelected ? "text-text-dark font-medium" : "text-text"}`}>
                    {option}
                  </span>
                  {question.type === "multiple" ? (
                    <div className={`flex-shrink-0 ml-3 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected ? "bg-accent border-accent" : "border-border"
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  ) : (
                    <div className={`flex-shrink-0 ml-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? "border-accent" : "border-border"
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        {isAnswered && (
          <div className="mt-6 space-y-3 animate-fade-in">
            <button
              onClick={handleNext}
              className="w-full py-4 text-base font-bold text-primary-dark bg-accent rounded-2xl hover:bg-accent-dark hover:text-white transition-all duration-200 shadow-sm"
            >
              {isLastQuestion ? "プランに反映する" : "次へ進む"}
            </button>
            {!isLastQuestion && currentQ >= 5 && (
              <button
                onClick={handleApply}
                className="w-full py-3 text-sm font-medium text-text-muted bg-surface/50 rounded-xl hover:bg-surface transition-colors border border-border/50"
              >
                ここまでの内容でプランに反映する
              </button>
            )}
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
