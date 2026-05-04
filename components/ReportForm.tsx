"use client";

import { FormEvent, useState } from "react";

export function ReportForm({ resourceSlug }: { resourceSlug?: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = { ...Object.fromEntries(formData.entries()), resourceSlug };
    const res = await fetch("/api/reports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const json = await res.json();
    setMessage(res.ok ? json.message : json.error);
  }

  if (!open) {
    return <button onClick={() => setOpen(true)} className="focus-ring rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-black text-red-200 transition hover:bg-red-500/20">Report copyright issue</button>;
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 grid gap-3 rounded-3xl border border-red-500/20 bg-red-500/5 p-5">
      <input name="email" type="email" placeholder="Your email" className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 outline-none" />
      <input name="reason" required placeholder="Reason" className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 outline-none" />
      <textarea name="details" required minLength={20} rows={4} placeholder="Give details so moderators can verify the issue." className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 outline-none" />
      <button className="rounded-2xl bg-red-600 px-5 py-3 font-black text-white">Submit report</button>
      {message && <p className="text-sm text-neutral-300">{message}</p>}
    </form>
  );
}
