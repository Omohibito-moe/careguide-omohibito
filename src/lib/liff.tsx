"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type Liff from "@line/liff";

// --- 型定義 ---
interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

interface LiffContextValue {
  /** LIFF初期化完了かどうか */
  isReady: boolean;
  /** LINEアプリ内で開かれているか */
  isInClient: boolean;
  /** ログイン済みか */
  isLoggedIn: boolean;
  /** ユーザープロフィール */
  profile: LiffProfile | null;
  /** LIFF SDKインスタンス */
  liff: typeof Liff | null;
  /** LINEトークにメッセージを送信 */
  sendMessage: (text: string) => Promise<void>;
  /** LINEのシェアターゲットピッカーで共有 */
  shareMessage: (text: string) => Promise<void>;
  /** LIFFウィンドウを閉じる */
  closeWindow: () => void;
}

const LiffContext = createContext<LiffContextValue>({
  isReady: false,
  isInClient: false,
  isLoggedIn: false,
  profile: null,
  liff: null,
  sendMessage: async () => {},
  shareMessage: async () => {},
  closeWindow: () => {},
});

export function useLiff() {
  return useContext(LiffContext);
}

// --- LIFF Provider ---
const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID || "";

export function LiffProvider({ children }: { children: ReactNode }) {
  const [liffInstance, setLiffInstance] = useState<typeof Liff | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isInClient, setIsInClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<LiffProfile | null>(null);

  useEffect(() => {
    if (!LIFF_ID) {
      // LIFF_IDが未設定の場合は通常のWebアプリとして動作
      setIsReady(true);
      return;
    }

    const initLiff = async () => {
      try {
        const liff = (await import("@line/liff")).default;
        await liff.init({ liffId: LIFF_ID });

        setLiffInstance(liff);
        setIsInClient(liff.isInClient());
        setIsLoggedIn(liff.isLoggedIn());

        // ログイン済みならプロフィール取得
        if (liff.isLoggedIn()) {
          try {
            const p = await liff.getProfile();
            setProfile({
              userId: p.userId,
              displayName: p.displayName,
              pictureUrl: p.pictureUrl,
            });
          } catch {
            // プロフィール取得失敗は無視
          }
        }

        setIsReady(true);
      } catch (error) {
        console.error("LIFF initialization failed:", error);
        // 失敗しても通常のWebアプリとして動作
        setIsReady(true);
      }
    };

    initLiff();
  }, []);

  // LINEトークにメッセージを送信（1:1トーク内で開いた場合）
  const sendMessage = useCallback(
    async (text: string) => {
      if (!liffInstance || !isInClient) return;
      try {
        await liffInstance.sendMessages([{ type: "text", text }]);
      } catch (error) {
        console.error("sendMessage failed:", error);
      }
    },
    [liffInstance, isInClient]
  );

  // シェアターゲットピッカーで友だちに共有
  const shareMessage = useCallback(
    async (text: string) => {
      if (!liffInstance) return;
      try {
        if (liffInstance.isApiAvailable("shareTargetPicker")) {
          await liffInstance.shareTargetPicker([{ type: "text", text }]);
        }
      } catch (error) {
        console.error("shareMessage failed:", error);
      }
    },
    [liffInstance]
  );

  // LIFFウィンドウを閉じる
  const closeWindow = useCallback(() => {
    if (liffInstance && isInClient) {
      liffInstance.closeWindow();
    }
  }, [liffInstance, isInClient]);

  return (
    <LiffContext.Provider
      value={{
        isReady,
        isInClient,
        isLoggedIn,
        profile,
        liff: liffInstance,
        sendMessage,
        shareMessage,
        closeWindow,
      }}
    >
      {children}
    </LiffContext.Provider>
  );
}
