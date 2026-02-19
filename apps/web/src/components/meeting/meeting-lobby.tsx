"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Users, BrainCircuit } from "lucide-react";

interface MeetingLobbyProps {
  meetingTitle: string;
  participantCount?: number;
  onJoin: (displayName: string) => void;
}

const MAX_DISPLAY_NAME_LENGTH = 6;

export function MeetingLobby({
  meetingTitle,
  participantCount = 0,
  onJoin,
}: MeetingLobbyProps) {
  const [displayName, setDisplayName] = useState("");
  const normalizeDisplayName = (value: string) =>
    value.trim().slice(0, MAX_DISPLAY_NAME_LENGTH);

  const canJoin = normalizeDisplayName(displayName).length > 0;

  const handleJoin = () => {
    const normalized = normalizeDisplayName(displayName);
    if (!normalized) return;
    onJoin(normalized);
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="rounded-2xl border border-border bg-card p-8 space-y-6 shadow-lg">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#0066ff]/20 to-[#00d4ff]/20">
                <BrainCircuit className="h-7 w-7 text-[#00d4ff]" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-foreground">회의 참가</h1>
            <p className="text-sm text-muted-foreground">{meetingTitle}</p>
          </div>

          {/* 참여자 수 */}
          {participantCount > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>현재 {participantCount}명 참여 중</span>
            </div>
          )}

          {/* 이름 입력 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">표시 이름</label>
            <Input
              placeholder="회의에서 사용할 이름"
              value={displayName}
              onChange={(e) =>
                setDisplayName(e.target.value.slice(0, MAX_DISPLAY_NAME_LENGTH))
              }
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              maxLength={MAX_DISPLAY_NAME_LENGTH}
              autoFocus
            />
          </div>

          {/* 마이크 안내 */}
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            <Mic className="h-3.5 w-3.5" />
            <span>입장 후 마이크를 켜서 음성으로 참여할 수 있습니다</span>
          </div>

          {/* 참가 버튼 */}
          <Button
            onClick={handleJoin}
            disabled={!canJoin}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#0066ff] to-[#00d4ff] text-white"
          >
            참가하기
          </Button>
        </div>
      </div>
    </main>
  );
}
