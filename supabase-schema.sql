-- AdMeet AI - Supabase Schema
-- Supabase 대시보드 SQL Editor에서 실행

-- 프로젝트
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  context_card jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- 회의
create table meetings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  type text not null default 'other',
  status text not null default 'preparing',
  created_at timestamptz not null default now()
);

-- 회의 이벤트 로그 (append-only)
create table meeting_events (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references meetings(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- 회의 상태 스냅샷
create table meeting_states (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references meetings(id) on delete cascade,
  state jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- 최종 회의록
create table final_reports (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid unique not null references meetings(id) on delete cascade,
  markdown text not null default '',
  created_at timestamptz not null default now()
);

-- 인덱스
create index idx_meetings_project on meetings(project_id);
create index idx_meeting_events_meeting on meeting_events(meeting_id);
create index idx_meeting_states_meeting on meeting_states(meeting_id);
