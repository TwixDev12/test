export type BadgeType = "verified" | "open-source" | "creative-commons" | "public-domain" | "safe-download";

export type Category = {
  name: string;
  slug: string;
  icon: string;
  description: string;
  count: number;
};

export type Resource = {
  id: string;
  title: string;
  slug: string;
  category: string;
  categorySlug: string;
  license: string;
  licenseSlug: string;
  shortDesc: string;
  description: string;
  downloads: number;
  rating: number;
  ratingCount: number;
  author: string;
  authorUrl?: string;
  addedAt: string;
  size: string;
  tags: string[];
  verified: boolean;
  safeDownload: boolean;
  trustScore: number;
  officialUrl: string;
  image: string;
  screenshots: string[];
  badges: BadgeType[];
};

export type ReportPayload = {
  resourceSlug?: string;
  email?: string;
  reason: string;
  details: string;
};
