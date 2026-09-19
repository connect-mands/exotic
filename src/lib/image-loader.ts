import type { ImageLoaderProps } from "next/image";

/**
 * Serve Unsplash from its CDN. Netlify's /_next/image optimizer fetches
 * remotely on the server, and Unsplash often blocks those datacenter IPs —
 * which is why the hero works in `next dev` but is blank in production.
 */
export default function imageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality ?? 75));
    return url.toString();
  }

  return src;
}
