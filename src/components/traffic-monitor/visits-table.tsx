import Link from "next/link";
import { CAMPAIGN_LABELS, TRAFFIC_DASHBOARD_PATH } from "@/config/traffic-monitor";
import { LeadStatusBadge, TrafficStatusBadge } from "@/components/traffic-monitor/badges";
import { formatDateTime, maskValue } from "@/components/traffic-monitor/format";
import { RawIp } from "@/components/traffic-monitor/raw-ip";
import {
  Pagination,
  PlainHeader,
  SortHeader,
} from "@/components/traffic-monitor/table-controls";
import { buildQuery, type RawSearchParams, type SortDirection } from "@/lib/traffic/filters";
import type { VisitRow, VisitSort } from "@/lib/traffic/reports";

export function VisitsTable({
  rows,
  total,
  page,
  pageSize,
  sort,
  params,
  basePath,
  linkIpHashes = true,
}: {
  rows: VisitRow[];
  total: number;
  page: number;
  pageSize: number;
  sort: { sort: VisitSort; dir: SortDirection };
  params: RawSearchParams;
  basePath: string;
  linkIpHashes?: boolean;
}) {
  const headerProps = { current: sort, sortKey: "vsort", pageKey: "vpage", params, basePath };
  const detailQuery = buildQuery(params, {
    vsort: undefined,
    vpage: undefined,
    ssort: undefined,
    spage: undefined,
  });

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <SortHeader label="Timestamp" field="createdAt" {...headerProps} />
              <SortHeader label="Website" field="websiteDomain" {...headerProps} />
              <PlainHeader label="Real IP" />
              <PlainHeader label="IP hash" />
              <SortHeader label="Page" field="pathname" {...headerProps} />
              <SortHeader label="Referrer" field="referrerDomain" {...headerProps} />
              <SortHeader label="Device" field="deviceType" {...headerProps} />
              <SortHeader label="Campaign" field="utmCampaign" {...headerProps} />
              <PlainHeader label="GCLID / click ID" />
              <PlainHeader label="Session" />
              <PlainHeader label="Lead status" />
              <PlainHeader label="Activity" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-3 py-8 text-center text-muted-foreground">
                  No visits recorded for these filters.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const clickId = row.gclid ?? row.gbraid ?? row.wbraid;
                const clickType = row.gclid ? "gclid" : row.gbraid ? "gbraid" : row.wbraid ? "wbraid" : null;
                return (
                  <tr key={row.id} className="align-top">
                    <td className="px-3 py-2 whitespace-nowrap tabular-nums">
                      {formatDateTime(row.createdAt)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{row.websiteDomain}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <RawIp ip={row.ipAddress} seenAt={row.createdAt} />
                    </td>
                    <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">
                      {row.ipHash && linkIpHashes ? (
                        <Link
                          href={`${TRAFFIC_DASHBOARD_PATH}/ip/${row.ipHash}${detailQuery}`}
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {maskValue(row.ipHash)}
                        </Link>
                      ) : (
                        maskValue(row.ipHash)
                      )}
                    </td>
                    <td className="max-w-[16rem] px-3 py-2">
                      <span className="break-all">{row.pathname}</span>
                      {row.landingPage && row.landingPage !== row.pathname ? (
                        <span className="block text-xs text-muted-foreground">
                          Landing: {row.landingPage}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{row.referrerDomain ?? "Direct / none"}</td>
                    <td className="px-3 py-2 whitespace-nowrap capitalize">
                      {row.deviceType}
                      {row.browser ? (
                        <span className="block text-xs text-muted-foreground normal-case">{row.browser}</span>
                      ) : null}
                    </td>
                    <td className="max-w-[14rem] px-3 py-2">
                      <span className="block">{CAMPAIGN_LABELS[row.campaign]}</span>
                      {row.utmCampaign || row.utmSource ? (
                        <span className="block text-xs break-all text-muted-foreground">
                          {[row.utmSource, row.utmMedium, row.utmCampaign].filter(Boolean).join(" / ")}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">
                      {clickId ? (
                        <>
                          {maskValue(clickId)}
                          <span className="block font-sans text-muted-foreground">{clickType}</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">
                      {maskValue(row.sessionId, 4, 4)}
                    </td>
                    <td className="px-3 py-2">
                      <LeadStatusBadge status={row.leadStatus} />
                    </td>
                    <td className="px-3 py-2">
                      <TrafficStatusBadge status={row.suspicious ? "suspicious" : "normal"} />
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
        pageKey="vpage"
        params={params}
        basePath={basePath}
      />
    </>
  );
}
