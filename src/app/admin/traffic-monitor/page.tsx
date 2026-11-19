import Link from "next/link";
import {
  CAMPAIGN_LABELS,
  TRAFFIC_DASHBOARD_PATH,
  TRAFFIC_PAGE_SIZE,
  getDetectionRules,
  getTrafficSettings,
} from "@/config/traffic-monitor";
import { TrafficStatusBadge } from "@/components/traffic-monitor/badges";
import {
  DashboardShell,
  Notice,
  Section,
  StatCard,
} from "@/components/traffic-monitor/dashboard-shell";
import { FilterBar } from "@/components/traffic-monitor/filter-bar";
import { IpActivityTable } from "@/components/traffic-monitor/ip-activity-table";
import { RawIp } from "@/components/traffic-monitor/raw-ip";
import {
  formatDateTime,
  formatNumber,
  maskValue,
  timezoneLabel,
} from "@/components/traffic-monitor/format";
import {
  Pagination,
  PlainHeader,
  SortHeader,
} from "@/components/traffic-monitor/table-controls";
import { VisitsTable } from "@/components/traffic-monitor/visits-table";
import { isDatabaseConfigured } from "@/lib/db";
import { requireAdminPage } from "@/lib/traffic/admin-auth";
import {
  buildQuery,
  parsePage,
  parseSort,
  parseTrafficFilters,
  type RawSearchParams,
} from "@/lib/traffic/filters";
import { isHashSecretConfigured } from "@/lib/traffic/ip";
import { isIpEncryptionConfigured, isRawIpStorageActive } from "@/lib/traffic/ip-crypto";
import {
  IP_GROUP_SORTS,
  SUSPICIOUS_SORTS,
  VISIT_SORTS,
  detectSuspiciousTraffic,
  getCampaignBreakdown,
  getTrafficSummary,
  listIpGroups,
  listVisits,
} from "@/lib/traffic/reports";

export const metadata = { title: "Traffic monitor" };

