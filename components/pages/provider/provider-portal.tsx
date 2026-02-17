"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getCategoryBadgeClass } from "@/lib/category-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  ClipboardList,
  Home,
  Star,
  MessageSquare,
  Loader2,
  LogOut,
  X,
  Upload,
  Camera,
  Send,
  ArrowLeft,
  Check,
  XCircle,
  Calendar,
  User,
  Mail,
  Phone,
  Briefcase,
  History,
  Repeat2,
  Settings,
} from "lucide-react";
import ProviderCompanyAdminDashboard from "./provider-company-admin-dashboard";
import ProviderAppSettingsPage from "./provider-app-settings-page";
import { useNotificationSound } from "@/hooks/use-notification-sound";
import { useRealtimeSocket } from "@/hooks/use-realtime-socket";
import { useChatAutoScroll } from "@/hooks/use-chat-auto-scroll";
import ProviderNotificationBell from "./provider-notification-bell";

type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  companyName?: string;
  profileImageUrl?: string;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function dataUrlToFile(dataUrl: string, name: string): File {
  const arr = dataUrl.split(",");
  const mime = arr[0]?.match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1] || "");
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], name, { type: mime });
}

type Subscription = {
  id: string;
  hostId: string;
  providerId: string;
  status: string;
  listingIds: string[];
  declineMessage?: string;
  createdAt: string;
  host: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    companyName?: string;
  } | null;
  listings: Array<{ id: string; name: string; photos?: string[] }>;
};

type Review = {
  id: string;
  rating: number;
  comment?: string;
  hostName: string;
  createdAt: string;
};

type Message = {
  id: string;
  subscriptionId: string;
  senderId: string;
  senderType: string;
  body: string;
  sentAt: string;
};

type VisitReport = {
  id: string;
  subscriptionId: string;
  listingId: string;
  listingName?: string;
  visitDate: string;
  notes?: string | null;
  photos?: string[];
  createdAt?: string;
};

type TabId = "requests" | "properties" | "history" | "reviews" | "chat" | "marketplace" | "settings";

type MarketplaceAssignment = {
  id: string;
  taskId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt?: string;
  task: {
    id: string;
    serviceType: "CLEANING" | "MAINTENANCE";
    scheduledDate: string;
    scheduledTime?: string | null;
    locationAddress: string;
    status: "PENDING" | "RESERVED" | "WORKING" | "APPROVAL_PENDING" | "COMPLETED" | "REJECTED" | "CANCELLED";
    host: {
      firstName: string;
      lastName: string;
      email?: string | null;
      phone?: string | null;
    };
    company?: { name: string | null; companyType?: string | null } | null;
    completion?: {
      id: string;
      submittedAt?: string | null;
      hostApproved: boolean;
      adminApproved: boolean | null;
      isFinalApproved: boolean;
      images?: Array<{ id: string; imageUrl: string }>;
    } | null;
  };
};

type MarketplaceTaskFilter = "pending" | "open" | "delivered" | "accepted" | "rejected";

const providerSidebarStyle = {
  "--sidebar-width": "16rem",
  "--sidebar-width-icon": "3rem",
} as CSSProperties;

import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";

function RequestsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [declineId, setDeclineId] = useState<string | null>(null);
  const [declineMsg, setDeclineMsg] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "ACCEPTED" | "DECLINED">("ALL");

  const { data: subs, isLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/provider/subscriptions"],
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, status, declineMessage }: { id: string; status: string; declineMessage?: string }) => {
      await apiRequest("PATCH", `/api/provider/subscriptions/${id}/respond`, { status, declineMessage });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/provider/subscriptions"] });
      toast({ title: "Response sent" });
      setDeclineId(null);
      setDeclineMsg("");
    },
    onError: (err: Error) => {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    },
  });

  const pending = subs?.filter((s) => s.status === "PENDING") ?? [];
  const accepted = subs?.filter((s) => s.status === "ACCEPTED") ?? [];
  const declined = subs?.filter((s) => s.status === "DECLINED") ?? [];
  const filteredSubs = useMemo(() => {
    if (!subs) return [];
    if (statusFilter === "ALL") return subs;
    return subs.filter((s) => s.status === statusFilter);
  }, [subs, statusFilter]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-5 w-40 mb-3" />
            <Skeleton className="h-4 w-56 mb-2" />
            <Skeleton className="h-4 w-32 mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto w-full" data-testid="tab-requests">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Button
          size="sm"
          variant={statusFilter === "ALL" ? "default" : "outline"}
          onClick={() => setStatusFilter("ALL")}
          className="justify-between"
          data-testid="filter-all"
        >
          <span>All</span>
          <Badge variant="secondary">{subs?.length ?? 0}</Badge>
        </Button>
        <Button
          size="sm"
          variant={statusFilter === "PENDING" ? "default" : "outline"}
          onClick={() => setStatusFilter("PENDING")}
          className="justify-between"
          data-testid="filter-pending"
        >
          <span>Pending</span>
          <Badge variant="secondary">{pending.length}</Badge>
        </Button>
        <Button
          size="sm"
          variant={statusFilter === "ACCEPTED" ? "default" : "outline"}
          onClick={() => setStatusFilter("ACCEPTED")}
          className="justify-between"
          data-testid="filter-accepted"
        >
          <span>Accepted</span>
          <Badge variant="secondary">{accepted.length}</Badge>
        </Button>
        <Button
          size="sm"
          variant={statusFilter === "DECLINED" ? "default" : "outline"}
          onClick={() => setStatusFilter("DECLINED")}
          className="justify-between"
          data-testid="filter-declined"
        >
          <span>Declined</span>
          <Badge variant="secondary">{declined.length}</Badge>
        </Button>
      </div>

      {(!subs || subs.length === 0) && (
        <div className="text-center py-12">
          <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No subscription requests yet</p>
        </div>
      )}

      {subs && subs.length > 0 && filteredSubs.length === 0 && (
        <div className="text-center py-12">
          <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No requests in this filter.</p>
        </div>
      )}

      {filteredSubs.map((sub) => (
        <Card key={sub.id} className="p-4" data-testid={`card-request-${sub.id}`}>
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{(sub.host?.firstName?.[0] ?? "") + (sub.host?.lastName?.[0] ?? "")}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm" data-testid={`text-host-name-${sub.id}`}>
                  {sub.host ? `${sub.host.firstName} ${sub.host.lastName}` : "Unknown Host"}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {sub.host?.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {sub.host.email}
                    </span>
                  )}
                  {sub.host?.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {sub.host.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Badge className={getCategoryBadgeClass(sub.status, "status")} data-testid={`badge-status-${sub.id}`}>
              {sub.status}
            </Badge>
          </div>

          {sub.listings.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Properties</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sub.listings.map((l) => (
                  <div key={l.id} className="grid grid-cols-[32px_minmax(0,1fr)] items-center gap-2 rounded-md bg-muted/50 px-2 py-1.5">
                    {l.photos && l.photos.length > 0 && (
                      <Image
                        src={l.photos[0]}
                        alt={l.name}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-md object-cover"
                        unoptimized
                      />
                    )}
                    {!l.photos || l.photos.length === 0 ? (
                      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                        <Home className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ) : null}
                    <span className="text-xs font-medium truncate" title={l.name}>{l.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground mb-3">
            Received {new Date(sub.createdAt).toLocaleDateString()}
          </p>

          {sub.status === "PENDING" && (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => respondMutation.mutate({ id: sub.id, status: "ACCEPTED" })}
                disabled={respondMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
                data-testid={`button-accept-${sub.id}`}
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setDeclineId(sub.id)}
                disabled={respondMutation.isPending}
                data-testid={`button-decline-${sub.id}`}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Decline
              </Button>
            </div>
          )}

          {sub.status === "DECLINED" && sub.declineMessage && (
            <p className="text-xs text-muted-foreground italic mt-1">Reason: {sub.declineMessage}</p>
          )}
        </Card>
      ))}

      <Dialog open={!!declineId} onOpenChange={(o) => { if (!o) { setDeclineId(null); setDeclineMsg(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">Reason (optional)</Label>
            <Textarea
              value={declineMsg}
              onChange={(e) => setDeclineMsg(e.target.value)}
              placeholder="Let the host know why..."
              data-testid="textarea-decline-reason"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeclineId(null); setDeclineMsg(""); }} data-testid="button-cancel-decline">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (declineId) respondMutation.mutate({ id: declineId, status: "DECLINED", declineMessage: declineMsg || undefined });
              }}
              disabled={respondMutation.isPending}
              data-testid="button-confirm-decline"
            >
              {respondMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Decline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PropertiesTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [reportForm, setReportForm] = useState<{ subscriptionId: string; listingId: string; listingName: string } | null>(null);
  // Removed local state for visitDate and notes as they are now handled by Formik
  const [photos, setPhotos] = useState<Array<{ file: File; url: string; dataUrl?: string; category: string; caption: string; pending?: boolean; metadata?: any }>>([]);
  const [photoFilter, setPhotoFilter] = useState<"all" | "before" | "after" | "damage" | "missing" | "other">("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data: subs, isLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/provider/subscriptions"],
  });
  const { data: reports, isLoading: loadingReports } = useQuery<VisitReport[]>({
    queryKey: ["/api/provider/visit-reports"],
  });

  const reportsByListing = useMemo(() => {
    const map = new Map<string, VisitReport[]>();
    for (const r of reports || []) {
      const arr = map.get(r.listingId) || [];
      arr.push(r);
      map.set(r.listingId, arr);
    }
    return map;
  }, [reports]);

  const accepted = subs?.filter((s) => s.status === "ACCEPTED") ?? [];

  const uploadMutation = useMutation({
    mutationFn: async (data: any) => {
      const fd = new FormData();
      fd.append("subscriptionId", reportForm!.subscriptionId);
      fd.append("listingId", reportForm!.listingId);
      fd.append("visitDate", data.visitDate);
      fd.append("notes", data.notes);
      const files = photos.map((p) => p.file);
      files.forEach((p) => fd.append("photos", p));
      fd.append("categories", JSON.stringify(photos.map((p) => p.category)));
      fd.append("captions", JSON.stringify(photos.map((p) => p.caption)));
      const res = await fetch("/api/provider/visit-reports", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (!res.ok) {
        let message = res.statusText || "Failed to upload report";
        try {
          const body = await res.json();
          if (body?.message) message = String(body.message);
        } catch {
          const t = await res.text();
          if (t) message = t;
        }
        throw new Error(message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/provider/visit-reports"] });
      toast({ title: "Visit report submitted" });
      closeForm();
    },
    onError: (err: Error) => {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    },
  });

  const closeForm = () => {
    setReportForm(null);
    photos.forEach((p) => URL.revokeObjectURL(p.url));
    setPhotos([]);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const remaining = Math.max(0, 8 - photos.length);
    const accepted = newFiles.slice(0, remaining);
    if (newFiles.length > remaining) {
      toast({ title: "Maximum 8 photos", description: `You can add ${remaining} more photo(s).`, variant: "destructive" });
    }
    const toAdd = await Promise.all(
      accepted.map(async (f) => {
        const dataUrl = await fileToDataUrl(f);
        return {
          file: f,
          url: URL.createObjectURL(f),
          dataUrl,
          category: "after",
          caption: "",
          pending: !navigator.onLine,
          metadata: {
            fileSize: f.size,
            lastModified: f.lastModified,
            name: f.name,
          },
        };
      }),
    );
    setPhotos((prev) => [...prev, ...toAdd]);
  };

  const removePhoto = (idx: number) => {
    setPhotos((p) => {
      const target = p[idx];
      if (target) URL.revokeObjectURL(target.url);
      return p.filter((_, i) => i !== idx);
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }, [photos]);

  const filteredPhotos = photoFilter === "all"
    ? photos
    : photos.filter((p) => p.category === photoFilter);

  useEffect(() => {
    const onOnline = async () => {
      const pending = localStorage.getItem("pending_visit_report");
      if (!pending) return;
      try {
        const payload = JSON.parse(pending);
        const fd = new FormData();
        fd.append("subscriptionId", payload.subscriptionId);
        fd.append("listingId", payload.listingId);
        fd.append("visitDate", payload.visitDate);
        fd.append("notes", payload.notes || "");
        payload.photos.forEach((p: any) => {
          const file = dataUrlToFile(p.dataUrl, p.name || "photo.jpg");
          fd.append("photos", file);
        });
        fd.append("categories", JSON.stringify(payload.photos.map((p: any) => p.category)));
        fd.append("captions", JSON.stringify(payload.photos.map((p: any) => p.caption)));
        const res = await fetch("/api/provider/visit-reports", {
          method: "POST",
          body: fd,
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to upload pending report");
        localStorage.removeItem("pending_visit_report");
        toast({ title: "Pending report uploaded" });
      } catch {
        // keep pending for retry
      }
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-5 w-40 mb-3" />
            <Skeleton className="h-24 w-full mb-2" />
            <Skeleton className="h-9 w-40" />
          </Card>
        ))}
      </div>
    );
  }

  const ReportSchema = Yup.object().shape({
    visitDate: Yup.string().required("Visit date is required"),
    notes: Yup.string(),
  });

  if (reportForm) {
    const afterCount = photos.filter((p) => p.category === "after").length;
    const meetsMin = photos.length >= 2 && afterCount >= 2;
    return (
      <div className="p-4 space-y-4" data-testid="form-visit-report">
        <div className="flex items-center gap-3 mb-2">
          <Button size="icon" aria-label="Go back" variant="ghost" onClick={closeForm} data-testid="button-back-from-report">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h3 className="font-semibold text-sm">Submit Visit Report</h3>
            <p className="text-xs text-muted-foreground">{reportForm.listingName}</p>
          </div>
        </div>

        <Formik
          initialValues={{ visitDate: "", notes: "" }}
          validationSchema={ReportSchema}
          onSubmit={(values: any, { setSubmitting }: FormikHelpers<any>) => {
            if (!navigator.onLine) {
              const payload = {
                subscriptionId: reportForm!.subscriptionId,
                listingId: reportForm!.listingId,
                visitDate: values.visitDate,
                notes: values.notes,
                photos: photos.map((p) => ({
                  dataUrl: p.dataUrl,
                  category: p.category,
                  caption: p.caption,
                  name: p.file?.name,
                })),
              };
              localStorage.setItem("pending_visit_report", JSON.stringify(payload));
              toast({ title: "No internet", description: "Report saved and will upload when you're online." });
              setSubmitting(false);
              closeForm();
              return;
            }
            uploadMutation.mutate({ ...values, photos } as any, {
              onSettled: () => setSubmitting(false),
            });
          }}
        >
          {({ isSubmitting, values, setFieldValue, errors, touched }: { isSubmitting: boolean; values: any; setFieldValue: any; errors: any; touched: any }) => (
            <Form className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Visit Date</Label>
                <Field
                  as={Input}
                  type="date"
                  name="visitDate"
                  className={`bg-card border-border rounded-md ${errors.visitDate && touched.visitDate ? "border-destructive" : ""}`}
                  data-testid="input-visit-date"
                />
                <ErrorMessage name="visitDate" component="div" className="text-xs text-destructive" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Notes</Label>
                <Field
                  as={Textarea}
                  name="notes"
                  placeholder="Describe the visit..."
                  className="bg-card border-border rounded-md"
                  data-testid="textarea-visit-notes"
                />
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label className="text-xs font-medium text-muted-foreground">Photos</Label>
                  <span className="text-xs font-medium text-muted-foreground" data-testid="text-photo-count">
                    {photos.length}/8 • After: {afterCount} (min 2)
                  </span>
                </div>

                <div
                  className="border-2 border-dashed border-border rounded-md p-6 text-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  data-testid="dropzone-photos"
                >
                  <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Tap to select or drag photos here</p>
                  <p className="text-xs text-muted-foreground mt-1">Minimum: 2 “After Cleaning” photos • Maximum: 8 photos</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                    data-testid="input-photo-files"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                    data-testid="input-photo-camera"
                  />
                </div>

                {photos.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {(["all", "after", "before", "damage", "missing", "other"] as const).map((f) => (
                        <Button
                          key={f}
                          type="button"
                          size="sm"
                          variant={photoFilter === f ? "default" : "outline"}
                          onClick={() => setPhotoFilter(f)}
                          data-testid={`button-filter-${f}`}
                        >
                          {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                        </Button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => cameraInputRef.current?.click()}
                        data-testid="button-take-photo"
                      >
                        <Camera className="h-4 w-4 mr-1.5" />
                        Take photo
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        data-testid="button-choose-photo"
                      >
                        <Upload className="h-4 w-4 mr-1.5" />
                        Choose from gallery
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {filteredPhotos.map((p, idx) => {
                        const actualIndex = photos.indexOf(p);
                        return (
                        <div key={idx} className="flex gap-3 rounded-md border p-2" data-testid={`photo-row-${idx}`}>
                          <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => setLightboxIndex(actualIndex)}
                              className="h-full w-full"
                              data-testid={`button-open-lightbox-${idx}`}
                            >
                              <Image src={p.url} alt={`Photo ${idx + 1}`} fill className="object-cover" unoptimized />
                            </button>
                            {p.pending && (
                              <span className="absolute bottom-0 left-0 right-0 bg-yellow-500/80 text-white text-[10px] text-center">
                                Pending Upload
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-xs text-muted-foreground w-14">Category</Label>
                              <Select
                                value={p.category}
                                onValueChange={(v) => {
                                  setPhotos((prev) =>
                                    prev.map((x, i) => (i === actualIndex ? { ...x, category: v } : x)),
                                  );
                                }}
                              >
                                <SelectTrigger className="h-9 flex-1" data-testid={`select-photo-category-${idx}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="after">After Cleaning</SelectItem>
                                  <SelectItem value="before">Before Cleaning</SelectItem>
                                  <SelectItem value="damage">Damage Found</SelectItem>
                                  <SelectItem value="missing">Missing Items</SelectItem>
                                  <SelectItem value="other">Other Issues</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={() => removePhoto(actualIndex)}
                                data-testid={`button-remove-photo-${actualIndex}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <Label className="text-xs text-muted-foreground w-14">Caption</Label>
                              <Input
                                value={p.caption}
                                onChange={(e) => {
                                  const v = e.target.value.slice(0, 200);
                                  setPhotos((prev) =>
                                    prev.map((x, i) => (i === actualIndex ? { ...x, caption: v } : x)),
                                  );
                                }}
                                placeholder="(Optional)"
                                data-testid={`input-photo-caption-${actualIndex}`}
                              />
                            </div>
                          </div>
                        </div>
                      )})}
                    </div>

                    <p className={`text-xs ${meetsMin ? "text-emerald-600" : "text-muted-foreground"}`} data-testid="text-min-requirement">
                      {meetsMin ? "✓ Minimum requirement met" : "Add at least 2 “After Cleaning” photos to submit."}
                    </p>
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                type="submit"
                disabled={isSubmitting || uploadMutation.isPending || !meetsMin}
                style={{ backgroundColor: "#FF385C", borderColor: "#FF385C" }}
                data-testid="button-submit-report"
              >
                {isSubmitting || uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                Submit Report ({photos.length} photos)
              </Button>
            </Form>
          )}
        </Formik>

        <Dialog open={lightboxIndex !== null} onOpenChange={(o) => { if (!o) setLightboxIndex(null); }}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Photo Preview</DialogTitle>
            </DialogHeader>
            {lightboxIndex !== null && (
              <div className="space-y-3">
                <div className="relative w-full h-[420px]">
                  <Image src={photos[lightboxIndex].url} alt="Preview" fill className="object-contain" unoptimized />
                </div>
                <div className="text-xs text-muted-foreground">
                  Category: {photos[lightboxIndex].category} • Caption: {photos[lightboxIndex].caption || "N/A"}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLightboxIndex((i) => (i === null ? i : Math.max(0, i - 1)))}
                    disabled={lightboxIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLightboxIndex((i) => (i === null ? i : Math.min(photos.length - 1, i + 1)))}
                    disabled={lightboxIndex === photos.length - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto w-full" data-testid="tab-properties">
      {accepted.length === 0 && (
        <div className="text-center py-12">
          <Home className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No active properties yet</p>
          <p className="text-xs text-muted-foreground mt-1">Accept subscription requests to see properties here</p>
        </div>
      )}

      {accepted.map((sub) => (
        <Card key={sub.id} className="p-4" data-testid={`card-property-${sub.id}`}>
          <div className="flex items-center gap-3 mb-3">
            <Avatar>
              <AvatarFallback>{(sub.host?.firstName?.[0] ?? "") + (sub.host?.lastName?.[0] ?? "")}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{sub.host ? `${sub.host.firstName} ${sub.host.lastName}` : "Host"}</p>
              <p className="text-xs text-muted-foreground">{sub.host?.email}</p>
            </div>
          </div>
          <Separator className="mb-3" />
          <div className="space-y-3">
            {sub.listings.map((l) => {
              const listingReports = reportsByListing.get(l.id) || [];
              const latest = listingReports[0];
              return (
              <div key={l.id} className="rounded-md bg-muted/30 p-3 space-y-2">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {l.photos && l.photos.length > 0 ? (
                      <Image
                        src={l.photos[0]}
                        alt={l.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-md object-cover flex-shrink-0"
                        unoptimized
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                        <Home className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <span
                      className="font-medium text-sm truncate"
                      data-testid={`text-listing-name-${l.id}`}
                      title={l.name}
                    >
                      {l.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Badge variant="secondary" className="whitespace-nowrap">
                      {listingReports.length} report{listingReports.length === 1 ? "" : "s"}
                    </Badge>
                    <Button
                      size="sm"
                      className="min-w-[110px] justify-center"
                      onClick={() => setReportForm({ subscriptionId: sub.id, listingId: l.id, listingName: l.name })}
                      style={{ backgroundColor: "#FF385C", borderColor: "#FF385C" }}
                      data-testid={`button-report-${l.id}`}
                    >
                      <Camera className="h-4 w-4 mr-1" />
                      New Report
                    </Button>
                  </div>
                </div>
                {latest ? (
                  <div className="text-xs text-muted-foreground">
                    Latest report: {new Date(latest.visitDate).toLocaleDateString()} • {latest.photos?.length || 0} photos
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">No report submitted yet for this property.</div>
                )}
              </div>
            )})}
          </div>
        </Card>
      ))}
    </div>
  );
}

function VisitHistoryTab({ initialListingId }: { initialListingId: string | null }) {
  const [listingFilter, setListingFilter] = useState<string>(initialListingId || "all");
  const [previewPhotos, setPreviewPhotos] = useState<string[] | null>(null);

  useEffect(() => {
    if (initialListingId) setListingFilter(initialListingId);
  }, [initialListingId]);

  const { data: reports, isLoading } = useQuery<VisitReport[]>({
    queryKey: ["/api/provider/visit-reports"],
  });

  const listingOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of reports || []) {
      if (!map.has(r.listingId)) map.set(r.listingId, r.listingName || "Listing");
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [reports]);

  const filtered = (reports || []).filter((r) => listingFilter === "all" || r.listingId === listingFilter);

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto w-full" data-testid="tab-history">
      <Card className="p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-base font-semibold">Visit Report History</h2>
          <Select value={listingFilter} onValueChange={setListingFilter}>
            <SelectTrigger className="h-9 w-[180px]" data-testid="select-history-listing">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All properties</SelectItem>
              {listingOptions.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((r) => (
            <Card key={r.id} className="p-4" data-testid={`history-report-${r.id}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{r.listingName || "Listing"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Visit date: {r.visitDate ? new Date(r.visitDate).toLocaleDateString() : "-"}
                  </p>
                  {r.notes ? <p className="text-xs text-muted-foreground mt-1">{r.notes}</p> : null}
                </div>
                <Badge variant="secondary">{r.photos?.length || 0} photos</Badge>
              </div>
              <div className="mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!r.photos || r.photos.length === 0}
                  onClick={() => setPreviewPhotos(r.photos || [])}
                  data-testid={`button-view-history-photos-${r.id}`}
                >
                  View Photos
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground">No reports found for this filter.</p>
        </Card>
      )}

      <Dialog open={!!previewPhotos} onOpenChange={(o) => { if (!o) setPreviewPhotos(null); }}>
        <DialogContent className="w-[min(96vw,980px)] max-w-none max-h-[88vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Report Photos</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {(previewPhotos || []).map((url, idx) => (
              <div key={`${url}-${idx}`} className="aspect-square rounded-md overflow-hidden border relative">
                <Image src={url} alt={`Report photo ${idx + 1}`} fill className="object-cover" unoptimized />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReviewsTab() {
  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ["/api/provider/reviews"],
  });

  const avgRating = reviews && reviews.length > 0
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-20 w-full" />
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-4 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto w-full" data-testid="tab-reviews">
      <Card className="p-4 text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`h-6 w-6 ${s <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
            />
          ))}
        </div>
        <p className="text-2xl font-bold" data-testid="text-avg-rating">{avgRating > 0 ? avgRating : "-"}</p>
        <p className="text-xs text-muted-foreground">{reviews?.length ?? 0} reviews</p>
      </Card>

      {(!reviews || reviews.length === 0) && (
        <div className="text-center py-8">
          <Star className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No reviews yet</p>
        </div>
      )}

      {reviews?.map((r) => (
        <Card key={r.id} className="p-4" data-testid={`card-review-${r.id}`}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">{r.hostName?.[0] ?? "H"}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm" data-testid={`text-reviewer-${r.id}`}>{r.hostName}</span>
            </div>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-4 w-4 ${s <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                />
              ))}
            </div>
          </div>
          {r.comment && <p className="text-sm mb-2" data-testid={`text-review-comment-${r.id}`}>{r.comment}</p>}
          <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</p>
        </Card>
      ))}
    </div>
  );
}

function ChatTab() {
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const searchParams = useSearchParams();
  const deepLinkApplied = useRef(false);

  const { data: subs, isLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/provider/subscriptions"],
  });

  const active = subs?.filter((s) => s.status === "ACCEPTED") ?? [];

  useEffect(() => {
    if (deepLinkApplied.current) return;
    const subId = searchParams.get("subscriptionId");
    if (!subId || active.length === 0) return;
    const match = active.find((s) => s.id === subId);
    if (match) {
      setSelectedSub(match);
      deepLinkApplied.current = true;
    }
  }, [active, searchParams]);

  if (selectedSub) {
    return <ChatThread sub={selectedSub} onBack={() => setSelectedSub(null)} />;
  }

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-56" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-3 max-w-4xl mx-auto w-full" data-testid="tab-chat">
      {active.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No active conversations</p>
          <p className="text-xs text-muted-foreground mt-1">Accept subscription requests to start chatting</p>
        </div>
      )}

      {active.map((sub) => (
        <Card
          key={sub.id}
          className="p-4 cursor-pointer hover-elevate"
          onClick={() => setSelectedSub(sub)}
          data-testid={`card-chat-${sub.id}`}
        >
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{(sub.host?.firstName?.[0] ?? "") + (sub.host?.lastName?.[0] ?? "")}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">
                {sub.host ? `${sub.host.firstName} ${sub.host.lastName}` : "Host"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {sub.listings.map((l) => l.name).join(", ") || "No listings"}
              </p>
            </div>
            <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180 flex-shrink-0" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function ChatThread({ sub, onBack }: { sub: Subscription; onBack: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/provider/messages", sub.id],
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/provider/messages/${sub.id}`, { body });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/provider/messages", sub.id] });
      setBody("");
    },
    onError: (err: Error) => {
      toast({ title: "Failed to send", description: err.message, variant: "destructive" });
    },
  });

  const { containerRef, endRef } = useChatAutoScroll(messages);

  const hostName = sub.host ? `${sub.host.firstName} ${sub.host.lastName}` : "Host";

  return (
    <div className="flex flex-col h-full" data-testid="chat-thread">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 sticky top-0 z-50 bg-background">
        <Button size="icon" aria-label="Go back" variant="ghost" onClick={onBack} data-testid="button-back-chat">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">{(sub.host?.firstName?.[0] ?? "") + (sub.host?.lastName?.[0] ?? "")}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{hostName}</p>
          <p className="text-xs text-muted-foreground truncate">{sub.listings.map((l) => l.name).join(", ")}</p>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-3 md:pb-4 space-y-2 chat-scroll">
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-48" />)}
          </div>
        )}

        {messages && messages.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        )}

        {messages?.map((msg) => {
          const isProvider = msg.senderType === "PROVIDER";
          return (
            <div key={msg.id} className={`flex ${isProvider ? "justify-end" : "justify-start"}`} data-testid={`message-${msg.id}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                  isProvider ? "text-white rounded-br-sm" : "bg-muted rounded-bl-sm"
                }`}
                style={isProvider ? { backgroundColor: "#FF385C" } : undefined}
              >
                <p className="text-sm">{msg.body}</p>
                <p className={`text-[10px] mt-0.5 ${isProvider ? "text-white/70" : "text-muted-foreground"}`}>
                  {new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="chat-composer">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (body.trim()) sendMutation.mutate();
          }}
        >
          <Input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-card border-border"
            data-testid="input-chat-message"
          />
          <Button
            size="icon"
            aria-label="Menu"
            type="submit"
            disabled={!body.trim() || sendMutation.isPending}
            style={{ backgroundColor: "#FF385C", borderColor: "#FF385C" }}
            data-testid="button-send-message"
          >
            {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}

function MarketplaceTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [availability, setAvailability] = useState<"AVAILABLE" | "UNAVAILABLE">("AVAILABLE");
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File[]>>({});
  const [taskFilter, setTaskFilter] = useState<MarketplaceTaskFilter>("pending");

  const { data: pending, isLoading: loadingPending } = useQuery<MarketplaceAssignment[]>({
    queryKey: ["/api/provider/tasks/pending"],
  });
  const { data: active, isLoading: loadingActive } = useQuery<MarketplaceAssignment[]>({
    queryKey: ["/api/provider/tasks/active"],
  });
  const { data: all } = useQuery<MarketplaceAssignment[]>({
    queryKey: ["/api/provider/tasks"],
  });

  const filteredAll = useMemo(() => {
    const items = all || [];
    return items.filter((item) => {
      const taskStatus = item.task.status;
      const assignmentStatus = item.status;
      if (taskFilter === "pending") return assignmentStatus === "PENDING" || taskStatus === "PENDING";
      if (taskFilter === "open") return ["RESERVED", "WORKING", "APPROVAL_PENDING"].includes(taskStatus);
      if (taskFilter === "delivered") return taskStatus === "COMPLETED";
      if (taskFilter === "accepted") return assignmentStatus === "ACCEPTED";
      return assignmentStatus === "REJECTED" || ["REJECTED", "CANCELLED"].includes(taskStatus);
    });
  }, [all, taskFilter]);

  const filterCounts = useMemo(() => {
    const items = all || [];
    const countFor = (filter: MarketplaceTaskFilter) =>
      items.filter((item) => {
        const taskStatus = item.task.status;
        const assignmentStatus = item.status;
        if (filter === "pending") return assignmentStatus === "PENDING" || taskStatus === "PENDING";
        if (filter === "open") return ["RESERVED", "WORKING", "APPROVAL_PENDING"].includes(taskStatus);
        if (filter === "delivered") return taskStatus === "COMPLETED";
        if (filter === "accepted") return assignmentStatus === "ACCEPTED";
        return assignmentStatus === "REJECTED" || ["REJECTED", "CANCELLED"].includes(taskStatus);
      }).length;
    return {
      pending: countFor("pending"),
      open: countFor("open"),
      delivered: countFor("delivered"),
      accepted: countFor("accepted"),
      rejected: countFor("rejected"),
    };
  }, [all]);

  const availabilityMutation = useMutation({
    mutationFn: async (state: "AVAILABLE" | "UNAVAILABLE") => {
      const res = await apiRequest("PUT", "/api/provider/availability", { providerState: state });
      return res.json();
    },
    onSuccess: (_data, state) => {
      setAvailability(state);
      toast({ title: "Availability updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/provider/tasks/${id}/accept`);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/provider/tasks/pending"] });
      qc.invalidateQueries({ queryKey: ["/api/provider/tasks/active"] });
      qc.invalidateQueries({ queryKey: ["/api/provider/tasks"] });
      toast({ title: "Request accepted" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/provider/tasks/${id}/reject`);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/provider/tasks/pending"] });
      qc.invalidateQueries({ queryKey: ["/api/provider/tasks"] });
      toast({ title: "Request rejected" });
    },
  });

  const submitCompletion = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/provider/tasks/${id}/complete`);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/provider/tasks/active"] });
      qc.invalidateQueries({ queryKey: ["/api/provider/tasks"] });
      toast({ title: "Completion submitted" });
    },
    onError: (err: Error) => {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    },
  });

  const uploadImages = async (taskId: string) => {
    const files = selectedFiles[taskId] || [];
    if (!files.length) {
      toast({ title: "Select images first", variant: "destructive" });
      return;
    }
    try {
      setUploadingId(taskId);
      const form = new FormData();
      files.forEach((file) => form.append("photos", file));
      const res = await fetch(`/api/provider/tasks/${taskId}/images`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      if (!res.ok) throw new Error("Upload failed");
      toast({ title: "Images uploaded" });
      setSelectedFiles((prev) => ({ ...prev, [taskId]: [] }));
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="portal-page space-y-6">
      <Card>
        <div className="p-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-semibold">Availability</p>
            <p className="text-xs text-muted-foreground">Control whether you can receive new requests.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={availability === "AVAILABLE" ? "default" : "outline"}
              onClick={() => availabilityMutation.mutate("AVAILABLE")}
              disabled={availabilityMutation.isPending}
            >
              Available
            </Button>
            <Button
              variant={availability === "UNAVAILABLE" ? "default" : "outline"}
              onClick={() => availabilityMutation.mutate("UNAVAILABLE")}
              disabled={availabilityMutation.isPending}
            >
              Unavailable
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <h2 className="text-base font-semibold">Pending Requests</h2>
        {loadingPending ? (
          <Skeleton className="h-24 w-full rounded-md" />
        ) : pending && pending.length > 0 ? (
          pending.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold">
                    {item.task.serviceType} • {item.task.company?.name || "Provider"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.task.host.firstName} {item.task.host.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.task.locationAddress}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => acceptMutation.mutate(item.taskId)}>
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => rejectMutation.mutate(item.taskId)}>
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No pending requests.</p>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold">Active Jobs</h2>
        {loadingActive ? (
          <Skeleton className="h-24 w-full rounded-md" />
        ) : active && active.length > 0 ? (
          active.map((item) => (
            <Card key={item.id} className="p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold">
                  {item.task.serviceType} • {item.task.locationAddress}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.task.host.firstName} {item.task.host.lastName}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Input
                  type="file"
                  multiple
                  onChange={(e) =>
                    setSelectedFiles((prev) => ({
                      ...prev,
                      [item.taskId]: Array.from(e.target.files || []),
                    }))
                  }
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => uploadImages(item.taskId)}
                  disabled={uploadingId === item.taskId}
                >
                  {uploadingId === item.taskId ? "Uploading..." : "Upload Images"}
                </Button>
                <Button
                  size="sm"
                  onClick={() => submitCompletion.mutate(item.taskId)}
                  disabled={submitCompletion.isPending}
                >
                  Submit Completion
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Upload 8 images before submitting.</p>
            </Card>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No active jobs.</p>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-base font-semibold">All Assignments</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={taskFilter === "pending" ? "default" : "outline"}
            onClick={() => setTaskFilter("pending")}
          >
            Pending ({filterCounts.pending})
          </Button>
          <Button
            size="sm"
            variant={taskFilter === "open" ? "default" : "outline"}
            onClick={() => setTaskFilter("open")}
          >
            Open ({filterCounts.open})
          </Button>
          <Button
            size="sm"
            variant={taskFilter === "delivered" ? "default" : "outline"}
            onClick={() => setTaskFilter("delivered")}
          >
            Delivered ({filterCounts.delivered})
          </Button>
          <Button
            size="sm"
            variant={taskFilter === "accepted" ? "default" : "outline"}
            onClick={() => setTaskFilter("accepted")}
          >
            Accepted ({filterCounts.accepted})
          </Button>
          <Button
            size="sm"
            variant={taskFilter === "rejected" ? "default" : "outline"}
            onClick={() => setTaskFilter("rejected")}
          >
            Rejected ({filterCounts.rejected})
          </Button>
        </div>
        {filteredAll.length > 0 ? (
          filteredAll.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold">
                    {item.task.serviceType} • {item.task.status}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.task.locationAddress}</p>
                </div>
                <Badge className={getCategoryBadgeClass(item.status, "status")}>{item.status}</Badge>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No assignments in this filter.</p>
        )}
      </div>
    </div>
  );
}

function ProviderDashboard({
  user,
  onLogout,
  canSwitchMode = false,
  onSwitchMode,
}: {
  user: AuthUser;
  onLogout: () => void;
  canSwitchMode?: boolean;
  onSwitchMode?: () => void;
}) {
  const searchParams = useSearchParams();
  const initialNavApplied = useRef(false);
  const [activeTab, setActiveTab] = useState<TabId>("requests");

  useEffect(() => {
    if (initialNavApplied.current) return;
    const tab = (searchParams.get("tab") || "").toLowerCase();
    const valid: Record<string, TabId> = {
      requests: "requests",
      properties: "properties",
      history: "history",
      reviews: "reviews",
      chat: "chat",
      marketplace: "marketplace",
      settings: "settings",
    };
    const next = valid[tab];
    if (next) setActiveTab(next);
    initialNavApplied.current = true;
  }, [searchParams]);

  const tabs: Array<{ id: TabId; label: string; icon: typeof ClipboardList }> = [
    { id: "requests", label: "Requests", icon: ClipboardList },
    { id: "properties", label: "Properties", icon: Home },
    { id: "history", label: "History", icon: History },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "marketplace", label: "Marketplace", icon: Briefcase },
    { id: "settings", label: "Settings", icon: Settings },
  ];
  const sidebarTabs = tabs.filter((tab) => tab.id !== "settings");
  const mobileTabs = tabs.filter((tab) => tab.id !== "settings").slice(0, 6);

  return (
    <SidebarProvider style={providerSidebarStyle}>
      <div className="min-h-screen bg-muted/30 flex w-full has-bottom-nav" data-testid="provider-dashboard">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Provider</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarTabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <SidebarMenuItem key={tab.id}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => setActiveTab(tab.id)}
                          tooltip={tab.label}
                          data-testid={`tab-${tab.id}`}
                        >
                          <Icon />
                          <span>{tab.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "settings"}
                  onClick={() => setActiveTab("settings")}
                  tooltip="Settings"
                  data-testid="tab-settings"
                >
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onLogout} tooltip="Logout" data-testid="button-provider-logout-side">
                  <LogOut />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <div className="mt-2 flex items-center justify-center gap-3 px-2 pb-2 text-[11px] text-muted-foreground">
              <Link href="/terms" target="_blank" rel="noopener noreferrer" className="hover:underline">
                Terms
              </Link>
              <span aria-hidden="true">•</span>
              <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:underline">
                Privacy
              </Link>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between gap-2 px-4 border-b border-border/50 sticky top-0 z-50 bg-background">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hidden md:flex" data-testid="button-sidebar-toggle-provider" />
              <span className="text-lg font-semibold text-black" data-testid="text-dashboard-logo">
                Provider
              </span>
            </div>
            <div className="flex items-center gap-2">
              {canSwitchMode && (
                <Button size="sm" variant="outline" onClick={onSwitchMode} data-testid="button-switch-to-company-admin">
                  <Repeat2 className="h-4 w-4 mr-1" />
                  Admin Mode
                </Button>
              )}
              <ProviderNotificationBell />
              <Button
                size="icon"
                aria-label="Settings"
                variant="ghost"
                className="md:hidden"
                onClick={() => setActiveTab("settings")}
                data-testid="button-settings-top-provider"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button size="icon" aria-label="Logout" variant="ghost" onClick={onLogout} data-testid="button-logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto pb-20 md:pb-6 w-full bg-muted/20">
            {activeTab === "requests" && <RequestsTab />}
            {activeTab === "properties" && <PropertiesTab />}
            {activeTab === "history" && <VisitHistoryTab initialListingId={null} />}
            {activeTab === "reviews" && <ReviewsTab />}
            {activeTab === "chat" && <ChatTab />}
            {activeTab === "marketplace" && <MarketplaceTab />}
            {activeTab === "settings" && <ProviderAppSettingsPage />}
          </main>

          <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/50 z-50 safe-area-bottom md:hidden" data-testid="nav-bottom-tabs">
            <div className="max-w-2xl mx-auto flex">
              {mobileTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex-1 flex flex-col items-center gap-0.5 py-2"
                    data-testid={`tab-${tab.id}`}
                  >
                    <Icon className="h-5 w-5" style={{ color: isActive ? "#FF385C" : undefined }} />
                    <span className="text-[10px] font-medium" style={{ color: isActive ? "#FF385C" : undefined }}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function ProviderPortal() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  useNotificationSound();
  useRealtimeSocket();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"provider" | "company-admin">("provider");

  const { data: authData, isLoading } = useQuery<{
    isProvider: boolean;
    isCompanyAdmin?: boolean;
    user: AuthUser | null;
  }>({
    queryKey: ["/api/provider/auth-check"],
    retry: false,
    staleTime: 0,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/";
    },
    onError: () => {
      queryClient.clear();
      window.location.href = "/";
    },
  });

  useEffect(() => {
    if (!authData) return;
    const forcedMode = (searchParams.get("mode") || "").toLowerCase();
    if (forcedMode === "company-admin" && authData.isCompanyAdmin) {
      setMode("company-admin");
      return;
    }
    if (forcedMode === "provider" && authData.isProvider) {
      setMode("provider");
      return;
    }
    if (authData.isProvider) {
      setMode("provider");
      return;
    }
    setMode(authData.isCompanyAdmin ? "company-admin" : "provider");
  }, [authData, searchParams]);

  const isUnauthenticated = (!authData?.isProvider && !authData?.isCompanyAdmin) || !authData?.user;
  useEffect(() => {
    if (!isLoading && isUnauthenticated) {
      router.replace("/provider/login");
    }
  }, [isLoading, isUnauthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#FF385C" }} />
      </div>
    );
  }

  if (isUnauthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }
  const currentUser = authData.user as AuthUser;

  if (authData.isCompanyAdmin && mode === "company-admin") {
    return (
      <ProviderCompanyAdminDashboard
        user={currentUser}
        onLogout={() => logoutMutation.mutate()}
        canSwitchMode={authData.isProvider}
        onSwitchMode={authData.isProvider ? () => setMode("provider") : undefined}
      />
    );
  }

  return (
    <ProviderDashboard
      user={currentUser}
      onLogout={() => logoutMutation.mutate()}
      canSwitchMode={authData.isCompanyAdmin}
      onSwitchMode={authData.isCompanyAdmin ? () => setMode("company-admin") : undefined}
    />
  );
}
