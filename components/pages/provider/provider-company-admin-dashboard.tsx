"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getCategoryBadgeClass } from "@/lib/category-badge";
import ProviderNotificationBell from "./provider-notification-bell";
import ProviderAppSettingsPage from "./provider-app-settings-page";
import { useChatAutoScroll } from "@/hooks/use-chat-auto-scroll";
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Briefcase,
  FileCheck2,
  Building2,
  Settings,
  User,
  LogOut,
  Check,
  X,
  Camera,
  UserRoundCog,
  Save,
  Link2,
  FileText,
  DollarSign,
  Sparkles,
  MapPin,
  Repeat2,
  Plus,
  MessageSquare,
  ArrowLeft,
  Send,
} from "lucide-react";

const sidebarStyle = {
  "--sidebar-width": "16rem",
  "--sidebar-width-icon": "3rem",
} as CSSProperties;

type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string | null;
};

type ProviderDashboardStats = {
  total: number;
  available: number;
  booked: number;
  unavailable: number;
};

type ProviderEmployee = {
  id: string;
  status: "AVAILABLE" | "RESERVED" | "BOOKED" | "UNAVAILABLE";
  companyBlocked?: boolean;
  isAdmin: boolean;
  user: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    blocked?: boolean;
  };
};

type ProviderRequest = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  host?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
};

type ProviderClient = {
  subscriptionId: string;
  status: string;
  startedAt: string;
  tasksCount: number;
  chatId?: string | null;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  host: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  };
};

type ProviderChatMessage = {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  messageText: string;
  sentAt: string;
};

type PendingApproval = {
  id: string;
  taskId: string;
  submittedAt: string;
  task?: {
    id: string;
    serviceType: string;
    locationAddress?: string | null;
  };
};

type CompanyInfo = {
  id: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  serviceType: "CLEANING" | "MAINTENANCE";
  pricing?: {
    pricingModel: "PER_HOUR" | "PER_ROOM";
    priceAmount: number;
  } | null;
  serviceAreas?: Array<{ id: string; name: string }>;
};

type TabId = "dashboard" | "available" | "booked" | "clients" | "requests" | "company" | "settings";

function displayName(user: { firstName?: string | null; lastName?: string | null; email?: string | null }) {
  const full = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return full || user.email || "Unknown";
}

