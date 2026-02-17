"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { getCategoryBadgeClass } from "@/lib/category-badge";
import {
  ArrowLeft,
  Building2,
  Users,
  Star,
  CheckCircle2,
  Clock3,
  Wrench,
} from "lucide-react";

type ActiveSubscription = {
  id: string;
  status: "ACTIVE" | "CANCELLED";
  createdAt: string;
  company: {
    id: string;
    name: string;
    description?: string | null;
    serviceType: "CLEANING" | "MAINTENANCE";
    companyType: "COMPANY" | "FREELANCER";
    aggregateRating?: string | number | null;
    employeesCount?: number;
    pricing?: {
      pricingModel: "PER_HOUR" | "PER_ROOM";
      priceAmount: string | number;
    } | null;
  };
};

type PendingApprovalTask = {
  id: string;
  locationAddress: string;
  scheduledDate: string;
  scheduledTime?: string | null;
  company: { id: string; name: string; companyType: "COMPANY" | "FREELANCER" };
  completion: {
    id: string;
    submittedAt: string;
    images: Array<{ id: string; imageUrl: string; imageOrder: number }>;
  } | null;
  assignments: Array<{ id: string; status: string; employeeName: string }>;
};

export default function SettingsMaintenancePage() {
  const router = useRouter();
  const setLocation = (path: string) => router.push(path);
  const { toast } = useToast();
  const qc = useQueryClient();

  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const { data: pendingApprovals, isLoading: loadingPendingApprovals } = useQuery<PendingApprovalTask[]>({
    queryKey: ["/api/maintenance/tasks/pending-approval"],
  });
  const { data: subscriptions, isLoading: loadingSubscriptions } = useQuery<ActiveSubscription[]>({
    queryKey: ["/api/maintenance/subscriptions"],
  });

  const approveCompletion = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await apiRequest("POST", `/api/maintenance/tasks/${taskId}/approve`);
      return res.json();
    },
    onSuccess: (data: { finalized?: boolean }) => {
      qc.invalidateQueries({ queryKey: ["/api/maintenance/tasks/pending-approval"] });
      toast({
        title: data?.finalized ? "Job completed" : "Approved",
        description: data?.finalized
          ? "You approved the done request and the job is now completed."
          : "Your approval was saved. Waiting for provider admin final approval.",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Approval failed", description: error.message, variant: "destructive" });
    },
  });

  const requestMaintenance = useMutation({
    mutationFn: async () => {
      const selected = (subscriptions || []).find((s) => s.id === selectedSubscriptionId);
      if (!selected) throw new Error("Select a provider subscription first");
      if (!scheduledDate) throw new Error("Choose a scheduled date");
      if (!locationAddress.trim()) throw new Error("Location address is required");
      if (!latitude.trim() || Number.isNaN(Number(latitude))) throw new Error("Valid latitude is required");
      if (!longitude.trim() || Number.isNaN(Number(longitude))) throw new Error("Valid longitude is required");

      const res = await apiRequest("POST", "/api/maintenance/tasks/request", {
        companyId: selected.company.id,
        subscriptionId: selected.id,
        serviceType: "MAINTENANCE",
        scheduledDate,
        scheduledTime: scheduledTime || null,
        locationAddress: locationAddress.trim(),
        latitude: Number(latitude),
        longitude: Number(longitude),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Maintenance request sent",
        description: "Provider admin can now assign employees to your request.",
      });
      setScheduledDate("");
      setScheduledTime("");
      setLocationAddress("");
      setLatitude("");
      setLongitude("");
    },
    onError: (error: Error) => {
      toast({ title: "Request failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="pb-8">
      <div className="flex items-center gap-2.5 px-4 py-4 border-b sticky top-0 bg-background z-50 mb-4">
        <Button
          size="icon"
          aria-label="Go back"
          variant="ghost"
          onClick={() => setLocation("/settings")}
          data-testid="button-back-maintenance"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold text-black" data-testid="text-maintenance-title">Maintenance</h1>
      </div>

      <div className="px-4 py-4 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Done Requests Waiting Your Approval</p>
          </div>
          {loadingPendingApprovals ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-md" />
              <Skeleton className="h-24 w-full rounded-md" />
            </div>
          ) : pendingApprovals && pendingApprovals.length > 0 ? (
            <div className="space-y-3">
              {pendingApprovals.map((task) => (
                <Card key={task.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{task.company.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{task.locationAddress}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Scheduled: {new Date(task.scheduledDate).toLocaleDateString()}
                        {task.scheduledTime ? ` at ${task.scheduledTime}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Uploaded proof: {task.completion?.images?.length ?? 0} images
                      </p>
                    </div>
                    <Badge className={`flex items-center gap-1 ${getCategoryBadgeClass("pending", "status")}`}>
                      <Clock3 className="h-3 w-3" />
                      Pending
                    </Badge>
                  </div>
                  <div className="flex justify-end mt-3">
                    <Button
                      size="sm"
                      onClick={() => approveCompletion.mutate(task.id)}
                      disabled={approveCompletion.isPending}
                    >
                      Accept Done Request
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No done requests waiting for your approval.</p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Request Maintenance Service</p>
          </div>
        </div>

        {loadingSubscriptions ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
          </div>
        ) : subscriptions && subscriptions.length > 0 ? (
          <div className="space-y-3">
            {subscriptions.map((sub) => {
              const selected = selectedSubscriptionId === sub.id;
              return (
                <Card
                  key={sub.id}
                  className={`p-4 cursor-pointer ${selected ? "border-primary" : ""}`}
                  onClick={() => setSelectedSubscriptionId(sub.id)}
                  data-testid={`maintenance-subscription-${sub.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{sub.company.name}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {sub.company.companyType}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {sub.company.employeesCount ?? 0} employees
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          {Number(sub.company.aggregateRating || 0).toFixed(1)}
                        </span>
                        {sub.company.pricing && (
                          <span className="text-xs text-muted-foreground">
                            {sub.company.pricing.pricingModel === "PER_HOUR" ? "Per hour" : "Per room"}: {String(sub.company.pricing.priceAmount)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge className={getCategoryBadgeClass(selected ? "selected" : "select", "status")}>{selected ? "Selected" : "Select"}</Badge>
                  </div>
                </Card>
              );
            })}

            <Card className="p-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="maintenance-date">Scheduled date</Label>
                <Input
                  id="maintenance-date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maintenance-time">Scheduled time (optional)</Label>
                <Input
                  id="maintenance-time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maintenance-address">Location address</Label>
                <Input
                  id="maintenance-address"
                  placeholder="Unit/building full address"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="maintenance-lat">Latitude</Label>
                  <Input
                    id="maintenance-lat"
                    inputMode="decimal"
                    placeholder="e.g. 24.7136"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="maintenance-lng">Longitude</Label>
                  <Input
                    id="maintenance-lng"
                    inputMode="decimal"
                    placeholder="e.g. 46.6753"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={() => requestMaintenance.mutate()}
                disabled={requestMaintenance.isPending || !selectedSubscriptionId}
                data-testid="button-request-maintenance"
              >
                Submit Maintenance Request
              </Button>
            </Card>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No active provider subscriptions found. Subscribe to a provider first.</p>
        )}
      </div>
    </div>
  );
}
