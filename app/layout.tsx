import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: { default: "Lawsearch | Prestigious Legal Talent", template: "%s | Lawsearch" },
  description: "Prestigious legal talent. Connecting respected lawyers with ambitious law firms and legal teams across the UK, US and UAE.",
  metadataBase: new URL("https://law-search.co.uk"),
  openGraph: {
    title: "Lawsearch | Prestigious Legal Talent",
    description: "Exceptional lawyers. Ambitious organisations. Legal search across the UK, US and UAE.",
    siteName: "Lawsearch", type: "website", locale: "en_GB",
    images: [{url: "/lawsearch-social.png", width: 1200, height: 630, alt: "Lawsearch — Prestigious Legal Talent — UK, US, UAE"}],
  },
  twitter: {card: "summary_large_image", title: "Lawsearch | Prestigious Legal Talent", description: "Legal search across the UK, US and UAE.", images: ["/lawsearch-social.png"]},
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased"><a className="skip-link" href="#main-content">Skip to content</a>{children}</body>
    </html>
  );
}
