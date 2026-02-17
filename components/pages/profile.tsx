"use client";

import { useState, useRef, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { formatMoney } from "@/lib/money";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Mail,
  Phone,
  Globe,
  LogOut,
  Camera,
  Building2,
  FileText,
  Crown,
  Check,
  Home,
  Sparkles,
} from "lucide-react";

function centerAspectCrop(mediaWidth: number, mediaHeight: number) {
  return centerCrop(
    makeAspectCrop(
      { unit: "%", width: 80 },
      1,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

function getCroppedCanvas(
  image: HTMLImageElement,
  crop: Crop
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  let cropX: number, cropY: number, cropW: number, cropH: number;
  if (crop.unit === "%") {
    cropX = (crop.x / 100) * image.width;
    cropY = (crop.y / 100) * image.height;
    cropW = (crop.width / 100) * image.width;
    cropH = (crop.height / 100) * image.height;
  } else {
    cropX = crop.x;
    cropY = crop.y;
    cropW = crop.width;
    cropH = crop.height;
  }

  const pixelCropX = cropX * scaleX;
  const pixelCropY = cropY * scaleY;
  const pixelCropWidth = cropW * scaleX;
  const pixelCropHeight = cropH * scaleY;

  const outputSize = Math.min(pixelCropWidth, 512);
  canvas.width = outputSize;
  canvas.height = outputSize;

  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    image,
    pixelCropX,
    pixelCropY,
    pixelCropWidth,
    pixelCropHeight,
    0,
    0,
    outputSize,
    outputSize
  );

  return canvas;
}

import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { CURRENCIES } from "@/lib/currencies";

const ProfileSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string(),
  country: Yup.string(),
  city: Yup.string(),
  companyName: Yup.string(),
  crNumber: Yup.string(),
  currency: Yup.string().required("Currency is required"),
});

