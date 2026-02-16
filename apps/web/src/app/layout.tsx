import type { Metadata } from "next";
import { Sora, Noto_Sans_KR } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-kr",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Admeet — Admit experts to every meeting.",
  description:
    "AI 전문가를 회의에 입장시키세요. 마케터, 데이터 분석가, UX 리서처가 실시간으로 인사이트를 제공합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${sora.variable} ${notoSansKR.variable} antialiased bg-[#f8f9fb] dark:bg-[#0a0a0f]`}
      >
        <ThemeProvider>
          <div className="mx-auto max-w-[1440px]">
            {children}
          </div>
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
