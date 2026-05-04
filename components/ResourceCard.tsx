"use client";

import Image from "next/image";
import Link from "next/link";
import { Download, ExternalLink, Heart, Star, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/Badge";
import { formatDate, formatNumber } from "@/lib/utils";
import type { Resource } from "@/types";

export function ResourceCard({ resource, compact = false }: { resource: Resource; compact?: boolean }) {
  const [favorite, setFavorite] = useState(false);
  const storageKey = `nexushub:fav:${resource.slug}`;

  useEffect(() => {
    setFavorite(localStorage.getItem(storageKey) === "1");
  }, [storageKey]);

  function toggleFavorite() {
    const next = !favorite;
    setFavorite(next);
    localStorage.setItem(storageKey, next ? "1" : "0");
  }

  return (
    <article className="card-glow group rounded-[1.75rem] border border-white/10 bg-[#181818]/88 shadow-2xl shadow-black/25 transition duration-300 hover:-translate-y-1 hover:border-[#e74c3c]/35">
      <div className="rounded-[1.75rem] bg-[#181818] p-3">
        <div className="relative overflow-hidden rounded-[1.3rem] border border-white/10">
          <Image src={resource.image} alt="" width={900} height={520} className="h-48 w-full object-cover transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <button
            onClick={toggleFavorite}
            className="focus-ring absolute right-3 top-3 rounded-full border border-white/15 bg-black/55 p-2 text-white backdrop-blur transition hover:bg-[#e74c3c]"
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={favorite ? "h-4 w-4 fill-current text-[#ff6b35]" : "h-4 w-4"} />
          </button>
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            {resource.badges.slice(0, compact ? 1 : 2).map((badge) => <Badge key={badge} type={badge} compact />)}
          </div>
        </div>
        <div className="p-3">
          <div className="mb-3 flex items-center justify-between gap-4 text-xs text-neutral-400">
            <span>{resource.category}</span>
            <span>{formatDate(resource.addedAt)}</span>
          </div>
          <Link href={`/resource/${resource.slug}`} className="focus-ring rounded-xl text-xl font-black leading-tight text-white transition hover:text-[#ff6b35]">
            {resource.title}
          </Link>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-400">{resource.shortDesc}</p>
          <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/30 p-3 text-xs text-neutral-300">
            <div className="flex items-center gap-1.5"><Download className="h-3.5 w-3.5 text-[#ff6b35]" />{formatNumber(resource.downloads)}</div>
            <div className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-[#ff6b35] text-[#ff6b35]" />{resource.rating}</div>
            <div className="flex items-center gap-1.5"><UserRound className="h-3.5 w-3.5 text-[#ff6b35]" />{resource.author.split(" ")[0]}</div>
          </div>
          <div className="mt-5 flex gap-2">
            <Link href={`/resource/${resource.slug}`} className="focus-ring flex-1 rounded-2xl border border-white/10 px-4 py-3 text-center text-sm font-black text-white transition hover:border-[#ff6b35]/50 hover:bg-[#ff6b35]/10">
              View details
            </Link>
            <a href={resource.officialUrl} target="_blank" rel="noopener noreferrer" className="focus-ring rounded-2xl bg-[#e74c3c] px-4 py-3 text-sm font-black text-white transition hover:bg-[#ff6b35]" aria-label="Download from official source">
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
