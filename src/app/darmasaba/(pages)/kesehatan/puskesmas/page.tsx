'use client'
import puskesmasState from '@/app/admin/(dashboard)/_state/kesehatan/puskesmas/puskesmas';
import colors from '@/con/colors';
import { Anchor, Box, Center, Grid, GridCol, Image, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput, Badge, Group } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconSearch, IconMapPin, IconPhone, IconMail } from '@tabler/icons-react';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';
import { useDebouncedValue } from '@mantine/hooks';

function Page() {
  const state = useProxy(puskesmasState)
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 1000);

  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = state.findMany;

  useShallowEffect(() => {
    load(page, 6, debouncedSearch)
  }, [page, debouncedSearch])

  if (loading || !data) {
    return (
      <Box py="xl" px={{ base: 'md', md: 100 }}>
        <Skeleton height={500} radius="lg" />
      </Box>
    )
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="lg">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Grid align="center" px={{ base: 'md', md: 100 }} mb="md">
        <GridCol span={{ base: 12, md: 8 }}>
          <Text fz={{ base: "2rem", md: "2.5rem" }} c={colors["blue-button"]} fw="bold">
            Daftar Puskesmas
          </Text>
          <Text fz="md">
            Temukan informasi lengkap mengenai layanan, kontak, dan lokasi Puskesmas Darmasaba
          </Text>
        </GridCol>
        <GridCol span={{ base: 12, md: 4 }}>
          <TextInput
            radius="xl"
            placeholder="Cari nama puskesmas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftSection={<IconSearch size={18} />}
            aria-label="Cari Puskesmas"
          />
        </GridCol>
      </Grid>

      <Box px={{ base: 'md', md: 100 }}>
        {data.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="xs">
              <Text fz="lg" fw={500} c="dimmed">Tidak ada data ditemukan</Text>
              <Text fz="sm" c="dimmed">Coba gunakan kata kunci pencarian yang berbeda</Text>
            </Stack>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {data.map((v, k) => (
              <Paper
                key={k}
                p="lg"
                radius="xl"
                withBorder
                shadow="md"
                bg={colors['white-trans-1']}
                style={{ transition: 'transform 200ms ease' }}
                className="hover:scale-[1.02]"
              >
                <Stack gap="sm">
                  <Image
                    src={v.image.link}
                    alt={v.name}
                    radius="md"
                    height={160}
                    fit="cover"
                    loading="lazy"
                  />
                  <Group justify="space-between">
                    <Text fw={600} fz="lg" lineClamp={1}>{v.name}</Text>
                    <Badge color="blue" variant="light" radius="sm" fz="xs">Aktif</Badge>
                  </Group>
                  <Stack gap={6}>
                    <Group gap="xs" align="flex-start" wrap="nowrap">
                      <Box pt={2}><IconMapPin size={20} /></Box>
                      <Text fz="sm" c="dimmed">{v.alamat}</Text>
                    </Group>

                    <Group gap="xs" align="flex-start" wrap="nowrap">
                      <Box pt={2}><IconPhone size={20} /></Box>
                      <Text fz="sm" c="dimmed">{v.kontak.kontakPuskesmas}</Text>
                    </Group>

                    <Group gap="xs" align="flex-start" wrap="nowrap">
                      <Box pt={2}><IconMail size={20} /></Box>
                      <Text fz="sm" c="dimmed">{v.kontak.email}</Text>
                    </Group>
                  </Stack>

                  <Anchor
                    href={`/darmasaba/kesehatan/puskesmas/${v.id}`}
                    fz="sm"
                    fw={500}
                    c={colors['blue-button']}
                  >
                    Lihat detail →
                  </Anchor>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        )}
      </Box>

      {totalPages > 1 && (
        <Center>
          <Pagination
            value={page}
            onChange={(newPage) => load(newPage, 6, search)}
            total={totalPages}
            size="md"
            radius="xl"
            mt="lg"
          />
        </Center>
      )}
    </Stack>
  );
}

export default Page;
