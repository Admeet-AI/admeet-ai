# AdMeet AI

실시간 AI 마케팅 인사이트 회의 도우미 - Turborepo 모노레포

## 구조

```
apps/web/       → Next.js 16 프론트엔드 (port 3000)
apps/server/    → Express 5 + WebSocket 백엔드 (port 4000)
packages/shared → 공유 타입 (@admeet/shared)
```

## 실행

```bash
turbo dev                        # 전체 실행
npm -w apps/web run dev          # 프론트만
npm -w apps/server run dev       # 서버만
```

## 환경변수

- `apps/server/.env` → OPENAI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PORT, CORS_ORIGIN
- `apps/web/.env.local` → NEXT_PUBLIC_API_URL, NEXT_PUBLIC_WS_URL

## 핵심 흐름

1. `/init` 페이지에서 프로젝트 컨텍스트 카드 생성
2. `/meeting/[id]`에서 실시간 회의 시작 (Web Speech API → WebSocket → AI 분석)
3. AI가 3가지 트리거 감지 시 개입: target_vague, message_abstract, experiment_missing
4. `/report/[id]`에서 회의 리포트 확인

## 타입

모든 공유 타입은 `packages/shared/types.ts`에 정의. 프론트/백 모두 `@admeet/shared`로 임포트.
