
import { storefrontPath } from "@/lib/site-path";
import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(
    new URL(process.env.SITE_URL || "https://vladasana-job-bundle.vercel.app").origin,
  ),
  title: "The Developer Job Search Playbook — Vladasana",
  description:
    "12 guides, a 22-page roadmap and two worksheets. A 281-page playbook for developer applications and tech interview preparation. $19, one-time.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Get noticed. Get prepared. — Vladasana",
    description:
      "The Developer Job Search Playbook. 12 guides, a roadmap and worksheets for your next move in tech.",
    type: "website",
    images: [
      {
        url: storefrontPath("/images/quiet/hero.webp"),
        width: 1866,
        height: 843,
        alt: "The Get a Job Bundle in an oxblood folder, by Vladasana",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: storefrontPath("/favicon.svg") },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
