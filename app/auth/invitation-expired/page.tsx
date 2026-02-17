"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function InvitationExpiredPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md p-6 space-y-4">
        <h1 className="text-xl font-semibold text-black">Invitation Link Expired</h1>
        <p className="text-sm text-muted-foreground">
          This invitation link has expired. Links are valid for 1 hour for security reasons.
        </p>
        <Input
          type="email"
          placeholder="Enter your email to resend"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          data-testid="input-resend-email"
        />
        <Button
          onClick={async () => {
            try {
              const res = await apiRequest("POST", "/api/auth/resend-invitation", { email });
              const json = await res.json().catch(() => ({}));
              if (!res.ok) throw new Error(json?.message || "Failed to resend");
              toast({ title: "Invitation resent" });
            } catch (err: any) {
              toast({ title: "Failed to resend invitation", description: err?.message || "", variant: "destructive" });
            }
          }}
          data-testid="button-resend-invitation"
        >
          Request new invitation
        </Button>
        <Button onClick={() => router.push("/login")} data-testid="button-go-login-expired">
          Go to login
        </Button>
      </Card>
    </div>
  );
}
