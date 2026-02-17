"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AlreadyActivatedPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md p-6 space-y-4">
        <h1 className="text-xl font-semibold text-black">Account Already Activated</h1>
        <p className="text-sm text-muted-foreground">
          This invitation link has already been used. Your account is active.
        </p>
        <Button onClick={() => router.push("/login")} data-testid="button-go-login-activated">
          Sign in
        </Button>
      </Card>
    </div>
  );
}
