import { TRAFFIC_DASHBOARD_PATH, TRAFFIC_PAGE_SIZE } from "@/config/traffic-monitor";
import { EmailStatusBadge } from "@/components/traffic-monitor/badges";
import { DashboardShell, Notice, Section } from "@/components/traffic-monitor/dashboard-shell";
import { EnquiryFilterBar } from "@/components/traffic-monitor/enquiry-filter-bar";
import { formatDateTime, formatNumber, timezoneLabel } from "@/components/traffic-monitor/format";
import { Pagination, PlainHeader } from "@/components/traffic-monitor/table-controls";
import { isDatabaseConfigured } from "@/lib/db";
import { listEnquiries } from "@/lib/enquiries/list-enquiries";
import { requireAdminPage } from "@/lib/traffic/admin-auth";
import {
  firstParam,
  parsePage,
  parseTrafficFilters,
  type RawSearchParams,
} from "@/lib/traffic/filters";

export const metadata = { title: "Enquiries" };

const ALL_TIME = { from: new Date(0), to: new Date(8.64e15) };

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  await requireAdminPage();

  const title = "Enquiries";
  if (!isDatabaseConfigured()) {
    return (
      <DashboardShell title={title} active="enquiries">
        <Notice tone="warning">DATABASE_URL is not configured.</Notice>
      </DashboardShell>
    );
  }

  const params = await searchParams;
  const basePath = `${TRAFFIC_DASHBOARD_PATH}/enquiries`;
  const range = firstParam(params, "range") ?? "all";
  const filters = parseTrafficFilters(params);
  const effectiveRange = range === "all" ? "all" : filters.range;
  const period = effectiveRange === "all" ? ALL_TIME : filters;
  const search = (firstParam(params, "q") ?? "").slice(0, 100);
  const page = parsePage(params, "page");

  let data;
  try {
    data = await listEnquiries(period, { page, search });
  } catch (error) {
    console.error("[enquiries] Query failed", error);
  }

  const description = (
    <>
      Enquiries submitted through the website form after WhatsApp verification. Saved even if the
      notification email fails. Contains personal data — share only with staff who need it.
    </>
  );

  return (
    <DashboardShell title={title} description={description} active="enquiries">
      <EnquiryFilterBar
        action={basePath}
        range={effectiveRange}
        fromInput={filters.fromInput}
        toInput={filters.toInput}
        search={search}
        timezone={timezoneLabel()}
      />

      {!data ? (
        <Notice tone="error">
          Could not load enquiries. Check the database connection and that all migrations have
          been applied.
        </Notice>
      ) : (
        <Section title={`${formatNumber(data.total)} enquir${data.total === 1 ? "y" : "ies"}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <PlainHeader label="Received" />
                  <PlainHeader label="Name" />
                  <PlainHeader label="Mobile" />
                  <PlainHeader label="Email" />
                  <PlainHeader label="City" />
                  <PlainHeader label="Persons" />
                  <PlainHeader label="Package" />
                  <PlainHeader label="Flight/train booked" />
                  <PlainHeader label="Email status" />
                  <PlainHeader label="Website" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.rows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-3 py-8 text-center text-muted-foreground">
                      No enquiries for these filters.
                    </td>
                  </tr>
                ) : (
                  data.rows.map((row) => (
                    <tr key={row.id} className="align-top">
                      <td className="px-3 py-2 whitespace-nowrap tabular-nums">
                        {formatDateTime(row.createdAt)}
                      </td>
                      <td className="px-3 py-2 font-medium">{row.fullName}</td>
                      <td className="px-3 py-2 whitespace-nowrap tabular-nums">
                        <a href={`tel:+91${row.mobile}`} className="text-primary hover:underline">
                          {row.mobile}
                        </a>
                        <a
                          href={`https://wa.me/91${row.mobile}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs text-muted-foreground hover:underline"
                        >
                          WhatsApp
                        </a>
                      </td>
                      <td className="px-3 py-2 break-all">
                        {row.email ? (
                          <a href={`mailto:${row.email}`} className="text-primary hover:underline">
                            {row.email}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">{row.city}</td>
                      <td className="px-3 py-2 tabular-nums">{row.persons}</td>
                      <td className="max-w-[16rem] px-3 py-2">
                        {row.packageName ?? row.packageId}
                        {row.packageName ? (
                          <span className="block text-xs text-muted-foreground">{row.packageId}</span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2">{row.flightBooked ? "Yes" : "No"}</td>
                      <td className="px-3 py-2">
                        <EmailStatusBadge status={row.emailStatus} />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">{row.websiteDomain}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            pageSize={TRAFFIC_PAGE_SIZE}
            total={data.total}
            pageKey="page"
            params={params}
            basePath={basePath}
          />
        </Section>
      )}
    </DashboardShell>
  );
}
