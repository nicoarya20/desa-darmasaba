'use client'
import colors from '@/con/colors';
import { Box, Center, Grid, GridCol, Image, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, TextInput, Title } from '@mantine/core';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';
import { useProxy } from 'valtio/utils';
import tipsKeamananState from '@/app/admin/(dashboard)/_state/keamanan/tips-keamanan';
import { useDebouncedValue, useShallowEffect } from '@mantine/hooks';
import { useState } from 'react';
import { IconSearch } from '@tabler/icons-react';

function Page() {
  const state = useProxy(tipsKeamananState);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 1000);
  const {
    data,
    page,
    totalPages,
    loading,
    load,
  } = state.findMany;

  useShallowEffect(() => {
    load(page, 3, debouncedSearch);
  }, [page, debouncedSearch]);

  if (loading || !data) {
    return (
      <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
        <Skeleton h={500} />
      </Stack>
    );
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Box>
        <Grid align="center" px={{ base: 'md', md: 100 }}>
          <GridCol span={{ base: 12, md: 9 }}>
            <Title
              order={1}
              c={colors['blue-button']}
              style={{ lineHeight: '1.2' }}
            >
              Tips Keamanan
            </Title>
          </GridCol>
          <GridCol span={{ base: 12, md: 3 }}>
            <TextInput
              radius="lg"
              placeholder="Cari Tips"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftSection={<IconSearch size={20} />}
              w={'100%'}
            />
          </GridCol>
        </Grid>

        <Text
          px={{ base: 'md', md: 100 }}
          ta="justify"
          fz={{ base: 'sm', md: 'md' }}
          lh={{ base: '1.5', md: '1.6' }}
          mt="sm"
        >
          Keamanan dan ketertiban lingkungan di Desa Darmasaba dijaga melalui peran aktif Pecalang dan Patwal (Patroli Pengawal).
        </Text>
        <Text
          px={{ base: 'md', md: 100 }}
          ta="justify"
          fz={{ base: 'sm', md: 'md' }}
          lh={{ base: '1.5', md: '1.6' }}
          mt="xs"
        >
          Mereka bertugas memastikan desa tetap aman, tertib, dan kondusif bagi seluruh warga.
        </Text>
      </Box>

      <Box px={{ base: 'md', md: 100 }}>
        <Stack gap="lg">
          <SimpleGrid
            pb="10"
            cols={{ base: 1, md: 3 }}
          >
            {data.map((v, k) => (
              <Paper radius={10} key={k} bg={colors['white-trans-1']}>
                <Stack gap="xs">
                  <Center p="10">
                    <Box h={200} w="100%" style={{ overflow: 'hidden' }}>
                      <Image
                        src={v.image?.link ?? "/no-image.jpg"}
                        alt={v.judul}
                        fit="cover"
                        radius="md"
                        h="100%"
                        w="100%"
                        loading="lazy"
                      />
                    </Box>
                  </Center>
                  <Box px="xl">
                    <Box pb="20">
                      <Title
                        order={3}
                        c={colors['blue-button']}
                        style={{ lineHeight: '1.3' }}
                      >
                        {v.judul}
                      </Title>
                      <Box>
                        <Text
                          pb="10"
                          fz={{ base: 'xs', md: 'md' }}
                          lh={{ base: '1.5', md: '1.6' }}
                          style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                          dangerouslySetInnerHTML={{ __html: v.deskripsi }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </SimpleGrid>
        </Stack>
      </Box>

      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => load(newPage)}
          total={totalPages}
          my="md"
        />
      </Center>
    </Stack>
  );
}

export default Page;