export default function ProfilePage() {
  const { user, logout, isLoggingOut } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const setLocation = (path: string) => router.push(path);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [uploadingPic, setUploadingPic] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [currencySearch, setCurrencySearch] = useState("");

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", "/api/auth/user", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/user"], data);
      toast({ title: "Profile updated" });
      setLocation("/");
    },
    onError: () => {
      toast({ title: "Failed to update profile", variant: "destructive" });
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/request-email-verification");
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data?.verificationEmailSent) {
        toast({ title: "Verification email sent", description: "Check your inbox." });
      } else if (data?.verificationUrl) {
        toast({ title: "SMTP not configured", description: "Verification link returned (dev mode)." });
        window.open(data.verificationUrl, "_blank");
      } else {
        toast({ title: "Could not send verification email", variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: "Could not send verification email", variant: "destructive" });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Image must be under 10MB", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height));
  }, []);

  const handleCropComplete = async () => {
    if (!imgRef.current || !crop) return;
    setUploadingPic(true);
    setCropDialogOpen(false);

    try {
      const canvas = getCroppedCanvas(imgRef.current, crop);
      const base64 = canvas.toDataURL("image/jpeg", 0.85);
      const res = await apiRequest("POST", "/api/upload/avatar", { image: base64 });
      const data = await res.json();
      queryClient.setQueryData(["/api/auth/user"], (old: any) => ({
        ...old,
        profileImageUrl: data.url,
      }));
      toast({ title: "Profile picture updated" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploadingPic(false);
      setImageSrc(null);
    }
  };

  if (!user) {
    return (
      <div className="px-4 py-4 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 pb-8">
      <div className="flex items-center gap-2.5 mb-6 py-1">
        <Button
          size="icon"
          aria-label="Go back"
          variant="ghost"
          onClick={() => setLocation("/dashboard")}
          data-testid="button-back-profile"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold text-primary" data-testid="text-profile-title">Edit Profile</h1>
      </div>

      <div className="flex justify-center mb-6">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={user.profileImageUrl || undefined}
              alt={user.firstName || "User"}
            />
            <AvatarFallback className="bg-muted text-xl font-semibold">
              {user.firstName?.[0]?.toUpperCase() || <User className="h-8 w-8" />}
            </AvatarFallback>
          </Avatar>
          <button
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background border-2 border-background"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPic}
            data-testid="button-change-avatar"
          >
            {uploadingPic ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileSelect}
            data-testid="input-avatar-file"
          />
        </div>
      </div>

      <Dialog open={cropDialogOpen} onOpenChange={(open) => { if (!open) { setCropDialogOpen(false); setImageSrc(null); } }}>
        <DialogContent className="max-w-sm" data-testid="dialog-crop-avatar">
          <DialogHeader>
            <DialogTitle>Crop your photo</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-2">
            {imageSrc && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                aspect={1}
                circularCrop
                className="max-h-[60vh]"
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  style={{ maxHeight: "60vh", maxWidth: "100%" }}
                  data-testid="img-crop-preview"
                />
              </ReactCrop>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => { setCropDialogOpen(false); setImageSrc(null); }}
              data-testid="button-cancel-crop"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCropComplete}
              disabled={!crop}
              data-testid="button-apply-crop"
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Formik
        enableReinitialize
        initialValues={{
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: user.phone || "",
          country: user.country || "",
          city: (user as any).city || "",
          companyName: (user as any).companyName || "",
          crNumber: (user as any).crNumber || "",
          currency: (user as any).currency || "USD",
        }}
        validationSchema={ProfileSchema}
        onSubmit={(values: any, { setSubmitting }: FormikHelpers<any>) => {
          updateMutation.mutate(
            {
              ...values,
              firstName: values.firstName.trim(),
              lastName: values.lastName.trim(),
              email: values.email.trim(),
              phone: values.phone?.trim(),
              country: values.country?.trim(),
              city: values.city?.trim(),
              companyName: values.companyName?.trim(),
              crNumber: values.crNumber?.trim(),
              currency: values.currency,
            },
            { onSettled: () => setSubmitting(false) }
          );
        }}
      >
        {({ isSubmitting, errors, touched, values, setFieldValue }: { isSubmitting: boolean; errors: any; touched: any; values: any; setFieldValue: any }) => (
          <Form className="space-y-4">
            <Card className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3 w-3" />
                    First name
                  </Label>
                  <Field
                    as={Input}
                    name="firstName"
                    className={errors.firstName && touched.firstName ? "border-destructive" : ""}
                    data-testid="input-first-name"
                  />
                  <ErrorMessage name="firstName" component="div" className="text-xs text-destructive" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3 w-3" />
                    Last name
                  </Label>
                  <Field
                    as={Input}
                    name="lastName"
                    className={errors.lastName && touched.lastName ? "border-destructive" : ""}
                    data-testid="input-last-name"
                  />
                  <ErrorMessage name="lastName" component="div" className="text-xs text-destructive" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3 w-3" />
                  Email
                </Label>
                <Field
                  as={Input}
                  type="email"
                  name="email"
                  className={errors.email && touched.email ? "border-destructive" : ""}
                  data-testid="input-email"
                />
                <ErrorMessage name="email" component="div" className="text-xs text-destructive" />
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Badge variant={user?.emailVerifiedAt ? "secondary" : "destructive"} data-testid="badge-email-verification">
                    {user?.emailVerifiedAt ? "Email verified" : "Email not verified"}
                  </Badge>
                  {!user?.emailVerifiedAt && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={verifyEmailMutation.isPending}
                      onClick={() => verifyEmailMutation.mutate()}
                      data-testid="button-send-verification-email"
                    >
                      {verifyEmailMutation.isPending ? "Sending..." : "Send verification email"}
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Phone className="h-3 w-3" />
                  Phone
                </Label>
                <Field
                  as={Input}
                  type="tel"
                  name="phone"
                  data-testid="input-phone"
                />
                <ErrorMessage name="phone" component="div" className="text-xs text-destructive" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Globe className="h-3 w-3" />
                  Country
                </Label>
                <Field
                  as={Input}
                  name="country"
                  data-testid="input-country"
                />
                <ErrorMessage name="country" component="div" className="text-xs text-destructive" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Globe className="h-3 w-3" />
                  City
                </Label>
                <Field
                  as={Input}
                  name="city"
                  placeholder="(Optional)"
                  data-testid="input-city"
                />
                <ErrorMessage name="city" component="div" className="text-xs text-destructive" />
              </div>
            </Card>

            <Card className="p-4 space-y-4 mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                App preferences
              </p>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  Currency
                </Label>
                <Select
                  value={values.currency}
                  onValueChange={(val) => {
                    setCurrencySearch("");
                    setFieldValue("currency", val);
                  }}
                >
                  <SelectTrigger
                    className={errors.currency && touched.currency ? "border-destructive" : ""}
                    data-testid="select-currency"
                  >
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <Input
                        value={currencySearch}
                        onChange={(e) => setCurrencySearch(e.target.value)}
                        placeholder="Search currency…"
                        className="h-8"
                        data-testid="input-currency-search"
                      />
                    </div>
                    {CURRENCIES.filter((c) => {
                      const q = currencySearch.trim().toLowerCase();
                      if (!q) return true;
                      return (
                        c.code.toLowerCase().includes(q) ||
                        c.name.toLowerCase().includes(q) ||
                        c.symbol.toLowerCase().includes(q)
                      );
                    }).map((c) => (
                      <SelectItem key={c.code} value={c.code} data-testid={`option-currency-${c.code.toLowerCase()}`}>
                        {c.symbol} {c.code} - {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ErrorMessage name="currency" component="div" className="text-xs text-destructive" />
              </div>
            </Card>

            <Card className="p-4 space-y-4 mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Business info (optional)
              </p>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="h-3 w-3" />
                  Company name
                </Label>
                <Field
                  as={Input}
                  name="companyName"
                  placeholder="Your company name"
                  data-testid="input-company-name"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-3 w-3" />
                  CR number
                </Label>
                <Field
                  as={Input}
                  name="crNumber"
                  placeholder="Commercial registration number"
                  data-testid="input-cr-number"
                />
              </div>
            </Card>

            <Button
              className="w-full mt-6"
              type="submit"
              disabled={updateMutation.isPending || isSubmitting}
              data-testid="button-save-profile"
            >
              {updateMutation.isPending || isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save changes
            </Button>
          </Form>
        )}
      </Formik>

      <SubscriptionSection />

      <div className="mt-8 pt-6 border-t">
        <Button
          variant="outline"
          className="w-full text-destructive"
          onClick={() => logout()}
          disabled={isLoggingOut}
          data-testid="button-logout"
        >
          {isLoggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <LogOut className="h-4 w-4 mr-2" />
          )}
          Log out
        </Button>
      </div>
    </div>
  );
}

const planColors: Record<string, string> = {
  light: "#94a3b8",
  growth: "#3b82f6",
  expanding: "#8b5cf6",
};

interface SubPlan {
  key: string;
  name: string;
  maxUnits: number;
  price: number;
  description: string;
}

interface SubscriptionData {
  currentPlan: string;
  currentPlanName: string;
  price: number;
  maxUnits: number;
  unitCount: number;
  plans: SubPlan[];
}

function SubscriptionSection() {
  const { toast } = useToast();
  const { user } = useAuth();

  const { data, isLoading } = useQuery<SubscriptionData>({
    queryKey: ["/api/auth/subscription"],
  });

  const changePlan = useMutation({
    mutationFn: async (plan: string) => {
      const res = await apiRequest("PATCH", "/api/auth/subscription", { plan });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/subscription"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Plan updated" });
    },
    onError: () => {
      toast({ title: "Failed to change plan", variant: "destructive" });
    },
  });

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-md mt-4" />;
  }

  if (!data) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <Crown className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Subscription
        </p>
      </div>

      <Card className="p-4 space-y-4" data-testid="card-subscription">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold" data-testid="text-current-plan">{data.currentPlanName} Plan</p>
              <Badge variant="secondary" style={{ borderColor: planColors[data.currentPlan], color: planColors[data.currentPlan] }}>
                Current
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {data.price === 0 ? "Free" : `${formatMoney(data.price, user?.currency)}/month`}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Home className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm font-medium" data-testid="text-unit-usage">{data.unitCount} / {data.maxUnits}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">units used</p>
          </div>
        </div>

        {data.unitCount >= data.maxUnits && data.currentPlan !== "expanding" && (
          <div className="flex items-center gap-2 p-2.5 rounded-md bg-amber-50 border border-amber-200">
            <Sparkles className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-800">
              You've reached your unit limit. Upgrade to add more properties.
            </p>
          </div>
        )}

        <div className="space-y-2 pt-1">
          {data.plans.map((plan) => {
            const isCurrent = plan.key === data.currentPlan;
            return (
              <div
                key={plan.key}
                className={`flex items-center justify-between gap-3 p-3 rounded-md border transition-colors ${
                  isCurrent ? "border-primary/30 bg-primary/5" : ""
                }`}
                data-testid={`plan-option-${plan.key}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{plan.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {plan.maxUnits === 1 ? "1 unit" : `1-${plan.maxUnits} units`}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-semibold">
                    {plan.price === 0 ? "Free" : `${formatMoney(plan.price, user?.currency)}/mo`}
                  </span>
                  {isCurrent ? (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={changePlan.isPending}
                      onClick={() => changePlan.mutate(plan.key)}
                      data-testid={`button-select-${plan.key}`}
                    >
                      {changePlan.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Select"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
