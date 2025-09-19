'use client'
import infoWabahPenyakit from '@/app/admin/(dashboard)/_state/kesehatan/info-wabah-penyakit/infoWabahPenyakit';
import colors from '@/con/colors';
import {
  Box,
  Center,
  Grid,
  GridCol,
  Image,
  Pagination,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Badge,
  HoverCard,
  Divider,
  Group,
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconSearch, IconInfoCircle } from '@tabler/icons-react';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  const state = useProxy(infoWabahPenyakit);
  const [search, setSearch] = useState('');

  const { data, page, totalPages, loading, load } = state.findMany;

  useShallowEffect(() => {
    load(page, 6, search);
  }, [page, search]);

  if (loading || !data) {
    return (
      <Box py="xl" px={{ base: 'md', md: 100 }}>
        <Skeleton h={500} radius="lg" />
      </Box>
    );
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="lg">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Grid align="center" px={{ base: 'md', md: 100 }}>
        <GridCol span={{ base: 12, md: 8 }}>
          <Text
            fz={{ base: '1.8rem', md: '2.8rem' }}
            c={colors['blue-button']}
            fw="bold"
            lh={1.2}
          >
            Informasi Wabah & Penyakit
          </Text>
          <Text fz="md" c="dimmed" mt={4}>
            Dapatkan informasi terbaru mengenai wabah dan penyakit yang sedang
            diawasi.
          </Text>
        </GridCol>
        <GridCol span={{ base: 12, md: 4 }}>
          <TextInput
            radius="xl"
            placeholder="Cari nama penyakit atau wabah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftSection={<IconSearch size={20} />}
            w="100%"
            size="md"
          />
        </GridCol>
      </Grid>

      <Box px={{ base: 'md', md: 100 }}>
        {data.length === 0 ? (
          <Center py="6xl">
            <Stack align="center" gap="sm">
              <IconInfoCircle size={50} color={colors['blue-button']} />
              <Text fz="lg" fw={500} c="dimmed">
                Tidak ada data yang cocok dengan pencarian Anda.
              </Text>
            </Stack>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {data.map((v, k) => (
              <Paper
                key={k}
                radius="lg"
                shadow="md"
                p="lg"
                withBorder
                bg={colors['white-trans-1']}
                style={{
                  transition: 'transform 200ms ease, box-shadow 200ms ease',
                }}
              >
                <Stack gap="sm">
                  <Image
                    radius="md"
                    h={180}
                    src={v.image.link}
                    alt={v.name}
                    fit="cover"
                    loading="lazy"
                  />
                  <Group justify="space-between" mt="sm">
                    <Text fw={700} fz="lg" c={colors['blue-button']}>
                      {v.name}
                    </Text>
                    <Badge color="blue" variant="light" radius="sm">
                      Wabah
                    </Badge>
                  </Group>
                  <Text fz="sm" c="dimmed">
                    Diposting: 12 Februari 2025 · Dinas Kesehatan
                  </Text>
                  <Divider />
                  <Text fz="sm" lh={1.5}>
                    {v.deskripsiSingkat}
                  </Text>
                  <HoverCard shadow="md" position="bottom" radius="md" width={300}>
                    <HoverCard.Target>
                      <Text
                        fz="sm"
                        fw={500}
                        c={colors['blue-button']}
                        style={{ cursor: 'pointer' }}
                      >
                        Lihat detail lengkap
                      </Text>
                    </HoverCard.Target>
                    <HoverCard.Dropdown>
                      <Text
                        fz="sm"
                        lh={1.6}
                        dangerouslySetInnerHTML={{
                          __html: v.deskripsiLengkap,
                        }}
                      />
                    </HoverCard.Dropdown>
                  </HoverCard>
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
            onChange={(newPage) => load(newPage)}
            total={totalPages}
            radius="xl"
            size="md"
            mt="lg"
          />
        </Center>
      )}
    </Stack>
  );
}

export default Page;
