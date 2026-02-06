import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "ケアガイド - 病気や障害とともに暮らす 生活設計ツール",
  description:
    "病気や障害を支える制度やサービスを、あなたの状況に合わせて案内します。2つの質問で「次の一手」がわかります。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
