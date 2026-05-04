import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: value > 9999 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function sanitizeText(value: string) {
  return value.replace(/[<>]/g, "").trim().slice(0, 5000);
}

export function isSafeUrl(value: string) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export function badgeLabel(type: string) {
  const labels: Record<string, string> = {
    verified: "Verified Source",
    "open-source": "Open Source",
    "creative-commons": "Creative Commons",
    "public-domain": "Public Domain",
    "safe-download": "Safe Download"
  };
  return labels[type] ?? type;
}
