import type { Metadata } from "next";
import { AdminPanel } from "@/components/AdminPanel";
import { SectionHeader } from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "NexusHub moderation and admin dashboard."
};

export default function AdminPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Admin" title="Moderation dashboard" description="Approve/refuse resources, review reports, manage categories, ban users and modify licenses." />
      <AdminPanel />
    </section>
  );
}
