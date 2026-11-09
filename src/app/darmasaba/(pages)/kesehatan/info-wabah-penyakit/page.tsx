'use client'
import infoWabahPenyakit from '@/app/admin/(dashboard)/_state/kesehatan/info-wabah-penyakit/infoWabahPenyakit';
import colors from '@/con/colors';
import {
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Grid,
  GridCol,
  Group,
  Image,
  Pagination,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { IconInfoCircle, IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';
import { useTransitionRouter } from 'next-view-transitions';

function Page() {
  const state = useProxy(infoWabahPenyakit);
  const router = useTransitionRouter();
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 1000);
  const { data, page, totalPages, loading, load } = state.findMany;

  useShallowEffect(() => {
    load(page, 3, debouncedSearch);
  }, [page, debouncedSearch]);

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
          <Title
            order={1}
            c={colors['blue-button']}
            fw="bold"
            lh={{ base: 1.2, md: 1.2 }}
          >
            Informasi Wabah & Penyakit
          </Title>
          <Text
            fz={{ base: 'sm', md: 'md' }}
            lh={{ base: 1.5, md: 1.5 }}
            mt={4}
          >
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
              <Title order={2} fz={{ base: 'md', md: 'lg' }} fw={500}>
                Tidak ada data yang cocok dengan pencarian Anda.
              </Title>
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
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Stack gap="sm" style={{ flex: 1 }}>
                  {/* Gambar */}
                  <Box
                    h={180}
                    w="100%"
                    style={{
                      overflow: 'hidden',
                      borderRadius: '8px',
                    }}
                  >
                    <Image
                      src={v.image?.link}
                      alt={v.name}
                      fit="cover"
                      w="100%"
                      h="100%"
                      style={{
                        objectFit: 'cover',
                        objectPosition: 'center',
                      }}
                      loading="lazy"
                    />
                  </Box>

                  {/* Judul dan badge */}
                  <Group justify="space-between" mt="sm">
                    <Title
                      order={3}
                      c={colors['blue-button']}
                      fw={700}
                      fz={{ base: 'sm', md: 'lg' }}
                    >
                      {v.name}
                    </Title>
                    <Badge color="blue" variant="light" radius="sm">
                      Wabah
                    </Badge>
                  </Group>

                  <Text
                    fz={{ base: 'xs', md: 'sm' }}
                    c="dimmed"
                    lh={{ base: 1.4, md: 1.4 }}
                  >
                    Diposting:{' '}
                    {new Date(v.createdAt).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>

                  <Divider />

                  {/* Bagian deskripsi dan tombol */}
                  <Box style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <Text
                      fz={{ base: 'xs', md: 'sm' }}
                      lh={{ base: 1.5, md: 1.5 }}
                      lineClamp={3}
                      dangerouslySetInnerHTML={{ __html: v.deskripsiSingkat }}
                      style={{ flexGrow: 1 }}
                    />

                    <Button
                      variant="light"
                      radius="md"
                      size="md"
                      mt="md"
                      onClick={() =>
                        router.push(`/darmasaba/kesehatan/info-wabah-penyakit/${v.id}`)
                      }
                    >
                      Selengkapnya
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        )}
      </Box>

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
    </Stack>
  );
}

export default Page;