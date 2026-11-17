import { readFindMany, type FindManyBody } from '@/app/(public)/_com/main-page/kabar-desa/kabar.source';
import type { PegawaiItem, PosisiItem } from '@/app/(public)/_com/struktur-organisasi/struktur.logic';
import { STRUKTUR_PEGAWAI_LIMIT } from '@/app/(public)/_com/struktur-organisasi/struktur.meta';
import type { StrukturSource } from '@/app/(public)/_com/struktur-organisasi/use-struktur-data';
import ApiFetch from '@/lib/api-fetch';
import {
  readBody,
  toGaleri,
  toPengurusDetail,
  toProfil,
  toUnitUsaha,
  type ApiBody,
  type DokumenBumdes,
  type FotoApi,
  type GaleriFoto,
  type PengurusApi,
  type PengurusDetail,
  type Profil,
  type ProfilApi,
  type UnitUsaha,
  type UnitUsahaApi,
} from './bumdes.logic';
import { UNIT_USAHA_FETCH_LIMIT } from './bumdes.meta';

/*
 * Sumber data halaman BUMDes lewat ApiFetch langsung (bukan state admin). Galat jaringan/server dilempar dengan
 * konteks; halaman membedakannya dari data kosong.
 */

const strukturApi = () => ApiFetch.api.ekonomi['struktur-organisasi'];

/** Profil BUMDes (singleton); `null` = admin belum mengisi. */
export async function loadProfil(): Promise<Profil | null> {
  const res = await ApiFetch.api.ekonomi.bumdes.profil.get();
  const data = readBody<ProfilApi>('profil BUMDes', res.status, res.data as ApiBody<ProfilApi | null>);
  return data ? toProfil(data) : null;
}

/** Galeri foto profil (aktif, urut admin). */
export async function loadGaleri(): Promise<GaleriFoto[]> {
  const res = await ApiFetch.api.ekonomi.bumdes.profil.foto.get();
  return toGaleri(readFindMany<FotoApi>('galeri foto BUMDes', res.status, res.data as FindManyBody));
}

/** Semua unit usaha aktif (sekali muat). */
export async function loadUnitUsaha(): Promise<UnitUsaha[]> {
  const res = await ApiFetch.api.ekonomi.bumdes['unit-usaha']['find-many'].get({
    query: { page: 1, limit: UNIT_USAHA_FETCH_LIMIT },
  });
  const body = res.data as (FindManyBody & { total?: number }) | null | undefined;
  const items = readFindMany<UnitUsahaApi>('unit usaha BUMDes', res.status, body);
  if (Number(body?.total) > items.length) {
    console.warn(`Unit usaha BUMDes: ${body?.total} entri, hanya ${items.length} pertama yang ditampilkan.`);
  }
  return toUnitUsaha(items);
}

/** Sumber bagan: pengurus aktif + semua jabatan aktif (jabatan kosong digambar lewat `showVacant`). */
export const strukturBumdesSource: StrukturSource = {
  async loadPegawai() {
    const res = await strukturApi().pegawai['find-many'].get({
      query: { page: 1, limit: STRUKTUR_PEGAWAI_LIMIT, isActive: 'true' },
    });
    return readFindMany<PegawaiItem>('pengurus BUMDes', res.status, res.data as FindManyBody);
  },
  async loadPosisi() {
    const res = await strukturApi()['posisi-organisasi']['find-many-all'].get({ query: { isActive: 'true' } });
    return readFindMany<PosisiItem>('jabatan BUMDes', res.status, res.data as FindManyBody);
  },
};

/** Profil satu pengurus; `null` = tidak ada atau nonaktif. */
export async function loadPengurusDetail(id: string): Promise<PengurusDetail | null> {
  const res = await strukturApi().pegawai({ id }).get();
  if (res.status === 404) return null;
  const data = readBody<PengurusApi>(`profil pengurus BUMDes ${id}`, res.status, res.data as ApiBody<PengurusApi | null>);
  return data ? toPengurusDetail(data) : null;
}

/**
 * Dokumen BUMDes (SK pengurus, Perdes, AD/ART, laporan): bagian disiapkan tapi tidak dirender selama daftar kosong.
 * TODO(bumdes-dokumen): belum ada model/endpoint dokumen BUMDes (keputusan user 2026-11-16), lihat
 * docs/BACKEND-TODO.md; ganti dengan panggilan API begitu backend menyediakannya.
 */
export async function loadDokumen(): Promise<DokumenBumdes[]> {
  return [];
}
