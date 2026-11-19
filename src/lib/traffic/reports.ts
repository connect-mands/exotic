import {
  CAMPAIGN_GROUPS,
  type CampaignKey,
  type DetectionRules,
  TRAFFIC_PAGE_SIZE,
  getDetectionRules,
  getTrafficSettings,
} from "@/config/traffic-monitor";
import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import type { SortDirection, TrafficFilters } from "@/lib/traffic/filters";
import { decryptIp } from "@/lib/traffic/ip-crypto";

const CLICK_ID = Prisma.sql`COALESCE(v.gclid, v.gbraid, v.wbraid)`;

/**
 * Oldest visit time whose raw IP may still be shown. Applied in every query
 * that reads ipAddress so expired IPs are never returned, even if the
 * retention cleanup has not run yet.
 */
function rawIpCutoff(): Date {
  return new Date(Date.now() - getTrafficSettings().rawIpRetentionDays * 24 * 60 * 60 * 1000);
}

/** Encrypted raw IP for the visit, or NULL once it is past raw-IP retention. */
function encryptedIpColumn(): Prisma.Sql {
  return Prisma.sql`CASE WHEN v."createdAt" >= ${rawIpCutoff()} THEN v."ipAddress" END`;
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/** Maps utm_campaign to a campaign group; first matching group wins. */
const CAMPAIGN_CASE = Prisma.sql`(CASE ${Prisma.join(
  CAMPAIGN_GROUPS.map(
    (group) =>
      Prisma.sql`WHEN (${Prisma.join(
        group.patterns.map(
          (pattern) => Prisma.sql`v."utmCampaign" ILIKE ${`%${escapeLike(pattern)}%`}`
        ),
        " OR "
      )}) THEN ${group.key}`
  ),
  " "
)} ELSE 'other' END)`;

function interval(minutes: number): Prisma.Sql {
  if (!Number.isInteger(minutes) || minutes < 1) {
    throw new Error("Invalid interval");
  }
  return Prisma.raw(`INTERVAL '${minutes} minutes'`);
}

function visitConditions(
  filters: TrafficFilters,
  extra: Prisma.Sql[] = []
): Prisma.Sql {
  const conditions = [
    Prisma.sql`v."createdAt" >= ${filters.from}`,
    Prisma.sql`v."createdAt" < ${filters.to}`,
    ...extra,
  ];
  if (filters.campaign !== "all") {
    conditions.push(Prisma.sql`${CAMPAIGN_CASE} = ${filters.campaign}`);
  }
  return Prisma.join(conditions, " AND ");
}

function leadConditions(filters: TrafficFilters, extra: Prisma.Sql[] = []): Prisma.Sql {
  const conditions = [
    Prisma.sql`l."createdAt" >= ${filters.from}`,
    Prisma.sql`l."createdAt" < ${filters.to}`,
    ...extra,
  ];
  if (filters.campaign !== "all") {
    conditions.push(
      Prisma.sql`EXISTS (SELECT 1 FROM "WebsiteVisit" v WHERE v."sessionId" = l."sessionId" AND ${CAMPAIGN_CASE} = ${filters.campaign})`
    );
  }
  return Prisma.join(conditions, " AND ");
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

export interface TrafficSummary {
  totalVisits: number;
  uniqueIpHashes: number;
  sessions: number;
  repeatVisitors: number;
  adsVisits: number;
  distinctGclids: number;
  recordedEnquiries: number;
}

export async function getTrafficSummary(filters: TrafficFilters): Promise<TrafficSummary> {
  const db = getDb();
  const where = visitConditions(filters);

  const [[totals], [repeat], [leads]] = await Promise.all([
    db.$queryRaw<Omit<TrafficSummary, "repeatVisitors" | "recordedEnquiries">[]>`
      SELECT
        count(*)::int AS "totalVisits",
        count(DISTINCT v."ipHash")::int AS "uniqueIpHashes",
        count(DISTINCT v."sessionId")::int AS "sessions",
        (count(*) FILTER (WHERE ${CLICK_ID} IS NOT NULL))::int AS "adsVisits",
        count(DISTINCT v.gclid)::int AS "distinctGclids"
      FROM "WebsiteVisit" v
      WHERE ${where}`,
    db.$queryRaw<{ repeatVisitors: number }[]>`
      SELECT count(*)::int AS "repeatVisitors" FROM (
        SELECT v."ipHash"
        FROM "WebsiteVisit" v
        WHERE ${where} AND v."ipHash" IS NOT NULL
        GROUP BY v."ipHash"
        HAVING count(DISTINCT v."sessionId") > 1
      ) repeat_ips`,
    db.$queryRaw<{ recordedEnquiries: number }[]>`
      SELECT count(*)::int AS "recordedEnquiries"
      FROM "WebsiteLead" l
      WHERE ${leadConditions(filters)}`,
  ]);

  return {
    totalVisits: totals?.totalVisits ?? 0,
    uniqueIpHashes: totals?.uniqueIpHashes ?? 0,
    sessions: totals?.sessions ?? 0,
    adsVisits: totals?.adsVisits ?? 0,
    distinctGclids: totals?.distinctGclids ?? 0,
    repeatVisitors: repeat?.repeatVisitors ?? 0,
    recordedEnquiries: leads?.recordedEnquiries ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Campaign breakdown
// ---------------------------------------------------------------------------

export interface CampaignBreakdownRow {
  campaign: CampaignKey;
  visits: number;
  adsVisits: number;
  sessions: number;
  uniqueIpHashes: number;
  distinctClickIds: number;
  leads: number;
}

export async function getCampaignBreakdown(
  filters: TrafficFilters
): Promise<CampaignBreakdownRow[]> {
  return getDb().$queryRaw<CampaignBreakdownRow[]>`
    WITH cv AS (
      SELECT v."sessionId", v."ipHash", v.gclid, v.gbraid, v.wbraid,
             ${CAMPAIGN_CASE} AS campaign
      FROM "WebsiteVisit" v
      WHERE ${visitConditions(filters)}
    )
    SELECT
      cv.campaign,
      count(*)::int AS "visits",
      (count(*) FILTER (WHERE COALESCE(cv.gclid, cv.gbraid, cv.wbraid) IS NOT NULL))::int AS "adsVisits",
      count(DISTINCT cv."sessionId")::int AS "sessions",
      count(DISTINCT cv."ipHash")::int AS "uniqueIpHashes",
      count(DISTINCT COALESCE(cv.gclid, cv.gbraid, cv.wbraid))::int AS "distinctClickIds",
      (
        SELECT count(*)::int FROM "WebsiteLead" l
        WHERE l."createdAt" >= ${filters.from} AND l."createdAt" < ${filters.to}
          AND l."sessionId" IN (
            SELECT DISTINCT x."sessionId" FROM cv x
            WHERE x.campaign = cv.campaign AND x."sessionId" IS NOT NULL
          )
      ) AS "leads"
    FROM cv
    GROUP BY cv.campaign
    ORDER BY "visits" DESC`;
}

// ---------------------------------------------------------------------------
// Suspicious traffic detection
// ---------------------------------------------------------------------------

export const SUSPICIOUS_SORTS = ["visits", "clickIds", "sessions", "firstAt", "lastAt"] as const;
export type SuspiciousSort = (typeof SUSPICIOUS_SORTS)[number];

export type TrafficStatus = "normal" | "suspicious" | "google-invalid";

export interface SuspiciousRecord {
  ipHash: string;
  /** Decrypted raw IP; null if not stored or past raw-IP retention. Admin-only. */
  ipAddress: string | null;
  visits: number;
  sessions: number;
  clickIds: number;
  adSessions: number;
  firstAt: Date;
  lastAt: Date;
  campaigns: string[];
  hasLead: boolean;
  reasons: string[];
  status: TrafficStatus;
}

interface DetectionRow {
  ipHash: string;
  visits: number;
  sessions: number;
  clickIds: number;
  adSessions: number;
  firstAt: Date;
  lastAt: Date;
  campaigns: string[] | null;
  ipCipher: string | null;
  shortBurst: number;
  longBurst: number;
  clickBurst: number;
  hasLead: boolean;
  total: number;
}

function describeReasons(row: DetectionRow, rules: DetectionRules): string[] {
  const reasons: string[] = [];
  if (row.shortBurst >= rules.repeatVisits.minVisits) {
    reasons.push(
      `Repeated visits: ${row.shortBurst} visits within ${rules.repeatVisits.windowMinutes} min (threshold ${rules.repeatVisits.minVisits})`
    );
  }
  if (row.clickBurst >= rules.multipleClickIds.minClickIds) {
    reasons.push(
      `Multiple Google Ads click IDs: ${row.clickBurst} distinct IDs within ${rules.multipleClickIds.windowMinutes} min (threshold ${rules.multipleClickIds.minClickIds})`
    );
  }
  if (row.longBurst >= rules.highFrequency.minVisits) {
    reasons.push(
      `High-frequency activity: ${row.longBurst} visits within ${rules.highFrequency.windowMinutes} min (threshold ${rules.highFrequency.minVisits})`
    );
  }
  if (row.adSessions >= rules.nonConvertingAds.minAdSessions && !row.hasLead) {
    reasons.push(
      `Repeated non-converting ad visits: ${row.adSessions} Google Ads-attributed sessions with no recorded enquiry (threshold ${rules.nonConvertingAds.minAdSessions})`
    );
  }
  return reasons;
}

export async function detectSuspiciousTraffic(
  filters: TrafficFilters,
  options: {
    ipHashes?: string[];
    page?: number;
    pageSize?: number;
    sort?: SuspiciousSort;
    dir?: SortDirection;
  } = {}
): Promise<{ records: SuspiciousRecord[]; total: number }> {
  if (options.ipHashes && options.ipHashes.length === 0) {
    return { records: [], total: 0 };
  }

  const rules = getDetectionRules();
  const pageSize = options.pageSize ?? TRAFFIC_PAGE_SIZE;
  const offset = ((options.page ?? 1) - 1) * pageSize;
  const sortColumn: Record<SuspiciousSort, string> = {
    visits: `"visits"`,
    clickIds: `"clickIds"`,
    sessions: `"sessions"`,
    firstAt: `"firstAt"`,
    lastAt: `"lastAt"`,
  };
  const orderBy = Prisma.raw(
    `${sortColumn[options.sort ?? "lastAt"]} ${options.dir === "asc" ? "ASC" : "DESC"}, "ipHash" ASC`
  );

  const extra = [Prisma.sql`v."ipHash" IS NOT NULL`];
  if (options.ipHashes) {
    extra.push(Prisma.sql`v."ipHash" IN (${Prisma.join(options.ipHashes)})`);
  }

  const rows = await getDb().$queryRaw<DetectionRow[]>`
    WITH fv AS (
      SELECT v."ipHash", v."createdAt", v."sessionId", v."utmCampaign",
             ${CLICK_ID} AS click_id,
             ${encryptedIpColumn()} AS ip_cipher
      FROM "WebsiteVisit" v
      WHERE ${visitConditions(filters, extra)}
    ),
    bursts AS (
      SELECT "ipHash",
        max(short_count)::int AS "shortBurst",
        max(long_count)::int AS "longBurst"
      FROM (
        SELECT fv."ipHash",
          count(*) OVER (
            PARTITION BY fv."ipHash" ORDER BY fv."createdAt"
            RANGE BETWEEN CURRENT ROW AND ${interval(rules.repeatVisits.windowMinutes)} FOLLOWING
          ) AS short_count,
          count(*) OVER (
            PARTITION BY fv."ipHash" ORDER BY fv."createdAt"
            RANGE BETWEEN CURRENT ROW AND ${interval(rules.highFrequency.windowMinutes)} FOLLOWING
          ) AS long_count
        FROM fv
      ) windowed
      GROUP BY "ipHash"
    ),
    click_first AS (
      SELECT fv."ipHash", fv.click_id, min(fv."createdAt") AS first_at
      FROM fv
      WHERE fv.click_id IS NOT NULL
      GROUP BY fv."ipHash", fv.click_id
    ),
    click_bursts AS (
      SELECT "ipHash", max(click_count)::int AS "clickBurst"
      FROM (
        SELECT cf."ipHash",
          count(*) OVER (
            PARTITION BY cf."ipHash" ORDER BY cf.first_at
            RANGE BETWEEN CURRENT ROW AND ${interval(rules.multipleClickIds.windowMinutes)} FOLLOWING
          ) AS click_count
        FROM click_first cf
      ) windowed
      GROUP BY "ipHash"
    ),
    aggregated AS (
      SELECT fv."ipHash",
        count(*)::int AS "visits",
        count(DISTINCT fv."sessionId")::int AS "sessions",
        count(DISTINCT fv.click_id)::int AS "clickIds",
        (count(DISTINCT fv."sessionId") FILTER (WHERE fv.click_id IS NOT NULL))::int AS "adSessions",
        min(fv."createdAt") AS "firstAt",
        max(fv."createdAt") AS "lastAt",
        array_remove(array_agg(DISTINCT fv."utmCampaign"), NULL) AS "campaigns",
        (array_agg(fv.ip_cipher ORDER BY fv."createdAt" DESC)
          FILTER (WHERE fv.ip_cipher IS NOT NULL))[1] AS "ipCipher"
      FROM fv
      GROUP BY fv."ipHash"
    ),
    lead_ips AS (
      SELECT DISTINCT l."ipHash"
      FROM "WebsiteLead" l
      WHERE l."createdAt" >= ${filters.from} AND l."createdAt" < ${filters.to}
        AND l."ipHash" IS NOT NULL
    )
    SELECT a.*,
      b."shortBurst", b."longBurst",
      COALESCE(c."clickBurst", 0)::int AS "clickBurst",
      (li."ipHash" IS NOT NULL) AS "hasLead",
      (count(*) OVER ())::int AS "total"
    FROM aggregated a
    JOIN bursts b ON b."ipHash" = a."ipHash"
    LEFT JOIN click_bursts c ON c."ipHash" = a."ipHash"
    LEFT JOIN lead_ips li ON li."ipHash" = a."ipHash"
    WHERE b."shortBurst" >= ${rules.repeatVisits.minVisits}
       OR b."longBurst" >= ${rules.highFrequency.minVisits}
       OR COALESCE(c."clickBurst", 0) >= ${rules.multipleClickIds.minClickIds}
       OR (a."adSessions" >= ${rules.nonConvertingAds.minAdSessions} AND li."ipHash" IS NULL)
    ORDER BY ${orderBy}
    LIMIT ${pageSize} OFFSET ${offset}`;

  return {
    total: rows[0]?.total ?? 0,
    records: rows.map((row) => ({
      ipHash: row.ipHash,
      ipAddress: decryptIp(row.ipCipher),
      visits: row.visits,
      sessions: row.sessions,
      clickIds: row.clickIds,
      adSessions: row.adSessions,
      firstAt: row.firstAt,
      lastAt: row.lastAt,
      campaigns: row.campaigns ?? [],
      hasLead: row.hasLead,
      reasons: describeReasons(row, rules),
      status: "suspicious",
    })),
  };
}

export async function countSuspiciousTraffic(filters: TrafficFilters): Promise<number> {
  const { total } = await detectSuspiciousTraffic(filters, { pageSize: 1 });
  return total;
}

// ---------------------------------------------------------------------------
// IP address activity (all visitors, grouped by HMAC IP hash)
// ---------------------------------------------------------------------------

export const IP_GROUP_SORTS = ["visits", "lastAt", "firstAt"] as const;
export type IpGroupSort = (typeof IP_GROUP_SORTS)[number];

export interface IpGroupRecord {
  ipHash: string;
  /** Newest decrypted raw IP for this hash within raw-IP retention. Admin-only. */
  ipAddress: string | null;
  visits: number;
  sessions: number;
  firstAt: Date;
  lastAt: Date;
  enquiries: number;
  campaignGroups: CampaignKey[];
  campaigns: string[];
  suspicious: boolean;
}

interface IpGroupRow {
  ipHash: string;
  visits: number;
  sessions: number;
  firstAt: Date;
  lastAt: Date;
  enquiries: number;
  campaignGroups: CampaignKey[] | null;
  campaigns: string[] | null;
  ipCipher: string | null;
  total: number;
}

export async function listIpGroups(
  filters: TrafficFilters,
  options: { page: number; sort: IpGroupSort; dir: SortDirection; pageSize?: number }
): Promise<{ records: IpGroupRecord[]; total: number; visitsWithoutIpHash: number }> {
  const db = getDb();
  const pageSize = options.pageSize ?? TRAFFIC_PAGE_SIZE;
  const offset = (options.page - 1) * pageSize;
  const sortColumn: Record<IpGroupSort, string> = {
    visits: `"visits"`,
    lastAt: `"lastAt"`,
    firstAt: `"firstAt"`,
  };
  const orderBy = Prisma.raw(
    `${sortColumn[options.sort]} ${options.dir === "asc" ? "ASC" : "DESC"}, "ipHash" ASC`
  );

  const [rows, [unhashed]] = await Promise.all([
    db.$queryRaw<IpGroupRow[]>`
      WITH grouped AS (
        SELECT v."ipHash",
          count(*)::int AS "visits",
          count(DISTINCT v."sessionId")::int AS "sessions",
          min(v."createdAt") AS "firstAt",
          max(v."createdAt") AS "lastAt",
          array_agg(DISTINCT ${CAMPAIGN_CASE}) AS "campaignGroups",
          array_remove(array_agg(DISTINCT v."utmCampaign"), NULL) AS "campaigns"
        FROM "WebsiteVisit" v
        WHERE ${visitConditions(filters, [Prisma.sql`v."ipHash" IS NOT NULL`])}
        GROUP BY v."ipHash"
      ),
      enquiries AS (
        SELECT l."ipHash", count(*)::int AS "enquiries"
        FROM "WebsiteLead" l
        WHERE ${leadConditions(filters, [Prisma.sql`l."ipHash" IS NOT NULL`])}
        GROUP BY l."ipHash"
      ),
      page AS (
        SELECT g.*, COALESCE(e."enquiries", 0)::int AS "enquiries",
          (count(*) OVER ())::int AS "total"
        FROM grouped g
        LEFT JOIN enquiries e ON e."ipHash" = g."ipHash"
        ORDER BY ${orderBy}
        LIMIT ${pageSize} OFFSET ${offset}
      )
      SELECT p.*,
        (
          SELECT x."ipAddress" FROM "WebsiteVisit" x
          WHERE x."ipHash" = p."ipHash"
            AND x."ipAddress" IS NOT NULL
            AND x."createdAt" >= ${rawIpCutoff()}
          ORDER BY x."createdAt" DESC
          LIMIT 1
        ) AS "ipCipher"
      FROM page p
      ORDER BY ${orderBy}`,
    db.$queryRaw<{ count: number }[]>`
      SELECT count(*)::int AS count FROM "WebsiteVisit" v
      WHERE ${visitConditions(filters, [Prisma.sql`v."ipHash" IS NULL`])}`,
  ]);

  const { records: flagged } = await detectSuspiciousTraffic(filters, {
    ipHashes: rows.map((row) => row.ipHash),
    pageSize: Math.max(rows.length, 1),
  });
  const flaggedHashes = new Set(flagged.map((record) => record.ipHash));

  return {
    total: rows[0]?.total ?? 0,
    visitsWithoutIpHash: unhashed?.count ?? 0,
    records: rows.map((row) => ({
      ipHash: row.ipHash,
      ipAddress: decryptIp(row.ipCipher),
      visits: row.visits,
      sessions: row.sessions,
      firstAt: row.firstAt,
      lastAt: row.lastAt,
      enquiries: row.enquiries,
      campaignGroups: row.campaignGroups ?? [],
      campaigns: row.campaigns ?? [],
      suspicious: flaggedHashes.has(row.ipHash),
    })),
  };
}

// ---------------------------------------------------------------------------
// Visits table
// ---------------------------------------------------------------------------

export const VISIT_SORTS = [
  "createdAt",
  "websiteDomain",
  "pathname",
  "deviceType",
  "utmCampaign",
  "referrerDomain",
] as const;
export type VisitSort = (typeof VISIT_SORTS)[number];

export type LeadStatus = "lead" | "none" | "unknown";

export interface VisitRow {
  id: string;
  createdAt: Date;
  websiteDomain: string;
  ipHash: string | null;
  /** Decrypted raw IP; null if not stored or past raw-IP retention. Admin-only. */
  ipAddress: string | null;
  pathname: string;
  landingPage: string | null;
  referrerDomain: string | null;
  deviceType: string;
  browser: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  campaign: CampaignKey;
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  sessionId: string | null;
  leadStatus: LeadStatus;
  suspicious: boolean;
}

export async function listVisits(
  filters: TrafficFilters,
  options: {
    page: number;
    sort: VisitSort;
    dir: SortDirection;
    ipHash?: string;
    pageSize?: number;
  }
): Promise<{ rows: VisitRow[]; total: number }> {
  const db = getDb();
  const pageSize = options.pageSize ?? TRAFFIC_PAGE_SIZE;
  const offset = (options.page - 1) * pageSize;
  const extra = options.ipHash ? [Prisma.sql`v."ipHash" = ${options.ipHash}`] : [];
  const where = visitConditions(filters, extra);
  const orderBy = Prisma.raw(
    `v."${options.sort}" ${options.dir === "asc" ? "ASC" : "DESC"} NULLS LAST, v.id ASC`
  );

  const [rows, [count]] = await Promise.all([
    db.$queryRaw<(Omit<VisitRow, "suspicious" | "ipAddress"> & { ipCipher: string | null })[]>`
      SELECT v.id, v."createdAt", v."websiteDomain", v."ipHash",
        ${encryptedIpColumn()} AS "ipCipher",
        v.pathname,
        v."landingPage", v."referrerDomain", v."deviceType", v.browser,
        v."utmSource", v."utmMedium", v."utmCampaign", v.gclid, v.gbraid, v.wbraid,
        v."sessionId",
        ${CAMPAIGN_CASE} AS campaign,
        CASE
          WHEN v."sessionId" IS NULL THEN 'unknown'
          WHEN EXISTS (SELECT 1 FROM "WebsiteLead" l WHERE l."sessionId" = v."sessionId") THEN 'lead'
          ELSE 'none'
        END AS "leadStatus"
      FROM "WebsiteVisit" v
      WHERE ${where}
      ORDER BY ${orderBy}
      LIMIT ${pageSize} OFFSET ${offset}`,
    db.$queryRaw<{ total: number }[]>`
      SELECT count(*)::int AS total FROM "WebsiteVisit" v WHERE ${where}`,
  ]);

  const pageHashes = [
    ...new Set(rows.map((row) => row.ipHash).filter((hash): hash is string => !!hash)),
  ];
  const { records } = await detectSuspiciousTraffic(filters, {
    ipHashes: pageHashes,
    pageSize: Math.max(pageHashes.length, 1),
  });
  const flagged = new Set(records.map((record) => record.ipHash));

  return {
    total: count?.total ?? 0,
    rows: rows.map(({ ipCipher, ...row }) => ({
      ...row,
      ipAddress: decryptIp(ipCipher),
      suspicious: row.ipHash ? flagged.has(row.ipHash) : false,
    })),
  };
}

// ---------------------------------------------------------------------------
// IP hash detail
// ---------------------------------------------------------------------------

export interface IpHashDetail {
  /** Most recent decrypted raw IP within raw-IP retention (any date filter). Admin-only. */
  ipAddress: string | null;
  visits: number;
  sessions: number;
  clickIds: number;
  leads: number;
  firstAt: Date | null;
  lastAt: Date | null;
  avgGapSeconds: number | null;
  minGapSeconds: number | null;
  pages: { pathname: string; visits: number }[];
  campaigns: { campaign: string; visits: number; clickIds: number }[];
  devices: { deviceType: string; browser: string | null; visits: number }[];
  suspicious: SuspiciousRecord | null;
}

export async function getIpHashDetail(
  filters: TrafficFilters,
  ipHash: string
): Promise<IpHashDetail> {
  const db = getDb();
  const where = visitConditions(filters, [Prisma.sql`v."ipHash" = ${ipHash}`]);

  const [[stats], [leadCount], pages, campaigns, devices, suspicious, [latestIp]] =
    await Promise.all([
    db.$queryRaw<
      Omit<
        IpHashDetail,
        "leads" | "pages" | "campaigns" | "devices" | "suspicious" | "ipAddress"
      >[]
    >`
      WITH fv AS (
        SELECT v."createdAt", v."sessionId", ${CLICK_ID} AS click_id
        FROM "WebsiteVisit" v WHERE ${where}
      ),
      gaps AS (
        SELECT fv."createdAt" - lag(fv."createdAt") OVER (ORDER BY fv."createdAt") AS gap
        FROM fv
      )
      SELECT
        (SELECT count(*)::int FROM fv) AS "visits",
        (SELECT count(DISTINCT "sessionId")::int FROM fv) AS "sessions",
        (SELECT count(DISTINCT click_id)::int FROM fv) AS "clickIds",
        (SELECT min("createdAt") FROM fv) AS "firstAt",
        (SELECT max("createdAt") FROM fv) AS "lastAt",
        (SELECT EXTRACT(EPOCH FROM avg(gap))::float8 FROM gaps) AS "avgGapSeconds",
        (SELECT EXTRACT(EPOCH FROM min(gap))::float8 FROM gaps) AS "minGapSeconds"`,
    db.$queryRaw<{ leads: number }[]>`
      SELECT count(*)::int AS leads FROM "WebsiteLead" l
      WHERE ${leadConditions(filters, [Prisma.sql`l."ipHash" = ${ipHash}`])}`,
    db.$queryRaw<IpHashDetail["pages"]>`
      SELECT v.pathname, count(*)::int AS visits
      FROM "WebsiteVisit" v WHERE ${where}
      GROUP BY v.pathname ORDER BY visits DESC LIMIT 20`,
    db.$queryRaw<IpHashDetail["campaigns"]>`
      SELECT COALESCE(v."utmCampaign", '(none)') AS campaign,
        count(*)::int AS visits,
        count(DISTINCT ${CLICK_ID})::int AS "clickIds"
      FROM "WebsiteVisit" v WHERE ${where}
      GROUP BY 1 ORDER BY visits DESC LIMIT 20`,
    db.$queryRaw<IpHashDetail["devices"]>`
      SELECT v."deviceType", v.browser, count(*)::int AS visits
      FROM "WebsiteVisit" v WHERE ${where}
      GROUP BY 1, 2 ORDER BY visits DESC LIMIT 20`,
    detectSuspiciousTraffic(filters, { ipHashes: [ipHash], pageSize: 1 }),
    db.$queryRaw<{ ipCipher: string | null }[]>`
      SELECT v."ipAddress" AS "ipCipher"
      FROM "WebsiteVisit" v
      WHERE v."ipHash" = ${ipHash}
        AND v."ipAddress" IS NOT NULL
        AND v."createdAt" >= ${rawIpCutoff()}
      ORDER BY v."createdAt" DESC
      LIMIT 1`,
  ]);

  return {
    ipAddress: decryptIp(latestIp?.ipCipher),
    visits: stats?.visits ?? 0,
    sessions: stats?.sessions ?? 0,
    clickIds: stats?.clickIds ?? 0,
    firstAt: stats?.firstAt ?? null,
    lastAt: stats?.lastAt ?? null,
    avgGapSeconds: stats?.avgGapSeconds ?? null,
    minGapSeconds: stats?.minGapSeconds ?? null,
    leads: leadCount?.leads ?? 0,
    pages,
    campaigns,
    devices,
    suspicious: suspicious.records[0] ?? null,
  };
}
