import { readFindMany, type FindManyBody } from '@/app/(public)/_com/main-page/kabar-desa/kabar.source';
import ApiFetch from '@/lib/api-fetch';
import type { BeasiswaPayload } from '../_lib/beasiswaForm';
import { submitErrorMessage, toKeunggulan, toRingkasan, type Keunggulan, type KeunggulanApiItem, type Ringkasan, type RingkasanApi } from './beasiswa.logic';
import { KEUNGGULAN_LIST_LIMIT } from './beasiswa.meta';

// Sumber data halaman publik sendiri (bukan state admin): tanpa efek samping memuat daftar pendaftar.

/** Semua keunggulan program aktif (maks KEUNGGULAN_LIST_LIMIT); galat → Error berkonteks. */
export async function loadKeunggulan(): Promise<Keunggulan[]> {
  const res = await ApiFetch.api.pendidikan.beasiswa.keunggulanprogram.findMany.get({
    query: { page: 1, limit: KEUNGGULAN_LIST_LIMIT },
  });
  const body = res.data as (FindManyBody & { total?: number }) | null;
  const items = readFindMany<KeunggulanApiItem>('keunggulan program beasiswa', res.status, body);
  const total = Number(body?.total);
  if (Number.isFinite(total) && total > items.length) {
    // MITIGASI SEMENTARA(beasiswa-keunggulan): lihat KEUNGGULAN_LIST_LIMIT.
    console.warn(`Keunggulan program: ${total} item, hanya ${items.length} pertama yang dimuat.`);
  }
  return toKeunggulan(items);
}

/** Ringkasan angka beasiswa; galat → Error berkonteks. */
export async function loadRingkasan(): Promise<Ringkasan> {
  const res = await ApiFetch.api.pendidikan.beasiswa.ringkasan.stats.get();
  const body = res.data as { success?: boolean; message?: string; data?: RingkasanApi } | null;
  if (res.status !== 200 || !body?.success || !body.data) {
    throw new Error(`ringkasan beasiswa gagal (HTTP ${res.status}): ${body?.message ?? 'respons tidak valid'}`);
  }
  return toRingkasan(body.data);
}

export type KirimResult = { ok: true } | { ok: false; status: number; message: string };

/**
 * Kirim pendaftaran ke `POST beasiswapendaftar/create` (endpoint & payload sama dengan form lama).
 * Gagal dikembalikan sebagai nilai (status + pesan manusiawi) supaya modal tetap terbuka dengan isian utuh.
 */
export async function kirimPendaftaran(payload: BeasiswaPayload): Promise<KirimResult> {
  try {
    const res = await ApiFetch.api.pendidikan.beasiswa.beasiswapendaftar.create.post(payload);
    const body = res.data as { success?: boolean } | null;
    if (res.status === 200 && body?.success) return { ok: true };
    console.error(`Kirim pendaftaran beasiswa gagal (HTTP ${res.status})`);
    return { ok: false, status: res.status, message: submitErrorMessage(res.status) };
  } catch (error) {
    console.error('Kirim pendaftaran beasiswa gagal (jaringan):', error);
    return { ok: false, status: 0, message: submitErrorMessage(0) };
  }
}
