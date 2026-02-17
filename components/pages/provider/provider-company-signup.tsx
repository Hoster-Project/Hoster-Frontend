"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type SignupPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  city: string;
  companyName: string;
  crNumber: string;
  serviceType: "CLEANING" | "MAINTENANCE";
  companyType: "COMPANY" | "FREELANCER";
  description: string;
};

export default function ProviderCompanySignupPage() {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<SignupPayload>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    country: "",
    city: "",
    companyName: "",
    crNumber: "",
    serviceType: "CLEANING",
    companyType: "COMPANY",
    description: "",
  });

  const signupMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/provider-company-signup", {
        ...form,
        portal: "provider",
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      setSubmitted(true);
      setVerificationUrl(data?.verificationUrl || null);
      toast({
        title: "Signup submitted",
        description: "Verify your email, then wait for admin/moderator approval.",
      });
    },
    onError: (err: Error) => {
      toast({ title: "Signup failed", description: err.message, variant: "destructive" });
    },
  });

  if (submitted) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-xl">
          <CardContent className="p-6 space-y-4">
            <h1 className="text-2xl font-extrabold text-primary">Provider Company Signup Submitted</h1>
            <p className="text-sm text-muted-foreground">
              Your company admin account is now pending. Verify your email first, then wait for admin/moderator approval.
            </p>
            {verificationUrl && (
              <a href={verificationUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline text-primary">
                Open verification link (dev only)
              </a>
            )}
            <div className="pt-2">
              <Link href="/provider/login">
                <Button variant="outline">Back to Provider Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-10" data-testid="provider-company-signup-page">
      <div className="w-full max-w-xl">
        <div className="mb-2">
          <Button variant="ghost" size="sm" className="-ml-2" asChild>
            <Link href="/provider/login">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Link>
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-primary">Provider Company Signup</h1>
          <p className="text-sm text-muted-foreground mt-1">Step {step} of 2</p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-5">
            {step === 1 && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>First name</Label>
                    <Input value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Last name</Label>
                    <Input value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Country</Label>
                    <Input value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Link href="/provider/login" className="text-sm text-muted-foreground underline">
                    Back to login
                  </Link>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!form.firstName || !form.lastName || !form.email || !form.password || !form.phone || !form.country}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Company name</Label>
                  <Input value={form.companyName} onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>CR number (optional)</Label>
                  <Input value={form.crNumber} onChange={(e) => setForm((p) => ({ ...p, crNumber: e.target.value }))} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Service type</Label>
                    <Select value={form.serviceType} onValueChange={(v: "CLEANING" | "MAINTENANCE") => setForm((p) => ({ ...p, serviceType: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CLEANING">Cleaning</SelectItem>
                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Company type</Label>
                    <Select value={form.companyType} onValueChange={(v: "COMPANY" | "FREELANCER") => setForm((p) => ({ ...p, companyType: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COMPANY">Company</SelectItem>
                        <SelectItem value="FREELANCER">Freelancer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Company description (optional)</Label>
                  <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button
                    onClick={() => signupMutation.mutate()}
                    disabled={!form.companyName || signupMutation.isPending}
                  >
                    {signupMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Signup"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
