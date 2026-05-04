import type { Metadata } from "next";
import { ResourceCard } from "@/components/ResourceCard";
import { ResourceTable } from "@/components/ResourceTable";
import { SectionHeader } from "@/components/SectionHeader";
import { resources } from "@/lib/data";

export const metadata: Metadata = {
  title: "Trending",
  description: "Trending legal resources on NexusHub."
};

export default function TrendingPage() {
  const sorted = [...resources].sort((a, b) => b.downloads * b.rating - a.downloads * a.rating);
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Live heat" title="Trending legal resources" description="Ranked by popularity, rating momentum and trust score." />
      <div className="mb-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {sorted.slice(0, 3).map((resource) => <ResourceCard key={resource.slug} resource={resource} />)}
      </div>
      <ResourceTable resources={sorted} />
    </section>
  );
}
