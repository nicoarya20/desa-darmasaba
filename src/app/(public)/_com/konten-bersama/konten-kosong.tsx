import { Stack, Text } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'

/** State kosong yang sopan untuk section/tab konten bersama tanpa data. */
export default function KontenKosong({ pesan }: { pesan: string }) {
  return (
    <Stack align="center" gap={6} py="xl" c="dimmed" data-testid="konten-kosong">
      <IconInfoCircle size={28} stroke={1.5} aria-hidden />
      <Text fz="sm" ta="center">{pesan}</Text>
    </Stack>
  )
}
