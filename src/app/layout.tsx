import type { Metadata } from "next";
import { DM_Sans, Great_Vibes, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { GoogleAdsTag } from "@/components/seo/google-ads-tag";
import { siteConfig } from "@/config/site";
import { getDestinationConfig } from "@/lib/get-destination";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const greatVibes = Great_Vibes({
  weight: "400",
  variable: "--font-script",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.brandName,
    template: `%s | ${siteConfig.brandName}`,
  },
  description: "Premium travel packages across India",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const destination = await getDestinationConfig();

  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${playfair.variable} ${greatVibes.variable} light h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans antialiased">
        {destination.slug === "kerala" ? <GoogleAdsTag /> : null}
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
