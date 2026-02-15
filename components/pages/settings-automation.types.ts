export interface AutomationSettings {
  autoCheckinEnabled: boolean;
  autoCheckinTiming: "CHECKIN_MINUS_24H" | "CHECKIN_MORNING";
  autoCheckoutThanksEnabled: boolean;
  cleaningReminderEnabled: boolean;
  autoCleaningTaskEnabled: boolean;
  autoFirstReplyEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export interface CheckinSettings {
  welcomeEnabled: boolean;
  welcomeIncludePdf: boolean;
  accessEnabled: boolean;
  followupEnabled: boolean;
}

export interface AutomationTemplate {
  id: string;
  key: string;
  name: string;
  body: string;
}

export interface ListingConfig {
  listingId: string;
  listingName: string;
  defaultCheckinTime: string;
  hasDoorCode: boolean;
  hasWifiSsid: boolean;
  hasWifiPassword: boolean;
  brochurePdfUrl: string | null;
  brochurePdfFilename: string | null;
}

export interface ListingConfigDetail {
  listingId: string;
  listingName: string;
  defaultCheckinTime: string;
  doorCode: string;
  wifiSsid: string;
  wifiPassword: string;
  brochurePdfUrl: string | null;
  brochurePdfFilename: string | null;
}

export interface CheckinWarning {
  listingId: string;
  listingName: string;
  field: string;
  message: string;
}

export interface AutomationLog {
  id: string;
  actionType: string;
  status: string;
  reason: string | null;
  guestName: string | null;
  listingName: string | null;
  channelKey: string | null;
  createdAt: string;
}

export interface CheckinData {
  settings: CheckinSettings;
  templates: AutomationTemplate[];
  listingConfigs: ListingConfig[];
  warnings: CheckinWarning[];
}

export interface LegacyData {
  settings: AutomationSettings;
  templates: AutomationTemplate[];
  pausedChannels: Array<{ channelKey: string; reason: string }>;
  unmappedListingCount: number;
}
