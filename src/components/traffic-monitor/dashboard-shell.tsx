import Link from "next/link";
import { TRAFFIC_DASHBOARD_PATH } from "@/config/traffic-monitor";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { key: "traffic", label: "Traffic", href: TRAFFIC_DASHBOARD_PATH },
  { key: "enquiries", label: "Enquiries", href: `${TRAFFIC_DASHBOARD_PATH}/enquiries` },
] as const;

export function DashboardShell({
  title,
  description,
  active = "traffic",
  children,
}: {
  title: string;
  description?: React.ReactNode;
  active?: (typeof NAV_ITEMS)[number]["key"];
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:py-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="font-heading text-2xl font-semibold">{title}</h1>
          {description ? (
            <div className="text-sm text-muted-foreground">{description}</div>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <nav aria-label="Admin sections" className="flex gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active === item.key ? "page" : undefined}
                className={cn(
                  buttonVariants({ variant: active === item.key ? "secondary" : "ghost" })
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form method="post" action="/api/admin/traffic/logout">
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      {children}
    </main>
  );
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "warning" | "error";
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "error"
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : tone === "warning"
        ? "border-amber-300 bg-amber-50 text-amber-900"
        : "border-border bg-card text-muted-foreground";
  return <div className={`rounded-xl border px-4 py-3 text-sm ${toneClass}`}>{children}</div>;
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="grid gap-1 rounded-xl border bg-card p-4">
      <span className="text-xs font-medium text-muted-foreground uppercase">{label}</span>
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-3">
      <div className="grid gap-1">
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">{children}</div>
    </section>
  );
}
