'use client'
import colors from '@/con/colors'
import type { FotoGaleriItem } from '@/lib/konten-bersama/konten-bersama.types'
import { Box, Image, Modal, SimpleGrid, Text, Title, UnstyledButton } from '@mantine/core'
import { useState } from 'react'

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

/** Galeri foto publik: grid 2/3/4 kolom, klik foto → modal ukuran penuh + keterangan; kosong → tidak dirender. */
export default function GaleriFoto({ foto, namaPemilik, judul = 'Galeri Foto', ariaLabel, testId = 'galeri-foto', onPreviewChange }: Props) {
  const [aktif, setAktifState] = useState<FotoGaleriItem | null>(null)
  const setAktif = (f: FotoGaleriItem | null) => {
    setAktifState(f)
    onPreviewChange?.(f !== null)
  }

  if (foto.length === 0) return null

  const altFoto = (f: FotoGaleriItem, i: number) => f.keterangan ?? `Foto ${namaPemilik} ${i + 1}`

  return (
    <Box component="section" aria-label={ariaLabel} data-testid={testId}>
      {judul && (
        <Title order={4} c={colors['blue-button']} fz={{ base: 18, md: 20 }} mb="sm">
          {judul}
        </Title>
      )}
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing={{ base: 'xs', md: 'md' }}>
        {foto.map((f, i) => (
          <UnstyledButton
            key={f.id}
            onClick={() => setAktif(f)}
            aria-haspopup="dialog"
            aria-label={`Lihat ${altFoto(f, i)}`}
            data-testid="galeri-foto-item"
          >
            <Image src={f.image.link} alt={altFoto(f, i)} h={{ base: 130, md: 170 }} radius="md" fit="cover" loading="lazy" />
            {f.keterangan && (
              <Text fz="xs" c="dimmed" mt={4} lineClamp={2}>
                {f.keterangan}
              </Text>
            )}
          </UnstyledButton>
        ))}
      </SimpleGrid>

      <Modal
        opened={aktif !== null}
        onClose={() => setAktif(null)}
        size="xl"
        centered
        radius="lg"
        title={<Text fw={600}>{aktif?.keterangan ?? namaPemilik}</Text>}
      >
        {aktif && (
          <>
            <Image src={aktif.image.link} alt={aktif.keterangan ?? namaPemilik} fit="contain" mah="75vh" radius="md" />
            {aktif.keterangan && (
              <Text mt="sm" fz="sm" style={{ whiteSpace: 'pre-line' }}>
                {aktif.keterangan}
              </Text>
            )}
          </>
        )}
      </Modal>
    </Box>
  )
}
