"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, Camera, Loader2, User, Mail, Phone, Building2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { CURRENCIES } from "@/lib/currencies";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ProviderProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  companyName?: string;
  profileImageUrl?: string;
};

export default function ProviderProfileInfoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    companyName: "",
    currency: "USD",
  });

  const { data, isLoading } = useQuery<ProviderProfile>({
    queryKey: ["/api/provider/profile"],
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      phone: data.phone || "",
      companyName: data.companyName || "",
      currency: user?.currency || "USD",
    });
  }, [data, user?.currency]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/auth/user", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim() || null,
        companyName: form.companyName.trim() || null,
        currency: form.currency || null,
      });
      return res.json();
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["/api/auth/user"], updated);
      queryClient.invalidateQueries({ queryKey: ["/api/provider/profile"] });
      toast({ title: "Profile updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="portal-page">
        <Skeleton className="h-10 w-40 mb-4" />
        <Skeleton className="h-72 w-full max-w-2xl" />
      </div>
    );
  }

  return (
    <div className="portal-page">
      <div className="portal-page-narrow">
        <div className="portal-header">
          <Button variant="ghost" size="icon" onClick={() => router.push("/provider/settings")} data-testid="button-provider-profile-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="portal-title">Edit Profile</h1>
        </div>

        <div className="flex justify-center mb-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={data?.profileImageUrl || undefined} alt={data?.firstName || "Provider"} />
              <AvatarFallback className="bg-muted text-xl font-semibold">
                {data?.firstName?.[0]?.toUpperCase() || <User className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            <button
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background border-2 border-background"
              onClick={() => router.push("/provider/profile/image")}
              data-testid="button-provider-go-image"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <p className="portal-eyebrow">Profile info</p>
        <Card className="portal-card">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="portal-label">
                <User className="h-3 w-3" />
                First name
              </Label>
              <Input value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="portal-label">
                <User className="h-3 w-3" />
                Last name
              </Label>
              <Input value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="portal-label">
              <Mail className="h-3 w-3" />
              Email
            </Label>
            <Input value={data?.email || ""} disabled />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="portal-label">
                <Phone className="h-3 w-3" />
                Phone
              </Label>
              <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="portal-label">
                <Building2 className="h-3 w-3" />
                Company name
              </Label>
              <Input value={form.companyName} onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))} />
            </div>
          </div>
        </Card>

        <p className="portal-eyebrow mt-4">App preferences</p>
        <Card className="portal-card">
          <div className="space-y-2">
            <Label className="portal-label">
              <Sparkles className="h-3 w-3" />
              Currency
            </Label>
            <Select value={form.currency} onValueChange={(currency) => setForm((p) => ({ ...p, currency }))}>
              <SelectTrigger data-testid="select-provider-currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol} {c.code} - {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Button
          className="w-full mt-6"
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending || !form.firstName.trim() || !form.lastName.trim()}
          data-testid="button-provider-save-profile"
        >
          {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save changes
        </Button>
      </div>
    </div>
  );
}
