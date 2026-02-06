"use client";

import { AppProvider } from "@/lib/store";
import { LiffProvider } from "@/lib/liff";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LiffProvider>
      <AppProvider>{children}</AppProvider>
    </LiffProvider>
  );
}
