'use client'
import colors from '@/con/colors'
import type { BankSampahRingkas } from '@/lib/bank-sampah/bank-sampah.types'
import { linkGoogleMaps, linkRuteKoordinat } from '@/lib/konten-bersama/lokasi.logic'
import { Box, Group, Paper, Text, UnstyledButton } from '@mantine/core'
import { IconRoute } from '@tabler/icons-react'
import type { SyntheticEvent } from 'react'

type Props = { item: BankSampahRingkas; onOpen: () => void }

// Tautan di dalam card tidak boleh ikut membuka modal.
const jangan = (e: SyntheticEvent) => e.stopPropagation()

/**
 * Card daftar bank sampah: klik card / tombol nama (keyboard: Enter/Spasi) membuka modal detail;
 * tautan "Rute" dan "Lihat Peta Lebih Besar" langsung ke Google Maps tanpa membuka modal.
 */
export default function BankSampahCard({ item, onOpen }: Props) {
  const adaKoordinat = Boolean(item.lat && item.lng)
  const rute = adaKoordinat ? linkRuteKoordinat(item) : null
  const peta = adaKoordinat ? linkGoogleMaps(item.linkPetunjukArah, item) : null

  return (
    <Paper p="md" withBorder radius="md" onClick={onOpen} style={{ cursor: 'pointer' }} data-testid="bank-sampah-card">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <UnstyledButton
          onClick={(e) => {
            jangan(e)
            onOpen()
          }}
          aria-haspopup="dialog"
          aria-label={`Lihat detail ${item.namaTempatMaps}`}
        >
          <Text fw="bold" fz="lg">{item.namaTempatMaps}</Text>
          <Text c="dimmed" fz="sm" mb={4}>{item.alamat}</Text>
          <Text fz="xs" fw={600} c={colors['blue-button']}>Lihat detail</Text>
        </UnstyledButton>
        {rute && (
          <Box
            component="a"
            href={rute}
            target="_blank"
            rel="noopener noreferrer"
            onClick={jangan}
            aria-label={`Rute ke ${item.namaTempatMaps} (Google Maps)`}
            style={{ textDecoration: 'none', textAlign: 'center' }}
          >
            <IconRoute color={colors['blue-button']} size={30} aria-hidden />
            <Text fw="bold" fz="sm" c={colors['blue-button']}>Rute</Text>
          </Box>
        )}
      </Group>
      {peta ? (
        <a href={peta} target="_blank" rel="noopener noreferrer" onClick={jangan} style={{ color: colors['blue-button'], textDecoration: 'none' }}>
          <Text fz="sm" mt="xs">📌 Lihat Peta Lebih Besar</Text>
        </a>
      ) : (
        <Text c="dimmed" fz="sm" mt="xs">Koordinat belum tersedia</Text>
      )}
    </Paper>
  )
}
