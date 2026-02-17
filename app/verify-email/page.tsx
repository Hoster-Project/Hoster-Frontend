"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function VerifyEmailInner() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const router = useRouter();
  const { toast } = useToast();

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [resending, setResending] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logoutAndGoHome() {
    try {
      setLoggingOut(true);
      await apiRequest("POST", "/api/auth/logout");
    } catch {
      // If logout fails, still navigate home.
    } finally {
      // Ensure no stale auth state causes redirects with stale session.
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.removeQueries({ queryKey: ["/api/auth/user"] });
      queryClient.clear();
      setLoggingOut(false);
      window.location.href = "/";
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!token) {
        setStatus("idle");
        setMessage("");
        return;
      }
      setStatus("loading");
      try {
        const res = await apiRequest("POST", "/api/auth/verify-email", { token });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.message || "Invalid or expired link");
        if (cancelled) return;
        queryClient.removeQueries({ queryKey: ["/api/auth/user"] });
        setStatus("success");
        setMessage("Email verified successfully.");
      } catch (err: any) {
        if (cancelled) return;
        setStatus("error");
        setMessage(err?.message || "Invalid or expired link");
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md p-6 space-y-4" data-testid="verify-email-page">
        <h1 className="text-xl font-semibold text-black">Verify email</h1>
        {!token ? (
          <>
            <p className="text-sm text-muted-foreground">
              Your account needs email verification to access the app. Click below to resend the verification link.
            </p>
            <div className="flex gap-2">
              <Button
                disabled={resending}
                onClick={async () => {
                  try {
                    setResending(true);
                    const res = await apiRequest("POST", "/api/auth/request-email-verification");
                    const json = await res.json().catch(() => ({}));
                    if (!res.ok) throw new Error(json?.message || "Failed to send verification email");
                    queryClient.removeQueries({ queryKey: ["/api/auth/user"] });
                    toast({
                      title: "Verification email requested",
                      description: "Check your inbox (or Mailtrap inbox if using Mailtrap sandbox).",
                    });
                  } catch (err: any) {
                    toast({
                      title: "Failed to request verification",
                      description: err?.message || "",
                      variant: "destructive",
                    });
                  } finally {
                    setResending(false);
                  }
                }}
                data-testid="button-resend-verification"
              >
                {resending ? "Sending..." : "Resend verification link"}
              </Button>
            </div>
          </>
        ) : status === "loading" ? (
          <p className="text-sm text-muted-foreground">Verifying...</p>
        ) : (
          <p className={status === "success" ? "text-sm text-green-600" : "text-sm text-destructive"}>
            {message}
          </p>
        )}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={logoutAndGoHome} disabled={loggingOut} data-testid="button-go-login">
            {loggingOut ? "Logging out..." : "Go home"}
          </Button>
          <Button onClick={() => router.push("/")} data-testid="button-go-home">
            Home
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <VerifyEmailInner />
    </Suspense>
  );
}
