"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const maskedUser = user.length <= 2 ? `${user[0] || ""}*` : `${user.slice(0, 2)}**`;
  return `${maskedUser}@${domain}`;
}

export default function VerifyOtpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const storedUserId = sessionStorage.getItem("otp_user_id") || "";
    const storedEmail = sessionStorage.getItem("otp_email") || "";
    setUserId(storedUserId);
    setEmail(storedEmail);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const code = useMemo(() => digits.join(""), [digits]);
  const canSubmit = code.length === 6 && !digits.includes("") && !submitting;

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md p-6 space-y-4" data-testid="verify-otp-page">
        <h1 className="text-xl font-semibold text-black">Verify your email</h1>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to {email ? maskEmail(email) : "your email"}.
        </p>

        <div className="flex gap-2 justify-center">
          {digits.map((d, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputsRef.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="h-12 w-10 rounded-full border border-input bg-card text-center text-lg ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={d}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                setDigits((prev) => {
                  const next = [...prev];
                  next[idx] = v;
                  return next;
                });
                if (v && idx < 5) inputsRef.current[idx + 1]?.focus();
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !digits[idx] && idx > 0) {
                  inputsRef.current[idx - 1]?.focus();
                }
              }}
              onPaste={(e) => {
                const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                if (!text) return;
                setDigits(text.split("").concat(Array(6).fill("")).slice(0, 6));
                inputsRef.current[Math.min(text.length, 5)]?.focus();
                e.preventDefault();
              }}
            />
          ))}
        </div>

        <Button
          disabled={!canSubmit}
          onClick={async () => {
            try {
              setSubmitting(true);
              const res = await apiRequest("POST", "/api/auth/verify-otp", { userId, otpCode: code });
              const json = await res.json().catch(() => ({}));
              if (!res.ok) throw new Error(json?.message || "Invalid code");
              queryClient.removeQueries({ queryKey: ["/api/auth/user"] });
              toast({ title: "Email verified" });
              const role = json?.user?.role as string | undefined;
              if (role === "admin") router.push("/admin");
              else if (role === "provider" || role === "employee") router.push("/provider");
              else router.push("/dashboard");
            } catch (err: any) {
              toast({ title: "Verification failed", description: err?.message || "", variant: "destructive" });
            } finally {
              setSubmitting(false);
            }
          }}
          data-testid="button-verify-otp"
        >
          {submitting ? "Verifying..." : "Verify"}
        </Button>

        <div className="text-xs text-muted-foreground">
          {cooldown > 0 ? `Resend available in 0:${String(cooldown).padStart(2, "0")}` : "Didn't receive code?"}
        </div>
        <Button
          variant="ghost"
          size="sm"
          disabled={cooldown > 0}
          onClick={async () => {
            try {
              const res = await apiRequest("POST", "/api/auth/resend-otp", { userId });
              const json = await res.json().catch(() => ({}));
              if (!res.ok) throw new Error(json?.message || "Failed to resend code");
              toast({ title: "New code sent" });
              setCooldown(120);
            } catch (err: any) {
              toast({ title: "Resend failed", description: err?.message || "", variant: "destructive" });
            }
          }}
          data-testid="button-resend-otp"
        >
          Resend code
        </Button>
      </Card>
    </div>
  );
}
