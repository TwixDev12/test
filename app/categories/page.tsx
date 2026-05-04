import type { Metadata } from "next";
import { CategoryGrid } from "@/components/CategoryGrid";
import { SectionHeader } from "@/components/SectionHeader";
import { categories } from "@/lib/data";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse NexusHub legal resource categories."
};

export default function CategoriesPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Directory" title="Categories" description="Every category is designed around legal discovery, clear licenses and source-first downloads." />
      <CategoryGrid categories={categories} />
    </section>
  );
}
