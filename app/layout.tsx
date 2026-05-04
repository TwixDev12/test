import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "NexusHub — Legal Digital Resource Discovery",
    template: "%s | NexusHub"
  },
  description: "Discover legal digital resources from trusted creators: open-source software, Creative Commons music, public-domain ebooks, datasets, templates and indie games.",
  keywords: [
    "legal resources",
    "open source",
    "creative commons",
    "public domain",
    "datasets",
    "indie games",
    "templates"
  ],
  openGraph: {
    title: "NexusHub",
    description: "A premium dark catalogue for legal digital resources.",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="noise" aria-hidden="true" />
        <Header />
        <main className="relative z-10 min-h-screen pt-24">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