export default async function TrafficMonitorPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  await requireAdminPage();

  if (!isDatabaseConfigured()) {
    return (
      <DashboardShell title="Traffic monitor">
        <Notice tone="warning">
          DATABASE_URL is not configured. Visit tracking and this dashboard are disabled until a
          PostgreSQL database is connected and migrations are applied.
        </Notice>
      </DashboardShell>
    );
  }

  const params = await searchParams;
  const filters = parseTrafficFilters(params);
  const visitPage = parsePage(params, "vpage");
  const suspiciousPage = parsePage(params, "spage");
  const visitSort = parseSort(params, "vsort", VISIT_SORTS, "createdAt");
  const suspiciousSort = parseSort(params, "ssort", SUSPICIOUS_SORTS, "lastAt");
  const ipGroupPage = parsePage(params, "ipage");
  const ipGroupSort = parseSort(params, "isort", IP_GROUP_SORTS, "visits");
  const rules = getDetectionRules();
  const settings = getTrafficSettings();
  const basePath = TRAFFIC_DASHBOARD_PATH;

  let data;
  try {
    const [summary, breakdown, ipGroups, suspicious, visits] = await Promise.all([
      getTrafficSummary(filters),
      getCampaignBreakdown(filters),
      listIpGroups(filters, { page: ipGroupPage, sort: ipGroupSort.sort, dir: ipGroupSort.dir }),
      detectSuspiciousTraffic(filters, {
        page: suspiciousPage,
        sort: suspiciousSort.sort,
        dir: suspiciousSort.dir,
      }),
      listVisits(filters, { page: visitPage, sort: visitSort.sort, dir: visitSort.dir }),
    ]);
    data = { summary, breakdown, ipGroups, suspicious, visits };
  } catch (error) {
    console.error("[traffic] Dashboard query failed", error);
  }

  const description = (
    <>
      Investigation tool only. Signals below are heuristics — they do not prove invalid clicks or
      identify competitors, and one IP can be shared by many people (offices, mobile carriers).
    </>
  );

  if (!data) {
    return (
      <DashboardShell title="Traffic monitor" description={description}>
        <FilterBar action={basePath} filters={filters} timezone={timezoneLabel()} />
        <Notice tone="error">
          Could not load traffic data. Check the database connection and that migrations have been
          applied.
        </Notice>
      </DashboardShell>
    );
  }

  const { summary, breakdown, ipGroups, suspicious, visits } = data;
  const suspiciousHeader = {
    current: suspiciousSort,
    sortKey: "ssort",
    pageKey: "spage",
    params,
    basePath,
  };
  const detailQuery = buildQuery(params, {
    vsort: undefined,
    vpage: undefined,
    ssort: undefined,
    spage: undefined,
    isort: undefined,
    ipage: undefined,
  });

  return (
    <DashboardShell title="Traffic monitor" description={description}>
      {!isHashSecretConfigured() ? (
        <Notice tone="warning">
          TRAFFIC_IP_HASH_SECRET is missing or shorter than 32 characters, so new visits are not
          being recorded.
        </Notice>
      ) : null}
      {settings.storeRawIp && !isIpEncryptionConfigured() ? (
        <Notice tone="warning">
          TRAFFIC_STORE_RAW_IP is enabled but TRAFFIC_IP_ENCRYPTION_KEY is missing or invalid (32
          bytes, base64), so real IPs are not being stored.
        </Notice>
      ) : null}

      <FilterBar action={basePath} filters={filters} timezone={timezoneLabel()} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <StatCard label="Total visits" value={formatNumber(summary.totalVisits)} />
        <StatCard label="Unique IP hashes" value={formatNumber(summary.uniqueIpHashes)} />
        <StatCard
          label="Repeat visitors"
          value={formatNumber(summary.repeatVisitors)}
          hint="IP hashes with 2+ sessions"
        />
        <StatCard
          label="Google Ads visits"
          value={formatNumber(summary.adsVisits)}
          hint="Page loads with a click ID"
        />
        <StatCard label="Distinct GCLIDs" value={formatNumber(summary.distinctGclids)} />
        <StatCard label="Recorded enquiries" value={formatNumber(summary.recordedEnquiries)} />
        <StatCard
          label="Suspicious records"
          value={formatNumber(suspicious.total)}
          hint="IP hashes to review"
        />
      </div>

      <Section
        title="Campaign activity"
        description="Grouped by utm_campaign. Visits without a recognised campaign are counted as Other / Unknown."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <PlainHeader label="Campaign" />
                <PlainHeader label="Visits" />
                <PlainHeader label="Google Ads visits" />
                <PlainHeader label="Distinct click IDs" />
                <PlainHeader label="Sessions" />
                <PlainHeader label="Unique IP hashes" />
                <PlainHeader label="Enquiries" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {breakdown.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                    No campaign activity for these filters.
                  </td>
                </tr>
              ) : (
                breakdown.map((row) => (
                  <tr key={row.campaign} className="tabular-nums">
                    <td className="px-3 py-2 font-medium">{CAMPAIGN_LABELS[row.campaign]}</td>
                    <td className="px-3 py-2">{formatNumber(row.visits)}</td>
                    <td className="px-3 py-2">{formatNumber(row.adsVisits)}</td>
                    <td className="px-3 py-2">{formatNumber(row.distinctClickIds)}</td>
                    <td className="px-3 py-2">{formatNumber(row.sessions)}</td>
                    <td className="px-3 py-2">{formatNumber(row.uniqueIpHashes)}</td>
                    <td className="px-3 py-2">{formatNumber(row.leads)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="IP Address Activity"
        description={
          <>
            Every visitor network in the selected range, grouped by hashed IP — whether or not it
            is suspicious. Click an IP, hash or &ldquo;View details&rdquo; to see its full visit history.
            One IP can be shared by many people.
            {ipGroups.visitsWithoutIpHash > 0
              ? ` ${formatNumber(ipGroups.visitsWithoutIpHash)} visit(s) without an IP hash are not included.`
              : ""}
          </>
        }
      >
        <IpActivityTable
          records={ipGroups.records}
          total={ipGroups.total}
          page={ipGroupPage}
          pageSize={TRAFFIC_PAGE_SIZE}
          sort={ipGroupSort}
          params={params}
          basePath={basePath}
        />
      </Section>

      <Section
        title="Suspicious traffic"
        description={
          <>
            Flagged when an IP hash has {rules.repeatVisits.minVisits}+ visits within{" "}
            {rules.repeatVisits.windowMinutes} min, {rules.multipleClickIds.minClickIds}+ distinct
            click IDs within {rules.multipleClickIds.windowMinutes} min,{" "}
            {rules.highFrequency.minVisits}+ visits within {rules.highFrequency.windowMinutes} min,
            or {rules.nonConvertingAds.minAdSessions}+ Google Ads sessions without a recorded
            enquiry. Nothing is blocked automatically.
          </>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <PlainHeader label="Real IP" />
                <PlainHeader label="IP hash" />
                <SortHeader label="Visits" field="visits" {...suspiciousHeader} />
                <SortHeader label="Sessions" field="sessions" {...suspiciousHeader} />
                <SortHeader label="Distinct click IDs" field="clickIds" {...suspiciousHeader} />
                <SortHeader label="First visit" field="firstAt" {...suspiciousHeader} />
                <SortHeader label="Last visit" field="lastAt" {...suspiciousHeader} />
                <PlainHeader label="Campaigns" />
                <PlainHeader label="Detection reason" />
                <PlainHeader label="Status" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {suspicious.records.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 py-6 text-center text-muted-foreground">
                    No activity matched the review thresholds for these filters.
                  </td>
                </tr>
              ) : (
                suspicious.records.map((record) => (
                  <tr key={record.ipHash} className="align-top">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <RawIp ip={record.ipAddress} seenAt={record.lastAt} />
                    </td>
                    <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">
                      <Link
                        href={`${basePath}/ip/${record.ipHash}${detailQuery}`}
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {maskValue(record.ipHash)}
                      </Link>
                    </td>
                    <td className="px-3 py-2 tabular-nums">{formatNumber(record.visits)}</td>
                    <td className="px-3 py-2 tabular-nums">{formatNumber(record.sessions)}</td>
                    <td className="px-3 py-2 tabular-nums">{formatNumber(record.clickIds)}</td>
                    <td className="px-3 py-2 whitespace-nowrap tabular-nums">
                      {formatDateTime(record.firstAt)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap tabular-nums">
                      {formatDateTime(record.lastAt)}
                    </td>
                    <td className="max-w-[12rem] px-3 py-2 text-xs break-all">
                      {record.campaigns.length ? record.campaigns.join(", ") : "—"}
                    </td>
                    <td className="min-w-[18rem] px-3 py-2">
                      <ul className="grid gap-1 text-xs">
                        {record.reasons.map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-3 py-2">
                      <TrafficStatusBadge status={record.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={suspiciousPage}
          pageSize={TRAFFIC_PAGE_SIZE}
          total={suspicious.total}
          pageKey="spage"
          params={params}
          basePath={basePath}
        />
      </Section>

      <Section
        title="Visits"
        description="A visit is a page load seen by this website. It is not the same as a billed Google Ads click."
      >
        <VisitsTable
          rows={visits.rows}
          total={visits.total}
          page={visitPage}
          pageSize={TRAFFIC_PAGE_SIZE}
          sort={visitSort}
          params={params}
          basePath={basePath}
        />
      </Section>

      <p className="text-xs text-muted-foreground">
        Visit data is retained for {settings.retentionDays} days with IPs as keyed HMAC-SHA256
        hashes.{" "}
        {isRawIpStorageActive()
          ? `Real IPs are stored encrypted and shown only to signed-in admins for ${settings.rawIpRetentionDays} days, then deleted.`
          : "Real IP storage is off."}{" "}
        The &ldquo;Google-confirmed invalid&rdquo; status is only used with imported Google Ads
        invalid-activity data, which is not connected.
      </p>
    </DashboardShell>
  );
}
