"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Plus,
  Wrench,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Layers,
  Archive,
} from "lucide-react";
import AdminProviders from "./admin-providers";

type Company = {
  id: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  serviceType: "CLEANING" | "MAINTENANCE";
  companyType: "COMPANY" | "FREELANCER";
  admin: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    role: string;
  };
  pricing?: {
    pricingModel: "PER_HOUR" | "PER_ROOM";
    priceAmount: number;
  } | null;
  serviceAreas?: Array<{ id: string; name: string }>;
  _count?: { employees: number; subscriptions: number; tasks: number; reviews: number };
};

type AdminCandidate = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  role: string;
  companyId: string | null;
  companyName: string | null;
};

function fullName(p: { firstName?: string | null; lastName?: string | null; email: string }) {
  const n = `${p.firstName || ""} ${p.lastName || ""}`.trim();
  return n || p.email;
}

export default function AdminMarketplacePage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"companies" | "legacy">("companies");
  const [serviceFilter, setServiceFilter] = useState<"ALL" | "CLEANING" | "MAINTENANCE">("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    adminUserId: "",
    serviceType: "CLEANING" as "CLEANING" | "MAINTENANCE",
    companyType: "COMPANY" as "COMPANY" | "FREELANCER",
    description: "",
    pricingModel: "PER_HOUR" as "PER_HOUR" | "PER_ROOM",
    priceAmount: "",
    serviceAreas: "",
  });

  const companiesQueryKey = [
    "/api/admin/marketplace/companies",
    serviceFilter === "ALL" ? "" : `?serviceType=${serviceFilter}`,
  ];

  const { data: companies = [], isLoading: companiesLoading } = useQuery<Company[]>({
    queryKey: companiesQueryKey,
    queryFn: async () => {
      const qs = serviceFilter === "ALL" ? "" : `?serviceType=${serviceFilter}`;
      const res = await fetch(`/api/admin/marketplace/companies${qs}`, { credentials: "include", cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load companies");
      return res.json();
    },
  });

  const { data: adminCandidates = [] } = useQuery<AdminCandidate[]>({
    queryKey: ["/api/admin/marketplace/admin-candidates"],
    queryFn: async () => {
      const res = await fetch("/api/admin/marketplace/admin-candidates", { credentials: "include", cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load admin candidates");
      return res.json();
    },
  });

  const availableAdmins = useMemo(() => adminCandidates.filter((u) => !u.companyId), [adminCandidates]);

  const createCompanyMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        name: createForm.name,
        adminUserId: createForm.adminUserId,
        serviceType: createForm.serviceType,
        companyType: createForm.companyType,
        description: createForm.description || null,
      };

      if (createForm.priceAmount.trim()) {
        payload.pricingModel = createForm.pricingModel;
        payload.priceAmount = Number(createForm.priceAmount);
      }

      const areas = createForm.serviceAreas
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((name) => ({ name }));
      if (areas.length > 0) payload.serviceAreas = areas;

      const res = await apiRequest("POST", "/api/admin/marketplace/companies", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketplace/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketplace/admin-candidates"] });
      setCreateOpen(false);
      setCreateForm({
        name: "",
        adminUserId: "",
        serviceType: "CLEANING",
        companyType: "COMPANY",
        description: "",
        pricingModel: "PER_HOUR",
        priceAmount: "",
        serviceAreas: "",
      });
      toast({ title: "Company created" });
    },
    onError: (err: Error) => {
      toast({ title: "Create company failed", description: err.message, variant: "destructive" });
    },
  });

  const assignAdminMutation = useMutation({
    mutationFn: async ({ companyId, adminUserId }: { companyId: string; adminUserId: string }) => {
      const res = await apiRequest("POST", `/api/admin/marketplace/companies/${companyId}/assign-admin`, { adminUserId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketplace/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/marketplace/admin-candidates"] });
      toast({ title: "Company admin updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Assign admin failed", description: err.message, variant: "destructive" });
    },
  });

  const companyAdminsByCompany = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of companies) map.set(c.id, c.admin.id);
    return map;
  }, [companies]);

  const totalCompanies = companies.length;
  const cleaningCompanies = companies.filter((c) => c.serviceType === "CLEANING").length;
  const maintenanceCompanies = companies.filter((c) => c.serviceType === "MAINTENANCE").length;

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <Tabs value={tab} onValueChange={(v) => setTab(v as "companies" | "legacy")}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="companies">
            <Layers className="h-4 w-4 mr-1.5" />
            Marketplace Companies
          </TabsTrigger>
          <TabsTrigger value="legacy">
            <Archive className="h-4 w-4 mr-1.5" />
            Legacy Provider Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-6 mt-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-primary">Marketplace Companies</h1>
              <p className="text-sm text-muted-foreground mt-1">Create provider companies, assign company admins, and monitor structure.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => {
                queryClient.invalidateQueries({ queryKey: ["/api/admin/marketplace/companies"] });
                queryClient.invalidateQueries({ queryKey: ["/api/admin/marketplace/admin-candidates"] });
              }}>
                <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
              </Button>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" /> Add Company
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Companies</p><p className="text-2xl font-bold">{totalCompanies}</p></CardContent>
            </Card>
            <Card>
              <CardContent className="p-4"><p className="text-xs text-muted-foreground">Cleaning</p><p className="text-2xl font-bold">{cleaningCompanies}</p></CardContent>
            </Card>
            <Card>
              <CardContent className="p-4"><p className="text-xs text-muted-foreground">Maintenance</p><p className="text-2xl font-bold">{maintenanceCompanies}</p></CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Service Type</Label>
            <Select value={serviceFilter} onValueChange={(v: any) => setServiceFilter(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="CLEANING">Cleaning</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {companiesLoading ? (
              <p className="text-sm text-muted-foreground">Loading companies...</p>
            ) : companies.length === 0 ? (
              <Card><CardContent className="p-6 text-sm text-muted-foreground">No companies found.</CardContent></Card>
            ) : (
              companies.map((company) => {
                const selectedAdminId = companyAdminsByCompany.get(company.id) || "";
                return (
                  <Card key={company.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {company.name}
                        <Badge variant="secondary">{company.companyType}</Badge>
                        <Badge variant="outline" className="ml-1">
                          {company.serviceType === "CLEANING" ? <Sparkles className="h-3 w-3 mr-1" /> : <Wrench className="h-3 w-3 mr-1" />}
                          {company.serviceType}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {company.description && <p className="text-sm text-muted-foreground">{company.description}</p>}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                        <div>Employees: <span className="text-foreground">{company._count?.employees ?? 0}</span></div>
                        <div>Clients: <span className="text-foreground">{company._count?.subscriptions ?? 0}</span></div>
                        <div>Tasks: <span className="text-foreground">{company._count?.tasks ?? 0}</span></div>
                        <div>Reviews: <span className="text-foreground">{company._count?.reviews ?? 0}</span></div>
                      </div>

                      <div className="rounded-md border p-3 space-y-2">
                        <div className="text-sm font-medium flex items-center gap-1.5">
                          <ShieldCheck className="h-4 w-4" /> Company Admin
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Current: {fullName(company.admin)} ({company.admin.email})
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Select
                            value={selectedAdminId}
                            onValueChange={(nextAdminId) => {
                              if (nextAdminId === selectedAdminId) return;
                              assignAdminMutation.mutate({ companyId: company.id, adminUserId: nextAdminId });
                            }}
                          >
                          <SelectTrigger className="w-full sm:w-[320px]" data-testid={`select-company-admin-${company.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {adminCandidates.map((candidate) => {
                                const takenByAnother = Boolean(candidate.companyId && candidate.companyId !== company.id);
                                return (
                                  <SelectItem
                                    key={candidate.id}
                                    value={candidate.id}
                                    disabled={takenByAnother}
                                  >
                                    {fullName(candidate)} · {candidate.email}
                                    {takenByAnother ? ` (manages ${candidate.companyName})` : ""}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="legacy" className="mt-4">
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              Legacy providers features (Provider list, Requests, Promotions) are available here for compatibility.
            </CardContent>
          </Card>
          <div className="-mx-6">
            <AdminProviders />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Marketplace Company</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Company Name</Label>
              <Input value={createForm.name} onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Company Admin User</Label>
              <Select value={createForm.adminUserId} onValueChange={(v) => setCreateForm((p) => ({ ...p, adminUserId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select admin user" />
                </SelectTrigger>
                <SelectContent>
                  {adminCandidates.map((u) => {
                    const isTaken = Boolean(u.companyId);
                    return (
                      <SelectItem key={u.id} value={u.id} disabled={isTaken}>
                        {fullName(u)} · {u.email}
                        {isTaken ? ` (manages ${u.companyName})` : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {availableAdmins.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No free admin users available. Create a new Provider/Admin/Moderator user first.
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Service Type</Label>
              <Select value={createForm.serviceType} onValueChange={(v: any) => setCreateForm((p) => ({ ...p, serviceType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLEANING">Cleaning</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Company Type</Label>
              <Select value={createForm.companyType} onValueChange={(v: any) => setCreateForm((p) => ({ ...p, companyType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPANY">Company</SelectItem>
                  <SelectItem value="FREELANCER">Freelancer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Pricing Model (optional)</Label>
              <Select value={createForm.pricingModel} onValueChange={(v: any) => setCreateForm((p) => ({ ...p, pricingModel: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PER_HOUR">Per Hour</SelectItem>
                  <SelectItem value="PER_ROOM">Per Room</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Price Amount (optional)</Label>
              <Input type="number" min="0" value={createForm.priceAmount} onChange={(e) => setCreateForm((p) => ({ ...p, priceAmount: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Description (optional)</Label>
            <Textarea value={createForm.description} onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
          </div>

          <div className="space-y-1">
            <Label>Service Areas (optional, one per line)</Label>
            <Textarea value={createForm.serviceAreas} onChange={(e) => setCreateForm((p) => ({ ...p, serviceAreas: e.target.value }))} rows={3} />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              disabled={createCompanyMutation.isPending || !createForm.name || !createForm.adminUserId}
              onClick={() => createCompanyMutation.mutate()}
            >
              {createCompanyMutation.isPending ? "Creating..." : "Create Company"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
