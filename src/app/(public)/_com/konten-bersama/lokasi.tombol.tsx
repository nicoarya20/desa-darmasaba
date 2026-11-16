import { linkGoogleMaps, type Koordinat } from '@/lib/konten-bersama/lokasi.logic'
import { Button } from '@mantine/core'
import { IconMapPin } from '@tabler/icons-react'

type Props = { link: string | null | undefined; koordinat?: Partial<Koordinat> | null }

/** Tombol publik "Buka di Google Maps": link tersimpan, atau rute ke koordinat; tanpa keduanya tidak dirender. */
export default function TombolGoogleMaps({ link, koordinat }: Props) {
  const href = linkGoogleMaps(link, koordinat)
  if (!href) return null
  return (
    <Button component="a" href={href} target="_blank" rel="noopener noreferrer" variant="light" size="xs" leftSection={<IconMapPin size={14} />}>
      Buka di Google Maps
    </Button>
  )
}
