"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { OnsetType, Situation } from "@/types";
import { ONSET_OPTIONS, SITUATION_OPTIONS } from "@/lib/constants";
import { runMinimalDiagnosis, generateMinimalPlan } from "@/lib/diagnosis";
import { useAppState } from "@/lib/store";

export default function MinimalDiagnosisPage() {
  const router = useRouter();
  const { setMinimalDiagnosis, setPlan } = useAppState();
  const [step, setStep] = useState(0); // 0 = Q1, 1 = Q2
  const [selectedOnset, setSelectedOnset] = useState<OnsetType | null>(null);
  const [selectedSituation, setSelectedSituation] = useState<Situation | null>(null);

  const handleOnsetSelect = (onset: OnsetType) => {
    setSelectedOnset(onset);
    setSelectedSituation(null);
  };

  const handleSituationSelect = (situation: Situation) => {
    setSelectedSituation(situation);
  };

  const handleNext = () => {
    if (step === 0 && selectedOnset) {
      setStep(1);
    } else if (step === 1 && selectedOnset && selectedSituation) {
      const diagnosis = runMinimalDiagnosis(selectedOnset, selectedSituation);
      const plan = generateMinimalPlan(diagnosis);
      setMinimalDiagnosis(diagnosis);
      setPlan(plan);
      router.push("/plan");
    }
  };

  const totalQuestions = 2;
  const currentQuestion = step + 1;

  return (
    <main className="min-h-screen bg-bg px-4 py-6">
      <div className="max-w-lg mx-auto animate-fade-in-up">
        {/* Header with progress */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold tracking-widest text-primary-light uppercase">
            Progress {currentQuestion} / {totalQuestions}
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
            style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-primary-dark rounded-t-2xl px-6 py-8 text-center">
          <span className="inline-block text-[10px] font-bold tracking-widest text-white/50 bg-white/10 rounded-full px-4 py-1.5 mb-4 uppercase">
            Question {String(currentQuestion).padStart(2, "0")}
          </span>
          <h2 className="text-xl font-bold text-white leading-relaxed">
            {step === 0
              ? "介護が必要になったきっかけは？"
              : "現在の状況は？"}
          </h2>
        </div>

        {/* Options area */}
        <div className="bg-white rounded-b-2xl px-6 py-6 shadow-sm border border-t-0 border-border/30">
          <p className="text-xs text-text-muted text-center mb-5">
            最も当てはまるものをお選びください
          </p>

          <div className="space-y-3">
            {step === 0
              ? ONSET_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleOnsetSelect(option.value)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedOnset === option.value
                        ? "border-accent bg-accent/5"
                        : "border-border/50 hover:border-border"
                    }`}
                  >
                    <div className="text-left flex-1">
                      <p className={`font-semibold ${selectedOnset === option.value ? "text-text-dark" : "text-text"}`}>
                        {option.label}
                      </p>
                      <p className="text-xs text-text-muted mt-1">{option.description}</p>
                    </div>
                    <div className={`flex-shrink-0 ml-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedOnset === option.value ? "border-accent" : "border-border"
                    }`}>
                      {selectedOnset === option.value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                      )}
                    </div>
                  </button>
                ))
              : selectedOnset &&
                SITUATION_OPTIONS[selectedOnset].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSituationSelect(option.value)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedSituation === option.value
                        ? "border-accent bg-accent/5"
                        : "border-border/50 hover:border-border"
                    }`}
                  >
                    <span className={`font-medium ${selectedSituation === option.value ? "text-text-dark" : "text-text"}`}>
                      {option.label}
                    </span>
                    <div className={`flex-shrink-0 ml-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedSituation === option.value ? "border-accent" : "border-border"
                    }`}>
                      {selectedSituation === option.value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                      )}
                    </div>
                  </button>
                ))}
          </div>
        </div>

        {/* Submit button */}
        {((step === 0 && selectedOnset) || (step === 1 && selectedSituation)) && (
          <div className="mt-6 animate-fade-in">
            <button
              onClick={handleNext}
              className="w-full py-4 text-base font-bold text-primary-dark bg-accent rounded-2xl hover:bg-accent-dark hover:text-white transition-all duration-200 shadow-sm"
            >
              {step === 0 ? "次へ進む" : "診断結果を見る"}
            </button>
          </div>
        )}

        {/* Back button */}
        {step > 0 && (
          <button
            onClick={() => setStep(0)}
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
