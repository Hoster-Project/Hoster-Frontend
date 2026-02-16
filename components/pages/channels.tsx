"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChannelIcon } from "@/components/channel-icon";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
 ArrowLeft,
 Loader2,
 Plug,
} from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { CHANNEL_KEYS, CHANNEL_INFO, EXTRA_CHANNELS, type ChannelKey } from "@/lib/constants";

interface SettingsData {
 channels: Array<{
 channelKey: ChannelKey;
 channelId: string;
 name: string;
 status: string;
 lastSyncAt: string | null;
 lastError: string | null;
 }>;
 listings: Array<any>;
 templates: Array<any>;
 reminderSettings: any;
}

export default function ChannelsPage() {
 const { toast } = useToast();
 const router = useRouter();
  const setLocation = (path: string) => router.push(path);
 const [connectingChannel, setConnectingChannel] = useState<{ channelKey: ChannelKey; channelId: string } | null>(null);
 const [disconnectChannel, setDisconnectChannel] = useState<{ channelKey: ChannelKey; channelId: string; name: string } | null>(null);
 const [disconnectConfirmText, setDisconnectConfirmText] = useState("");

 const { data, isLoading } = useQuery<SettingsData>({
 queryKey: ["/api/settings"],
 });

 const connectMutation = useMutation({
 mutationFn: async ({ channelId }: { channelId: string }) => {
 const res = await apiRequest("POST", "/api/channels/connect", { channelId });
 return await res.json();
 },
 onSuccess: (data: any) => {
 queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
 queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
 queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
 queryClient.invalidateQueries({ queryKey: ["/api/inbox"] });
 if (data?.oauthUrl) {
   setLocation(String(data.oauthUrl));
 } else {
   toast({ title: "Failed to start connection", variant: "destructive" });
 }
 },
 onError: () => {
 toast({ title: "Failed to connect", variant: "destructive" });
 },
 });

 const disconnectMutation = useMutation({
 mutationFn: async ({ channelId }: { channelId: string }) => {
 const res = await apiRequest("POST", "/api/channels/disconnect", { channelId });
 return await res.json();
 },
 onSuccess: (data: any) => {
 queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
 queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
 toast({
   title: "Channel disconnected",
   description:
     typeof data?.deletedBookings === "number"
       ? `${data.deletedBookings} booking(s) deleted.`
       : undefined,
 });
 setDisconnectChannel(null);
 setDisconnectConfirmText("");
 },
 onError: () => {
 toast({ title: "Failed to disconnect", variant: "destructive" });
 },
 });

 if (isLoading) {
 return (
 <div className="px-4 py-4 space-y-4">
 <Skeleton className="h-8 w-32" />
 <Skeleton className="h-24 w-full" />
 <Skeleton className="h-24 w-full" />
 <Skeleton className="h-24 w-full" />
 </div>
 );
 }

 const allChannelData = data?.channels || [];
 const connectedChannels = allChannelData.filter(
 (c) => c.status === "CONNECTED" || c.status === "ERROR"
 );
 const mainChannelKeysNotConnected = CHANNEL_KEYS.filter(
 (key) => !connectedChannels.some((c) => c.channelKey === key)
 );
 const extraChannelKeys = Object.keys(EXTRA_CHANNELS);

 return (
 <div className="px-4 py-4 pb-8">
 <div className="flex items-center gap-2.5 mb-6 py-1">
 <Button
 size="icon"
 aria-label="Go back"
 variant="ghost"
 onClick={() => setLocation("/settings")}
 data-testid="button-back-channels"
 >
 <ArrowLeft className="h-4 w-4" />
 </Button>
 <h1 className="text-lg font-semibold text-primary" data-testid="text-channels-title">Manage Channels</h1>
 </div>

 {connectedChannels.length > 0 && (
 <>
 <div className="mb-4">
 <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
 Connected Channels
 </h2>
 </div>
 <div className="space-y-3">
 {CHANNEL_KEYS.filter((key) => connectedChannels.some((c) => c.channelKey === key)).map((key) => {
 const info = CHANNEL_INFO[key];
 const channelData = allChannelData.find(c => c.channelKey === key);
 const isConnected = channelData?.status === "CONNECTED";
 const isError = channelData?.status === "ERROR";

 return (
 <Card key={key} className="p-4" data-testid={`channel-card-${key.toLowerCase()}`}>
 <div className="flex items-center justify-between gap-3">
 <div className="flex items-center gap-3 min-w-0">
 <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted flex-shrink-0">
 <ChannelIcon channelKey={key} size={20} />
 </div>
 <div className="min-w-0">
 <p className="font-medium text-sm">{info.name}</p>
 {isConnected && channelData?.lastSyncAt && (
 <p className="text-xs text-muted-foreground mt-0.5">
 Synced {formatDistanceToNow(parseISO(channelData.lastSyncAt), { addSuffix: true })}
 </p>
 )}
 {isError && channelData?.lastError && (
 <p className="text-xs text-destructive truncate mt-0.5">
 {channelData.lastError}
 </p>
 )}
 {!isConnected && !isError && (
 <p className="text-xs text-muted-foreground mt-0.5">Not connected</p>
 )}
 </div>
 </div>
 {isConnected || isError ? (
 <div className="flex items-center gap-2 flex-shrink-0">
 <Badge
 variant="secondary"
 className={`text-xs no-default-hover-elevate no-default-active-elevate ${isError ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}
 >
 {isError ? "Error" : "Active"}
 </Badge>
 <Button
 size="sm"
 variant="outline"
 onClick={() => {
   if (!channelData?.channelId) return;
   setDisconnectChannel({ channelKey: key, channelId: channelData.channelId, name: info.name });
   setDisconnectConfirmText("");
 }}
 disabled={disconnectMutation.isPending}
 data-testid={`button-disconnect-${key.toLowerCase()}`}
 >
 {disconnectMutation.isPending ? (
 <Loader2 className="h-3.5 w-3.5 animate-spin" />
 ) : (
 "Disconnect"
 )}
 </Button>
 </div>
 ) : (
 <Button
 size="sm"
 onClick={() => {
 if (!channelData?.channelId) return;
 setConnectingChannel({ channelKey: key, channelId: channelData.channelId });
 }}
 data-testid={`button-connect-${key.toLowerCase()}`}
 >
 <Plug className="h-3.5 w-3.5 mr-1.5" />
 Connect
 </Button>
 )}
 </div>
 </Card>
 );
 })}
 </div>
 </>
 )}

 <div className={connectedChannels.length > 0 ? "mt-6 mb-4" : "mb-4"}>
 <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
 More channels
 </h2>
 </div>
 <div className="space-y-3">
 {mainChannelKeysNotConnected.map((key) => {
 const info = CHANNEL_INFO[key];
 return (
 <Card key={key} className="p-4" data-testid={`channel-card-${key.toLowerCase()}`}>
 <div className="flex items-center justify-between gap-3">
 <div className="flex items-center gap-3 min-w-0">
 <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted flex-shrink-0">
 <ChannelIcon channelKey={key} size={20} />
 </div>
 <div className="min-w-0">
 <p className="font-medium text-sm">{info.name}</p>
 <p className="text-xs text-muted-foreground mt-0.5">Not connected</p>
 </div>
 </div>
 <Button
 size="sm"
 onClick={() => {
 const channelData = allChannelData.find((c) => c.channelKey === key);
 if (!channelData?.channelId) return;
 setConnectingChannel({ channelKey: key, channelId: channelData.channelId });
 }}
 data-testid={`button-connect-${key.toLowerCase()}`}
 >
 <Plug className="h-3.5 w-3.5 mr-1.5" />
 Connect
 </Button>
 </div>
 </Card>
 );
 })}
 {extraChannelKeys.map((key) => {
 const ch = EXTRA_CHANNELS[key];
 return (
 <Card key={key} className="p-4" data-testid={`channel-card-${key.toLowerCase()}`}>
 <div className="flex items-center justify-between gap-3">
 <div className="flex items-center gap-3 min-w-0">
 <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted flex-shrink-0">
 <ChannelIcon channelKey={key} size={20} />
 </div>
 <div className="min-w-0">
 <p className="font-medium text-sm">{ch.name}</p>
 <p className="text-xs text-muted-foreground mt-0.5">Not connected</p>
 </div>
 </div>
 <Button
 size="sm"
 onClick={() => {
 toast({ title: "Coming soon", description: "This channel is not available yet." });
 }}
 data-testid={`button-connect-${key.toLowerCase()}`}
 >
 <Plug className="h-3.5 w-3.5 mr-1.5" />
 Connect
 </Button>
 </div>
 </Card>
 );
 })}
 </div>

 <AlertDialog
   open={connectingChannel !== null}
   onOpenChange={(open) => {
     if (!open) setConnectingChannel(null);
   }}
 >
   <AlertDialogContent data-testid="dialog-connect-channel">
     <AlertDialogHeader>
       <AlertDialogTitle className="flex items-center gap-2">
         {connectingChannel && <ChannelIcon channelKey={connectingChannel.channelKey} size={20} />}
         Connect {connectingChannel ? CHANNEL_INFO[connectingChannel.channelKey]?.name : ""}
       </AlertDialogTitle>
       <AlertDialogDescription>
         You will be redirected to complete the connection.
       </AlertDialogDescription>
     </AlertDialogHeader>
     <AlertDialogFooter>
       <AlertDialogCancel data-testid="button-cancel-connect">Cancel</AlertDialogCancel>
       <AlertDialogAction
         onClick={() => {
           if (!connectingChannel) return;
           connectMutation.mutate({ channelId: connectingChannel.channelId });
         }}
         disabled={connectMutation.isPending}
         data-testid="button-confirm-connect"
       >
         {connectMutation.isPending ? (
           <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
         ) : null}
         Continue
       </AlertDialogAction>
     </AlertDialogFooter>
   </AlertDialogContent>
 </AlertDialog>

 <AlertDialog
   open={disconnectChannel !== null}
   onOpenChange={(open) => {
     if (!open) {
       setDisconnectChannel(null);
       setDisconnectConfirmText("");
     }
   }}
 >
   <AlertDialogContent data-testid="dialog-disconnect-channel">
     <AlertDialogHeader>
       <AlertDialogTitle>Disconnect Channel?</AlertDialogTitle>
       <AlertDialogDescription>
         <span className="block font-medium text-destructive">
           Warning: data will be permanently deleted.
         </span>
         <span className="block mt-2">
           Disconnecting <span className="font-semibold">{disconnectChannel?.name}</span> will delete all bookings and messages synced from this channel.
         </span>
         <span className="block mt-3">
           Type <span className="font-semibold">DELETE</span> to confirm:
         </span>
         <Input
           value={disconnectConfirmText}
           onChange={(e) => setDisconnectConfirmText(e.target.value)}
           className="mt-2"
           placeholder="DELETE"
           data-testid="input-disconnect-confirm"
         />
       </AlertDialogDescription>
     </AlertDialogHeader>
     <AlertDialogFooter>
       <AlertDialogCancel data-testid="button-cancel-disconnect">Cancel</AlertDialogCancel>
       <AlertDialogAction
         onClick={() => {
           if (!disconnectChannel) return;
           disconnectMutation.mutate({ channelId: disconnectChannel.channelId });
         }}
         disabled={disconnectConfirmText !== "DELETE" || disconnectMutation.isPending}
         data-testid="button-confirm-disconnect"
       >
         {disconnectMutation.isPending ? (
           <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
         ) : null}
         Delete bookings & disconnect
       </AlertDialogAction>
     </AlertDialogFooter>
   </AlertDialogContent>
 </AlertDialog>
 </div>
 );
}
