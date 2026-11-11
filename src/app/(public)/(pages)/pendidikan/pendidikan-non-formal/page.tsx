'use client'
import pendidikanNonFormalState from '@/app/admin/(dashboard)/_state/pendidikan/pendidikan-non-formal';
import colors from '@/con/colors';
import { Box, Group, Paper, SimpleGrid, Skeleton, Stack, Text, Title, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import { IconMapPin, IconTarget, IconBook2 } from '@tabler/icons-react';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';

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
          Pendidikan non formal merupakan bentuk pendidikan di luar sekolah yang terstruktur, bertujuan untuk memberikan keterampilan, pengetahuan, serta pengembangan karakter masyarakat dari berbagai usia dan latar belakang.
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
              <Group align="center" gap={8} wrap="nowrap">
                <Tooltip label="Fokus utama program" withArrow>
                  <Box display="flex" style={{ alignItems: "center" }}>
                    <IconTarget color={colors['blue-button']} size={26} />
                  </Box>
                </Tooltip>
                <Text fw={700} fz="xl" c={colors['blue-button']}>
                  {stateTujuanPendidikanNonFormal.findById.data?.judul}
                </Text>
              </Group>
              <Text fz="md" lh={1.7} c="dark" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: stateTujuanPendidikanNonFormal.findById.data?.deskripsi }} />
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
              <Group align="center" gap={8} wrap="nowrap">
                <Tooltip label="Lokasi pelaksanaan kegiatan" withArrow>
                  <Box display="flex" style={{ alignItems: "center" }}>
                    <IconMapPin color={colors['blue-button']} size={26} />
                  </Box>
                </Tooltip>
                <Text fw={700} fz="xl" c={colors['blue-button']}>
                  {stateTempatKegiatan.findById.data?.judul}
                </Text>
              </Group>
              <Text fz="md" style={{ wordBreak: "break-word", whiteSpace: "normal" }} lh={1.7} c="dark" dangerouslySetInnerHTML={{ __html: stateTempatKegiatan.findById.data?.deskripsi }} />
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
              <Group align="center" gap={8} wrap="nowrap">
                <Tooltip label="Ragam jenis program yang tersedia" withArrow>
                  <Box display="flex" style={{ alignItems: "center" }}>
                    <IconBook2 color={colors['blue-button']} size={26} />
                  </Box>
                </Tooltip>
                <Text fw={700} fz="xl" c={colors['blue-button']}>
                  {stateJenisProgram.findById.data?.judul}
                </Text>
              </Group>
              <Text fz="md" lh={1.7} c="dark" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: stateJenisProgram.findById.data?.deskripsi }} />
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Stack>
  );
}

export default Page;
