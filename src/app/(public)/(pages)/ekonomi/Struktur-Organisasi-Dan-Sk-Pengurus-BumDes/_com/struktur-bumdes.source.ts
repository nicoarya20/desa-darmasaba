import stateStrukturBumdes from '@/app/admin/(dashboard)/_state/ekonomi/struktur-organisasi'
import type { StrukturDetailLoader } from '@/app/(public)/_com/struktur-organisasi/struktur-person.logic'
import type { PegawaiItem, PosisiItem } from '@/app/(public)/_com/struktur-organisasi/struktur.logic'
import { STRUKTUR_PEGAWAI_LIMIT } from '@/app/(public)/_com/struktur-organisasi/struktur.meta'
import type { StrukturSource } from '@/app/(public)/_com/struktur-organisasi/use-struktur-data'

/*
 * Sumber Struktur BUMDes: tabel `PegawaiBumDes`/`PosisiOrganisasiBumDes` lewat `/api/ekonomi/struktur-organisasi`
 * (kode bersama dengan Struktur Perangkat Desa & PPID). Loader state menangkap galatnya sendiri dan mengosongkan
 * data, jadi hasil `null` dibaca sebagai daftar kosong.
 */

/** Sumber bagan Struktur BUMDes: pegawai aktif + jabatan aktif (beserta atasan & urutan). */
export const strukturBumdesSource: StrukturSource = {
  async loadPegawai() {
    await stateStrukturBumdes.pegawai.findMany.load(1, STRUKTUR_PEGAWAI_LIMIT, '', true)
    return (stateStrukturBumdes.pegawai.findMany.data ?? []) as PegawaiItem[]
  },
  async loadPosisi() {
    await stateStrukturBumdes.posisi.findManyAll.load(true)
    return (stateStrukturBumdes.posisi.findManyAll.data ?? []) as PosisiItem[]
  },
}

/** Profil pegawai BUMDes untuk halaman detail `/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/[id]`; tidak ditemukan → `null`. */
export const loadPegawaiBumdesDetail: StrukturDetailLoader = (id) => stateStrukturBumdes.pegawai.findUnique.load(id)
