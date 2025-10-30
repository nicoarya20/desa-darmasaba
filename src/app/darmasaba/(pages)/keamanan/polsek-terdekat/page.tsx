'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import polsekTerdekatState from '@/app/admin/(dashboard)/_state/keamanan/polsek-terdekat';
import colors from '@/con/colors';
import { Badge, Box, Button, Center, Flex, Paper, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import { IconArrowDown, IconClock, IconNavigation, IconPhone, IconPin } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../desa/layanan/_com/BackButto';
import { useRouter } from 'next/navigation';

function Page() {
  const state = useProxy(polsekTerdekatState.findFirst);
  const router = useRouter();
  const { data, loading, load } = state;

  useEffect(() => {
    load();
  }, []);

  // Loading state
  if (loading) {
    return (
      <Stack py={10}>
        <Skeleton h={500} />
      </Stack>
    );
  }

  // Data kosong
  if (!data) {
    return (
      <Stack pos="relative" bg={colors.Bg} py="xl" gap={22}>
        <Box px={{ base: 'md', md: 100 }}>
          <BackButton />
        </Box>
        <Box pb={10} px={{ base: 20, md: 100 }}>
          <Text fz={{ base: 'h1', md: '2.5rem' }} c={colors['blue-button']} fw="bold">
            Kantor Polisi Terdekat
          </Text>
          <Text pb={15} fz="md">
            Desa Darmasaba, Kecamatan Abiansemal, Kabupaten Badung
          </Text>
        </Box>
        <Center py="xl">
          <Text fz="lg" fw="bold" c="red">
            Data Polsek tidak ada
          </Text>
        </Center>
      </Stack>
    );
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap={22}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Box pb={10} px={{ base: 20, md: 100 }}>
        <Text fz={{ base: 'h1', md: '2.5rem' }} c={colors['blue-button']} fw="bold">
          Kantor Polisi Terdekat
        </Text>
        <Text pb={15} fz="h4">
          Desa Darmasaba, Kecamatan Abiansemal, Kabupaten Badung
        </Text>
      </Box>

      <Box px={{ base: 'md', md: 100 }}>
        <Stack gap="lg">
          <Paper radius={10} bg={colors['white-trans-1']} p="xl">
            <Stack gap="xs">
              <SimpleGrid cols={{ base: 1, md: 2 }}>
                {loading ? (
                  <Center>
                    <Skeleton h={400} />
                  </Center>
                ) : (
                  <>
                    {/* === KIRI === */}
                    <Box>
                      <Text c={colors['blue-button']} fw="bold" fz="h2">
                        {data.nama}
                      </Text>
                      <Text c={colors['blue-button']} fz="sm">
                        {data.jarakKeDesa}
                      </Text>

                      {/* Alamat */}
                      <Flex
                        py={10}
                        gap={9}
                        align="flex-start"
                        wrap="wrap"
                        style={{ wordBreak: 'break-word' }}
                      >
                        <Box w={25} mt={3}>
                          <IconPin size={22} />
                        </Box>
                        <Text
                          fz="lg"
                          style={{
                            flex: 1,
                            wordBreak: 'break-word',
                            lineHeight: 1.4,
                          }}
                        >
                          {data.alamat}
                        </Text>
                      </Flex>

                      {/* Telepon */}
                      <Flex
                        gap={9}
                        align="flex-start"
                        wrap="wrap"
                        style={{ wordBreak: 'break-word' }}
                      >
                        <Box w={25} mt={3}>
                          <IconPhone size={22} />
                        </Box>
                        <Text fz="lg">
                          {data.nomorTelepon}
                        </Text>
                      </Flex>

                      {/* Jam Operasional */}
                      <Flex
                        py={10}
                        gap={9}
                        align="flex-start"
                        wrap="wrap"
                        style={{ wordBreak: 'break-word' }}
                      >
                        <Box w={25} mt={3}>
                          <IconClock size={22}  />
                        </Box>
                        <Text fz="lg">
                          {data.jamOperasional}
                        </Text>
                      </Flex>

                      {/* Layanan */}
                      <Box>
                        <Text c={colors['blue-button']} fw="bold" fz="h2">
                          Layanan Yang Tersedia :
                        </Text>
                        <SimpleGrid py={10} cols={{ base: 1, md: 2 }}>
                          <Text fz="lg">
                            {data.layananPolsek.nama}
                          </Text>
                        </SimpleGrid>
                      </Box>

                      <Box>
                        <Button
                          bg={colors['blue-button']}
                          onClick={() =>
                            router.push(`/darmasaba/keamanan/polsek-terdekat/semua-polsek`)
                          }
                          rightSection={<IconArrowDown size={20} />}
                        >
                          Lihat Kantor Polisi Lainnya
                        </Button>
                      </Box>
                    </Box>

                    {/* === KANAN === */}
                    <Box pos="relative">
                      <Box style={{ position: 'absolute', top: 0, right: 0 }}>
                        <Badge size="lg" c="#287407" bg="#A8EDC4">
                          Buka
                        </Badge>
                      </Box>

                      <Box pt={40}>
                        <iframe
                          style={{ border: 2, width: '100%' }}
                          src={data.embedMapUrl}
                          width="550"
                          height="300"
                        ></iframe>
                      </Box>

                      <Box pt={20}>
                        <Button
                          onClick={() => router.push(data.linkPetunjukArah)}
                          fullWidth
                          bg={colors['blue-button']}
                          radius={10}
                          leftSection={<IconNavigation size={20} />}
                        >
                          Petunjuk Arah
                        </Button>
                      </Box>
                    </Box>
                  </>
                )}
              </SimpleGrid>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
