import type { LeadStatus, TrafficStatus } from "@/lib/traffic/reports";
import { cn } from "@/lib/utils";

const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap";

export function TrafficStatusBadge({ status }: { status: TrafficStatus }) {
  if (status === "suspicious") {
    return (
      <span className={cn(base, "bg-amber-100 text-amber-900")}>
        Suspicious — Review required
      </span>
    );
  }
  if (status === "google-invalid") {
    return (
      <span className={cn(base, "bg-red-100 text-red-900")}>Google-confirmed invalid</span>
    );
  }
  return <span className={cn(base, "bg-emerald-100 text-emerald-900")}>Normal</span>;
}

export function EmailStatusBadge({ status }: { status: string }) {
  if (status === "sent") {
    return <span className={cn(base, "bg-emerald-100 text-emerald-900")}>Emailed</span>;
  }
  if (status === "failed") {
    return <span className={cn(base, "bg-red-100 text-red-900")}>Email failed</span>;
  }
  if (status === "not_configured") {
    return <span className={cn(base, "bg-muted text-muted-foreground")}>Not emailed (no Resend key)</span>;
  }
  return <span className={cn(base, "bg-amber-100 text-amber-900")}>Pending</span>;
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  if (status === "lead") {
    return <span className={cn(base, "bg-emerald-100 text-emerald-900")}>Enquiry recorded</span>;
  }
  if (status === "none") {
    return <span className={cn(base, "bg-muted text-muted-foreground")}>No enquiry</span>;
  }
  return <span className={cn(base, "bg-muted text-muted-foreground")}>Unknown</span>;
}
