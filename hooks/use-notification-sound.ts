"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { onRealtimeEvent } from "@/lib/realtime-events";

type NotificationPayload = {
  unreadCount: number;
};

const NOTIFICATION_SOUND_URL = "/sounds/facebook-notification.mp3";
let notificationAudio: HTMLAudioElement | null = null;

function playFallbackTone() {
  if (typeof window === "undefined") return;
  const Ctx = window.AudioContext || (window as any).webkitAudioContext;
  if (!Ctx) return;

  const context = new Ctx();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = 880;
  gain.gain.value = 0.05;

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.12);
  oscillator.onended = () => {
    context.close().catch(() => undefined);
  };
}

function playNotificationTone() {
  if (typeof window === "undefined") return;

  if (!notificationAudio) {
    notificationAudio = new Audio(NOTIFICATION_SOUND_URL);
    notificationAudio.preload = "auto";
  }

  notificationAudio.currentTime = 0;
  notificationAudio.play().catch(() => {
    playFallbackTone();
  });
}

export function useNotificationSound() {
  const initialLoadDone = useRef(false);
  const prevUnreadRef = useRef(0);

  const { data } = useQuery<NotificationPayload>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications", { credentials: "include", cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load notifications");
      return res.json();
    },
  });

  useEffect(() => {
    const unread = data?.unreadCount ?? 0;
    if (!initialLoadDone.current) {
      prevUnreadRef.current = unread;
      initialLoadDone.current = true;
      return;
    }

    const soundEnabled =
      typeof window === "undefined" ? true : window.localStorage.getItem("hoster_sound_enabled") !== "false";

    if (soundEnabled && unread > prevUnreadRef.current && document.visibilityState === "visible") {
      playNotificationTone();
    }
    prevUnreadRef.current = unread;
  }, [data?.unreadCount]);

  useEffect(() => {
    return onRealtimeEvent((event) => {
      if (event.type !== "notification" || event.action !== "created") return;
      const soundEnabled =
        typeof window === "undefined" ? true : window.localStorage.getItem("hoster_sound_enabled") !== "false";
      if (!soundEnabled || document.visibilityState !== "visible") return;
      playNotificationTone();
    });
  }, []);
}
