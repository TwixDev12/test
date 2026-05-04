import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  ["Open Source Apps", "open-source-apps", "Code2", "Free and open-source applications."],
  ["Indie Games", "indie-games", "Gamepad2", "Free indie games and prototypes."],
  ["Creative Commons Music", "creative-commons-music", "Music2", "CC-licensed loops, albums and samples."],
  ["Public Domain Movies", "public-domain-movies", "Film", "Movies and footage in the public domain."],
  ["Ebooks", "ebooks", "BookOpen", "Public-domain and permissive ebooks."],
  ["Design Assets", "design-assets", "Palette", "Icons, UI kits, templates and visual packs."],
  ["Developer Tools", "developer-tools", "Terminal", "Libraries, CLIs, SDKs and utilities."],
  ["Datasets", "datasets", "Database", "Open data and research datasets."],
  ["Education", "education", "GraduationCap", "Courses, notes and learning packs."],
  ["Other", "other", "Boxes", "Miscellaneous legal resources."]
] as const;

const licenses = [
  ["MIT", "mit", "Permissive open-source license.", "https://opensource.org/license/mit"],
  ["Apache-2.0", "apache-2-0", "Permissive license with patent grant.", "https://www.apache.org/licenses/LICENSE-2.0"],
  ["GPL-3.0", "gpl-3-0", "Copyleft open-source license.", "https://www.gnu.org/licenses/gpl-3.0.en.html"],
  ["CC BY 4.0", "cc-by-4-0", "Creative Commons attribution license.", "https://creativecommons.org/licenses/by/4.0/"],
  ["CC0", "cc0", "Public-domain dedication.", "https://creativecommons.org/publicdomain/zero/1.0/"],
  ["Public Domain", "public-domain", "No known copyright restrictions.", "https://creativecommons.org/publicdomain/mark/1.0/"],
  ["Freeware", "freeware", "Free to use according to the official publisher terms.", null]
] as const;

async function main() {
  for (const [name, slug, icon, description] of categories) {
    await prisma.category.upsert({
      where: { slug },
      update: { name, icon, description },
      create: { name, slug, icon, description }
    });
  }

  for (const [name, slug, description, url] of licenses) {
    await prisma.license.upsert({
      where: { slug },
      update: { name, description, url: url ?? undefined },
      create: { name, slug, description, url: url ?? undefined }
    });
  }

  const admin = await prisma.user.upsert({
    where: { email: "admin@nexushub.local" },
    update: {},
    create: {
      email: "admin@nexushub.local",
      username: "nexus-admin",
      passwordHash: await bcrypt.hash("NexusHubAdmin123!", 12),
      role: "ADMIN",
      trustScore: 95
    }
  });

  const openSource = await prisma.category.findUniqueOrThrow({ where: { slug: "open-source-apps" } });
  const datasets = await prisma.category.findUniqueOrThrow({ where: { slug: "datasets" } });
  const mit = await prisma.license.findUniqueOrThrow({ where: { slug: "mit" } });
  const cc0 = await prisma.license.findUniqueOrThrow({ where: { slug: "cc0" } });

  await prisma.resource.upsert({
    where: { slug: "atlas-note-open-source-notes" },
    update: {},
    create: {
      title: "Atlas Note — Open Source Knowledge Vault",
      slug: "atlas-note-open-source-notes",
      shortDesc: "Markdown-first note system for teams and solo builders.",
      description: "Atlas Note is a legal open-source knowledge vault demo resource. It supports Markdown, backlinks, tags, and exportable local-first archives.",
      officialUrl: "https://github.com/",
      authorName: "Nexus Demo Collective",
      tags: "notes,markdown,productivity,open-source",
      downloads: 184200,
      ratingAvg: 4.8,
      ratingCount: 3912,
      trustScore: 96,
      verified: true,
      safeDownload: true,
      status: "APPROVED",
      categoryId: openSource.id,
      licenseId: mit.id,
      submittedById: admin.id,
      imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
    }
  });

  await prisma.resource.upsert({
    where: { slug: "civic-data-clean-air-pack" },
    update: {},
    create: {
      title: "Civic Data — Clean Air Pack",
      slug: "civic-data-clean-air-pack",
      shortDesc: "Open environmental dataset pack for dashboards and research prototypes.",
      description: "A curated CC0 dataset bundle for air quality visualizations, educational notebooks, and civic-tech experiments.",
      officialUrl: "https://data.gov/",
      authorName: "Open Civic Lab",
      tags: "dataset,air-quality,civic-tech,education",
      downloads: 98320,
      ratingAvg: 4.6,
      ratingCount: 842,
      trustScore: 91,
      verified: true,
      safeDownload: true,
      status: "APPROVED",
      categoryId: datasets.id,
      licenseId: cc0.id,
      submittedById: admin.id,
      imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
