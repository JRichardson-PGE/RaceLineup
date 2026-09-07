import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().trim().toLowerCase().min(1, "Enter your email or username"),
  password: z.string().min(1, "Password is required"),
});

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Must be at least 3 characters")
  .max(32, "Must be 32 characters or fewer")
  .regex(/^[a-z0-9._-]+$/, "Use lowercase letters, numbers, and . _ - only");

export const createPromoterSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    loginType: z.enum(["email", "username"]),
    email: z.string().trim().toLowerCase().optional(),
    username: z.string().trim().toLowerCase().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["ADMIN", "PROMOTER"]),
  })
  .superRefine((data, ctx) => {
    if (data.loginType === "email") {
      const result = z.string().email().safeParse(data.email ?? "");
      if (!result.success) {
        ctx.addIssue({
          code: "custom",
          path: ["email"],
          message: "Enter a valid email address",
        });
      }
    } else {
      const result = usernameSchema.safeParse(data.username ?? "");
      if (!result.success) {
        ctx.addIssue({
          code: "custom",
          path: ["username"],
          message: result.error.issues[0]?.message ?? "Invalid username",
        });
      }
    }
  });

export const eventDetailsSchema = z.object({
  name: z.string().trim().min(1, "Event name is required"),
  location: z.string().trim().min(1, "Location is required"),
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "URL slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
});

export const classEntrySchema = z.object({
  className: z.string().trim().min(1, "Class name is required"),
  numRacers: z.coerce.number().int().min(0, "Cannot be negative"),
});

export const gateDropSchema = z.object({
  gateNumber: z.coerce.number().int().min(1, "Must be at least 1"),
  classEntries: z.array(classEntrySchema).min(1, "Add at least one class"),
});

export const raceSchema = z.object({
  raceNumber: z.coerce.number().int().min(1, "Must be at least 1"),
  laps: z.coerce.number().int().min(1, "Must be at least 1"),
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
