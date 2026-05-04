import { NextRequest, NextResponse } from "next/server";
import { getRequestKey, rateLimit } from "@/lib/rate-limit";
import { listResources } from "@/lib/repository";
import { sanitizeText, slugify } from "@/lib/utils";
import { resourceSubmitSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resources = await listResources({
    q: searchParams.get("q") || undefined,
    category: searchParams.get("category") || undefined,
    license: searchParams.get("license") || undefined,
    sort: searchParams.get("sort") || undefined,
    minRating: searchParams.get("minRating") ? Number(searchParams.get("minRating")) : undefined
  });
  return NextResponse.json({ resources });
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(getRequestKey(request, "resource-submit"), 8, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many submissions. Please slow down." }, { status: 429 });

  const json = await request.json().catch(() => null);
  const parsed = resourceSubmitSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid submission." }, { status: 400 });

  const data = parsed.data;
  const safePayload = {
    title: sanitizeText(data.title),
    slug: slugify(data.title),
    description: sanitizeText(data.description),
    category: data.category,
    license: data.license,
    officialUrl: data.officialUrl,
    author: sanitizeText(data.author),
    tags: sanitizeText(data.tags ?? ""),
    image: data.image || null,
    status: "PENDING"
  };

  if (process.env.NEXUSHUB_USE_DB === "true" && process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("@/lib/prisma");
      const category = await prisma.category.findFirst({ where: { OR: [{ slug: data.category }, { name: data.category }] } });
      const license = await prisma.license.findFirst({ where: { OR: [{ slug: slugify(data.license) }, { name: data.license }] } });
      if (category && license) {
        await prisma.resource.create({
          data: {
            title: safePayload.title,
            slug: `${safePayload.slug}-${Date.now()}`,
            shortDesc: safePayload.description.slice(0, 240),
            description: safePayload.description,
            officialUrl: safePayload.officialUrl,
            authorName: safePayload.author,
            imageUrl: safePayload.image ?? undefined,
            tags: safePayload.tags,
            status: "PENDING",
            categoryId: category.id,
            licenseId: license.id
          }
        });
      }
    } catch (error) {
      console.error("Resource DB submit failed", error);
    }
  }

  return NextResponse.json({ message: "Resource submitted for moderation before publication.", resource: safePayload }, { status: 202 });
}
