'use client'
import stateBumdes from '@/app/admin/(dashboard)/_state/ekonomi/bumdes/bumdes'
import { Badge, Box, Group, Image, Paper, SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core'
import { IconBuildingCommunity, IconCalendar, IconMapPin, IconPhone } from '@tabler/icons-react'
import { useEffect } from 'react'
import { useProxy } from 'valtio/utils'
import BumdesSection, { BumdesEmptyState } from './BumdesSection'
import GaleriFotoBumdes from './GaleriFotoBumdes'

/** Section profil BUMDes (nama, deskripsi, tahun berdiri, alamat, kontak, galeri foto); empty-state bila belum diisi admin. */
export default function ProfilBumdesSection() {
  const profil = useProxy(stateBumdes.profil)
  const galeri = useProxy(stateBumdes.fotoProfil)

  useEffect(() => {
    void stateBumdes.profil.load()
    void stateBumdes.fotoProfil.load()
  }, [])

  const data = profil.data

  return (
    <BumdesSection title="Profil BUMDes">
      {!profil.loaded ? (
        <Skeleton height={240} radius="lg" />
      ) : !data ? (
        <BumdesEmptyState
          icon={<IconBuildingCommunity size={48} stroke={1.5} color="var(--mantine-color-gray-6)" />}
          message="Profil BUMDes belum tersedia."
        />
      ) : (
        <Paper radius="lg" p={{ base: 'md', md: 'xl' }} bg="white" withBorder shadow="sm">
          <SimpleGrid cols={{ base: 1, md: data.image ? 3 : 1 }} spacing="xl">
            {data.image && (
              <Image
                src={data.image.link}
                alt={data.nama}
                radius="md"
                h={{ base: 220, md: 260 }}
                fit="cover"
                loading="lazy"
              />
            )}
            <Stack gap="sm" style={{ gridColumn: data.image ? 'span 2' : undefined }}>
              <Title order={3} c="dark" fz={{ base: 20, md: 26 }}>{data.nama}</Title>
              <Text c="dark" fz={{ base: 14, md: 16 }} lh={1.7} style={{ whiteSpace: 'pre-line' }}>
                {data.deskripsi}
              </Text>
              <Box>
                <Stack gap={6}>
                  {data.tahunBerdiri && (
                    <Group gap="xs" wrap="nowrap">
                      <IconCalendar size={18} />
                      <Badge variant="light" size="lg">Berdiri tahun {data.tahunBerdiri}</Badge>
                    </Group>
                  )}
                  {data.alamat && (
                    <Group gap="xs" wrap="nowrap" align="flex-start">
                      <IconMapPin size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                      <Text c="dark" fz="sm" style={{ whiteSpace: 'pre-line' }}>{data.alamat}</Text>
                    </Group>
                  )}
                  {data.kontak && (
                    <Group gap="xs" wrap="nowrap" align="flex-start">
                      <IconPhone size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                      <Text c="dark" fz="sm">{data.kontak}</Text>
                    </Group>
                  )}
                </Stack>
              </Box>
            </Stack>
          </SimpleGrid>
          {galeri.data && galeri.data.length > 0 && (
            <Box mt="xl">
              <GaleriFotoBumdes foto={galeri.data} namaBumdes={data.nama} />
            </Box>
          )}
        </Paper>
      )}
    </BumdesSection>
  )
}
