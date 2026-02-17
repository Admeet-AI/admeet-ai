# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AdMeet AI — 실시간 AI 마케팅 인사이트 회의 도우미. 회의 중 음성을 실시간 전사하고, AI 페르소나가 배석하여 생각/솔루션을 제공하며, 자동 요약 및 리포트를 생성한다.

## Monorepo Structure (Turborepo + npm workspaces)

```
apps/web/        → Next.js 16 + React 19 + TailwindCSS 4 + shadcn/ui (port 3000)
apps/server/     → Express 5 + WebSocket (ws) + OpenAI + Supabase (port 4000)
packages/shared/ → 공유 타입 (@admeet/shared) — types.ts 단일 파일
```

## Commands

```bash
# 전체 개발 서버 (turbo로 web + server 동시 실행)
npm run dev

# 개별 실행
npm run dev:web        # Next.js (port 3000)
npm run dev:server     # Express + WS (port 4000, tsx watch)

# 빌드
npm run build          # turbo build (web → .next/, server → dist/)

# 린트 (web만)
npm -w apps/web run lint
```

## Environment Variables

- `apps/server/.env`: `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PORT`, `CORS_ORIGIN`
- `apps/web/.env.local`: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`

## Architecture

### Core Flow

1. `/init` — 프로젝트 컨텍스트 카드 생성 (POST `/api/init`)
2. `/meeting/[id]` — 실시간 회의 (Web Speech API → WebSocket → AI 분석)
3. `/report/[id]` — AI 생성 회의 리포트 열람

### WebSocket Protocol (`ws://localhost:4000/ws`)

Room 기반 멀티유저 구조. 모든 메시지는 JSON.

- **Client → Server**: `room:join`, `room:leave`, `transcript`, `chat:message`, `meeting:start`, `meeting:end`, `meeting:config`
- **Server → Client**: `room:participants`, `room:joined`, `room:left`, `transcript:shared`, `transcript:corrected`, `chat:received`, `summary`, `persona:thought`, `persona:solution`, `persona:analyzing`, `state:update`, `error`
- 타입 정의: `packages/shared/types.ts`의 `WSClientEvent` / `WSServerEvent`

### AI Persona System

AI 페르소나가 회의에 배석하여 두 가지 방식으로 개입:

1. **주기적 분석** (기본 30초) — `processSummaryAndThought()`: 요약 생성 + 페르소나별 생각(thought) 생성 (60% 확률)
2. **시그널 감지** — `checkSignal()`: 페르소나별 `signalKeywords` 매칭 → 질문 감지 → 솔루션 생성

OpenAI 모델: `gpt-4o-mini` (요약, 생각, 시그널 감지), `gpt-4o` (솔루션 생성)

### State Management (Frontend)

- **Zustand** (`stores/meeting.ts`) — 회의 전체 상태 (연결, 참여자, 트랜스크립트, AI 생각/솔루션, TTS 등)
- **WebSocket hook** (`hooks/use-websocket.ts`) — 서버 이벤트 수신 → Zustand store 업데이트
- **Speech Recognition hook** (`hooks/use-speech-recognition.ts`) — Web Speech API STT

### Database (Supabase/PostgreSQL)

스키마: `supabase-schema.sql`. 핵심 테이블:
- `projects` — 프로젝트 + 컨텍스트 카드 (JSONB)
- `meetings` — 회의 메타 (status: preparing → active → ended)
- `meeting_events` — append-only 이벤트 로그 (transcript, ai_summary, ai_thought, ai_solution)
- `meeting_states` — 회의 종료 시 상태 스냅샷
- `final_reports` — 마크다운 리포트

### Shared Types

모든 공유 타입은 `packages/shared/types.ts`에 정의. 프론트/백 모두 `@admeet/shared`로 임포트. 새 타입 추가 시 반드시 이 파일에 정의할 것.

## Server Architecture Notes

- WebSocket 메시지는 커넥션별 큐(`wsQueues`)로 직렬 처리하여 race condition 방지
- Room은 인메모리 `Map<meetingId, Room>`으로 관리 (서버 재시작 시 초기화됨)
- AI 트랜스크립트 보정(`transcript-corrector.ts`)은 비동기 — 원본 먼저 브로드캐스트 후 보정본 별도 전송
- 방장(`hostId`)만 `meeting:start` 가능
