"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChannelIcon } from "@/components/channel-icon";
import { useAuth } from "@/hooks/use-auth";
import {
  Camera,
  User,
  Globe,
  Building2,
  FileText,
  Zap,
  Wrench,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { CHANNEL_KEYS, type ChannelKey } from "@/lib/constants";

interface SettingsData {
  channels: Array<{
    channelKey: ChannelKey;
    channelId: string;
    name: string;
    status: string;
  }>;
  listings: Array<{
    id: string;
    name: string;
  }>;
  templates: Array<{
    id: string;
    name: string;
    body: string;
  }>;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading } = useQuery<SettingsData>({
    queryKey: ["/api/settings"],
  });

  if (isLoading) {
    return (
      <div className="portal-page space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  const connectedChannels = data?.channels?.filter((c) => c.status === "CONNECTED" || c.status === "ERROR") || [];

  return (
    <div className="portal-page space-y-6">
      <h2 className="portal-title" data-testid="text-settings-title">Settings</h2>

      <Card data-testid="card-host-profile-settings">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Camera className="h-4 w-4" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-14 w-14">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="text-sm font-semibold">
                  {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "H"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                <Badge variant="secondary" className="mt-1 text-[10px]">Host</Badge>
              </div>
            </div>
            <Button variant="outline" onClick={() => router.push("/profile")} data-testid="button-go-host-profile">
              <User className="h-4 w-4 mr-1.5" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-host-channel-settings">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" /> Channels
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{connectedChannels.length} connected</Badge>
            <div className="flex -space-x-1">
              {CHANNEL_KEYS.slice(0, 4).map((key) => (
                <div key={key} className="flex h-5 w-5 items-center justify-center rounded-full bg-muted border-2 border-background">
                  <ChannelIcon channelKey={key} size={9} />
                </div>
              ))}
            </div>
          </div>
          <Button variant="outline" onClick={() => router.push("/channels")} data-testid="button-go-host-channels">
            Manage Channels
          </Button>
        </CardContent>
      </Card>

      <Card data-testid="card-host-workflow-settings">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" /> Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button variant="outline" className="justify-start" onClick={() => router.push("/settings/listings")} data-testid="button-go-host-listings">
            <Building2 className="h-4 w-4 mr-1.5" />
            Listings ({data?.listings?.length || 0})
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => router.push("/settings/templates")} data-testid="button-go-host-templates">
            <FileText className="h-4 w-4 mr-1.5" />
            Templates ({data?.templates?.length || 0})
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => router.push("/settings/automation")} data-testid="button-go-host-automation">
            <Zap className="h-4 w-4 mr-1.5" />
            Automation
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => router.push("/settings/maintenance")} data-testid="button-go-host-maintenance">
            <Wrench className="h-4 w-4 mr-1.5" />
            Maintenance
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => router.push("/settings/cleaning")} data-testid="button-go-host-cleaning">
            <Sparkles className="h-4 w-4 mr-1.5" />
            Service Providers
          </Button>
        </CardContent>
      </Card>

      <Card data-testid="card-host-support-settings">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageCircle className="h-4 w-4" /> Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => router.push("/support-chat")} data-testid="button-go-host-support-chat">
            Open Support Chat
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
