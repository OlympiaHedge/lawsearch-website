import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Lawsearch | Boutique Legal Recruitment", template: "%s | Lawsearch" },
  description: "Boutique legal recruitment across property, private client, family law, criminal defence, corporate and commercial. Explore opportunities and register your CV.",
  other: {
    "codex-preview": "development",
  },
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
