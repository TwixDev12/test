import { resources as demoResources } from "@/lib/data";
import type { Resource } from "@/types";

function useDatabase() {
  return process.env.NEXUSHUB_USE_DB === "true" && Boolean(process.env.DATABASE_URL);
}

function mapPrismaResource(resource: any): Resource {
  const categoryName = resource.category?.name ?? "Other";
  const licenseName = resource.license?.name ?? "Unknown";
  const tags = typeof resource.tags === "string" ? resource.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean) : [];
  const badges: Resource["badges"] = [];
  if (resource.verified) badges.push("verified");
  if (["MIT", "Apache-2.0", "GPL-3.0"].includes(licenseName)) badges.push("open-source");
  if (licenseName.toLowerCase().includes("cc")) badges.push("creative-commons");
  if (licenseName.toLowerCase().includes("public") || licenseName === "CC0") badges.push("public-domain");
  if (resource.safeDownload) badges.push("safe-download");

  return {
    id: resource.id,
    title: resource.title,
    slug: resource.slug,
    category: categoryName,
    categorySlug: resource.category?.slug ?? "other",
    license: licenseName,
    licenseSlug: resource.license?.slug ?? "unknown",
    shortDesc: resource.shortDesc,
    description: resource.description,
    downloads: resource.downloads,
    rating: resource.ratingAvg,
    ratingCount: resource.ratingCount,
    author: resource.authorName,
    authorUrl: resource.authorUrl ?? undefined,
    addedAt: resource.addedAt?.toISOString?.() ?? new Date().toISOString(),
    size: resource.sizeLabel,
    tags,
    verified: resource.verified,
    safeDownload: resource.safeDownload,
    trustScore: resource.trustScore,
    officialUrl: resource.officialUrl,
    image: resource.imageUrl || "https://placehold.co/1200x800/181818/f5f5f5?text=NexusHub",
    screenshots: resource.screenshots?.map((image: any) => image.url) ?? [],
    badges
  };
}

export async function listResources(params?: {
  q?: string;
  category?: string;
  license?: string;
  sort?: string;
  minRating?: number;
}) {
  if (useDatabase()) {
    const { prisma } = await import("@/lib/prisma");
    const dbResources = await prisma.resource.findMany({
      where: {
        status: "APPROVED",
        ...(params?.q
          ? {
              OR: [
                { title: { contains: params.q } },
                { shortDesc: { contains: params.q } },
                { description: { contains: params.q } },
                { tags: { contains: params.q } }
              ]
            }
          : {}),
        ...(params?.category && params.category !== "all" ? { category: { slug: params.category } } : {}),
        ...(params?.license && params.license !== "all" ? { license: { slug: params.license } } : {}),
        ...(params?.minRating ? { ratingAvg: { gte: params.minRating } } : {})
      },
      include: { category: true, license: true, screenshots: true },
      orderBy: params?.sort === "newest" ? { addedAt: "desc" } : params?.sort === "rating" ? { ratingAvg: "desc" } : { downloads: "desc" }
    });
    return dbResources.map(mapPrismaResource);
  }

  let output = [...demoResources];
  if (params?.q) {
    const q = params.q.toLowerCase();
    output = output.filter((resource) =>
      [resource.title, resource.shortDesc, resource.description, resource.author, resource.category, resource.license, ...resource.tags]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }
  if (params?.category && params.category !== "all") output = output.filter((resource) => resource.categorySlug === params.category);
  if (params?.license && params.license !== "all") output = output.filter((resource) => resource.licenseSlug === params.license);
  if (params?.minRating) output = output.filter((resource) => resource.rating >= Number(params.minRating));
  if (params?.sort === "newest") output.sort((a, b) => +new Date(b.addedAt) - +new Date(a.addedAt));
  else if (params?.sort === "rating") output.sort((a, b) => b.rating - a.rating);
  else output.sort((a, b) => b.downloads - a.downloads);
  return output;
}

export async function getResource(slug: string) {
  if (useDatabase()) {
    const { prisma } = await import("@/lib/prisma");
    const resource = await prisma.resource.findUnique({
      where: { slug },
      include: { category: true, license: true, screenshots: true }
    });
    return resource ? mapPrismaResource(resource) : null;
  }
  return demoResources.find((resource) => resource.slug === slug) ?? null;
}
