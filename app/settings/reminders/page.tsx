"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Reminders section removed (consolidated into Automation).
 * Redirect to automation settings.
 */
export default function RemindersRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/settings/automation");
  }, [router]);
  return null;
}
