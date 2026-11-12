'use client'
import type { FotoProfilBumdesData } from '@/app/admin/(dashboard)/_state/ekonomi/bumdes/foto-profil'
import colors from '@/con/colors'
import { Box, Image, Modal, SimpleGrid, Text, Title, UnstyledButton } from '@mantine/core'
import { useState } from 'react'

type Props = {
  foto: readonly FotoProfilBumdesData[]
  /** Dipakai sebagai alt/judul modal untuk foto tanpa keterangan. */
  namaBumdes: string
}

/** Galeri foto Profil BUMDes: grid 2/3/4 kolom, klik foto → modal ukuran penuh + keterangan; kosong → tidak dirender. */
export default function GaleriFotoBumdes({ foto, namaBumdes }: Props) {
  const [aktif, setAktif] = useState<FotoProfilBumdesData | null>(null)

  if (foto.length === 0) return null

  const altFoto = (f: FotoProfilBumdesData, i: number) => f.keterangan ?? `Foto ${namaBumdes} ${i + 1}`

  return (
    <Box component="section" aria-label="Galeri foto BUMDes" data-testid="galeri-foto-bumdes">
      <Title order={4} c={colors['blue-button']} fz={{ base: 18, md: 20 }} mb="sm">
        Galeri Foto
      </Title>
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
        title={<Text fw={600}>{aktif?.keterangan ?? namaBumdes}</Text>}
      >
        {aktif && (
          <>
            <Image src={aktif.image.link} alt={aktif.keterangan ?? namaBumdes} fit="contain" mah="75vh" radius="md" />
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
