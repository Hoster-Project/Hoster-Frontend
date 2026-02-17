"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function SetPasswordInner() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const router = useRouter();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordOk = useMemo(() => {
    return /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && password.length >= 8;
  }, [password]);

  const canSubmit = token.length >= 10 && passwordOk && confirm === password && !isSubmitting;

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md p-6 space-y-4" data-testid="set-password-page">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-black">Create password</h1>
          <p className="text-sm text-muted-foreground">
            Set your password to access your account. This link expires after 1 hour.
          </p>
        </div>

        {!token ? (
          <div className="text-sm text-destructive">Missing token.</div>
        ) : (
          <>
            <div className="space-y-1">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-set-password"
              />
              <p className="text-xs text-muted-foreground">
                Must include uppercase, lowercase, and a number (min 8 chars).
              </p>
            </div>
            <div className="space-y-1">
              <Label>Confirm password</Label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                data-testid="input-set-password-confirm"
              />
            </div>

            <Button
              disabled={!canSubmit}
              onClick={async () => {
                try {
                  setIsSubmitting(true);
                  const res = await apiRequest("POST", "/api/auth/set-password", { token, password });
                  const json = await res.json().catch(() => ({}));
                  if (!res.ok) throw new Error(json?.message || "Failed to set password");

                  if (json?.userId && json?.email) {
                    sessionStorage.setItem("otp_user_id", json.userId);
                    sessionStorage.setItem("otp_email", json.email);
                  }
                  toast({ title: "Password created", description: "Check your email for the verification code." });
                  router.push("/auth/verify-email");
                } catch (err: any) {
                  const msg = err?.message || "";
                  if (/expired/i.test(msg)) {
                    router.push("/auth/invitation-expired");
                    return;
                  }
                  if (/already/i.test(msg)) {
                    router.push("/auth/already-activated");
                    return;
                  }
                  if (/invalid/i.test(msg)) {
                    router.push("/auth/invalid-token");
                    return;
                  }
                  toast({
                    title: "Could not set password",
                    description: msg || "Invalid or expired link",
                    variant: "destructive",
                  });
                } finally {
                  setIsSubmitting(false);
                }
              }}
              data-testid="button-submit-set-password"
            >
              {isSubmitting ? "Saving..." : "Save password"}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <SetPasswordInner />
    </Suspense>
  );
}
