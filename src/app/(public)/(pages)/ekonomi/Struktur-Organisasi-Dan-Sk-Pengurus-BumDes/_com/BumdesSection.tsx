'use client'
import colors from '@/con/colors'
import { Center, Paper, Stack, Text, Title } from '@mantine/core'
import type { ReactNode } from 'react'

/** Pembungkus satu section halaman publik BUMDes: judul + isi. */
export default function BumdesSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack component="section" gap="md" mt={48}>
      <Title order={2} ta="center" c={colors['blue-button']} fz={{ base: 22, md: 30 }} lh={1.2}>
        {title}
      </Title>
      {children}
    </Stack>
  )
}

/** Keadaan kosong seragam untuk section yang datanya belum diisi admin. */
export function BumdesEmptyState({ icon, message }: { icon: ReactNode; message: string }) {
  return (
    <Paper radius="lg" p="xl" bg="white" withBorder>
      <Center>
        <Stack align="center" gap="xs">
          {icon}
          <Text c="dimmed" ta="center" fz={{ base: 14, md: 16 }}>
            {message}
          </Text>
        </Stack>
      </Center>
    </Paper>
  )
}
