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

function isRole(role: string | null | undefined, roles: string[]) {
  if (!role) return false;
  return roles.includes(role);
}

export function getNotificationHref(notif: Pick<NotificationDto, "type" | "entityType" | "entityId">, role?: string | null): string | null {
  const entityType = notif.entityType || null;
  const entityId = notif.entityId || null;

  // Entity-based routing (preferred).
  if (entityType === "conversation" && entityId) return `/chat/${entityId}`;
  if (entityType === "reservation" && entityId) return `/calendar`;

  if (entityType === "cleaning_subscription" && entityId) {
    if (isRole(role, ["host", "admin", "moderator"])) return `/chat/provider/${entityId}?source=cleaning`;
    if (isRole(role, ["provider", "employee"])) return `/provider?tab=chat&subscriptionId=${encodeURIComponent(entityId)}`;
    return `/chat/provider/${entityId}?source=cleaning`;
  }

  if (entityType === "provider_chat" && entityId) {
    // Provider company admin client chat (marketplace).
    return `/provider?mode=company-admin&tab=clients&chatId=${encodeURIComponent(entityId)}`;
  }

  if (entityType === "provider_request" && entityId) {
    if (isRole(role, ["admin", "moderator"])) return `/admin/providers?tab=requests`;
    if (isRole(role, ["provider", "employee"])) return `/provider`;
    return `/admin/providers?tab=requests`;
  }

  if (entityType === "support_thread" && entityId) {
    if (isRole(role, ["admin", "moderator"])) return `/admin/chat`;
    if (isRole(role, ["provider", "employee"])) return `/provider/support-chat`;
    return `/support-chat`;
  }

  if (entityType === "provider_task" && entityId) {
    // Host approvals happen in Maintenance settings.
    if (isRole(role, ["host"])) return `/settings/maintenance?taskId=${encodeURIComponent(entityId)}`;
    if (isRole(role, ["admin", "moderator"])) return `/admin/cleaning`;
    if (isRole(role, ["provider", "employee"])) return `/provider?tab=requests&taskId=${encodeURIComponent(entityId)}`;
    return `/settings/maintenance?taskId=${encodeURIComponent(entityId)}`;
  }

  if (entityType === "cleaning_task" && entityId) {
    // Cleaning tasks are actionable from the host dashboard.
    return `/dashboard?focus=cleaning-tasks&taskId=${encodeURIComponent(entityId)}`;
  }

  // Type-based routing (fallback).
  if (notif.type === "CHANNEL_DATA_DELETED") return `/channels`;

  // Safe defaults per role.
  if (isRole(role, ["admin", "moderator"])) return `/admin`;
  if (isRole(role, ["provider", "employee"])) return `/provider`;
  if (isRole(role, ["host"])) return `/notifications`;
  return null;
}
