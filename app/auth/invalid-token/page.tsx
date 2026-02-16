"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function InvalidTokenPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md p-6 space-y-4">
        <h1 className="text-xl font-semibold text-primary">Invalid Invitation Link</h1>
        <p className="text-sm text-muted-foreground">
          This invitation link is invalid or has been revoked. Please contact your administrator.
        </p>
        <Button onClick={() => router.push("/")} data-testid="button-go-home-invalid">
          Back to home
        </Button>
      </Card>
    </div>
  );
}

