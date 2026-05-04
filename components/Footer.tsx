import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const footer = ["About", "Contact", "Legal", "DMCA / Copyright Policy", "Terms", "Privacy"];

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-black/35">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr] lg:px-8">
        <div>
          <div className="mb-4 flex items-center gap-3 text-lg font-black">
            <ShieldCheck className="h-6 w-6 text-[#ff6b35]" /> NexusHub
          </div>
          <p className="max-w-xl text-sm leading-6 text-neutral-400">
            NexusHub indexes legal resources and sends users to official sources. It does not host copyrighted content without permission and supports fast copyright reporting.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          {footer.map((label) => (
            <Link key={label} href="#" className="text-neutral-400 transition hover:text-[#ff6b35]">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
