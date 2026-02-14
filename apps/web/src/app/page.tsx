import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            AdMeet <span className="text-blue-600">AI</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            마케터가 없어도, 모든 회의에서 마케팅을 놓치지 않게.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            회의 중 AI 마케터가 배석하여 마케팅 관점에서 놓치는 부분을 짚어줍니다.
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-20">
          <Link href="/init">
            <Button size="lg" className="text-lg px-8">
              시작하기
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">실시간 AI 마케터</CardTitle>
              <CardDescription>
                제품 기획, 런칭, 전략 회의 — 어떤 회의든 마케팅 관점을 자동 추가
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">질문 기반 개입</CardTitle>
              <CardDescription>
                타겟 모호, 메시지 추상, 실험 부재를 감지하고 팀원처럼 질문
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">마케팅 액션플랜</CardTitle>
              <CardDescription>
                회의 종료 시 실행 가능한 회의록 + 마케팅 플랜 자동 생성
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </main>
  );
}
