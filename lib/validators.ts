import { z } from "zod";

export const resourceSubmitSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(40).max(5000),
  category: z.string().min(2).max(80),
  license: z.string().min(2).max(80),
  officialUrl: z.string().url().refine((value) => value.startsWith("https://") || value.startsWith("http://"), "Official URL must be HTTP or HTTPS"),
  author: z.string().min(2).max(120),
  tags: z.string().max(240).optional().default(""),
  image: z.string().url().optional().or(z.literal(""))
});

export const reportSchema = z.object({
  resourceSlug: z.string().max(160).optional(),
  email: z.string().email().optional().or(z.literal("")),
  reason: z.string().min(3).max(160),
  details: z.string().min(20).max(4000)
});

export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_-]+$/),
  password: z.string().min(10).max(100)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(100)
});
