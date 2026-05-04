import Link from "next/link";
import { Star } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import type { Resource } from "@/types";

export function ResourceTable({ resources }: { resources: Resource[] }) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#181818]/85 shadow-2xl shadow-black/20">
      <div className="custom-scroll overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-white/10 bg-black/35 text-xs uppercase tracking-[0.18em] text-neutral-500">
            <tr>
              <th className="px-5 py-4">Rank</th>
              <th className="px-5 py-4">Title</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">Downloads</th>
              <th className="px-5 py-4">Rating</th>
              <th className="px-5 py-4">License</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((resource, index) => (
              <tr key={`${resource.id}-${index}`} className="border-b border-white/5 transition hover:bg-[#e74c3c]/8">
                <td className="px-5 py-4 font-black text-[#ff6b35]">#{index + 1}</td>
                <td className="px-5 py-4">
                  <Link href={`/resource/${resource.slug}`} className="font-black text-white hover:text-[#ff6b35]">{resource.title}</Link>
                </td>
                <td className="px-5 py-4 text-neutral-300">{resource.category}</td>
                <td className="px-5 py-4 text-neutral-300">{formatNumber(resource.downloads)}</td>
                <td className="px-5 py-4 text-neutral-300"><span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-[#ff6b35] text-[#ff6b35]" />{resource.rating}</span></td>
                <td className="px-5 py-4 text-neutral-400">{resource.license}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
