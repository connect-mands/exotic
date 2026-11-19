import Link from "next/link";
import { CAMPAIGN_LABELS, TRAFFIC_DASHBOARD_PATH } from "@/config/traffic-monitor";
import { TrafficStatusBadge } from "@/components/traffic-monitor/badges";
import { formatDateTime, formatNumber, maskValue } from "@/components/traffic-monitor/format";
import { RawIp } from "@/components/traffic-monitor/raw-ip";
import {
  Pagination,
  PlainHeader,
  SortHeader,
} from "@/components/traffic-monitor/table-controls";
import { buildQuery, type RawSearchParams, type SortDirection } from "@/lib/traffic/filters";
import type { IpGroupRecord, IpGroupSort } from "@/lib/traffic/reports";

const MAX_CAMPAIGNS_SHOWN = 3;

export function IpActivityTable({
  records,
  total,
  page,
  pageSize,
  sort,
  params,
  basePath,
}: {
  records: IpGroupRecord[];
  total: number;
  page: number;
  pageSize: number;
  sort: { sort: IpGroupSort; dir: SortDirection };
  params: RawSearchParams;
  basePath: string;
}) {
  const headerProps = { current: sort, sortKey: "isort", pageKey: "ipage", params, basePath };
  const detailQuery = buildQuery(params, {
    vsort: undefined,
    vpage: undefined,
    ssort: undefined,
    spage: undefined,
    isort: undefined,
    ipage: undefined,
  });

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <PlainHeader label="Real IP" />
              <PlainHeader label="IP hash" />
              <SortHeader label="Visits" field="visits" {...headerProps} />
              <PlainHeader label="Sessions" />
              <SortHeader label="First visit" field="firstAt" {...headerProps} />
              <SortHeader label="Last visit" field="lastAt" {...headerProps} />
              <PlainHeader label="Enquiries" />
              <PlainHeader label="Campaigns" />
              <PlainHeader label="Activity" />
              <PlainHeader label="" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {records.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-3 py-6 text-center text-muted-foreground">
                  No visits with an IP hash for these filters.
                </td>
              </tr>
            ) : (
              records.map((record) => {
                const href = `${TRAFFIC_DASHBOARD_PATH}/ip/${record.ipHash}${detailQuery}`;
                const extraCampaigns = record.campaigns.length - MAX_CAMPAIGNS_SHOWN;
                return (
                  <tr key={record.ipHash} className="align-top hover:bg-muted/30">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <Link href={href} className="hover:underline">
                        <RawIp ip={record.ipAddress} seenAt={record.lastAt} />
                      </Link>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">
                      <Link href={href} className="text-primary underline-offset-4 hover:underline">
                        {maskValue(record.ipHash)}
                      </Link>
                    </td>
                    <td className="px-3 py-2 font-semibold tabular-nums">
                      {formatNumber(record.visits)}
                    </td>
                    <td className="px-3 py-2 tabular-nums">{formatNumber(record.sessions)}</td>
                    <td className="px-3 py-2 whitespace-nowrap tabular-nums">
                      {formatDateTime(record.firstAt)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap tabular-nums">
                      {formatDateTime(record.lastAt)}
                    </td>
                    <td className="px-3 py-2 tabular-nums">{formatNumber(record.enquiries)}</td>
                    <td className="max-w-[14rem] px-3 py-2">
                      <span className="block">
                        {record.campaignGroups.map((key) => CAMPAIGN_LABELS[key]).join(", ")}
                      </span>
                      {record.campaigns.length ? (
                        <span className="block text-xs break-all text-muted-foreground">
                          {record.campaigns.slice(0, MAX_CAMPAIGNS_SHOWN).join(", ")}
                          {extraCampaigns > 0 ? ` +${extraCampaigns} more` : ""}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">
                      <TrafficStatusBadge status={record.suspicious ? "suspicious" : "normal"} />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <Link href={href} className="text-primary underline-offset-4 hover:underline">
                        View details →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        pageKey="ipage"
        params={params}
        basePath={basePath}
      />
    </>
  );
}
