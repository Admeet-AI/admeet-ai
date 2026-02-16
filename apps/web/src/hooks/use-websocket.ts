"use client";

import { useCallback, useRef } from "react";
import { useMeetingStore } from "@/stores/meeting";
import type { WSServerEvent } from "../../../../packages/shared/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000/ws";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const pendingStartRef = useRef<Record<string, unknown> | null>(null);
  const roomJoinedRef = useRef(false);
  const store = useMeetingStore();

  const sendRaw = (event: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(event));
    }
  };

  const connect = useCallback(
    (meetingId: string, displayName: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) return;

      roomJoinedRef.current = false;
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        store.setConnected(true);
        ws.send(
          JSON.stringify({
            type: "room:join",
            data: { meetingId, displayName },
          })
        );
      };

      ws.onmessage = (event) => {
        const data: WSServerEvent = JSON.parse(event.data);

        switch (data.type) {
          case "room:participants":
            store.setParticipants(data.data.participants);
            // room:join 완료 확인 → pending meeting:start 전송
            if (!roomJoinedRef.current) {
              roomJoinedRef.current = true;
              if (pendingStartRef.current) {
                sendRaw(pendingStartRef.current);
                pendingStartRef.current = null;
              }
            }
            break;
          case "room:joined":
            store.addParticipant(data.data.participant);
            break;
          case "room:left":
            store.removeParticipant(data.data.participantId);
            break;
          case "transcript:shared":
            store.addSharedTranscript(data.data);
            break;
          case "chat:received":
            store.addChatMessage(data.data);
            break;
          case "summary":
            store.addSummary(data.data.text);
            store.resetTimer();
            break;
          case "persona:thought":
            store.addThought(data.data);
            break;
          case "persona:solution":
            store.addSolution(data.data);
            break;
          case "persona:analyzing":
            store.setAnalyzing(true, data.data.personaId);
            break;
          case "state:update":
            store.updateMeetingState(data.data);
            break;
          case "error":
            console.error("[WS] Error:", data.data.message);
            break;
        }
      };

      ws.onclose = () => {
        store.setConnected(false);
        roomJoinedRef.current = false;
      };

      wsRef.current = ws;
    },
    [store]
  );

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    roomJoinedRef.current = false;
    pendingStartRef.current = null;
  }, []);

  const send = useCallback((event: Record<string, unknown>) => {
    sendRaw(event);
  }, []);

  // meeting:start를 room:join 완료 후에 보내기 위한 헬퍼
  const sendAfterJoin = useCallback((event: Record<string, unknown>) => {
    if (roomJoinedRef.current) {
      sendRaw(event);
    } else {
      pendingStartRef.current = event;
    }
  }, []);

  return { connect, disconnect, send, sendAfterJoin };
}
