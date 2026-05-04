import Link from "next/link";
import { Hexagon } from "lucide-react";

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-3 focus-ring rounded-2xl" aria-label="NexusHub home">
      <span className="relative grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-[#181818] shadow-[0_0_35px_rgba(231,76,60,0.28)]">
        <Hexagon className="h-6 w-6 text-[#ff6b35] transition-transform group-hover:rotate-12" />
        <span className="absolute inset-1 rounded-xl border border-[#e74c3c]/30" />
      </span>
      <span className="text-xl font-black tracking-tight text-white">
        Nexus<span className="text-[#ff6b35]">Hub</span>
      </span>
    </Link>
  );
}
