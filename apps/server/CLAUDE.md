# AdMeet AI - Server (백엔드)

Express 5 + WebSocket + OpenAI + Supabase

## 주요 의존성

- **HTTP**: Express 5 + CORS
- **WebSocket**: ws 8 (같은 서버에서 HTTP와 공존)
- **AI**: OpenAI 4.80 (gpt-4o: 개입 생성, gpt-4o-mini: 트리거 감지)
- **DB**: Supabase (PostgreSQL)
- **검증**: Zod 3.24

## 디렉토리 구조

```
src/
├── index.ts              # Express 앱 설정 + HTTP/WS 서버 시작
├── routes/
│   ├── init.ts           # POST /api/init - 프로젝트 초기화
│   ├── meeting.ts        # 회의 CRUD API
│   └── report.ts         # 회의 리포트 생성 API
├── services/
│   ├── init.ts           # 프로젝트 초기화 로직
│   ├── report.ts         # 리포트 생성 로직
│   └── trigger.ts        # AI 트리거 감지 + 개입 생성
├── ws/
│   └── handler.ts        # WebSocket 이벤트 핸들링, 세션 관리
└── lib/
    ├── openai.ts         # OpenAI 클라이언트
    └── supabase.ts       # Supabase 클라이언트
```

## AI 트리거 시스템

- **target_vague**: "20~30대", "누구나" 등 모호한 타겟 감지
- **message_abstract**: "빠르고 편리", "혁신적" 등 추상적 메시지 감지
- **experiment_missing**: 실험 설계 없이 실행하려는 경우 감지
- 쿨다운: 30초 간격, 요약: 45초 간격

## WebSocket 프로토콜

- 경로: `ws://localhost:4000/ws`
- 클라이언트→서버: `transcript`, `meeting:start`, `meeting:end`
- 서버→클라이언트: `summary`, `ai:intervention`, `state:update`, `error`
- 세션: `Map<WebSocket, MeetingSession>` 인메모리 관리

## 환경변수

```env
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

## 스크립트

```bash
npm run dev     # tsx watch src/index.ts (핫리로드)
npm run build   # tsc
npm run start   # node dist/index.js
```
