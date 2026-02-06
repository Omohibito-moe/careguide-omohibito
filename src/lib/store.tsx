// ============================================================
// クライアント側状態管理（localStorage + React Context）
// ============================================================

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type {
  MinimalDiagnosis,
  DetailedDiagnosis,
  Plan,
  Task,
} from "@/types";
import type { AssessmentResult, PreparednessResult } from "@/types/legacy";
import { updateParentTaskStatus } from "./diagnosis";

const STORAGE_KEY = "careguide_state";

interface AppState {
  minimalDiagnosis: MinimalDiagnosis | null;
  detailedDiagnosis: DetailedDiagnosis | null;
  plan: Plan | null;
  assessmentResult: AssessmentResult | null;
  preparednessResult: PreparednessResult | null;
}

interface AppContextType extends AppState {
  setMinimalDiagnosis: (d: MinimalDiagnosis) => void;
  setDetailedDiagnosis: (d: DetailedDiagnosis) => void;
  setPlan: (p: Plan) => void;
  setAssessmentResult: (r: AssessmentResult) => void;
  setPreparednessResult: (r: PreparednessResult) => void;
  toggleTaskStatus: (taskId: string) => void;
  reset: () => void;
}

const initialState: AppState = {
  minimalDiagnosis: null,
  detailedDiagnosis: null,
  plan: null,
  assessmentResult: null,
  preparednessResult: null,
};

const AppContext = createContext<AppContextType | null>(null);

function loadState(): AppState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    return JSON.parse(raw) as AppState;
  } catch {
    return initialState;
  }
}

function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      saveState(state);
    }
  }, [state, isHydrated]);

  const setMinimalDiagnosis = useCallback((d: MinimalDiagnosis) => {
    setState((prev) => ({ ...prev, minimalDiagnosis: d }));
  }, []);

  const setDetailedDiagnosis = useCallback((d: DetailedDiagnosis) => {
    setState((prev) => ({ ...prev, detailedDiagnosis: d }));
  }, []);

  const setPlan = useCallback((p: Plan) => {
    setState((prev) => ({ ...prev, plan: p }));
  }, []);

  const setAssessmentResult = useCallback((r: AssessmentResult) => {
    setState((prev) => ({ ...prev, assessmentResult: r }));
  }, []);

  const setPreparednessResult = useCallback((r: PreparednessResult) => {
    setState((prev) => ({ ...prev, preparednessResult: r }));
  }, []);

  const toggleTaskStatus = useCallback((taskId: string) => {
    setState((prev) => {
      if (!prev.plan) return prev;
      let updatedTasks = prev.plan.tasks.map((t) =>
        t.taskId === taskId
          ? {
              ...t,
              status: (t.status === "todo" ? "done" : "todo") as Task["status"],
              updatedAt: new Date().toISOString(),
            }
          : t
      );
      updatedTasks = updateParentTaskStatus(updatedTasks);
      return {
        ...prev,
        plan: {
          ...prev.plan,
          tasks: updatedTasks,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  if (!isHydrated) {
    return null;
  }

  return (
    <AppContext.Provider
      value={{
        ...state,
        setMinimalDiagnosis,
        setDetailedDiagnosis,
        setPlan,
        setAssessmentResult,
        setPreparednessResult,
        toggleTaskStatus,
        reset,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}
