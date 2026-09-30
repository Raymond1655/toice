import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "TOICE｜多益 60 天衝刺",
  description: "每天一點，向 700 分前進。單字卡、間隔複習與情境測驗。",
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
