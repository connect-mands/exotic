import { Mail, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

interface SiteHeaderProps {
  logoHref?: string;
}

export function SiteHeader({ logoHref = "#top" }: SiteHeaderProps) {
  return (
    <header className="relative z-30 h-[85px] border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href={logoHref} className="flex shrink-0 items-center">
          <Image
            src={siteConfig.logo.src}
            alt={siteConfig.brandName}
            width={siteConfig.logo.width}
            height={siteConfig.logo.height}
            className="h-[61px] w-[145px] object-contain object-left"
            priority
          />
        </Link>

        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-6">
          <a
            href={siteConfig.phoneHref}
            className="flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-[var(--brand-teal)]"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-[var(--brand-teal)] text-white">
              <Phone className="size-4" aria-hidden />
            </span>
            <span className="hidden sm:inline">{siteConfig.phone}</span>
          </a>
          <a
            href={siteConfig.emailHref}
            className="flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-[var(--brand-teal)]"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-[var(--brand-teal)] text-white">
              <Mail className="size-4" aria-hidden />
            </span>
            <span className="hidden sm:inline">{siteConfig.email}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
