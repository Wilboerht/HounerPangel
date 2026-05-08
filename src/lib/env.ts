import { z } from "zod";

const envSchema = z.object({
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().min(1, "NEXT_PUBLIC_SUPABASE_URL is required"),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
    ADMIN_PASSWORD: z.string().min(1, "ADMIN_PASSWORD is required"),
    NEXT_PUBLIC_MAPBOX_TOKEN: z.string().optional(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment variables:\n${errors}`);
}

export const env = parsed.data;
