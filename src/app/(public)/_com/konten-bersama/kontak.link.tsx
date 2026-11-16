import { tautanKontak } from '@/lib/konten-bersama/kontak.link'
import { Button, Group, Stack, Text } from '@mantine/core'
import { IconBrandWhatsapp, IconPhone } from '@tabler/icons-react'

/** Kontak publik: teks asli + tombol Telepon / WhatsApp bila memuat nomor valid; kosong → tidak dirender. */
export default function KontakLink({ kontak }: { kontak: string | null | undefined }) {
  const info = tautanKontak(kontak)
  if (!info) return null
  return (
    <Stack gap={6} data-testid="kontak-link">
      <Text fz="sm">{info.teks}</Text>
      {(info.telHref || info.waHref) && (
        <Group gap="xs">
          {info.telHref && (
            <Button component="a" href={info.telHref} size="xs" variant="light" leftSection={<IconPhone size={14} />}>
              Telepon
            </Button>
          )}
          {info.waHref && (
            <Button
              component="a"
              href={info.waHref}
              target="_blank"
              rel="noopener noreferrer"
              size="xs"
              variant="light"
              color="green"
              leftSection={<IconBrandWhatsapp size={14} />}
            >
              WhatsApp
            </Button>
          )}
        </Group>
      )}
    </Stack>
  )
}
