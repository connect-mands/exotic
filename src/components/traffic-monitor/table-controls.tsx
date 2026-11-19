import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { buildQuery, type RawSearchParams, type SortDirection } from "@/lib/traffic/filters";
import { cn } from "@/lib/utils";

export function SortHeader({
  label,
  field,
  current,
  sortKey,
  pageKey,
  params,
  basePath,
}: {
  label: string;
  field: string;
  current: { sort: string; dir: SortDirection };
  sortKey: string;
  pageKey: string;
  params: RawSearchParams;
  basePath: string;
}) {
  const active = current.sort === field;
  const nextDir: SortDirection = active && current.dir === "desc" ? "asc" : "desc";
  const href = `${basePath}${buildQuery(params, {
    [sortKey]: `${field}.${nextDir}`,
    [pageKey]: undefined,
  })}`;

  return (
    <th scope="col" className="px-3 py-2 text-left font-medium whitespace-nowrap">
      <Link
        href={href}
        className={cn("inline-flex items-center gap-1 hover:text-foreground", active && "text-foreground")}
        aria-sort={active ? (current.dir === "asc" ? "ascending" : "descending") : undefined}
      >
        {label}
        <span aria-hidden className="text-xs">
          {active ? (current.dir === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </Link>
    </th>
  );
}

export function PlainHeader({ label }: { label: string }) {
  return (
    <th scope="col" className="px-3 py-2 text-left font-medium whitespace-nowrap">
      {label}
    </th>
  );
}

export function Pagination({
  page,
  pageSize,
  total,
  pageKey,
  params,
  basePath,
}: {
  page: number;
  pageSize: number;
  total: number;
  pageKey: string;
  params: RawSearchParams;
  basePath: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const href = (target: number) =>
    `${basePath}${buildQuery(params, { [pageKey]: target > 1 ? String(target) : undefined })}`;
  const linkClass = buttonVariants({ variant: "outline", size: "sm" });
  const disabledClass = cn(linkClass, "pointer-events-none opacity-50");

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 text-sm text-muted-foreground">
      <span>
        Page {Math.min(page, totalPages)} of {totalPages} · {total.toLocaleString("en-IN")} records
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className={linkClass}>
            Previous
          </Link>
        ) : (
          <span className={disabledClass}>Previous</span>
        )}
        {page < totalPages ? (
          <Link href={href(page + 1)} className={linkClass}>
            Next
          </Link>
        ) : (
          <span className={disabledClass}>Next</span>
        )}
      </div>
    </div>
  );
}
