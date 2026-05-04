import type { Metadata } from "next";
import { ResourceTable } from "@/components/ResourceTable";
import { SectionHeader } from "@/components/SectionHeader";
import { resources } from "@/lib/data";

export const metadata: Metadata = {
  title: "Top 100 This Week",
  description: "The NexusHub weekly top 100 legal resources."
};

export default function Top100Page() {
  const sorted = [...resources].sort((a, b) => b.downloads - a.downloads);
  const top100 = Array.from({ length: 100 }, (_, index) => {
    const base = sorted[index % sorted.length];
    return { ...base, id: `${base.id}_${index}`, title: index < sorted.length ? base.title : `${base.title} · Mirror listing ${Math.floor(index / sorted.length) + 1}`, downloads: Math.max(1200, base.downloads - index * 830) };
  });
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Weekly index" title="Top 100 This Week" description="A demo leaderboard ready to connect to real download/source-click analytics." />
      <ResourceTable resources={top100} />
    </section>
  );
}
