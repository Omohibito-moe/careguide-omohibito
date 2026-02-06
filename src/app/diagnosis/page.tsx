"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OnsetType, Situation } from "@/types";
import { ONSET_OPTIONS, SITUATION_OPTIONS } from "@/lib/constants";
import { runMinimalDiagnosis, generateMinimalPlan } from "@/lib/diagnosis";
import { useAppState } from "@/lib/store";

export default function MinimalDiagnosisPage() {
  const router = useRouter();
  const { setMinimalDiagnosis, setPlan } = useAppState();
  const [selectedOnset, setSelectedOnset] = useState<OnsetType | null>(null);
  const [selectedSituation, setSelectedSituation] = useState<Situation | null>(null);

  const handleOnsetSelect = (onset: OnsetType) => {
    setSelectedOnset(onset);
    setSelectedSituation(null); // Q2をリセット
  };

  const handleSituationSelect = (situation: Situation) => {
    setSelectedSituation(situation);
  };

  const handleSubmit = () => {
    if (!selectedOnset || !selectedSituation) return;

    const diagnosis = runMinimalDiagnosis(selectedOnset, selectedSituation);
    const plan = generateMinimalPlan(diagnosis);

    setMinimalDiagnosis(diagnosis);
    setPlan(plan);
    router.push("/plan");
  };

  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-lg mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">状況を教えてください</h1>
          <p className="text-sm text-gray-500">2つの質問に答えるだけで、次にやるべきことがわかります</p>
        </div>

        {/* Q1: 発生タイプ */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Q1. 介護が必要になったきっかけは？
          </h2>
          <div className="space-y-3">
            {ONSET_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOnsetSelect(option.value)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedOnset === option.value
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-semibold text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-500 mt-1">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Q2: 現在の状況 */}
        {selectedOnset && (
          <div className="space-y-3 animate-in fade-in duration-300">
            <h2 className="text-lg font-semibold text-gray-800">
              Q2. 現在の状況は？
            </h2>
            <div className="space-y-2">
              {SITUATION_OPTIONS[selectedOnset].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSituationSelect(option.value)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedSituation === option.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-gray-900">{option.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        {selectedOnset && selectedSituation && (
          <div className="pt-4 animate-in fade-in duration-300">
            <button
              onClick={handleSubmit}
              className="w-full py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
            >
              診断結果を見る
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
