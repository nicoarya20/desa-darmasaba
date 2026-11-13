import type { KabarPage, KabarPageQuery } from "@/app/(public)/_com/kabar-list/use-kabar-page";
import { readFindMany, type FindManyBody } from "@/app/(public)/_com/main-page/kabar-desa/kabar.source";
import ApiFetch from "@/lib/api-fetch";
import { toKeamananLingkunganItem, type KeamananLingkunganApiItem } from "./keamanan-lingkungan.logic";

/** Satu halaman entri keamanan lingkungan aktif (urut terbaru), opsional disaring kata kunci (judul/isi). */
export async function loadKeamananLingkunganPage({ page, limit, search }: KabarPageQuery): Promise<KabarPage> {
  const query: Record<string, string | number> = { page, limit };
  if (search) query.search = search;
  const res = await ApiFetch.api.keamanan.keamananlingkungan["find-many"].get({ query });
  const body = res.data as (FindManyBody & { totalPages?: number }) | null | undefined;
  const items = readFindMany<KeamananLingkunganApiItem>("keamanan lingkungan", res.status, body).map(
    toKeamananLingkunganItem,
  );
  return { items, totalPages: Math.max(1, Number(body?.totalPages) || 1) };
}

type DetailBody = { success?: boolean; message?: string; data?: KeamananLingkunganApiItem | null } | null;

/** Detail satu entri. `null` = tidak ditemukan (API membalas 404); galat jaringan/server → Error berkonteks. */
export async function loadKeamananLingkunganDetail(id: string): Promise<KeamananLingkunganApiItem | null> {
  const res = await fetch(`/api/keamanan/keamananlingkungan/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`detail keamanan lingkungan ${id} gagal (HTTP ${res.status})`);
  const body = (await res.json()) as DetailBody;
  if (body?.success && body.data) return body.data;
  throw new Error(`detail keamanan lingkungan ${id} gagal: ${body?.message ?? "respons tidak valid"}`);
}
