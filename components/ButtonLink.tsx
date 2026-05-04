import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ButtonLink({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "ghost" }) {
  return (
    <Link
      href={href}
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition",
        variant === "primary"
          ? "bg-gradient-to-r from-[#e74c3c] to-[#ff6b35] text-white shadow-[0_14px_45px_rgba(231,76,60,0.30)] hover:scale-[1.02]"
          : "border border-white/10 bg-white/5 text-white hover:border-[#ff6b35]/50 hover:bg-[#ff6b35]/10"
      )}
    >
      {children} <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
