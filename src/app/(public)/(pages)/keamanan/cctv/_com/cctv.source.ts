import type { CctvStatusKey } from "./cctv.meta";
import { CCTV_LIST_LIMIT } from "./cctv.meta";

/** Kolom CCTV yang dipakai halaman publik, sudah dinormalkan dari respons `find-many`. */
export type CctvItem = {
  id: string;
  kode: string;
  nama: string;
  lokasi: string;
  latitude: number | null;
  longitude: number | null;
  status: CctvStatusKey;
  lastActive: string | null;
};

/** Bentuk mentah satu baris respons API (dibaca longgar: kolom bisa null/kosong dari data admin). */
type RawCctv = {
  id?: unknown;
  kode?: unknown;
  nama?: unknown;
  lokasi?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  status?: unknown;
  lastActive?: unknown;
};

type Body = { success?: boolean; message?: string; data?: RawCctv[] | null } | null;

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

function coord(value: unknown, limit: number): number | null {
  return typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= limit ? value : null;
}

/** Status admin "Online"/"Offline" (besar/kecil huruf bebas); nilai lain = belum diisi. */
export function toStatusKey(value: unknown): CctvStatusKey {
  const s = text(value).toLowerCase();
  return s === "online" ? "online" : s === "offline" ? "offline" : "unknown";
}

/** Normalkan satu baris respons; koordinat tidak valid → null (titik tidak dipetakan). */
export function toCctvItem(raw: RawCctv): CctvItem {
  const latitude = coord(raw.latitude, 90);
  const longitude = coord(raw.longitude, 180);
  const both = latitude !== null && longitude !== null;
  return {
    id: String(raw.id ?? ""),
    kode: text(raw.kode),
    nama: text(raw.nama),
    lokasi: text(raw.lokasi),
    latitude: both ? latitude : null,
    longitude: both ? longitude : null,
    status: toStatusKey(raw.status),
    lastActive: text(raw.lastActive) || null,
  };
}

/** Semua titik CCTV aktif (urutan kode dari API), untuk peta dan daftar sekaligus. */
export async function loadCctvList(): Promise<CctvItem[]> {
  const res = await fetch(`/api/keamanan/cctv/find-many?page=1&limit=${CCTV_LIST_LIMIT}`);
  // Badan bukan JSON (mis. halaman galat proxy) → null; dilempar sebagai galat berisi status HTTP.
  const body = (await res.json().catch(() => null)) as Body;
  if (!res.ok || !body?.success || !Array.isArray(body.data)) {
    throw new Error(`Daftar CCTV gagal (HTTP ${res.status}): ${body?.message ?? "respons tidak valid"}`);
  }
  return body.data.map(toCctvItem);
}
