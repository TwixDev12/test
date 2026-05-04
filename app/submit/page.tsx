import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { SubmitForm } from "@/components/SubmitForm";
import { SectionHeader } from "@/components/SectionHeader";

export const metadata: Metadata = {
  title: "Submit Resource",
  description: "Submit a legal resource to NexusHub for moderation."
};

export default function SubmitPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Submit" title="Propose a legal resource" description="Only official URLs, clear licenses and creator-approved resources pass moderation." />
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <SubmitForm />
        <aside className="h-fit rounded-[2rem] border border-white/10 bg-black/30 p-6">
          <ShieldCheck className="mb-5 h-10 w-10 text-[#ff6b35]" />
          <h2 className="text-xl font-black text-white">Moderation before publication</h2>
          <p className="mt-4 text-sm leading-7 text-neutral-400">Submissions are reviewed for license clarity, safety, copyright risk, source authenticity and duplicate listings. Suspicious or unclear resources stay unpublished until resolved.</p>
          <ul className="mt-5 grid gap-3 text-sm text-neutral-300">
            <li className="rounded-2xl border border-white/10 bg-white/5 p-3">Server validation</li>
            <li className="rounded-2xl border border-white/10 bg-white/5 p-3">Rate limiting</li>
            <li className="rounded-2xl border border-white/10 bg-white/5 p-3">Human review queue</li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
