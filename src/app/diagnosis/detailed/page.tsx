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
      <main className="min-h-screen bg-white px-4 py-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-600">まず最小診断を完了してください</p>
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

  // 条件付き質問: q2b_specific_disease は q2_age が「40〜64歳」のときだけ表示
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
    // 回答をDiagnosisAnswers型に変換
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
    <main className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Link href="/plan" className="text-sm text-blue-600 hover:underline">
            &larr; プランに戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">詳細診断</h1>
          <p className="text-sm text-gray-500">
            回答するほどプランが精密になります。
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{currentQ + 1} / {visibleQuestions.length}</span>
            <span>{Math.round(((currentQ + 1) / visibleQuestions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQ + 1) / visibleQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {question.text}
          </h2>
          {question.hint && (
            <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              {question.hint}
            </p>
          )}

          <div className="space-y-2">
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
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all text-sm ${
                    isSelected
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {question.type === "multiple" ? (
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300"
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    ) : (
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "border-blue-600" : "border-gray-300"
                      }`}>
                        {isSelected && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                      </div>
                    )}
                    <span className="text-gray-800">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {question.type === "multiple" && question.maxSelect && (
            <p className="text-xs text-gray-400">最大{question.maxSelect}つまで選択できます</p>
          )}
        </div>

        {/* Actions */}
        {isAnswered && (
          <div className="space-y-3 pt-4">
            <button
              onClick={handleNext}
              className="w-full py-4 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
            >
              {isLastQuestion ? "プランに反映する" : "次の質問へ"}
            </button>
            {!isLastQuestion && currentQ >= 5 && (
              <button
                onClick={handleApply}
                className="w-full py-3 text-base text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
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
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; 前の質問に戻る
          </button>
        )}
      </div>
    </main>
  );
}
