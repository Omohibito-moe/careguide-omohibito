import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "ケアガイド - 介護の始まりで迷わない",
  description:
    "2つの質問で、あなたの「次の一手」がわかる。介護のもしもに直面した人のための行動ガイド。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
