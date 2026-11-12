import stateStrukturPpid from '@/app/admin/(dashboard)/_state/ppid/struktur_ppid'
import type { StrukturDetailLoader } from '@/app/(public)/_com/struktur-organisasi/struktur-person.logic'
import type { PegawaiItem, PosisiItem } from '@/app/(public)/_com/struktur-organisasi/struktur.logic'
import { STRUKTUR_PEGAWAI_LIMIT } from '@/app/(public)/_com/struktur-organisasi/struktur.meta'
import type { StrukturSource } from '@/app/(public)/_com/struktur-organisasi/use-struktur-data'

/*
 * Sumber Struktur PPID: tabel `PegawaiPPID`/`PosisiOrganisasiPPID` lewat `/api/ppid/strukturppid` (kode bersama
 * dengan Struktur Perangkat Desa). Loader state menangkap galatnya sendiri dan mengosongkan data, jadi hasil
 * `null` dibaca sebagai daftar kosong.
 */

/** Sumber bagan Struktur PPID: pegawai aktif + jabatan aktif (beserta atasan & urutan). */
export const strukturPpidSource: StrukturSource = {
  async loadPegawai() {
    await stateStrukturPpid.pegawai.findMany.load(1, STRUKTUR_PEGAWAI_LIMIT, '', true)
    return (stateStrukturPpid.pegawai.findMany.data ?? []) as PegawaiItem[]
  },
  async loadPosisi() {
    await stateStrukturPpid.posisi.findManyAll.load(true)
    return (stateStrukturPpid.posisi.findManyAll.data ?? []) as PosisiItem[]
  },
}

/** Profil pegawai PPID untuk halaman detail `/ppid/struktur-ppid/[id]`; tidak ditemukan → `null`. */
export const loadPegawaiPpidDetail: StrukturDetailLoader = (id) => stateStrukturPpid.pegawai.findUnique.load(id)
