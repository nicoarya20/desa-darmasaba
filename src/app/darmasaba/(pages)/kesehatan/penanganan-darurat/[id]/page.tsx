'use client';
import penangananDarurat from '@/app/admin/(dashboard)/_state/kesehatan/penanganan-darurat/penangananDarurat';
import colors from '@/con/colors';
import { Box, Image, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import BackButton from '../../../desa/layanan/_com/BackButto';

function DetailPenangananDaruratUser() {
  const state = useProxy(penangananDarurat);
  const params = useParams();

  useShallowEffect(() => {
    state.findUnique.load(params?.id as string);
  }, []);

  if (!state.findUnique.data) {
    return (
      <Stack py={40}>
        <Skeleton height={400} radius="md" />
        <Skeleton height={20} width="80%" radius="md" />
        <Skeleton height={20} width="60%" radius="md" />
      </Stack>
    );
  }

  const data = state.findUnique.data;

  return (
    <Box py={20}>
      {/* Tombol Back */}
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton/>
      </Box>

      {/* Wrapper Detail */}
      <Paper
        withBorder
        w={{ base: '100%', md: '70%', lg: '60%' }}
        mx="auto"
        bg={colors['white-1']}
        p="xl"
        radius="lg"
        shadow="sm"
      >
        <Stack gap="md" align="center" ta="center">
          <Text fz="xl" fw={700} c={colors['blue-button']}>
            {data.name || 'Penanganan Darurat'}
          </Text>

          {data.image?.link && (
            <Image
              src={data.image.link}
              alt={data.name}
              radius="md"
              mah={300}
              fit="contain"
              loading="lazy"
              mb="md"
            />
          )}

          <Box>
            <Text
              fz="md"
              ta="justify"
              dangerouslySetInnerHTML={{ __html: data.deskripsi }}
              style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
            />
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

export default DetailPenangananDaruratUser;
