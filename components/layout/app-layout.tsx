"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { BottomTabs } from "@/components/bottom-tabs";
import { useAuth } from "@/hooks/use-auth";
import { useNotificationSound } from "@/hooks/use-notification-sound";
import { useRealtimeSocket } from "@/hooks/use-realtime-socket";
import { Loader2, LogOut, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";

const sidebarStyle = {
  "--sidebar-width": "16rem",
  "--sidebar-width-icon": "3rem",
} as CSSProperties;

export default function AppLayout({
  children, 
  fullWidth = false, 
  noPadding = false,
  hideMobileHeader = false,
  hideBottomTabs = false
}: { 
  children: React.ReactNode;
  fullWidth?: boolean;
  noPadding?: boolean;
  hideMobileHeader?: boolean;
  hideBottomTabs?: boolean;
}) {
  const { user, isLoading, logout, isLoggingOut } = useAuth();
  const router = useRouter();
  useNotificationSound();
  useRealtimeSocket();
  const { data: notificationsData } = useQuery<{ unreadCount: number }>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications", { credentials: "include", cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load notifications");
      return res.json();
    },
  });
  const unreadCount = notificationsData?.unreadCount || 0;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
      return;
    }

    if (!isLoading && user && user.role !== "host") {
      if (user.role === "admin" || user.role === "moderator") {
        router.push("/admin");
        return;
      }
      if (user.role === "provider" || user.role === "employee") {
        router.push("/provider");
        return;
      }
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "host") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true} style={sidebarStyle}>
      <div className={`flex min-h-screen w-full bg-muted/30 ${hideBottomTabs ? "" : "has-bottom-nav"}`}>
        {/* Desktop Sidebar */}
        <AppSidebar />
        
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Header / Desktop Trigger */}
          {!hideMobileHeader && (
            <header className="flex h-14 items-center gap-2 border-b bg-background px-4 lg:h-[60px] flex-shrink-0">
              <SidebarTrigger className="hidden md:flex" data-testid="button-sidebar-toggle-main" />
              <span className="font-bold text-lg text-black">Hoster</span>
              <div className="ml-auto flex items-center gap-1">
                <Button
                  size="icon"
                  aria-label="Notifications"
                  variant="ghost"
                  className="relative"
                  onClick={() => router.push("/notifications")}
                  data-testid="button-notifications-top-main"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                      {unreadCount}
                    </span>
                  )}
                </Button>
                <Button
                  size="icon"
                  aria-label="Settings"
                  variant="ghost"
                  className="md:hidden"
                  onClick={() => router.push("/settings")}
                  data-testid="button-settings-top-main"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              <Button
                size="icon"
                aria-label="Logout"
                variant="ghost"
                onClick={() => logout()}
                disabled={isLoggingOut}
                data-testid="button-logout-top-main"
              >
                <LogOut className="h-4 w-4" />
              </Button>
              </div>
            </header>
          )}
          
          {/* Main Content Area */}
          <div className={`flex-1 overflow-auto bg-muted/30 ${noPadding ? '' : 'p-4 md:p-6 lg:p-8'} pb-24 md:pb-6`}>
             <div className={fullWidth ? 'h-full' : 'mx-auto max-w-5xl'}>
                {children}
             </div>
          </div>

          {/* Mobile Bottom Tabs */}
          {!hideBottomTabs && (
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
              <BottomTabs />
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
