"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const payload = useMemo(() => {
    const code = params.get("code") || undefined;
    const state = params.get("state");
    const channelId = params.get("channelId");
    return { code, state, channelId };
  }, [params]);

  const run = async () => {
    setError(null);
    setIsLoading(true);
    try {
      if (!payload.state || !payload.channelId) {
        throw new Error("Missing OAuth parameters");
      }
      const res = await apiRequest("POST", "/api/channels/oauth/callback", {
        code: payload.code,
        state: payload.state,
        channelId: payload.channelId,
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Callback failed");
      }
      await queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
      setTimeout(() => router.push("/channels"), 1200);
    } catch (e: any) {
      setError(e?.message || "Failed to connect channel");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload.state, payload.channelId, payload.code]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-3">
        {isLoading ? (
          <>
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Connecting your channel…
            </p>
          </>
        ) : error ? (
          <>
            <p className="text-sm text-destructive">{error}</p>
            <div className="flex justify-center gap-2">
              <Button onClick={run} data-testid="button-retry-oauth-callback">
                Retry
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/channels")}
                data-testid="button-back-channels-from-callback"
              >
                Back
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Connected. Redirecting…
          </p>
        )}
      </div>
    </div>
  );
}

export default function ChannelOAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
