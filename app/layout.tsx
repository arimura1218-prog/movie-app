import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "映画記録アプリ",
  description: "マイ映画リスト管理アプリ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* bg-zinc-950 (深い黒) と text-slate-100 (見やすい白系) を追加しています */}
      <body className="min-h-full flex flex-col bg-zinc-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}