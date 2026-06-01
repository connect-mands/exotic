import { domainToSlug } from "@/config/destinations";

export function normalizeHostname(host: string): string {
  return host.split(":")[0]?.toLowerCase() ?? "";
}

export function getHostFromRequest(request: Request): string {
  return (
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    ""
  );
}

export function getSourceDomain(host: string): string {
  const hostname = normalizeHostname(host);
  if (!hostname) return "unknown";
  return hostname;
}

export function resolveSlugFromHost(host: string): string | undefined {
  const hostname = normalizeHostname(host);
  if (domainToSlug[hostname]) {
    return domainToSlug[hostname];
  }
  for (const [domain, slug] of Object.entries(domainToSlug)) {
    if (hostname.endsWith(domain)) {
      return slug;
    }
  }
  return undefined;
}
