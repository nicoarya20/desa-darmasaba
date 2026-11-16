'use client'
import type { Koordinat } from '@/lib/konten-bersama/lokasi.logic'
import { Box } from '@mantine/core'
import dynamic from 'next/dynamic'

// Leaflet butuh `window`; dimuat hanya di klien (SSR/tes merender kotak kosong setinggi peta).
const LeafletMap = dynamic(() => import('@/app/admin/(dashboard)/_com/leafletMapCreate'), { ssr: false })

type Props = { lat: number | null | undefined; lng: number | null | undefined; label: string; tinggi?: number }

/** Peta baca-saja satu titik lokasi (semua domain); tanpa koordinat → tidak dirender. */
export default function PetaLokasi({ lat, lng, label, tinggi = 280 }: Props) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return null
  const titik: Koordinat = { lat, lng }
  return (
    <Box
      role="region"
      aria-label={label}
      data-testid="peta-lokasi"
      h={tinggi}
      style={{ borderRadius: 14, overflow: 'hidden', isolation: 'isolate' }}
    >
      <LeafletMap defaultCenter={titik} readOnly />
    </Box>
  )
}
