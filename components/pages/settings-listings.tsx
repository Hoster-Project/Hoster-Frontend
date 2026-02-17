"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChannelIcon } from "@/components/channel-icon";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatMoney } from "@/lib/money";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Plus,
  Download,
  Home,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { type ChannelKey } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MappingStatusItem {
  channelKey: string;
  channelName: string;
  mapped: boolean;
}

interface SettingsData {
  channels: any[];
  listings: Array<{
    id: string;
    name: string;
    status: string;
    avgPrice: number | null;
    currency: string;
    channels: Array<{ channelKey: ChannelKey; channelName: string }>;
    mappingStatus: MappingStatusItem[];
  }>;
  templates: any[];
  reminderSettings: any;
}

export default function SettingsListingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const { data, isLoading } = useQuery<SettingsData>({
    queryKey: ["/api/settings"],
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/sync/import-listings", {});
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      if (data?.importedCount > 0) {
        toast({ title: `${data.importedCount} unit${data.importedCount > 1 ? "s" : ""} imported from connected channels` });
      } else {
        toast({ title: "All units are already imported" });
      }
    },
    onError: () => {
      toast({ title: "Import failed", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="px-4 py-4 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="flex items-center justify-between gap-3 px-4 py-4 border-b sticky top-0 bg-background z-50 mb-4">
        <div className="flex items-center gap-2.5">
          <Button
            size="icon"
            aria-label="Go back"
            variant="ghost"
            onClick={() => router.push("/settings")}
            data-testid="button-back-listings"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-primary" data-testid="text-listings-title">Units</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              data-testid="button-add-unit-menu"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add
              <ChevronDown className="h-3.5 w-3.5 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => importMutation.mutate()}
              disabled={importMutation.isPending}
              data-testid="menu-import-from-apps"
            >
              <Download className="h-4 w-4 mr-2" />
              Import from apps
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/listing/new")}
              data-testid="menu-add-unit"
            >
              <Home className="h-4 w-4 mr-2" />
              Add unit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="px-4 py-4 space-y-3">
        {importMutation.isPending && (
          <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Importing units from connected channels...
          </div>
        )}

        {data?.listings && data.listings.length > 0 ? (
          data.listings.map((listing) => {
            const hasUnmapped = listing.mappingStatus?.some(m => !m.mapped);
            return (
              <div
                key={listing.id}
                className="flex items-center gap-3 p-3.5 rounded-md border cursor-pointer hover-elevate active-elevate-2"
                onClick={() => router.push(`/listing/${listing.id}`)}
                data-testid={`listing-${listing.id}`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted flex-shrink-0">
                  <Home className="h-4.5 w-4.5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{listing.name}</p>
                    {hasUnmapped && (
                      <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-amber-500" title="Has unmapped channels" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    {listing.mappingStatus?.map((ms) => (
                      <div
                        key={ms.channelKey}
                        className={`flex h-5 w-5 items-center justify-center rounded-full ${ms.mapped ? "bg-muted" : "bg-destructive/10"}`}
                        title={ms.mapped ? ms.channelName : `${ms.channelName} - Unmapped`}
                        data-testid={`mapping-${listing.id}-${ms.channelKey.toLowerCase()}`}
                      >
                        <ChannelIcon channelKey={ms.channelKey as ChannelKey} size={10} />
                      </div>
                    ))}
                    {listing.avgPrice !== null && (
                      <span className="text-xs text-muted-foreground ml-auto" data-testid={`text-avg-price-${listing.id}`}>
                        {formatMoney(listing.avgPrice, listing.currency || user?.currency, { maximumFractionDigits: 0 })}/avg
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
              <Home className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium mb-1">No units yet</p>
            <p className="text-xs text-muted-foreground max-w-[220px]">
              Add your rental units manually or import them from your connected channels.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
