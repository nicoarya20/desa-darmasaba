'use client';
import infoSekolahPaud from '@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { INFO_SEKOLAH_PAGE_SIZE, type InfoSekolahQuery } from './info-sekolah.logic';

/** Batas jenjang yang diminta ke API untuk opsi filter (jenjang di desa hanya beberapa). */
const JENJANG_LIMIT = 100;

type ListState = {
  data: unknown;
  load: (page: number, limit: number, search: string, jenjang: string) => Promise<unknown>;
};

/**
 * Muat satu halaman tabel tiap kali jenjang/kata kunci/halaman di URL berubah. State valtio dipakai bersama halaman
 * ringkasan, jadi `data` dikosongkan saat keluar: kunjungan berikutnya mulai dari kerangka, bukan baris sisa
 * dengan filter lain.
 */
export function useInfoSekolahLoad(state: ListState, { page, search, jenjang }: InfoSekolahQuery): void {
  const { load } = state;
  useEffect(() => {
    void load(page, INFO_SEKOLAH_PAGE_SIZE, search, jenjang);
  }, [load, page, search, jenjang]);
  useEffect(
    () => () => {
      state.data = null;
    },
    [state],
  );
}

/** Nama semua jenjang pendidikan untuk opsi filter; dimuat sekali bila belum ada. */
export function useJenjangNames(): string[] {
  const snap = useSnapshot(infoSekolahPaud.jenjangPendidikan.findMany);
  const { load } = infoSekolahPaud.jenjangPendidikan.findMany;
  const loaded = snap.data !== null;
  useEffect(() => {
    if (!loaded) void load(1, JENJANG_LIMIT);
  }, [loaded, load]);
  return (snap.data ?? []).map((jenjang) => jenjang.nama);
}
