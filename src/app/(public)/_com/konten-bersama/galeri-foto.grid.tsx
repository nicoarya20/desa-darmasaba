'use client'
import type { FotoGaleriItem } from '@/lib/konten-bersama/konten-bersama.types'
import { Box, Image, SimpleGrid, Text, Title, UnstyledButton } from '@mantine/core'
import { useState } from 'react'
import GaleriFotoLightbox from './galeri-foto.lightbox'
import { altFoto } from './galeri-foto.logic'
import { GALERI_FOTO_TEXT as T } from './galeri-foto.text'

type Props = {
  foto: readonly FotoGaleriItem[]
  /** Nama pemilik galeri; dipakai sebagai alt/judul modal untuk foto tanpa keterangan. */
  namaPemilik: string
  /** Judul section; null = tanpa judul (mis. di dalam tab). */
  judul?: string | null
  /** Label aksesibilitas section, mis. "Galeri foto BUMDes". */
  ariaLabel: string
  testId?: string
  /** Dipanggil saat pratinjau foto dibuka/ditutup (mis. agar modal induk tidak ikut tertutup oleh Escape). */
  onPreviewChange?: (terbuka: boolean) => void
}

/** Galeri foto publik: grid 2/3/4 kolom, klik foto → modal ukuran penuh + strip thumbnail; kosong → tidak dirender. */
export default function GaleriFoto({ foto, namaPemilik, judul = 'Galeri Foto', ariaLabel, testId = 'galeri-foto', onPreviewChange }: Props) {
  const [aktif, setAktifState] = useState<number | null>(null)
  const setAktif = (i: number | null) => {
    // Pindah foto di dalam modal tidak mengubah status buka/tutup, jadi induk hanya diberi tahu saat berubah.
    if ((i === null) !== (aktif === null)) onPreviewChange?.(i !== null)
    setAktifState(i)
  }

  if (foto.length === 0) return null

  return (
    <Box component="section" aria-label={ariaLabel} data-testid={testId}>
      {judul && (
        <Title order={4} c="var(--c-brand)" fz={{ base: 18, md: 20 }} mb="sm">
          {judul}
        </Title>
      )}
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing={{ base: 'xs', md: 'md' }}>
        {foto.map((f, i) => (
          <UnstyledButton
            key={f.id}
            onClick={() => setAktif(i)}
            aria-haspopup="dialog"
            aria-label={T.lihat(altFoto(f, i, namaPemilik))}
            data-testid="galeri-foto-item"
          >
            <Image src={f.image.link} alt={altFoto(f, i, namaPemilik)} h={{ base: 130, md: 170 }} radius="md" fit="cover" loading="lazy" />
            {f.keterangan && (
              <Text fz="xs" c="dimmed" mt={4} lineClamp={2}>
                {f.keterangan}
              </Text>
            )}
          </UnstyledButton>
        ))}
      </SimpleGrid>

      <GaleriFotoLightbox foto={foto} index={aktif} onIndexChange={setAktif} namaPemilik={namaPemilik} />
    </Box>
  )
}
