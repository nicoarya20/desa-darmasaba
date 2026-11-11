import stateStrukturPPID from '@/app/admin/(dashboard)/_state/ppid/struktur_ppid/struktur_PPID'
import type { StrukturDetailLoader } from '@/app/(public)/_com/struktur-organisasi/struktur-person.logic'
import type { PegawaiItem, PosisiItem } from '@/app/(public)/_com/struktur-organisasi/struktur.logic'
import { STRUKTUR_PEGAWAI_LIMIT } from '@/app/(public)/_com/struktur-organisasi/struktur.meta'
import type { StrukturSource } from '@/app/(public)/_com/struktur-organisasi/use-struktur-data'

/**
 * Adapter bagan dari state PPID (`PegawaiPPID`/`PosisiOrganisasiPPID`). Loader state menangkap galatnya sendiri
 * dan mengosongkan data, jadi hasil `null` dibaca sebagai daftar kosong.
 */
export const strukturPpidSource: StrukturSource = {
  async loadPegawai() {
    await stateStrukturPPID.pegawai.findMany.load(1, STRUKTUR_PEGAWAI_LIMIT)
    return (stateStrukturPPID.pegawai.findMany.data ?? []) as PegawaiItem[]
  },
  async loadPosisi() {
    await stateStrukturPPID.posisiOrganisasi.findManyAll.load()
    return (stateStrukturPPID.posisiOrganisasi.findManyAll.data ?? []) as PosisiItem[]
  },
}

/** Profil pegawai PPID untuk halaman detail; respons tidak OK → `null` (tidak ditemukan). */
export const loadPegawaiPpidDetail: StrukturDetailLoader = async (id) => {
  await stateStrukturPPID.pegawai.findUnique.load(id)
  return stateStrukturPPID.pegawai.findUnique.data
}
