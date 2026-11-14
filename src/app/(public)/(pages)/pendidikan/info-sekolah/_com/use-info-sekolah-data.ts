'use client';
import infoSekolahPaud from '@/app/admin/(dashboard)/_state/pendidikan/info-sekolah-paud';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { INFO_SEKOLAH_PAGE_SIZE, type InfoSekolahQuery } from './info-sekolah.logic';

/** Batas jenjang yang diminta ke API untuk opsi filter (jenjang di desa hanya beberapa). */
const JENJANG_LIMIT = 100;

type ListState = {
  data: unknown;
  load: (page: number, limit: number, search: string, jenjang: string, sortByJenjang: boolean) => Promise<unknown>;
};

/**
 * Muat satu halaman tabel tiap kali jenjang/kata kunci/halaman di URL berubah. State valtio dipakai bersama halaman
 * ringkasan, jadi `data` dikosongkan saat keluar: kunjungan berikutnya mulai dari kerangka, bukan baris sisa
 * dengan filter lain.
 */
export function useInfoSekolahLoad(state: ListState, { page, search, jenjang }: InfoSekolahQuery): void {
  const { load } = state;
  useEffect(() => {
    // Publik: baris urut jenjang (TK, SD, SMP, …), di dalam jenjang urut nama.
    void load(page, INFO_SEKOLAH_PAGE_SIZE, search, jenjang, true);
  }, [load, page, search, jenjang]);
  useEffect(
    () => () => {
      state.data = null;
    },
    [state],
  );
}

/**
 * Nama jenjang yang punya lembaga aktif, untuk opsi filter (jenjang kosong seperti PAUD tanpa sekolah tidak ditawarkan).
 * Selalu dimuat ulang saat dibuka: state ini dipakai bersama admin yang memuat semua jenjang.
 */
export function useJenjangNames(): string[] {
  const snap = useSnapshot(infoSekolahPaud.jenjangPendidikan.findMany);
  const { load } = infoSekolahPaud.jenjangPendidikan.findMany;
  const [ready, setReady] = useState(false);
  useEffect(() => {
    void load(1, JENJANG_LIMIT, '', true).then(() => setReady(true));
  }, [load]);
  return ready ? (snap.data ?? []).map((jenjang) => jenjang.nama) : [];
}
