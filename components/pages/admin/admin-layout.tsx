import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { LayoutDashboard, Users, Wallet, MessageSquare, Truck, Settings, Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { BottomTabs } from "@/components/bottom-tabs";

const navItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Finance", url: "/admin/finance", icon: Wallet },
  { title: "Providers", url: "/admin/providers", icon: Truck },
  { title: "Cleaning", url: "/admin/cleaning", icon: Sparkles },
  { title: "Support Chat", url: "/admin/chat", icon: MessageSquare },
];

const sidebarStyle = {
  "--sidebar-width": "16rem",
  "--sidebar-width-icon": "3rem",
} as React.CSSProperties;

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();

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
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center gap-3 border-b px-4 py-3 sticky top-0 bg-background z-50">
            <SidebarTrigger className="hidden md:flex" data-testid="button-sidebar-toggle" />
            <h1 className="text-base font-semibold text-primary">Hoster Admin</h1>
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
