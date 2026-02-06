"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { DetailedDiagnosisInput } from "@/types";
import { runDetailedDiagnosis, upgradePlanWithDetailedDiagnosis } from "@/lib/diagnosis";
import { useAppState } from "@/lib/store";

interface QuestionDef {
  key: keyof DetailedDiagnosisInput;
  question: string;
  options: { value: string; label: string }[];
}

const STEP1_QUESTIONS: QuestionDef[] = [
  {
    key: "careLevel",
    question: "要介護認定の状況を教えてください",
    options: [
      { value: "not_applied", label: "未申請" },
      { value: "applying", label: "申請中" },
      { value: "support_1", label: "要支援1" },
      { value: "support_2", label: "要支援2" },
      { value: "care_1", label: "要介護1" },
      { value: "care_2", label: "要介護2" },
      { value: "care_3", label: "要介護3" },
      { value: "care_4", label: "要介護4" },
      { value: "care_5", label: "要介護5" },
    ],
  },
  {
    key: "medicalDependency",
    question: "医療面での依存度はどの程度ですか？",
    options: [
      { value: "none", label: "特になし" },
      { value: "outpatient", label: "通院のみ" },
      { value: "medical_procedures", label: "医療処置あり（経管栄養・吸引・透析等）" },
    ],
  },
  {
    key: "dementiaLevel",
    question: "認知症の状況を教えてください",
    options: [
      { value: "none", label: "なし" },
      { value: "mild", label: "軽度（物忘れが目立つ）" },
      { value: "moderate", label: "中等度（見守りが必要）" },
      { value: "severe", label: "重度（常時介助が必要）" },
    ],
  },
];

const STEP2_QUESTIONS: QuestionDef[] = [
  {
    key: "employmentStatus",
    question: "主な介護者の就労状況は？",
    options: [
      { value: "fulltime", label: "フルタイム勤務" },
      { value: "parttime", label: "パート・アルバイト" },
      { value: "unemployed", label: "無職・専業" },
      { value: "self_employed", label: "自営業" },
    ],
  },
  {
    key: "livingArrangement",
    question: "ご本人の同居家族は？",
    options: [
      { value: "alone", label: "独居" },
      { value: "spouse_only", label: "配偶者のみ" },
      { value: "with_children", label: "子と同居" },
      { value: "other_family", label: "その他の家族" },
    ],
  },
  {
    key: "housingType",
    question: "住居の状況は？",
    options: [
      { value: "owned_house", label: "持ち家（戸建て）" },
      { value: "owned_apartment", label: "持ち家（マンション）" },
      { value: "rental", label: "賃貸" },
      { value: "cohabitation", label: "同居先（子の家など）" },
    ],
  },
];

const STEP3_QUESTIONS: QuestionDef[] = [
  {
    key: "financialConcern",
    question: "介護にかかる費用への不安は？",
    options: [
      { value: "none", label: "特にない" },
      { value: "slight", label: "少しある" },
      { value: "significant", label: "大きい" },
    ],
  },
  {
    key: "postDischargePreference",
    question: "退院後（または今後）の住まいの希望は？",
    options: [
      { value: "home", label: "自宅で過ごしたい" },
      { value: "facility", label: "施設を検討したい" },
      { value: "undecided", label: "まだ決められない" },
    ],
  },
  {
    key: "disabilityCard",
    question: "障害者手帳はお持ちですか？",
    options: [
      { value: "none", label: "持っていない" },
      { value: "yes", label: "持っている" },
      { value: "unknown", label: "該当するかわからない" },
    ],
  },
  {
    key: "contactedOffice",
    question: "自治体の介護相談窓口に連絡済みですか？",
    options: [
      { value: "yes", label: "はい" },
      { value: "no", label: "いいえ" },
      { value: "unknown", label: "わからない" },
    ],
  },
];

const ALL_STEPS = [STEP1_QUESTIONS, STEP2_QUESTIONS, STEP3_QUESTIONS];
const STEP_TITLES = ["本人の状態", "家族・生活環境", "経済・意思・地域"];

export default function DetailedDiagnosisPage() {
  const router = useRouter();
  const { minimalDiagnosis, plan, setDetailedDiagnosis, setPlan } = useAppState();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<DetailedDiagnosisInput>({});

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

  const questions = ALL_STEPS[currentStep];
  const isLastStep = currentStep === ALL_STEPS.length - 1;
  const allCurrentAnswered = questions.every(
    (q) => answers[q.key] !== undefined
  );

  const handleAnswer = (key: keyof DetailedDiagnosisInput, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    const completedSteps = currentStep + 1;
    const diagnosis = runDetailedDiagnosis(
      minimalDiagnosis.id,
      answers,
      completedSteps
    );
    const upgradedPlan = upgradePlanWithDetailedDiagnosis(plan, diagnosis);

    setDetailedDiagnosis(diagnosis);
    setPlan(upgradedPlan);
    router.push("/plan");
  };

  const handleNext = () => {
    if (isLastStep) {
      handleApply();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Link href="/plan" className="text-sm text-blue-600 hover:underline">
            ← プランに戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">詳細診断</h1>
          <p className="text-sm text-gray-500">
            回答するほどプランが精密になります。途中で反映することもできます。
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {ALL_STEPS.map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i === currentStep
                    ? "bg-blue-600 text-white"
                    : i < currentStep
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {i + 1}
              </div>
              {i < ALL_STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-8 ${
                    i < currentStep ? "bg-blue-300" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
          <span className="ml-2 text-sm text-gray-500">
            {STEP_TITLES[currentStep]}
          </span>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((q) => (
            <div key={q.key} className="space-y-3">
              <h3 className="text-base font-semibold text-gray-800">
                {q.question}
              </h3>
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleAnswer(q.key, opt.value)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all text-sm ${
                      answers[q.key] === opt.value
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        {allCurrentAnswered && (
          <div className="space-y-3 pt-4">
            <button
              onClick={handleNext}
              className="w-full py-4 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
            >
              {isLastStep ? "プランに反映する" : "次のステップへ"}
            </button>
            {!isLastStep && (
              <button
                onClick={handleApply}
                className="w-full py-3 text-base text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
              >
                ここまでの内容でプランに反映する
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
