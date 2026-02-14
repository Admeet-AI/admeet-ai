"use client";

import { useCallback, useRef, useState } from "react";

interface UseSpeechRecognitionOptions {
  lang?: string;
  onResult: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

export function useSpeechRecognition({
  lang = "ko-KR",
  onResult,
  onError,
}: UseSpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const start = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onError?.("Web Speech API를 지원하지 않는 브라우저입니다.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        onResult(result[0].transcript, result.isFinal);
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== "no-speech") {
        onError?.(event.error);
      }
    };

    recognition.onend = () => {
      // 자동 재시작 (continuous가 끊기는 경우 대비)
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // already started
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [lang, onResult, onError]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  return { isListening, start, stop };
}
