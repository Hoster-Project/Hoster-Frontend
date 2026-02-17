"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getCategoryBadgeClass } from "@/lib/category-badge";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  ChevronDown,
  Send,
  Heart,
  Sparkles,
  AlertTriangle,
  Moon,
  Brush,
  Key,
  MessageCircle,
  Smile,
  FileText,
  Upload,
  Wifi,
  DoorOpen,
} from "lucide-react";
import { ChannelIcon } from "@/components/channel-icon";
import type { ChannelKey } from "@/lib/constants";
import {
  ACTION_TYPE_LABELS,
  CHECKIN_TEMPLATE_VARIABLES,
  LEGACY_TEMPLATE_VARIABLES,
  STATUS_CONFIG,
  formatRelativeTime,
} from "./settings-automation.constants";
import {
  AutomationCard,
  CheckinStep,
  ListingPDFBadge,
  ListingSecurityItem,
} from "./settings-automation.parts";
import type {
  AutomationLog,
  AutomationSettings,
  AutomationTemplate,
  CheckinData,
  CheckinSettings,
  CheckinWarning,
  ListingConfigDetail,
  LegacyData,
} from "./settings-automation.types";
import { Formik, Form } from "formik";

export default function SettingsAutomationPage() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const setLocation = (path: string) => router.push(path);
  const [editingTemplate, setEditingTemplate] =
    useState<AutomationTemplate | null>(null);
  const [isCheckinTemplate, setIsCheckinTemplate] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<string | null>(null);
  const [applyAllMode, setApplyAllMode] = useState(false);

  const { data: checkinData, isLoading: checkinLoading } =
    useQuery<CheckinData>({
      queryKey: ["/api/automation/checkin"],
    });

  const { data: legacyData, isLoading: legacyLoading } = useQuery<LegacyData>({
    queryKey: ["/api/automation/settings"],
  });

  const { data: logsData } = useQuery<{ logs: AutomationLog[] }>({
    queryKey: ["/api/automation/logs"],
  });

  const { data: listingDetail } = useQuery<ListingConfigDetail>({
    queryKey: ["/api/listings", editingListing, "automation"],
    enabled: !!editingListing && editingListing !== "apply-all",
  });

  const checkinSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<CheckinSettings>) => {
      await apiRequest("PUT", "/api/automation/checkin/settings", updates);
    },
    onMutate: async (updates) => {
      // Optimistically update UI so toggles flip immediately.
      await queryClient.cancelQueries({
        queryKey: ["/api/automation/checkin"],
      });
      await queryClient.cancelQueries({
        queryKey: ["/api/automation/settings"],
      });

      const prevCheckin = queryClient.getQueryData<CheckinData>([
        "/api/automation/checkin",
      ]);
      const prevLegacy = queryClient.getQueryData<LegacyData>([
        "/api/automation/settings",
      ]);

      if (prevCheckin) {
        queryClient.setQueryData<CheckinData>(["/api/automation/checkin"], {
          ...prevCheckin,
          settings: { ...prevCheckin.settings, ...updates },
        });
      }
      if (prevLegacy?.settings) {
        queryClient.setQueryData<LegacyData>(["/api/automation/settings"], {
          ...prevLegacy,
          settings: { ...prevLegacy.settings, ...updates },
        } as LegacyData);
      }

      return { prevCheckin, prevLegacy };
    },
    onSuccess: (_, variables) => {
      // Invalidate BOTH query keys to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["/api/automation/checkin"] });
      queryClient.invalidateQueries({ queryKey: ["/api/automation/settings"] });
    },
    onError: (error, _updates, ctx) => {
      if (ctx?.prevCheckin) {
        queryClient.setQueryData(["/api/automation/checkin"], ctx.prevCheckin);
      }
      if (ctx?.prevLegacy) {
        queryClient.setQueryData(["/api/automation/settings"], ctx.prevLegacy);
      }
      toast({ title: "Failed to update", variant: "destructive" });
    },
  });

  const legacySettingsMutation = useMutation({
    mutationFn: async (updates: Partial<AutomationSettings>) => {
      await apiRequest("PUT", "/api/automation/settings", updates);
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({
        queryKey: ["/api/automation/settings"],
      });
      await queryClient.cancelQueries({
        queryKey: ["/api/automation/checkin"],
      });

      const prevLegacy = queryClient.getQueryData<LegacyData>([
        "/api/automation/settings",
      ]);
      const prevCheckin = queryClient.getQueryData<CheckinData>([
        "/api/automation/checkin",
      ]);

      if (prevLegacy?.settings) {
        queryClient.setQueryData<LegacyData>(["/api/automation/settings"], {
          ...prevLegacy,
          settings: { ...prevLegacy.settings, ...updates },
        } as LegacyData);
      }
      if (prevCheckin) {
        // A few settings live in the same table but are shown under check-in.
        queryClient.setQueryData<CheckinData>(["/api/automation/checkin"], {
          ...prevCheckin,
          settings: { ...prevCheckin.settings, ...updates },
        } as CheckinData);
      }

      return { prevLegacy, prevCheckin };
    },
    onSuccess: (_, variables) => {
      // Invalidate BOTH query keys to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ["/api/automation/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/automation/checkin"] });
    },
    onError: (error, _updates, ctx) => {
      if (ctx?.prevLegacy) {
        queryClient.setQueryData(["/api/automation/settings"], ctx.prevLegacy);
      }
      if (ctx?.prevCheckin) {
        queryClient.setQueryData(["/api/automation/checkin"], ctx.prevCheckin);
      }
      toast({ title: "Failed to update", variant: "destructive" });
    },
  });

  const checkinTemplateMutation = useMutation({
    mutationFn: async ({ key, body }: { key: string; body: string }) => {
      await apiRequest("PUT", `/api/automation/checkin/templates/${key}`, {
        body,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automation/checkin"] });
      setEditingTemplate(null);
      toast({ title: "Template saved" });
    },
    onError: () => {
      toast({ title: "Failed to save template", variant: "destructive" });
    },
  });

  const legacyTemplateMutation = useMutation({
    mutationFn: async ({
      key,
      name,
      body,
    }: {
      key: string;
      name: string;
      body: string;
    }) => {
      await apiRequest("PUT", `/api/automation/templates/${key}`, {
        name,
        body,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automation/settings"] });
      setEditingTemplate(null);
      toast({ title: "Template saved" });
    },
    onError: () => {
      toast({ title: "Failed to save template", variant: "destructive" });
    },
  });

  const listingConfigMutation = useMutation({
    mutationFn: async ({
      listingId,
      data,
    }: {
      listingId: string;
      data: any;
    }) => {
      await apiRequest("PUT", `/api/listings/${listingId}/automation`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automation/checkin"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/listings", editingListing, "automation"],
      });
      setEditingListing(null);
      toast({ title: "Listing config saved" });
    },
    onError: () => {
      toast({ title: "Failed to save listing config", variant: "destructive" });
    },
  });

  const applyAllMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest(
        "PUT",
        "/api/listings/automation/apply-all",
        data,
      );
      return res.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/automation/checkin"] });
      setApplyAllMode(false);
      setEditingListing(null);
      toast({ title: `Applied to ${result.updatedCount} listings` });
    },
    onError: () => {
      toast({
        title: "Failed to apply to all listings",
        variant: "destructive",
      });
    },
  });

  const brochureUploadMutation = useMutation({
    mutationFn: async ({
      listingId,
      file,
    }: {
      listingId: string;
      file: File;
    }) => {
      const formData = new FormData();
      formData.append("brochure", file);
      const res = await fetch(`/api/listings/${listingId}/brochure`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automation/checkin"] });
      if (editingListing) {
        queryClient.invalidateQueries({
          queryKey: ["/api/listings", editingListing, "automation"],
        });
      }
      toast({ title: "Brochure uploaded" });
    },
    onError: () => {
      toast({ title: "Upload failed", variant: "destructive" });
    },
  });

  const cs = checkinData?.settings;
  const checkinTemplates = checkinData?.templates || [];
  const listingConfigs = checkinData?.listingConfigs || [];
  const warnings = checkinData?.warnings || [];

  const ls = legacyData?.settings;
  const legacyTemplates = legacyData?.templates || [];
  const pausedChannels = legacyData?.pausedChannels || [];
  const unmappedCount = legacyData?.unmappedListingCount || 0;
  const logs = logsData?.logs || [];

  const checkinTemplatesMap = useMemo(() => {
    const map: Record<string, AutomationTemplate> = {};
    checkinTemplates.forEach((t) => {
      map[t.key] = t;
    });
    return map;
  }, [checkinTemplates]);

  const legacyTemplatesMap = useMemo(() => {
    const map: Record<string, AutomationTemplate> = {};
    legacyTemplates.forEach((t) => {
      map[t.key] = t;
    });
    return map;
  }, [legacyTemplates]);

  const warningsByListing = useMemo(() => {
    const map: Record<string, CheckinWarning[]> = {};
    warnings.forEach((w) => {
      if (!map[w.listingId]) map[w.listingId] = [];
      map[w.listingId].push(w);
    });
    return map;
  }, [warnings]);

  const currentListingConfig = useMemo(() => {
    if (!editingListing || editingListing === "apply-all") return undefined;
    return listingConfigs.find((c) => c.listingId === editingListing);
  }, [editingListing, listingConfigs]);

  const listingInitialValues = useMemo(
    () => ({
      defaultCheckinTime: applyAllMode
        ? ""
        : currentListingConfig?.defaultCheckinTime || "",
      eventsLocation: applyAllMode ? "" : currentListingConfig?.eventsLocation || "",
      doorCode: "",
      wifiSsid: "",
      wifiPassword: "",
    }),
    [applyAllMode, currentListingConfig],
  );

  const templateInitialValues = useMemo(
    () => ({
      name: editingTemplate?.name || "",
      body: editingTemplate?.body || "",
    }),
    [editingTemplate],
  );

  const templateVariables = isCheckinTemplate
    ? CHECKIN_TEMPLATE_VARIABLES
    : LEGACY_TEMPLATE_VARIABLES;

  const findCheckinTemplate = useCallback(
    (key: string) => checkinTemplatesMap[key],
    [checkinTemplatesMap],
  );
  const findLegacyTemplate = useCallback(
    (key: string) => legacyTemplatesMap[key],
    [legacyTemplatesMap],
  );

  useEffect(() => {
    if (checkinData) {
      console.log("[SettingsAutomation] checkinData updated:", checkinData);
    }
  }, [checkinData]);

  useEffect(() => {
    if (legacyData) {
      console.log("[SettingsAutomation] legacyData updated:", legacyData);
    }
  }, [legacyData]);

  const { mutate: mutateCheckin } = checkinSettingsMutation;
  const { mutate: mutateLegacy } = legacySettingsMutation;

  const toggleWelcome = useCallback(
    (v: boolean) => {
      console.log("[SettingsAutomation] toggleWelcome clicked:", v);
      mutateCheckin({ welcomeEnabled: v });
    },
    [mutateCheckin],
  );
  const toggleWelcomeIncludePdf = useCallback(
    (v: boolean) => {
      console.log("[SettingsAutomation] toggleWelcomeIncludePdf clicked:", v);
      mutateCheckin({ welcomeIncludePdf: v });
    },
    [mutateCheckin],
  );
  const toggleAccess = useCallback(
    (v: boolean) => {
      console.log("[SettingsAutomation] toggleAccess clicked:", v);
      mutateCheckin({ accessEnabled: v });
    },
    [mutateCheckin],
  );
  const toggleFollowup = useCallback(
    (v: boolean) => {
      console.log("[SettingsAutomation] toggleFollowup clicked:", v);
      mutateCheckin({ followupEnabled: v });
    },
    [mutateCheckin],
  );

  const toggleCheckoutThanks = useCallback(
    (v: boolean) => {
      console.log("[SettingsAutomation] toggleCheckoutThanks clicked:", v);
      mutateLegacy({ autoCheckoutThanksEnabled: v });
    },
    [mutateLegacy],
  );
  const toggleFirstReply = useCallback(
    (v: boolean) => {
      console.log("[SettingsAutomation] toggleFirstReply clicked:", v);
      mutateLegacy({ autoFirstReplyEnabled: v });
    },
    [mutateLegacy],
  );
  const toggleCleaningReminder = useCallback(
    (v: boolean) => {
      console.log("[SettingsAutomation] toggleCleaningReminder clicked:", v);
      mutateLegacy({ cleaningReminderEnabled: v });
    },
    [mutateLegacy],
  );
  const toggleAutoCleaningTask = useCallback(
    (v: boolean) => {
      console.log("[SettingsAutomation] toggleAutoCleaningTask clicked:", v);
      mutateLegacy({ autoCleaningTaskEnabled: v });
    },
    [mutateLegacy],
  );
  const toggleQuietHours = useCallback(
    (v: boolean) => {
      console.log("[SettingsAutomation] toggleQuietHours clicked:", v);
      mutateLegacy({ quietHoursEnabled: v });
    },
    [mutateLegacy],
  );

  const openCheckinTemplateEditor = useCallback(
    (key: string) => {
      const tpl = findCheckinTemplate(key);
      if (tpl) {
        setEditingTemplate(tpl);
        setIsCheckinTemplate(true);
      }
    },
    [checkinTemplatesMap],
  );

  const openLegacyTemplateEditor = useCallback(
    (key: string) => {
      const tpl = findLegacyTemplate(key);
      if (tpl) {
        setEditingTemplate(tpl);
        setIsCheckinTemplate(false);
      }
    },
    [legacyTemplatesMap],
  );

  const openListingEditor = useCallback((listingId: string) => {
    setEditingListing(listingId);
    setApplyAllMode(false);
  }, []);

  const handleBrochureUpload = useCallback(
    (listingId: string, file: File) => {
      brochureUploadMutation.mutate({ listingId, file });
    },
    [brochureUploadMutation.mutate],
  );

  const listingWarnings = useCallback(
    (listingId: string) => warningsByListing[listingId] || [],
    [warningsByListing],
  );

  const isLoading = checkinLoading || legacyLoading;

  if (isLoading) {
    return (
      <div className="px-4 py-4 space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[68px] w-full rounded-lg" />
        <Skeleton className="h-[68px] w-full rounded-lg" />
        <Skeleton className="h-[68px] w-full rounded-lg" />
      </div>
    );
  }

  const checkinAnyEnabled =
    cs?.welcomeEnabled !== false ||
    cs?.accessEnabled !== false ||
    cs?.followupEnabled !== false;
  const enabledCount = [
    cs?.welcomeEnabled !== false,
    cs?.accessEnabled !== false,
    cs?.followupEnabled !== false,
  ].filter(Boolean).length;

  return (
    <div className="pb-24">
      <div className="flex items-center gap-3 px-4 py-3 border-b sticky top-0 bg-background z-[999]">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() => setLocation("/settings")}
          data-testid="button-back-automation"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Go back</span>
        </Button>
        <h1
          className="text-lg font-semibold"
          data-testid="text-automation-title"
        >
          Automation
        </h1>
      </div>

      <div className="px-4 py-3 space-y-3">
        {(pausedChannels.length > 0 || unmappedCount > 0) && (
          <div className="space-y-2 mb-1" data-testid="section-pause-banners">
            {pausedChannels.map((pc, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2.5 rounded-md bg-amber-50 border border-amber-200"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                <div className="flex items-center gap-1.5 min-w-0">
                  <ChannelIcon
                    channelKey={pc.channelKey as ChannelKey}
                    size={12}
                  />
                  <p
                    className="text-xs text-amber-700"
                    data-testid={`text-paused-${pc.channelKey}`}
                  >
                    {pc.reason}
                  </p>
                </div>
              </div>
            ))}
            {unmappedCount > 0 && (
              <div className="flex items-center gap-2 p-2.5 rounded-md bg-amber-50 border border-amber-200">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                <p
                  className="text-xs text-amber-700"
                  data-testid="text-unmapped-warning"
                >
                  {unmappedCount} listing-channel mapping
                  {unmappedCount > 1 ? "s" : ""} missing
                </p>
              </div>
            )}
          </div>
        )}

        {/* Check-in Message — single card with all 3 steps inside */}
        <Collapsible>
          <Card className="overflow-visible" data-testid="card-checkin-message">
            <CollapsibleTrigger asChild>
              <div
                className="flex items-center gap-3 p-4 cursor-pointer select-none"
                data-testid="trigger-checkin-message"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted flex-shrink-0">
                  <Send className="h-4.5 w-4.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Check-in Messages</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {enabledCount}/3 steps active
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge className={getCategoryBadgeClass(checkinAnyEnabled ? "active" : "inactive", "status")}>
                    {checkinAnyEnabled ? "On" : "Off"}
                  </Badge>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </div>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="px-4 pb-4 space-y-3 border-t pt-3">
                {warnings.length > 0 && (
                  <div
                    className="space-y-1.5"
                    data-testid="section-checkin-warnings"
                  >
                    {Array.from(new Set(warnings.map((w) => w.listingId))).map(
                      (lid) => {
                        const lw = listingWarnings(lid);
                        const name = lw[0]?.listingName || "";
                        return (
                          <div
                            key={lid}
                            className="flex items-start gap-2 p-2.5 rounded-md bg-amber-50 border border-amber-200"
                          >
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-amber-700">
                                {name}
                              </p>
                              <p className="text-xs text-amber-600 mt-0.5">
                                {lw.map((w) => w.message).join(" · ")}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-1 gap-1"
                                onClick={() => openListingEditor(lid)}
                                data-testid={`button-fix-listing-${lid}`}
                              >
                                <Key className="h-3 w-3" />
                                <span className="text-xs">Configure</span>
                              </Button>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                )}

                {/* Step 1: Welcome */}
                <CheckinStep
                  icon={MessageCircle}
                  title="Welcome Message"
                  timing="Sent 10 minutes after booking"
                  enabled={cs?.welcomeEnabled !== false}
                  onToggle={toggleWelcome}
                  testIdPrefix="welcome"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <Label className="text-xs font-medium">
                        Attach brochure PDF
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Include a PDF house guide link
                      </p>
                    </div>
                    <Switch
                      checked={cs?.welcomeIncludePdf ?? false}
                      onCheckedChange={toggleWelcomeIncludePdf}
                      data-testid="switch-welcome-pdf"
                    />
                  </div>

                  {cs?.welcomeIncludePdf && (
                    <div className="p-2.5 rounded-md bg-muted/50 border space-y-1.5">
                      <p className="text-xs text-muted-foreground">
                        PDF per listing (upload via listing config)
                      </p>
                      {listingConfigs.map((cfg) => (
                        <div
                          key={cfg.listingId}
                          className="flex items-center justify-between gap-2 flex-wrap"
                        >
                          <span className="text-xs">{cfg.listingName}</span>
                          <ListingPDFBadge cfg={cfg} />
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      Message template
                    </Label>
                    {findCheckinTemplate("WELCOME_10MIN") && (
                      <div className="p-2.5 rounded-md bg-muted/50 border text-xs text-muted-foreground leading-relaxed mb-2">
                        {findCheckinTemplate("WELCOME_10MIN")!.body.substring(
                          0,
                          120,
                        )}
                        {findCheckinTemplate("WELCOME_10MIN")!.body.length >
                          120 && "..."}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => openCheckinTemplateEditor("WELCOME_10MIN")}
                      data-testid="button-edit-welcome-template"
                    >
                      Edit message
                    </Button>
                  </div>
                </CheckinStep>

                {/* Step 2: Access */}
                <CheckinStep
                  icon={Key}
                  title="Access Details"
                  timing="Sent 30 minutes before check-in"
                  enabled={cs?.accessEnabled !== false}
                  onToggle={toggleAccess}
                  testIdPrefix="access"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                      <Label className="text-xs text-muted-foreground">
                        Per-listing secure fields
                      </Label>
                      {listingConfigs.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => {
                            setApplyAllMode(true);
                            setEditingListing("apply-all");
                          }}
                          data-testid="button-apply-all"
                        >
                          Apply to all
                        </Button>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {listingConfigs.map((cfg) => (
                        <ListingSecurityItem
                          key={cfg.listingId}
                          cfg={cfg}
                          warnings={warningsByListing[cfg.listingId] || []}
                          onEdit={openListingEditor}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      Message template
                    </Label>
                    {findCheckinTemplate("ACCESS_30MIN") && (
                      <div className="p-2.5 rounded-md bg-muted/50 border text-xs text-muted-foreground leading-relaxed mb-2">
                        {findCheckinTemplate("ACCESS_30MIN")!.body.substring(
                          0,
                          120,
                        )}
                        {findCheckinTemplate("ACCESS_30MIN")!.body.length >
                          120 && "..."}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => openCheckinTemplateEditor("ACCESS_30MIN")}
                      data-testid="button-edit-access-template"
                    >
                      Edit message
                    </Button>
                  </div>
                </CheckinStep>

                {/* Step 3: Follow-up */}
                <CheckinStep
                  icon={Smile}
                  title="Follow-up Message"
                  timing="Sent 1 hour after check-in"
                  enabled={cs?.followupEnabled !== false}
                  onToggle={toggleFollowup}
                  testIdPrefix="followup"
                >
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      Message template
                    </Label>
                    {findCheckinTemplate("FOLLOWUP_1H") && (
                      <div className="p-2.5 rounded-md bg-muted/50 border text-xs text-muted-foreground leading-relaxed mb-2">
                        {findCheckinTemplate("FOLLOWUP_1H")!.body.substring(
                          0,
                          120,
                        )}
                        {findCheckinTemplate("FOLLOWUP_1H")!.body.length >
                          120 && "..."}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => openCheckinTemplateEditor("FOLLOWUP_1H")}
                      data-testid="button-edit-followup-template"
                    >
                      Edit message
                    </Button>
                  </div>
                </CheckinStep>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <AutomationCard
          icon={Heart}
          title="Checkout Thank-you"
          description="Send a thank-you message 30 minutes before check-out"
          enabled={ls?.autoCheckoutThanksEnabled ?? true}
          onToggle={toggleCheckoutThanks}
          statusText={
            ls?.autoCheckoutThanksEnabled !== false
              ? "Sends 30 minutes before check-out"
              : "Disabled"
          }
          testIdPrefix="auto-checkout"
        >
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Message template
            </Label>
            {findLegacyTemplate("CHECKOUT_THANKYOU") && (
              <div className="p-3 rounded-md bg-muted/50 border text-xs text-muted-foreground leading-relaxed mb-2">
                {findLegacyTemplate("CHECKOUT_THANKYOU")!.body.substring(
                  0,
                  150,
                )}
                {findLegacyTemplate("CHECKOUT_THANKYOU")!.body.length > 150 &&
                  "..."}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => openLegacyTemplateEditor("CHECKOUT_THANKYOU")}
              data-testid="button-edit-checkout-template"
            >
              Edit message template
            </Button>
          </div>
        </AutomationCard>

        <AutomationCard
          icon={Sparkles}
          title="Auto First Reply"
          description="Instantly acknowledge the first message from a new guest"
          enabled={ls?.autoFirstReplyEnabled ?? false}
          onToggle={toggleFirstReply}
          statusText={
            ls?.autoFirstReplyEnabled
              ? "Acknowledges first guest message"
              : "Disabled"
          }
          testIdPrefix="auto-reply"
        >
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Reply template
            </Label>
            {findLegacyTemplate("FIRST_REPLY_ACK") && (
              <div className="p-3 rounded-md bg-muted/50 border text-xs text-muted-foreground leading-relaxed mb-2">
                {findLegacyTemplate("FIRST_REPLY_ACK")!.body.substring(0, 150)}
                {findLegacyTemplate("FIRST_REPLY_ACK")!.body.length > 150 &&
                  "..."}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => openLegacyTemplateEditor("FIRST_REPLY_ACK")}
              data-testid="button-edit-reply-template"
            >
              Edit reply template
            </Button>
          </div>
        </AutomationCard>

        <AutomationCard
          icon={Brush}
          title="Cleaning Reminder"
          description="Get notified when a property needs cleaning after checkout"
          enabled={ls?.cleaningReminderEnabled ?? false}
          onToggle={toggleCleaningReminder}
          statusText={
            ls?.cleaningReminderEnabled
              ? "Notifies you on check-out day"
              : "Disabled"
          }
          testIdPrefix="cleaning-reminder"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-md bg-muted/50 border">
              <p className="text-xs text-muted-foreground leading-relaxed">
                You will receive an in-app notification on the day of each guest
                checkout reminding you to arrange cleaning for the property.
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 p-3 rounded-md border bg-muted/30">
              <div className="min-w-0">
                <Label className="text-xs font-medium">
                  Auto-Create Cleaning Task
                </Label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Automatically create and assign tasks to your accepted
                  providers when guests check out.
                </p>
              </div>
              <Switch
                checked={ls?.autoCleaningTaskEnabled ?? false}
                onCheckedChange={toggleAutoCleaningTask}
                data-testid="switch-auto-cleaning-task"
              />
            </div>
          </div>
        </AutomationCard>

        <AutomationCard
          icon={Moon}
          title="Quiet Hours"
          description="Pause all automated messages during a time window"
          enabled={ls?.quietHoursEnabled ?? false}
          onToggle={toggleQuietHours}
          statusText={
            ls?.quietHoursEnabled
              ? `${ls?.quietHoursStart || "23:00"} \u2013 ${ls?.quietHoursEnd || "08:00"}`
              : "Disabled"
          }
          testIdPrefix="quiet-hours"
        >
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              No messages between
            </Label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground mb-1 block">
                  From
                </Label>
                <Input
                  type="time"
                  value={ls?.quietHoursStart || "23:00"}
                  onChange={(e) =>
                    legacySettingsMutation.mutate({
                      quietHoursStart: e.target.value,
                    })
                  }
                  data-testid="input-quiet-start"
                />
              </div>
              <span className="text-muted-foreground mt-4">&ndash;</span>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Until
                </Label>
                <Input
                  type="time"
                  value={ls?.quietHoursEnd || "08:00"}
                  onChange={(e) =>
                    legacySettingsMutation.mutate({
                      quietHoursEnd: e.target.value,
                    })
                  }
                  data-testid="input-quiet-end"
                />
              </div>
            </div>
          </div>
        </AutomationCard>

        {/* Activity Log */}
        <Collapsible open={logsOpen} onOpenChange={setLogsOpen}>
          <CollapsibleTrigger asChild>
            <div
              className="flex items-center justify-between gap-3 py-3 cursor-pointer select-none flex-wrap"
              data-testid="trigger-activity-log"
            >
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Activity Log</span>
                {logs.length > 0 && (
                  <Badge variant="secondary">{logs.length}</Badge>
                )}
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${logsOpen ? "rotate-180" : ""}`}
              />
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div
              className="space-y-1.5 pb-2"
              data-testid="section-automation-logs"
            >
              {logs.length === 0 ? (
                <div className="p-4 rounded-md bg-muted/50 border text-center">
                  <p className="text-xs text-muted-foreground">
                    No automated actions yet. Activity will appear here once
                    automations run.
                  </p>
                </div>
              ) : (
                logs.slice(0, 20).map((log) => {
                  const cfg = STATUS_CONFIG[log.status] || STATUS_CONFIG.FAILED;
                  const StatusIcon = cfg.icon;
                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-2.5 p-3 rounded-md border"
                      data-testid={`log-entry-${log.id}`}
                    >
                      <StatusIcon
                        className={`h-4 w-4 mt-0.5 flex-shrink-0 ${cfg.className}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="text-xs font-medium">
                            {ACTION_TYPE_LABELS[log.actionType] ||
                              log.actionType}
                          </p>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatRelativeTime(log.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {log.channelKey && (
                            <ChannelIcon
                              channelKey={log.channelKey as ChannelKey}
                              size={11}
                            />
                          )}
                          {log.guestName && (
                            <span className="text-xs text-muted-foreground">
                              {log.guestName}
                            </span>
                          )}
                          {log.listingName && (
                            <span className="text-xs text-muted-foreground">
                              @ {log.listingName}
                            </span>
                          )}
                        </div>
                        {log.reason && (
                          <p className="text-xs text-amber-600 mt-0.5">
                            {log.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Template Editor Sheet */}
      <Sheet
        open={!!editingTemplate}
        onOpenChange={(open) => !open && setEditingTemplate(null)}
      >
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh]">
          <SheetHeader>
            <SheetTitle className="text-sm">
              Edit {editingTemplate?.name}
            </SheetTitle>
          </SheetHeader>
          <Formik
            enableReinitialize
            initialValues={templateInitialValues}
            onSubmit={(values) => {
              if (!editingTemplate) return;
              if (isCheckinTemplate) {
                checkinTemplateMutation.mutate({
                  key: editingTemplate.key,
                  body: values.body,
                });
              } else {
                legacyTemplateMutation.mutate({
                  key: editingTemplate.key,
                  name: values.name,
                  body: values.body,
                });
              }
            }}
          >
            {({ values, handleChange, setFieldValue }) => (
              <Form className="space-y-3 mt-4">
                {!isCheckinTemplate && (
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Template name
                    </Label>
                    <Input
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      className="mt-1"
                      data-testid="input-template-name"
                    />
                  </div>
                )}
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Message body
                  </Label>
                  <Textarea
                    name="body"
                    value={values.body}
                    onChange={handleChange}
                    className="mt-1 min-h-[120px] text-sm"
                    data-testid="input-template-body"
                  />
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {templateVariables.map((v) => (
                      <Badge
                        key={v}
                        variant="secondary"
                        className="text-[11px] cursor-pointer"
                        onClick={() => {
                          const separator = values.body ? " " : "";
                          setFieldValue(
                            "body",
                            `${values.body || ""}${separator}${v}`,
                          );
                        }}
                        data-testid={`badge-var-${v.replace(/[{}]/g, "")}`}
                      >
                        {v}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    checkinTemplateMutation.isPending ||
                    legacyTemplateMutation.isPending
                  }
                  data-testid="button-save-template"
                >
                  {checkinTemplateMutation.isPending ||
                  legacyTemplateMutation.isPending
                    ? "Saving..."
                    : "Save template"}
                </Button>
              </Form>
            )}
          </Formik>
        </SheetContent>
      </Sheet>

      {/* Listing Config Editor Sheet */}
      <Sheet
        open={!!editingListing}
        onOpenChange={(open) => {
          if (!open) {
            setEditingListing(null);
            setApplyAllMode(false);
          }
        }}
      >
        <SheetContent
          side="bottom"
          className="rounded-t-2xl max-h-[85vh] overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle className="text-sm">
              {applyAllMode
                ? `Apply to all ${listingConfigs.length} listings`
                : `Configure ${listingConfigs.find((c) => c.listingId === editingListing)?.listingName || "Listing"}`}
            </SheetTitle>
          </SheetHeader>
          {applyAllMode && (
            <p className="text-xs text-muted-foreground mt-1">
              Only filled fields will be updated. Leave a field blank to keep
              each listing's existing value.
            </p>
          )}
          <Formik
            enableReinitialize
            initialValues={listingInitialValues}
            onSubmit={(values) => {
              if (applyAllMode) {
                const data: any = {};
                if (values.defaultCheckinTime)
                  data.defaultCheckinTime = values.defaultCheckinTime;
                if (values.eventsLocation)
                  data.eventsLocation = values.eventsLocation;
                if (values.doorCode) data.doorCode = values.doorCode;
                if (values.wifiSsid) data.wifiSsid = values.wifiSsid;
                if (values.wifiPassword)
                  data.wifiPassword = values.wifiPassword;
                applyAllMutation.mutate(data);
              } else if (editingListing) {
                const data: any = {};
                const timeVal =
                  values.defaultCheckinTime ||
                  currentListingConfig?.defaultCheckinTime ||
                  listingDetail?.defaultCheckinTime;
                if (timeVal) data.defaultCheckinTime = timeVal;
                if (values.eventsLocation)
                  data.eventsLocation = values.eventsLocation;
                if (values.doorCode) data.doorCode = values.doorCode;
                if (values.wifiSsid) data.wifiSsid = values.wifiSsid;
                if (values.wifiPassword)
                  data.wifiPassword = values.wifiPassword;
                listingConfigMutation.mutate({
                  listingId: editingListing,
                  data,
                });
              }
            }}
          >
            {({ values, handleChange }) => (
              <Form className="space-y-4 mt-4">
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> Default check-in time
                  </Label>
                  <Input
                    type="time"
                    name="defaultCheckinTime"
                    value={values.defaultCheckinTime}
                    onChange={handleChange}
                    className="mt-1"
                    data-testid="input-checkin-time"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                    Events location
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Used for “Upcoming events” on the dashboard (example:
                    Austin, Texas, United States)
                  </p>
                  <Input
                    type="text"
                    name="eventsLocation"
                    placeholder="City, Region, Country"
                    value={(values as any).eventsLocation || ""}
                    onChange={handleChange}
                    className="mt-1"
                    data-testid="input-events-location"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <DoorOpen className="h-3 w-3" /> Door code / password
                  </Label>
                  <Input
                    type="text"
                    name="doorCode"
                    placeholder={
                      !applyAllMode && listingDetail?.doorCode
                        ? "Current code set (enter new to replace)"
                        : "Enter door code"
                    }
                    value={values.doorCode}
                    onChange={handleChange}
                    className="mt-1"
                    data-testid="input-door-code"
                  />
                  {!applyAllMode &&
                    listingDetail?.doorCode &&
                    !values.doorCode && (
                      <p className="text-xs text-green-600 mt-1">
                        Door code is set
                      </p>
                    )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Wifi className="h-3 w-3" /> Wi-Fi network name (SSID)
                  </Label>
                  <Input
                    type="text"
                    name="wifiSsid"
                    placeholder={
                      !applyAllMode && listingDetail?.wifiSsid
                        ? "Current SSID set (enter new to replace)"
                        : "Enter Wi-Fi name"
                    }
                    value={values.wifiSsid}
                    onChange={handleChange}
                    className="mt-1"
                    data-testid="input-wifi-ssid"
                  />
                  {!applyAllMode &&
                    listingDetail?.wifiSsid &&
                    !values.wifiSsid && (
                      <p className="text-xs text-green-600 mt-1">
                        Wi-Fi name is set
                      </p>
                    )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Wifi className="h-3 w-3" /> Wi-Fi password
                  </Label>
                  <Input
                    type="password"
                    name="wifiPassword"
                    placeholder={
                      !applyAllMode && listingDetail?.wifiPassword
                        ? "Current password set (enter new to replace)"
                        : "Enter Wi-Fi password"
                    }
                    value={values.wifiPassword}
                    onChange={handleChange}
                    className="mt-1"
                    data-testid="input-wifi-password"
                  />
                  {!applyAllMode &&
                    listingDetail?.wifiPassword &&
                    !values.wifiPassword && (
                      <p className="text-xs text-green-600 mt-1">
                        Wi-Fi password is set
                      </p>
                    )}
                </div>

                {!applyAllMode && (
                  <div className="border-t pt-3">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <FileText className="h-3 w-3" /> PDF Brochure / House
                      Guide
                    </Label>
                    {(listingDetail?.brochurePdfFilename ||
                      currentListingConfig?.brochurePdfFilename) && (
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge variant="secondary">
                          <FileText className="h-3 w-3 mr-1" />
                          {listingDetail?.brochurePdfFilename ||
                            currentListingConfig?.brochurePdfFilename}
                        </Badge>
                      </div>
                    )}
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="application/pdf"
                        id="brochure-upload"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && editingListing) {
                            handleBrochureUpload(editingListing, file);
                          }
                          e.target.value = "";
                        }}
                        data-testid="input-brochure-upload"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5"
                        onClick={() =>
                          document.getElementById("brochure-upload")?.click()
                        }
                        disabled={brochureUploadMutation.isPending}
                        data-testid="button-upload-brochure"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        {brochureUploadMutation.isPending
                          ? "Uploading..."
                          : "Upload / Replace PDF"}
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    listingConfigMutation.isPending ||
                    applyAllMutation.isPending
                  }
                  data-testid={
                    applyAllMode
                      ? "button-apply-all-save"
                      : "button-save-listing-config"
                  }
                >
                  {listingConfigMutation.isPending || applyAllMutation.isPending
                    ? "Saving..."
                    : applyAllMode
                      ? `Apply to all ${listingConfigs.length} listings`
                      : "Save configuration"}
                </Button>
              </Form>
            )}
          </Formik>
        </SheetContent>
      </Sheet>
    </div>
  );
}
