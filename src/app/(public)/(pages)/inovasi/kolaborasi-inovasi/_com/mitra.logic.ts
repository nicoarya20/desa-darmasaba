/** Bentuk minimal item `/api/inovasi/mitrakolaborasi/find-many`. */
export type MitraApiItem = {
  id: string;
  name: string;
  image?: { link?: string | null } | null;
};

/** Satu mitra siap tampil; `logoUrl` tidak ada bila mitra belum diberi logo. */
export type Mitra = { id: string; name: string; logoUrl?: string };

export function toMitra(item: MitraApiItem): Mitra {
  return { id: item.id, name: item.name.trim(), logoUrl: item.image?.link || undefined };
}
