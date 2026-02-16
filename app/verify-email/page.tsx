"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";

function VerifyEmailInner() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const router = useRouter();

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!token) {
        setStatus("error");
        setMessage("Missing token.");
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
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md p-6 space-y-4" data-testid="verify-email-page">
        <h1 className="text-xl font-semibold text-primary">Verify email</h1>
        {status === "loading" ? (
          <p className="text-sm text-muted-foreground">Verifying...</p>
        ) : (
          <p className={status === "success" ? "text-sm text-green-600" : "text-sm text-destructive"}>
            {message}
          </p>
        )}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.push("/login")} data-testid="button-go-login">
            Go to login
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

