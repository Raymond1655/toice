import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "TOICE｜多益 60 天衝刺",
  description:
    "每天一點，向 700 分前進。900 字單字卡、聽寫、Part 1–7 題型練習、錯題複習與完整模考。",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
