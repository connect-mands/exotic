import { getTrafficSettings } from "@/config/traffic-monitor";

export function maskValue(value: string | null | undefined, head = 6, tail = 4): string {
  if (!value) return "—";
  if (value.length <= head + tail) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

const dateTimeFormat = new Intl.DateTimeFormat("en-IN", {
  timeZone: "UTC",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

/** Formats in the reporting timezone (TRAFFIC_TZ_OFFSET_MINUTES, IST by default). */
export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  const offsetMs = getTrafficSettings().timezoneOffsetMinutes * 60 * 1000;
  return dateTimeFormat.format(new Date(date.getTime() + offsetMs));
}

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) return "—";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} h`;
  return `${(seconds / 86400).toFixed(1)} days`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-IN");
}

export function timezoneLabel(): string {
  const minutes = getTrafficSettings().timezoneOffsetMinutes;
  if (minutes === 330) return "IST";
  const sign = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  return `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}
