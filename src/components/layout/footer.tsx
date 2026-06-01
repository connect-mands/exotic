import Image from "next/image";
import {
  BadgePercent,
  Check,
  Headphones,
  Mail,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  certificationAssets,
  footerGuaranteeItems,
  footerTrustBarItems,
  siteConfig,
} from "@/config/site";
import type { DestinationConfig } from "@/types/destination";

const trustBarIcons = [BadgePercent, Headphones, ShieldCheck, Users] as const;

const paymentBrands = [
  { name: "Visa", className: "bg-[#1a1f71] text-white" },
  { name: "Mastercard", className: "bg-[#eb001b] text-white" },
  { name: "RuPay", className: "bg-[#097969] text-white" },
  { name: "Amex", className: "bg-[#006fcf] text-white" },
  { name: "Maestro", className: "bg-[#6c6c6c] text-white" },
  { name: "Diners", className: "bg-[#0079be] text-white" },
] as const;

function FooterColumnTitle({ children }: { children: string }) {
  return (
    <div className="mb-4">
      <div className="mb-2 h-px w-10 bg-[#3a9fc4]" aria-hidden />
      <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#5eb8d9]">
        {children}
      </h3>
    </div>
  );
}

interface FooterProps {
  destination: DestinationConfig;
}

export function Footer({ destination }: FooterProps) {
  const year = new Date().getFullYear();
  const places = destination.hero.places;

  return (
    <footer className="bg-[#001a33] text-gray-300">
      <nav
        className="border-b border-white/10 py-4"
        aria-label="Destinations covered"
      >
        <ul className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-2 px-4 text-[11px] font-semibold uppercase tracking-wide text-white sm:text-xs">
          {places.map((place, index) => (
            <li key={place} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-white/40" aria-hidden>
                  |
                </span>
              )}
              {place}
            </li>
          ))}
          {destination.hero.placesSuffix && (
            <li className="text-white/80">{destination.hero.placesSuffix}</li>
          )}
        </ul>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-3 lg:gap-8">
          <div>
            <FooterColumnTitle>Our Guarantee</FooterColumnTitle>
            <div className="flex gap-4">
              <div className="relative h-28 w-24 shrink-0 sm:h-32 sm:w-28">
                <Image
                  src={certificationAssets.trust}
                  alt=""
                  fill
                  className="object-contain object-left"
                  sizes="112px"
                />
              </div>
              <ul className="space-y-2.5 pt-1">
                {footerGuaranteeItems.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-white"
                  >
                    <Check
                      className="size-4 shrink-0 text-[#5eb8d9]"
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <FooterColumnTitle>Approved By</FooterColumnTitle>
            <Image
              src={certificationAssets.logos}
              alt="Approved by Himachal Tourism, IRCTC and partner certifications"
              width={640}
              height={160}
              className="mx-auto block h-auto w-full object-contain sm:mx-0"
              sizes="(max-width: 640px) 100vw, 320px"
            />
          </div>

          <div className="space-y-8">
            <div>
              <FooterColumnTitle>
                We Accept All Major Credit and Debit Cards
              </FooterColumnTitle>
              <ul className="flex flex-wrap gap-2">
                {paymentBrands.map((brand) => (
                  <li
                    key={brand.name}
                    className={`rounded px-2 py-1 text-[10px] font-bold uppercase ${brand.className}`}
                  >
                    {brand.name}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <FooterColumnTitle>Customer Support</FooterColumnTitle>
              <ul className="space-y-3">
                <li>
                  <a
                    href={siteConfig.phoneHref}
                    className="inline-flex items-center gap-2.5 text-sm text-white transition hover:text-[#5eb8d9]"
                  >
                    <span className="flex size-9 items-center justify-center rounded-full bg-[#2a7da3]/30">
                      <Phone className="size-4 text-[#5eb8d9]" aria-hidden />
                    </span>
                    {siteConfig.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={siteConfig.emailHref}
                    className="inline-flex items-center gap-2.5 text-sm text-white transition hover:text-[#5eb8d9]"
                  >
                    <span className="flex size-9 items-center justify-center rounded-full bg-[#2a7da3]/30">
                      <Mail className="size-4 text-[#5eb8d9]" aria-hidden />
                    </span>
                    {siteConfig.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#001225]">
        <ul className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 lg:px-6">
          {footerTrustBarItems.map((item, index) => {
            const Icon = trustBarIcons[index];
            return (
              <li key={item.title} className="flex gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#2a7da3]/40 bg-[#2a7da3]/15">
                  <Icon className="size-5 text-[#5eb8d9]" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {item.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="border-t border-white/10 py-5 text-center text-[11px] text-gray-500">
        © Copyright {year}, {destination.branding.logoText}. All Rights
        Reserved.
      </p>
    </footer>
  );
}
