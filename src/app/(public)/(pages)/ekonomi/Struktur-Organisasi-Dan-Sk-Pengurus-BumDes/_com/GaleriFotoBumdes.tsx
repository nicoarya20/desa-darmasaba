'use client'
import GaleriFoto from '@/app/(public)/_com/konten-bersama/galeri-foto.grid'
import type { FotoProfilBumdesData } from '@/app/admin/(dashboard)/_state/ekonomi/bumdes/foto-profil'

type Props = {
  foto: readonly FotoProfilBumdesData[]
  /** Dipakai sebagai alt/judul modal untuk foto tanpa keterangan. */
  namaBumdes: string
}

/** Galeri foto Profil BUMDes (galeri publik bersama dengan label BUMDes); kosong → tidak dirender. */
export default function GaleriFotoBumdes({ foto, namaBumdes }: Props) {
  return <GaleriFoto foto={foto} namaPemilik={namaBumdes} ariaLabel="Galeri foto BUMDes" testId="galeri-foto-bumdes" />
}
