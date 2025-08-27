'use client'
import puskesmasState from '@/app/admin/(dashboard)/_state/kesehatan/puskesmas/puskesmas';
import colors from '@/con/colors';
import { BackgroundImage, Box, Grid, GridCol, Paper, SimpleGrid, Skeleton, Stack, Text, Title, Tooltip, Badge, Divider, Group } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import { IconClock, IconMapPin, IconPhone, IconMail, IconBuildingHospital } from '@tabler/icons-react';
import BackButton from '../../../desa/layanan/_com/BackButto';

function Page() {
  const state = useProxy(puskesmasState)
  const params = useParams()

  useShallowEffect(() => {
    state.findUnique.load(params.id as string)
  }, [])

  if (!state.findUnique.data) {
    return (
      <Stack py="xl" px={{ base: 'md', md: 100 }}>
        <Skeleton h={500} radius="lg" />
        <Stack gap="sm">
          <Skeleton h={20} w="40%" />
          <Skeleton h={20} w="60%" />
          <Skeleton h={20} w="50%" />
        </Stack>
      </Stack>
    )
  }

  const data = state.findUnique.data

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap={32}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Stack gap="xl" px={{ base: 'md', md: 100 }}>
        <Paper p="lg" radius="xl" shadow="md" bg={colors['white-trans-1']} withBorder>
          <Box pb="xl">
            <BackgroundImage
              radius="lg"
              h={{ base: 260, md: 480 }}
              src={data.image.link}
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              <Box
                pos="absolute"
                w="100%"
                h="100%"
                bg={colors.trans.dark[2]}
                style={{ borderRadius: 16 }}
              />
              <Stack
                pos="absolute"
                bottom={20}
                left={20}
                gap={6}
              >
                <Text fw="bold" fz={{ base: 'lg', md: 'h2' }} c={colors['white-1']}>
                  {data.name}
                </Text>
                <Group gap={6}>
                  <IconMapPin size={20} color="white" />
                  <Text fz={{ base: 'sm', md: 'md' }} c={colors['white-1']}>
                    {data.alamat}
                  </Text>
                </Group>
              </Stack>
            </BackgroundImage>

            <Grid mt="xl" gutter="xl">
              <GridCol span={{ base: 12, md: 6 }}>
                <Stack gap="lg">
                  <Box>
                    <Title order={3} mb={10}>Informasi Kontak</Title>
                    <Stack gap={8}>
                      <Group gap={8}>
                        <IconPhone size={18} />
                        <Text fz="md">{data.kontak.kontakPuskesmas || '-'}</Text>
                      </Group>
                      <Group gap={8}>
                        <IconMail size={18} />
                        <Text fz="md">{data.kontak.email || '-'}</Text>
                      </Group>
                    </Stack>
                  </Box>

                  <Divider />

                  <Box>
                    <Title order={3} mb={10}>Jam Operasional</Title>
                    <Group gap={8}>
                      <IconClock size={18} />
                      <Text fw="bold" fz="md">
                        {data.jam.workDays} - {data.jam.weekDays}
                      </Text>
                      <Tooltip label="Hari aktif pelayanan puskesmas" position="top" withArrow>
                        <Badge size="sm" variant="light" color="blue">Aktif</Badge>
                      </Tooltip>
                    </Group>
                  </Box>
                </Stack>
              </GridCol>

              <GridCol span={{ base: 12, md: 6 }}>
                <Paper p="xl" radius="lg" bg="linear-gradient(135deg, #EAF0FB, #BFD4F5)" shadow="sm">
                  <Title order={3} mb="lg" ta="center" c="dark">Layanan Unggulan</Title>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                    <Paper p="lg" radius="lg" withBorder bg={colors['white-trans-1']} shadow="xs">
                      <Stack align="center" gap={8}>
                        <IconBuildingHospital size={36} color={colors['blue-button']} />
                        <Text fw="bold" fz="lg">Poliklinik Umum</Text>
                        <Text fz={{ base: 36, md: 48 }} fw="bold" c={colors['blue-button']}>26</Text>
                      </Stack>
                    </Paper>
                    <Paper p="lg" radius="lg" withBorder bg={colors['white-trans-1']} shadow="xs">
                      <Stack align="center" gap={8}>
                        <IconBuildingHospital size={36} color={colors['blue-button']} />
                        <Text fw="bold" fz="lg">Poli Gigi</Text>
                        <Text fz={{ base: 36, md: 48 }} fw="bold" c={colors['blue-button']}>26</Text>
                      </Stack>
                    </Paper>
                  </SimpleGrid>
                </Paper>
              </GridCol>
            </Grid>
          </Box>
        </Paper>
      </Stack>
    </Stack>
  );
}

export default Page;
