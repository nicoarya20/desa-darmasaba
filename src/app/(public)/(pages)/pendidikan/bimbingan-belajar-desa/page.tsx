'use client'
import stateBimbinganBelajarDesa from '@/app/admin/(dashboard)/_state/pendidikan/bimbingan-belajar-desa';
import colors from '@/con/colors';
import { Box, Divider, Group, Paper, SimpleGrid, Skeleton, Stack, Text, Title, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconBook2, IconCalendarTime, IconMapPin } from '@tabler/icons-react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';

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
          <Title ta="center" order={1} fw="bold" c={colors['blue-button']} fz={{ base: 'xl', md: '2em' }} lh={1.15}>
            Program Bimbingan Belajar Desa
          </Title>
          <Divider size="sm" my="md" mx="auto" w="60%" color={colors['blue-button']} />
          <Text
            ta="center"
            fz={{ base: 'sm', md: 'md' }}
            c="black"
            lh={{ base: 1.6, md: 1.5 }}
            px={{ base: 'sm', md: 120 }}
          >
            Program unggulan untuk mendukung siswa Desa Darmasaba memahami pelajaran sekolah, meningkatkan prestasi akademik, dan menumbuhkan semangat belajar sejak dini.
          </Text>
        </Box>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
          <Paper p="xl" radius="lg" shadow="md" withBorder bg={colors['white-trans-1']}>
            <Stack gap="sm">
              <Group>
                <Tooltip label="Gambaran manfaat utama program" position="top-start" withArrow>
                  <Box>
                    <IconBook2 size={24} stroke={1.8} color={colors['blue-button']} />
                  </Box>
                </Tooltip>
                <Title order={3} fw={700} c={colors['blue-button']} lh={1.2} fz={{ base: 'sm', md: 'md' }}>
                  {stateTujuanProgram.findById.data?.judul}
                </Title>
              </Group>
              <Text
                fz={{ base: 'xs', md: 'md' }}
                lh={{ base: 1.6, md: 1.5 }}
                style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                dangerouslySetInnerHTML={{ __html: stateTujuanProgram.findById.data?.deskripsi }}
              />
            </Stack>
          </Paper>
          <Paper p="xl" radius="lg" shadow="md" withBorder bg={colors['white-trans-1']}>
            <Stack gap="sm">
              <Group>
                <Tooltip label="Tempat dan waktu pelaksanaan" position="top-start" withArrow>
                  <Box>
                    <IconMapPin size={24} stroke={1.8} color={colors['blue-button']} />
                  </Box>
                </Tooltip>
                <Title order={3} fw={700} c={colors['blue-button']} lh={1.2} fz={{ base: 'sm', md: 'md' }}>
                  {stateLokasiDanJadwal.findById.data?.judul}
                </Title>
              </Group>
              <Text
                fz={{ base: 'xs', md: 'md' }}
                lh={{ base: 1.6, md: 1.5 }}
                style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                dangerouslySetInnerHTML={{ __html: stateLokasiDanJadwal.findById.data?.deskripsi }}
              />
            </Stack>
          </Paper>
          <Paper p="xl" radius="lg" shadow="md" withBorder bg={colors['white-trans-1']}>
            <Stack gap="sm">
              <Group>
                <Tooltip label="Sarana yang disediakan untuk peserta" position="top-start" withArrow>
                  <Box>
                    <IconCalendarTime size={24} stroke={1.8} color={colors['blue-button']} />
                  </Box>
                </Tooltip>
                <Title order={3} fw={700} c={colors['blue-button']} lh={1.2} fz={{ base: 'sm', md: 'md' }}>
                  {stateFasilitas.findById.data?.judul}
                </Title>
              </Group>
              <Text
                fz={{ base: 'xs', md: 'md' }}
                lh={{ base: 1.6, md: 1.5 }}
                style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
                dangerouslySetInnerHTML={{ __html: stateFasilitas.findById.data?.deskripsi }}
              />
            </Stack>
          </Paper>
        </SimpleGrid>
      </Box>
    </Stack>
  );
}

export default Page;