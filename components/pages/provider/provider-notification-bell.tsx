"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, Trash2, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getNotificationHref, type NotificationDto } from "@/lib/notification-links";

type NotificationPayload = {
  notifications: NotificationDto[];
  unreadCount: number;
};

export default function ProviderNotificationBell() {
  const router = useRouter();
  const { data } = useQuery<NotificationPayload>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications", { credentials: "include", cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load notifications");
      return res.json();
    },
  });

  const unreadCount = data?.unreadCount || 0;
  const recent = (data?.notifications || []).slice(0, 8);

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("PATCH", `/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => apiRequest("POST", "/api/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => apiRequest("POST", "/api/notifications/clear"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications" data-testid="button-provider-notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px]">
        <DropdownMenuLabel className="flex items-center justify-between gap-2">
          <span>Notifications</span>
          <div className="flex items-center gap-1">
            {recent.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => clearMutation.mutate()}
                disabled={clearMutation.isPending}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>
            )}
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => markAllReadMutation.mutate()}>
                Mark all read
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {recent.length === 0 ? (
          <DropdownMenuItem disabled>No notifications</DropdownMenuItem>
        ) : (
          recent.map((notif) => (
            <DropdownMenuItem
              key={notif.id}
              className="py-2"
              onClick={() => {
                if (!notif.readAt) markReadMutation.mutate(notif.id);
                const href = getNotificationHref(notif, "provider");
                if (href) router.push(href);
              }}
            >
              <div className="flex w-full items-start gap-2">
                <span className={`mt-1 h-2 w-2 rounded-full ${notif.readAt ? "bg-transparent" : "bg-primary"}`} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{notif.title}</p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{notif.body}</p>
                </div>
                <button
                  type="button"
                  aria-label="Remove notification"
                  className="ml-auto flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMutation.mutate(notif.id);
                  }}
                  data-testid={`button-provider-delete-notification-${notif.id}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
