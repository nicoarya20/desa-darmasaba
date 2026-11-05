import { toDuplicateResponse, toForeignKeyResponse } from "@/lib/prisma-error";
import type { ZodError } from "zod";

/** Batas atas `limit` list endpoint BUMDes agar satu request tidak menarik seluruh tabel. */
export const MAX_PAGE_LIMIT = 100;
const DEFAULT_PAGE_LIMIT = 10;

// Context Elysia dilonggarkan: kita hanya menulis `set.status`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StatusContext = { set: { status?: any } };

/** Ubah query string `page`/`limit` menjadi angka aman (page >= 1, 1 <= limit <= MAX_PAGE_LIMIT). */
export function parsePagination(query: Record<string, unknown>) {
  const page = Math.max(1, Math.floor(Number(query.page)) || 1);
  const rawLimit = Math.floor(Number(query.limit)) || DEFAULT_PAGE_LIMIT;
  const limit = Math.min(MAX_PAGE_LIMIT, Math.max(1, rawLimit));
  return { page, limit, skip: (page - 1) * limit };
}

/** Response 400 seragam untuk body yang gagal validasi zod. */
export function validationFailure(context: StatusContext, error: ZodError) {
  context.set.status = 400;
  return {
    success: false as const,
    message: error.issues.map((issue) => issue.message).join("; "),
  };
}

/** Response error tulis: 409 untuk duplikat, 422 untuk imageId yang tidak ada; selain itu dilempar ulang. */
export function writeFailure(error: unknown, context: StatusContext) {
  const duplicate = toDuplicateResponse(error);
  if (duplicate) {
    context.set.status = 409;
    return duplicate;
  }
  const foreignKey = toForeignKeyResponse(error);
  if (foreignKey) {
    context.set.status = 422;
    return foreignKey;
  }
  throw error;
}

/** Select gambar yang aman dikirim ke publik (tanpa path server). */
export const IMAGE_SELECT = {
  select: { id: true, name: true, link: true },
} as const;
