"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Home, Loader2, Plus } from "lucide-react";

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
    channels: Array<{ channelKey: string; channelName: string }>;
    mappingStatus: MappingStatusItem[];
  }>;
  templates: any[];
  reminderSettings: any;
}

export default function ListingCreatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [unitName, setUnitName] = useState("");

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/listings", { name });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Failed to create unit");
      }
      return res.json();
    },
    onSuccess: async (data: any, name: string) => {
      if (!data?.id) {
        toast({ title: "Unit created, but no ID returned", variant: "destructive" });
        return;
      }

      queryClient.setQueryData(["/api/settings"], (old: SettingsData | undefined) => {
        if (!old) return old;
        if (old.listings.some((l) => l.id === data.id)) return old;
        const listingName = data?.name || name;
        return {
          ...old,
          listings: [
            ...old.listings,
            {
              id: data.id,
              name: listingName,
              status: data?.status || "ACTIVE",
              avgPrice: data?.avgPrice ?? null,
              currency: data?.currency || user?.currency || "USD",
              channels: data?.channels || [],
              mappingStatus: [],
            },
          ],
        };
      });

      await queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });

      toast({ title: "Unit added" });
      router.push(`/listing/${data.id}`);
    },
    onError: (err: any) => {
      toast({
        title: "Failed to add unit",
        description: err?.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    const name = unitName.trim();
    if (!name) return;
    createMutation.mutate(name);
  };

  return (
    <div className="pb-8">
      <div className="flex items-center justify-between gap-3 px-4 py-4 border-b sticky top-0 bg-background z-50 mb-4">
        <div className="flex items-center gap-2.5">
          <Button
            size="icon"
            aria-label="Go back"
            variant="ghost"
            onClick={() => router.push("/settings/listings")}
            data-testid="button-back-create-listing"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-primary" data-testid="text-create-listing-title">
            Add Unit
          </h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5 max-w-xl">
        <div className="flex items-center gap-3 rounded-md border bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
            <Home className="h-4.5 w-4.5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Create a new unit</p>
            <p className="text-xs text-muted-foreground">Start with a name, then add details on the next screen.</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit-name">Unit name</Label>
          <Input
            id="unit-name"
            placeholder="e.g. Beach House, Studio Apt 3B"
            value={unitName}
            onChange={(e) => setUnitName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            autoFocus
            data-testid="input-unit-name"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="flex-1"
            onClick={handleCreate}
            disabled={!unitName.trim() || createMutation.isPending}
            data-testid="button-confirm-add-unit"
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <Plus className="h-4 w-4 mr-1.5" />
            )}
            Create Unit
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/settings/listings")}
            data-testid="button-cancel-add-unit"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
