"use client";

import { useCallback, useEffect, useRef } from "react";

interface UseTTSOptions {
  onStart?: () => void;
  onEnd?: () => void;
}

export function useTTS({ onStart, onEnd }: UseTTSOptions = {}) {
  const onStartRef = useRef(onStart);
  const onEndRef = useRef(onEnd);
  onStartRef.current = onStart;
  onEndRef.current = onEnd;

  // voices가 비동기 로드되므로 미리 로드
  useEffect(() => {
    window.speechSynthesis?.getVoices();
  }, []);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    const voices = window.speechSynthesis.getVoices();
    const koVoice = voices.find((v) => v.lang.startsWith("ko"));
    if (koVoice) utterance.voice = koVoice;

    utterance.onstart = () => onStartRef.current?.();
    utterance.onend = () => onEndRef.current?.();
    utterance.onerror = () => onEndRef.current?.();

    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    onEndRef.current?.();
  }, []);

  return { speak, stop };
}
