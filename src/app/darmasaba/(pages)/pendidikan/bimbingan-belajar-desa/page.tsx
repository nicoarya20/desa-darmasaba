'use client'
import stateBimbinganBelajarDesa from '@/app/admin/(dashboard)/_state/pendidikan/bimbingan-belajar-desa';
import colors from '@/con/colors';
import { Box, Paper, SimpleGrid, Skeleton, Stack, Text, Title, Tooltip, Divider, Badge } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import { IconMapPin, IconCalendarTime, IconBook2 } from '@tabler/icons-react';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  const stateTujuanProgram = useProxy(stateBimbinganBelajarDesa.stateTujuanProgram);
  const stateLokasiDanJadwal = useProxy(stateBimbinganBelajarDesa.lokasiDanJadwalState);
  const stateFasilitas = useProxy(stateBimbinganBelajarDesa.fasilitasYangDisediakanState);

  useShallowEffect(() => {
    stateTujuanProgram.findById.load('edit');
    stateLokasiDanJadwal.findById.load('edit');
    stateFasilitas.findById.load('edit');
  }, []);

  if (!stateTujuanProgram.findById.data || !stateLokasiDanJadwal.findById.data || !stateFasilitas.findById.data)
    return (
      <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
        <Box px={{ base: 'md', md: 100 }}>
          <BackButton />
        </Box>
        <Box px={{ base: 'md', md: 100 }} pb={50}>
          <Skeleton h={60} radius="xl" />
          <Skeleton h={200} mt="lg" radius="md" />
        </Box>
      </Stack>
    );

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="xl">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 120 }} pb={80}>
        <Box mb="lg">
          <Title ta="center" order={1} fw="bold" c={colors['blue-button']} fz={{ base: 28, md: 38 }}>
            Program Bimbingan Belajar Desa
          </Title>
          <Divider size="sm" my="md" mx="auto" w="60%" color={colors['blue-button']} />
          <Text ta="center" fz="lg" c="dimmed" px={{ base: 'sm', md: 120 }}>
            Program unggulan untuk mendukung siswa Desa Darmasaba memahami pelajaran sekolah, meningkatkan prestasi akademik, dan menumbuhkan semangat belajar sejak dini.
          </Text>
        </Box>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
          <Paper p="xl" radius="lg" shadow="md" withBorder bg={colors['white-trans-1']}>
            <Stack gap="sm">
              <Box>
                <Badge variant="gradient" gradient={{ from: colors['blue-button'], to: 'cyan' }} size="lg" radius="sm" mb="sm">
                  Tujuan Program
                </Badge>
                <Tooltip label="Gambaran manfaat utama program" position="top-start" withArrow>
                  <Box>
                    <IconBook2 size={36} stroke={1.5} color={colors['blue-button']} />
                  </Box>
                </Tooltip>
              </Box>
              <Text fz="md" lh={1.6} dangerouslySetInnerHTML={{ __html: stateTujuanProgram.findById.data?.deskripsi }} />
            </Stack>
          </Paper>
          <Paper p="xl" radius="lg" shadow="md" withBorder bg={colors['white-trans-1']}>
            <Stack gap="sm">
              <Box>
                <Badge variant="gradient" gradient={{ from: colors['blue-button'], to: 'cyan' }} size="lg" radius="sm" mb="sm">
                  Lokasi & Jadwal
                </Badge>
                <Tooltip label="Tempat dan waktu pelaksanaan" position="top-start" withArrow>
                  <Box>
                    <IconMapPin size={36} stroke={1.5} color={colors['blue-button']} />
                  </Box>
                </Tooltip>
              </Box>
              <Text fz="md" lh={1.6} dangerouslySetInnerHTML={{ __html: stateLokasiDanJadwal.findById.data?.deskripsi }} />
            </Stack>
          </Paper>
          <Paper p="xl" radius="lg" shadow="md" withBorder bg={colors['white-trans-1']}>
            <Stack gap="sm">
              <Box>
                <Badge variant="gradient" gradient={{ from: colors['blue-button'], to: 'cyan' }} size="lg" radius="sm" mb="sm">
                  Fasilitas
                </Badge>
                <Tooltip label="Sarana yang disediakan untuk peserta" position="top-start" withArrow>
                  <Box>
                    <IconCalendarTime size={36} stroke={1.5} color={colors['blue-button']} />
                  </Box>
                </Tooltip>
              </Box>
              <Text fz="md" lh={1.6} dangerouslySetInnerHTML={{ __html: stateFasilitas.findById.data?.deskripsi }} />
            </Stack>
          </Paper>
        </SimpleGrid>
      </Box>
    </Stack>
  );
}

export default Page;
