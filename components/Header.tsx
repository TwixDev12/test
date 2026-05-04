"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/top-100", label: "Top 100" },
  { href: "/trending", label: "Trending" },
  { href: "/categories", label: "Categories" },
  { href: "/submit", label: "Submit" },
  { href: "/auth", label: "Login/Register" }
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0d0d0d]/78 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "focus-ring rounded-full px-4 py-2 text-sm font-semibold text-neutral-300 transition hover:bg-white/5 hover:text-white",
                pathname === item.href && "bg-[#e74c3c]/15 text-white ring-1 ring-[#e74c3c]/30"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          className="focus-ring inline-flex rounded-xl border border-white/10 p-2 text-white lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-white/10 bg-[#0d0d0d]/95 px-4 py-4 lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto grid max-w-7xl gap-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-neutral-200 hover:border-[#e74c3c]/40 hover:bg-[#e74c3c]/10"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
