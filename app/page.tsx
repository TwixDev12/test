import { CategoryGrid } from "@/components/CategoryGrid";
import { ResourceCard } from "@/components/ResourceCard";
import { ResourceTable } from "@/components/ResourceTable";
import { SearchHero } from "@/components/SearchHero";
import { SectionHeader } from "@/components/SectionHeader";
import { ButtonLink } from "@/components/ButtonLink";
import { categories, resources } from "@/lib/data";

export default function HomePage() {
  const trending = [...resources].sort((a, b) => b.downloads - a.downloads).slice(0, 3);
  const recent = [...resources].sort((a, b) => +new Date(b.addedAt) - +new Date(a.addedAt)).slice(0, 3);
  const top = [...resources].sort((a, b) => b.downloads - a.downloads).slice(0, 6);

  return (
    <>
      <SearchHero />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Explore" title="Legal resource categories" description="Browse verified communities, open licenses and source-first listings." />
        <CategoryGrid categories={categories} />
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Trending" title="Trending Resources" description="High-signal legal resources gaining traction right now." />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {trending.map((resource) => <ResourceCard key={resource.slug} resource={resource} />)}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <SectionHeader eyebrow="Leaderboard" title="Top 100 This Week" description="Ranked by verified source clicks, downloads and trust signals." />
          <ButtonLink href="/top-100" variant="ghost">Open top 100</ButtonLink>
        </div>
        <ResourceTable resources={top} />
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Fresh index" title="Recently Added" description="New legal resources waiting for community ratings and comments." />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {recent.map((resource) => <ResourceCard key={resource.slug} resource={resource} />)}
        </div>
      </section>
    </>
  );
}
