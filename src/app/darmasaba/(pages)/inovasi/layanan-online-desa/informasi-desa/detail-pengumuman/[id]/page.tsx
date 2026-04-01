'use client'
import stateDesaPengumuman from '@/app/admin/(dashboard)/_state/desa/pengumuman';
import BackButton from '@/app/darmasaba/(pages)/desa/layanan/_com/BackButto';
import colors from '@/con/colors';
import { Box, Container, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';


function Page() {
  const detail = useProxy(stateDesaPengumuman.pengumuman.findUnique)

  const params = useParams()

  useShallowEffect(() => {
    stateDesaPengumuman.pengumuman.findUnique.load(params?.id as string)
  }, [])

  if (!detail.data) {
    return (
      <Box>
        <Skeleton h={400} />
      </Box>
    )
  }
  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="md">
      {/* Header */}
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>
      <Container size="lg" px="md">
        <Stack gap="xs" >
            <Group justify={"space-between"} align={"center"}>
              <Text fz={{ base: "2rem", md: "2rem" }} c={colors["blue-button"]} fw="bold" >
                {detail.data?.judul}
              </Text>
              <Group justify='end'>
                <Paper bg={colors['blue-button']} p={5}>
                  <Text  c={colors['white-1']}>{detail.data?.CategoryPengumuman?.name}</Text>
                </Paper>
              </Group>
            </Group>
          <Paper bg={colors["white-1"]} p="md">
            <Text fz={"md"} style={{wordBreak: "break-word", whiteSpace: "normal"}} dangerouslySetInnerHTML={{ __html: detail.data?.content }} />
            <Text fz={"md"} c={colors["blue-button"]} fw="bold" >
              {new Date(detail.data?.createdAt).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </Text>
          </Paper>
        </Stack>
      </Container>
    </Stack>
  );
}

export default Page;
