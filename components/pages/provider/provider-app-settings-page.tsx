"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, Save, Bell, SlidersHorizontal, Building2, MessageCircle, Phone, UserRoundCog } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { CURRENCIES } from "@/lib/currencies";

const SOUND_KEY = "hoster_sound_enabled";
const REFRESH_KEY = "provider_chat_refresh_seconds";

type ProviderAuthCheck = {
  isProvider: boolean;
  isCompanyAdmin?: boolean;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  } | null;
};

export default function ProviderAppSettingsPage({
  embedded = false,
  showBackButton = true,
  backHref = "/provider",
}: {
  embedded?: boolean;
  showBackButton?: boolean;
  backHref?: string;
} = {}) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currency, setCurrency] = useState(user?.currency || "USD");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [refreshSeconds, setRefreshSeconds] = useState("5");

  const { data: authCheck } = useQuery<ProviderAuthCheck>({
    queryKey: ["/api/provider/auth-check"],
  });

  useEffect(() => {
    if (user?.currency) setCurrency(user.currency);
  }, [user?.currency]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedSound = window.localStorage.getItem(SOUND_KEY);
    const storedRefresh = window.localStorage.getItem(REFRESH_KEY);
    setSoundEnabled(storedSound !== "false");
    if (storedRefresh) setRefreshSeconds(storedRefresh);
  }, []);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/auth/user", { currency });
      return res.json();
    },
    onSuccess: (updated) => {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SOUND_KEY, String(soundEnabled));
        window.localStorage.setItem(REFRESH_KEY, refreshSeconds);
      }
      queryClient.setQueryData(["/api/auth/user"], updated);
      toast({ title: "Settings saved" });
    },
    onError: (err: Error) => {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className={`${embedded ? "" : "portal-page"} space-y-6`}>
      {showBackButton && (
        <div className="portal-header mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(backHref)}
            aria-label="Go back"
            data-testid="button-provider-settings-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="portal-title">Settings</h2>
        </div>
      )}

      <Card data-testid="card-provider-profile-settings">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Camera className="h-4 w-4" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="text-lg font-semibold">
                  {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "P"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge variant="secondary" className="mt-1 text-[10px]">
                  {authCheck?.isCompanyAdmin ? "Company Admin" : "Provider"}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => router.push("/provider/profile")} data-testid="button-go-provider-profile">
                <UserRoundCog className="h-4 w-4 mr-1.5" />
                Update Profile
              </Button>
              <Button variant="outline" onClick={() => router.push("/provider/profile/image")} data-testid="button-go-provider-profile-image">
                Update Image
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-provider-app-preferences">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" /> App Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Preferred currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.code} - {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Notification sound</p>
              <p className="text-xs text-muted-foreground">Play a sound when a new message notification arrives.</p>
            </div>
            <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
          </div>

          <div className="space-y-2">
            <Label>Chat refresh interval</Label>
            <Select value={refreshSeconds} onValueChange={setRefreshSeconds}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Every 3 seconds</SelectItem>
                <SelectItem value="5">Every 5 seconds</SelectItem>
                <SelectItem value="10">Every 10 seconds</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} data-testid="button-provider-save-settings">
            <Save className="h-4 w-4 mr-1.5" />
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {authCheck?.isCompanyAdmin && (
        <Card data-testid="card-provider-company-settings">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Company Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => router.push("/provider/company-profile")} data-testid="button-go-provider-company-profile">
              Open Company Profile
            </Button>
          </CardContent>
        </Card>
      )}

      <Card data-testid="card-provider-support-settings">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageCircle className="h-4 w-4" /> Support
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/provider/support-chat")} data-testid="button-provider-go-support-chat">
            Open Support Chat
          </Button>
          <Button variant="outline" onClick={() => router.push("/provider/support-chat")} data-testid="button-provider-call-support">
            <Phone className="h-4 w-4 mr-1.5" />
            Call Support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
