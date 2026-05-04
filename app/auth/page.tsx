import type { Metadata } from "next";
import { AuthPanel } from "@/components/AuthPanel";
import { SectionHeader } from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "Login / Register",
  description: "Login or register for NexusHub."
};

export default function AuthPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Account" title="Login / Register" description="Profiles support favorites, ratings, comments, submitted resources and trust badges." />
      <AuthPanel />
    </section>
  );
}
