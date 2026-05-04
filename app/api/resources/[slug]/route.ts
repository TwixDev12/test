import { NextRequest, NextResponse } from "next/server";
import { getResource } from "@/lib/repository";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = await getResource(slug);
  if (!resource) return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  return NextResponse.json({ resource });
}
