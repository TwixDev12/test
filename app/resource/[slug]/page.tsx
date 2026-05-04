import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Download, ExternalLink, ShieldCheck, Star, UserRound } from "lucide-react";
import { Badge } from "@/components/Badge";
import { RatingWidget } from "@/components/RatingWidget";
import { ReportForm } from "@/components/ReportForm";
import { comments, resources } from "@/lib/data";
import { formatDate, formatNumber } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const resource = resources.find((item) => item.slug === slug);
  if (!resource) return { title: "Resource not found" };
  return { title: resource.title, description: resource.shortDesc };
}

export function generateStaticParams() {
  return resources.map((resource) => ({ slug: resource.slug }));
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = resources.find((item) => item.slug === slug);
  if (!resource) notFound();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <article>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#181818]/85 shadow-2xl shadow-black/25">
            <Image src={resource.image} alt="" width={1400} height={680} priority className="h-[420px] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <div className="mb-4 flex flex-wrap gap-2">
                {resource.badges.map((badge) => <Badge key={badge} type={badge} />)}
              </div>
              <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl">{resource.title}</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-neutral-300">{resource.shortDesc}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 rounded-[2rem] border border-white/10 bg-[#181818]/85 p-6 shadow-2xl shadow-black/20">
            <div className="flex flex-wrap gap-4 text-sm text-neutral-300">
              <span className="inline-flex items-center gap-2"><UserRound className="h-4 w-4 text-[#ff6b35]" />{resource.author}</span>
              <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#ff6b35]" />{formatDate(resource.addedAt)}</span>
              <span className="inline-flex items-center gap-2"><Download className="h-4 w-4 text-[#ff6b35]" />{formatNumber(resource.downloads)} downloads</span>
              <span className="inline-flex items-center gap-2"><Star className="h-4 w-4 fill-[#ff6b35] text-[#ff6b35]" />{resource.rating} ({formatNumber(resource.ratingCount)} ratings)</span>
            </div>
            <p className="text-base leading-8 text-neutral-300">{resource.description}</p>
            <div className="flex flex-wrap gap-2">
              {resource.tags.map((tag) => <Link key={tag} href={`/search?q=${tag}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-neutral-300 hover:border-[#ff6b35]/40">#{tag}</Link>)}
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {resource.screenshots.map((src, index) => (
              <Image key={src} src={src} alt={`${resource.title} screenshot ${index + 1}`} width={700} height={440} className="h-52 rounded-[1.5rem] border border-white/10 object-cover" />
            ))}
          </div>

          <div className="mt-8 rounded-[2rem] border border-white/10 bg-[#181818]/85 p-6">
            <h2 className="mb-5 text-2xl font-black text-white">User reviews</h2>
            <RatingWidget slug={resource.slug} initialRating={Math.round(resource.rating)} />
            <div className="mt-6 grid gap-4">
              {comments.map((comment) => (
                <div key={comment.author} className="rounded-3xl border border-white/10 bg-black/30 p-5">
                  <div className="mb-2 flex items-center justify-between"><b className="text-white">{comment.author}</b><span className="text-sm text-[#ff6b35]">{comment.score}/5</span></div>
                  <p className="text-sm leading-6 text-neutral-400">{comment.body}</p>
                </div>
              ))}
            </div>
          </div>
        </article>

        <aside className="h-fit lg:sticky lg:top-28">
          <div className="rounded-[2rem] border border-white/10 bg-[#181818]/90 p-6 shadow-2xl shadow-black/25">
            <a href={resource.officialUrl} target="_blank" rel="noopener noreferrer" className="focus-ring mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#e74c3c] to-[#ff6b35] px-5 py-4 text-sm font-black text-white transition hover:scale-[1.02]">
              Download from source <ExternalLink className="h-4 w-4" />
            </a>
            <Link href={`/search?category=${resource.categorySlug}`} className="mb-6 block rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-center text-sm font-black text-white transition hover:border-[#ff6b35]/40">More in {resource.category}</Link>
            <div className="grid gap-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4"><span className="text-neutral-500">License</span><p className="mt-1 font-black text-white">{resource.license}</p></div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4"><span className="text-neutral-500">Size</span><p className="mt-1 font-black text-white">{resource.size}</p></div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4"><span className="text-neutral-500">Trust score</span><p className="mt-1 font-black text-white">{resource.trustScore}/100</p></div>
            </div>
          </div>

          <div className="mt-5 rounded-[2rem] border border-[#ff6b35]/20 bg-[#ff6b35]/10 p-6">
            <h2 className="font-black text-white">License & Usage Rights</h2>
            <p className="mt-3 text-sm leading-6 text-[#ffccb8]">This listing links to the official source and highlights the declared license. Always review the source license before commercial use, redistribution or modification.</p>
          </div>
          <div className="mt-5 rounded-[2rem] border border-green-500/20 bg-green-500/10 p-6">
            <h2 className="flex items-center gap-2 font-black text-white"><ShieldCheck className="h-5 w-5 text-green-300" /> Safety Scan</h2>
            <p className="mt-3 text-sm leading-6 text-green-100/80">Verified source URL, no direct rehosting, safe-download badge available, metadata checked by moderation signals.</p>
          </div>
          <ReportForm resourceSlug={resource.slug} />
        </aside>
      </div>
    </section>
  );
}
