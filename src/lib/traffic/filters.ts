import {
  CAMPAIGN_GROUPS,
  type CampaignKey,
  getTrafficSettings,
} from "@/config/traffic-monitor";

export type RangePreset = "today" | "yesterday" | "7d" | "30d" | "custom";
export type CampaignFilter = CampaignKey | "all";
export type SortDirection = "asc" | "desc";

export type RawSearchParams = Record<string, string | string[] | undefined>;

export interface TrafficFilters {
  range: RangePreset;
  /** Inclusive lower bound (UTC instant). */
  from: Date;
  /** Exclusive upper bound (UTC instant). */
  to: Date;
  /** YYYY-MM-DD in the reporting timezone, for form inputs. */
  fromInput: string;
  toInput: string;
  campaign: CampaignFilter;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_CUSTOM_DAYS = 366;
const DATE_INPUT = /^\d{4}-\d{2}-\d{2}$/;

const RANGE_PRESETS: RangePreset[] = ["today", "yesterday", "7d", "30d", "custom"];
const CAMPAIGN_FILTERS: CampaignFilter[] = [
  "all",
  ...CAMPAIGN_GROUPS.map((group) => group.key),
  "other",
];

export function firstParam(params: RawSearchParams, key: string): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function startOfLocalDay(instant: number, offsetMs: number): number {
  return Math.floor((instant + offsetMs) / DAY_MS) * DAY_MS - offsetMs;
}

function toDateInput(instant: number, offsetMs: number): string {
  return new Date(instant + offsetMs).toISOString().slice(0, 10);
}

function parseDateInput(value: string | undefined, offsetMs: number): number | null {
  if (!value || !DATE_INPUT.test(value)) return null;
  const utcMidnight = Date.parse(`${value}T00:00:00Z`);
  if (Number.isNaN(utcMidnight)) return null;
  return utcMidnight - offsetMs;
}

export function parseTrafficFilters(params: RawSearchParams): TrafficFilters {
  const offsetMs = getTrafficSettings().timezoneOffsetMinutes * 60 * 1000;
  const now = Date.now();
  const todayStart = startOfLocalDay(now, offsetMs);

  const requestedRange = firstParam(params, "range") as RangePreset | undefined;
  let range: RangePreset =
    requestedRange && RANGE_PRESETS.includes(requestedRange) ? requestedRange : "7d";

  let from: number;
  let to: number;

  switch (range) {
    case "today":
      from = todayStart;
      to = todayStart + DAY_MS;
      break;
    case "yesterday":
      from = todayStart - DAY_MS;
      to = todayStart;
      break;
    case "30d":
      from = todayStart - 29 * DAY_MS;
      to = todayStart + DAY_MS;
      break;
    case "custom": {
      const customFrom = parseDateInput(firstParam(params, "from"), offsetMs);
      const customTo = parseDateInput(firstParam(params, "to"), offsetMs);
      if (
        customFrom !== null &&
        customTo !== null &&
        customTo >= customFrom &&
        (customTo - customFrom) / DAY_MS < MAX_CUSTOM_DAYS
      ) {
        from = customFrom;
        to = customTo + DAY_MS;
        break;
      }
      range = "7d";
      from = todayStart - 6 * DAY_MS;
      to = todayStart + DAY_MS;
      break;
    }
    default:
      from = todayStart - 6 * DAY_MS;
      to = todayStart + DAY_MS;
  }

  const requestedCampaign = firstParam(params, "campaign") as CampaignFilter | undefined;
  const campaign =
    requestedCampaign && CAMPAIGN_FILTERS.includes(requestedCampaign)
      ? requestedCampaign
      : "all";

  return {
    range,
    from: new Date(from),
    to: new Date(to),
    fromInput: toDateInput(from, offsetMs),
    toInput: toDateInput(to - DAY_MS, offsetMs),
    campaign,
  };
}

export function parsePage(params: RawSearchParams, key: string): number {
  const value = Number.parseInt(firstParam(params, key) ?? "1", 10);
  return Number.isInteger(value) && value > 0 && value <= 100_000 ? value : 1;
}

export function parseSort<T extends string>(
  params: RawSearchParams,
  key: string,
  allowed: readonly T[],
  fallback: T
): { sort: T; dir: SortDirection } {
  const requested = firstParam(params, key);
  const [field, direction] = (requested ?? "").split(".");
  const sort = allowed.includes(field as T) ? (field as T) : fallback;
  const dir: SortDirection = direction === "asc" ? "asc" : "desc";
  return { sort, dir };
}

/** Builds a query string from current params with overrides (undefined removes a key). */
export function buildQuery(
  params: RawSearchParams,
  overrides: Record<string, string | undefined>
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const single = Array.isArray(value) ? value[0] : value;
    if (single !== undefined && !(key in overrides)) query.set(key, single);
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined) query.set(key, value);
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}
