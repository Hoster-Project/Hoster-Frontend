"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, Camera, Loader2, Building2, FileText, Link2, Sparkles, DollarSign, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type AuthCheck = {
  isProvider: boolean;
  isCompanyAdmin?: boolean;
};

type CompanyInfo = {
  id: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  pricing?: {
    pricingModel: "PER_HOUR" | "PER_ROOM";
    priceAmount: number;
  } | null;
  serviceAreas?: Array<{ id: string; name: string }>;
};

export default function ProviderCompanyProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    logoUrl: "",
    pricingModel: "PER_HOUR" as "PER_HOUR" | "PER_ROOM",
    priceAmount: "",
    serviceAreas: "",
  });

  const { data: authCheck, isLoading: authLoading } = useQuery<AuthCheck>({
    queryKey: ["/api/provider/auth-check"],
  });

  const { data: company, isLoading: companyLoading } = useQuery<CompanyInfo | null>({
    queryKey: ["/api/admin/company"],
    enabled: !!authCheck?.isCompanyAdmin,
  });

  useEffect(() => {
    if (!company) return;
    setForm({
      name: company.name || "",
      description: company.description || "",
      logoUrl: company.logoUrl || "",
      pricingModel: company.pricing?.pricingModel || "PER_HOUR",
      priceAmount: company.pricing?.priceAmount != null ? String(company.pricing.priceAmount) : "",
      serviceAreas: (company.serviceAreas || []).map((a) => a.name).join("\n"),
    });
  }, [company]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        logoUrl: form.logoUrl.trim() || null,
        pricingModel: form.pricingModel,
        priceAmount: Number(form.priceAmount || 0),
        serviceAreas: form.serviceAreas
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((name) => ({ name })),
      };
      const res = await apiRequest("PUT", "/api/admin/company", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/company"] });
      toast({ title: "Company profile updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const logoUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const reader = new FileReader();
      return new Promise<string>((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64 = String(reader.result || "");
            const res = await apiRequest("POST", "/api/upload/avatar", { image: base64 });
            const data = await res.json();
            resolve(String(data.url || ""));
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    onSuccess: (url) => {
      setForm((p) => ({ ...p, logoUrl: url }));
      toast({ title: "Company logo updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Logo upload failed", description: err.message, variant: "destructive" });
    },
    onSettled: () => {
      setUploadingLogo(false);
    },
  });

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Image must be under 10MB", variant: "destructive" });
      return;
    }
    setUploadingLogo(true);
    logoUploadMutation.mutate(file);
  };

  if (authLoading || (authCheck?.isCompanyAdmin && companyLoading)) {
    return (
      <div className="portal-page">
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-80 w-full max-w-2xl" />
      </div>
    );
  }

  if (!authCheck?.isCompanyAdmin) {
    return (
      <div className="portal-page">
        <div className="max-w-xl mx-auto space-y-4">
          <Button variant="ghost" onClick={() => router.push("/provider/settings")} className="pl-0">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Provider Portal
          </Button>
          <Card className="p-5">
            <h1 className="text-lg font-semibold text-black mb-1">Company Profile</h1>
            <p className="text-sm text-muted-foreground">
              This page is available only for provider company admins.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-page">
      <div className="portal-page-narrow">
        <div className="portal-header">
          <Button variant="ghost" size="icon" onClick={() => router.push("/provider/settings")} data-testid="button-provider-company-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="portal-title">Edit Company Profile</h1>
        </div>

        <div className="flex justify-center mb-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={form.logoUrl || undefined} alt={form.name || "Company"} />
              <AvatarFallback className="bg-muted text-xl font-semibold">
                {form.name?.[0]?.toUpperCase() || <Building2 className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-foreground text-background border-2 border-background">
              {uploadingLogo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleLogoSelect}
                disabled={uploadingLogo}
                data-testid="input-provider-company-logo"
              />
            </label>
          </div>
        </div>

        <Card className="portal-card">
          <div className="space-y-2">
            <Label className="portal-label">
              <Building2 className="h-3 w-3" />
              Company name
            </Label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>

          <div className="space-y-2">
            <Label className="portal-label">
              <FileText className="h-3 w-3" />
              Description
            </Label>
            <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>

          <div className="space-y-2">
            <Label className="portal-label">
              <Link2 className="h-3 w-3" />
              Logo URL
            </Label>
            <Input value={form.logoUrl} onChange={(e) => setForm((p) => ({ ...p, logoUrl: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="portal-label">
                <Sparkles className="h-3 w-3" />
                Pricing model
              </Label>
              <Select value={form.pricingModel} onValueChange={(value: "PER_HOUR" | "PER_ROOM") => setForm((p) => ({ ...p, pricingModel: value }))}>
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
              <Input
                type="number"
                value={form.priceAmount}
                onChange={(e) => setForm((p) => ({ ...p, priceAmount: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="portal-label">
              <MapPin className="h-3 w-3" />
              Service areas (one per line)
            </Label>
            <Textarea value={form.serviceAreas} onChange={(e) => setForm((p) => ({ ...p, serviceAreas: e.target.value }))} />
          </div>

          <Button className="w-full" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending || !form.name.trim()} data-testid="button-provider-company-save">
            <Save className="h-4 w-4 mr-1.5" />
            Save changes
          </Button>
        </Card>
      </div>
    </div>
  );
}
