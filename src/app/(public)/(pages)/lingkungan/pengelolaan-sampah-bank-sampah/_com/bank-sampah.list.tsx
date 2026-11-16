'use client'
import colors from '@/con/colors'
import type { BankSampahRingkas } from '@/lib/bank-sampah/bank-sampah.types'
import { Center, Pagination, Paper, Stack, Text } from '@mantine/core'
import { useState } from 'react'
import BankSampahCard from './bank-sampah.card'
import BankSampahDetailModal from './bank-sampah.detail-modal'

type Props = {
  data: readonly BankSampahRingkas[] | null
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

/** Daftar bank sampah publik (card berpaginasi) + modal detail untuk card yang dipilih. */
export default function BankSampahList({ data, page, totalPages, onPageChange }: Props) {
  const [terpilih, setTerpilih] = useState<BankSampahRingkas | null>(null)

  return (
    <Paper p="md" bg={colors['white-trans-1']} radius="lg">
      <Text fz="xl" fw="bold" mb="md">Daftar Bank Sampah</Text>
      <Stack gap="md">
        {data?.map((v) => <BankSampahCard key={v.id} item={v} onOpen={() => setTerpilih(v)} />)}
      </Stack>
      <Center>
        <Pagination value={page} onChange={onPageChange} total={totalPages} my="md" />
      </Center>
      <BankSampahDetailModal id={terpilih?.id ?? null} nama={terpilih?.namaTempatMaps ?? ''} onClose={() => setTerpilih(null)} />
    </Paper>
  )
}
