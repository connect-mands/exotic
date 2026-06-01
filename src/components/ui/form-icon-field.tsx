import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormIconFieldProps {
  icon: LucideIcon;
  children: ReactNode;
  error?: string;
  className?: string;
  variant?: "default" | "hero";
}

export function FormIconField({
  icon: Icon,
  children,
  error,
  className,
  variant = "default",
}: FormIconFieldProps) {
  const isHero = variant === "hero";

  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <div className="relative">
        <Icon
          className={cn(
            "pointer-events-none absolute top-1/2 z-[1] -translate-y-1/2 text-gray-400",
            isHero ? "left-3 size-[18px]" : "left-3 size-4 text-[var(--brand-teal)]"
          )}
          strokeWidth={isHero ? 1.75 : 2}
          aria-hidden
        />
        {children}
      </div>
      {error && <p className="text-[11px] font-medium leading-tight text-red-600">{error}</p>}
    </div>
  );
}
