"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface UseSmartScrollOptions {
  deps: unknown[];
  threshold?: number;
}

export function useSmartScroll({ deps, threshold = 50 }: UseSmartScrollOptions) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);

  const isAtBottom = !isUserScrolledUp;

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
    setIsUserScrolledUp(!atBottom);
  }, [threshold]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!isUserScrolledUp) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, deps);

  return { scrollRef, bottomRef, isAtBottom, handleScroll, scrollToBottom };
}
