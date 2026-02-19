"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/report/markdown-renderer";
import {
  ArrowRight,
  Copy,
  Download,
  Check,
  FileBarChart,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function ReportPage() {
  const params = useParams();
  const meetingId = params.id as string;
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`${API_URL}/api/reports/${meetingId}`);
        if (res.ok) {
          const data = await res.json();
          setMarkdown(data.markdown);
        }
      } catch (error) {
        console.error("Failed to fetch report:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [meetingId]);

  const handleCopy = () => {
    if (!markdown) return;
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `회의록-${meetingId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <main className="relative min-h-screen bg-[#f8f9fb] dark:bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
        <BackgroundEffects />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-[#00d4ff] border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500 dark:text-white/40">
            회의록을 불러오는 중...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#f8f9fb] dark:bg-[#0a0a0f] text-slate-900 dark:text-white overflow-hidden">
      <BackgroundEffects />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12 lg:px-20">
        <Link href="/" className="flex items-center gap-1.5">
          <img src="/logo.png" alt="AdMeet AI" className="h-7 w-7" />
          <span className="text-lg font-bold tracking-tight">AdMeet</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/init">
            <Button
              size="sm"
              className="rounded-full bg-linear-to-r from-[#0066ff] to-[#00d4ff] text-sm font-semibold text-white shadow-[0_0_20px_rgba(0,102,255,0.2)] hover:shadow-[0_0_30px_rgba(0,102,255,0.4)] gap-1.5"
            >
              New AdMeet
            </Button>
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 pt-4 pb-8 md:px-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-[#0066ff]/10 to-[#00d4ff]/10">
            <FileBarChart className="h-5 w-5 text-[#00d4ff]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">회의 리포트</h1>
            <p className="text-xs text-slate-400 dark:text-white/30">
              {new Date().toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 pb-12 md:px-12">
        <div className="rounded-2xl border border-slate-200/60 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] backdrop-blur-sm p-6 md:p-10">
          {markdown ? (
            <MarkdownRenderer content={markdown} />
          ) : (
            <p className="text-sm text-slate-500 dark:text-white/40">
              회의록을 찾을 수 없습니다.
            </p>
          )}
        </div>

        {/* Action buttons */}
        {markdown && (
          <div className="mt-6 flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="rounded-full border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm gap-1.5 hover:border-[#00d4ff]/50"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "복사됨" : "복사"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="rounded-full border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm gap-1.5 hover:border-[#00d4ff]/50"
            >
              <Download className="h-3.5 w-3.5" />
              다운로드 (.md)
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}

function BackgroundEffects() {
  return (
    <>
      {/* Background grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.06) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 opacity-0 dark:opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Gradient orbs */}
      <div className="pointer-events-none fixed top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#0066ff]/10 dark:bg-[#0066ff]/20 blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="pointer-events-none fixed bottom-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-[#7c3aed]/8 dark:bg-[#7c3aed]/15 blur-[100px] animate-[pulse_6s_ease-in-out_infinite_1s]" />
    </>
  );
}