export default function ProviderCompanyAdminDashboard({
  user,
  onLogout,
  canSwitchMode = false,
  onSwitchMode,
}: {
  user: AuthUser;
  onLogout: () => void;
  canSwitchMode?: boolean;
  onSwitchMode?: () => void;
}) {
  const searchParams = useSearchParams();
  const deepLinkApplied = useRef(false);
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ firstName: "", lastName: "", email: "" });
  const [selectedClientChat, setSelectedClientChat] = useState<{
    subscriptionId: string;
    chatId: string;
    title: string;
  } | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const isClientChatFullscreen = activeTab === "clients" && !!selectedClientChat;
  const { toast } = useToast();
  const qc = useQueryClient();

  const tabs: Array<{ id: TabId; label: string; icon: any }> = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "available", label: "Available", icon: UserCheck },
    { id: "booked", label: "Booked", icon: Briefcase },
    { id: "clients", label: "Clients", icon: Users },
    { id: "requests", label: "Requests", icon: FileCheck2 },
    { id: "company", label: "Company Data", icon: Building2 },
    { id: "settings", label: "Settings", icon: Settings },
  ];
  const sidebarTabs = tabs.filter((tab) => tab.id !== "settings");
  const mobileTabs = tabs.filter((tab) => tab.id !== "settings").slice(0, 6);

  useEffect(() => {
    if (deepLinkApplied.current) return;
    const tabParam = (searchParams.get("tab") || "").toLowerCase();
    const chatId = searchParams.get("chatId");
    const valid: Record<string, TabId> = {
      dashboard: "dashboard",
      available: "available",
      booked: "booked",
      clients: "clients",
      requests: "requests",
      company: "company",
      settings: "settings",
    };
    if (chatId) {
      setActiveTab("clients");
      deepLinkApplied.current = true;
      return;
    }
    const next = valid[tabParam];
    if (next) setActiveTab(next);
    deepLinkApplied.current = true;
  }, [searchParams]);

  const { data: stats, isLoading: statsLoading } = useQuery<ProviderDashboardStats>({
    queryKey: ["/api/admin/provider-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/admin/provider-dashboard", { credentials: "include", cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load dashboard stats");
      return res.json();
    },
  });

  const { data: allEmployees = [], isLoading: allEmployeesLoading } = useQuery<ProviderEmployee[]>({
    queryKey: ["/api/admin/employees"],
    enabled: activeTab === "dashboard",
    queryFn: async () => {
      const res = await fetch("/api/admin/employees", { credentials: "include", cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load employees");
      return res.json();
    },
  });

  const { data: availableEmployees = [], isLoading: availableLoading } = useQuery<ProviderEmployee[]>({
    queryKey: ["/api/admin/employees/available"],
    enabled: activeTab === "available",
    queryFn: async () => {
      const res = await fetch("/api/admin/employees/available", { credentials: "include", cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load available employees");
      return res.json();
    },
  });

  const { data: bookedEmployees = [], isLoading: bookedLoading } = useQuery<ProviderEmployee[]>({
    queryKey: ["/api/admin/employees/booked"],
    enabled: activeTab === "booked",
    queryFn: async () => {
      const res = await fetch("/api/admin/employees/booked", { credentials: "include", cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load booked employees");
      return res.json();
    },
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery<ProviderClient[]>({
    queryKey: ["/api/admin/clients"],
    enabled: activeTab === "clients",
    queryFn: async () => {
      const res = await fetch("/api/admin/clients", { credentials: "include", cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load clients");
      return res.json();
    },
  });

  useEffect(() => {
    const chatId = searchParams.get("chatId");
    if (!chatId) return;
    if (activeTab !== "clients") return;
    if (selectedClientChat) return;
    const match = clients.find((c) => c.chatId === chatId);
    if (!match) return;
    setSelectedClientChat({
      subscriptionId: match.subscriptionId,
      chatId,
      title: displayName(match.host),
    });
  }, [activeTab, clients, searchParams, selectedClientChat]);

  const { data: requests = [], isLoading: requestsLoading } = useQuery<ProviderRequest[]>({
    queryKey: ["/api/admin/subscription-requests"],
    enabled: activeTab === "requests",
    queryFn: async () => {
      const res = await fetch("/api/admin/subscription-requests", { credentials: "include", cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load requests");
      return res.json();
    },
  });

  const { data: approvals = [], isLoading: approvalsLoading } = useQuery<PendingApproval[]>({
    queryKey: ["/api/admin/requests/pending-approval"],
    enabled: activeTab === "dashboard",
    queryFn: async () => {
      const res = await fetch("/api/admin/requests/pending-approval", { credentials: "include", cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load pending approvals");
      return res.json();
    },
  });

  const { data: company, isLoading: companyLoading } = useQuery<CompanyInfo | null>({
    queryKey: ["/api/admin/company"],
    enabled: activeTab === "company",
    queryFn: async () => {
      const res = await fetch("/api/admin/company", { credentials: "include", cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load company");
      return res.json();
    },
  });

  const { data: clientChatMessages = [], isLoading: clientChatLoading } = useQuery<ProviderChatMessage[]>({
    queryKey: ["/api/provider-chats", selectedClientChat?.chatId, "messages"],
    enabled: activeTab === "clients" && !!selectedClientChat?.chatId,
    queryFn: async () => {
      const res = await fetch(`/api/provider-chats/${selectedClientChat!.chatId}/messages`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load chat messages");
      return res.json();
    },
  });

  const { containerRef: clientChatContainerRef, endRef: clientChatEndRef } = useChatAutoScroll(
    selectedClientChat ? clientChatMessages : [],
  );

  const [companyForm, setCompanyForm] = useState({
    name: "",
    description: "",
    logoUrl: "",
    pricingModel: "PER_HOUR" as "PER_HOUR" | "PER_ROOM",
    priceAmount: "",
    serviceAreas: "",
  });

  useEffect(() => {
    if (!company) return;
    setCompanyForm({
      name: company.name || "",
      description: company.description || "",
      logoUrl: company.logoUrl || "",
      pricingModel: company.pricing?.pricingModel || "PER_HOUR",
      priceAmount: company.pricing?.priceAmount != null ? String(company.pricing.priceAmount) : "",
      serviceAreas: (company.serviceAreas || []).map((area) => area.name).join("\n"),
    });
  }, [company]);

  const refreshAdminQueries = () => {
    qc.invalidateQueries({ queryKey: ["/api/admin/provider-dashboard"] });
    qc.invalidateQueries({ queryKey: ["/api/admin/employees"] });
    qc.invalidateQueries({ queryKey: ["/api/admin/employees/available"] });
    qc.invalidateQueries({ queryKey: ["/api/admin/employees/booked"] });
    qc.invalidateQueries({ queryKey: ["/api/admin/subscription-requests"] });
    qc.invalidateQueries({ queryKey: ["/api/admin/clients"] });
    qc.invalidateQueries({ queryKey: ["/api/admin/requests/pending-approval"] });
    qc.invalidateQueries({ queryKey: ["/api/admin/company"] });
  };

  const setEmployeeBlocked = useMutation({
    mutationFn: async ({ employeeId, blocked }: { employeeId: string; blocked: boolean }) => {
      const action = blocked ? "block" : "unblock";
      const res = await apiRequest("PUT", `/api/admin/employees/${employeeId}/${action}`);
      return res.json();
    },
    onSuccess: () => {
      refreshAdminQueries();
      toast({ title: "Employee status updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const respondRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: "accept" | "reject" }) => {
      const res = await apiRequest("POST", `/api/admin/subscription-requests/${requestId}/${status}`);
      return res.json();
    },
    onSuccess: () => {
      refreshAdminQueries();
      toast({ title: "Request updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const completionDecisionMutation = useMutation({
    mutationFn: async ({ taskId, decision }: { taskId: string; decision: "approve" | "reject" }) => {
      const res = await apiRequest("POST", `/api/admin/requests/${taskId}/${decision}`);
      return res.json();
    },
    onSuccess: () => {
      refreshAdminQueries();
      toast({ title: "Completion updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Action failed", description: err.message, variant: "destructive" });
    },
  });

  const saveCompanyMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: companyForm.name,
        description: companyForm.description || null,
        logoUrl: companyForm.logoUrl || null,
        pricingModel: companyForm.pricingModel,
        priceAmount: Number(companyForm.priceAmount || 0),
        serviceAreas: companyForm.serviceAreas
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((name) => ({ name })),
      };
      const res = await apiRequest("PUT", "/api/admin/company", payload);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/company"] });
      toast({ title: "Company profile updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    },
  });

  const inviteEmployeeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/employees/invite", {
        firstName: inviteForm.firstName.trim(),
        lastName: inviteForm.lastName.trim(),
        email: inviteForm.email.trim().toLowerCase(),
      });
      return res.json();
    },
    onSuccess: () => {
      setInviteOpen(false);
      setInviteForm({ firstName: "", lastName: "", email: "" });
      refreshAdminQueries();
      toast({ title: "Invitation sent", description: "Employee added to company as pending verification." });
    },
    onError: (err: Error) => {
      toast({ title: "Invite failed", description: err.message, variant: "destructive" });
    },
  });

  const openClientChatMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const res = await apiRequest("POST", "/api/provider-chats/start", { subscriptionId });
      return res.json() as Promise<{ chatId: string }>;
    },
    onError: (err: Error) => {
      toast({ title: "Chat unavailable", description: err.message, variant: "destructive" });
    },
  });

  const sendClientChatMutation = useMutation({
    mutationFn: async (payload: { chatId: string; body: string }) => {
      const res = await apiRequest("POST", `/api/provider-chats/${payload.chatId}/messages`, { body: payload.body });
      return res.json();
    },
    onSuccess: () => {
      setChatMessage("");
      qc.invalidateQueries({ queryKey: ["/api/provider-chats", selectedClientChat?.chatId, "messages"] });
      qc.invalidateQueries({ queryKey: ["/api/admin/clients"] });
      qc.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (err: Error) => {
      toast({ title: "Send failed", description: err.message, variant: "destructive" });
    },
  });

  const renderEmployees = (employees: ProviderEmployee[], loading: boolean, mode: "all" | "available" | "booked") => {
    if (loading) {
      return <Skeleton className="h-24 w-full rounded-md" />;
    }
    if (employees.length === 0) {
      return <p className="text-sm text-muted-foreground">No employees found.</p>;
    }
    return (
      <div className="space-y-3">
        {employees.map((emp) => (
          <Card key={emp.id} className="p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-semibold">{displayName(emp.user)}</p>
                <p className="text-xs text-muted-foreground">{emp.user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getCategoryBadgeClass(emp.status, "status")}>{emp.status}</Badge>
                {emp.companyBlocked && <Badge className={getCategoryBadgeClass("blocked", "status")}>Blocked</Badge>}
                {mode === "all" && (
                  <Button
                    size="sm"
                    variant={emp.companyBlocked ? "default" : "outline"}
                    onClick={() => setEmployeeBlocked.mutate({ employeeId: emp.id, blocked: !emp.companyBlocked })}
                    disabled={setEmployeeBlocked.isPending || emp.isAdmin}
                  >
                    {emp.companyBlocked ? "Unblock" : "Block"}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="min-h-screen bg-muted/30 flex w-full has-bottom-nav" data-testid="provider-company-admin-dashboard">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Provider</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <SidebarMenuItem key={tab.id}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => setActiveTab(tab.id)}
                          tooltip={tab.label}
                          data-testid={`tab-${tab.id}`}
                        >
                          <Icon />
                          <span>{tab.label}</span>
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
                  isActive={activeTab === "settings"}
                  onClick={() => setActiveTab("settings")}
                  tooltip="Settings"
                  data-testid="tab-settings"
                >
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onLogout} tooltip="Logout" data-testid="button-provider-admin-logout-side">
                  <LogOut />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <div className="mt-2 flex items-center justify-center gap-3 px-2 pb-2 text-[11px] text-muted-foreground">
              <Link href="/terms" target="_blank" rel="noopener noreferrer" className="hover:underline">Terms</Link>
              <span aria-hidden="true">•</span>
              <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:underline">Privacy</Link>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between gap-2 px-4 border-b border-border/50 sticky top-0 z-50 bg-background">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hidden md:flex" data-testid="button-sidebar-toggle-provider-admin" />
              <span className="text-lg font-semibold text-black">Provider</span>
            </div>
            <div className="flex items-center gap-2">
              {canSwitchMode && (
                <Button size="sm" variant="outline" onClick={onSwitchMode} data-testid="button-switch-to-provider-worker">
                  <Repeat2 className="h-4 w-4 mr-1" />
                  Worker Mode
                </Button>
              )}
              <ProviderNotificationBell />
              <Button
                size="icon"
                aria-label="Settings"
                variant="ghost"
                className="md:hidden"
                onClick={() => setActiveTab("settings")}
                data-testid="button-settings-top-provider-admin"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button size="icon" aria-label="Logout" variant="ghost" onClick={onLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <main
            className={`flex-1 overflow-y-auto pb-20 md:pb-6 w-full bg-muted/30 min-h-0 ${
              isClientChatFullscreen ? "p-0" : "portal-page space-y-6"
            }`}
          >
          {(activeTab === "dashboard" || activeTab === "available" || activeTab === "booked") && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {statsLoading ? (
                <>
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </>
              ) : (
                <>
                  <Card className="p-4"><p className="text-xs text-muted-foreground">Total employees</p><p className="text-2xl font-bold">{stats?.total ?? 0}</p></Card>
                  <Card className="p-4"><p className="text-xs text-muted-foreground">Available employees</p><p className="text-2xl font-bold">{stats?.available ?? 0}</p></Card>
                  <Card className="p-4"><p className="text-xs text-muted-foreground">Booked employees</p><p className="text-2xl font-bold">{stats?.booked ?? 0}</p></Card>
                  <Card className="p-4"><p className="text-xs text-muted-foreground">Unavailable employees</p><p className="text-2xl font-bold">{stats?.unavailable ?? 0}</p></Card>
                </>
              )}
            </div>
          )}

          {activeTab === "dashboard" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h2 className="text-base font-semibold">Employees</h2>
                <Button size="sm" onClick={() => setInviteOpen(true)} data-testid="button-invite-employee">
                  <Plus className="h-4 w-4 mr-1" />
                  Invite Employee
                </Button>
              </div>
              {renderEmployees(allEmployees, allEmployeesLoading, "all")}

              <h2 className="text-base font-semibold pt-2">Completion Requests</h2>
              {approvalsLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : approvals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending completion approvals.</p>
              ) : (
                <div className="space-y-3">
                  {approvals.map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <p className="text-sm font-semibold">{item.task?.serviceType || "Task"}</p>
                          <p className="text-xs text-muted-foreground">{item.task?.locationAddress || "No location"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={() => completionDecisionMutation.mutate({ taskId: item.taskId, decision: "approve" })}>
                            <Check className="h-4 w-4 mr-1" />Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => completionDecisionMutation.mutate({ taskId: item.taskId, decision: "reject" })}>
                            <X className="h-4 w-4 mr-1" />Reject
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "available" && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold">Available Employees</h2>
              {renderEmployees(availableEmployees, availableLoading, "available")}
            </div>
          )}

          {activeTab === "booked" && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold">Booked Employees</h2>
              {renderEmployees(bookedEmployees, bookedLoading, "booked")}
            </div>
          )}

          {activeTab === "clients" && (
            <div className={isClientChatFullscreen ? "h-full min-h-0" : "space-y-3"}>
              {!selectedClientChat ? (
                <>
                  <h2 className="text-base font-semibold">Clients</h2>
                  {clientsLoading ? (
                    <Skeleton className="h-24 w-full" />
                  ) : clients.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No active clients.</p>
                  ) : (
                    clients.map((client) => (
                      <Card key={client.subscriptionId} className="p-4">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div>
                            <p className="text-sm font-semibold">{displayName(client.host)}</p>
                            <p className="text-xs text-muted-foreground">{client.host.email || "No email"}</p>
                            <p className="text-xs text-muted-foreground">Active tasks: {client.tasksCount}</p>
                            {client.lastMessage && (
                              <p className="text-xs text-muted-foreground mt-1 truncate max-w-[420px]">
                                Last message: {client.lastMessage}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={async () => {
                              try {
                                const chatId =
                                  client.chatId ||
                                  (await openClientChatMutation.mutateAsync(client.subscriptionId)).chatId;
                                setSelectedClientChat({
                                  subscriptionId: client.subscriptionId,
                                  chatId,
                                  title: displayName(client.host),
                                });
                              } catch {
                                // handled by mutation onError
                              }
                            }}
                            disabled={openClientChatMutation.isPending}
                            data-testid={`button-client-chat-${client.subscriptionId}`}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {client.chatId ? "Open Chat" : "Start Chat"}
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </>
              ) : (
                <div className="flex flex-col h-full min-h-0 bg-background border">
                  <div className="flex items-center gap-3 p-3 border-b">
                    <Button size="icon" variant="ghost" onClick={() => setSelectedClientChat(null)} data-testid="button-back-client-chat">
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                      <p className="text-sm font-semibold">{selectedClientChat.title}</p>
                      <p className="text-xs text-muted-foreground">Client conversation</p>
                    </div>
                  </div>

                  <div ref={clientChatContainerRef} className="flex-1 overflow-auto p-4 space-y-2 chat-scroll">
                    {clientChatLoading ? (
                      <>
                        <Skeleton className="h-10 w-2/3" />
                        <Skeleton className="h-10 w-1/2" />
                      </>
                    ) : clientChatMessages.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No messages yet.</p>
                    ) : (
                      clientChatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-md px-3 py-2 text-sm ${
                              msg.senderId === user.id ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            <p>{msg.messageText}</p>
                            <p className={`text-[10px] mt-1 ${msg.senderId === user.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                              {new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={clientChatEndRef} />
                  </div>

                  <div className="chat-composer flex items-center gap-2">
                    <Input
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && chatMessage.trim()) {
                          sendClientChatMutation.mutate({
                            chatId: selectedClientChat.chatId,
                            body: chatMessage.trim(),
                          });
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      onClick={() =>
                        sendClientChatMutation.mutate({
                          chatId: selectedClientChat.chatId,
                          body: chatMessage.trim(),
                        })
                      }
                      disabled={!chatMessage.trim() || sendClientChatMutation.isPending}
                      data-testid="button-send-client-chat"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "requests" && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold">Incoming Subscription Requests</h2>
              {requestsLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : requests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No incoming requests.</p>
              ) : (
                requests.map((req) => (
                  <Card key={req.id} className="p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-sm font-semibold">{displayName(req.host || {})}</p>
                        <p className="text-xs text-muted-foreground">{req.host?.email || "No email"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</p>
                      </div>
                      {req.status === "PENDING" ? (
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={() => respondRequestMutation.mutate({ requestId: req.id, status: "accept" })}>Accept</Button>
                          <Button size="sm" variant="outline" onClick={() => respondRequestMutation.mutate({ requestId: req.id, status: "reject" })}>Reject</Button>
                        </div>
                      ) : (
                        <Badge className={getCategoryBadgeClass(req.status, "status")}>{req.status}</Badge>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === "company" && (
            <div className="portal-page-narrow">
              <div className="portal-header mb-2">
                <h2 className="portal-title">Company & Profile</h2>
              </div>

              <p className="portal-eyebrow">Profile</p>
              <Card className="portal-card" data-testid="card-company-admin-profile">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user?.profileImageUrl || undefined} />
                    <AvatarFallback className="text-lg font-semibold">
                      {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{displayName(user)}</p>
                    <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                    <Badge variant="secondary" className="mt-1 text-[10px]">Company Admin</Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setActiveTab("settings")} data-testid="button-company-admin-manage-profile">
                    <UserRoundCog className="h-4 w-4 mr-1.5" />
                    Update profile
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("settings")} data-testid="button-company-admin-manage-image">
                    <Camera className="h-4 w-4 mr-1.5" />
                    Update image
                  </Button>
                </div>
              </Card>

              <p className="portal-eyebrow mt-4">Company data</p>
              {companyLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <>
                  <Card className="portal-card" data-testid="card-company-admin-company-data">
                    <div className="space-y-2">
                      <Label className="portal-label">
                        <Building2 className="h-3 w-3" />
                        Name
                      </Label>
                      <Input value={companyForm.name} onChange={(e) => setCompanyForm((p) => ({ ...p, name: e.target.value }))} />
                    </div>

                    <div className="space-y-2">
                      <Label className="portal-label">
                        <Link2 className="h-3 w-3" />
                        Logo URL
                      </Label>
                      <Input value={companyForm.logoUrl} onChange={(e) => setCompanyForm((p) => ({ ...p, logoUrl: e.target.value }))} />
                    </div>

                    <div className="space-y-2">
                      <Label className="portal-label">
                        <FileText className="h-3 w-3" />
                        Description
                      </Label>
                      <Textarea value={companyForm.description} onChange={(e) => setCompanyForm((p) => ({ ...p, description: e.target.value }))} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="portal-label">
                          <Sparkles className="h-3 w-3" />
                          Pricing model
                        </Label>
                        <Select
                          value={companyForm.pricingModel}
                          onValueChange={(value: "PER_HOUR" | "PER_ROOM") =>
                            setCompanyForm((p) => ({ ...p, pricingModel: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PER_HOUR">Per hour</SelectItem>
                            <SelectItem value="PER_ROOM">Per room</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="portal-label">
                          <DollarSign className="h-3 w-3" />
                          Price amount
                        </Label>
                        <Input type="number" value={companyForm.priceAmount} onChange={(e) => setCompanyForm((p) => ({ ...p, priceAmount: e.target.value }))} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="portal-label">
                        <MapPin className="h-3 w-3" />
                        Service areas (one per line)
                      </Label>
                      <Textarea value={companyForm.serviceAreas} onChange={(e) => setCompanyForm((p) => ({ ...p, serviceAreas: e.target.value }))} />
                    </div>
                  </Card>

                  <Button
                    className="w-full mt-4"
                    onClick={() => saveCompanyMutation.mutate()}
                    disabled={saveCompanyMutation.isPending}
                    data-testid="button-save-company-data"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save changes
                  </Button>
                </>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="portal-page-narrow">
              <div className="portal-header mb-2">
                <h2 className="portal-title">Settings</h2>
              </div>
              <ProviderAppSettingsPage embedded showBackButton={false} />
            </div>
          )}
          </main>

          <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/50 z-50 safe-area-bottom md:hidden">
            <div className="max-w-2xl mx-auto flex">
              {mobileTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex-1 flex flex-col items-center gap-0.5 py-2"
                  >
                    <Icon className="h-5 w-5" style={{ color: isActive ? "#FF385C" : undefined }} />
                    <span className="text-[10px] font-medium" style={{ color: isActive ? "#FF385C" : undefined }}>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Company Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>First name</Label>
                <Input
                  value={inviteForm.firstName}
                  onChange={(e) => setInviteForm((p) => ({ ...p, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Last name</Label>
                <Input
                  value={inviteForm.lastName}
                  onChange={(e) => setInviteForm((p) => ({ ...p, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              The invited user will be created as company employee, linked to your company, and marked pending until verification.
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => inviteEmployeeMutation.mutate()}
              disabled={
                inviteEmployeeMutation.isPending ||
                !inviteForm.firstName.trim() ||
                !inviteForm.lastName.trim() ||
                !inviteForm.email.trim()
              }
            >
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
