import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TRAFFIC_DASHBOARD_PATH } from "@/config/traffic-monitor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ADMIN_COOKIE_NAME,
  isAdminAuthConfigured,
  validateAdminSession,
} from "@/lib/traffic/admin-auth";

export const metadata = { title: "Traffic monitor login" };

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Incorrect password.",
  "rate-limited": "Too many failed attempts. Please wait 15 minutes and try again.",
  "not-configured": "Admin access is not configured on this server.",
  unavailable: "Sign-in is temporarily unavailable. Please try again later.",
};

export default async function TrafficLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const store = await cookies();
  if (await validateAdminSession(store.get(ADMIN_COOKIE_NAME)?.value)) {
    redirect(TRAFFIC_DASHBOARD_PATH);
  }

  const { error } = await searchParams;
  const errorKey = typeof error === "string" ? error : undefined;
  const configured = isAdminAuthConfigured();
  const message = !configured
    ? ERROR_MESSAGES["not-configured"]
    : errorKey
      ? ERROR_MESSAGES[errorKey]
      : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form
        method="post"
        action="/api/admin/traffic/login"
        className="grid w-full max-w-sm gap-4 rounded-xl border bg-card p-6 shadow-sm"
      >
        <div className="grid gap-1">
          <h1 className="font-heading text-xl font-semibold">Traffic monitor</h1>
          <p className="text-sm text-muted-foreground">Admin access only.</p>
        </div>
        {message ? (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {message}
          </p>
        ) : null}
        <div className="grid gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={!configured}
          />
        </div>
        <Button type="submit" disabled={!configured}>
          Sign in
        </Button>
      </form>
    </main>
  );
}
