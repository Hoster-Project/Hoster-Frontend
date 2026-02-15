import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, MessageSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TabItem {
  path: string;
  label: string;
  icon: React.ElementType;
  testId?: string;
}

export const defaultTabs: TabItem[] = [
  { path: "/dashboard", label: "Home", icon: Home, testId: "tab-home" },
  { path: "/calendar", label: "Calendar", icon: CalendarDays, testId: "tab-calendar" },
  { path: "/inbox", label: "Inbox", icon: MessageSquare, testId: "tab-inbox" },
  { path: "/settings", label: "Settings", icon: Settings, testId: "tab-settings" },
];

export function BottomTabs({ 
  unreadCount,
  items = defaultTabs 
}: { 
  unreadCount?: number;
  items?: TabItem[];
}) {
  const pathname = usePathname();

  return (
    <nav
      className="flex-shrink-0 border-t bg-background safe-area-bottom"
      data-testid="bottom-tabs"
    >
      <div className="grid w-full" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map((tab) => {
          const isActive =
            tab.path === "/dashboard" || tab.path === "/admin"
              ? pathname === tab.path
              : pathname.startsWith(tab.path);
          const Icon = tab.icon;

          return (
            <Link key={tab.path} href={tab.path} className="w-full">
              <button
                className={cn(
                  "relative flex w-full flex-col items-center gap-1 pt-2.5 pb-2 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
                data-testid={tab.testId}
              >
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-full bg-primary" />
                )}
                <div className="relative">
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={isActive ? 2.2 : 1.6}
                  />
                  {tab.path === "/inbox" &&
                    unreadCount !== undefined &&
                    unreadCount > 0 && (
                      <span
                        className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white"
                        data-testid="badge-unread-count"
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                </div>
                <span
                  className={cn(
                    "text-[10px] truncate w-full px-0.5",
                    isActive ? "font-semibold" : "font-medium"
                  )}
                >
                  {tab.label}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
