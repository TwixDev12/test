import { NextRequest, NextResponse } from "next/server";
import { getRequestKey, rateLimit } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/utils";
import { reportSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const limited = rateLimit(getRequestKey(request, "report"), 10, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many reports. Please try again later." }, { status: 429 });

  const json = await request.json().catch(() => null);
  const parsed = reportSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid report." }, { status: 400 });

  const payload = {
    resourceSlug: parsed.data.resourceSlug,
    email: parsed.data.email || undefined,
    reason: sanitizeText(parsed.data.reason),
    details: sanitizeText(parsed.data.details)
  };

  if (process.env.NEXUSHUB_USE_DB === "true" && process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const resource = payload.resourceSlug ? await prisma.resource.findUnique({ where: { slug: payload.resourceSlug } }) : null;
      await prisma.report.create({
        data: {
          email: payload.email,
          reason: payload.reason,
          details: payload.details,
          resourceId: resource?.id
        }
      });
    } catch (error) {
      console.error("Report DB write failed", error);
    }
  }

  return NextResponse.json({ message: "Report received. Moderators will review it." }, { status: 202 });
}
