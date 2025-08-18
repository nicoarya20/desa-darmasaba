'use client'
import programKesehatan from '@/app/admin/(dashboard)/_state/kesehatan/program-kesehatan/programKesehatan';
import colors from '@/con/colors';
import { Box, Center, Group, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconCalendar, IconUser } from '@tabler/icons-react';
import { useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import BackButton from '../../../desa/layanan/_com/BackButto';

function Page() {
  const state = useProxy(programKesehatan)
  const params = useParams()

  useShallowEffect(() => {
    state.findUnique.load(params.id as string)
  }, [params.id])

  if (!state.findUnique.data) {
    return (
      <div>
        <Skeleton h={500} />
      </div>
    )
  }
  return (
    <Stack pos={"relative"} bg={colors.Bg} py={"xl"} gap={"22"}>
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Paper px={{ base: 'md', md: 100 }} radius={10} bg={colors["white-trans-1"]}>
        <Stack gap={'xs'}>
          <Center my={20}>
            <Image radius={"lg"} src={state.findUnique.data.image?.link} alt="" />
          </Center>
          <Box px={'lg'}>
            <Box>
              <Text pb={10} c={colors["blue-button"]} fw={"bold"} fz={"h3"}>
                {state.findUnique.data.name}
              </Text>
              <Text ta={'justify'} fz={'h4'} dangerouslySetInnerHTML={{ __html: state.findUnique.data.deskripsi }}></Text>
            </Box>
            <Group py={20}>
              <Group gap="xs">
                <IconCalendar size={18} />
                <Text size="sm">
                  {state.findUnique.data.createdAt ? new Date(state.findUnique.data.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }) : 'No date available'}
                </Text>
              </Group>
              <Group gap="xs">
                <IconUser size={18} />
                <Text size="sm">Admin Desa</Text>
              </Group>
            </Group>
          </Box>
        </Stack>
      </Paper>
    </Stack>
  );
}

export default Page;
