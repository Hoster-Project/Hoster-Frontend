import { memo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  Send,
  AlertTriangle,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { CheckinWarning, ListingConfig } from "./settings-automation.types";

interface AutomationCardProps {
  icon: typeof Send;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  statusText: string;
  testIdPrefix: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
}

export const AutomationCard = memo(function AutomationCard({
  icon: Icon,
  title,
  description,
  enabled,
  onToggle,
  statusText,
  testIdPrefix,
  children,
  defaultOpen,
}: AutomationCardProps) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="overflow-visible" data-testid={`card-${testIdPrefix}`}>
        <CollapsibleTrigger asChild>
          <div
            className="flex items-center gap-3 p-4 cursor-pointer select-none"
            data-testid={`trigger-${testIdPrefix}`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted flex-shrink-0">
              <Icon className="h-4.5 w-4.5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {statusText}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant={enabled ? "default" : "secondary"}>
                {enabled ? "On" : "Off"}
              </Badge>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3 border-t pt-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <Label className="text-xs font-medium">
                  {enabled ? "Enabled" : "Disabled"}
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {description}
                </p>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={onToggle}
                data-testid={`switch-${testIdPrefix}`}
              />
            </div>
            {enabled && children}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
});

interface CheckinStepProps {
  icon: typeof Send;
  title: string;
  timing: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  testIdPrefix: string;
  children?: React.ReactNode;
}

export const CheckinStep = memo(function CheckinStep({
  icon: Icon,
  title,
  timing,
  enabled,
  onToggle,
  testIdPrefix,
  children,
}: CheckinStepProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className="rounded-md border overflow-visible"
        data-testid={`step-${testIdPrefix}`}
      >
        <CollapsibleTrigger asChild>
          <div
            className="flex items-center gap-2.5 p-3 cursor-pointer select-none"
            data-testid={`trigger-step-${testIdPrefix}`}
          >
            <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{timing}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Switch
                checked={enabled}
                onCheckedChange={(v) => onToggle(v)}
                onClick={(e) => e.stopPropagation()}
                data-testid={`switch-${testIdPrefix}`}
              />
              <ChevronDown
                className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          {enabled && (
            <div className="px-3 pb-3 space-y-3 border-t pt-3">{children}</div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
});

export const ListingPDFBadge = memo(function ListingPDFBadge({
  cfg,
}: {
  cfg: ListingConfig;
}) {
  return cfg.brochurePdfFilename ? (
    <Badge variant="secondary" data-testid={`badge-pdf-${cfg.listingId}`}>
      <FileText className="h-3 w-3 mr-1" /> {cfg.brochurePdfFilename}
    </Badge>
  ) : (
    <Badge variant="outline" data-testid={`badge-no-pdf-${cfg.listingId}`}>
      No PDF
    </Badge>
  );
});

export const ListingSecurityItem = memo(function ListingSecurityItem({
  cfg,
  warnings,
  onEdit,
}: {
  cfg: ListingConfig;
  warnings: CheckinWarning[];
  onEdit: (id: string) => void;
}) {
  const lw = warnings.filter((w) =>
    ["doorCode", "wifiSsid", "wifiPassword", "defaultCheckinTime"].includes(
      w.field,
    ),
  );
  const isComplete = lw.length === 0 && cfg.defaultCheckinTime;

  return (
    <div className="flex items-center justify-between gap-2 p-2.5 rounded-md border flex-wrap">
      <div className="flex items-center gap-2 min-w-0">
        {isComplete ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
        ) : (
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-xs font-medium truncate">{cfg.listingName}</p>
          {!isComplete && (
            <p className="text-xs text-amber-600 mt-0.5">
              {lw.map((w) => w.message).join(", ") || "Missing check-in time"}
            </p>
          )}
          {isComplete && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Check-in {cfg.defaultCheckinTime}
              {cfg.hasDoorCode && " · Door code set"}
              {cfg.hasWifiSsid && " · Wi-Fi set"}
              {cfg.hasWifiPassword && " · Wi-Fi password set"}
            </p>
          )}
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={() => onEdit(cfg.listingId)}>
        Configure
      </Button>
    </div>
  );
});
