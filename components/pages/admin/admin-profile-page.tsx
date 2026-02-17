"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Camera, Loader2, User, Mail, Phone, Globe, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getCategoryBadgeClass } from "@/lib/category-badge";
import { CURRENCIES } from "@/lib/currencies";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    currency: "USD",
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phone: user.phone || "",
      country: user.country || "",
      city: user.city || "",
      currency: user.currency || "USD",
    });
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/auth/user", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        country: form.country.trim() || null,
        city: form.city.trim() || null,
        currency: form.currency || null,
      });
      return res.json();
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["/api/auth/user"], updated);
      toast({ title: "Profile updated" });
      router.push("/admin/settings");
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const imageMutation = useMutation({
    mutationFn: async (file: File) => {
      const reader = new FileReader();
      return new Promise<any>((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64 = String(reader.result || "");
            const res = await apiRequest("PATCH", "/api/admin/settings/profile", { profileImageUrl: base64 });
            const data = await res.json();
            resolve(data);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["/api/auth/user"], (old: any) => ({
        ...(old || {}),
        ...(updated || {}),
      }));
      toast({ title: "Profile image updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Image upload failed", description: err.message, variant: "destructive" });
    },
    onSettled: () => {
      setUploadingImage(false);
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Image must be under 10MB", variant: "destructive" });
      return;
    }
    setUploadingImage(true);
    imageMutation.mutate(file);
  };

  return (
    <div className="portal-page">
      <div className="portal-page-narrow">
        <div className="portal-header">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/settings")} data-testid="button-admin-profile-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="portal-title">Edit Profile</h1>
        </div>

        <div className="flex justify-center mb-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "Admin"} />
              <AvatarFallback className="bg-muted text-xl font-semibold">
                {user?.firstName?.[0]?.toUpperCase() || <User className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-foreground text-background border-2 border-background">
              {uploadingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={uploadingImage}
                data-testid="input-admin-avatar-file"
              />
            </label>
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
            <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            <Badge className={getCategoryBadgeClass(user?.emailVerifiedAt ? "email-verified" : "email-not-verified", "status")}>
              {user?.emailVerifiedAt ? "Email verified" : "Email not verified"}
            </Badge>
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
                <Globe className="h-3 w-3" />
                Country
              </Label>
              <Input value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="portal-label">
              <Globe className="h-3 w-3" />
              City
            </Label>
            <Input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
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
              <SelectTrigger data-testid="select-admin-currency">
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
          disabled={updateMutation.isPending || !form.firstName.trim() || !form.lastName.trim() || !form.email.trim()}
          data-testid="button-admin-save-profile"
        >
          {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save changes
        </Button>
      </div>
    </div>
  );
}
