import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchPageClient } from "@/components/SearchPageClient";
import { categories, resources } from "@/lib/data";

export const metadata: Metadata = {
  title: "Search",
  description: "Search and filter legal digital resources on NexusHub."
};

export default function SearchPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="rounded-3xl border border-white/10 bg-[#181818]/80 p-8">Loading search...</div>}>
        <SearchPageClient resources={resources} categories={categories} />
      </Suspense>
    </section>
  );
}
