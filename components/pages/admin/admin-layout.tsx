"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Bell, LayoutDashboard, Users, Wallet, MessageSquare, Settings, Sparkles, LogOut, Briefcase } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { BottomTabs } from "@/components/bottom-tabs";

const allNavItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Finance", url: "/admin/finance", icon: Wallet },
  { title: "Cleaning", url: "/admin/cleaning", icon: Sparkles },
  { title: "Marketplace", url: "/admin/marketplace", icon: Briefcase },
  { title: "Support Chat", url: "/admin/chat", icon: MessageSquare },
];

const sidebarStyle = {
  "--sidebar-width": "16rem",
  "--sidebar-width-icon": "3rem",
} as React.CSSProperties;

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, isLoggingOut } = useAuth();
  const navItems = allNavItems;

  const { data: notificationsData } = useQuery<{
    notifications: Array<{ id: string; title: string; body: string; readAt: string | null }>;
    unreadCount: number;
  }>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications", { credentials: "include", cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load notifications");
      return res.json();
    },
  });

  const unreadCount = notificationsData?.unreadCount || 0;
  const recentNotifications = (notificationsData?.notifications || []).slice(0, 8);

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("PATCH", `/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => apiRequest("POST", "/api/notifications/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const isActive =
                      item.url === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(item.url);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                          data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          <Link href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/admin/settings"}
                  tooltip="Settings"
                  data-testid="nav-settings"
                >
                  <Link href="/admin/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => logout()}
                  tooltip="Logout"
                  data-testid="nav-logout"
                >
                  <LogOut />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <div className="mt-2 flex items-center justify-center gap-3 px-2 pb-2 text-[11px] text-muted-foreground">
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Terms
              </Link>
              <span aria-hidden="true">•</span>
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Privacy
              </Link>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center gap-3 border-b px-4 py-3 sticky top-0 bg-background z-50">
            <SidebarTrigger className="hidden md:flex" data-testid="button-sidebar-toggle" />
            <h1 className="text-base font-semibold text-primary">Hoster Admin</h1>
            <div className="ml-auto flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
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
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => markAllReadMutation.mutate()}
                      >
                        Mark all read
                      </Button>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {recentNotifications.length === 0 ? (
                    <DropdownMenuItem disabled>No notifications</DropdownMenuItem>
                  ) : (
                    recentNotifications.map((notif) => (
                      <DropdownMenuItem
                        key={notif.id}
                        className="py-2"
                        onClick={() => {
                          if (!notif.readAt) markReadMutation.mutate(notif.id);
                        }}
                      >
                        <div className="flex w-full items-start gap-2">
                          <span className={`mt-1 h-2 w-2 rounded-full ${notif.readAt ? "bg-transparent" : "bg-primary"}`} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{notif.title}</p>
                            <p className="line-clamp-2 text-xs text-muted-foreground">{notif.body}</p>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                size="icon"
                aria-label="Logout"
                variant="ghost"
                onClick={() => logout()}
                disabled={isLoggingOut}
                data-testid="button-logout-top-admin"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto pb-16 md:pb-0">{children}</main>
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
            <BottomTabs 
              items={navItems.map(item => ({
                path: item.url,
                label: item.title === "Support Chat" ? "Chat" : item.title,
                icon: item.icon,
                testId: `tab-${item.title.toLowerCase().replace(/\s+/g, "-")}`
              }))} 
            />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
