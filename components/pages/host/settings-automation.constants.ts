import {
  CheckCircle2,
  XCircle,
  PauseCircle,
} from "lucide-react";

export const ACTION_TYPE_LABELS: Record<string, string> = {
  SEND_CHECKIN_MESSAGE: "Check-in message",
  SEND_CHECKOUT_THANKYOU: "Thank-you message",
  SEND_FIRST_REPLY_ACK: "Auto-reply",
  CLEANING_REMINDER: "Cleaning reminder",
  SEND_WELCOME_10MIN: "Welcome message",
  SEND_ACCESS_30MIN: "Access details",
  SEND_FOLLOWUP_1H: "Follow-up message",
};

export const STATUS_CONFIG: Record<
  string,
  { icon: typeof CheckCircle2; label: string; className: string }
> = {
  SUCCESS: { icon: CheckCircle2, label: "Sent", className: "text-green-600" },
  FAILED: { icon: XCircle, label: "Failed", className: "text-red-600" },
  PAUSED: { icon: PauseCircle, label: "Paused", className: "text-amber-600" },
};

export const CHECKIN_TEMPLATE_VARIABLES = [
  "{{GuestName}}",
  "{{ListingName}}",
  "{{CheckInDate}}",
  "{{CheckOutDate}}",
  "{{CheckInTime}}",
  "{{DoorCode}}",
  "{{WifiName}}",
  "{{WifiPassword}}",
  "{{BrochureLink}}",
];

export const LEGACY_TEMPLATE_VARIABLES = [
  "{{GuestName}}",
  "{{ListingName}}",
  "{{CheckInDate}}",
  "{{CheckOutDate}}",
];

export function formatRelativeTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
