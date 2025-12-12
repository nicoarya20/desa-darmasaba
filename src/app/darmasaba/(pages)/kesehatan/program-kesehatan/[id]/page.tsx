'use client'
import programKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/program-kesehatan/programKesehatan';
import colors from '@/con/colors';
import { Box, Center, Group, Image, Loader, Paper, Skeleton, Stack, Text, Title, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconCalendar, IconUser } from '@tabler/icons-react';
import { useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import BackButton from '../../../desa/layanan/_com/BackButto';

function Page() {
  const state = useProxy(programKesehatan);
  const params = useParams();

  useShallowEffect(() => {
    state.findUnique.load(params.id as string);
  }, [params.id]);

  if (!state.findUnique.data) {
    return (
      <Center mih="60vh">
        <Stack align="center" gap="sm">
          <Loader color={colors["blue-button"]} size="lg" />
          <Text c="dimmed" fz="sm">Memuat data program kesehatan...</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack bg={colors.Bg} py="xl" gap="xl">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Box px={{ base: 'md', md: 100 }}>
        <Paper
          px={{ base: 'md', md: 100 }}
          py="xl"
          radius="xl"
          shadow="md"
          bg={colors["white-trans-1"]}
        >
          <Stack gap="lg">
            <Center>
              {state.findUnique.data.image?.link ? (
                <Image
                  src={state.findUnique.data.image?.link}
                  alt={state.findUnique.data.name}
                  radius="md"
                  mah={300}
                  fit="contain"
                  loading="lazy"
                />
              ) : (
                <Skeleton h={300} w="100%" radius="xl" />
              )}
            </Center>
            <Box pl={20}>
              <Title
                order={1}
                pb="sm"
                c={colors["blue-button"]}
                fw="bold"
                lh={{ base: 1.2, md: 1.15 }}
              >
                {state.findUnique.data.name}
              </Title>
              <Text
                ta="justify"
                fz={{ base: 'sm', md: 'md' }}
                lh={{ base: 1.5, md: 1.6 }}
                dangerouslySetInnerHTML={{ __html: state.findUnique.data.deskripsi }}
                style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
              />
            </Box>
            <Group gap="xl">
              <Group gap="xs">
                <Tooltip label="Tanggal dibuat" withArrow>
                  <IconCalendar color="gray" size={20} stroke={1.5} />
                </Tooltip>
                <Text fz={{ base: 'xs', md: 'sm' }} c="dimmed">
                  {state.findUnique.data.createdAt
                    ? new Date(state.findUnique.data.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                    : 'Tanggal tidak tersedia'}
                </Text>
              </Group>
              <Group gap="xs">
                <Tooltip label="Dibuat oleh" withArrow>
                  <IconUser color="gray" size={20} stroke={1.5} />
                </Tooltip>
                <Text fz={{ base: 'xs', md: 'sm' }} c="dimmed">Admin Desa</Text>
              </Group>
            </Group>
          </Stack>
        </Paper>
      </Box>
    </Stack>
  );
}

export default Page;