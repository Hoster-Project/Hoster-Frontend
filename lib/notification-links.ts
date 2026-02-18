export type NotificationDto = {
  id: string;
  type: string;
  title: string;
  body: string;
  entityType: string | null;
  entityId: string | null;
  createdAt?: string;
  readAt: string | null;
};

type RoleBucket = "host" | "provider" | "admin" | "unknown";

function roleBucket(role: string | null | undefined): RoleBucket {
  const normalized = (role || "").trim().toLowerCase();
  if (normalized === "host") return "host";
  if (normalized === "provider" || normalized === "employee") return "provider";
  if (normalized === "admin" || normalized === "moderator") return "admin";
  return "unknown";
}

export function getNotificationHref(
  notif: Pick<NotificationDto, "type" | "entityType" | "entityId">,
  role?: string | null,
): string | null {
  const entityType = notif.entityType || null;
  const entityId = notif.entityId || null;
  const audience = roleBucket(role);

  // Entity-based routing (preferred).
  if (entityType === "conversation" && entityId) {
    return audience === "host" ? `/chat/${entityId}` : null;
  }

  if (entityType === "reservation" && entityId) {
    return audience === "host" ? "/calendar" : null;
  }

  if (entityType === "cleaning_subscription" && entityId) {
    if (audience === "host") return `/chat/provider/${entityId}?source=cleaning`;
    if (audience === "provider") return `/?tab=chat&subscriptionId=${encodeURIComponent(entityId)}`;
    return null;
  }

  if (entityType === "provider_chat" && entityId) {
    if (audience === "host") return `/chat/provider/${entityId}?source=marketplace`;
    if (audience === "provider") return `/?mode=company-admin&tab=clients&chatId=${encodeURIComponent(entityId)}`;
    return null;
  }

  if (entityType === "provider_request" && entityId) {
    if (audience === "admin") return "/providers?tab=requests";
    if (audience === "provider") return "/?tab=requests";
    return null;
  }

  if (entityType === "support_thread") {
    if (audience === "admin") return "/chat";
    if (audience === "provider" || audience === "host") return "/support-chat";
    return null;
  }

  if (entityType === "provider_task" && entityId) {
    if (audience === "host") return `/settings/maintenance?taskId=${encodeURIComponent(entityId)}`;
    if (audience === "admin") return "/cleaning";
    if (audience === "provider") return "/?tab=marketplace";
    return null;
  }

  if (entityType === "cleaning_task" && entityId) {
    if (audience === "host") return `/dashboard?focus=cleaning-tasks&taskId=${encodeURIComponent(entityId)}`;
    if (audience === "admin") return "/cleaning";
    return null;
  }

  // Type-based fallback routing.
  if (notif.type === "CHANNEL_DATA_DELETED") return audience === "host" ? "/channels" : null;
  if (notif.type === "GUEST_MESSAGE_RECEIVED") return audience === "host" ? "/inbox" : null;

  if (notif.type === "PROVIDER_CHAT_MESSAGE") {
    if (audience === "provider" && entityId) {
      return `/?mode=company-admin&tab=clients&chatId=${encodeURIComponent(entityId)}`;
    }
    if (audience === "host" && entityId) {
      return `/chat/provider/${entityId}?source=marketplace`;
    }
    return null;
  }

  if (notif.type === "PROVIDER_MESSAGE_RECEIVED" || notif.type === "HOST_MESSAGE_RECEIVED") {
    if (audience === "provider") return "/?tab=chat";
    if (audience === "host") return "/settings/cleaning";
    return null;
  }

  if (
    notif.type === "SUPPORT_MESSAGE_RECEIVED"
    || notif.type === "SUPPORT_REPLY_RECEIVED"
    || notif.type === "SUPPORT_REQUEST_ACCEPTED"
  ) {
    if (audience === "admin") return "/chat";
    if (audience === "provider" || audience === "host") return "/support-chat";
    return null;
  }

  if (notif.type === "MARKETPLACE_APPROVAL_REQUIRED") {
    if (audience === "host") return "/settings/maintenance";
    if (audience === "provider") return "/?tab=marketplace";
    if (audience === "admin") return "/cleaning";
    return null;
  }

  // Safe defaults per portal.
  if (audience === "admin") return "/";
  if (audience === "provider") return "/";
  if (audience === "host") return "/notifications";
  return null;
}
