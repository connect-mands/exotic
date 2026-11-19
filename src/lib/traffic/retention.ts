import { getTrafficSettings } from "@/config/traffic-monitor";
import { getDb } from "@/lib/db";

const DAY_MS = 24 * 60 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000;

let lastCleanupAt = 0;

export async function purgeExpiredTrafficData(): Promise<{
  visitsDeleted: number;
  leadsDeleted: number;
  rawIpsCleared: number;
  adminSessionsDeleted: number;
  loginAttemptsDeleted: number;
}> {
  const { retentionDays, rawIpRetentionDays } = getTrafficSettings();
  const db = getDb();
  const now = Date.now();
  const cutoff = new Date(now - retentionDays * DAY_MS);
  const rawIpCutoff = new Date(now - rawIpRetentionDays * DAY_MS);
  const dayAgo = new Date(now - DAY_MS);

  // Sequential so expired visits are deleted before raw IPs are cleared; running
  // both at once would have them contend for the same rows.
  const visits = await db.websiteVisit.deleteMany({ where: { createdAt: { lt: cutoff } } });
  const rawIps = await db.websiteVisit.updateMany({
    where: { createdAt: { lt: rawIpCutoff }, ipAddress: { not: null } },
    data: { ipAddress: null },
  });
  const leads = await db.websiteLead.deleteMany({ where: { createdAt: { lt: cutoff } } });
  const sessions = await db.adminSession.deleteMany({
    where: { OR: [{ expiresAt: { lt: dayAgo } }, { revokedAt: { lt: dayAgo } }] },
  });
  const attempts = await db.adminLoginAttempt.deleteMany({ where: { createdAt: { lt: dayAgo } } });

  return {
    visitsDeleted: visits.count,
    leadsDeleted: leads.count,
    rawIpsCleared: rawIps.count,
    adminSessionsDeleted: sessions.count,
    loginAttemptsDeleted: attempts.count,
  };
}

/** Runs retention cleanup at most once per interval per server instance. */
export async function maybePurgeExpiredTrafficData(): Promise<void> {
  const now = Date.now();
  if (now - lastCleanupAt < CLEANUP_INTERVAL_MS) return;
  lastCleanupAt = now;
  try {
    await purgeExpiredTrafficData();
  } catch (error) {
    console.error("[traffic] retention cleanup failed", error);
  }
}
