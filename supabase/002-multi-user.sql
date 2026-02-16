-- ============================================
-- AdMeet AI - 멀티유저 회의 지원 마이그레이션
-- ============================================

-- 1. meeting_participants 테이블
CREATE TABLE IF NOT EXISTS meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  is_ai BOOLEAN DEFAULT false,
  persona_id UUID REFERENCES personas(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  left_at TIMESTAMPTZ
);

-- 2. meetings 테이블에 invite_code 추가
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;
