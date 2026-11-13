import { STRUKTUR_VARS } from '@/app/(public)/_com/struktur-organisasi/struktur.meta'
import colors from '@/con/colors'
import type { CSSProperties } from 'react'

/** Rute profil pegawai BUMDes dari bagan Struktur Pengurus BUMDes. */
export const strukturBumdesHref = (pegawaiId: string) => `/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes/${pegawaiId}`

/** Variabel CSS halaman publik BUMDes: warna brand + gradasi kartu bagan struktur bersama. */
export const BUMDES_VARS = { '--brand': colors['blue-button'], ...STRUKTUR_VARS } as CSSProperties
