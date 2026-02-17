"use client";

import Link from "next/link";
import { User, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PortalSettingsShortcuts({
  description,
  profileTestId,
  settingsTestId,
  profileHref = "/profile",
  settingsHref = "/settings",
  companyProfileHref,
  companyProfileTestId,
}: {
  description: string;
  profileTestId: string;
  settingsTestId: string;
  profileHref?: string;
  settingsHref?: string;
  companyProfileHref?: string;
  companyProfileTestId?: string;
}) {
  return (
    <Card className="p-4 space-y-3">
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="flex flex-wrap gap-2">
        <Link href={profileHref}>
          <Button variant="outline" data-testid={profileTestId}>
            <User className="h-4 w-4 mr-1.5" />
            Profile
          </Button>
        </Link>
        <Link href={settingsHref}>
          <Button variant="outline" data-testid={settingsTestId}>
            <Settings className="h-4 w-4 mr-1.5" />
            App Settings
          </Button>
        </Link>
        {companyProfileHref && (
          <Link href={companyProfileHref}>
            <Button variant="outline" data-testid={companyProfileTestId}>
              Company Profile
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}
