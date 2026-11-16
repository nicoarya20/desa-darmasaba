// Daftar env yang ditampilkan di Ringkasan Sistem: HANYA nama + status terisi, nilai tidak pernah keluar.
// Allowlist eksplisit supaya env lain (mis. sisa Seafile) tidak ikut bocor namanya.
export const SYSTEM_ENV_ALLOWLIST: readonly string[] = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "SUPER_ADMIN_EMAIL",
  "DEVELOPER_EMAIL",
  "MINIO_ENDPOINT",
  "MINIO_ACCESS_KEY",
  "MINIO_SECRET_KEY",
  "MINIO_BUCKET",
  "MINIO_USE_SSL",
  "JENNA_CREDENTIALS_KEY",
  "NEXT_PUBLIC_BASE_URL",
];

export function buildEnvChecklist(
  getEnv: (name: string) => string | undefined,
  names: readonly string[] = SYSTEM_ENV_ALLOWLIST,
): { name: string; set: boolean }[] {
  return names.map((name) => ({ name, set: (getEnv(name)?.trim() ?? "") !== "" }));
}
