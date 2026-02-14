# AdMeet AI - Web (프론트엔드)

Next.js 16 + React 19 + TailwindCSS 4 + shadcn/ui

## 주요 의존성

- **상태관리**: Zustand 5 (`stores/meeting.ts`)
- **서버 상태**: TanStack React Query 5
- **UI**: Radix UI + shadcn + Lucide React
- **스타일**: TailwindCSS 4 + CVA + clsx + tailwind-merge

## 디렉토리 구조

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # 홈
│   ├── init/               # 프로젝트 초기화 페이지
│   ├── meeting/[id]/       # 실시간 회의 페이지
│   └── report/[id]/        # 회의 리포트 페이지
├── components/
│   ├── ui/                 # shadcn 기반 공통 컴포넌트
│   └── meeting/            # 회의 전용 컴포넌트
│       ├── transcript-panel.tsx    # 실시간 트랜스크립트
│       ├── intervention-panel.tsx  # AI 개입 표시
│       └── summary-panel.tsx       # 요약 패널
├── hooks/
│   ├── use-websocket.ts           # WS 연결 (ws://localhost:4000/ws)
│   └── use-speech-recognition.ts  # Web Speech API STT
├── stores/
│   └── meeting.ts                 # Zustand 회의 상태 스토어
└── lib/
    └── utils.ts                   # cn() 등 유틸리티
```

## 컨벤션

- 컴포넌트: `function ComponentName()` (PascalCase)
- 훅: `use-` 접두사 파일명, `use` 접두사 함수명
- API URL: 환경변수 `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL` 사용
- 타입: `@admeet/shared`에서 임포트

## 스크립트

```bash
npm run dev     # next dev (port 3000)
npm run build   # next build
npm run lint    # eslint
```
