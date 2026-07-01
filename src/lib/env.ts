// Env loader untuk Better Auth — pola mengikuti base-template2 (standar tim),
// TANPA REDIS_URL (desa-darmasaba: session store Postgres saja).

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const env = {
  NODE_ENV: optional("NODE_ENV", "development"),
  PORT: parseInt(optional("PORT", "3000"), 10),
  DATABASE_URL: required("DATABASE_URL"),
  GOOGLE_CLIENT_ID: required("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: required("GOOGLE_CLIENT_SECRET"),
  BETTER_AUTH_SECRET: required("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: optional("BETTER_AUTH_URL", ""),
  // Comma-separated email → auto-promote ke roleId "1" (SUPER ADMIN)
  SUPER_ADMIN_EMAILS: optional("SUPER_ADMIN_EMAIL", "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean),
} as const;
