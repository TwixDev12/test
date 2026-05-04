"use client";

import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";

export function SearchHero() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/search?${params.toString()}`);
  }

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 lg:px-8">
      <div className="absolute left-1/2 top-4 h-72 w-72 -translate-x-1/2 rounded-full bg-[#e74c3c]/20 blur-[90px]" aria-hidden="true" />
      <div className="mx-auto max-w-5xl text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#ff6b35]/25 bg-[#ff6b35]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-[#ffb199]">
          <Sparkles className="h-4 w-4" /> Verified legal discovery
        </div>
        <h1 className="bg-gradient-to-b from-white via-white to-neutral-500 bg-clip-text text-6xl font-black tracking-tight text-transparent sm:text-7xl lg:text-8xl">
          Nexus<span className="text-[#ff6b35]">Hub</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-300">
          Discover legal digital resources from trusted creators.
        </p>
        <form onSubmit={onSubmit} className="glass mx-auto mt-10 flex max-w-3xl flex-col gap-3 rounded-[2rem] p-3 sm:flex-row">
          <label className="sr-only" htmlFor="hero-search">Search legal resources</label>
          <div className="flex flex-1 items-center gap-3 rounded-3xl bg-black/35 px-5 py-4 ring-1 ring-white/10">
            <Search className="h-5 w-5 text-[#ff6b35]" />
            <input
              id="hero-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search open-source apps, CC music, datasets, ebooks..."
              className="w-full bg-transparent text-base text-white placeholder:text-neutral-500 focus:outline-none"
            />
          </div>
          <button className="focus-ring rounded-3xl bg-gradient-to-r from-[#e74c3c] to-[#ff6b35] px-8 py-4 font-black text-white shadow-[0_18px_50px_rgba(231,76,60,0.34)] transition hover:scale-[1.02]">
            Search
          </button>
        </form>
      </div>
    </section>
  );
}
