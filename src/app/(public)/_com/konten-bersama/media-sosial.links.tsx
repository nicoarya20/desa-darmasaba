import { IKON_PLATFORM, LABEL_PLATFORM, type MediaSosialItem } from '@/lib/konten-bersama/media-sosial.model'
import { ActionIcon, Group, Image, Tooltip } from '@mantine/core'
import { IconWorld } from '@tabler/icons-react'

/** Ikon tautan media sosial publik (buka di tab baru); daftar kosong → tidak dirender. */
export default function MediaSosialLinks({ items }: { items: readonly MediaSosialItem[] }) {
  if (items.length === 0) return null
  return (
    <Group gap="xs" data-testid="media-sosial-links">
      {items.map((item, i) => {
        const label = LABEL_PLATFORM[item.platform]
        const ikon = IKON_PLATFORM[item.platform]
        return (
          <Tooltip key={`${item.platform}-${i}`} label={label}>
            <ActionIcon
              component="a"
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              variant="light"
              size="lg"
              radius="xl"
              aria-label={`${label} (buka di tab baru)`}
            >
              {ikon ? <Image src={ikon} alt="" w={20} h={20} fit="contain" /> : <IconWorld size={20} aria-hidden />}
            </ActionIcon>
          </Tooltip>
        )
      })}
    </Group>
  )
}
