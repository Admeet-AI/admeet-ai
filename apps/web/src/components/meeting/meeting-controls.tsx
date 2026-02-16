"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Send, PhoneOff } from "lucide-react";

interface MeetingControlsProps {
  isListening: boolean;
  onToggleMic: () => void;
  onSendText: (text: string) => void;
  onEndMeeting: () => void;
  settingsSlot?: React.ReactNode;
}

export function MeetingControls({
  isListening,
  onToggleMic,
  onSendText,
  onEndMeeting,
  settingsSlot,
}: MeetingControlsProps) {
  const [textInput, setTextInput] = useState("");

  const handleSubmit = () => {
    if (!textInput.trim()) return;
    onSendText(textInput);
    setTextInput("");
  };

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-card border-t border-border">
      {/* 텍스트 입력 */}
      <div className="flex-1 flex gap-2">
        <Input
          placeholder="텍스트로 발언..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="text-sm"
        />
        <Button size="sm" variant="ghost" onClick={handleSubmit} disabled={!textInput.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* 컨트롤 버튼들 */}
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant={isListening ? "destructive" : "outline"}
          onClick={onToggleMic}
          className="gap-1.5"
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          <span className="hidden sm:inline">{isListening ? "음소거" : "마이크"}</span>
        </Button>

        {settingsSlot}

        <Button
          size="sm"
          variant="destructive"
          onClick={onEndMeeting}
          className="gap-1.5"
        >
          <PhoneOff className="h-4 w-4" />
          <span className="hidden sm:inline">종료</span>
        </Button>
      </div>
    </div>
  );
}
