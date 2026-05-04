import Link from "next/link";
import { BookOpen, Boxes, Code2, Database, Film, Gamepad2, GraduationCap, Music2, Palette, Terminal } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import type { Category } from "@/types";

const iconMap = { Code2, Gamepad2, Music2, Film, BookOpen, Palette, Terminal, Database, GraduationCap, Boxes };

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {categories.map((category) => {
        const Icon = iconMap[category.icon as keyof typeof iconMap] ?? Boxes;
        return (
          <Link
            key={category.slug}
            href={`/search?category=${category.slug}`}
            className="card-glow group rounded-[1.5rem] border border-white/10 bg-[#181818]/82 p-5 transition duration-300 hover:-translate-y-1 hover:border-[#e74c3c]/40"
          >
            <div className="mb-4 inline-grid h-12 w-12 place-items-center rounded-2xl border border-[#ff6b35]/25 bg-[#ff6b35]/10 text-[#ff6b35] transition group-hover:scale-110">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="font-black text-white">{category.name}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-400">{category.description}</p>
            <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-neutral-500">{formatNumber(category.count)} resources</p>
          </Link>
        );
      })}
    </div>
  );
}
