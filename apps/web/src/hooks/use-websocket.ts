"use client";

import { useCallback, useRef } from "react";
import { useMeetingStore } from "@/stores/meeting";
import type { WSServerEvent } from "../../../../packages/shared/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000/ws";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const store = useMeetingStore();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      store.setConnected(true);
    };

    ws.onmessage = (event) => {
      const data: WSServerEvent = JSON.parse(event.data);

      switch (data.type) {
        case "summary":
          store.addSummary(data.data.text);
          break;
        case "ai:intervention":
          store.addIntervention(data.data.trigger, data.data.message);
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
    };

    wsRef.current = ws;
  }, [store]);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  const send = useCallback((event: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(event));
    }
  }, []);

  return { connect, disconnect, send };
}
