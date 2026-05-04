"use client";

import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ResourceCard } from "@/components/ResourceCard";
import type { Category, Resource } from "@/types";

const licenses = ["all", "MIT", "Apache-2.0", "GPL-3.0", "CC BY 4.0", "CC0", "Public Domain", "Freeware"];

export function SearchPageClient({ resources, categories }: { resources: Resource[]; categories: Category[] }) {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "all");
  const [license, setLicense] = useState("all");
  const [date, setDate] = useState("all");
  const [popularity, setPopularity] = useState("downloads");
  const [rating, setRating] = useState("0");
  const [size, setSize] = useState("all");

  const filtered = useMemo(() => {
    const now = Date.now();
    const q = query.toLowerCase();
    return resources
      .filter((resource) => !q || [resource.title, resource.shortDesc, resource.description, resource.author, ...resource.tags].join(" ").toLowerCase().includes(q))
      .filter((resource) => category === "all" || resource.categorySlug === category)
      .filter((resource) => license === "all" || resource.license === license)
      .filter((resource) => resource.rating >= Number(rating))
      .filter((resource) => {
        if (date === "all") return true;
        const ageDays = (now - +new Date(resource.addedAt)) / 86_400_000;
        if (date === "7") return ageDays <= 7;
        if (date === "30") return ageDays <= 30;
        if (date === "365") return ageDays <= 365;
        return true;
      })
      .filter((resource) => {
        if (size === "all") return true;
        if (size === "small") return /MB$/.test(resource.size) && parseFloat(resource.size) < 100;
        if (size === "medium") return /MB$/.test(resource.size) && parseFloat(resource.size) >= 100;
        if (size === "large") return /GB$/.test(resource.size) || resource.size === "Varies";
        return true;
      })
      .sort((a, b) => {
        if (popularity === "rating") return b.rating - a.rating;
        if (popularity === "newest") return +new Date(b.addedAt) - +new Date(a.addedAt);
        if (popularity === "trust") return b.trustScore - a.trustScore;
        return b.downloads - a.downloads;
      });
  }, [resources, query, category, license, date, popularity, rating, size]);

  function clearFilters() {
    setQuery("");
    setCategory("all");
    setLicense("all");
    setDate("all");
    setPopularity("downloads");
    setRating("0");
    setSize("all");
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[330px_1fr]">
      <aside className="h-fit rounded-[1.75rem] border border-white/10 bg-[#181818]/85 p-5 shadow-2xl shadow-black/20 lg:sticky lg:top-28">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-black text-white"><SlidersHorizontal className="h-5 w-5 text-[#ff6b35]" /> Filters</h2>
          <button onClick={clearFilters} className="rounded-full border border-white/10 p-2 text-neutral-400 transition hover:text-white" aria-label="Clear filters"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-neutral-300">
            Instant search
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, tag, author..." className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-[#ff6b35]/60" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-neutral-300">
            Category
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 outline-none focus:border-[#ff6b35]/60">
              <option value="all">All categories</option>
              {categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-neutral-300">
            License
            <select value={license} onChange={(event) => setLicense(event.target.value)} className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 outline-none focus:border-[#ff6b35]/60">
              {licenses.map((item) => <option key={item} value={item}>{item === "all" ? "All licenses" : item}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-neutral-300">
            Date added
            <select value={date} onChange={(event) => setDate(event.target.value)} className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 outline-none focus:border-[#ff6b35]/60">
              <option value="all">Any time</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="365">This year</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-neutral-300">
            Popularity
            <select value={popularity} onChange={(event) => setPopularity(event.target.value)} className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 outline-none focus:border-[#ff6b35]/60">
              <option value="downloads">Downloads</option>
              <option value="rating">User rating</option>
              <option value="newest">Newest</option>
              <option value="trust">Trust score</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-neutral-300">
            Minimum rating
            <select value={rating} onChange={(event) => setRating(event.target.value)} className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 outline-none focus:border-[#ff6b35]/60">
              <option value="0">Any rating</option>
              <option value="4">4.0+</option>
              <option value="4.5">4.5+</option>
              <option value="4.8">4.8+</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-neutral-300">
            Size
            <select value={size} onChange={(event) => setSize(event.target.value)} className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 outline-none focus:border-[#ff6b35]/60">
              <option value="all">Any size</option>
              <option value="small">Small &lt; 100 MB</option>
              <option value="medium">Medium 100 MB+</option>
              <option value="large">Large / GB / varies</option>
            </select>
          </label>
        </div>
      </aside>
      <section>
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff6b35]">Search results</p>
            <h1 className="mt-2 text-3xl font-black text-white">{filtered.length} legal resources found</h1>
          </div>
          <p className="text-sm text-neutral-400">Dynamic filters update instantly.</p>
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          {filtered.map((resource) => <ResourceCard key={resource.slug} resource={resource} />)}
        </div>
        {filtered.length === 0 && <div className="rounded-[1.75rem] border border-white/10 bg-[#181818]/85 p-10 text-center text-neutral-300">No legal resources match these filters.</div>}
      </section>
    </div>
  );
}
