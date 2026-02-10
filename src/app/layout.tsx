import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "ケアガイド - 病気や障害とともに暮らす 生活設計ツール",
  description:
    "病気や障害を支える制度やサービスを、あなたの状況に合わせて案内します。2つの質問で「次にやるべきこと」がわかります。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen safe-area-top safe-area-bottom">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
