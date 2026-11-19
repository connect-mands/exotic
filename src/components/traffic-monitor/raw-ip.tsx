import { getTrafficSettings } from "@/config/traffic-monitor";
import { isRawIpStorageActive } from "@/lib/traffic/ip-crypto";

const DAY_MS = 24 * 60 * 60 * 1000;

function describeMissingIp(seenAt: Date | null | undefined): { label: string; title: string } {
  const { rawIpRetentionDays } = getTrafficSettings();
  if (seenAt && seenAt.getTime() < Date.now() - rawIpRetentionDays * DAY_MS) {
    return {
      label: `Expired (over ${rawIpRetentionDays} days)`,
      title: `Real IPs are deleted ${rawIpRetentionDays} days after the visit.`,
    };
  }
  return {
    label: "Not recorded",
    title: isRawIpStorageActive()
      ? "No real IP was saved for this visit (e.g. recorded before real-IP storage was enabled)."
      : "Real-IP storage is switched off (TRAFFIC_STORE_RAW_IP / TRAFFIC_IP_ENCRYPTION_KEY).",
  };
}

/** Raw IP for authenticated admin views. Rendered only by server components behind requireAdminPage(). */
export function RawIp({ ip, seenAt }: { ip: string | null; seenAt?: Date | null }) {
  if (ip) {
    return <span className="font-mono text-xs break-all text-foreground">{ip}</span>;
  }
  const { label, title } = describeMissingIp(seenAt);
  return (
    <span className="text-xs text-muted-foreground" title={title}>
      {label}
    </span>
  );
}
