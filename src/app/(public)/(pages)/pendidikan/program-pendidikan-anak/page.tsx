'use client'
import stateProgramPendidikanAnak from '@/app/admin/(dashboard)/_state/pendidikan/program-pendidikan-anak';
import colors from '@/con/colors';
import { Box, Paper, SimpleGrid, Skeleton, Stack, Text, Title, Tooltip, Divider, Group } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import { IconBook2, IconTargetArrow } from '@tabler/icons-react';
import BackButton from '../../pemerintahan/layanan/_com/BackButto';

function Page() {
  const stateUnggulan = useProxy(stateProgramPendidikanAnak.programUnggulanState);
  const stateTujuan = useProxy(stateProgramPendidikanAnak.stateTujuanProgram);

  useShallowEffect(() => {
    stateUnggulan.findById.load('edit');
    stateTujuan.findById.load('edit');
  }, []);

  if (!stateUnggulan.findById.data || !stateTujuan.findById.data)
    return (
      <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
        <Box px={{ base: 'md', md: 100 }}>
          <BackButton />
        </Box>
        <Box px={{ base: 'md', md: 100 }} pb={50}>
          <Skeleton h={50} radius="xl" />
          <Skeleton h={150} mt="lg" radius="md" />
        </Box>
      </Stack>
    );

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>

      <Box px={{ base: 'md', md: 100 }} pb={50}>
        <Box mb="xl">
          <Title ta="center" order={1} fw="bold" c={colors['blue-button']}>
            Program Pendidikan Anak
          </Title>
          <Box my={"sm"}>
            <Divider size="sm" color={colors['blue-button']} mx="auto" maw={550} />
          </Box>
          <Text ta="center" fz="lg" c="black" mb="lg" maw={800} mx="auto">
            Desa Darmasaba berkomitmen mencetak generasi muda yang cerdas, berkarakter, dan siap bersaing melalui program pendidikan yang inklusif dan berkelanjutan.
          </Text>
        </Box>

        <SimpleGrid
          cols={{ base: 1, md: 2 }}
          spacing="xl"
        >
          <Paper
            p="xl"
            radius="xl"
            withBorder
            bg="white"
            shadow="md"
            style={{ transition: 'transform 0.2s ease', cursor: 'default' }}
          >
            <Stack gap="sm">
              <Group gap="sm">
                <IconTargetArrow size={28} color={colors['blue-button']} />
                <Title order={2} fw="bold" c={colors['blue-button']}>
                  {stateTujuan.findById.data?.judul}
                </Title>
              </Group>
              <Tooltip label="Detail tujuan program pendidikan anak" position="top-start" withArrow>
                <Text fz="lg" lh={1.6} c="dark" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: stateTujuan.findById.data?.deskripsi }} />
              </Tooltip>
            </Stack>
          </Paper>

          <Paper
            p="xl"
            radius="xl"
            withBorder
            bg="white"
            shadow="md"
            style={{ transition: 'transform 0.2s ease', cursor: 'default' }}
          >
            <Stack gap="sm">
              <Group gap="sm">
                <IconBook2 size={28} color={colors['blue-button']} />
                <Title order={2} fw="bold" c={colors['blue-button']}>
                  {stateUnggulan.findById.data?.judul}
                </Title>
              </Group>
              <Tooltip label="Detail program unggulan yang sedang berjalan" position="top-start" withArrow>
                <Text fz="lg" lh={1.6} c="dark" style={{ wordBreak: "break-word", whiteSpace: "normal" }} dangerouslySetInnerHTML={{ __html: stateUnggulan.findById.data?.deskripsi }} />
              </Tooltip>
            </Stack>
          </Paper>
        </SimpleGrid>
      </Box>
    </Stack>
  );
}

export default Page;
