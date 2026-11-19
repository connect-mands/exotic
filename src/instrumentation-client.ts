const TRAFFIC_ENDPOINT = "/api/traffic/visit";
const TRACKED_PARAMS = [
  "gclid",
  "gbraid",
  "wbraid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;
const DEDUPE_WINDOW_MS = 2000;

type NavigationKind = "load" | "push" | "replace" | "traverse";

let lastTrackedKey = "";
let lastTrackedAt = 0;

function trackVisit(
  pathname: string,
  search: string,
  nav: NavigationKind,
  referrer: string | undefined
): void {
  try {
    if (pathname.startsWith("/admin")) return;

    const key = `${pathname}${search}`;
    const now = Date.now();
    if (key === lastTrackedKey && now - lastTrackedAt < DEDUPE_WINDOW_MS) return;
    lastTrackedKey = key;
    lastTrackedAt = now;

    const query = new URLSearchParams(search);
    const params: Record<string, string> = {};
    for (const name of TRACKED_PARAMS) {
      const value = query.get(name);
      if (value) params[name] = value.slice(0, 256);
    }

    void fetch(TRAFFIC_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        nav,
        referrer: referrer || undefined,
        params,
      }),
      credentials: "same-origin",
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Tracking must never affect the page.
  }
}

function whenIdle(callback: () => void): void {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(callback, { timeout: 3000 });
  } else {
    window.setTimeout(callback, 1500);
  }
}

/**
 * Pathname of the page currently shown. Compared against instead of
 * window.location because, for back/forward ("traverse"), the browser has
 * already updated window.location to the destination before Next.js calls
 * onRouterTransitionStart.
 */
let currentPathname = "";

try {
  currentPathname = window.location.pathname;
  whenIdle(() =>
    trackVisit(
      window.location.pathname,
      window.location.search,
      "load",
      document.referrer
    )
  );
} catch {
  // Tracking must never affect the page.
}

export function onRouterTransitionStart(
  url: string,
  navigationType: "push" | "replace" | "traverse"
): void {
  try {
    const target = new URL(url, window.location.href);
    if (target.origin !== window.location.origin) return;
    if (target.pathname === currentPathname) return;
    const previous = `${window.location.origin}${currentPathname}`;
    currentPathname = target.pathname;
    window.setTimeout(
      () => trackVisit(target.pathname, target.search, navigationType, previous),
      0
    );
  } catch {
    // Tracking must never affect the page.
  }
}
