"use client";

import Link from "next/link";
import { useLiff } from "@/lib/liff";

const SERVICE_CATEGORIES = [
  "障害福祉サービス",
  "介護保険サービス",
  "医療保険サービス",
  "自治体独自のサービス",
  "経済的支援制度",
  "民間サービス",
];

export default function LandingPage() {
  const { isInClient, profile } = useLiff();

  return (
    <main className="min-h-screen bg-bg">
      {/* LIFF Header (LINE内で表示時) */}
      {isInClient && (
        <div className="bg-white border-b border-border/30 px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-primary tracking-wide">ケアガイド</span>
          <span className="text-[10px] text-text-muted">想ひ人</span>
        </div>
      )}

      {/* Hero Section */}
      <div className="pt-16 pb-12 px-4">
        <div className="max-w-md mx-auto text-center animate-fade-in-up">
          {/* Greeting for LINE users */}
          {profile && (
            <p className="text-sm text-accent-dark font-medium mb-4">
              {profile.displayName}さん、こんにちは
            </p>
          )}

          {/* Tagline */}
          <p className="text-sm tracking-widest text-primary-light mb-6">
            病気や障害とともに暮らす
          </p>

          {/* Title */}
          <h1 className="text-3xl font-bold text-text-dark tracking-wide mb-2">
            生活設計ツール
          </h1>

          {/* Product Name with accent underline */}
          <div className="inline-block mb-6">
            <span className="text-2xl font-bold text-text-dark tracking-wider">
              「ケアガイド」
            </span>
            <div className="mt-2 mx-auto w-24 h-0.5 bg-accent" />
          </div>

          {/* Description */}
          <p className="text-sm text-text-muted leading-relaxed mb-10">
            病気や障害を支える制度やサービスを、
            <br />
            あなたの状況に合わせて案内します。
          </p>

          {/* CTA Cards */}
          <div className="space-y-4 mb-12">
            {/* CTA 1: 今、困っている */}
            <Link
              href="/diagnosis"
              className="group flex items-center gap-4 w-full bg-white rounded-2xl px-5 py-5 shadow-sm border border-border/50 hover:shadow-md hover:border-accent/30 transition-all duration-200"
            >
              <div className="flex-shrink-0 w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="text-lg font-bold text-text-dark">今、困っている</p>
                <p className="text-xs text-text-muted mt-0.5">解決策・使えるサービスを探す</p>
              </div>
              <svg className="w-5 h-5 text-border group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {/* CTA 2: 将来に備えたい */}
            <Link
              href="/preparedness"
              className="group flex items-center gap-4 w-full bg-white rounded-2xl px-5 py-5 shadow-sm border border-border/50 hover:shadow-md hover:border-accent/30 transition-all duration-200"
            >
              <div className="flex-shrink-0 w-11 h-11 bg-accent/10 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-accent-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="text-lg font-bold text-text-dark">将来に備えたい</p>
                <p className="text-xs text-text-muted mt-0.5">家族で決めておくべきことを整理</p>
              </div>
              <svg className="w-5 h-5 text-border group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Service Categories Grid */}
          <div className="grid grid-cols-2 gap-3 mb-10">
            {SERVICE_CATEGORIES.map((cat) => (
              <div
                key={cat}
                className="py-3 px-4 text-xs font-medium text-text-muted bg-white rounded-xl border border-border/50 hover:border-accent/40 hover:text-text transition-all cursor-default"
              >
                {cat}
              </div>
            ))}
          </div>

          {/* Footer */}
          <p className="text-xs text-text-muted/70">
            登録不要・無料でご利用いただけます
          </p>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-point" />
    </main>
  );
}
