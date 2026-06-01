import { headers } from "next/headers";
import { getDestinationBySlug } from "@/config/destinations";
import { resolveSlugFromHost } from "@/lib/request-host";
import type { DestinationConfig } from "@/types/destination";

/** Resolves active destination from domain or NEXT_PUBLIC_DESTINATION */
export async function getDestinationConfig(): Promise<DestinationConfig> {
  const envSlug = process.env.NEXT_PUBLIC_DESTINATION;
  if (envSlug) {
    return getDestinationBySlug(envSlug);
  }

  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "";
  const slugFromHost = resolveSlugFromHost(host);
  return getDestinationBySlug(slugFromHost);
}
