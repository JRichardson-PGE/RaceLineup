import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1, "Password is required"),
});

export const createPromoterSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "PROMOTER"]),
});

export const eventDetailsSchema = z.object({
  name: z.string().trim().min(1, "Event name is required"),
  location: z.string().trim().min(1, "Location is required"),
  eventDate: z.string().min(1, "Event date is required"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "URL slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
});

export const classEntrySchema = z.object({
  className: z.string().trim().min(1, "Class name is required"),
  laps: z.coerce.number().int().min(1, "Must be at least 1"),
  numRacers: z.coerce.number().int().min(0, "Cannot be negative"),
});

export const gateDropSchema = z.object({
  gateNumber: z.coerce.number().int().min(1, "Must be at least 1"),
  classEntries: z.array(classEntrySchema).min(1, "Add at least one class"),
});

export const raceSchema = z.object({
  raceNumber: z.coerce.number().int().min(1, "Must be at least 1"),
  gateDrops: z.array(gateDropSchema).min(1, "Add at least one gate drop"),
});

export const lineupSchema = z.object({
  races: z.array(raceSchema),
});

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
