import type { Prisma } from "@prisma/client";
import {
  validateLinkTokoOnlineList,
  type LinkTokoOnlineNormal,
  type LinkValidation,
} from "@/lib/link-toko-online";

/** Include relasi link untuk output produk: hanya link aktif, terurut `urutan` (satu query batch, tanpa N+1). */
export const LINK_TOKO_INCLUDE = {
  where: { deletedAt: null, isActive: true },
  orderBy: [{ urutan: "asc" }, { createdAt: "asc" }],
} satisfies Prisma.PasarDesa$linkTokoOnlineArgs;

/**
 * Validasi field opsional `linkTokoOnline` dari body create/update.
 * `undefined` = klien lama tidak mengirim field → link yang ada tidak disentuh.
 */
export function parseLinkBody(body: { linkTokoOnline?: unknown }): LinkValidation<LinkTokoOnlineNormal[]> | undefined {
  if (body.linkTokoOnline === undefined) return undefined;
  return validateLinkTokoOnlineList(body.linkTokoOnline);
}

/** Output produk dengan link tersembunyi bila produk sudah soft-delete. */
export function sembunyikanLinkBilaDihapus<T extends { deletedAt: Date | null; linkTokoOnline: unknown[] }>(produk: T): T {
  return produk.deletedAt ? { ...produk, linkTokoOnline: [] } : produk;
}
