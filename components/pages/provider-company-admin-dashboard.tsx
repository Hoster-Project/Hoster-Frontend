"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Briefcase,
  FileCheck2,
  Building2,
  LogOut,
  Check,
  X,
  Repeat2,
  Plus,
} from "lucide-react";

type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

type ProviderDashboardStats = {
  total: number;
  free: number;
  working: number;
  unavailable: number;
};

type ProviderEmployee = {
  id: string;
  status: "FREE" | "RESERVED" | "WORKING" | "UNAVAILABLE";
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
  host: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  };
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

type TabId = "dashboard" | "free" | "working" | "clients" | "requests" | "company";

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
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ firstName: "", lastName: "", email: "" });
  const { toast } = useToast();
  const qc = useQueryClient();

  const tabs: Array<{ id: TabId; label: string; icon: any }> = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "free", label: "Free", icon: UserCheck },
    { id: "working", label: "Working", icon: Briefcase },
    { id: "clients", label: "Clients", icon: Users },
    { id: "requests", label: "Requests", icon: FileCheck2 },
    { id: "company", label: "Company Data", icon: Building2 },
  ];

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

  const { data: freeEmployees = [], isLoading: freeLoading } = useQuery<ProviderEmployee[]>({
    queryKey: ["/api/admin/employees/free"],
    enabled: activeTab === "free",
    queryFn: async () => {
      const res = await fetch("/api/admin/employees/free", { credentials: "include", cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load free employees");
      return res.json();
    },
  });

  const { data: workingEmployees = [], isLoading: workingLoading } = useQuery<ProviderEmployee[]>({
    queryKey: ["/api/admin/employees/working"],
    enabled: activeTab === "working",
    queryFn: async () => {
      const res = await fetch("/api/admin/employees/working", { credentials: "include", cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load working employees");
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
    qc.invalidateQueries({ queryKey: ["/api/admin/employees/free"] });
    qc.invalidateQueries({ queryKey: ["/api/admin/employees/working"] });
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

  const renderEmployees = (employees: ProviderEmployee[], loading: boolean, mode: "all" | "free" | "working") => {
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
                <Badge variant="secondary">{emp.status}</Badge>
                {emp.companyBlocked && <Badge variant="destructive">Blocked</Badge>}
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
    <div className="min-h-screen bg-background flex" data-testid="provider-company-admin-dashboard">
      <aside className="hidden md:flex md:w-56 lg:w-64 border-r border-border/50 bg-background">
        <div className="flex flex-col w-full">
          <div className="h-14 flex items-center px-4 border-b border-border/50">
            <span className="text-lg font-extrabold tracking-tight" style={{ color: "#FF385C" }}>
              Provider Admin
            </span>
          </div>
          <nav className="flex-1 px-2 py-3 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
          <div className="border-t border-border/50 p-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">{user.firstName} {user.lastName}</p>
              </div>
              <Button size="icon" aria-label="Logout" variant="ghost" onClick={onLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
              <Link href="/terms" target="_blank" rel="noopener noreferrer" className="hover:underline">Terms</Link>
              <span aria-hidden="true">•</span>
              <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:underline">Privacy</Link>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center justify-between gap-2 px-4 border-b border-border/50 sticky top-0 z-50 bg-background">
          <span className="text-lg font-extrabold tracking-tight" style={{ color: "#FF385C" }}>
            Provider Admin
          </span>
          <div className="flex items-center gap-2">
            {canSwitchMode && (
              <Button size="sm" variant="outline" onClick={onSwitchMode} data-testid="button-switch-to-provider-worker">
                <Repeat2 className="h-4 w-4 mr-1" />
                Worker Mode
              </Button>
            )}
            <Button size="icon" aria-label="Logout" variant="ghost" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-20 md:pb-6 w-full bg-muted/20 p-4 md:p-6 space-y-6">
          {(activeTab === "dashboard" || activeTab === "free" || activeTab === "working") && (
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
                  <Card className="p-4"><p className="text-xs text-muted-foreground">Free employees</p><p className="text-2xl font-bold">{stats?.free ?? 0}</p></Card>
                  <Card className="p-4"><p className="text-xs text-muted-foreground">Working employees</p><p className="text-2xl font-bold">{stats?.working ?? 0}</p></Card>
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

          {activeTab === "free" && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold">Free Employees</h2>
              {renderEmployees(freeEmployees, freeLoading, "free")}
            </div>
          )}

          {activeTab === "working" && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold">Working Employees</h2>
              {renderEmployees(workingEmployees, workingLoading, "working")}
            </div>
          )}

          {activeTab === "clients" && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold">Clients</h2>
              {clientsLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : clients.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active clients.</p>
              ) : (
                clients.map((client) => (
                  <Card key={client.subscriptionId} className="p-4">
                    <p className="text-sm font-semibold">{displayName(client.host)}</p>
                    <p className="text-xs text-muted-foreground">{client.host.email || "No email"}</p>
                    <p className="text-xs text-muted-foreground">Active tasks: {client.tasksCount}</p>
                  </Card>
                ))
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
                        <Badge variant="secondary">{req.status}</Badge>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === "company" && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold">Company Profile</h2>
              {companyLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : (
                <Card className="p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Name</Label>
                      <Input value={companyForm.name} onChange={(e) => setCompanyForm((p) => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <Label>Logo URL</Label>
                      <Input value={companyForm.logoUrl} onChange={(e) => setCompanyForm((p) => ({ ...p, logoUrl: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Description</Label>
                    <Textarea value={companyForm.description} onChange={(e) => setCompanyForm((p) => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Pricing model</Label>
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
                    <div className="space-y-1">
                      <Label>Price amount</Label>
                      <Input type="number" value={companyForm.priceAmount} onChange={(e) => setCompanyForm((p) => ({ ...p, priceAmount: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Service areas (one line each)</Label>
                    <Textarea value={companyForm.serviceAreas} onChange={(e) => setCompanyForm((p) => ({ ...p, serviceAreas: e.target.value }))} />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => saveCompanyMutation.mutate()} disabled={saveCompanyMutation.isPending}>
                      Save Company Data
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/50 z-50 safe-area-bottom md:hidden">
          <div className="max-w-2xl mx-auto flex">
            {tabs.map((tab) => {
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
    </div>
  );
}
