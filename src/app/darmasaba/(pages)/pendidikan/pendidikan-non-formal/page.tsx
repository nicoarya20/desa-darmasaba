'use client'
import pendidikanNonFormalState from '@/app/admin/(dashboard)/_state/pendidikan/pendidikan-non-formal';
import colors from '@/con/colors';
import { Box, Paper, SimpleGrid, Skeleton, Stack, Text, Title, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import { IconMapPin, IconTarget, IconBook2 } from '@tabler/icons-react';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  const stateTujuanPendidikanNonFormal = useProxy(pendidikanNonFormalState.stateTujuanPendidikanNonFormal);
  const stateTempatKegiatan = useProxy(pendidikanNonFormalState.stateTempatKegiatan);
  const stateJenisProgram = useProxy(pendidikanNonFormalState.stateJenisProgram);

  useShallowEffect(() => {
    stateTujuanPendidikanNonFormal.findById.load('edit');
    stateTempatKegiatan.findById.load('edit');
    stateJenisProgram.findById.load('edit');
  }, []);

  if (!stateTujuanPendidikanNonFormal.findById.data || !stateTempatKegiatan.findById.data || !stateJenisProgram.findById.data)
    return (
      <Stack pos="relative" bg={colors.Bg} py="xl" gap="lg" mih="100vh" justify="flex-start">
        <Box px={{ base: 'md', md: 100 }}>
          <BackButton />
        </Box>
        <Box px={{ base: 'md', md: 100 }} pb={50}>
          <Skeleton h={50} radius="xl" />
          <Skeleton h={150} mt="lg" radius="md" />
          <Skeleton h={150} mt="lg" radius="md" />
        </Box>
      </Stack>
    );

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="lg" mih="100vh">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }} pb={50}>
        <Box>
          <Title ta="center" order={1} fw="bold" c={colors['blue-button']} mb="sm">
            Pendidikan Non Formal
          </Title>
          <Text ta="center" fz="lg" lh={1.6} c="black" maw={800} mx="auto">
            Bentuk pendidikan di luar sekolah yang terstruktur, bertujuan memberikan keterampilan, pengetahuan, dan pengembangan karakter masyarakat dari berbagai usia serta latar belakang.
          </Text>
        </Box>
        <SimpleGrid
          cols={{ base: 1, md: 2 }}
          spacing="lg"
          mt={40}
        >
          <Paper
            p="xl"
            radius="lg"
            bg={colors['white-trans-1']}
            shadow="md"
            withBorder
          >
            <Stack>
              <Tooltip label="Fokus utama program" withArrow>
                <Title order={2} fw="bold" c={colors['blue-button']} mb="xs" flex="center">
                  <IconTarget size={28} style={{ marginRight: 8 }} />
                  Tujuan Program
                </Title>
              </Tooltip>
              <Text fz="md" lh={1.7} c="dark" dangerouslySetInnerHTML={{ __html: stateTujuanPendidikanNonFormal.findById.data?.deskripsi }} />
            </Stack>
          </Paper>
          <Paper
            p="xl"
            radius="lg"
            bg={colors['white-trans-1']}
            shadow="md"
            withBorder
          >
            <Stack>
              <Tooltip label="Lokasi pelaksanaan kegiatan" withArrow>
                <Title order={2} fw="bold" c={colors['blue-button']} mb="xs" flex="center">
                  <IconMapPin size={28} style={{ marginRight: 8 }} />
                  Tempat Kegiatan
                </Title>
              </Tooltip>
              <Text fz="md" lh={1.7} c="dark" dangerouslySetInnerHTML={{ __html: stateTempatKegiatan.findById.data?.deskripsi }} />
            </Stack>
          </Paper>
        </SimpleGrid>
        <Box py={40}>
          <Paper
            p="xl"
            radius="lg"
            bg={colors['white-trans-1']}
            shadow="md"
            withBorder
          >
            <Stack>
              <Tooltip label="Ragam jenis program yang tersedia" withArrow>
                <Title order={2} fw="bold" c={colors['blue-button']} mb="xs" flex="center">
                  <IconBook2 size={28} style={{ marginRight: 8 }} />
                  Jenis Program yang Diselenggarakan
                </Title>
              </Tooltip>
              <Text fz="md" lh={1.7} c="dark" dangerouslySetInnerHTML={{ __html: stateJenisProgram.findById.data?.deskripsi }} />
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Stack>
  );
}

export default Page;
