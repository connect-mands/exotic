import { TRAFFIC_PAGE_SIZE } from "@/config/traffic-monitor";
import type { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/db";
import type { TrafficFilters } from "@/lib/traffic/filters";

export interface EnquiryRow {
  id: string;
  createdAt: Date;
  websiteDomain: string;
  fullName: string;
  email: string | null;
  mobile: string;
  city: string;
  persons: number;
  destination: string;
  packageId: string;
  packageName: string | null;
  flightBooked: boolean;
  emailStatus: string;
}

/** Admin-only. Callers must run requireAdminPage() first. */
export async function listEnquiries(
  filters: Pick<TrafficFilters, "from" | "to">,
  options: { page: number; search?: string; pageSize?: number }
): Promise<{ rows: EnquiryRow[]; total: number }> {
  const pageSize = options.pageSize ?? TRAFFIC_PAGE_SIZE;
  const search = options.search?.trim().slice(0, 100);

  const where: Prisma.EnquiryWhereInput = {
    createdAt: { gte: filters.from, lt: filters.to },
    ...(search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { mobile: { contains: search.replace(/\D/g, "") || search } },
            { city: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const db = getDb();
  const [rows, total] = await Promise.all([
    db.enquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (options.page - 1) * pageSize,
      take: pageSize,
    }),
    db.enquiry.count({ where }),
  ]);

  return { rows, total };
}
