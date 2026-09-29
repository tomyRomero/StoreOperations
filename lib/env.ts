import { z } from "zod";

// Server-side environment variables, validated once on first use.
// Every variable is documented in .env.example. Browser code reads
// NEXT_PUBLIC_* variables directly, because Next inlines them at build time.

const optional = z
  .string()
  .optional()
  .transform((value) => (value === "" ? undefined : value));

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Database
  MONGODB_URL: z
    .string()
    .regex(/^mongodb(\+srv)?:\/\//, "must be a mongodb:// or mongodb+srv:// connection string"),

  // Auth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32, "must be at least 32 characters (openssl rand -base64 32)"),

  // Public site URL, used in emails and payment redirects
  NEXT_PUBLIC_URL: z.string().url(),
  // Base URL the server uses to call its own API routes (removed in Phase 3)
  AXIOS_URL: z.string().url(),

  // Stripe. Optional so the store runs without it; checkout needs all three.
  // Only test-mode keys are accepted: this project never charges real cards.
  STRIPE_SECRET_KEY: optional.pipe(
    z.string().regex(/^(sk|rk)_test_/, "must be a Stripe test-mode key (sk_test_...)").optional()
  ),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optional.pipe(
    z.string().regex(/^pk_test_/, "must be a Stripe test-mode key (pk_test_...)").optional()
  ),
  STRIPE_WEBHOOK_SECRET: optional.pipe(
    z.string().regex(/^whsec_/, "must start with whsec_").optional()
  ),

  // Image storage: AWS S3, or any S3-compatible server such as S3Mock locally
  AWS_REGION: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  BUCKET_NAME: z.string().min(1),
  S3_ENDPOINT: optional.pipe(z.string().url().optional()),

  // Outgoing email over SMTP (Mailpit locally)
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_USER: optional,
  SMTP_PASSWORD: optional,
  EMAIL_FROM: z.string().min(3),
});

export type Env = z.infer<typeof envSchema>;

// Validates a set of variables and lists every problem in one error
export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables (see .env.example):\n${problems}`);
  }
  return result.data;
}

let cached: Env | undefined;

export function getEnv(): Env {
  if (!cached) cached = parseEnv(process.env);
  return cached;
}
