import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-background px-2.5 py-1 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm";

const RANGE_OPTIONS = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "custom", label: "Custom range" },
];

export function EnquiryFilterBar({
  action,
  range,
  fromInput,
  toInput,
  search,
  timezone,
}: {
  action: string;
  range: string;
  fromInput: string;
  toInput: string;
  search: string;
  timezone: string;
}) {
  return (
    <form
      method="get"
      action={action}
      className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]"
    >
      <div className="grid gap-1.5">
        <Label htmlFor="range">Received ({timezone})</Label>
        <select id="range" name="range" defaultValue={range} className={selectClassName}>
          {RANGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="from">From (custom)</Label>
        <Input id="from" name="from" type="date" defaultValue={fromInput} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="to">To (custom)</Label>
        <Input id="to" name="to" type="date" defaultValue={toInput} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="q">Search</Label>
        <Input
          id="q"
          name="q"
          type="search"
          placeholder="Name, mobile, email or city"
          defaultValue={search}
          maxLength={100}
        />
      </div>
      <div className="flex items-end gap-2">
        <Button type="submit" className="w-full sm:w-auto">
          Apply
        </Button>
        <a href={action} className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}>
          Reset
        </a>
      </div>
    </form>
  );
}
