import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface QuoteFormCardProps {
  children: ReactNode;
  className?: string;
  subtitle: string;
}

export function QuoteFormCard({
  children,
  className,
  subtitle,
}: QuoteFormCardProps) {
  return (
    <div
      className={cn(
        "quote-form-card overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_rgba(15,23,42,0.18)]",
        className
      )}
    >
      <div className="quote-form-card-header flex items-center gap-3 px-5 py-4">
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sky-200/35 ring-1 ring-white/25"
          aria-hidden
        >
          <Send className="size-5 text-white" strokeWidth={2.25} />
        </div>
        <div className="min-w-0 text-left">
          <h2 className="text-lg font-bold leading-tight text-white sm:text-xl">
            Get Free Quotes
          </h2>
          <p className="mt-0.5 text-sm font-normal text-white/90">{subtitle}</p>
        </div>
      </div>
      <div className="quote-form-card-body bg-white px-4 pb-5 pt-5 sm:px-5 sm:pb-6">
        {children}
      </div>
    </div>
  );
}
