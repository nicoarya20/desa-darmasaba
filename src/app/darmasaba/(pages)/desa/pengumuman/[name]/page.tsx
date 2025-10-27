'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import stateDesaPengumuman from '@/app/admin/(dashboard)/_state/desa/pengumuman';
import colors from '@/con/colors';
import { Box, Container, Group, Paper, Stack, Text } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';
import { useProxy } from 'valtio/utils';
import BackButton from '../../layanan/_com/BackButto';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';


function Page() {
  const unwrappedParams = useParams();
  const kategoriState = useProxy(stateDesaPengumuman);
  const categoryName = decodeURIComponent(unwrappedParams.name as string);

  useEffect(() => {
    kategoriState.category.findUnique.load(categoryName);
    kategoriState.pengumuman.findMany.load(1, 10, '', categoryName);
  }, [categoryName]);

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="md">
      {/* Header */}
      <Box px={{ base: "md", md: 100 }}>
        <BackButton />
      </Box>
      <Container size="lg" px="md" >
        <Stack align="center" gap="0" >
          <Text fz={{ base: "2rem", md: "3.4rem" }} c={colors["blue-button"]} fw="bold" ta="center">
            {categoryName.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </Text>
          <Text ta="center" px="md" pb={10}>
            Informasi dan pengumuman resmi terkait {categoryName.split('-').join(' ')}
          </Text>
        </Stack>
      </Container>
      <Box px={{ base: 'md', md: 100 }}>
        {!kategoriState.pengumuman.findMany.data?.length ? (
          <Paper p="lg" radius="md" shadow="md" bg={colors["white-1"]}>
            Tidak ada pengumuman yang ditemukan
          </Paper>
        ) : kategoriState.pengumuman.findMany.data?.map((v, k) => {
          return (
            <Paper mb={10} key={k} withBorder p="lg" radius="md" shadow="md" bg={colors["white-1"]}>
              <Text fz={'h3'}>{v.judul}</Text>
              <Group style={{ color: 'black' }} pb={20}>
                <Group gap="xs">
                  <IconCalendar size={18} />
                  <Text size="sm">
                    {v.createdAt ? new Date(v.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }) : 'No date available'}
                  </Text>
                </Group>
              </Group>
              <Text ta={'justify'}>
                {v.deskripsi}
              </Text>
            </Paper>
          )
        })}
      </Box>
    </Stack>
  );
}

export default Page;
