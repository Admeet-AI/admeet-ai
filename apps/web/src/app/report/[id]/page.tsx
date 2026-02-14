"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function ReportPage() {
  const params = useParams();
  const meetingId = params.id as string;
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    if (markdown) navigator.clipboard.writeText(markdown);
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
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-muted-foreground">회의록 생성 중...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-3xl px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">회의록</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>복사</Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>다운로드 (.md)</Button>
            <Link href="/"><Button size="sm">새 회의</Button></Link>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            {markdown ? (
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">{markdown}</pre>
            ) : (
              <p className="text-muted-foreground">회의록을 찾을 수 없습니다.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
