import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { getRequestKey, rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const limited = rateLimit(getRequestKey(request, "auth-login"), 20, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many auth attempts." }, { status: 429 });

  const json = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid login." }, { status: 400 });

  if (process.env.NEXUSHUB_USE_DB !== "true" || !process.env.DATABASE_URL) {
    const token = signToken({ id: "demo-user", email: parsed.data.email, username: "demo", role: "USER" });
    return NextResponse.json({ message: "Demo login success. Connect MySQL for persistent users.", token });
  }

  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || user.role === "BANNED") return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });

  const token = signToken({ id: user.id, email: user.email, username: user.username, role: user.role });
  return NextResponse.json({ message: "Login success.", token });
}
