'use client'
import keteranganSampah from '@/app/admin/(dashboard)/_state/lingkungan/bank-sampah/bank-sampah.state'
import { Alert, Modal, Skeleton, Stack, Text } from '@mantine/core'
import { useEffect, useState } from 'react'
import { useSnapshot } from 'valtio'
import BankSampahDetailContent from './bank-sampah.detail-content'

type Props = {
  /** Id bank sampah yang dibuka; null = modal tertutup. */
  id: string | null
  /** Nama dari card, dipakai sebagai judul selagi detail dimuat. */
  nama: string
  onClose: () => void
}

/** Modal detail bank sampah publik; detail di-fetch saat modal dibuka. */
export default function BankSampahDetailModal({ id, nama, onClose }: Props) {
  const detail = useSnapshot(keteranganSampah.findUnique)
  const [pratinjauTerbuka, setPratinjauTerbuka] = useState(false)

  useEffect(() => {
    if (id) void keteranganSampah.findUnique.load(id)
  }, [id])

  const data = keteranganSampah.findUnique.data
  // Detail siap hanya bila milik id yang sedang dibuka (bukan sisa modal sebelumnya).
  const tampil = id !== null && !detail.loading && data?.id === id ? data : null

  return (
    <Modal
      opened={id !== null}
      onClose={onClose}
      size="xl"
      radius="lg"
      centered
      closeOnEscape={!pratinjauTerbuka}
      title={<Text fw={700} fz="lg">{tampil?.name ?? nama}</Text>}
    >
      {detail.gagal && !detail.loading ? (
        <Alert color="red">Detail bank sampah gagal dimuat. Silakan coba lagi.</Alert>
      ) : tampil ? (
        <BankSampahDetailContent data={tampil} onPreviewChange={setPratinjauTerbuka} />
      ) : (
        <Stack gap="sm" aria-busy="true">
          <Skeleton h={32} radius="sm" />
          <Skeleton h={160} radius="md" />
        </Stack>
      )}
    </Modal>
  )
}
