"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { emitRealtimeEvent, type RealtimeEvent } from "@/lib/realtime-events";
import { useAuth } from "@/hooks/use-auth";

function getWebSocketUrl(): string {
  if (typeof window === "undefined") return "";

  const explicitWsUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (explicitWsUrl) {
    return explicitWsUrl;
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiBaseUrl) {
    const url = new URL(apiBaseUrl, window.location.origin);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.pathname = "/ws";
    url.search = "";
    url.hash = "";
    return url.toString();
  }

  const current = new URL(window.location.origin);
  if (current.hostname === "localhost" && current.port === "3000") {
    current.port = "5000";
    current.protocol = "ws:";
    current.pathname = "/ws";
    return current.toString();
  }

  current.protocol = current.protocol === "https:" ? "wss:" : "ws:";
  current.pathname = "/ws";
  return current.toString();
}

function handleEvent(
  event: RealtimeEvent,
  invalidate: (queryKey: string[]) => void,
) {
  if (event.type === "notification") {
    invalidate(["/api/notifications"]);
    invalidate(["/api/dashboard"]);
    return;
  }

  if (event.type === "chat" && event.action === "message") {
    switch (event.chatType) {
      case "support": {
        invalidate(["/api/support/messages"]);
        invalidate(["/api/admin/support-threads"]);
        if (event.userId) {
          invalidate(["/api/admin/support-threads", event.userId, "messages"]);
        }
        break;
      }
      case "cleaning": {
        if (event.id) {
          invalidate(["/api/cleaning/messages", event.id]);
          invalidate(["/api/provider/messages", event.id]);
          invalidate(["/api/provider-thread", "cleaning", event.id]);
        }
        invalidate(["/api/inbox/providers"]);
        break;
      }
      case "provider-chat": {
        if (event.id) {
          invalidate(["/api/provider-chats", event.id, "messages"]);
          invalidate(["/api/provider-thread", "marketplace", event.id]);
        }
        invalidate(["/api/inbox/providers"]);
        break;
      }
      case "guest": {
        if (event.id) {
          invalidate(["/api/chat", event.id]);
        }
        invalidate(["/api/inbox"]);
        break;
      }
      default:
        break;
    }
  }
}

export function useRealtimeSocket() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const invalidateTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  useEffect(() => {
    if (!user) return;
    let alive = true;
    const invalidate = (queryKey: string[]) => {
      const key = JSON.stringify(queryKey);
      const timers = invalidateTimersRef.current;
      if (timers.has(key)) return;
      const timer = setTimeout(() => {
        timers.delete(key);
        queryClient.invalidateQueries({
          queryKey,
          refetchType: "active",
        });
      }, 120);
      timers.set(key, timer);
    };

    const connect = () => {
      if (!alive) return;
      const url = getWebSocketUrl();
      if (!url) return;

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        retryRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as RealtimeEvent;
          emitRealtimeEvent(data);
          handleEvent(data, invalidate);
        } catch {
          // ignore malformed payloads
        }
      };

      ws.onclose = () => {
        if (!alive) return;
        const retry = Math.min(10000, 500 * Math.pow(2, retryRef.current++));
        setTimeout(connect, retry);
      };
    };

    connect();

    return () => {
      alive = false;
      wsRef.current?.close();
      for (const timer of invalidateTimersRef.current.values()) {
        clearTimeout(timer);
      }
      invalidateTimersRef.current.clear();
    };
  }, [user?.id, queryClient]);
}
