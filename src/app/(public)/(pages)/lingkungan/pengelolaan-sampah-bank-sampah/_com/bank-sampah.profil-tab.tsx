import KontakLink from '@/app/(public)/_com/konten-bersama/kontak.link'
import TombolGoogleMaps from '@/app/(public)/_com/konten-bersama/lokasi.tombol'
import MediaSosialLinks from '@/app/(public)/_com/konten-bersama/media-sosial.links'
import KontenKosong from '@/app/(public)/_com/konten-bersama/konten-kosong'
import r from '@/app/(public)/_com/link-reveal/link-reveal.module.css'
import type { BankSampahDetail } from '@/lib/bank-sampah/bank-sampah.types'
import { Anchor, Box, Group, List, Stack, Text } from '@mantine/core'
import { Link } from 'next-view-transitions'

/** Rute detail Program Inovasi publik. */
export const linkProgramInovasi = (id: string) => `/program-inovasi/${encodeURIComponent(id)}`

function Bagian({ judul, children }: { judul: string; children: React.ReactNode }) {
  return (
    <Box>
      <Text fw={700} fz="sm" mb={4}>{judul}</Text>
      {children}
    </Box>
  )
}

/** Tab Profil detail bank sampah: deskripsi, alamat + Google Maps, kontak, media sosial, inovasi TPS. */
export default function BankSampahProfilTab({ data }: { data: BankSampahDetail }) {
  const profilKosong = !data.deskripsi && !data.kontak && data.mediaSosial.length === 0 && data.programInovasi.length === 0
  return (
    <Stack gap="md" data-testid="bank-sampah-profil">
      {data.deskripsi && (
        <Text fz="sm" style={{ whiteSpace: 'pre-line' }}>{data.deskripsi}</Text>
      )}
      <Bagian judul="Alamat">
        <Text fz="sm" mb={6}>{data.alamat}</Text>
        <TombolGoogleMaps link={data.linkPetunjukArah} koordinat={data} />
      </Bagian>
      {data.kontak && (
        <Bagian judul="Kontak">
          <KontakLink kontak={data.kontak} />
        </Bagian>
      )}
      {data.mediaSosial.length > 0 && (
        <Bagian judul="Media Sosial">
          <MediaSosialLinks items={data.mediaSosial} />
        </Bagian>
      )}
      {data.programInovasi.length > 0 && (
        <Bagian judul="Inovasi di TPS">
          <List size="sm" spacing={4}>
            {data.programInovasi.map((p) => (
              <List.Item key={p.id}>
                <Anchor component={Link} href={linkProgramInovasi(p.id)} fz="sm" underline="never" className={r.trigger}>
                  <span className={r.cta} data-text={p.name}>{p.name}</span>
                </Anchor>
              </List.Item>
            ))}
          </List>
        </Bagian>
      )}
      {profilKosong && (
        <Group justify="center">
          <KontenKosong pesan="Profil lengkap bank sampah ini belum tersedia." />
        </Group>
      )}
    </Stack>
  )
}
