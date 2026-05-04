"use client";

import { FormEvent, useState } from "react";
import { LockKeyhole, UserPlus } from "lucide-react";

export function AuthPanel() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (res.ok && json.token) localStorage.setItem("nexushub:token", json.token);
    setMessage(res.ok ? json.message || "Success." : json.error || "Auth failed.");
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_0.8fr]">
      <section className="rounded-[2rem] border border-white/10 bg-[#181818]/85 p-8 shadow-2xl shadow-black/20">
        <div className="mb-7 flex gap-3">
          <button onClick={() => setMode("login")} className={`rounded-full px-5 py-2 text-sm font-black ${mode === "login" ? "bg-[#e74c3c] text-white" : "border border-white/10 text-neutral-300"}`}>Login</button>
          <button onClick={() => setMode("register")} className={`rounded-full px-5 py-2 text-sm font-black ${mode === "register" ? "bg-[#e74c3c] text-white" : "border border-white/10 text-neutral-300"}`}>Register</button>
        </div>
        <form onSubmit={onSubmit} className="grid gap-5">
          {mode === "register" && <label className="grid gap-2 text-sm font-semibold text-neutral-300">Username<input name="username" required className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#ff6b35]/60" /></label>}
          <label className="grid gap-2 text-sm font-semibold text-neutral-300">Email<input name="email" type="email" required className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#ff6b35]/60" /></label>
          <label className="grid gap-2 text-sm font-semibold text-neutral-300">Password<input name="password" type="password" required minLength={mode === "register" ? 10 : 1} className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none focus:border-[#ff6b35]/60" /></label>
          <button className="focus-ring rounded-2xl bg-gradient-to-r from-[#e74c3c] to-[#ff6b35] px-6 py-4 font-black text-white transition hover:scale-[1.01]">
            {mode === "login" ? "Login" : "Create account"}
          </button>
          {message && <p className="text-sm text-neutral-300">{message}</p>}
        </form>
      </section>
      <aside className="rounded-[2rem] border border-white/10 bg-black/30 p-8">
        <div className="mb-5 inline-grid h-14 w-14 place-items-center rounded-2xl bg-[#ff6b35]/10 text-[#ff6b35]">
          {mode === "login" ? <LockKeyhole className="h-7 w-7" /> : <UserPlus className="h-7 w-7" />}
        </div>
        <h2 className="text-2xl font-black text-white">User profile system</h2>
        <p className="mt-4 text-sm leading-7 text-neutral-400">
          Accounts unlock favorites, ratings, comments, submitted resources, profile history and trust badges. The included API demonstrates JWT-based auth with MySQL-ready Prisma models.
        </p>
        <div className="mt-6 grid gap-3 text-sm text-neutral-300">
          <span className="rounded-2xl border border-white/10 bg-white/5 p-3">Favorites history</span>
          <span className="rounded-2xl border border-white/10 bg-white/5 p-3">Submitted resources</span>
          <span className="rounded-2xl border border-white/10 bg-white/5 p-3">Trust badges</span>
        </div>
      </aside>
    </div>
  );
}
