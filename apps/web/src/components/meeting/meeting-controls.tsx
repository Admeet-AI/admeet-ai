"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { SendButton } from "@/components/ui/send-button";

interface MeetingControlsProps {
  isListening: boolean;
  onToggleMic: () => void;
  onSendText: (text: string) => void;
}

export function MeetingControls({
  isListening,
  onToggleMic,
  onSendText,
}: MeetingControlsProps) {
  const [textInput, setTextInput] = useState("");

  const handleSubmit = () => {
    if (!textInput.trim()) return;
    onSendText(textInput);
    setTextInput("");
  };

  return (
    <div className="px-3 py-2.5 bg-card border-t border-border">
      <div className="flex items-center gap-2 max-w-3xl mx-auto">
        {/* 마이크 버튼 */}
        <Button
          size="icon"
          variant={isListening ? "destructive" : "outline"}
          onClick={onToggleMic}
          className="h-9 w-9 shrink-0 rounded-full"
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>

        {/* 메시지 텍스트 입력 필드 */}
        <div className="flex-1 flex items-center gap-2 bg-muted rounded-full px-4 py-1.5">
          <input
            type="text"
            placeholder="메시지를 입력하세요..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <SendButton
            size="sm"
            type="button"
            onClick={handleSubmit}
            disabled={!textInput.trim()}
          />
        </div>
      </div>
    </div>
  );
}

