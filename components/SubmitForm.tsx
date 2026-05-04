"use client";

import { FormEvent, useState } from "react";
import { categories } from "@/lib/data";

const licenses = ["MIT", "Apache-2.0", "GPL-3.0", "CC BY 4.0", "CC0", "Public Domain", "Freeware"];

export function SubmitForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (res.ok) {
      setStatus("success");
      setMessage(json.message || "Submitted for moderation.");
      form.reset();
    } else {
      setStatus("error");
      setMessage(json.error || "Submission failed.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5 rounded-[2rem] border border-white/10 bg-[#181818]/85 p-6 shadow-2xl shadow-black/20">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-neutral-300">Title<input required name="title" className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#ff6b35]/60" /></label>
        <label className="grid gap-2 text-sm font-semibold text-neutral-300">Author<input required name="author" className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#ff6b35]/60" /></label>
        <label className="grid gap-2 text-sm font-semibold text-neutral-300">Category<select required name="category" className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#ff6b35]/60">{categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-semibold text-neutral-300">License<select required name="license" className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#ff6b35]/60">{licenses.map((license) => <option key={license} value={license}>{license}</option>)}</select></label>
        <label className="grid gap-2 text-sm font-semibold text-neutral-300 md:col-span-2">Official URL<input required name="officialUrl" type="url" placeholder="https://official-source.example" className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#ff6b35]/60" /></label>
        <label className="grid gap-2 text-sm font-semibold text-neutral-300 md:col-span-2">Tags<input name="tags" placeholder="open-source, template, cc0" className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#ff6b35]/60" /></label>
        <label className="grid gap-2 text-sm font-semibold text-neutral-300 md:col-span-2">Image URL<input name="image" type="url" placeholder="https://..." className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#ff6b35]/60" /></label>
      </div>
      <label className="grid gap-2 text-sm font-semibold text-neutral-300">Description<textarea required name="description" rows={7} placeholder="Explain what the resource is, why it is legal, and who should use it." className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#ff6b35]/60" /></label>
      <div className="rounded-2xl border border-[#ff6b35]/20 bg-[#ff6b35]/10 p-4 text-sm leading-6 text-[#ffccb8]">
        Every submission enters moderation before publication. NexusHub verifies source URL, license clarity, safety signals and copyright risk.
      </div>
      <button disabled={status === "loading"} className="focus-ring rounded-2xl bg-gradient-to-r from-[#e74c3c] to-[#ff6b35] px-6 py-4 font-black text-white transition hover:scale-[1.01] disabled:opacity-60">
        {status === "loading" ? "Submitting..." : "Submit for moderation"}
      </button>
      {message && <p className={status === "error" ? "text-sm text-red-300" : "text-sm text-green-300"}>{message}</p>}
    </form>
  );
}
