import type { Metadata } from "next";
import { BadgeCheck, Heart, History, Medal } from "lucide-react";
import { ResourceCard } from "@/components/ResourceCard";
import { resources } from "@/lib/data";

export const metadata: Metadata = {
  title: "Profile",
  description: "NexusHub user profile demo."
};

export default function ProfilePage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-[2rem] border border-white/10 bg-[#181818]/85 p-8 shadow-2xl shadow-black/20">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff6b35]">User profile</p>
        <h1 className="mt-3 text-4xl font-black text-white">nexus_member</h1>
        <p className="mt-3 max-w-2xl text-neutral-400">Demo profile with trust badges, favorites and submitted resources. Connect JWT/session state to make this user-specific in production.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4"><Heart className="mb-2 h-5 w-5 text-[#ff6b35]" /><b>18</b><p className="text-sm text-neutral-400">Favorites</p></div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4"><History className="mb-2 h-5 w-5 text-[#ff6b35]" /><b>42</b><p className="text-sm text-neutral-400">History items</p></div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4"><Medal className="mb-2 h-5 w-5 text-[#ff6b35]" /><b>87</b><p className="text-sm text-neutral-400">Trust score</p></div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4"><BadgeCheck className="mb-2 h-5 w-5 text-[#ff6b35]" /><b>3</b><p className="text-sm text-neutral-400">Badges</p></div>
        </div>
      </div>
      <h2 className="mb-5 text-2xl font-black text-white">Favorite resources</h2>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {resources.slice(0, 3).map((resource) => <ResourceCard key={resource.slug} resource={resource} />)}
      </div>
    </section>
  );
}
