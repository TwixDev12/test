"use client";

import { useState } from "react";
import { Ban, CheckCircle2, Flag, Layers3, ShieldAlert, XCircle } from "lucide-react";

const initialQueue = [
  { title: "Open Mesh Icon Pack", category: "Design Assets", license: "CC0", submitter: "mesh-lab", risk: "Low" },
  { title: "Vintage Film Archive Links", category: "Public Domain Movies", license: "Public Domain", submitter: "archivefox", risk: "Medium" },
  { title: "TinyJS Utility Belt", category: "Developer Tools", license: "MIT", submitter: "coderay", risk: "Low" }
];

const reports = [
  { resource: "Archive Noir — Public Domain Film Cuts", reason: "License clarification", status: "Open" },
  { resource: "ForgePress Minimal Blog Template", reason: "Trademark concern", status: "Reviewing" }
];

export function AdminPanel() {
  const [queue, setQueue] = useState(initialQueue);

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
      <section className="rounded-[2rem] border border-white/10 bg-[#181818]/85 p-6 shadow-2xl shadow-black/20">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ff6b35]">Moderation queue</p>
            <h2 className="mt-2 text-2xl font-black text-white">Approve or reject resources</h2>
          </div>
          <ShieldAlert className="h-8 w-8 text-[#ff6b35]" />
        </div>
        <div className="grid gap-4">
          {queue.map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-black/30 p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h3 className="font-black text-white">{item.title}</h3>
                  <p className="mt-1 text-sm text-neutral-400">{item.category} · {item.license} · submitted by {item.submitter} · risk {item.risk}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setQueue((q) => q.filter((row) => row.title !== item.title))} className="rounded-2xl bg-green-500/15 px-4 py-2 text-sm font-black text-green-300 ring-1 ring-green-500/20"><CheckCircle2 className="mr-1 inline h-4 w-4" />Approve</button>
                  <button onClick={() => setQueue((q) => q.filter((row) => row.title !== item.title))} className="rounded-2xl bg-red-500/15 px-4 py-2 text-sm font-black text-red-300 ring-1 ring-red-500/20"><XCircle className="mr-1 inline h-4 w-4" />Reject</button>
                </div>
              </div>
            </div>
          ))}
          {queue.length === 0 && <p className="rounded-3xl border border-white/10 bg-black/30 p-8 text-center text-neutral-300">Moderation queue cleared.</p>}
        </div>
      </section>
      <aside className="grid gap-5">
        <div className="rounded-[2rem] border border-white/10 bg-[#181818]/85 p-6">
          <h3 className="mb-4 flex items-center gap-2 font-black text-white"><Flag className="h-5 w-5 text-[#ff6b35]" /> Reports</h3>
          <div className="grid gap-3">
            {reports.map((report) => <div key={report.resource} className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm"><p className="font-bold text-white">{report.resource}</p><p className="text-neutral-400">{report.reason} · {report.status}</p></div>)}
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-[#181818]/85 p-6">
          <h3 className="mb-4 flex items-center gap-2 font-black text-white"><Layers3 className="h-5 w-5 text-[#ff6b35]" /> Management</h3>
          <div className="grid gap-3 text-sm text-neutral-300">
            <button className="rounded-2xl border border-white/10 bg-white/5 p-3 text-left hover:border-[#ff6b35]/40">Manage categories</button>
            <button className="rounded-2xl border border-white/10 bg-white/5 p-3 text-left hover:border-[#ff6b35]/40">Modify licenses</button>
            <button className="rounded-2xl border border-white/10 bg-white/5 p-3 text-left hover:border-[#ff6b35]/40"><Ban className="mr-2 inline h-4 w-4" />Ban user</button>
          </div>
        </div>
      </aside>
    </div>
  );
}
