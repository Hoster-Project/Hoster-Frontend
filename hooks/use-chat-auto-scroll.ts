"use client";

import { useCallback, useEffect, useRef } from "react";

type UseChatAutoScrollOptions = {
  thresholdPx?: number;
};

function isNearBottom(element: HTMLDivElement, thresholdPx: number) {
  const distanceFromBottom =
    element.scrollHeight - element.scrollTop - element.clientHeight;
  return distanceFromBottom <= thresholdPx;
}

export function useChatAutoScroll<T>(
  dependency: T,
  options: UseChatAutoScrollOptions = {},
) {
  const { thresholdPx = 120 } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const initializedRef = useRef(false);

  const scrollToBottom = useCallback((behavior: ScrollBehavior) => {
    endRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      shouldAutoScrollRef.current = isNearBottom(container, thresholdPx);
    };

    onScroll();
    container.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", onScroll);
    };
  }, [thresholdPx]);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      scrollToBottom("auto");
      return;
    }

    if (shouldAutoScrollRef.current) {
      scrollToBottom("smooth");
    }
  }, [dependency, scrollToBottom]);

  return { containerRef, endRef, scrollToBottom };
}
