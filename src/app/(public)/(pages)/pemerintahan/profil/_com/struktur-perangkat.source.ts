import stateStrukturPerangkat from '@/app/admin/(dashboard)/_state/desa/struktur-perangkat'
import type { StrukturDetailLoader } from '@/app/(public)/_com/struktur-organisasi/struktur-person.logic'
import type { PegawaiItem, PosisiItem } from '@/app/(public)/_com/struktur-organisasi/struktur.logic'
import { STRUKTUR_PEGAWAI_LIMIT } from '@/app/(public)/_com/struktur-organisasi/struktur.meta'
import type { StrukturSource } from '@/app/(public)/_com/struktur-organisasi/use-struktur-data'

/*
 * Sumber Struktur Perangkat Desa: tabel sendiri (`/api/desa/strukturperangkat`), terpisah dari Struktur PPID.
 * Dipakai section Profil Desa, halaman bagan, dan halaman profil pegawai. Loader state menangkap galatnya
 * sendiri dan mengosongkan data, jadi hasil `null` dibaca sebagai daftar kosong ("Data sedang disiapkan").
 */

/** Sumber bagan Struktur Perangkat Desa: pegawai aktif + jabatan aktif (beserta atasan & urutan). */
export const strukturPerangkatSource: StrukturSource = {
  async loadPegawai() {
    await stateStrukturPerangkat.pegawai.findMany.load(1, STRUKTUR_PEGAWAI_LIMIT, '', true)
    return (stateStrukturPerangkat.pegawai.findMany.data ?? []) as PegawaiItem[]
  },
  async loadPosisi() {
    await stateStrukturPerangkat.posisi.findManyAll.load(true)
    return (stateStrukturPerangkat.posisi.findManyAll.data ?? []) as PosisiItem[]
  },
}

/** Pemuat profil pegawai untuk `/pemerintahan/profil/struktur-perangkat-desa/[id]`; tidak ditemukan → `null`. */
export const loadPerangkatDetail: StrukturDetailLoader = (id) => stateStrukturPerangkat.pegawai.findUnique.load(id)
