import type { GambarRingkas, PengurusItem } from '@/lib/konten-bersama/konten-bersama.types'
import { Anchor, Avatar, Image, Paper, SimpleGrid, Stack, Text } from '@mantine/core'
import KontenKosong from './konten-kosong'

type Props = {
  /** Foto bagan struktur organisasi (opsional). */
  bagan: GambarRingkas | null
  pengurus: readonly PengurusItem[]
  /** Nama pemilik struktur, untuk alt gambar bagan. */
  namaPemilik: string
}

/** Struktur organisasi publik: foto bagan (bila ada) lalu kartu pengurus; keduanya kosong → state kosong. */
export default function StrukturPengurusView({ bagan, pengurus, namaPemilik }: Props) {
  if (!bagan && pengurus.length === 0) return <KontenKosong pesan="Struktur organisasi belum tersedia." />
  return (
    <Stack gap="md" data-testid="struktur-pengurus-view">
      {bagan && (
        <Anchor href={bagan.link} target="_blank" rel="noopener noreferrer" aria-label="Buka bagan struktur ukuran penuh">
          <Image src={bagan.link} alt={`Bagan struktur organisasi ${namaPemilik}`} radius="md" fit="contain" mah={420} />
        </Anchor>
      )}
      {pengurus.length > 0 && (
        <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
          {pengurus.map((p) => (
            <Paper key={p.id} withBorder radius="md" p="sm" data-testid="pengurus-card">
              <Stack align="center" gap={6}>
                <Avatar src={p.image?.link ?? null} alt={p.nama} size={72} radius="xl">
                  {p.nama.slice(0, 1)}
                </Avatar>
                <Text fw={600} fz="sm" ta="center">{p.nama}</Text>
                <Text c="dimmed" fz="xs" ta="center">{p.jabatan}</Text>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  )
}
