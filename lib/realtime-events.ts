export type RealtimeEvent =
  | {
      type: "notification";
      action: "created" | "read" | "deleted" | "cleared";
      entityType?: string | null;
      entityId?: string | null;
      notificationId?: string;
    }
  | {
      type: "chat";
      action: "message";
      chatType:
        | "support"
        | "cleaning"
        | "provider"
        | "guest"
        | "provider-chat"
        | "admin-conversation";
      id?: string;
      userId?: string;
    };

type Handler = (event: RealtimeEvent) => void;

const listeners = new Set<Handler>();

export function onRealtimeEvent(handler: Handler) {
  listeners.add(handler);
  return () => {
    listeners.delete(handler);
  };
}

export function emitRealtimeEvent(event: RealtimeEvent) {
  listeners.forEach((handler) => handler(event));
}
