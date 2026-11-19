function envInt(name: string, fallback: number, min: number, max: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value < min || value > max) return fallback;
  return value;
}

function envBool(name: string, fallback: boolean): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  if (!raw) return fallback;
  return raw === "true" || raw === "1" || raw === "yes";
}

export type CampaignKey = "kerala" | "andaman" | "bhutan" | "other";

export interface CampaignGroup {
  key: Exclude<CampaignKey, "other">;
  label: string;
  /** Case-insensitive substrings matched against utm_campaign. First match wins. */
  patterns: string[];
}

export const CAMPAIGN_GROUPS: CampaignGroup[] = [
  { key: "kerala", label: "Kerala", patterns: ["kerala"] },
  { key: "andaman", label: "Andaman", patterns: ["andaman"] },
  { key: "bhutan", label: "Bhutan", patterns: ["bhutan"] },
];

export const CAMPAIGN_LABELS: Record<CampaignKey, string> = {
  kerala: "Kerala",
  andaman: "Andaman",
  bhutan: "Bhutan",
  other: "Other / Unknown",
};

export interface DetectionRules {
  /** Rule A: visits from one IP hash inside a short window. */
  repeatVisits: { minVisits: number; windowMinutes: number };
  /** Rule B: distinct Google Ads click IDs first seen inside a window. */
  multipleClickIds: { minClickIds: number; windowMinutes: number };
  /** Rule C: sustained visit frequency. */
  highFrequency: { minVisits: number; windowMinutes: number };
  /** Rule D: Google Ads-attributed sessions with no recorded lead in the selected range. */
  nonConvertingAds: { minAdSessions: number };
}

export function getDetectionRules(): DetectionRules {
  return {
    repeatVisits: {
      minVisits: envInt("TRAFFIC_RULE_REPEAT_VISITS", 5, 2, 1000),
      windowMinutes: envInt("TRAFFIC_RULE_REPEAT_WINDOW_MINUTES", 15, 1, 1440),
    },
    multipleClickIds: {
      minClickIds: envInt("TRAFFIC_RULE_CLICK_IDS", 3, 2, 1000),
      windowMinutes: envInt("TRAFFIC_RULE_CLICK_IDS_WINDOW_MINUTES", 30, 1, 1440),
    },
    highFrequency: {
      minVisits: envInt("TRAFFIC_RULE_HIGH_FREQUENCY_VISITS", 10, 2, 10000),
      windowMinutes: envInt("TRAFFIC_RULE_HIGH_FREQUENCY_WINDOW_MINUTES", 60, 1, 1440),
    },
    nonConvertingAds: {
      minAdSessions: envInt("TRAFFIC_RULE_NON_CONVERTING_AD_SESSIONS", 3, 2, 1000),
    },
  };
}

export function getTrafficSettings() {
  return {
    hashSecret: process.env.TRAFFIC_IP_HASH_SECRET ?? "",
    /** Header set by the hosting edge that clients cannot override. */
    trustedIpHeader: (
      process.env.TRAFFIC_TRUSTED_IP_HEADER ?? "x-nf-client-connection-ip"
    ).toLowerCase(),
    /** Raw IPs are only stored when this is true AND an encryption key is configured. */
    storeRawIp: envBool("TRAFFIC_STORE_RAW_IP", false),
    /** 32-byte key (base64 / base64url) for AES-256-GCM encryption of raw IPs at rest. */
    ipEncryptionKey: process.env.TRAFFIC_IP_ENCRYPTION_KEY ?? "",
    retentionDays: envInt("TRAFFIC_RETENTION_DAYS", 30, 1, 3650),
    rawIpRetentionDays: envInt("TRAFFIC_RAW_IP_RETENTION_DAYS", 7, 1, 7),
    maxVisitsPerMinute: envInt("TRAFFIC_MAX_VISITS_PER_MINUTE", 30, 5, 1000),
    /** India Standard Time by default; used for Today / Yesterday boundaries. */
    timezoneOffsetMinutes: envInt("TRAFFIC_TZ_OFFSET_MINUTES", 330, -720, 840),
  };
}

export const TRAFFIC_SESSION_COOKIE = "ey_vsid";
export const TRAFFIC_SESSION_TTL_SECONDS = 30 * 60;
export const TRAFFIC_ADMIN_SESSION_TTL_SECONDS = 12 * 60 * 60;
export const TRAFFIC_DASHBOARD_PATH = "/admin/traffic-monitor";
export const TRAFFIC_PAGE_SIZE = 25;
