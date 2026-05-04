import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { getRequestKey, rateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const limited = rateLimit(getRequestKey(request, "auth-register"), 12, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many auth attempts." }, { status: 429 });

  const json = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid registration." }, { status: 400 });

  if (process.env.NEXUSHUB_USE_DB !== "true" || !process.env.DATABASE_URL) {
    const token = signToken({ id: "demo-user", email: parsed.data.email, username: parsed.data.username, role: "USER" });
    return NextResponse.json({ message: "Demo registration created. Connect MySQL for persistence.", token });
  }

  const { prisma } = await import("@/lib/prisma");
  const existing = await prisma.user.findFirst({ where: { OR: [{ email: parsed.data.email }, { username: parsed.data.username }] } });
  if (existing) return NextResponse.json({ error: "Email or username already exists." }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      username: parsed.data.username,
      passwordHash: await bcrypt.hash(parsed.data.password, 12)
    }
  });

  const token = signToken({ id: user.id, email: user.email, username: user.username, role: user.role });
  return NextResponse.json({ message: "Account created.", token });
}
