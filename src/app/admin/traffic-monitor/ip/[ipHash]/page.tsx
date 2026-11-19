import Link from "next/link";
import { notFound } from "next/navigation";
import { TRAFFIC_DASHBOARD_PATH, TRAFFIC_PAGE_SIZE } from "@/config/traffic-monitor";
import { TrafficStatusBadge } from "@/components/traffic-monitor/badges";
import {
  DashboardShell,
  Notice,
  Section,
  StatCard,
} from "@/components/traffic-monitor/dashboard-shell";
import { FilterBar } from "@/components/traffic-monitor/filter-bar";
import { RawIp } from "@/components/traffic-monitor/raw-ip";
import {
  formatDateTime,
  formatDuration,
  formatNumber,
  maskValue,
  timezoneLabel,
} from "@/components/traffic-monitor/format";
import { PlainHeader } from "@/components/traffic-monitor/table-controls";
import { VisitsTable } from "@/components/traffic-monitor/visits-table";
import { buttonVariants } from "@/components/ui/button";
import { isDatabaseConfigured } from "@/lib/db";
import { requireAdminPage } from "@/lib/traffic/admin-auth";
import {
  buildQuery,
  parsePage,
  parseSort,
  parseTrafficFilters,
  type RawSearchParams,
} from "@/lib/traffic/filters";
import { VISIT_SORTS, getIpHashDetail, listVisits } from "@/lib/traffic/reports";

export const metadata = { title: "IP hash detail" };

const IP_HASH_PATTERN = /^[a-f0-9]{64}$/;

export default async function IpHashDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ ipHash: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  await requireAdminPage();

  const { ipHash } = await params;
  if (!IP_HASH_PATTERN.test(ipHash)) notFound();

  const query = await searchParams;
  const filters = parseTrafficFilters(query);
  const visitPage = parsePage(query, "vpage");
  const visitSort = parseSort(query, "vsort", VISIT_SORTS, "createdAt");
  const basePath = `${TRAFFIC_DASHBOARD_PATH}/ip/${ipHash}`;
  const backHref = `${TRAFFIC_DASHBOARD_PATH}${buildQuery(query, { vsort: undefined, vpage: undefined })}`;
  const title = `IP hash ${maskValue(ipHash)}`;
  const description = (
    <>
      Visit history for one hashed public IP. The same IP can be shared by many people, and one
      person can use many IPs.
    </>
  );

  if (!isDatabaseConfigured()) {
    return (
      <DashboardShell title={title}>
        <Notice tone="warning">DATABASE_URL is not configured.</Notice>
      </DashboardShell>
    );
  }

  let data;
  try {
    const [detail, visits] = await Promise.all([
      getIpHashDetail(filters, ipHash),
      listVisits(filters, {
        page: visitPage,
        sort: visitSort.sort,
        dir: visitSort.dir,
        ipHash,
      }),
    ]);
    data = { detail, visits };
  } catch (error) {
    console.error("[traffic] IP detail query failed", error);
  }

  return (
    <DashboardShell title={title} description={description}>
      <div>
        <Link href={backHref} className={buttonVariants({ variant: "outline", size: "sm" })}>
          ← Back to dashboard
        </Link>
      </div>

      <FilterBar action={basePath} filters={filters} timezone={timezoneLabel()} />

      {!data ? (
        <Notice tone="error">Could not load data for this IP hash.</Notice>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Real IP:</span>
              <RawIp ip={data.detail.ipAddress} seenAt={data.detail.lastAt} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Status:</span>
              <TrafficStatusBadge status={data.detail.suspicious ? "suspicious" : "normal"} />
            </div>
          </div>

          {data.detail.suspicious ? (
            <Notice tone="warning">
              <ul className="grid gap-1">
                {data.detail.suspicious.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </Notice>
          ) : null}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Visits" value={formatNumber(data.detail.visits)} />
            <StatCard label="Sessions" value={formatNumber(data.detail.sessions)} />
            <StatCard label="Distinct click IDs" value={formatNumber(data.detail.clickIds)} />
            <StatCard label="Recorded enquiries" value={formatNumber(data.detail.leads)} />
            <StatCard label="First visit" value={formatDateTime(data.detail.firstAt)} />
            <StatCard label="Last visit" value={formatDateTime(data.detail.lastAt)} />
            <StatCard
              label="Avg time between visits"
              value={formatDuration(data.detail.avgGapSeconds)}
            />
            <StatCard
              label="Shortest gap"
              value={formatDuration(data.detail.minGapSeconds)}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Section title="Pages visited">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <PlainHeader label="Page" />
                    <PlainHeader label="Visits" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.detail.pages.map((row) => (
                    <tr key={row.pathname}>
                      <td className="px-3 py-2 break-all">{row.pathname}</td>
                      <td className="px-3 py-2 tabular-nums">{formatNumber(row.visits)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
            <Section title="Campaigns">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <PlainHeader label="utm_campaign" />
                    <PlainHeader label="Visits" />
                    <PlainHeader label="Click IDs" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.detail.campaigns.map((row) => (
                    <tr key={row.campaign}>
                      <td className="px-3 py-2 break-all">{row.campaign}</td>
                      <td className="px-3 py-2 tabular-nums">{formatNumber(row.visits)}</td>
                      <td className="px-3 py-2 tabular-nums">{formatNumber(row.clickIds)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
            <Section title="Devices">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <PlainHeader label="Device" />
                    <PlainHeader label="Browser" />
                    <PlainHeader label="Visits" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.detail.devices.map((row) => (
                    <tr key={`${row.deviceType}-${row.browser ?? "unknown"}`}>
                      <td className="px-3 py-2 capitalize">{row.deviceType}</td>
                      <td className="px-3 py-2">{row.browser ?? "—"}</td>
                      <td className="px-3 py-2 tabular-nums">{formatNumber(row.visits)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          </div>

          <Section title="Visit history">
            <VisitsTable
              rows={data.visits.rows}
              total={data.visits.total}
              page={visitPage}
              pageSize={TRAFFIC_PAGE_SIZE}
              sort={visitSort}
              params={query}
              basePath={basePath}
              linkIpHashes={false}
            />
          </Section>
        </>
      )}
    </DashboardShell>
  );
}
