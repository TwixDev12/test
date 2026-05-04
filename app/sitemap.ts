import type { MetadataRoute } from "next";
import { resources } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const staticRoutes = ["", "/search", "/categories", "/trending", "/top-100", "/submit", "/auth"];
  return [
    ...staticRoutes.map((route) => ({ url: `${baseUrl}${route}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: route === "" ? 1 : 0.8 })),
    ...resources.map((resource) => ({ url: `${baseUrl}/resource/${resource.slug}`, lastModified: new Date(resource.addedAt), changeFrequency: "monthly" as const, priority: 0.7 }))
  ];
}
