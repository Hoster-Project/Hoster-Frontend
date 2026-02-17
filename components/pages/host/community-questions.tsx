"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CommunityQuestionsPage() {
  const router = useRouter();

  return (
    <div className="pb-6">
      <div className="flex items-center gap-3 px-4 py-3 border-b sticky top-0 bg-background z-50">
        <button
          className="flex items-center gap-1.5 text-sm text-muted-foreground"
          onClick={() => router.push("/settings")}
          data-testid="button-back-community"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Go back</span>
        </button>
        <h1 className="text-lg font-semibold flex-1 text-black" data-testid="text-community-title">Community Questions</h1>
      </div>

      <div className="px-4 py-6">
        <div className="rounded-md border p-4">
          <p className="text-sm font-medium">Community feed is currently unavailable.</p>
          <p className="text-sm text-muted-foreground mt-1">
            This section was using mock data and has been disabled until a real backend endpoint is implemented.
          </p>
          <Button className="mt-4" variant="outline" onClick={() => router.push("/settings")}>
            Back to Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
