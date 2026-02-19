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
  title: "Admeet. Admit experts to every meeting.",
  description:
    "AI가 실시간으로 회의 맥락을 읽고, 마케팅·PM·UX 역할별로 즉시 관찰, 분석, 제안을 동시에 보여줍니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${sora.variable} ${notoSansKR.variable} antialiased`}
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
