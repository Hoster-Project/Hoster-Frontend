"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { BottomTabs } from "@/components/bottom-tabs";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        {/* Desktop Sidebar */}
        <AppSidebar />
        
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Header / Desktop Trigger */}
          <header className="flex h-14 items-center gap-2 border-b bg-background px-4 lg:h-[60px] md:hidden">
             <SidebarTrigger className="md:hidden" />
             <span className="font-bold text-lg">Hoster</span>
          </header>
          
          {/* Main Content Area */}
          <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-6">
             <div className="mx-auto max-w-5xl">
                {children}
             </div>
          </div>

          {/* Mobile Bottom Tabs */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
            <BottomTabs />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
